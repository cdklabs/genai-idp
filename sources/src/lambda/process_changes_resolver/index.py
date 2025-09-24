# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import json
import os
import boto3
import logging
from datetime import datetime, timezone
from boto3.dynamodb.conditions import Key

logger = logging.getLogger()
logger.setLevel(os.environ.get('LOG_LEVEL', 'INFO'))

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
s3_client = boto3.client('s3')
sqs_client = boto3.client('sqs')

# Environment variables
DOCUMENTS_TABLE = os.environ.get('DOCUMENTS_TABLE')
QUEUE_URL = os.environ.get('QUEUE_URL')
DATA_RETENTION_DAYS = int(os.environ.get('DATA_RETENTION_IN_DAYS', '90'))

def handler(event, context):
    logger.info(f"Event: {json.dumps(event)}")

    try:
        # Extract arguments from the GraphQL event
        args = event.get('arguments', {})
        object_key = args.get('objectKey')
        modified_sections = args.get('modifiedSections', [])
        
        if not object_key:
            raise ValueError("objectKey is required")
        
        if not modified_sections:
            raise ValueError("modifiedSections is required")

        logger.info(f"Processing changes for document: {object_key}")
        logger.info(f"Modified sections: {json.dumps(modified_sections)}")

        # Get the document from DynamoDB
        table = dynamodb.Table(DOCUMENTS_TABLE)
        doc_pk = f"doc#{object_key}"
        
        response = table.get_item(Key={'PK': doc_pk, 'SK': doc_pk})
        if 'Item' not in response:
            raise ValueError(f"Document {object_key} not found")
        
        document = response['Item']
        logger.info(f"Found document: {document.get('ObjectKey')}")

        # Process section modifications
        updated_sections = []
        updated_pages = []
        modified_section_ids = []
        
        # Convert existing sections and pages to dictionaries for easier manipulation
        existing_sections = {section['Id']: section for section in document.get('Sections', [])}
        existing_pages = {page['Id']: page for page in document.get('Pages', [])}
        
        for modified_section in modified_sections:
            section_id = modified_section['sectionId']
            classification = modified_section['classification']
            page_ids = modified_section['pageIds']
            is_new = modified_section.get('isNew', False)
            is_deleted = modified_section.get('isDeleted', False)
            
            if is_deleted:
                # Remove the section (don't add to updated_sections)
                logger.info(f"Deleting section: {section_id}")
                # Also need to clear the extraction data from S3
                if section_id in existing_sections:
                    output_uri = existing_sections[section_id].get('OutputJSONUri')
                    if output_uri:
                        clear_extraction_data(output_uri)
                continue
            
            # Create or update section
            section = {
                'Id': section_id,
                'Class': classification,
                'PageIds': page_ids,
                'OutputJSONUri': None  # Clear extraction data for reprocessing
            }
            
            # If this was an existing section, preserve any confidence threshold alerts
            if section_id in existing_sections and not is_new:
                existing_section = existing_sections[section_id]
                if 'ConfidenceThresholdAlerts' in existing_section:
                    section['ConfidenceThresholdAlerts'] = existing_section['ConfidenceThresholdAlerts']
                
                # Clear the existing extraction data
                output_uri = existing_section.get('OutputJSONUri')
                if output_uri:
                    clear_extraction_data(output_uri)
            
            updated_sections.append(section)
            modified_section_ids.append(section_id)
            
            # Update page classifications to match section classification
            for page_id in page_ids:
                if page_id in existing_pages:
                    page = existing_pages[page_id].copy()
                    page['Class'] = classification
                    updated_pages.append(page)
                    logger.info(f"Updated page {page_id} classification to {classification}")

        # Add unchanged sections back
        for section_id, section in existing_sections.items():
            if section_id not in [ms['sectionId'] for ms in modified_sections]:
                updated_sections.append(section)
        
        # Add unchanged pages back
        all_modified_page_ids = set()
        for modified_section in modified_sections:
            if not modified_section.get('isDeleted', False):
                all_modified_page_ids.update(modified_section['pageIds'])
        
        for page_id, page in existing_pages.items():
            if page_id not in all_modified_page_ids:
                updated_pages.append(page)

        # Sort sections by starting page ID
        updated_sections.sort(key=lambda s: min(s.get('PageIds', [float('inf')])))
        
        # Sort pages by ID
        updated_pages.sort(key=lambda p: p.get('Id', 0))

        # Update the document in DynamoDB
        current_time = datetime.now(timezone.utc).isoformat()
        
        update_expression = "SET #sections = :sections, #pages = :pages, #status = :status, #queued_time = :queued_time"
        expression_attribute_names = {
            '#sections': 'Sections',
            '#pages': 'Pages', 
            '#status': 'ObjectStatus',
            '#queued_time': 'QueuedTime'
        }
        expression_attribute_values = {
            ':sections': updated_sections,
            ':pages': updated_pages,
            ':status': 'QUEUED',
            ':queued_time': current_time
        }

        table.update_item(
            Key={'PK': doc_pk, 'SK': doc_pk},
            UpdateExpression=update_expression,
            ExpressionAttributeNames=expression_attribute_names,
            ExpressionAttributeValues=expression_attribute_values
        )

        logger.info(f"Updated document {object_key} with {len(updated_sections)} sections and {len(updated_pages)} pages")

        # Create the document object for SQS processing
        document_for_processing = {
            'id': object_key,
            'input_bucket': document.get('InputBucket', ''),
            'input_key': object_key,
            'output_bucket': document.get('OutputBucket', ''),
            'status': 'QUEUED',
            'queued_time': current_time,
            'num_pages': len(updated_pages),
            'pages': {str(page['Id']): {
                'page_id': str(page['Id']),
                'image_uri': page.get('ImageUri'),
                'raw_text_uri': page.get('TextUri'),
                'parsed_text_uri': page.get('TextUri'),
                'text_confidence_uri': page.get('TextConfidenceUri'),
                'classification': page.get('Class'),
                'confidence': 1.0,
                'tables': [],
                'forms': {}
            } for page in updated_pages},
            'sections': [{
                'section_id': section['Id'],
                'classification': section['Class'],
                'confidence': 1.0,
                'page_ids': [str(pid) for pid in section['PageIds']],
                'extraction_result_uri': section.get('OutputJSONUri'),
                'attributes': None,
                'confidence_threshold_alerts': section.get('ConfidenceThresholdAlerts', [])
            } for section in updated_sections],
            'metering': document.get('Metering', {}),
            'metadata': {},
            'errors': []
        }

        # Send to SQS with selective processing flags
        sqs_message = {
            'document': document_for_processing,
            'processing_mode': 'selective',
            'skip_ocr': True,
            'skip_classification': True,
            'modified_sections': modified_section_ids,
            'reprocess_extraction_only': True
        }

        if QUEUE_URL:
            response = sqs_client.send_message(
                QueueUrl=QUEUE_URL,
                MessageBody=json.dumps(sqs_message)
            )
            
            logger.info(f"Sent document to SQS queue. MessageId: {response.get('MessageId')}")
            processing_job_id = response.get('MessageId')
        else:
            logger.warning("QUEUE_URL not configured, skipping SQS message")
            processing_job_id = None

        return {
            'success': True,
            'message': f'Successfully processed changes for {len(modified_sections)} sections',
            'processingJobId': processing_job_id
        }

    except Exception as e:
        logger.error(f"Error processing changes: {str(e)}")
        return {
            'success': False,
            'message': f'Error processing changes: {str(e)}',
            'processingJobId': None
        }

def clear_extraction_data(s3_uri):
    """Clear extraction data from S3"""
    try:
        if not s3_uri or not s3_uri.startswith('s3://'):
            return
            
        # Parse S3 URI
        parts = s3_uri.replace('s3://', '').split('/', 1)
        if len(parts) != 2:
            return
            
        bucket, key = parts
        
        # Delete the object
        s3_client.delete_object(Bucket=bucket, Key=key)
        logger.info(f"Cleared extraction data: {s3_uri}")
        
    except Exception as e:
        logger.warning(f"Failed to clear extraction data {s3_uri}: {str(e)}")
