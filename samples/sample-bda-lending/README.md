# Sample Pattern 1: Lending Document Processing with Bedrock Data Automation

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## Overview

This sample demonstrates a complete implementation of Pattern 1 of the GenAI IDP Accelerator, focused on processing lending documents using Amazon Bedrock Data Automation. It showcases how to extract structured data from mortgage applications, loan agreements, financial statements, and other lending-related documents at scale.

The sample provides a ready-to-deploy AWS CDK application that sets up the entire document processing pipeline, from document ingestion to structured data extraction and result tracking.

## Architecture

![Architecture Diagram](./docs/architecture.png)

The solution architecture includes:

- **Amazon S3**: For document storage and processing results
- **Amazon Bedrock**: For document processing using Data Automation
- **AWS Step Functions**: For orchestrating the document processing workflow
- **AWS Lambda**: For handling document processing tasks
- **Amazon DynamoDB**: For tracking document processing status
- **Amazon AppSync**: For providing a GraphQL API to query processing status
- **Amazon CloudWatch**: For monitoring and alerting

## Features

- **End-to-End Lending Document Processing**: Process mortgage applications, loan agreements, and financial statements
- **Automated Data Extraction**: Extract key information like borrower details, loan terms, and financial data
- **Document Classification**: Automatically identify document types and apply appropriate extraction schemas
- **Processing Status Tracking**: Monitor document processing status through a GraphQL API
- **Evaluation Framework**: Compare extraction results against baseline data for quality assessment
- **Document Summarization**: Generate concise summaries of processed documents
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
cd samples/sample-bda-lending
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

- **Bedrock Models**: Choose which models to use for evaluation and summarization
- **Web UI**: Enable or disable the web interface
- **Evaluation**: Configure baseline evaluation settings
- **Concurrency**: Adjust processing throughput
- **Retention Periods**: Set data retention policies

Edit the `bin/sample-bda-lending.ts` file to modify these settings.

## Cost Considerations

This sample uses AWS services that may incur costs. Key cost factors include:

- **Amazon Bedrock**: Charges based on the number of documents processed
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

- [Sample Pattern 2](../sample-pattern2): Example using Pattern 2 for custom extraction
- [Sample Pattern 3: RVL-CDIP](../sample-sagemaker-udop-rvl-cdip): Example using Pattern 3 with a fine-tuned RVL-CDIP model

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](../../LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
