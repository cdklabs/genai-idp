# API Reference

This section provides detailed API reference documentation for the GenAI IDP Accelerator CDK packages. The documentation is automatically generated from the source code using JSDoc comments.

## Core Packages

### @cdklabs/genai-idp

The core package provides the foundational infrastructure for document processing, including:

- **ProcessingEnvironment**: Sets up the basic infrastructure for document processing
- **WebApplication**: Optional web interface for document management
- **UserIdentity**: User authentication and authorization
- **Configuration and tracking tables**: For managing processing state and configuration

[View API Reference](genai-idp-api.md)

### @cdklabs/genai-idp-bda-processor

Pattern 1 uses Amazon Bedrock Data Automation for document processing with minimal custom code:

- Best for standard document types with well-defined schemas
- Leverages Amazon Bedrock's built-in document processing capabilities
- Minimal custom code required

[View API Reference](genai-idp-bda-processor-api.md)

### @cdklabs/genai-idp-bedrock-llm-processor

Pattern 2 implements custom extraction logic using Amazon Bedrock foundation models:

- More flexible than Pattern 1 for custom document types
- Allows fine-grained control over extraction prompts and logic
- Supports evaluation of extraction results against baseline data

[View API Reference](genai-idp-bedrock-llm-processor-api.md)

### @cdklabs/genai-idp-sagemaker-udop-processor

Pattern 3 utilizes custom SageMaker endpoints for specialized document processing tasks:

- Ideal for domain-specific document types requiring custom models
- Supports integration with fine-tuned models like RVL-CDIP for document classification
- Can be combined with foundation models for extraction after classification

[View API Reference](genai-idp-sagemaker-udop-processor-api.md)
