# Home

[![Compatible with GenAI IDP version: 0.4.8](https://img.shields.io/badge/Compatible%20with%20GenAI%20IDP-0.4.8-brightgreen)](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/releases/tag/v0.4.8)
![Stability: Experimental](https://img.shields.io/badge/Stability-Experimental-important.svg)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

Welcome to the documentation for the GenAI Intelligent Document Processing (IDP) Accelerator for AWS CDK.

This project provides a modular AWS CDK implementation of the [GenAI IDP Accelerator](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws), designed to transform unstructured documents into structured data at scale using AWS's latest AI/ML services.

## What's New in v0.4.8

This release introduces powerful new capabilities for testing, AI assistance, and developer productivity:

### Testing & Validation
- **Test Studio** - Comprehensive test management with automated RealKIE-FCC dataset deployment, interactive score distribution charts, and cross-test comparison
- **Enhanced Evaluation** - Stickler-based evaluation with field importance weights, Levenshtein distance, Hungarian algorithm matching, and split classification metrics

### AI-Powered Assistance
- **Agent Companion Chat** - Multi-agent orchestration with Analytics, Error Analyzer, General, and Code Intelligence agents, featuring real-time streaming and session management
- **Error Analyzer** - AI-powered failure diagnosis using Claude Sonnet 4 with CloudWatch log analysis and X-Ray trace correlation

### Integration & Extensibility
- **MCP Integration** - Model Context Protocol server deployment with OAuth 2.0 authentication for external application access via AWS Bedrock AgentCore Gateway
- **Document Discovery** - Pattern-neutral discovery with BDA blueprint auto-generation and JSON Schema output

### Configuration & Data Management
- **JSON Schema Configuration** - Modern configuration format with validation, automatic migration from legacy formats, and `x-aws-idp-*` extension properties
- **Configuration Library Browser** - Import pre-configured workflows directly from the solution's configuration library with pattern-aware filtering

### Processing Enhancements
- **Agentic Extraction (Pattern 2)** - Iterative validation loops using Strands agent framework with Pydantic models for structured output
- **Regex Classification (Pattern 2)** - Document name and page content regex matching with LLM fallback
- **Section Splitting Strategies** - Flexible document segmentation: disabled (single section), page-based (one per page), or LLM-determined
- **Edit Sections** - Modify document sections with selective reprocessing optimization

### Infrastructure & Monitoring
- **S3 Vectors Support** - Cost-effective vector storage for Knowledge Base with sub-second latency (default option)
- **Enhanced Model Support** - Amazon Nova family, Claude 4.x, Sonnet 4.5, Qwen 3 VL with EU region mappings
- **X-Ray Tracing** - Distributed tracing support for Lambda functions
- **Lambda Cost Metering** - Invocation count and GB-seconds tracking integrated with document metering

## What is GenAI IDP?

GenAI IDP is an accelerator that helps organizations process and extract information from documents using generative AI and other machine learning technologies. It provides a scalable, serverless architecture for document processing workflows.

## Key Features

- **Modular CDK Architecture**: Organized as reusable CDK constructs that can be composed into complete solutions
- **Multiple Processing Patterns**: Pre-built document processing patterns for different use cases
- **Serverless Design**: Built on AWS Lambda, Step Functions, SQS, and other serverless technologies
- **AI-Powered Document Processing**: Leverages Amazon Bedrock, Textract, and other AWS AI services
- **Web User Interface**: Optional secure web interface for document tracking and management
- **Document Knowledge Base**: Query processed documents using natural language

## Getting Started

Visit the [Getting Started](getting-started/index.md) section to begin using the GenAI IDP Accelerator.

<!--
## Packages

The GenAI IDP Accelerator is organized into modular CDK packages that can be composed to create complete document processing solutions:

### @cdklabs/genai-idp

The core package provides the foundational infrastructure for document processing, including:

- **ProcessingEnvironment**: Sets up the basic infrastructure for document processing
- **WebApplication**: Optional web interface for document management
- **UserIdentity**: User authentication and authorization
- **Configuration and tracking tables**: For managing processing state and configuration

### @cdklabs/genai-idp-bda-processor

BDA Processor uses Amazon Bedrock Data Automation for document processing with minimal custom code. This processor is best for standard document types with well-defined schemas and leverages Amazon Bedrock's built-in document processing capabilities.

### @cdklabs/genai-idp-bedrock-llm-processor

Bedrock LLM Processor implements custom extraction logic using Amazon Bedrock foundation models. It's more flexible than BDA Processor for custom document types, allows fine-grained control over extraction prompts and logic, and supports evaluation of extraction results against baseline data.

### @cdklabs/genai-idp-sagemaker-udop-processor

SageMaker UDOP Processor utilizes custom SageMaker endpoints for specialized document processing tasks. It's ideal for domain-specific document types requiring custom models, supports integration with fine-tuned models like RVL-CDIP for document classification, and can be combined with foundation models for extraction after classification.
-->