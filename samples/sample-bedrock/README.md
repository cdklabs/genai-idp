# Sample Pattern 2: Custom Document Extraction with Bedrock Models

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This sample demonstrates a complete implementation of Pattern 2 of the GenAI IDP Accelerator, focused on custom document extraction using Amazon Bedrock foundation models. It showcases how to extract structured data from complex or custom document types that require fine-grained control over the extraction process.

The sample provides a ready-to-deploy AWS CDK application that sets up a flexible document processing pipeline with custom classification and extraction capabilities.

## Architecture

![Architecture Diagram](./docs/architecture.png)

The solution architecture includes:

- **Amazon S3**: For document storage and processing results
- **Amazon Bedrock**: For document classification and information extraction
- **Amazon Textract**: For initial OCR processing
- **AWS Step Functions**: For orchestrating the document processing workflow
- **AWS Lambda**: For handling document processing tasks
- **Amazon DynamoDB**: For tracking document processing status
- **Amazon AppSync**: For providing a GraphQL API to query processing status
- **Amazon CloudWatch**: For monitoring and alerting

## Features

- **Custom Document Extraction**: Process complex or non-standard document types
- **Flexible Classification**: Choose between multimodal page-level classification or text-based holistic classification
- **Configurable Extraction Schemas**: Define custom extraction schemas for your specific document types
- **Processing Status Tracking**: Monitor document processing status through a GraphQL API
- **Document Summarization**: Generate concise summaries of processed documents
- **Evaluation Framework**: Compare extraction results against baseline data for quality assessment
- **Web Interface**: Optional web UI for document upload and result viewing

## Prerequisites

Before deploying this sample, ensure you have:

1. **AWS Account**: An AWS account with permissions to create the required resources
2. **AWS CLI**: Configured with appropriate credentials
3. **Node.js and npm**: Version 18 or later
4. **AWS CDK**: Version 2.x installed globally (`npm install -g aws-cdk`)
5. **Docker**: For local development and building Lambda functions
6. **Amazon Bedrock Access**: Ensure your AWS account has access to Amazon Bedrock and the required models
7. **Bootstrapped CDK Environment**: The AWS account and region where you plan to deploy must be bootstrapped for CDK

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/aws-samples/genaiic-idp-accelerator-cdk.git
cd genaiic-idp-accelerator-cdk
```

### 2. Install Dependencies and Build

```bash
# Install project dependencies
yarn install

# Build the packages
yarn build:packages

# Navigate to the sample directory
cd samples/sample-bedrock
```

### 3. Deploy to AWS

```bash
# Deploy the sample with admin email for web application access
yarn deploy --parameters AdminEmail=your-email@example.com
```

The deployment will output the WebSiteUrl, which is the URL for accessing the GenAI IDP web application.

You can access the web application using this URL to upload documents, monitor processing status, and view extraction results.

### 5. Process Documents

After deployment, you can start processing documents by:

1. Accessing the web application using the WebSiteUrl provided in the deployment output
2. Logging in with the admin email you provided during deployment
3. Uploading documents through the web interface
4. Monitoring processing status and viewing extraction results directly in the application

## Configuration Options

The sample can be customized through various configuration options:

- **Classification Method**: Choose between `MULTIMODAL_PAGE_LEVEL_CLASSIFICATION` or `TEXTBASED_HOLISTIC_CLASSIFICATION`
- **Bedrock Models**: Select which models to use for classification, extraction, evaluation, and summarization
- **Extraction Schemas**: Define custom extraction schemas for your document types
- **Concurrency**: Adjust processing throughput for OCR and classification
- **Web UI**: Enable or disable the web interface

Edit the `src/bedrock-llm-stack.ts` file to modify these settings.

## Customizing Extraction Schemas

One of the key advantages of Pattern 2 is the ability to define custom extraction schemas. To customize the extraction schemas:

1. Edit the configuration files in the `config/` directory
2. Define the document types and fields to extract
3. Customize the extraction prompts for each document type

## Cost Considerations

This sample uses AWS services that may incur costs. Key cost factors include:

- **Amazon Bedrock**: Charges based on the number of tokens processed
- **Amazon Textract**: Charges based on the number of pages processed
- **AWS Lambda**: Charges based on execution time and memory
- **Amazon S3**: Charges for storage and requests
- **Amazon DynamoDB**: Charges for storage and read/write capacity

Consider using the [AWS Pricing Calculator](https://calculator.aws) to estimate costs.

## Security Considerations

The sample implements several security best practices:

- **Encryption**: All data is encrypted at rest and in transit
- **IAM Permissions**: Least privilege access for all components
- **VPC Options**: Can be deployed within a VPC for enhanced security
- **Guardrails**: Optional content guardrails for model interactions

## Contributing

We welcome contributions to improve this sample! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Projects

- [Sample Pattern 1: BDA Lending](../sample-bda-lending): Example using Pattern 1 for lending document processing
- [Sample Pattern 3: RVL-CDIP](../sample-sagemaker-udop-rvl-cdip): Example using Pattern 3 with a fine-tuned RVL-CDIP model

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../../LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
