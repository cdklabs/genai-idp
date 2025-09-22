# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import datetime
import io
import json
import logging
import os
import random
import string
from decimal import Decimal
from urllib.parse import urlparse

import boto3
import fitz  # PyMuPDF
from botocore.exceptions import ClientError
from idp_common import metrics
from idp_common.docs_service import create_document_service
from idp_common.config import get_config
from idp_common.models import Document, HitlMetadata, Page, Section, Status
from idp_common.s3 import get_s3_client, write_content
from idp_common.utils import build_s3_uri

logger = logging.getLogger()
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))
logging.getLogger('idp_common.bedrock.client').setLevel(os.environ.get("BEDROCK_LOG_LEVEL", "INFO"))
# Get LOG_LEVEL from environment variable with INFO as default

# Use the common S3 client
s3_client = get_s3_client()
ssm_client = boto3.client('ssm')
bedrock_client = boto3.client('bedrock-data-automation')
SAGEMAKER_A2I_REVIEW_PORTAL_URL = os.environ.get('SAGEMAKER_A2I_REVIEW_PORTAL_URL', '')
enable_hitl = os.environ.get('ENABLE_HITL', 'false').lower()

def get_confidence_threshold_from_config(document: Document) -> float:
    """
    Get the HITL confidence threshold from configuration.
    
    Args:
        document (Document): The document object containing configuration
        
    Returns:
        float: The confidence threshold as a decimal (0.0-1.0)
    """
    try:
        config = get_config()
        threshold_value = float(config['assessment']['default_confidence_threshold'])
        
        # Validate that the threshold is in the expected 0.0-1.0 range
        if threshold_value < 0.0 or threshold_value > 1.0:
            logger.warning(f"Invalid confidence threshold value {threshold_value}. Must be between 0.0 and 1.0. Using default: 0.80")
            return 0.80
            
        logger.info(f"Retrieved confidence threshold from configuration: {threshold_value}")
        return threshold_value
    except Exception as e:
        logger.warning(f"Failed to retrieve confidence threshold from configuration: {e}")
        # Return default value of 80% (0.80) if configuration is not available
        logger.info("Using default confidence threshold: 0.80")
        return 0.80

def create_metadata_file(file_uri, class_type, file_type=None):
    """
    Creates a metadata file alongside the given URI file with the same name plus '.metadata.json'
    
    Args:
        file_uri (str): The S3 URI of the file
        class_type (str): The class type to include in the metadata
        file_type (str, optional): Type of file ('section' or 'page')
    """
    try:
        # Parse the S3 URI to get bucket and key
        parsed_uri = urlparse(file_uri)
        bucket = parsed_uri.netloc
        key = parsed_uri.path.lstrip('/')
        
        # Create the metadata key by adding '.metadata.json' to the original key
        metadata_key = f"{key}.metadata.json"
        
        # Determine the file type if not provided
        if file_type is None:
            if key.endswith('.json'):
                file_type = 'section'
            else:
                file_type = 'page'
        
        # Create metadata content
        metadata_content = {
            "metadataAttributes": {
                "DateTime": datetime.datetime.now().isoformat(),
                "Class": class_type,
                "FileType": file_type
            }
        }
        
        # Use the common library to write to S3
        write_content(
            metadata_content,
            bucket,
            metadata_key,
            content_type='application/json'
        )
        
        logger.info(f"Created metadata file at s3://{bucket}/{metadata_key}")
    except Exception as e:
        logger.error(f"Error creating metadata file for {file_uri}: {str(e)}")

def copy_s3_objects(bda_result_bucket, bda_result_prefix, output_bucket, object_key):
    """
    Copy objects from a source S3 location to a destination S3 location.
    """
    copied_files = 0
    try:
        # List all objects in source location using pagination
        paginator = s3_client.get_paginator('list_objects_v2')
        page_iterator = paginator.paginate(
            Bucket=bda_result_bucket,
            Prefix=bda_result_prefix
        )

        # Process each object in the pages
        for page in page_iterator:
            if not page.get('Contents'):
                continue
                
            for obj in page['Contents']:
                bda_result_key = obj['Key']
                relative_path = bda_result_key[len(bda_result_prefix):].lstrip('/')
                dest_key = f"{object_key}/{relative_path}"
                s3_client.copy_object(
                    CopySource={'Bucket': bda_result_bucket, 'Key': bda_result_key},
                    Bucket=output_bucket,
                    Key=dest_key,
                    ContentType='application/json',
                    MetadataDirective='REPLACE'
                )
                copied_files += 1
                
        logger.info(f"Successfully copied {copied_files} files")
        return copied_files
        
    except Exception as e:
        logger.error(f"Error copying files: {str(e)}")
        raise

