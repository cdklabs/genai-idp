# Frequently Asked Questions

This section provides answers to frequently asked questions about the GenAI IDP Accelerator CDK implementation.

## General Questions

### What is the GenAI IDP Accelerator?

The GenAI Intelligent Document Processing (IDP) Accelerator is a comprehensive solution for transforming unstructured documents into structured data using AWS's AI/ML services. It provides a modular, customizable approach to document processing workflows.

### What is the difference between the original GenAI IDP Accelerator and this CDK implementation?

The original GenAI IDP Accelerator is implemented as a CloudFormation template, while this project is a modular AWS CDK implementation. The CDK implementation provides more flexibility for customization and integration with existing infrastructure.

### What AWS services does the GenAI IDP Accelerator use?

The GenAI IDP Accelerator uses a variety of AWS services, including:

- Amazon S3 for document storage
- AWS Lambda for serverless processing
- AWS Step Functions for workflow orchestration
- Amazon Bedrock for generative AI capabilities
- Amazon Textract for OCR and basic extraction
- Amazon Comprehend for entity recognition
- Amazon SageMaker for custom ML models
- Amazon DynamoDB for metadata storage

### What document types are supported?

The GenAI IDP Accelerator supports a wide range of document types, including:

- PDF documents
- Image files (JPEG, PNG, TIFF)
- Microsoft Office documents (Word, Excel)
- Text files

The specific document types supported may vary depending on the processing pattern used.

## Technical Questions

### What is AWS CDK?

AWS Cloud Development Kit (CDK) is an open-source software development framework for defining cloud infrastructure as code using familiar programming languages. The GenAI IDP Accelerator uses TypeScript for its CDK implementation.

### What are the different processing patterns?

The GenAI IDP Accelerator supports three main processing patterns:

1. **Pattern 1**: Uses Amazon Bedrock Data Automation for document processing with minimal custom code
2. **Pattern 2**: Implements custom extraction logic using Amazon Bedrock foundation models
3. **Pattern 3**: Utilizes custom SageMaker endpoints for specialized document processing tasks

### How do I choose the right processing pattern?

The choice of processing pattern depends on your specific requirements:

- **Pattern 1** is ideal for standard document types with well-defined structures
- **Pattern 2** provides more flexibility for complex document formats
- **Pattern 3** is best for specialized document processing tasks or when you need to use custom ML models

### Can I customize the processing workflow?

Yes, the GenAI IDP Accelerator is designed to be customizable. You can:

- Modify the Step Functions workflow
- Add custom Lambda functions
- Integrate with additional AWS services
- Implement custom document processing logic

### How does the solution scale?

The GenAI IDP Accelerator is built on serverless AWS services, which automatically scale based on demand. The solution can handle from a few documents to millions of documents without manual scaling.

### What are the security considerations?

The GenAI IDP Accelerator implements AWS security best practices, including:

- Least privilege IAM roles
- Encryption of data at rest and in transit
- VPC isolation for sensitive components
- AWS WAF integration for web interface protection
- CloudTrail logging for audit and compliance

## Deployment Questions

### What are the prerequisites for deployment?

To deploy the GenAI IDP Accelerator, you need:

- An AWS account with appropriate permissions
- Node.js and npm/yarn installed
- AWS CDK CLI installed
- Docker for building Lambda functions
- Python for certain components

### How do I deploy the solution?

You can deploy the solution using the AWS CDK CLI:

```bash
# Navigate to the sample directory
cd samples/sample-bda-lending

# Deploy the sample
yarn deploy
```

### How much does it cost to run?

The cost of running the GenAI IDP Accelerator depends on your usage of AWS services. The solution uses serverless services that scale with usage, so you only pay for what you use.

Key cost factors include:

- Number of documents processed
- Size and complexity of documents
- AI/ML services used (Bedrock, Textract, etc.)
- Storage requirements

### How do I monitor the solution?

The GenAI IDP Accelerator includes CloudWatch dashboards and alarms for monitoring:

- Document processing metrics
- Error rates
- Processing latency
- Service health

You can also use AWS X-Ray for tracing and AWS CloudTrail for audit logging.

## Troubleshooting

### Common Deployment Issues

#### CDK Bootstrap Error

If you encounter a CDK bootstrap error:

```bash
# Bootstrap your AWS environment
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

#### Missing Dependencies

If you encounter missing dependencies:

```bash
# Ensure all dependencies are installed
yarn install

# Rebuild the project
yarn build
```

#### Permission Issues

If you encounter permission issues:

```bash
# Check your AWS credentials
aws sts get-caller-identity

# Ensure your IAM user has the necessary permissions
```

#### .NET NuGet Cache Issues

If you encounter build failures when working with .NET redistributable packages, particularly interface compatibility issues between `@cdklabs/genai-idp` and processor packages like `@cdklabs/genai-idp-bda-processor`, this may be due to NuGet caching an older version of the packages.

**Common scenarios:**
- After updating package versions in your project
- When switching between different branches or versions of the codebase
- After pulling updates that include package version changes

**Symptoms:**
- Build errors related to interface mismatches
- Type compatibility issues between core and processor packages
- Errors indicating that a class doesn't implement required interfaces
- Messages like "does not implement interface member" despite correct code

**Solution:**
Clear the NuGet cache to ensure you're using the latest package versions:

```bash
# Clear all NuGet caches (recommended)
dotnet nuget locals all --clear

# Then rebuild your project
dotnet restore
dotnet build
```

**Alternative approaches:**
```bash
# Clear specific cache types if you prefer
dotnet nuget locals http-cache --clear
dotnet nuget locals global-packages --clear
dotnet nuget locals temp --clear

# For persistent issues, also try clearing the project's bin and obj folders
rm -rf bin/ obj/
dotnet restore
dotnet build
```

This issue typically occurs when:
- Package versions have been updated but cached versions persist
- Multiple versions of related packages exist in the cache
- Interface definitions have changed between package versions
- NuGet resolves to cached packages instead of the latest versions specified in your project file

### Runtime Issues

#### Document Processing Failures

If documents fail to process:

- Check the document format and quality
- Verify that the document type is supported
- Check CloudWatch Logs for error messages
- Ensure the AI services have the necessary permissions

#### Performance Issues

If you experience performance issues:

- Monitor Lambda concurrency limits
- Check for throttling on AWS services
- Consider batching documents for processing
- Optimize Lambda function memory allocation

## Support and Resources

### Where can I get help?

If you need help with the GenAI IDP Accelerator:

- Check the documentation in this site
- Review the sample applications
- Open an issue on the GitLab repository
- Contact AWS Support if you have an AWS Support plan

### How can I contribute?

Contributions to the GenAI IDP Accelerator are welcome! See the [Contributing](../contributing/index.md) section for details on how to contribute.

### Where can I find more resources?

Additional resources:

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [Amazon Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [AWS Step Functions Documentation](https://docs.aws.amazon.com/step-functions/)
