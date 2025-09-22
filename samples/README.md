# GenAI IDP Accelerator Samples

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

This directory contains sample implementations of the GenAI Intelligent Document Processing (IDP) Accelerator, demonstrating different processing patterns and use cases.

## Available Samples

### [Sample Pattern 1: BDA Lending](./sample-bda-lending)

A complete implementation of Pattern 1 using Amazon Bedrock Data Automation for processing lending documents such as mortgage applications, loan agreements, and financial statements. This sample includes private networking capabilities for enhanced security.

### [Sample Pattern 2](./sample-pattern2)

A demonstration of Pattern 2 using custom extraction with Amazon Bedrock foundation models for processing complex or custom document types that require fine-grained control over the extraction process. This sample features isolated networking for secure document processing.

### [Sample Pattern 3: RVL-CDIP](./sample-sagemaker-udop-rvl-cdip)

An implementation of Pattern 3 using a fine-tuned Hugging Face RVL-CDIP model deployed on Amazon SageMaker for specialized document classification, combined with Amazon Bedrock for information extraction.

## Getting Started

Each sample directory contains its own README with specific instructions for deployment and usage. In general, to deploy any sample:

1. Navigate to the sample directory
2. Install dependencies and build the project
3. Deploy using the provided commands

All samples include a web application for document upload, processing status monitoring, and viewing extraction results.

## License

These samples are licensed under the Apache License 2.0 - see the [LICENSE](../LICENSE) file for details.

---

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
