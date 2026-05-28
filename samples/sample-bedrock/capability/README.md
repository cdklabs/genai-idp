# Intelligent Document Processing with Amazon Bedrock

Serverless document processing pipeline using Amazon Bedrock foundation models for classification, extraction, summarization, and evaluation — with a web UI for document management.

## What Gets Deployed

- **Amazon S3** — Document input, working storage, and output buckets
- **Amazon Bedrock** — Document classification and information extraction
- **Amazon Textract** — OCR processing
- **AWS Step Functions** — Document processing workflow orchestration
- **AWS Lambda** — Processing task handlers
- **Amazon DynamoDB** — Processing status tracking
- **Amazon AppSync** — GraphQL API for status queries and real-time updates
- **Amazon CloudFront** — Web application hosting
- **Amazon Cognito** — User authentication
- **Amazon CloudWatch** — Monitoring and metrics
- **AWS KMS** — Encryption for all data at rest
- **Amazon VPC** — Fully private deployment with no internet gateway

## Inputs

| Name | Required | Description |
|------|----------|-------------|
| `ADMIN_EMAIL` | No | Email address for the admin user. A temporary password will be sent to this address. Leave empty to skip. |
| `CONFIG_S3_URI` | No | S3 URI (`s3://bucket/key`) of a custom processor configuration YAML in the target account. If not provided, the default configuration is used. |

## Outputs

| Name | Description |
|------|-------------|
| `WebSiteUrl` | URL of the CloudFront-hosted web application |

## Using the Application

1. Open the `WebSiteUrl` in a browser
2. Log in with the admin email and temporary password (check your inbox)
3. Upload documents through the web interface
4. Monitor processing status and view extraction results

## Processor Configuration

By default, the pipeline deploys with a **lending package sample** configuration that classifies and extracts data from common lending documents (pay stubs, bank statements, tax forms, etc.).

To use a custom configuration, upload a YAML config file to an S3 bucket in the target environment account and provide its URI as `CONFIG_S3_URI`. The configuration defines:

- **Document classes** — Types of documents the pipeline can classify
- **Extraction schemas** — Fields to extract from each document type
- **Model selection** — Which Bedrock models to use for each task
- **Prompts** — Custom prompts for classification, extraction, and summarization

## Prerequisites

- Amazon Bedrock model access must be enabled in the target account/region for the models used by the configuration (default: Claude and Titan models)
- The target account must be CDK-bootstrapped

## Security

- All data encrypted at rest with a customer-managed KMS key
- Deployed in a fully private VPC (no internet gateway, all AWS access via VPC endpoints)
- Least-privilege IAM permissions for all components
- CloudWatch logs encrypted

## Cost Considerations

Key cost drivers:

- **Amazon Bedrock** — Per-token charges for document processing
- **Amazon Textract** — Per-page OCR charges
- **VPC Endpoints** — Hourly charges per interface endpoint (~14 endpoints)
- **Amazon S3 / DynamoDB / Lambda** — Usage-based charges

## License

Apache License 2.0