def create_pdf_page_images(bda_result_bucket, output_bucket, object_key):
    """
    Create images for each page of a PDF document and upload them to S3.
    """
    try:
        # Download the PDF from S3
        pdf_content = s3_client.get_object(Bucket=bda_result_bucket, Key=object_key)['Body'].read()
        pdf_stream = io.BytesIO(pdf_content)

        # Open the PDF using PyMuPDF
        pdf_document = fitz.open(stream=pdf_stream, filetype="pdf")

        # Process each page
        for page_num in range(len(pdf_document)):
            # Render page to an image (pixmap)
            pix = pdf_document[page_num].get_pixmap()

            # Save the image to a BytesIO object
            img_bytes = pix.tobytes("jpeg")

            # Upload the image to S3 using the common library
            image_key = f"{object_key}/pages/{page_num}/image.jpg"
            s3_client.upload_fileobj(
                io.BytesIO(img_bytes),
                output_bucket,
                image_key,
                ExtraArgs={'ContentType': 'image/jpeg'}
            ) 

        logger.info(f"Successfully created and uploaded {len(pdf_document)} images to S3")
        return len(pdf_document)

    except Exception as e:
        logger.error(f"Error creating page images: {str(e)}")
        raise

def process_bda_sections(bda_result_bucket, bda_result_prefix, output_bucket, object_key, document, confidence_threshold=0.8):
    """
    Process BDA sections and build sections for the Document object
    
    Args:
        bda_result_bucket (str): The BDA result bucket
        bda_result_prefix (str): The BDA result prefix
        output_bucket (str): The output bucket
        object_key (str): The object key
        document (Document): The document object to update
        confidence_threshold (float): Confidence threshold to add to explainability data
    
    Returns:
        Document: The updated document
    """
    # Source path for BDA custom output files
    bda_custom_output_prefix = f"{bda_result_prefix}/custom_output/"
    # Target path for section files
    sections_output_prefix = f"{object_key}/sections/"
    
    try:
        # List all section folders in the BDA result bucket
        response = s3_client.list_objects_v2(
            Bucket=bda_result_bucket,
            Prefix=bda_custom_output_prefix,
            Delimiter='/'
        )
        
        # Process each section folder
        for prefix in response.get('CommonPrefixes', []):
            section_path = prefix.get('Prefix')
            if not section_path:
                continue
                
            # Extract section ID from path
            section_id = section_path.rstrip('/').split('/')[-1]
            target_section_path = f"{sections_output_prefix}{section_id}/"
            
            # List all files in the section folder
            section_files = s3_client.list_objects_v2(
                Bucket=bda_result_bucket,
                Prefix=section_path
            )
            
            # Copy each file to the output bucket
            for file_obj in section_files.get('Contents', []):
                src_key = file_obj['Key']
                file_name = src_key.split('/')[-1]
                target_key = f"{target_section_path}{file_name}"
                
                # Special handling for result.json files to add confidence thresholds
                if file_name == 'result.json':
                    try:
                        # Download the result.json file
                        result_obj = s3_client.get_object(Bucket=bda_result_bucket, Key=src_key)
                        result_data = json.loads(result_obj['Body'].read().decode('utf-8'))
                        
                        # Add confidence thresholds to explainability_info if present
                        if 'explainability_info' in result_data:
                            result_data['explainability_info'] = add_confidence_thresholds_to_explainability(
                                result_data['explainability_info'], confidence_threshold
                            )
                            logger.info(f"Added confidence threshold {confidence_threshold} to explainability_info in section {section_id}")
                        
                        # Write the modified result.json to the target location
                        write_content(
                            result_data,
                            output_bucket,
                            target_key,
                            content_type='application/json'
                        )
                        logger.info(f"Processed and copied {src_key} to {target_key}")
                        
                    except Exception as e:
                        logger.error(f"Error processing result.json {src_key}: {str(e)}")
                        # Fallback to regular copy if processing fails
                        s3_client.copy_object(
                            CopySource={'Bucket': bda_result_bucket, 'Key': src_key},
                            Bucket=output_bucket,
                            Key=target_key,
                            ContentType='application/json',
                            MetadataDirective='REPLACE'
                        )
                        logger.info(f"Fallback copied {src_key} to {target_key}")
                else:
                    # Regular copy for non-result.json files
                    s3_client.copy_object(
                        CopySource={'Bucket': bda_result_bucket, 'Key': src_key},
                        Bucket=output_bucket,
                        Key=target_key,
                        ContentType='application/json' if file_name.endswith('.json') else 'application/octet-stream',
                        MetadataDirective='REPLACE'
                    )
                    logger.info(f"Copied {src_key} to {target_key}")
            
            # Get the result.json file
            result_path = f"{target_section_path}result.json"
            try:
                result_obj = s3_client.get_object(
                    Bucket=output_bucket,
                    Key=result_path
                )
                result_data = json.loads(result_obj['Body'].read().decode('utf-8'))
                
                # Extract required fields
                doc_class = result_data.get('document_class', {}).get('type', '')
                page_indices = result_data.get('split_document', {}).get('page_indices', [])
                page_ids = [str(idx) for idx in (page_indices or [])]
                
                # Create the OutputJSONUri using the utility function
                extraction_result_uri = build_s3_uri(output_bucket, result_path)
                
                # Create Section object and add to document
                section = Section(
                    section_id=section_id,
                    classification=doc_class,
                    confidence=1.0,
                    page_ids=page_ids,
                    extraction_result_uri=extraction_result_uri
                )
                document.sections.append(section)
                
                # Create metadata file for the extraction result URI
                create_metadata_file(extraction_result_uri, doc_class, 'section')
                
            except ClientError as e:
                logger.error(f"Failed to retrieve result.json for section {section_id}: {e}")
                continue
            except json.JSONDecodeError as e:
                logger.error(f"Invalid JSON in result.json for section {section_id}: {e}")
                continue
                
        logger.info(f"Processed {len(document.sections)} sections for document {object_key}")
        return document
        
    except ClientError as e:
        logger.error(f"Failed to list sections in S3: {e}")
        document.errors.append(f"Failed to list sections: {str(e)}")
        return document

