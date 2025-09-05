# GovCloud Deployment Guide

## Overview

The GenAI IDP Accelerator now supports deployment to AWS GovCloud regions through a specialized template generation script. This solution addresses two key GovCloud requirements:

1. **ARN Partition Compatibility**: All ARN references use `arn:${AWS::Partition}:` instead of `arn:aws:` to work in both commercial and GovCloud regions
2. **Service Compatibility**: Removes services not available in GovCloud (AppSync, CloudFront, WAF, Cognito UI components)

## Architecture Differences

### Standard AWS Deployment
```mermaid
graph TB
    A[Users] --> B[CloudFront Distribution]
    B --> C[React Web UI]
    C --> D[AppSync GraphQL API]
    D --> E[Cognito Authentication]
    E --> F[Core Processing Engine]
    F --> G[Document Workflows]
    G --> H[S3 Storage]
```

### GovCloud Deployment
```mermaid
graph TB
    A[Direct S3 Upload] --> F[Core Processing Engine]
    F --> G[Document Workflows]
    G --> H[S3 Storage]
    I[CLI Tools] --> F
    J[SDK Integration] --> F
```

## Deployment Process

### Step 1: Standard Build Process

First, run the standard build process to create all Lambda functions and artifacts:

```bash
# Build for GovCloud region
python publish.py my-bucket-govcloud my-prefix us-gov-west-1

# Or build for commercial region first (for testing)
python publish.py my-bucket my-prefix us-east-1
```

### Step 2: Generate GovCloud Template

After the build completes, generate the GovCloud-compatible template:

```bash
# Generate GovCloud template from processed template
python scripts/generate_govcloud_template.py

# Optional: Use custom input/output paths
python scripts/generate_govcloud_template.py \
  --input .aws-sam/packaged.yaml \
  --output my-govcloud-template.yaml \
  --verbose
```

### Step 3: Deploy to GovCloud

Deploy the generated template to GovCloud:

```bash
# Deploy using SAM
sam deploy \
  --template-file template-govcloud.yaml \
  --stack-name my-idp-govcloud-stack \
  --region us-gov-west-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    IDPPattern="Pattern2 - Packet processing with Textract and Bedrock" \
    MaxConcurrentWorkflows=50

# Or deploy using AWS CLI
aws cloudformation deploy \
  --template-file template-govcloud.yaml \
  --stack-name my-idp-govcloud-stack \
  --region us-gov-west-1 \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    IDPPattern="Pattern2 - Packet processing with Textract and Bedrock" \
    MaxConcurrentWorkflows=50
```

## Services Removed in GovCloud

The following services are automatically removed from the GovCloud template:

### Web UI Components (22 resources removed)
- CloudFront distribution and origin access identity
- WebUI S3 bucket and build pipeline
- CodeBuild project for UI deployment
- Security headers policy

### API Layer (20+ resources removed)
- AppSync GraphQL API and schema
- All GraphQL resolvers and data sources
- 10+ Lambda resolver functions
- API authentication and authorization

### Authentication (8 resources removed)
- Cognito User Pool and Identity Pool
- User pool client and domain
- Admin user and group management
- Email verification functions

### WAF Security (6 resources removed)
- WAF WebACL and IP sets
- IP set updater functions
- CloudFront protection rules

### Analytics Features (8 resources removed)
- Analytics processing functions
- Knowledge base query functions
- Chat with document features
- Text-to-SQL query capabilities

## Core Services Retained

The following essential services remain available:

### Document Processing
- ✅ All 3 processing patterns (BDA, Textract+Bedrock, Textract+SageMaker+Bedrock)
- ✅ Complete 6-step pipeline (OCR, Classification, Extraction, Assessment, Summarization, Evaluation)
- ✅ Step Functions workflows
- ✅ Lambda function processing
- ✅ Custom prompt Lambda integration

### Storage & Data
- ✅ S3 buckets (Input, Output, Working, Configuration, Logging)
- ✅ DynamoDB tables (Tracking, Configuration, Concurrency)
- ✅ Data encryption with customer-managed KMS keys
- ✅ Lifecycle policies and data retention

### Monitoring & Operations
- ✅ CloudWatch dashboards and metrics
- ✅ CloudWatch alarms and SNS notifications
- ✅ Lambda function logging and tracing
- ✅ Step Functions execution logging

### Integration
- ✅ SQS queues for document processing
- ✅ EventBridge rules for workflow orchestration
- ✅ Post-processing Lambda hooks
- ✅ Evaluation and reporting systems

### HITL Support
- ✅ SageMaker A2I Human-in-the-Loop
- ✅ Private workforce configuration
- ✅ Human review workflows

## Access Methods

Without the web UI, you can interact with the system through:

### 1. Direct S3 Upload
```bash
# Upload documents directly to input bucket
aws s3 cp my-document.pdf s3://my-input-bucket/documents/

# Monitor processing status
aws dynamodb scan \
  --table-name MyStack-TrackingTable \
  --region us-gov-west-1
```

### 2. CLI Tools
```bash
# Use the lookup script to check document status
./scripts/lookup_file_status.sh documents/my-document.pdf MyStack

# Or use default stack name (IDP)
./scripts/lookup_file_status.sh documents/my-document.pdf
```

### 3. SDK Integration
```python
import boto3

# Initialize clients
s3_client = boto3.client('s3', region_name='us-gov-west-1')
dynamodb = boto3.resource('dynamodb', region_name='us-gov-west-1')

# Upload document
s3_client.upload_file('local-doc.pdf', 'my-input-bucket', 'docs/local-doc.pdf')

# Check processing status
tracking_table = dynamodb.Table('MyStack-TrackingTable')
response = tracking_table.get_item(
    Key={'PK': 'doc#docs/local-doc.pdf', 'SK': 'none'}
)
print(f"Status: {response['Item']['Status']}")

# Download results
s3_client.download_file('my-output-bucket', 'docs/local-doc.pdf.json', 'results.json')
```

