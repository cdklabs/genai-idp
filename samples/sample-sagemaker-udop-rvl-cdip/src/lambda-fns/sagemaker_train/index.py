from botocore.exceptions import ClientError
from sagemaker.debugger import TensorBoardOutputConfig
from sagemaker.pytorch import PyTorch
import os
import json
import sagemaker
import tempfile
import sys
import builtins
import logging

# Set up logging
logger = logging.getLogger()
logger.setLevel('INFO')

# Monkey patch file operations to redirect to /tmp
original_open = builtins.open


def patched_open(file, *args, **kwargs):
    """Redirect all file opens to /tmp directory if they're not already there"""
    if isinstance(file, str) and not file.startswith('/tmp') and not file.startswith('/var') and not file.startswith('/opt'):
        # Extract just the filename from the path
        filename = os.path.basename(file)
        new_path = os.path.join('/tmp', filename)
        logger.info(f"Redirecting file open from {file} to {new_path}")
        return original_open(new_path, *args, **kwargs)
    return original_open(file, *args, **kwargs)


# Apply the monkey patch
builtins.open = patched_open

# Patch os.makedirs to ensure it only creates directories in /tmp
original_makedirs = os.makedirs


def patched_makedirs(name, *args, **kwargs):
    """Redirect directory creation to /tmp if not already there"""
    if isinstance(name, str) and not name.startswith('/tmp') and not name.startswith('/var') and not name.startswith('/opt'):
        new_path = os.path.join('/tmp', os.path.basename(name))
        logger.info(f"Redirecting makedirs from {name} to {new_path}")
        return original_makedirs(new_path, *args, **kwargs)
    return original_makedirs(name, *args, **kwargs)


# Apply the patch
os.makedirs = patched_makedirs

# Set all environment variables that might control cache locations
os.environ['TMPDIR'] = '/tmp'
os.environ['TMP'] = '/tmp'
os.environ['TEMP'] = '/tmp'
os.environ['SAGEMAKER_SHARED_DIRECTORY'] = '/tmp'
os.environ['SAGEMAKER_PROGRAM'] = '/tmp/train.py'


def create_training_job(role, bucket, job_name, max_epochs, base_model,
                        bucket_prefix="", data_bucket="", data_bucket_prefix=""):
    """
    Create and run a SageMaker training job using the provided role
    """
    if not data_bucket:
        data_bucket = bucket
    if not data_bucket_prefix:
        data_bucket_prefix = bucket_prefix

    logger.info(f"Using SageMaker execution role: {role}")

    # Helper function to construct S3 paths
    def get_s3_path(bucket_name, prefix, path):
        if prefix:
            return f"s3://{bucket_name}/{prefix.rstrip('/')}/{path}"
        return f"s3://{bucket_name}/{path}"

    try:
        # Initialize SageMaker session with default bucket
        sagemaker_session = sagemaker.Session(default_bucket=bucket)
        output_dir = '/opt/ml/output'

        # Update all S3 paths to include prefixes
        tensorboard_output_config = TensorBoardOutputConfig(
            s3_output_path=get_s3_path(bucket, bucket_prefix, "tensorboard"),
            container_local_output_path=output_dir + '/tensorboard'
        )

        # Create the estimator with the training script from temp directory
        estimator = PyTorch(
            entry_point="train.py",
            source_dir="./code",
            role=role,  # Using the role passed from CDK
            framework_version="2.4.0",
            py_version="py311",
            instance_type="ml.g5.12xlarge",
            instance_count=1,
            output_path=get_s3_path(bucket, bucket_prefix, "models/"),
            hyperparameters={
                "max_epochs": max_epochs,
                "base_model": base_model,
                "output_dir": output_dir
            },
            code_location=get_s3_path(
                bucket, bucket_prefix, "scripts/training/"),
            sagemaker_session=sagemaker_session,
            tensorboard_output_config=tensorboard_output_config,
            environment={
                "FI_EFA_FORK_SAFE": "1",
                "TMPDIR": "/tmp",
                "TMP": "/tmp",
                "TEMP": "/tmp"
            }
        )

        # Update data channels with prefixed paths
        estimator.fit({
            "training": get_s3_path(data_bucket, data_bucket_prefix, "training"),
            "validation": get_s3_path(data_bucket, data_bucket_prefix, "validation")
        }, job_name=job_name, wait=False)

        logger.info(
            f"Model path: {get_s3_path(bucket, bucket_prefix, f'models/{job_name}/output/model.tar.gz')}")

        return sagemaker_session
    except Exception as e:
        logger.error(f"Error in create_training_job: {str(e)}")
        raise


