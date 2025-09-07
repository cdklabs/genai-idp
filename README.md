# GenAI IDP Accelerator for AWS CDK

[![Compatible with version: 0.3.13](https://img.shields.io/badge/Compatible%20with-0.3.13-brightgreen)](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/tag/v0.3.13)

A modular AWS CDK implementation of the GenAI Intelligent Document Processing (IDP) Accelerator, designed to transform unstructured documents into structured data at scale using AWS's latest AI/ML services.

## Overview

This project is a representation of the [GenAI Intelligent Document Processing Accelerator](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws) as a set of composable AWS CDK packages, enabling more flexible deployment, customization, and integration options.

### Repository Structure

#### Packages
- `@cdklabs/genai-idp` - Core building blocks for document processing infrastructure
- `@cdklabs/genai-idp-bda-processor` - Pattern 1 implementation using Amazon Bedrock Data Automation
- `@cdklabs/genai-idp-bedrock-llm-processor` - Pattern 2 implementation for custom extraction using Amazon Bedrock models
- `@cdklabs/genai-idp-sagemaker-udop-processor` - Pattern 3 implementation for specialized document processing using Sagemaker Endpoint

#### Samples
- `sample-bda-lending` - Complete Pattern 1 implementation for processing lending documents using Amazon Bedrock Data Automation
- `sample-bedrock` - Pattern 2 demonstration using custom extraction with Amazon Bedrock foundation models
- `sample-sagemaker-udop-rvl-cdip` - Pattern 3 implementation using fine-tuned Hugging Face RVL-CDIP model on Amazon SageMaker


### Key Features

- **Modular CDK Architecture**: Organized as reusable CDK constructs that can be composed into complete solutions
- **Multiple Processing Patterns**: Pre-built document processing patterns for different use cases
- **Serverless Design**: Built on AWS Lambda, Step Functions, SQS, and other serverless technologies
- **AI-Powered Document Processing**: Leverages Amazon Bedrock, Textract, and other AWS AI services
- **Web User Interface**: Optional secure web interface for document tracking and management
- **Document Knowledge Base**: Query processed documents using natural language

## Prerequisites

- [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)
- [yarn](https://yarnpkg.com/) for node package management
- Docker CLI (can be [Docker Desktop](https://docs.docker.com/desktop/) or [Rancher Desktop](https://rancherdesktop.io/))
- rsync for copying assets to packages
- [Python](https://www.python.org/) for building Python GenAI IDP distributable packages
- [.NET SDK](https://dotnet.microsoft.com/en-us/download) for building .NET GenAI IDP distributable packages
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) (`npm install -g aws-cdk`)
## Getting Started

### Environment Setup

1. Set up the correct Node.js version using NVM:

```bash
# Install the required Node.js version specified in .nvmrc
nvm install

# Use the project's Node.js version
nvm use
```

2. Install Yarn globally (if not already installed):

```bash
npm i -g yarn
```

3. Install project dependencies:

```bash
yarn install
```

### Project Setup

1. Ensure Docker is running and rsync is available

2. (Re)scaffold the project:
```bash
yarn projen
```

3. Build the packages:
```bash
yarn build
```

***Note:*** During the first run this might take a while

## License

This project is licensed under the terms specified in the LICENSE file.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on how to get started, development workflow, and coding standards.

## Additional Resources

- [Accelerate intelligent document processing with generative AI on AWS blog post](https://aws.amazon.com/blogs/machine-learning/accelerate-intelligent-document-processing-with-generative-ai-on-aws/)
- [Gen AI Intelligent Document Processing (GenAIIDP)](github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Projen Documentation](https://projen.io/)
