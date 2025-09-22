# Developer Guides

This section provides detailed guidance for developers working with the GenAI IDP Accelerator CDK implementation. The guides in this section will walk you through specific examples that highlight the capabilities of the AWS CDK GenAI IDP solution.

## Overview

The developer guides are designed to help you understand how to implement and customize the GenAI IDP Accelerator for your specific document processing needs. Each guide focuses on a particular implementation pattern or use case, providing step-by-step instructions, code examples, and best practices.

## Available Guides

### Sample Implementations

This section contains detailed walkthroughs for each sample implementation included in the repository:

- **[Lending Document Processing with Bedrock Data Automation](sample-bda-lending.md)** - Learn how to process lending documents using Amazon Bedrock Data Automation
- **[Custom Extraction with Evaluation](sample-bedrock-llm-evaluation.md)** - Explore custom extraction using Amazon Bedrock models with evaluation capabilities
- **[RVL-CDIP Document Classification with SageMaker](sample-sagemaker-udop-rvl-cdip.md)** - Discover how to classify documents using a fine-tuned model on SageMaker

Each sample walkthrough includes:

- Architecture overview
- Step-by-step deployment instructions
- Code examples in both TypeScript and Python
- Testing and validation procedures
- Customization options
- Best practices and tips

## Common Architecture Components

While each pattern has its unique characteristics, all implementations share these common components:

- **S3 Buckets**: For input documents and processing results
- **Step Functions Workflow**: For orchestrating the document processing pipeline
- **Lambda Functions**: For processing tasks and integration
- **DynamoDB Tables**: For configuration and tracking
- **AppSync GraphQL API**: For querying document status and metadata
- **Optional Web Interface**: For document management and visualization

## Integration Options

The guides also demonstrate how to integrate the GenAI IDP Accelerator with:

- **Existing S3 Buckets**: Use your existing document storage
- **Custom Authentication**: Integrate with your identity provider
- **VPC Deployment**: Deploy within your VPC for enhanced security
- **Custom Post-Processing**: Add custom logic after extraction
- **External Systems**: Connect to databases, CRMs, or other business systems

## Best Practices

Throughout the guides, you'll find best practices for:

1. **Choosing the Right Pattern**: Select the pattern that best fits your document types and extraction needs
2. **Testing and Validation**: Ensure your document processing solution works correctly
3. **Performance Optimization**: Configure your solution for optimal performance
4. **Cost Management**: Minimize costs while maintaining performance
5. **Security**: Implement proper security controls for your document processing solution

## Next Steps

To get started with the developer guides:

1. Choose a sample implementation that matches your use case
2. Follow the step-by-step instructions to deploy and test the solution
3. Customize the solution for your specific requirements
4. Explore advanced features and integration options

For a quick introduction to the GenAI IDP Accelerator, check out the [Getting Started Guide](../getting-started/index.md).
