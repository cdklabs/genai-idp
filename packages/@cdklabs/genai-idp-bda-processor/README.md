# GenAI IDP BdaProcessor

[![Compatible with GenAI IDP version: 0.3.18](https://img.shields.io/badge/Compatible%20with%20GenAI%20IDP-0.3.18-brightgreen)](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/tag/v0.3.18)
![Stability: Experimental](https://img.shields.io/badge/Stability-Experimental-important.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> This package is provided on an "as-is" basis, and may include bugs, errors, or other issues.
> All classes are under active development and subject to non-backward compatible changes or removal in any
> future version. These are not subject to the [Semantic Versioning](https://semver.org/) model.
> This means that while you may use them, you may need to update your source code when upgrading to a newer version of this package.

---

## Overview

The GenAI IDP BdaProcessor implements intelligent document processing using Amazon Bedrock Data Automation. This package provides a complete AWS CDK implementation for extracting structured data from standard documents with well-defined formats using Amazon's managed document processing capabilities.

The BdaProcessor is ideal for processing common document types such as invoices, receipts, financial statements, and other standardized forms where the structure is consistent and well-understood.

For a detailed exploration of all constructs and their configuration options, we invite you to check out our [API documentation](./API.md). This comprehensive reference will help you make the most of Pattern 1's capabilities in your document processing workflows.

## Features

- **Amazon Bedrock Data Automation Integration**: Leverages Amazon's managed document processing capabilities
- **Serverless Architecture**: Built on AWS Lambda, Step Functions, and other serverless technologies
- **Automatic Document Classification**: Identifies document types and applies appropriate extraction schemas
- **Configurable Processing Rules**: Customize extraction behavior through configuration
- **Document Summarization**: Optional AI-powered document summarization capabilities
- **Evaluation Framework**: Built-in mechanisms for evaluating extraction quality
- **Comprehensive Metrics**: Detailed CloudWatch metrics for monitoring processing performance
- **Cost Optimization**: Efficient resource utilization to minimize processing costs

## Getting Started

### Installation

The package is available through npm for JavaScript/TypeScript projects and PyPI for Python projects.

#### JavaScript/TypeScript (npm)

```bash
# Using npm
npm install @cdklabs/genai-idp-bda-processor @cdklabs/genai-idp

# Using yarn
yarn add @cdklabs/genai-idp-bda-processor @cdklabs/genai-idp
```

#### Python (PyPI)

```bash
# Using pip
pip install cdklabs.genai-idp-bda-processor cdklabs.genai-idp

# Using poetry
poetry add cdklabs.genai-idp-bda-processor cdklabs.genai-idp
```

### Basic Usage

Here's how to integrate BdaProcessor into your IDP solution:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import { ProcessingEnvironment } from '@cdklabs/genai-idp';
import { BdaProcessor, BdaProcessorConfiguration, IDataAutomationProject } from '@cdklabs/genai-idp-bda-processor';

export class MyIdpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create encryption key
    const key = new kms.Key(this, 'IdpKey', {
      enableKeyRotation: true,
    });

    // Create S3 buckets for input, output, and working data
    const inputBucket = new s3.Bucket(this, 'InputBucket', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
      eventBridgeEnabled: true,
    });

    const outputBucket = new s3.Bucket(this, 'OutputBucket', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
    });

    const workingBucket = new s3.Bucket(this, 'WorkingBucket', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
    });

    // Create processing environment
    const environment = new ProcessingEnvironment(this, 'Environment', {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: 'MyIdpSolution',
    });

    // Replace with your own configuration - this is just a sample
    const configuration = BdaProcessorConfiguration.lendingPackageSample();

    // Reference your Bedrock Data Automation project
    const dataAutomationProject: IDataAutomationProject = /* Your data automation project */;

    // Create the processor
    const processor = new BdaProcessor(this, 'Processor', {
      environment,
      configuration,
      dataAutomationProject,
    });
  }
}
```

## Configuration

BdaProcessor supports extensive configuration options:

- **Data Automation Project**: Connect to your Amazon Bedrock Data Automation project
- **Invokable Models**: Specify which models to use for evaluation and summarization
- **Guardrails**: Apply content guardrails to model interactions
- **Concurrency**: Control processing throughput and resource utilization
- **VPC Configuration**: Deploy in a VPC for enhanced security and connectivity

For detailed configuration options, refer to the TypeScript type definitions and JSDoc comments in the source code.

## Contributing

We welcome contributions to the GenAI IDP BdaProcessor! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Related Projects

- [@cdklabs/genai-idp](../genai-idp): Core IDP constructs and infrastructure
- [@cdklabs/genai-idp-bedrock-llm-processor](../genai-idp-bedrock-llm-processor): BedrockLlmProcessor implementation for custom extraction using Amazon Bedrock models
- [@cdklabs/genai-idp-sagemaker-udop-processor](../genai-idp-sagemaker-udop-processor): SagemakerUdopProcessor implementation for specialized document processing using SageMaker endpoints

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