### 4. REST API Alternative
If you need programmatic API access, you can deploy a simple Lambda function with API Gateway:

```yaml
# Optional: Add to your stack
SimpleAPIFunction:
  Type: AWS::Serverless::Function
  Properties:
    CodeUri: src/simple-api/
    Handler: index.handler
    Runtime: python3.12
    Events:
      Api:
        Type: Api
        Properties:
          Path: /documents
          Method: post
          RestApiId: !Ref SimpleRestApi

SimpleRestApi:
  Type: AWS::Serverless::Api
  Properties:
    StageName: v1
    EndpointConfiguration: REGIONAL
```

## Configuration Management

Without the UI, configuration is managed through:

### 1. S3 Configuration Files
Edit configuration files directly in the configuration bucket:

```bash
# Download current configuration
aws s3 cp s3://my-config-bucket/config_library/pattern-2/bank-statement-sample/config.yaml ./

# Edit and upload back
aws s3 cp ./config.yaml s3://my-config-bucket/config_library/pattern-2/bank-statement-sample/
```

### 2. DynamoDB Configuration Table
Update configuration through the DynamoDB table:

```bash
# View current configuration
aws dynamodb get-item \
  --table-name MyStack-ConfigurationTable \
  --key '{"Configuration": {"S": "Default"}}' \
  --region us-gov-west-1

# Update configuration (JSON format)
aws dynamodb put-item \
  --table-name MyStack-ConfigurationTable \
  --item file://new-config.json \
  --region us-gov-west-1
```

## Monitoring & Troubleshooting

### CloudWatch Dashboards
Access monitoring through CloudWatch console:
- Navigate to CloudWatch → Dashboards
- Find dashboard: `{StackName}-{Region}`
- View processing metrics, error rates, and performance

### CloudWatch Logs
Monitor processing through log groups:
- `/aws/lambda/{StackName}-*` - Lambda function logs
- `/aws/vendedlogs/states/{StackName}/workflow` - Step Functions logs
- `/{StackName}/lambda/*` - Pattern-specific logs

### Alarms and Notifications
- SNS topic receives alerts for errors and performance issues
- Configure email subscriptions to the AlertsTopic

## Limitations in GovCloud Version

The following features are not available:

### ❌ Removed Features
- Web-based user interface
- Real-time document status updates via websockets
- Interactive configuration management
- User authentication and authorization via Cognito
- CloudFront content delivery and caching
- WAF security rules and IP filtering
- Analytics query interface
- Document knowledge base chat interface

### ✅ Available Workarounds
- Use S3 direct upload instead of web UI
- Monitor through CloudWatch instead of real-time UI
- Edit configuration files in S3 directly
- Use CLI/SDK for authentication needs
- Access content directly from S3
- Implement custom security at application level
- Query data through Athena directly
- Use the lookup function for document queries

## Best Practices

### Security
1. **IAM Roles**: Use least-privilege IAM roles
2. **Encryption**: Enable encryption at rest and in transit
3. **Network**: Deploy in private subnets if required
4. **Access Control**: Implement custom authentication as needed

### Operations
1. **Monitoring**: Set up CloudWatch alarms for critical metrics
2. **Logging**: Configure appropriate log retention policies
3. **Backup**: Implement backup strategies for important data
4. **Updates**: Plan for template updates and maintenance

### Performance
1. **Concurrency**: Adjust `MaxConcurrentWorkflows` based on load
2. **Timeouts**: Configure appropriate timeout values
3. **Memory**: Optimize Lambda memory settings
4. **Batching**: Use appropriate batch sizes for processing

## Troubleshooting

### Common Issues

**Template Validation Errors**
```bash
# Validate template before deployment
aws cloudformation validate-template \
  --template-body file://template-govcloud.yaml \
  --region us-gov-west-1
```

**Missing Dependencies**
- Ensure all Bedrock models are enabled in the region
- Verify IAM permissions for service roles
- Check S3 bucket policies and access

**Processing Failures**
- Check CloudWatch logs for detailed error messages
- Verify document formats are supported
- Confirm configuration settings are valid

### Support Resources

1. **AWS Documentation**: [GovCloud User Guide](https://docs.aws.amazon.com/govcloud-us/)
2. **Bedrock in GovCloud**: [Model Availability](https://docs.aws.amazon.com/bedrock/latest/userguide/models-regions.html)
3. **Service Limits**: [GovCloud Service Quotas](https://docs.aws.amazon.com/govcloud-us/latest/UserGuide/govcloud-limits.html)

## Migration from Commercial AWS

If migrating an existing deployment:

1. **Export Configuration**: Download all configuration from existing stack
2. **Export Data**: Copy any baseline or reference data
3. **Deploy GovCloud**: Use the generated template
4. **Import Configuration**: Upload configuration to new stack
5. **Validate**: Test processing with sample documents

## Cost Considerations

GovCloud pricing may differ from commercial regions:
- Review [GovCloud Pricing](https://aws.amazon.com/govcloud-us/pricing/)
- Update cost estimates in configuration files
- Monitor actual usage through billing dashboards

## Compliance Notes

- The GovCloud version maintains the same security features
- Data encryption and retention policies are preserved  
- All processing remains within GovCloud boundaries
- No data egress to commercial AWS regions