def lambda_handler(event, context):
    """
    Lambda function handler that creates and runs a SageMaker training job.

    Custom Resource Event Format:
    - RequestType: Create, Update, or Delete
    - RequestId: A unique ID for the request.
    - PhysicalResourceId: The physical ID of the resource (for Update and Delete)
    - ResourceProperties: Properties passed to the custom resource
        - SagemakerRoleArn: ARN of the IAM role for SageMaker to use (required)
        - Bucket: S3 bucket name to save the training results (required)
        - BucketPrefix: Prefix for paths in the output S3 bucket (default: "")
        - JobNamePrefix: Prefix for the training job name (required)
        - MaxEpochs: Max epoch for training (default: 3)
        - BaseModel: Base model name (default: "microsoft/udop-large")
        - DataBucket: Name of the S3 bucket with training data (defaults to BUCKET value)
        - DataBucketPrefix: Prefix for paths in the data S3 bucket (defaults to BUCKET_PREFIX value)

    """
    # Log system information
    logger.info(f"Python version: {sys.version}")
    logger.info(f"Current working directory: {os.getcwd()}")
    logger.info(f"Temp directory: {tempfile.gettempdir()}")
    logger.info(f"Environment variables: TMPDIR={os.environ.get('TMPDIR')}")
    logger.info(f"Event: {json.dumps(event)}")

    props = event['ResourceProperties']
    logger.info(f"RequestId: {event.get('RequestId', 'UNAVAILABLE')}")
    logger.info(
        f"PhysicalResourceId: {event.get('PhysicalResourceId', 'UNAVAILABLE')}")
    logger.info(
        f"LogicalResourceId: {event.get('LogicalResourceId', 'UNAVAILABLE')}")

    # Get environment variables with defaults
    sagemaker_role_arn = props['SagemakerRoleArn']
    bucket = props['Bucket']
    bucket_prefix = props['BucketPrefix']
    job_name_prefix = props['JobNamePrefix']
    max_epochs = int(props['MaxEpochs'])
    base_model = props['BaseModel']
    data_bucket = props['DataBucket']
    data_bucket_prefix = props['DataBucketPrefix']

    # Validate required parameters
    if not sagemaker_role_arn:
        error_msg = "SAGEMAKER_ROLE_ARN environment variable must be set"
        logger.error(error_msg)
        return {
            'Status': 'FAILED',
            'Reason': error_msg
        }

    if not bucket:
        error_msg = "BUCKET environment variable must be set"
        logger.error(error_msg)
        return {
            'Status': 'FAILED',
            'Reason': error_msg
        }

    if not job_name_prefix:
        error_msg = "JOB_NAME_PREFIX environment variable must be set"
        logger.error(error_msg)
        return {
            'Status': 'FAILED',
            'Reason': error_msg
        }

    # Get the request type from the event
    request_type = event['RequestType']

    # For Delete requests, just return success
    if request_type == 'Delete':
        logger.info("Delete request - no action needed")
        return {
            'Status': 'SUCCESS',
            'PhysicalResourceId': event.get('PhysicalResourceId', 'no-id'),
        }

    try:
        # Generate a unique job name with timestamp hash
        job_name = job_name_prefix + '-' + event['RequestId'][-10:]

        # Create and run the training job
        sagemaker_session = create_training_job(
            sagemaker_role_arn, bucket, job_name, max_epochs, base_model,
            bucket_prefix, data_bucket, data_bucket_prefix
        )

        model_path = f"{bucket_prefix}/models/{job_name}/output/model.tar.gz".replace(
            '//', '/')

        # Return success with the job name and model path
        return {
            'Status': 'SUCCESS',
            'PhysicalResourceId': job_name,
            'Data': {
                'job_name': job_name,
                'model_path': model_path
            }
        }
    except Exception as e:
        error_msg = f"Error creating SageMaker training job: {str(e)}"
        logger.error(error_msg)
        return {
            'Status': 'FAILED',
            'Reason': error_msg
        }
