# Bedrock LLM processing with Evaluation

This walkthrough guides you through deploying and using the Bedrock LLM Processor sample application, which demonstrates custom extraction using Amazon Bedrock models with evaluation capabilities.

## Overview

The Bedrock LLM sample showcases how to:

- Process documents using custom extraction with Amazon Bedrock models
- Evaluate extraction results against baseline data
- Use different foundation models for classification and extraction
- Track document processing status through a GraphQL API
- View and manage documents through a web interface

## Architecture

The sample deploys the following components:

- S3 buckets for input documents, processing results, and evaluation baselines
- AWS Step Functions workflow for orchestration
- AWS Lambda functions for processing tasks
- Amazon DynamoDB tables for configuration and tracking
- Amazon AppSync GraphQL API for querying processing status
- Amazon CloudFront distribution for the web interface

## Prerequisites

Before you begin, ensure you have:

1. **AWS Account**: With permissions to create the required resources
2. **AWS CLI**: Configured with appropriate credentials
3. **Node.js**: Version 18 or later (use NVM to install the version specified in `.nvmrc`)
4. **AWS CDK**: Version 2.x installed globally
5. **Docker**: For building Lambda functions
6. **Amazon Bedrock Access**: Ensure your account has access to Amazon Bedrock and the required models

## Step 1: Clone the Repository

First, clone the GenAI IDP Accelerator repository and navigate to the sample directory:

=== "Bash"

    ```bash
    git clone https://gitlab.aws.dev/genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator-cdk.git
    cd genaiic-idp-accelerator-cdk/samples/sample-bedrock
    ```
## Step 2: Install Dependencies

Install the required dependencies:

=== "TypeScript"

    ```bash
    # Install the required Node.js version using NVM
    nvm use
    
    # Install dependencies
    yarn install
    ```

=== "Python"

    ```bash
    # Create and activate a virtual environment
    python -m venv .venv
    source .venv/bin/activate
    
    # Install dependencies
    pip install -r requirements.txt
    ```

=== "C#/.NET"

    ```bash
    # Restore NuGet packages
    dotnet restore
    
    # Build the project
    dotnet build
    ```

## Step 3: Bootstrap Your AWS Environment

If you haven't already bootstrapped your AWS environment for CDK, run:

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

Replace `ACCOUNT-NUMBER` with your AWS account number and `REGION` with your preferred AWS region.

## Step 4: Review the Stack Configuration

The main stack is defined in `src/bedrock-llm-stack.ts`. Let's examine the key components:

