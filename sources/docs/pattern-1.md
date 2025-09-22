Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0

# Pattern 1: Bedrock Data Automation (BDA) Workflow

This pattern implements an intelligent document processing workflow using Amazon Bedrock Data Automation (BDA) for orchestrating ML-powered document processing tasks. It leverages BDA's ability to extract insights from documents using pre-configured templates and workflows.

<img src="../../images/IDP-Pattern1-BDA.drawio.png" alt="Architecture" width="800">

## Table of Contents

- [Architecture Overview](#architecture-overview)
  - [Flow Overview](#flow-overview)
  - [Components](#components)
  - [State Machine Workflow](#state-machine-workflow)
- [Deployment](#deployment)
  - [Prerequisites](#prerequisites)
  - [Configuration](#configuration)
- [Monitoring and Metrics](#monitoring-and-metrics)
  - [CloudWatch Metrics](#cloudwatch-metrics)
  - [Dashboard Components](#dashboard-components)
  - [Error Tracking](#error-tracking)
- [Concurrency and Throttling](#concurrency-and-throttling)
  - [BDA API Throttling](#bda-api-throttling)
  - [Error Handling](#error-handling)
- [Workflow Details](#workflow-details)
  - [Invocation Step](#invocation-step)
  - [Processing Step](#processing-step)
  - [Results Processing](#results-processing)
  - [Human-in-the-Loop (HITL)](#human-in-the-loop-hitl)

## Architecture Overview

### Flow Overview
1. Document events from S3 trigger workflow execution
2. BDA Invoke Lambda starts BDA job asynchronously with a task token
3. BDA Completion Lambda processes job completion events from EventBridge
4. Completion Lambda sends task success/failure to Step Functions using the stored token
5. Process Results Lambda copies output files to designated location

### Components
- **Main Functions**:
  - BDA Invoke Function (bda_invoke_function): Initiates BDA jobs and stores task tokens
  - BDA Completion Function (bda_completion_function): Handles job completion events
  - Process Results Function (processresults_function): Copies and organizes output files
- **State Machine**: Coordinates workflow execution using waitForTaskToken pattern
- **EventBridge**: Routes BDA job completion events to the Completion Function
- **DynamoDB**: Tracks task tokens for asynchronous callback
- **S3 Buckets**: Input, Working, and Output storage

### State Machine Workflow
```
InvokeDataAutomation (with waitForTaskToken)
    |
    ├── Success -> ProcessResultsStep
    |
    └── Failure -> FailState
```

## Deployment

### Prerequisites
- Bedrock Data Automation project already set up and configured
- Required AWS permissions for Bedrock, Lambda, Step Functions, and S3
- S3 buckets created for input, working, and output storage

### Configuration

**Stack Deployment Parameters:**
- `BDAProjectArn`: ARN of your Bedrock Data Automation project
- **Summarization**: Control summarization via configuration file `summarization.enabled` property (replaces `IsSummarizationEnabled` parameter)
- `ConfigurationDefaultS3Uri`: Optional S3 URI to custom configuration (uses default configuration if not specified)
- `InputBucket`: S3 bucket for input documents
- `WorkingBucket`: S3 bucket for temporary BDA job output
- `OutputBucket`: S3 bucket for final processed results
- `TrackingTable`: DynamoDB table for task token tracking
- `CustomerManagedEncryptionKeyArn`: KMS key ARN for encryption
- `LogRetentionDays`: CloudWatch log retention period
- `ExecutionTimeThresholdMs`: Latency threshold for alerts

**Stack Outputs:**
- `SageMakerA2IReviewPortalURL`: URL for the SageMaker A2I human review portal (when HITL is enabled)

**Configuration Management:**
- Configuration now supports multiple presets per pattern (e.g., default, checkboxed_attributes_extraction, medical_records_summarization)
- Configuration can be updated through the Web UI without stack redeployment
- Summarization functionality is controlled through the configuration file `summarization.enabled` property rather than CloudFormation parameters
- BDA-specific configuration is handled within the Bedrock Data Automation project rather than the IDP stack configuration

**Note on BDA Configuration:**
Unlike Patterns 2 and 3, Pattern 1 delegates most document processing configuration to the Bedrock Data Automation (BDA) project itself. Classification and extraction behaviors are configured within the BDA project using BDA Blueprints rather than through the IDP configuration system.

## Monitoring and Metrics

### CloudWatch Metrics
The pattern publishes detailed metrics to CloudWatch:

- **BDA API Metrics**:
  - `BDARequestsTotal`: Total number of API requests
  - `BDARequestsSucceeded`: Successful API requests
  - `BDARequestsFailed`: Failed API requests
  - `BDARequestsThrottles`: API throttling events
  - `BDARequestsRetrySuccess`: Successful retries after throttling
  - `BDARequestsMaxRetriesExceeded`: Cases where max retries were exhausted
  - `BDARequestsLatency`: API request duration in milliseconds
  - `BDARequestsTotalLatency`: Total duration including retries

- **BDA Job Metrics**:
  - `BDAJobsTotal`: Total number of BDA jobs
  - `BDAJobsSucceeded`: Successfully completed jobs
  - `BDAJobsFailed`: Failed job executions

### Dashboard Components
The included CloudWatch dashboard provides visibility into the workflow:

- **API Request Panels**:
  - API request success/failure rates per minute
  - API throttling and retry metrics
  - Job execution success/failure trends

- **Lambda Performance**:
  - Function duration for all Lambda functions
  - Long-running invocation tracking
  - Memory utilization metrics

- **Error Tracking**:
  - Log-based panels for API throttling events
  - Job execution failures with detailed error messages
  - Lambda function errors and timeouts

## Concurrency and Throttling

### BDA API Throttling
Implements exponential backoff with retry handling for transient errors:
```python
MAX_RETRIES = 7
INITIAL_BACKOFF = 2  # seconds
MAX_BACKOFF = 300   # 5 minutes

# Retryable error codes
retryable_errors = [
    'ThrottlingException',
    'ServiceQuotaExceededException',
    'RequestLimitExceeded',
    'TooManyRequestsException',
    'InternalServerException'
]
```

### Error Handling
- Retries on transient failures with exponential backoff
- Clear distinction between retryable and non-retryable errors
- Detailed metrics for tracking throttling events and retries
- Dead Letter Queue for EventBridge target to capture unprocessed events
- Comprehensive error logging with cause and stack traces

## Workflow Details

### Invocation Step
```python
# Example BDA invocation payload
payload = {
    "inputConfiguration": {
        "s3Uri": input_s3_uri
    },
    "outputConfiguration": {
        "s3Uri": output_s3_uri
    },
    "dataAutomationConfiguration": {
        "dataAutomationProjectArn": data_project_arn,
        "stage": "LIVE"
    },
    "dataAutomationProfileArn": f"arn:aws:bedrock:{region}:{account_id}:data-automation-profile/us.data-automation-v1",
    "notificationConfiguration": {
        "eventBridgeConfiguration": {
            "eventBridgeEnabled": True
        }
    }
}
```

### Processing Step
- Tracks execution task tokens in DynamoDB with expiration time
- Listens for EventBridge events from BDA job completion
- Retrieves task token from DynamoDB when job completes
- Sends success or failure to Step Functions workflow
- Publishes detailed metrics for monitoring

### Results Processing
- Copies BDA output files from working bucket to final output location
- Organizes results in the same directory structure as input
- Produces standardized output format for UI consumption
- Updates execution status with job result information

### Human-in-the-Loop (HITL)

Pattern-1 supports Human-in-the-Loop (HITL) review capabilities using Amazon SageMaker Augmented AI (A2I). This feature allows human reviewers to validate and correct extracted information when the system's confidence falls below a specified threshold.

#### HITL Workflow
1. **Automatic Triggering**: 
   - HITL is triggered when the feature is enabled in your configuration
   - Extraction confidence score falls below your configured confidence threshold
   - The system creates a human review task in SageMaker A2I

2. **Review Process**:
   - Reviewers access the SageMaker A2I Review Portal (URL available in CloudFormation output `SageMakerA2IReviewPortalURL`)
   - Login credentials are the same as those used for the GenAI IDP portal (if you want to use your own Private work team, you can provide your existing private workforce work team arn as a input parameter for `Pattern1 - Existing Private Workforce ARN`)
   - Extracted key-value pairs are presented for validation and correction
   - Reviewers validate correct extractions or make necessary corrections
   - After review, corrections are submitted with the "Submit" button

3. **Result Integration**:
   - Corrected key-value pairs automatically update the source results
   - The document processing workflow continues with the human-verified data

<img src="../../images/hitl_a2i_workflow.png" alt="HITL Flow diagram" width="800">

#### Configuration
- `EnableHITL`: Boolean parameter to enable/disable the HITL feature
- **Confidence Threshold**: Configured through the Web UI Portal Configuration tab under "Assessment & HITL Configuration" section. This numeric value (0.0-1.0) determines when human review is triggered based on extraction confidence scores.

#### Configuring Confidence Threshold
To set the confidence threshold for HITL triggering:

1. **Access the Web UI**: Open the Web UI URL from your CloudFormation stack outputs
2. **Navigate to Configuration**: Click on the "Configuration" tab in the navigation menu
3. **Find Assessment & HITL Section**: Scroll to the "Assessment & HITL Configuration" section
4. **Set Confidence Threshold**: 
   - Enter a value between 0.0-1.0 (e.g., 0.8 for 80% confidence threshold)
   - Fields with confidence scores below this threshold will trigger HITL review
5. **Save Configuration**: Click "Save" to apply the changes

The confidence threshold is stored as a configuration parameter and automatically applied to new document processing without requiring stack redeployment.

#### Best Practices
- Regularly check the Review Portal for pending tasks to avoid processing delays
- Establish consistent correction guidelines if multiple reviewers are involved

#### Known Limitations
  - Current version of SageMaker A2I cannot provide direct hyperlink to respective document tasks. When reviewer clicks on review document URL and start working, review portal will start displating all review tasks. Reviewer cannot pick specific task and start working. 
  - Updating SageMaker A2I Template and workflow performs deletion on A2I flow definition, A2I custom template and recreate the resources via lambda function. Update A2I resources through Python SDK is not allowed. 

## Best Practices
1. **BDA Project Configuration**:
   - Configure classification and extraction within the BDA project using BDA Blueprints
   - Use BDA's built-in capabilities for document type detection and field extraction
   - Test BDA configuration thoroughly before integrating with IDP stack

2. **Configuration Management**:
   - Use the configuration library for IDP-specific settings (summarization, evaluation, etc.)
   - BDA-specific configuration should be managed within the BDA project
   - Leverage the Web UI for IDP configuration updates without redeployment

3. **Monitoring and Scaling**:
   - Monitor BDA service quotas and adjust concurrency as needed
   - Implement exponential backoff with jitter for API throttling
   - Set up EventBridge rules to capture all job status events
   - Include DLQ for EventBridge targets to capture unprocessed events

4. **Error Handling**:
   - Ensure token storage has appropriate TTL to avoid stale tokens
   - Handle partial successes appropriately in the results processor
   - Maintain comprehensive logging for troubleshooting
   - Use CloudWatch dashboards to monitor performance metrics

5. **Security and Reliability**:
   - Enable detailed CloudWatch metrics for API requests and job executions
   - Configure alerts for unusual throttling or error patterns
   - Use appropriate IAM roles with least privilege principles
   - Implement proper error handling for BDA job failures

6. **HITL Management**:
   - Configure confidence thresholds through the Web UI Portal Configuration tab based on business requirements
   - Regularly check the Review Portal for pending tasks to avoid processing delays
   - Establish consistent correction guidelines if multiple reviewers are involved