def extract_markdown_from_json(raw_json):
    """
    Extract markdown content from BDA result JSON
    
    Args:
        raw_json (dict): The BDA result JSON
    
    Returns:
        str: Concatenated markdown text
    """
    markdown_texts = []
    
    # Extract from pages
    if 'pages' in raw_json:
        for page in raw_json['pages']:
            if 'representation' in page and 'markdown' in page['representation']:
                markdown_texts.append(page['representation']['markdown'])
       
    # Join with horizontal rule
    if markdown_texts:
        return '\n\n---\n\nPAGE BREAK\n\n---\n\n'.join(markdown_texts)
    return ""

def add_confidence_thresholds_to_explainability(explainability_data, confidence_threshold):
    """
    Add confidence thresholds to explainability data recursively.
    
    Args:
        explainability_data: The explainability data (dict, list, or other)
        confidence_threshold: The confidence threshold to add
        
    Returns:
        The modified explainability data with confidence thresholds added
    """
    if isinstance(explainability_data, dict):
        # Create a copy to avoid modifying the original
        result = explainability_data.copy()
        
        # If this dict has a confidence field, add the confidence_threshold
        if 'confidence' in result and isinstance(result['confidence'], (int, float)):
            result['confidence_threshold'] = confidence_threshold
        
        # Recursively process nested dictionaries
        for key, value in result.items():
            result[key] = add_confidence_thresholds_to_explainability(value, confidence_threshold)
        
        return result
    elif isinstance(explainability_data, list):
        # Recursively process list items
        return [add_confidence_thresholds_to_explainability(item, confidence_threshold) for item in explainability_data]
    else:
        # Return primitive values as-is
        return explainability_data

def extract_page_from_multipage_json(raw_json, page_index, confidence_threshold=None):
    """
    Extract a single page from a multi-page result JSON
    
    Args:
        raw_json (dict): The BDA result JSON
        page_index (int): The page index to extract
        confidence_threshold (float, optional): Confidence threshold to add to explainability data
        
    Returns:
        dict: A new result JSON with only the specified page
    """
    # Create a copy of the JSON with just metadata
    single_page_json = {
        "metadata": raw_json.get("metadata", {})
    }
    
    # Update metadata to reflect single page
    if "metadata" in single_page_json:
        single_page_json["metadata"]["start_page_index"] = page_index
        single_page_json["metadata"]["end_page_index"] = page_index
        single_page_json["metadata"]["number_of_pages"] = 1
    
    # Include document level info
    if "document" in raw_json:
        single_page_json["document"] = raw_json["document"]
    
    # Add the single page from the pages array
    single_page_json["pages"] = []
    if "pages" in raw_json:
        for page in raw_json["pages"]:
            if page.get("page_index") == page_index:
                single_page_json["pages"].append(page)
                break
    
    # Filter elements for only this page
    single_page_json["elements"] = []
    if "elements" in raw_json:
        for element in raw_json["elements"]:
            page_indices = element.get("page_indices", [])
            if page_index in page_indices:
                # Create a copy of the element with only this page
                element_copy = element.copy()
                element_copy["page_indices"] = [page_index]
                single_page_json["elements"].append(element_copy)
    
    # Include explainability_info if present and add confidence thresholds
    if "explainability_info" in raw_json:
        explainability_info = raw_json["explainability_info"]
        if confidence_threshold is not None:
            # Add confidence thresholds to the explainability data
            single_page_json["explainability_info"] = add_confidence_thresholds_to_explainability(
                explainability_info, confidence_threshold
            )
            logger.info(f"Added confidence threshold {confidence_threshold} to explainability_info for page {page_index}")
        else:
            single_page_json["explainability_info"] = explainability_info
    
    return single_page_json

def extract_markdown_from_single_page_json(raw_json):
    """
    Extract markdown content from a single page BDA result JSON
    
    Args:
        raw_json (dict): The BDA result JSON
    
    Returns:
        str: Markdown text for the page
    """
    if "pages" in raw_json and len(raw_json["pages"]) > 0:
        page = raw_json["pages"][0]
        if "representation" in page and "markdown" in page["representation"]:
            return page["representation"]["markdown"]
    return ""

