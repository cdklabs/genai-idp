# GenAI IDP BedrockLlmProcessor

[![Compatible with GenAI IDP version: 0.3.16](https://img.shields.io/badge/Compatible%20with%20GenAI%20IDP-0.3.16-brightgreen)](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/tag/v0.3.16)
![Stability: Experimental](https://img.shields.io/badge/Stability-Experimental-important.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> This package is provided on an "as-is" basis, and may include bugs, errors, or other issues.
> All classes are under active development and subject to non-backward compatible changes or removal in any
> future version. These are not subject to the [Semantic Versioning](https://semver.org/) model.
> This means that while you may use them, you may need to update your source code when upgrading to a newer version of this package.

---

## Overview

The GenAI IDP BedrockLlmProcessor implements intelligent document processing using custom extraction with Amazon Bedrock foundation models. This package provides a flexible AWS CDK implementation for extracting structured data from a wide range of document types, offering greater control over the extraction process compared to the BdaProcessor.

The BedrockLlmProcessor is ideal for processing complex or custom document types where you need fine-grained control over the extraction process, or when dealing with documents that don't fit standard templates.

Ready to dive deeper? Explore our comprehensive [API documentation](./API.md) to discover all available constructs and configuration options that will help you build powerful custom document processing solutions.

## Features

- **Custom Extraction Logic**: Fine-grained control over how information is extracted from documents
- **Multiple Classification Methods**: Support for page-level and document-level classification
- **Multimodal Processing**: Analyze both text and visual elements for improved accuracy
- **Flexible Schema Definition**: Define custom extraction schemas for your specific document types
- **Document Summarization**: Optional AI-powered document summarization capabilities
- **Evaluation Framework**: Built-in mechanisms for evaluating extraction quality
- **Comprehensive Metrics**: Detailed CloudWatch metrics for monitoring processing performance
- **Configurable Concurrency**: Control processing throughput and resource utilization

## Getting Started

### Installation

The package is available through npm for JavaScript/TypeScript projects and PyPI for Python projects.

#### JavaScript/TypeScript (npm)

```bash
# Using npm
npm install @cdklabs/genai-idp-bedrock-llm-processor @cdklabs/genai-idp

# Using yarn
yarn add @cdklabs/genai-idp-bedrock-llm-processor @cdklabs/genai-idp
```

#### Python (PyPI)

```bash
# Using pip
pip install cdklabs.genai-idp-bedrock-llm-processor cdklabs.genai-idp

# Using poetry
poetry add cdklabs.genai-idp-bedrock-llm-processor cdklabs.genai-idp
```

### Basic Usage

Here's how to integrate BedrockLlmProcessor into your IDP solution:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as bedrock from '@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock';
import { ProcessingEnvironment } from '@cdklabs/genai-idp';
import { BedrockLlmProcessor, BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor';

export class MyIdpStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create encryption key
    const key = new kms.Key(this, 'IdpKey', {
      enableKeyRotation: true,
    });

    // Create S3 buckets for input and output
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

    // Create the processor
    const processor = new BedrockLlmProcessor(this, 'Processor', {
      environment,
      // Replace with your own configuration - this is just a sample
      configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      classificationMaxWorkers: 10,
      ocrMaxWorkers: 20,
    });
  }
}
```

## Classification Methods

BedrockLlmProcessor supports two classification methods to accommodate different document types:

- **MULTIMODAL_PAGE_LEVEL_CLASSIFICATION**: Uses multimodal models to classify documents at the page level. Analyzes both text and visual elements on each page for classification. This method is effective for documents where each page may belong to a different document type or category.

- **TEXTBASED_HOLISTIC_CLASSIFICATION**: Uses text-based analysis to classify the entire document holistically. Considers the full document text content for classification decisions. This method is more efficient and cost-effective as it only processes the extracted text.

Choose the classification method that best suits your document types and processing requirements.

## Configuration

BedrockLlmProcessor supports extensive configuration options:

- **Classification Method**: Choose how documents are classified and categorized
- **Invokable Models**: Specify which models to use for classification, extraction, evaluation, and summarization
- **Guardrails**: Apply content guardrails to model interactions
- **Concurrency**: Control processing throughput and resource utilization
- **VPC Configuration**: Deploy in a VPC for enhanced security and connectivity

For detailed configuration options, refer to the TypeScript type definitions and JSDoc comments in the source code.

## Contributing

We welcome contributions to the GenAI IDP BedrockLlmProcessor! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Related Projects

- [@cdklabs/genai-idp](../genai-idp): Core IDP constructs and infrastructure
- [@cdklabs/genai-idp-bda-processor](../genai-idp-bda-processor): BdaProcessor implementation using Amazon Bedrock Data Automation
- [@cdklabs/genai-idp-sagemaker-udop-processor](../genai-idp-sagemaker-udop-processor): SagemakerUdopProcessor implementation for specialized document processing using SageMaker endpoints

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
