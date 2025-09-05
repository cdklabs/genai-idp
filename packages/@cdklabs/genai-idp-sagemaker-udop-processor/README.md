# GenAI IDP SagemakerUdopProcessor

[![Compatible with GenAI IDP version: 0.3.13](https://img.shields.io/badge/Compatible%20with%20GenAI%20IDP-0.3.13-brightgreen)](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/tag/v0.3.13)
![Stability: Experimental](https://img.shields.io/badge/Stability-Experimental-important.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

> All classes are under active development and subject to non-backward compatible changes or removal in any
> future version. These are not subject to the [Semantic Versioning](https://semver.org/) model.
> This means that while you may use them, you may need to update your source code when upgrading to a newer version of this package.

---

## Overview

The GenAI IDP SagemakerUdopProcessor implements intelligent document processing using specialized document processing with SageMaker endpoints for classification, combined with foundation models for extraction. This package provides an advanced AWS CDK implementation for processing specialized document types that require custom classification models.

The SagemakerUdopProcessor is ideal for domain-specific documents, complex forms, or technical documents that require specialized classification models beyond what's possible with foundation models alone.

To master the full potential of this advanced pattern, we encourage you to browse our detailed [API documentation](./API.md). This resource provides in-depth information about all constructs, their properties, and how to configure them for your specialized document processing needs.

## Features

- **SageMaker-Based Classification**: Deploy specialized document classification models on SageMaker
- **Custom Model Support**: Integrate models like RVL-CDIP or UDOP for specialized document classification
- **Auto-Scaling Endpoints**: Automatically scale SageMaker endpoints based on processing demand
- **Foundation Model Extraction**: Use Amazon Bedrock foundation models for information extraction
- **Document Summarization**: Optional AI-powered document summarization capabilities
- **Evaluation Framework**: Built-in mechanisms for evaluating extraction quality
- **Comprehensive Metrics**: Detailed CloudWatch metrics for monitoring processing performance
- **GPU Acceleration**: Support for GPU-accelerated inference for improved performance

## Getting Started

### Installation

The package is available through npm for JavaScript/TypeScript projects and PyPI for Python projects.

#### JavaScript/TypeScript (npm)

```bash
# Using npm
npm install @cdklabs/genai-idp-sagemaker-udop-processor @cdklabs/genai-idp @aws-cdk/aws-sagemaker-alpha

# Using yarn
yarn add @cdklabs/genai-idp-sagemaker-udop-processor @cdklabs/genai-idp @aws-cdk/aws-sagemaker-alpha
```

#### Python (PyPI)

```bash
# Using pip
pip install cdklabs.genai-idp-sagemaker-udop-processor cdklabs.genai-idp aws-cdk.aws-sagemaker-alpha

# Using poetry
poetry add cdklabs.genai-idp-sagemaker-udop-processor cdklabs.genai-idp aws-cdk.aws-sagemaker-alpha
```

### Basic Usage

Here's how to integrate SagemakerUdopProcessor into your IDP solution:

```typescript
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as sagemaker from '@aws-cdk/aws-sagemaker-alpha';
import * as bedrock from '@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock';
import { ProcessingEnvironment } from '@cdklabs/genai-idp';
import { SagemakerUdopProcessor, BasicSagemakerClassifier } from '@cdklabs/genai-idp-sagemaker-udop-processor';

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

    const configurationBucket = new s3.Bucket(this, 'ConfigurationBucket', {
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
    });

    // Create processing environment
    const environment = new ProcessingEnvironment(this, 'Environment', {
      key,
      inputBucket,
      outputBucket,
      configurationBucket,
      metricNamespace: 'MyIdpSolution',
    });

    // Create SageMaker classifier
    const classifier = new BasicSagemakerClassifier(this, 'Classifier', {
      outputBucket: environment.outputBucket,
      modelData: sagemaker.ModelData.fromAsset('./model'),
      instanceType: sagemaker.InstanceType.of(
        sagemaker.InstanceClass.G4DN,
        sagemaker.InstanceSize.XLARGE2
      ),
      minInstanceCount: 1,
      maxInstanceCount: 4,
    });

    // Create the processor
    const processor = new SagemakerUdopProcessor(this, 'Processor', {
      environment,
      classifier,
      extractionInvokable: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
      summarizationInvokable: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
      ocrMaxWorkers: 20,
    });
  }
}
```

## SageMaker Classifier

The SagemakerUdopProcessor accepts a SageMaker endpoint for document classification, providing flexibility in how you create and manage your classification models.

### Option 1: Using the BasicSagemakerClassifier Convenience Construct

For quick setup, use the provided `BasicSagemakerClassifier` construct:

```typescript
// Create SageMaker classifier using the basic convenience construct
const classifier = new BasicSagemakerClassifier(this, 'Classifier', {
  outputBucket: environment.outputBucket,
  modelData: sagemaker.ModelData.fromAsset('./model'),
  instanceType: sagemaker.InstanceType.ML_G4DN_XLARGE,
  minInstanceCount: 1,
  maxInstanceCount: 4,
});

const processor = new SagemakerUdopProcessor(this, 'Processor', {
  environment,
  classifierEndpoint: classifier.endpoint, // Pass the endpoint directly
  // ... other configuration
});
```

### Option 2: Using Your Own SageMaker Endpoint

For maximum flexibility, create your own SageMaker endpoint and pass it directly:

```typescript
// Create your own SageMaker endpoint
const model = new sagemaker.Model(this, 'MyCustomModel', {
  containers: [{
    image: sagemaker.ContainerImage.fromDlc('pytorch-inference', '2.1.0-gpu-py310'),
    modelData: sagemaker.ModelData.fromAsset('./my-custom-model'),
    // ... custom configuration
  }],
});

const endpointConfig = new sagemaker.EndpointConfig(this, 'MyEndpointConfig', {
  instanceProductionVariants: [{
    variantName: 'AllTraffic',
    initialInstanceCount: 1,
    instanceType: sagemaker.InstanceType.ML_G4DN_XLARGE,
    model: model,
    initialVariantWeight: 1.0,
  }],
});

const endpoint = new sagemaker.Endpoint(this, 'MyEndpoint', {
  endpointConfig: endpointConfig,
});

const processor = new SagemakerUdopProcessor(this, 'Processor', {
  environment,
  classifierEndpoint: endpoint, // Pass your custom endpoint directly
  // ... other configuration
});
```

### Option 3: Using an Existing Endpoint

You can also reference an existing SageMaker endpoint:

```typescript
// Reference an existing endpoint
const existingEndpoint = sagemaker.Endpoint.fromEndpointName(
  this, 
  'ExistingEndpoint', 
  'my-existing-endpoint-name'
);

const processor = new SagemakerUdopProcessor(this, 'Processor', {
  environment,
  classifierEndpoint: existingEndpoint,
  // ... other configuration
});
```

### Key Benefits of This Approach

- **Flexibility**: Use any SageMaker endpoint creation method
- **Reusability**: Share endpoints across multiple processors
- **Cost Optimization**: Better control over endpoint lifecycle and scaling
- **Custom Models**: Deploy any classification model (RVL-CDIP, UDOP, custom models)
- **GPU Acceleration**: Use GPU instances for improved inference performance
- **Auto-Scaling**: Configure scaling based on your specific needs

## Configuration

SagemakerUdopProcessor supports extensive configuration options:

- **SageMaker Endpoint**: Provide any SageMaker endpoint for document classification (using convenience construct, custom endpoint, or existing endpoint)
- **Invokable Models**: Specify which models to use for extraction, evaluation, and summarization
- **Guardrails**: Apply content guardrails to model interactions
- **Concurrency**: Control processing throughput and resource utilization
- **VPC Configuration**: Deploy in a VPC for enhanced security and connectivity

For detailed configuration options, refer to the TypeScript type definitions and JSDoc comments in the source code.

## Contributing

We welcome contributions to the GenAI IDP SagemakerUdopProcessor! Please follow these steps to contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Related Projects

- [@cdklabs/genai-idp](../idp): Core IDP constructs and infrastructure
- [@cdklabs/genai-idp-bda-processor](../idp-bda-processor): BdaProcessor implementation using Amazon Bedrock Data Automation
- [@cdklabs/genai-idp-bedrock-llm-processor](../idp-bedrock-llm-processor): BedrockLlmProcessor implementation for custom extraction using Amazon Bedrock models

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