def process_bda_pages(bda_result_bucket, bda_result_prefix, output_bucket, object_key, document, confidence_threshold=0.8):
    """
    Process BDA page outputs and build pages for the Document object
    
    Args:
        bda_result_bucket (str): The BDA result bucket
        bda_result_prefix (str): The BDA result prefix
        output_bucket (str): The output bucket
        object_key (str): The object key
        document (Document): The document object to update
        confidence_threshold (float): Confidence threshold to add to explainability data
    
    Returns:
        Document: The updated document
    """
    # Source path for standard output result.json files
    standard_output_prefix = f"{bda_result_prefix}/standard_output/"
    # Target path for page files
    pages_output_prefix = f"{object_key}/pages/"
    
    # Create a mapping of page_id to class from sections
    page_to_class_map = {}
    for section in document.sections:
        section_class = section.classification
        for page_id in section.page_ids:
            page_to_class_map[page_id] = section_class
    
    try:
        # List all objects in the standard output directory
        response = s3_client.list_objects_v2(
            Bucket=bda_result_bucket,
            Prefix=standard_output_prefix
        )
        
        # Process all standard_output result.json files which may contain multiple pages
        for obj in response.get('Contents', []):
            obj_key = obj['Key']
            
            # Only process result.json files
            if not obj_key.endswith('result.json'):
                continue
                
            try:
                # Get the raw JSON result from the BDA result bucket
                result_obj = s3_client.get_object(
                    Bucket=bda_result_bucket,
                    Key=obj_key
                )
                raw_json = json.loads(result_obj['Body'].read().decode('utf-8'))
                
                # Check if this contains pages
                if 'pages' in raw_json and len(raw_json['pages']) > 0:
                    # Process each page in the multi-page result
                    for page in raw_json['pages']:
                        page_index = page.get('page_index')
                        if page_index is None:
                            logger.warning(f"Page in {obj_key} has no page_index")
                            continue
                            
                        page_id = str(page_index)
                        
                        # Extract a single page result.json for this page with confidence threshold
                        single_page_json = extract_page_from_multipage_json(raw_json, page_index, confidence_threshold)
                        
                        # Determine page directory path in output bucket
                        page_path = f"{pages_output_prefix}{page_id}/"
                        page_result_path = f"{page_path}result.json"
                        
                        # Write the single page result.json to the page directory
                        write_content(
                            single_page_json,
                            output_bucket,
                            page_result_path,
                            content_type='application/json'
                        )
                        
                        # Create raw text URI
                        raw_text_uri = build_s3_uri(output_bucket, page_result_path)
                        
                        # Define image path
                        image_path = f"{page_path}image.jpg"
                        
                        # Check if image exists
                        try:
                            s3_client.head_object(Bucket=output_bucket, Key=image_path)
                            image_uri = build_s3_uri(output_bucket, image_path)
                        except ClientError:
                            image_uri = None
                            logger.warning(f"image.jpg not found for page {page_id}")
                        
                        # Get the class from the section mapping
                        doc_class = page_to_class_map.get(page_id, '')
                        
                        # Extract markdown content for this page
                        markdown_text = extract_markdown_from_single_page_json(single_page_json)
                        
                        # Create parsedResult.json
                        parsed_result = {
                            "text": markdown_text
                        }
                        
                        # Write parsedResult.json to S3
                        parsed_result_path = f"{page_path}parsedResult.json"
                        write_content(
                            parsed_result,
                            output_bucket,
                            parsed_result_path,
                            content_type='application/json'
                        )
                        
                        # Create S3 URI for parsed result
                        parsed_result_uri = build_s3_uri(output_bucket, parsed_result_path)
                        
                        logger.info(f"Created parsedResult.json for page {page_id}")
                        
                        # Create metadata file for the parsed result URI
                        create_metadata_file(parsed_result_uri, doc_class, 'page')
                        
                        # Create Page object and add to document
                        page = Page(
                            page_id=page_id,
                            image_uri=image_uri,
                            raw_text_uri=raw_text_uri,
                            parsed_text_uri=parsed_result_uri,
                            classification=doc_class
                        )
                        document.pages[page_id] = page
                        
                    logger.info(f"Processed multi-page result file {obj_key}")
                
            except Exception as e:
                logger.error(f"Error processing result file {obj_key}: {str(e)}")
                document.errors.append(f"Error processing result file {obj_key}: {str(e)}")
        
        # Update document page count
        document.num_pages = len(document.pages)
        logger.info(f"Processed {document.num_pages} pages for document {object_key}")
        return document
        
    except ClientError as e:
        logger.error(f"Failed to list pages in S3: {e}")
        document.errors.append(f"Failed to list pages: {str(e)}")
        return document

