# Getting Started with GenAI IDP Accelerator

This guide will walk you through setting up and deploying your first Intelligent Document Processing (IDP) solution using the GenAI IDP Accelerator CDK packages. By the end of this guide, you'll have a fully functional document processing pipeline capable of transforming unstructured documents into structured data.

## Prerequisites

Before you begin, ensure you have the following prerequisites installed and configured:

=== "TypeScript"

    - [Node.js](https://nodejs.org/)
    - [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
    - [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) (`npm install -g aws-cdk`)
    - [Docker](https://www.docker.com/products/docker-desktop/) for building Lambda functions

=== "Python"

    - [Node.js](https://nodejs.org/)
    - [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
    - [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) (`npm install -g aws-cdk`)
    - [Docker](https://www.docker.com/products/docker-desktop/) for building Lambda functions
    - [Python](https://www.python.org/)

=== "C#/.NET"

    - [Node.js](https://nodejs.org/)
    - [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
    - [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) (`npm install -g aws-cdk`)
    - [Docker](https://www.docker.com/products/docker-desktop/) for building Lambda functions
    - [.NET SDK](https://dotnet.microsoft.com/download)

## Step 1: Set Up Your Development Environment

First, let's set up your development environment with the correct tools:

=== "TypeScript"

    ```bash
    # Install AWS CDK globally
    npm install -g aws-cdk
    
    # Initialize a new CDK project
    mkdir my-idp-project && cd my-idp-project
    cdk init app --language=typescript
    ```

=== "Python"

    ```bash
    # Install AWS CDK globally
    npm install -g aws-cdk
        
    # Initialize a new CDK project
    mkdir my-idp-project && cd my-idp-project
    cdk init app --language=python

    # Create and activate a virtual environment
    python -m venv .venv
    source .venv/bin/activate    
    ```

=== "C#/.NET"

    ```bash
    # Install AWS CDK globally
    npm install -g aws-cdk
    
    # Initialize a new CDK project
    mkdir my-idp-project && cd my-idp-project
    cdk init app --language=csharp
    
    # Open the solution in your preferred IDE
    # For Visual Studio Code:
    code .
    
    # For Visual Studio:
    start MyIdpProject.sln
    ```

## Step 2: Install GenAI IDP Packages

Now, let's install the GenAI IDP packages that we'll need for our document processing solution:

=== "TypeScript"

    ```bash
    # Install core IDP package and the Bedrock LLM processor
    npm install @cdklabs/genai-idp @cdklabs/genai-idp-bedrock-llm-processor
    ```

=== "Python"

    ```bash
    # Install core IDP package and the Bedrock LLM processor
    pip install cdklabs.genai-idp cdklabs.genai-idp-bedrock-llm-processor
    ```

=== "C#/.NET"

    ```bash
    # Add the NuGet packages to your project
    dotnet add src/MyIdpProject package Cdklabs.GenaiIdp
    dotnet add src/MyIdpProject package Cdklabs.GenaiIdpBedrockLlmProcessor
    ```

## Step 3: Bootstrap Your AWS Environment

If you haven't already bootstrapped your AWS environment for CDK, run:

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

Replace `ACCOUNT-NUMBER` with your AWS account number and `REGION` with your preferred AWS region.

## Step 4: Create Your IDP Stack

Now, let's create the core infrastructure for our document processing solution. We'll modify the main stack file to include the GenAI IDP components:

=== "TypeScript"

    ```typescript linenums="1"
    // lib/my-idp-project-stack.ts
    import * as cdk from 'aws-cdk-lib';
    import { Construct } from 'constructs';
    import { Bucket, RemovalPolicy } from 'aws-cdk-lib/aws-s3';
    import { Key } from 'aws-cdk-lib/aws-kms';
    import { ServicePrincipal } from 'aws-cdk-lib/aws-iam';
    import { 
      ProcessingEnvironment, 
      ProcessingEnvironmentApi,
      UserIdentity,
      WebApplication,
      ConfigurationTable,
      TrackingTable
    } from '@cdklabs/genai-idp';
    import { 
      BedrockLlmProcessor,
      BedrockLlmProcessorConfiguration 
    } from '@cdklabs/genai-idp-bedrock-llm-processor';
    import { 
      AuthorizationType,
      UserPoolDefaultAction 
    } from 'aws-cdk-lib/aws-appsync';

    export class MyIdpProjectStack extends cdk.Stack {
      constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const metricNamespace = this.stackName;

        // Create KMS key for encryption
        const key = new Key(this, 'CustomerManagedEncryptionKey');
        key.grantEncryptDecrypt(new ServicePrincipal('logs.amazonaws.com'));

        // Create S3 buckets for document processing
        const inputBucket = new Bucket(this, 'InputBucket', {
          encryptionKey: key,
          eventBridgeEnabled: true, // Required for event-driven processing
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        const outputBucket = new Bucket(this, 'OutputBucket', {
          encryptionKey: key,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        const workingBucket = new Bucket(this, 'WorkingBucket', {
          encryptionKey: key,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        // Create user identity for authentication
        const userIdentity = new UserIdentity(this, 'UserIdentity');

        // Grant bucket access to authenticated users
        inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
        outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

        // Create DynamoDB tables for configuration and tracking
        const configurationTable = new ConfigurationTable(this, 'ConfigurationTable', {
          encryptionKey: key,
        });

        const trackingTable = new TrackingTable(this, 'TrackingTable', {
          encryptionKey: key,
        });

        // Create the GraphQL API for document tracking
        const api = new ProcessingEnvironmentApi(this, 'EnvApi', {
          inputBucket,
          outputBucket,
          encryptionKey: key,
          configurationTable,
          trackingTable,
          authorizationConfig: {
            defaultAuthorization: {
              authorizationType: AuthorizationType.USER_POOL,
              userPoolConfig: {
                userPool: userIdentity.userPool,
                defaultAction: UserPoolDefaultAction.ALLOW,
              },
            },
            additionalAuthorizationModes: [
              {
                authorizationType: AuthorizationType.IAM,
              },
            ],
          },
        });

        // Create the processing environment
        const environment = new ProcessingEnvironment(this, 'Environment', {
          key,
          inputBucket,
          outputBucket,
          workingBucket,
          configurationTable,
          trackingTable,
          api,
          metricNamespace,
        });

        // Create the document processor using Bedrock LLM processor
        // This uses a sample configuration - for custom configurations, use BedrockLlmProcessorConfiguration.fromFile()
        const processor = new BedrockLlmProcessor(this, 'Processor', {
          environment,
          configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
          // Optional: Customize the processor with additional settings
          // classificationMaxWorkers: 10,
          // ocrMaxWorkers: 10,
          // evaluationBaselineBucket: new Bucket(this, 'BaselineBucket'),
        });

        // Add the processor's state machine to the API
        api.addStateMachine(processor.stateMachine);

        // Grant API permissions to authenticated users
        api.grantQuery(userIdentity.identityPool.authenticatedRole);
        api.grantSubscription(userIdentity.identityPool.authenticatedRole);

        // Create web application for document management
        const webApplication = new WebApplication(this, 'WebApp', {
          webAppBucket: new Bucket(this, 'WebAppBucket', {
            websiteIndexDocument: 'index.html',
            websiteErrorDocument: 'index.html',
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
          }),
          userIdentity,
          environment,
          apiUrl: api.graphqlUrl,
        });

        // Output the important values
        new cdk.CfnOutput(this, 'InputBucketName', {
          value: inputBucket.bucketName,
          description: 'Name of the input bucket where documents should be uploaded',
        });

        new cdk.CfnOutput(this, 'OutputBucketName', {
          value: outputBucket.bucketName,
          description: 'Name of the output bucket where processed results will be stored',
        });

        new cdk.CfnOutput(this, 'WebSiteUrl', {
          value: `https://${webApplication.distribution.distributionDomainName}`,
          description: 'URL of the web application for document management',
        });
      }
    }
    ```

=== "Python"

    ```python linenums="1"
    # my_idp_project/my_idp_project_stack.py
    from aws_cdk import (
        Stack,
        RemovalPolicy,
        CfnOutput,
    )
    from aws_cdk.aws_s3 import Bucket
    from aws_cdk.aws_kms import Key
    from aws_cdk.aws_iam import ServicePrincipal
    from aws_cdk.aws_appsync import (
        AuthorizationType,
        UserPoolDefaultAction
    )
    from cdklabs.genai_idp import (
        ProcessingEnvironment,
        ProcessingEnvironmentApi,
        UserIdentity,
        WebApplication,
        ConfigurationTable,
        TrackingTable
    )
    from cdklabs.genai_idp_bedrock_llm_processor import (
        BedrockLlmProcessor,
        BedrockLlmProcessorConfiguration
    )
    from constructs import Construct

    class MyIdpProjectStack(Stack):
        def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
            super().__init__(scope, construct_id, **kwargs)

            metric_namespace = self.stack_name

            # Create KMS key for encryption
            key = Key(self, "CustomerManagedEncryptionKey")
            key.grant_encrypt_decrypt(ServicePrincipal("logs.amazonaws.com"))

            # Create S3 buckets for document processing
            input_bucket = Bucket(
                self, "InputBucket",
                encryption_key=key,
                event_bridge_enabled=True,  # Required for event-driven processing
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

            output_bucket = Bucket(
                self, "OutputBucket",
                encryption_key=key,
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

            working_bucket = Bucket(
                self, "WorkingBucket",
                encryption_key=key,
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

            # Create user identity for authentication
            user_identity = UserIdentity(self, "UserIdentity")

            # Grant bucket access to authenticated users
            input_bucket.grant_read(user_identity.identity_pool.authenticated_role)
            output_bucket.grant_read(user_identity.identity_pool.authenticated_role)

            # Create DynamoDB tables for configuration and tracking
            configuration_table = ConfigurationTable(
                self, "ConfigurationTable",
                encryption_key=key
            )

            tracking_table = TrackingTable(
                self, "TrackingTable",
                encryption_key=key
            )

            # Create the GraphQL API for document tracking
            api = ProcessingEnvironmentApi(
                self, "EnvApi",
                input_bucket=input_bucket,
                output_bucket=output_bucket,
                encryption_key=key,
                configuration_table=configuration_table,
                tracking_table=tracking_table,
                authorization_config={
                    "default_authorization": {
                        "authorization_type": AuthorizationType.USER_POOL,
                        "user_pool_config": {
                            "user_pool": user_identity.user_pool,
                            "default_action": UserPoolDefaultAction.ALLOW,
                        },
                    },
                    "additional_authorization_modes": [
                        {
                            "authorization_type": AuthorizationType.IAM,
                        },
                    ],
                },
            )

            # Create the processing environment
            environment = ProcessingEnvironment(
                self, "Environment",
                key=key,
                input_bucket=input_bucket,
                output_bucket=output_bucket,
                working_bucket=working_bucket,
                configuration_table=configuration_table,
                tracking_table=tracking_table,
                api=api,
                metric_namespace=metric_namespace
            )

            # Create the document processor using Bedrock LLM processor
            # This uses a sample configuration - for custom configurations, use BedrockLlmProcessorConfiguration.from_file()
            processor = BedrockLlmProcessor(
                self, "Processor",
                environment=environment,
                configuration=BedrockLlmProcessorConfiguration.lending_package_sample(),
                # Optional: Customize the processor with additional settings
                # classification_max_workers=10,
                # ocr_max_workers=10,
                # evaluation_baseline_bucket=Bucket(self, "BaselineBucket"),
            )

            # Add the processor's state machine to the API
            api.add_state_machine(processor.state_machine)

            # Grant API permissions to authenticated users
            api.grant_query(user_identity.identity_pool.authenticated_role)
            api.grant_subscription(user_identity.identity_pool.authenticated_role)

            # Create web application for document management
            web_application = WebApplication(
                self, "WebApp",
                web_app_bucket=Bucket(
                    self, "WebAppBucket",
                    website_index_document="index.html",
                    website_error_document="index.html",
                    removal_policy=RemovalPolicy.DESTROY,
                    auto_delete_objects=True,
                ),
                user_identity=user_identity,
                environment=environment,
                api_url=api.graphql_url,
            )

            # Output the important values
            CfnOutput(
                self, "InputBucketName",
                value=input_bucket.bucket_name,
                description="Name of the input bucket where documents should be uploaded"
            )

            CfnOutput(
                self, "OutputBucketName",
                value=output_bucket.bucket_name,
                description="Name of the output bucket where processed results will be stored"
            )

            CfnOutput(
                self, "WebSiteUrl",
                value=f"https://{web_application.distribution.distribution_domain_name}",
                description="URL of the web application for document management"
            )
    ```

=== "C#/.NET"

    ```csharp linenums="1"
    // src/MyIdpProject/MyIdpProjectStack.cs
    using Amazon.CDK;
    using Amazon.CDK.AWS.S3;
    using Amazon.CDK.AWS.KMS;
    using Amazon.CDK.AWS.IAM;
    using Amazon.CDK.AWS.AppSync;
    using Cdklabs.GenaiIdp;
    using Cdklabs.GenaiIdpBedrockLlmProcessor;
    using Constructs;

    namespace MyIdpProject
    {
        public class MyIdpProjectStack : Stack
        {
            public MyIdpProjectStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
            {
                var metricNamespace = this.StackName;

                // Create KMS key for encryption
                var key = new Key(this, "CustomerManagedEncryptionKey");
                key.GrantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

                // Create S3 buckets for document processing
                var inputBucket = new Bucket(this, "InputBucket", new BucketProps
                {
                    EncryptionKey = key,
                    EventBridgeEnabled = true, // Required for event-driven processing
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

                var outputBucket = new Bucket(this, "OutputBucket", new BucketProps
                {
                    EncryptionKey = key,
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

                var workingBucket = new Bucket(this, "WorkingBucket", new BucketProps
                {
                    EncryptionKey = key,
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

                // Create user identity for authentication
                var userIdentity = new UserIdentity(this, "UserIdentity");

                // Grant bucket access to authenticated users
                inputBucket.GrantRead(userIdentity.IdentityPool.AuthenticatedRole);
                outputBucket.GrantRead(userIdentity.IdentityPool.AuthenticatedRole);

                // Create DynamoDB tables for configuration and tracking
                var configurationTable = new ConfigurationTable(this, "ConfigurationTable", new ConfigurationTableProps
                {
                    EncryptionKey = key
                });

                var trackingTable = new TrackingTable(this, "TrackingTable", new TrackingTableProps
                {
                    EncryptionKey = key
                });

                // Create the GraphQL API for document tracking
                var api = new ProcessingEnvironmentApi(this, "EnvApi", new ProcessingEnvironmentApiProps
                {
                    InputBucket = inputBucket,
                    OutputBucket = outputBucket,
                    EncryptionKey = key,
                    ConfigurationTable = configurationTable,
                    TrackingTable = trackingTable,
                    AuthorizationConfig = new AuthorizationConfig
                    {
                        DefaultAuthorization = new AuthorizationMode
                        {
                            AuthorizationType = AuthorizationType.USER_POOL,
                            UserPoolConfig = new UserPoolConfig
                            {
                                UserPool = userIdentity.UserPool,
                                DefaultAction = UserPoolDefaultAction.ALLOW,
                            },
                        },
                        AdditionalAuthorizationModes = new[]
                        {
                            new AuthorizationMode
                            {
                                AuthorizationType = AuthorizationType.IAM,
                            },
                        },
                    },
                });

                // Create the processing environment
                var environment = new ProcessingEnvironment(this, "Environment", new ProcessingEnvironmentProps
                {
                    Key = key,
                    InputBucket = inputBucket,
                    OutputBucket = outputBucket,
                    WorkingBucket = workingBucket,
                    ConfigurationTable = configurationTable,
                    TrackingTable = trackingTable,
                    Api = api,
                    MetricNamespace = metricNamespace
                });

                // Create the document processor using Bedrock LLM processor
                // This uses a sample configuration - for custom configurations, use BedrockLlmProcessorConfiguration.FromFile()
                var processor = new BedrockLlmProcessor(this, "Processor", new BedrockLlmProcessorProps
                {
                    Environment = environment,
                    Configuration = BedrockLlmProcessorConfiguration.LendingPackageSample(),
                    // Optional: Customize the processor with additional settings
                    // ClassificationMaxWorkers = 10,
                    // OcrMaxWorkers = 10,
                    // EvaluationBaselineBucket = new Bucket(this, "BaselineBucket"),
                });

                // Add the processor's state machine to the API
                api.AddStateMachine(processor.StateMachine);

                // Grant API permissions to authenticated users
                api.GrantQuery(userIdentity.IdentityPool.AuthenticatedRole);
                api.GrantSubscription(userIdentity.IdentityPool.AuthenticatedRole);

                // Create web application for document management
                var webApplication = new WebApplication(this, "WebApp", new WebApplicationProps
                {
                    WebAppBucket = new Bucket(this, "WebAppBucket", new BucketProps
                    {
                        WebsiteIndexDocument = "index.html",
                        WebsiteErrorDocument = "index.html",
                        RemovalPolicy = RemovalPolicy.DESTROY,
                        AutoDeleteObjects = true
                    }),
                    UserIdentity = userIdentity,
                    Environment = environment,
                    ApiUrl = api.GraphqlUrl,
                });

                // Output the important values
                new CfnOutput(this, "InputBucketName", new CfnOutputProps
                {
                    Value = inputBucket.BucketName,
                    Description = "Name of the input bucket where documents should be uploaded"
                });

                new CfnOutput(this, "OutputBucketName", new CfnOutputProps
                {
                    Value = outputBucket.BucketName,
                    Description = "Name of the output bucket where processed results will be stored"
                });

                new CfnOutput(this, "WebSiteUrl", new CfnOutputProps
                {
                    Value = $"https://{webApplication.Distribution.DistributionDomainName}",
                    Description = "URL of the web application for document management"
                });
            }
        }
    }
    ```

## Step 5: Deploy Your IDP Solution

Now that we've defined our IDP stack, let's deploy it to AWS:

=== "TypeScript"

    ```bash
    # Install dependencies
    npm install
    
    # Build the project
    npm run build
    
    # Deploy the stack
    cdk deploy
    ```

=== "Python"

    ```bash
    # Install dependencies
    pip install -r requirements.txt
    
    # Deploy the stack
    cdk deploy
    ```

=== "C#/.NET"

    ```bash
    # Build the project
    dotnet build
    
    # Deploy the stack
    cdk deploy
    ```

The deployment process will take several minutes as it creates all the necessary AWS resources, including:

- S3 buckets for input and output
- Lambda functions for document processing
- Step Functions workflow for orchestration
- DynamoDB tables for tracking and configuration
- IAM roles and policies
- AppSync GraphQL API for querying document status

Once deployment is complete, note the output values for your input and output bucket names.

## Step 6: Configure Bedrock Model Access

Before you can use the IDP solution, you need to ensure you have access to the Bedrock models used in your stack:

1. Go to the [Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Request access to the models you're using (e.g., Anthropic Claude 3.5 Sonnet)
4. Wait for access approval (usually immediate for most models)

## Step 7: Test Your IDP Solution

Now that your IDP solution is deployed, let's test it with a sample document:

### Using the Web Application

1. **Access the Web Application**: Open the WebSiteUrl from the deployment outputs in your browser
2. **Sign Up/Sign In**: Create a new account or sign in with existing credentials
3. **Upload a Document**: Use the web interface to upload a sample document
4. **Monitor Processing**: Watch the real-time status updates as your document is processed
5. **View Results**: Once processing is complete, view the extracted structured data

### Using AWS CLI

Alternatively, you can test using the AWS CLI:

1. **Upload a document to the input bucket**:
```bash
aws s3 cp sample-document.pdf s3://YOUR-INPUT-BUCKET-NAME/
```

2. **Monitor the processing** in the AWS Step Functions console or through the GraphQL API

3. **Retrieve the results** from the output bucket:
```bash
aws s3 ls s3://YOUR-OUTPUT-BUCKET-NAME/
aws s3 cp s3://YOUR-OUTPUT-BUCKET-NAME/processed-results.json ./
```

### Expected Output Structure

The output will include:
- **Extracted text** from the document (OCR results)
- **Structured JSON data** with extracted fields based on your configuration
- **Document classification** results (document type, confidence scores)
- **Processing metadata** (timestamps, processing duration, etc.)
- **Document summary** (if summarization is enabled)

### GraphQL API Testing

You can also query the processing status using the GraphQL API:

```graphql
query GetDocumentStatus($documentId: String!) {
  getDocument(documentId: $documentId) {
    id
    status
    createdAt
    updatedAt
    extractedData
    classification
  }
}
```

## Step 8: Clean Up Resources

When you're done experimenting with your IDP solution, you can clean up all resources to avoid incurring charges:

```bash
cdk destroy
```

## Next Steps

Now that you have a working IDP solution, consider exploring these advanced topics:

### Advanced Configuration
- **Custom Document Schemas**: Define custom extraction schemas for your specific document types
- **Model Selection**: Choose different Bedrock models for classification and extraction
- **Guardrails**: Implement Bedrock guardrails for content filtering and safety
- **Evaluation**: Set up evaluation baselines to measure extraction accuracy

### Integration and Automation
- **API Integration**: Connect your IDP solution to existing business systems
- **Workflow Automation**: Integrate with business process management systems
- **Data Pipeline**: Set up automated data pipelines for processed documents
- **Notifications**: Configure alerts and notifications for processing events

### Security and Compliance
- **VPC Isolation**: Deploy processing components within a VPC for enhanced security
- **Encryption**: Implement end-to-end encryption for sensitive documents
- **Access Control**: Fine-tune IAM roles and policies for least privilege access
- **Audit Logging**: Enable comprehensive logging for compliance requirements

### Monitoring and Optimization
- **CloudWatch Dashboards**: Create custom dashboards for monitoring processing metrics
- **Cost Optimization**: Analyze and optimize costs for your specific workload
- **Performance Tuning**: Adjust concurrency limits and resource allocation
- **Error Handling**: Implement robust error handling and retry mechanisms

### Human-in-the-Loop (HITL)
- **Review Workflows**: Set up human review processes for low-confidence extractions
- **Quality Assurance**: Implement quality control checkpoints in your processing pipeline
- **Feedback Loops**: Create mechanisms to improve model performance based on human feedback

### Scaling and Production
- **Multi-Region Deployment**: Deploy across multiple AWS regions for high availability
- **Load Testing**: Test your solution with production-level document volumes
- **Disaster Recovery**: Implement backup and recovery procedures
- **CI/CD Pipeline**: Set up automated deployment pipelines for updates

### Sample Applications
Explore the provided sample applications to see different implementation patterns:
- **BDA Lending Sample**: Standard document processing with minimal code
- **Bedrock LLM Sample**: Custom extraction with VPC isolation
- **SageMaker UDOP Sample**: Specialized classification with custom models

For more detailed information, check out:
- [Developer Guides](../walkthroughs/)
- [API Reference Documentation](../api-reference/)
- [GenAI IDP Accelerator Repository](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws)

Happy document processing!