=== "TypeScript"

    ```typescript linenums="1"
    // src/bedrock-llm-stack.ts
    import {
      ProcessingEnvironment,
      ProcessingEnvironmentApi,
      UserIdentity,
      WebApplication,
      ConfigurationTable,
      TrackingTable,
    } from "@cdklabs/genai-idp";
    import {
      BedrockLlmProcessor,
      BedrockLlmProcessorConfiguration,
    } from "@cdklabs/genai-idp-bedrock-llm-processor";
    import { CfnOutput, RemovalPolicy, Stack } from "aws-cdk-lib";
    import {
      AuthorizationType,
      UserPoolDefaultAction,
    } from "aws-cdk-lib/aws-appsync";
    import {
      GatewayVpcEndpointAwsService,
      InterfaceVpcEndpointAwsService,
      SubnetSelection,
      SubnetType,
      Vpc,
    } from "aws-cdk-lib/aws-ec2";
    import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
    import { Key } from "aws-cdk-lib/aws-kms";
    import { Bucket } from "aws-cdk-lib/aws-s3";
    import { Construct } from "constructs";

    export class BedrockLlmStack extends Stack {
      constructor(scope: Construct, id: string) {
        super(scope, id);

        const metricNamespace = this.stackName;

        // Create VPC with private subnets for secure processing
        const vpc = new Vpc(this, "Vpc", {
          maxAzs: 2,
          createInternetGateway: false,
          subnetConfiguration: [
            {
              cidrMask: 24,
              name: "isolated",
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
          ],
          gatewayEndpoints: {
            S3: {
              service: GatewayVpcEndpointAwsService.S3,
            },
            DDB: {
              service: GatewayVpcEndpointAwsService.DYNAMODB,
            },
          },
        });

        // Add VPC endpoints for AWS services
        vpc.addInterfaceEndpoint("BEDROCK", {
          service: InterfaceVpcEndpointAwsService.BEDROCK,
        });
        vpc.addInterfaceEndpoint("BEDROCKRUNTIME", {
          service: InterfaceVpcEndpointAwsService.BEDROCK_RUNTIME,
        });
        vpc.addInterfaceEndpoint("TEXTRACT", {
          service: InterfaceVpcEndpointAwsService.TEXTRACT,
        });

        const vpcSubnets: SubnetSelection = {
          subnetType: SubnetType.PRIVATE_ISOLATED,
        };

        // Create KMS key for encryption
        const key = new Key(this, "CustomerManagedEncryptionKey");
        key.grantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

        // Create S3 buckets for document processing
        const inputBucket = new Bucket(this, "InputBucket", {
          encryptionKey: key,
          eventBridgeEnabled: true, // Required for event-driven processing
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        const workingBucket = new Bucket(this, "WorkingBucket", {
          encryptionKey: key,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        const outputBucket = new Bucket(this, "OutputBucket", {
          encryptionKey: key,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        // Create user identity for authentication
        const userIdentity = new UserIdentity(this, "UserIdentity");

        // Grant bucket access to authenticated users
        inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
        outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

        // Create DynamoDB tables for configuration and tracking
        const configurationTable = new ConfigurationTable(this, "ConfigurationTable", {
          encryptionKey: key,
        });

        const trackingTable = new TrackingTable(this, "TrackingTable", {
          encryptionKey: key,
        });

        // Create the GraphQL API for document tracking
        const api = new ProcessingEnvironmentApi(this, "EnvApi", {
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

        // Create the processing environment with VPC configuration
        const environment = new ProcessingEnvironment(this, "Environment", {
          key,
          inputBucket,
          outputBucket,
          workingBucket,
          configurationTable,
          trackingTable,
          api,
          metricNamespace,
          vpcConfiguration: {
            vpc,
            vpcSubnets,
          },
        });

        // Create the Bedrock LLM processor with lending configuration
        const processor = new BedrockLlmProcessor(this, "Processor", {
          environment,
          configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
        });

        // Add the processor's state machine to the API
        api.addStateMachine(processor.stateMachine);

        // Grant API permissions to authenticated users
        api.grantQuery(userIdentity.identityPool.authenticatedRole);
        api.grantSubscription(userIdentity.identityPool.authenticatedRole);
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

        // Add the processor's state machine to the API
        api.addStateMachine(processor.stateMachine);

        // Grant API permissions to authenticated users
        api.grantQuery(userIdentity.identityPool.authenticatedRole);
        api.grantSubscription(userIdentity.identityPool.authenticatedRole);

        // Create web application for document management
        const webApplication = new WebApplication(this, "WebApp", {
          webAppBucket: new Bucket(this, "webAppBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "index.html",
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
          }),
          userIdentity,
          environment,
          api,
        });

        // Output the web application URL
        new CfnOutput(this, "WebSiteUrl", {
          value: `https://${webApplication.distribution.distributionDomainName}`,
          description: "URL of the web application for document management",
        });
      }
    }
    ```

=== "Python"

    ```python linenums="1"
    # src/bedrock_llm_stack.py
    from aws_cdk import (
        Stack,
        RemovalPolicy,
        CfnOutput,
    )
    from aws_cdk.aws_s3 import Bucket
    from aws_cdk.aws_kms import Key
    from aws_cdk.aws_iam import ServicePrincipal
    from aws_cdk.aws_ec2 import (
        Vpc,
        SubnetType,
        SubnetSelection,
        GatewayVpcEndpointAwsService,
        InterfaceVpcEndpointAwsService,
    )
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
        TrackingTable,
    )
    from cdklabs.genai_idp_bedrock_llm_processor import (
        BedrockLlmProcessor,
        BedrockLlmProcessorConfiguration
    )
    from constructs import Construct

    class BedrockLlmStack(Stack):
        def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
            super().__init__(scope, construct_id, **kwargs)

            # Create S3 buckets for document processing
            input_bucket = Bucket(
                self, "InputBucket",
                event_bridge_enabled=True,
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

            output_bucket = Bucket(
                self, "OutputBucket",
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

            working_bucket = Bucket(
                self, "WorkingBucket",
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

            evaluation_baseline_bucket = Bucket(
                self, "EvaluationBaselineBucket",
                removal_policy=RemovalPolicy.DESTROY,
                auto_delete_objects=True
            )

    # Create DynamoDB tables for configuration and tracking
    configuration_table = ConfigurationTable(
        self, "ConfigurationTable",
        encryption_key=key
    )

    tracking_table = TrackingTable(
        self, "TrackingTable",
        encryption_key=key
    )

    # Create the processing environment
    environment = ProcessingEnvironment(
        self, "Environment",
        metric_namespace=self.stack_name,
        input_bucket=input_bucket,
        output_bucket=output_bucket,
        working_bucket=working_bucket,
        configuration_table=configuration_table,
        tracking_table=tracking_table
    )

    # Create the Bedrock LLM processor with evaluation
    BedrockLlmProcessor(
        self, "Processor",
        environment=environment,
        evaluation_enabled=True,
        evaluation_baseline_bucket=evaluation_baseline_bucket,
        is_summarization_enabled=True,
        # Optional: Customize with additional settings
        # classification_max_workers=10,
        # ocr_max_workers=10,
        # classification_guardrail=my_guardrail,
        # extraction_guardrail=my_guardrail,
        # summarization_guardrail=my_guardrail,
    )
    ```

=== "C#/.NET"

    ```csharp linenums="1"
    // src/BedrockLlmStack.cs
    using Amazon.CDK;
    using Amazon.CDK.AWS.S3;
    using Amazon.CDK.AWS.KMS;
    using Amazon.CDK.AWS.IAM;
    using Amazon.CDK.AWS.EC2;
    using Amazon.CDK.AWS.AppSync;
    using Cdklabs.GenaiIdp;
    using Cdklabs.GenaiIdpBedrockLlmProcessor;
    using Constructs;

    namespace BedrockLlm
    {
        public class BedrockLlmStack : Stack
        {
            public BedrockLlmStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
            {
                // Create S3 buckets for document processing
                var inputBucket = new Bucket(this, "InputBucket", new BucketProps
                {
                    EventBridgeEnabled = true,
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

                var outputBucket = new Bucket(this, "OutputBucket", new BucketProps
                {
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

                var workingBucket = new Bucket(this, "WorkingBucket", new BucketProps
                {
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

                var evaluationBaselineBucket = new Bucket(this, "EvaluationBaselineBucket", new BucketProps
                {
                    RemovalPolicy = RemovalPolicy.DESTROY,
                    AutoDeleteObjects = true
                });

    // Create DynamoDB tables for configuration and tracking
    var configurationTable = new ConfigurationTable(this, "ConfigurationTable", new ConfigurationTableProps
    {
        EncryptionKey = key
    });

    var trackingTable = new TrackingTable(this, "TrackingTable", new TrackingTableProps
    {
        EncryptionKey = key
    });

    // Create the processing environment
    var environment = new ProcessingEnvironment(this, "Environment", new ProcessingEnvironmentProps
    {
        MetricNamespace = this.StackName,
        InputBucket = inputBucket,
        OutputBucket = outputBucket,
        WorkingBucket = workingBucket,
        ConfigurationTable = configurationTable,
        TrackingTable = trackingTable
    });

    // Create the Bedrock LLM processor with evaluation
    new BedrockLlmProcessor(this, "Processor", new BedrockLlmProcessorProps
    {
        Environment = environment,
        EvaluationEnabled = true,
        EvaluationBaselineBucket = evaluationBaselineBucket,
        IsSummarizationEnabled = true,
        // Optional: Customize with additional settings
        // ClassificationMaxWorkers = 10,
        // OcrMaxWorkers = 10,
        // ClassificationGuardrail = myGuardrail,
        // ExtractionGuardrail = myGuardrail,
        // SummarizationGuardrail = myGuardrail,
    });
    ```
## Step 5: Deploy the Stack

Deploy the stack to your AWS account:

=== "TypeScript"

    ```bash
    # Install dependencies
    yarn install
    
    # Build the project
    yarn build
    
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

The deployment will take several minutes. Once complete, the command will output the necessary resource information.

## Step 6: Configure Bedrock Model Access

Ensure you have access to the required Bedrock models:

1. Go to the [Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Request access to the models used by the solution (e.g., Claude 3.5 Sonnet)
4. Wait for access approval (usually immediate for most models)

## Step 7: Upload Evaluation Baseline Documents

For evaluation to work properly, you need to upload baseline documents to the evaluation baseline bucket:

1. Prepare your baseline documents with expected extraction results
2. Upload them to the evaluation baseline bucket:

```bash
aws s3 cp baseline-document.json s3://YOUR-EVALUATION-BASELINE-BUCKET/
```

The baseline documents should follow this structure:

```json
{
  "documentId": "unique-document-id",
  "expectedResults": {
    "field1": "expected value 1",
    "field2": "expected value 2",
    "field3": {
      "nestedField": "nested value"
    }
  }
}
```

## Step 8: Test the Solution

Now you can test the solution by uploading a sample document:

1. Upload a document to the input bucket:

```bash
aws s3 cp sample-document.pdf s3://YOUR-INPUT-BUCKET-NAME/
```

2. The document processing will start automatically. You can monitor the progress in the AWS Step Functions console.

3. Once processing is complete, you can retrieve the results from the output bucket:

```bash
aws s3 ls s3://YOUR-OUTPUT-BUCKET-NAME/
```

## Step 9: Review Evaluation Results

After processing is complete, you can review the evaluation results:

1. Navigate to the output bucket in the S3 console
2. Find the processed document folder
3. Open the evaluation results file
4. Review the comparison between extracted data and baseline data

The evaluation results include:
- Accuracy metrics for each extracted field
- Overall extraction quality score
- Suggestions for improving extraction quality

## Step 10: Customize Extraction Schema

You can customize the extraction schema to target specific fields in your documents:

1. Locate the DynamoDB configuration table created by the stack
2. Update the schema configuration item with your custom schema
3. The schema should define the fields to extract and their expected formats

Example schema:

```json
{
  "schema": {
    "Invoice": {
      "fields": [
        {"name": "invoiceNumber", "description": "The invoice number"},
        {"name": "date", "description": "The invoice date"},
        {"name": "totalAmount", "description": "The total invoice amount"},
        {"name": "vendor", "description": "The vendor name"}
      ]
    },
    "Receipt": {
      "fields": [
        {"name": "merchantName", "description": "The merchant name"},
        {"name": "date", "description": "The receipt date"},
        {"name": "totalAmount", "description": "The total amount"},
        {"name": "items", "description": "List of purchased items"}
      ]
    }
  }
}
```

## Step 11: Monitor Processing

You can monitor the document processing in several ways:

1. **AWS Step Functions Console**: Monitor workflow executions
2. **CloudWatch Logs**: View detailed processing logs
3. **DynamoDB Tables**: Check the tracking table for processing status
4. **GraphQL API**: Query processing status programmatically

## Step 12: Clean Up

When you're done experimenting, you can clean up all resources to avoid incurring charges:

```bash
cdk destroy
```

## Next Steps

Now that you have a working Bedrock LLM Processor solution with evaluation, consider:

- Refining your extraction schemas for better accuracy
- Creating more comprehensive baseline documents for evaluation
- Implementing custom post-processing logic for the extracted data
- Integrating the solution with your existing systems
- Exploring different foundation models for classification and extraction

For more information, refer to the [Amazon Bedrock documentation](https://docs.aws.amazon.com/bedrock/) and the [GenAI IDP Accelerator documentation](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws).