def start_human_loop(
    execution_id: str,
    kv_pairs: list,
    source_image_uri: str,
    bounding_boxes: list,
    blueprintName: str,
    bp_confidence: float,
    confidenceThreshold: float,
    page_id: int,
    page_indices: list,
    record_number: int
) -> dict:
    """
    Start a SageMaker A2I human review loop if confidence is below threshold.
    """
    a2i_runtime_client = boto3.client('sagemaker-a2i-runtime')
    ssm = boto3.client('ssm')

    logger.info(f"pageID: {page_id}")
    page_id_num = int(page_id) + 1
    logger.info(f"pageIDNum: {page_id_num}")

    try:
        # Retrieve Bedrock project configuration
        project_response = bedrock_client.get_data_automation_project(
            projectArn=os.environ.get('BDA_PROJECT_ARN', ''),
            projectStage='LIVE'
        )
        custom_output = project_response['project']['customOutputConfiguration']
        blueprint_arns = custom_output.get('blueprints', [])

        blueprint_options = []
        for blueprint_arn in blueprint_arns:
            try:
                arn_string = blueprint_arn['blueprintArn']
                logger.info(f"Processing blueprint ARN: {arn_string}")
                blueprint_response = bedrock_client.get_blueprint(
                    blueprintArn=arn_string,
                    blueprintStage='LIVE'
                )
                blueprint_name = blueprint_response['blueprint']['blueprintName']
                blueprint_options.append({
                    "value": blueprint_name,
                    "label": blueprint_name.replace('-', ' ').title()
                })
                logger.info(f"Retrieved blueprint name: {blueprint_name}")
            except KeyError:
                logger.error("Invalid blueprint ARN format in project configuration")
            except ClientError as e:
                logger.error(f"Bedrock API error: {e.response['Error']['Message']}")
            except Exception as e:
                logger.error(f"Unexpected error processing blueprint: {str(e)}")

        logger.info(f"Retrieved {len(blueprint_options)} blueprint options from project")
    except ClientError as e:
        logger.error(f"Failed to retrieve Bedrock project: {e.response['Error']['Message']}")
        blueprint_options = []
    except Exception as e:
        logger.error(f"Unexpected error retrieving blueprints: {str(e)}")
        blueprint_options = []

    human_loop_input = {
        "sourceDocument": source_image_uri,
        "keyValuePairs": kv_pairs,
        "boundingBoxes": bounding_boxes,
        "confidenceThreshold": confidenceThreshold,
        "blueprintName": blueprintName,
        "bp_confidence": bp_confidence,
        "blueprintOptions": blueprint_options,
        "page_number": page_id_num,
        "page_array": page_indices,
        "execution_id": execution_id,
        "record_id": record_number
    }

    try:
        FlowDefinitionArn = ssm.get_parameter(Name=f"/{os.environ.get('METRIC_NAMESPACE', 'IDP')}/FlowDefinitionArn")['Parameter']['Value']
        human_review_id = generate_random_string(2)
        response = a2i_runtime_client.start_human_loop(
            HumanLoopName=f"review-bda-{human_review_id}-{execution_id}-{record_number}-{page_id_num}",
            FlowDefinitionArn=FlowDefinitionArn,
            HumanLoopInput={"InputContent": json.dumps(human_loop_input)}
        )
        logger.info(f"Started human loop: {response['HumanLoopArn']}")
        return response
    except Exception as e:
        logger.error(f"Error starting human loop: {str(e)}")
        raise

def generate_random_string(length: int) -> str:
    """Generate a random alphanumeric string of specified length."""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))

def parse_s3_path(s3_uri: str) -> (str, str):
    """Extract bucket and key from s3:// URI."""
    parsed = urlparse(s3_uri)
    return parsed.netloc, parsed.path.lstrip('/')

def download_json(bucket: str, key: str) -> dict:
    """Download and parse JSON from S3."""
    response = s3_client.get_object(Bucket=bucket, Key=key)
    return json.loads(response['Body'].read())

def download_decimal(bucket: str, key: str) -> dict:
    """Download and parse JSON from S3, converting floats to Decimal."""
    response = s3_client.get_object(Bucket=bucket, Key=key)
    return json.loads(response['Body'].read(), parse_float=Decimal)

def process_keyvalue_details(explainability_data: list, page_indices: list, confidence_threshold: float = 0.8) -> dict:
    """
    Process explainability data to extract key-value and bounding box details per page.
    
    Args:
        explainability_data: List of explainability data from BDA
        page_indices: List of page indices
        confidence_threshold: Confidence threshold value to add to each field
    """
    results = {
        'key_value_details': {str(p): [] for p in page_indices},
        'bounding_box_details': {str(p): [] for p in page_indices}
    }
    last_page = str(page_indices[-1]) if page_indices else '0'

    def get_page(raw_page: int) -> str:
        """Convert 1-based page to 0-based index and validate."""
        if raw_page is None:
            return last_page
        adjusted = raw_page - 1
        return str(adjusted) if adjusted in page_indices else last_page

    def process_entry(key_path: list, entry: dict, page: int):
        target_page = get_page(page)
        kv_entry = {
            'key': format_key_path(key_path),
            'value': entry.get('value', ''),
            'confidence': entry.get('confidence', 0.0),
            'confidence_threshold': confidence_threshold
        }
        bbox = {}
        if entry.get('geometry'):
            for geom in entry['geometry']:
                if 'boundingBox' in geom:
                    bbox = {k: geom['boundingBox'].get(k, 0) for k in ['top', 'left', 'width', 'height']}
                    break
        results['key_value_details'][target_page].append(kv_entry)
        results['bounding_box_details'][target_page].append({
            'key': format_key_path(key_path),
            'bounding_box': bbox
        })

    def format_key_path(path_parts: list) -> str:
        """Convert path array to flattened key notation."""
        formatted = []
        for part in path_parts:
            if isinstance(part, int) or (isinstance(part, str) and part.startswith('_')):
                formatted[-1] += f"[{part[1:]}]"
            else:
                formatted.append(str(part))
        return '.'.join(formatted)

    def traverse(data: dict, path: list = None, current_page: int = None):
        path = path or []
        if isinstance(data, dict):
            page = current_page
            if 'geometry' in data and data['geometry']:
                page = data['geometry'][0].get('page')
            if 'value' in data:
                process_entry(path, data, page)
            else:
                for k, v in data.items():
                    traverse(v, path + [k], page)
        elif isinstance(data, list):
            for i, item in enumerate(data):
                traverse(item, path + [f"_{i}"], current_page)

    for entry in explainability_data:
        traverse(entry)
    return results


