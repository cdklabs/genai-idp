# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import json
import boto3
import logging
import botocore
import html
import mimetypes
import base64
import hashlib
import os
from urllib.parse import urlparse
from botocore.exceptions import ClientError

# Set up logging
logger = logging.getLogger()
logger.setLevel(os.environ.get("LOG_LEVEL", "INFO"))
# Get LOG_LEVEL from environment variable with INFO as default

def get_summarization_model():
    """Get the summarization model from configuration table"""
    try:
        dynamodb = boto3.resource('dynamodb')
        config_table = dynamodb.Table(os.environ['CONFIGURATION_TABLE_NAME'])
        
        # Query for the Default configuration
        response = config_table.get_item(
            Key={'Configuration': 'Default'}
        )
        
        if 'Item' in response:
            config_data = response['Item']
            # Extract summarization model from the configuration
            if 'summarization' in config_data and 'model' in config_data['summarization']:
                return config_data['summarization']['model']
        
        # Fallback to a default model if not found in config
        return 'us.amazon.nova-pro-v1:0'
        
    except Exception as e:
        logger.error(f"Error getting summarization model from config: {str(e)}")
        return 'us.amazon.nova-pro-v1:0'  # Fallback default

def handler(event, context):
    response_data = {}

    try:
        # logger.info(f"Received event: {json.dumps(event)}")

        objectKey = event['arguments']['s3Uri']
        prompt = event['arguments']['prompt']
        history = event['arguments']['history']

        full_prompt = "You are an assistant that's responsible for getting details from document text attached here based on questions from the user.\n\n"
        full_prompt += "If you don't know the answer, just say that you don't know. Don't try to make up an answer.\n\n"
        full_prompt += "Additionally, use the user and assistant responses in the following JSON object to see what's been asked and what the resposes were in the past.\n\n"
        # full_prompt += "Your response MUST be in the following JSON format: {'content': [{'text': 'String'}]}.\n\n"
        # full_prompt += "You MUST NOT include outside of that JSON format.\n\n"
        # full_prompt += "Do NOT include the role or anything else in the response."
        full_prompt += "The history JSON object is: " + json.dumps(history) + ".\n\n"
        full_prompt += "The user's question is: " + prompt + "\n\n"

        # this feature is not enabled until the model can be selected on the chat screen
        # selectedModelId = event['arguments']['modelId']
        selectedModelId = get_summarization_model()

        logger.info(f"Processing S3 URI: {objectKey}")

        output_bucket = os.environ['OUTPUT_BUCKET']

        bedrock_runtime = boto3.client('bedrock-runtime', region_name='us-west-2')

        # Call Bedrock Runtime to get Python code based on the prompt
        if (len(objectKey)):
            # encoded_string = objectKey.encode()
            # md5_hash = hashlib.md5(encoded_string)
            # hex_representation = md5_hash.hexdigest()

            # full text key
            fulltext_key = objectKey + '/summary/fulltext.txt'

            logger.info(f"Model: {selectedModelId}")
            logger.info(f"Output Bucket: {output_bucket}")
            logger.info(f"Full Text Key: {fulltext_key}")

            # read full contents of the object as text
            s3 = boto3.client('s3')
            response = s3.get_object(Bucket=output_bucket, Key=fulltext_key)
            content_str = response['Body'].read().decode('utf-8')

            message = [
                {
                    "role":"user",
                    "content": [
                        {
                            "text": content_str
                        },
                        {
                           "cachePoint" : {
                                'type': 'default'
                            }
                        }
                    ]
                },
                {
                    "role":"user",
                    "content": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ]

            # print('invoking model converse')

            selectedModelId = 'us.amazon.nova-pro-v1:0'
            response = bedrock_runtime.converse(
                modelId=selectedModelId,
                messages=message
            )

            token_usage = response['usage']
            # print(f"Input tokens:  {token_usage['inputTokens']}")
            # print(f"Output tokens:  {token_usage['outputTokens']}")
            # print(f"Total tokens:  {token_usage['totalTokens']}")
            # print(f"cacheReadInputTokens:  {token_usage['cacheReadInputTokens']}")
            # print(f"cacheWriteInputTokens:  {token_usage['cacheWriteInputTokens']}")
            # print(f"Stop reason: {response['stopReason']}")


            output_message = response['output']['message']
            text_content = output_message['content'][0]['text']

            chat_response = {"cr": {"content": [{"text": text_content}]}}
            return json.dumps(chat_response)



    except ClientError as e:
        error_code = e.response['Error']['Code']
        error_message = e.response['Error']['Message']
        logger.error(f"S3 ClientError: {error_code} - {error_message}")
        
        if error_code == 'NoSuchKey':
            raise Exception(f"File not found: {fulltext_key}. The chat feature will not work with files that were processed prior to v0.3.11.")
        elif error_code == 'NoSuchBucket':
            raise Exception(f"Bucket not found: {output_bucket}")
        else:
            raise Exception(error_message)
            
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise Exception(f"Error fetching file: {str(e)}")
    
    return response_data