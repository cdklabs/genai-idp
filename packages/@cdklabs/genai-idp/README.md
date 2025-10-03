# GenAI IDP Core Package

[![Compatible with GenAI IDP version: 0.3.18](https://img.shields.io/badge/Compatible%20with%20GenAI%20IDP-0.3.18-brightgreen)](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/tag/v0.3.18)
![Stability: Experimental](https://img.shields.io/badge/Stability-Experimental-important.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> This package is provided on an "as-is" basis, and may include bugs, errors, or other issues.
> All classes are under active development and subject to non-backward compatible changes or removal in any
> future version. These are not subject to the [Semantic Versioning](https://semver.org/) model.
> This means that while you may use them, you may need to update your source code when upgrading to a newer version of this package.


---

## Overview

The GenAI IDP Core Package provides the foundational AWS CDK constructs for building intelligent document processing solutions. This package serves as the backbone for the GenAI Intelligent Document Processing (IDP) Accelerator, enabling organizations to transform unstructured documents into structured data at scale using AWS's latest AI/ML services.

For a comprehensive reference of all available constructs and their properties, please explore our [API documentation](./API.md). This detailed guide will help you understand the full capabilities of this package and how to leverage them in your projects.

## Features

- **Modular Architecture**: Composable CDK constructs that can be combined to create complete document processing solutions
- **Document Processing Infrastructure**: Core components for document ingestion, tracking, and management
- **Processing Environment API**: GraphQL API for monitoring document processing status and results
- **Web Application Support**: Optional secure web interface for document tracking and management
- **Extensible Design**: Designed to work with multiple document processing patterns and AI/ML services
- **Security-First Approach**: Built-in support for encryption, IAM permissions, and secure data handling
- **Observability**: Integrated CloudWatch metrics, logs, and alarms for monitoring and troubleshooting

## Getting Started

### Installation

The package is available through npm for JavaScript/TypeScript projects and PyPI for Python projects.

#### JavaScript/TypeScript (npm)

```bash
# Using npm
npm install @cdklabs/genai-idp

# Using yarn
yarn add @cdklabs/genai-idp
```

#### Python (PyPI)

```bash
# Using pip
pip install cdklabs.genai-idp

# Using poetry
poetry add cdklabs.genai-idp
```

### Basic Usage

Here's a simple example of how to use the core IDP constructs:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import { ProcessingEnvironment } from '@cdklabs/genai-idp';

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

    // Attach document processors to the environment
    // (processors are provided by separate packages)
  }
}
```

## API Reference

### Key Components

- **ProcessingEnvironment**: Main construct that orchestrates the document processing workflow
- **ProcessingEnvironmentApi**: GraphQL API for monitoring document processing status
- **IDocumentProcessor**: Interface for document processing implementations
- **LogLevel**: Enum for controlling logging verbosity

For detailed API documentation, please refer to the TypeScript type definitions and JSDoc comments in the source code.

## Contributing

We welcome contributions to the GenAI IDP Core Package! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Related Projects

- [@cdklabs/genai-idp-bda-processor](../genai-idp-bda-processor): BdaProcessor implementation using Amazon Bedrock Data Automation
- [@cdklabs/genai-idp-bedrock-llm-processor](../genai-idp-bedrock-llm-processor): BedrockLlmProcessor implementation for custom extraction using Amazon Bedrock models
- [@cdklabs/genai-idp-sagemaker-udop-processor](../genai-idp-sagemaker-udop-processor): SagemakerUdopProcessor implementation for specialized document processing using SageMaker endpoints

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