def create_confidence_threshold_alerts(pagespecific_details: dict, confidence_threshold: float) -> list:
    """
    Create confidence threshold alerts from page-specific key-value details.
    
    Args:
        pagespecific_details: Dictionary containing key-value details per page
        confidence_threshold: Confidence threshold to check against
        
    Returns:
        List of confidence threshold alert dictionaries matching AppSync service expectations
    """
    alerts = []
    
    # Process key-value details from all pages
    for page_num, kv_details in pagespecific_details.get('key_value_details', {}).items():
        for kv_entry in kv_details:
            confidence = kv_entry.get('confidence', 0.0)
            if confidence < confidence_threshold:
                alert = {
                    'attribute_name': kv_entry.get('key', ''),
                    'confidence': confidence,
                    'confidence_threshold': confidence_threshold
                }
                alerts.append(alert)
    
    logger.info(f"Created {len(alerts)} confidence threshold alerts")
    return alerts

def process_segments(
    input_bucket: str,
    output_bucket: str,
    object_key: str,
    segment_metadata: list,
    confidence_threshold: float,
    execution_id: str,
    document
):
    """
    Process each segment, extract key-value details, and invoke human review if needed.
    """
    dynamodb = boto3.resource('dynamodb')
    table_name = os.environ.get("DB_NAME", "")
    
    if table_name:
        table = dynamodb.Table(table_name)
    else:
        logger.warning("DB_NAME environment variable not set, skipping DynamoDB operations")
    
    now = datetime.datetime.now().isoformat()
    hitl_triggered = False
    overall_hitl_triggered = False

    for record_number, segment in enumerate(segment_metadata, start=1):
        logger.info(f"Processing segment for execution id: {execution_id}")
        item = {
            "execution_id": execution_id,
            "record_number": record_number,
            "input_bucket": input_bucket,
            "output_bucket": output_bucket,
            "object_key": object_key,
            "timestamp": now,
            "bp_match": segment.get('custom_output_status'),
            "hitl_bp_change": None
        }

        if segment.get('custom_output_status') == 'MATCH':
            custom_bucket, custom_key = parse_s3_path(segment['custom_output_path'])
            custom_output = download_json(custom_bucket, custom_key)
            custom_decimal_output = download_decimal(custom_bucket, custom_key)
            explainability_data = custom_output.get('explainability_info', [])
            page_indices = custom_output.get("split_document", {}).get("page_indices", [])
            pagespecific_details = process_keyvalue_details(
                explainability_data,
                page_indices,
                confidence_threshold
            )
            
            # Create confidence threshold alerts for UI display
            confidence_threshold_alerts = create_confidence_threshold_alerts(
                pagespecific_details, 
                confidence_threshold
            )
            
            # Update the corresponding document section with confidence alerts
            # Find the section that contains these page indices
            page_ids_str = [str(idx) for idx in page_indices]
            for section in document.sections:
                # Check if this section's pages match the current segment's pages
                if set(section.page_ids) == set(page_ids_str):
                    section.confidence_threshold_alerts = confidence_threshold_alerts
                    logger.info(f"Updated section {section.section_id} with {len(confidence_threshold_alerts)} confidence alerts")
                    break
            blueprint_name = custom_output["matched_blueprint"]["name"]
            bp_confidence = custom_output["matched_blueprint"]["confidence"]

            # Check if any key-value or blueprint confidence is below threshold
            if enable_hitl == 'true': 
                low_confidence = any(
                    kv['confidence'] < confidence_threshold
                    for page_num in page_indices
                    for kv in pagespecific_details['key_value_details'].get(str(page_num), [])
                ) or float(bp_confidence) < confidence_threshold
            else:
                low_confidence = None

            logger.info(f"low_confidence: {low_confidence}")
            
            item.update({
                "page_array": page_indices,
                "hitl_triggered": low_confidence,
                "extraction_bp_name": blueprint_name,
                "extracted_result": custom_decimal_output
            })

            hitl_metadata = HitlMetadata(
                execution_id=execution_id,
                record_number=record_number,
                bp_match=segment.get('custom_output_status'),
                extraction_bp_name=blueprint_name,
                hitl_triggered=low_confidence,
                page_array=page_indices,
                review_portal_url=SAGEMAKER_A2I_REVIEW_PORTAL_URL
            )

            if low_confidence:
                hitl_triggered = low_confidence
                metrics.put_metric('HITLTriggered', 1)
                overall_hitl_triggered = True
                for page_number in page_indices:
                    page_str = str(page_number)
                    key_values = pagespecific_details['key_value_details'].get(page_str, [])
                    bounding_boxes = pagespecific_details['bounding_box_details'].get(page_str, [])
                    ImageUri = f"s3://{output_bucket}/{object_key}/pages/{page_number}/image.jpg"
                    try:
                        human_loop_response = start_human_loop(
                            execution_id,
                            key_values,
                            ImageUri,
                            bounding_boxes,
                            blueprint_name,
                            bp_confidence,
                            confidence_threshold,
                            page_number,
                            page_indices,
                            record_number
                        )
                        logger.info(f"Started human loop for page {page_number}: {human_loop_response}")
                    except Exception as e:
                        logger.error(f"Failed to start human loop for page {page_number}: {str(e)}")
                
                item.update({
                    "hitl_corrected_result": custom_decimal_output
                })
        else:
            if enable_hitl == 'true':
                std_hitl = 'true'
                # std_hitl = None # HITL for standard output blueprint match is disabled until we have option to choose Blueprint in A2I
            else:
                std_hitl = None 
            # Process standard output if no custom output match
            std_bucket, std_key = parse_s3_path(segment['standard_output_path'])
            std_output = download_decimal(std_bucket, std_key)
            metadata = std_output.get('metadata', {})
            start_page = metadata.get('start_page_index', 0)
            end_page = metadata.get('end_page_index', 0)
            page_array = list(range(start_page, end_page + 1))
            item.update({
                "page_array": page_array,
                # "hitl_triggered": std_hitl,
                "hitl_triggered": None,
                "extraction_bp_name": "None",
                "extracted_result": std_output
            })

            hitl_metadata = HitlMetadata(
                execution_id=execution_id,
                record_number=record_number,
                bp_match=segment.get('custom_output_status'),
                extraction_bp_name="None",
                # hitl_triggered=std_hitl,
                hitl_triggered=None,
                page_array=page_array,
                review_portal_url=SAGEMAKER_A2I_REVIEW_PORTAL_URL
            )
            
            # hitl_triggered = std_hitl
            hitl_triggered = None
            # if enable_hitl == 'true':
            # # if std_hitl: # HITL for standard output blueprint match is disabled until we have option to choose Blueprint in A2I
            #     for page_number in range(start_page, end_page + 1):
            #         ImageUri = f"s3://{output_bucket}/{object_key}/pages/{page_number}/image.jpg"
            #         try:
            #             human_loop_response = start_human_loop(
            #                 execution_id=execution_id,
            #                 kv_pairs=[],
            #                 source_image_uri=ImageUri,
            #                 bounding_boxes=[],
            #                 blueprintName="",
            #                 bp_confidence=0.00,
            #                 confidenceThreshold=confidence_threshold,
            #                 page_id=page_number,
            #                 page_indices=page_array,
            #                 record_number=record_number
            #             )
            #             logger.info(f"Triggered human loop for page {page_number}: {human_loop_response}")
            #         except Exception as e:
            #             logger.error(f"Failed to start human loop for page {page_number}: {str(e)}")
        
        document.hitl_metadata.append(hitl_metadata)

        if table_name:
            logger.info(f"Saving to DynamoDB: {json.dumps(item, default=str)}")
            try:
                table.put_item(Item=item)
            except Exception as e:
                logger.error(f"Error saving to DynamoDB: {str(e)}")
    
    return document, overall_hitl_triggered

def handler(event, context):
    """
    Process the BDA results and build a Document object with pages and sections.
    Can handle both single BDA response and arrays of BDA responses from blueprint changes.
    
    Args:
        event: Event containing BDA response information (single or array)
        context: Lambda context
        
    Returns:
        Dict containing the processed document
    """
    logger.info(f"Processing event: {json.dumps(event)}")
    
    # Check if we have a single BDA response or an array of responses
    bda_responses = []
    
    if isinstance(event, list):
        # We have an array of BDA responses (from blueprint change)
        logger.info(f"Processing array of {len(event)} BDA responses")
        bda_responses = event
    else:
        # We have a single BDA response (from initial processing)
        logger.info("Processing single BDA response")
        bda_responses = [event]
    
    # Extract required information from the first response
    first_response = bda_responses[0]
    output_bucket = first_response.get('output_bucket')
    
    # Handle different response formats
    if 'BDAResponse' in first_response:
        # Standard initial processing format
        object_key = first_response['BDAResponse']['job_detail']['input_s3_object']['name']
        input_bucket = first_response['BDAResponse']['job_detail']['input_s3_object']['s3_bucket']
    elif 'metadata' in first_response:
        # Blueprint change format
        object_key = first_response['metadata']['object_key']
        input_bucket = first_response['metadata']['input_bucket']
        output_bucket = first_response['metadata']['working_bucket']
    else:
        logger.error("Unknown response format")
        raise ValueError("Could not determine document information from response")
    
    logger.info(f"Input bucket: {input_bucket}, prefix: {object_key}")
    logger.info(f"Output bucket: {output_bucket}, base path: {object_key}")

    # Create a new Document object
    document = Document(
        id=object_key,
        input_bucket=input_bucket,
        input_key=object_key,
        output_bucket=output_bucket,
        status=Status.POSTPROCESSING,
        workflow_execution_arn=first_response.get("execution_arn")
    )

    # Get confidence threshold from configuration for adding to explainability data
    confidence_threshold = get_confidence_threshold_from_config(document)
    logger.info(f"Using confidence threshold: {confidence_threshold}")

    # Update document status
    document_service = create_document_service()
    logger.info(f"Updating document status to {document.status}")
    document_service.update_document(document)
   
    # Create page images (only need to do this once)
    try:
        page_count = create_pdf_page_images(input_bucket, output_bucket, object_key)
        logger.info(f"Successfully created and uploaded {page_count} page images to S3")
    except Exception as e:
        logger.error(f"Error creating page images: {str(e)}")
        document.errors.append(f"Error creating page images: {str(e)}")

    # Process each BDA response
    
    for response_idx, bda_response in enumerate(bda_responses):
        logger.info(f"Processing BDA response {response_idx + 1} of {len(bda_responses)}")
        
        # Extract BDA result information
        bda_result_bucket = None
        bda_result_prefix = None
        
        if 'BDAResponse' in bda_response:
            # Standard response format
            bda_result_bucket = bda_response['BDAResponse']['job_detail']['output_s3_location']['s3_bucket']
            bda_result_prefix = bda_response['BDAResponse']['job_detail']['output_s3_location']['name']
        elif 'bda_response' in bda_response:
            # Blueprint change response format
            job_id = bda_response['bda_response'].get('jobId')
            if job_id:
                # Need to look up the job details to get output location
                bda_runtime_client = boto3.client('bedrock-data-automation-runtime')
                try:
                    job_details = bda_runtime_client.get_data_automation_job(jobId=job_id)
                    bda_result_bucket = job_details['job']['outputS3Location']['s3Bucket']
                    bda_result_prefix = job_details['job']['outputS3Location']['name']
                except Exception as e:
                    logger.error(f"Error getting job details for job {job_id}: {str(e)}")
                    continue
        
        if not bda_result_bucket or not bda_result_prefix:
            logger.error(f"Could not determine BDA result location for response {response_idx}")
            continue
            
        logger.info(f"BDA Result bucket: {bda_result_bucket}, prefix: {bda_result_prefix}")
        
        # Process sections and pages from BDA output
        document = process_bda_sections(bda_result_bucket, bda_result_prefix, output_bucket, object_key, document, confidence_threshold)
        document = process_bda_pages(bda_result_bucket, bda_result_prefix, output_bucket, object_key, document, confidence_threshold)

    # Calculate metrics
    page_ids_in_sections = set()
    for section in document.sections:
        for page_id in section.page_ids:
            page_ids_in_sections.add(page_id)
    
    custom_pages_count = len(page_ids_in_sections)
    total_pages = document.num_pages
    standard_pages_count = total_pages - custom_pages_count
    if standard_pages_count < 0:
        standard_pages_count = 0

    # Process HITL if enabled
    hitl_triggered = "false"
    
    try:
        # Use the confidence threshold already calculated above
        metdatafile_path = '/'.join(bda_result_prefix.split('/')[:-1])
        job_metadata_key = f'{metdatafile_path}/job_metadata.json'
        execution_id = event.get("execution_arn", "").split(':')[-1]
        logger.info(f"HITL execution ID: {execution_id}")

        try:
            jobmetadata_file = s3_client.get_object(Bucket=bda_result_bucket, Key=job_metadata_key)
            job_metadata = json.loads(jobmetadata_file['Body'].read())
            if 'output_metadata' in job_metadata:
                output_metadata = job_metadata['output_metadata']
                if isinstance(output_metadata, list):
                    for asset in output_metadata:
                        document, hitl_result = process_segments(
                            input_bucket,
                            output_bucket,
                            object_key,
                            asset.get('segment_metadata', []),
                            confidence_threshold,
                            execution_id,
                            document
                        )
                        if hitl_result or hitl_triggered== "true":
                            hitl_triggered = "true"
                elif isinstance(output_metadata, dict):
                    for asset_id, asset in output_metadata.items():
                        document, hitl_result = process_segments(
                            input_bucket,
                            output_bucket,
                            object_key,
                            asset.get('segment_metadata', []),
                            confidence_threshold,
                            execution_id,
                            document
                        )
                        if hitl_result or hitl_triggered== "true":
                            hitl_triggered = "true"
                else:
                    logger.error("Unexpected output_metadata format in job_metadata.json")
        except Exception as e:
            logger.error(f"Error processing job_metadata.json: {str(e)}")
    except Exception as e:
        logger.error(f"Error in HITL processing: {str(e)}")
    
    # Record metrics for processed pages
    metrics.put_metric('ProcessedDocuments', 1)
    metrics.put_metric('ProcessedPages', total_pages)
    metrics.put_metric('ProcessedCustomPages', custom_pages_count)
    metrics.put_metric('ProcessedStandardPages', standard_pages_count)
    
    # Add metering information
    document.metering = {
        "BDAProject/bda/documents-custom": {
            "pages": custom_pages_count
        },
        "BDAProject/bda/documents-standard": {
            "pages": standard_pages_count
        }
    }
    
    # Update document status based on HITL requirement
    if hitl_triggered == "true":
        # Set status to HITL_IN_PROGRESS when HITL is triggered
        document.status = Status.HITL_IN_PROGRESS
        logger.info(f"Document requires human review, setting status to {document.status}")
    else:
        # Only mark as COMPLETED if no human review is needed
        document.status = Status.COMPLETED
        document.completion_time = datetime.datetime.now(datetime.timezone.utc).isoformat()
        logger.info(f"Document processing complete, setting status to {document.status}")
    
    document_service.update_document(document)
    
    # Prepare response using new serialization method
    # Use working bucket for document compression
    working_bucket = os.environ.get('WORKING_BUCKET')
    if not working_bucket:
        logger.warning("WORKING_BUCKET environment variable not set, using output_bucket for compression")
        working_bucket = output_bucket
    
    response = {
        "document": document.serialize_document(working_bucket, "processresults", logger),
        "hitl_triggered": hitl_triggered,
        "bda_response_count": len(bda_responses)
    }
    
    logger.info(f"Response: {json.dumps(response, default=str)}")
    return response
