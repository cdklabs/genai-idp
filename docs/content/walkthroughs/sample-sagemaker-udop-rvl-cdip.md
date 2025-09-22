# RVL-CDIP Document Classification with SageMaker

This walkthrough guides you through deploying and using the SageMaker UDOP Processor sample application, which demonstrates specialized document processing using a fine-tuned Hugging Face RVL-CDIP model deployed on Amazon SageMaker.

## Overview

The SageMaker UDOP RVL-CDIP sample showcases how to:

- Classify documents using a fine-tuned RVL-CDIP model on SageMaker
- Process domain-specific documents that require specialized classification
- Extract information using Amazon Bedrock foundation models
- Track document processing status through a GraphQL API
- View and manage documents through a web interface

## Architecture

The sample deploys the following components:

- S3 buckets for input documents and processing results
- Amazon SageMaker endpoint for document classification
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
7. **SageMaker Quota**: Ensure you have sufficient quota for the required SageMaker instance types (g5.2xlarge)

## Step 1: Clone the Repository

First, clone the GenAI IDP Accelerator repository and navigate to the sample directory:

=== "Bash"

    ```bash
    git clone https://gitlab.aws.dev/genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator-cdk.git
    cd genaiic-idp-accelerator-cdk/samples/sample-sagemaker-udop-rvl-cdip
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

The main stack is defined in `src/rvl-cdip-stack.ts`. Let's examine the key components:

=== "TypeScript"

    ```typescript linenums="1"
    // src/rvl-cdip-stack.ts
    import { InstanceType } from "@aws-cdk/aws-sagemaker-alpha";
    import {
      ProcessingEnvironment,
      ProcessingEnvironmentApi,
      UserIdentity,
      WebApplication,
      ConfigurationTable,
      TrackingTable,
    } from "@cdklabs/genai-idp";
    import {
      SagemakerUdopProcessor,
      SagemakerClassifier,
      SagemakerUdopProcessorConfiguration,
    } from "@cdklabs/genai-idp-sagemaker-udop-processor";
    import { CfnOutput, RemovalPolicy, Stack } from "aws-cdk-lib";
    import {
      AuthorizationType,
      UserPoolDefaultAction,
    } from "aws-cdk-lib/aws-appsync";
    import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
    import { Key } from "aws-cdk-lib/aws-kms";
    import { Bucket } from "aws-cdk-lib/aws-s3";
    import { Construct } from "constructs";
    import { RvlCdipModel } from "./rvl-cdip-model";

    export class RvlCdipStack extends Stack {
      constructor(scope: Construct, id: string) {
        super(scope, id);

        const metricNamespace = this.stackName;

        // Create KMS key for encryption
        const key = new Key(this, "Key");
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

        // Create the RVL-CDIP model for document classification
        const { modelData } = new RvlCdipModel(this, "RvlCdipModel");

        // Create SageMaker classifier with the RVL-CDIP model
        const classifier = new SagemakerClassifier(this, "RvlCdipClassifier", {
          key,
          outputBucket,
          modelData,
          instanceType: InstanceType.G5_2XLARGE, // GPU instance for model inference
        });

        // Create DynamoDB tables for configuration and tracking
        const configurationTable = new ConfigurationTable(this, "ConfigurationTable", {
          encryptionKey: key,
        });

        const trackingTable = new TrackingTable(this, "TrackingTable", {
          encryptionKey: key,
        });

        // Create the GraphQL API for document tracking
        const api = new ProcessingEnvironmentApi(this, "EnvironmentApi", {
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
        const environment = new ProcessingEnvironment(this, "Environment", {
          key,
          inputBucket,
          outputBucket,
          workingBucket,
          configurationTable,
          trackingTable,
          api,
          metricNamespace,
        });

        // Create the SageMaker UDOP processor with RVL-CDIP configuration
        const processor = new SagemakerUdopProcessor(this, "Processor", {
          environment,
          classifier,
          configuration: SagemakerUdopProcessorConfiguration.rvlCdipPackageSample()
        });

        // Add the processor's state machine to the API
        api.addStateMachine(processor.stateMachine);

        // Grant API permissions to authenticated users
        api.grantQuery(userIdentity.identityPool.authenticatedRole);
        api.grantSubscription(userIdentity.identityPool.authenticatedRole);

        // Add the processor's state machine to the API
        api.addStateMachine(processor.stateMachine);

        // Grant API permissions to authenticated users
        api.grantQuery(userIdentity.identityPool.authenticatedRole);
        api.grantSubscription(userIdentity.identityPool.authenticatedRole);

        // Create web application for document management
        const webApplication = new WebApplication(this, "WebApp", {
          webAppBucket: new Bucket(this, "WebAppBucket", {
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
    # src/rvl_cdip_stack.py
    from aws_cdk import (
        Stack,
        RemovalPolicy,
        CfnOutput,
    )
    from aws_cdk.aws_s3 import Bucket
    from aws_cdk.aws_kms import Key
    from aws_cdk.aws_iam import ServicePrincipal
    from aws_cdk.aws_ec2 import InstanceType
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
    from cdklabs.genai_idp_sagemaker_udop_processor import (
        SagemakerUdopProcessor,
        BedrockFoundationModel
    )
    from constructs import Construct

    class RvlCdipStack(Stack):
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
                event_bridge_enabled=True,
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

    # Create DynamoDB tables for configuration and tracking
    configuration_table = ConfigurationTable(
        self, "ConfigurationTable",
        encryption_key=key
    )

    tracking_table = TrackingTable(
        self, "TrackingTable",
        encryption_key=key
    )

    # Create the RVL-CDIP model
    model = RvlCdipModel(self, "RvlCdipModel")
    model_data = model.model_data

    # Create the SageMaker classifier
    classifier = SagemakerClassifier(
        self, "RvlCdipClassifier",
        key=key,
        output_bucket=output_bucket,
        model_data=model_data,
        instance_type=InstanceType.G5_2XLARGE
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

    # Create the SageMaker UDOP processor
    SagemakerUdopProcessor(
        self, "Processor",
        environment=environment,
        summarization_invokable=BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
        classifier=classifier
    )
    ```

=== "C#/.NET"

    ```csharp linenums="1"
    // src/RvlCdipStack.cs
    using Amazon.CDK;
    using Amazon.CDK.AWS.S3;
    using Amazon.CDK.AWS.KMS;
    using Amazon.CDK.AWS.IAM;
    using Amazon.CDK.AWS.EC2;
    using Amazon.CDK.AWS.AppSync;
    using Cdklabs.GenaiIdp;
    using Cdklabs.GenaiIdpSagemakerUdopProcessor;
    using Constructs;

    namespace RvlCdip
    {
        public class RvlCdipStack : Stack
        {
            public RvlCdipStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
            {
                var metricNamespace = this.StackName;

                // Create KMS key for encryption
                var key = new Key(this, "CustomerManagedEncryptionKey");
                key.GrantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

                // Create S3 buckets for document processing
                var inputBucket = new Bucket(this, "InputBucket", new BucketProps
                {
                    EncryptionKey = key,
                    EventBridgeEnabled = true,
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

    // Create the RVL-CDIP model
    var rvlCdipModel = new RvlCdipModel(this, "RvlCdipModel");
    var modelData = rvlCdipModel.ModelData;

    // Create the SageMaker classifier
    var classifier = new SagemakerClassifier(this, "RvlCdipClassifier", new SagemakerClassifierProps
    {
        Key = key,
        OutputBucket = outputBucket,
        ModelData = modelData,
        InstanceType = InstanceType.G5_2XLARGE
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
        Key = key,
        InputBucket = inputBucket,
        OutputBucket = outputBucket,
        WorkingBucket = workingBucket,
        ConfigurationTable = configurationTable,
        TrackingTable = trackingTable,
        Api = api,
        MetricNamespace = metricNamespace
    });

    // Create the SageMaker UDOP processor
    new SagemakerUdopProcessor(this, "Processor", new SagemakerUdopProcessorProps
    {
        Environment = environment,
        SummarizationInvokable = BedrockFoundationModel.ANTHROPIC_CLAUDE_3_5_SONNET_V2_0,
        Classifier = classifier
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

The deployment will take several minutes. Once complete, the command will output the URL of the web application.

!!! note "SageMaker Model Deployment"
    The deployment includes creating and deploying a SageMaker model, which can take 10-15 minutes. The stack will automatically handle downloading the pre-trained RVL-CDIP model and deploying it to SageMaker.

## Step 6: Configure Bedrock Model Access

Ensure you have access to the required Bedrock models:

1. Go to the [Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Request access to the models used by the solution (e.g., Claude 3.5 Sonnet)
4. Wait for access approval (usually immediate for most models)

## Step 7: Test the Solution

Now you can test the solution by uploading a sample document:

1. Access the web application using the URL from the deployment output
2. Sign in with the credentials provided during deployment
3. Upload a sample document
4. Monitor the processing status in the web interface
5. Once processing is complete, view the classification results and extracted data

Alternatively, you can upload documents directly to the S3 input bucket:

```bash
aws s3 cp sample-document.pdf s3://YOUR-INPUT-BUCKET-NAME/
```

## Step 8: Understand the RVL-CDIP Classification

The RVL-CDIP model classifies documents into 16 categories:

- Letter
- Form
- Email
- Handwritten
- Advertisement
- Scientific report
- Scientific publication
- Specification
- File folder
- News article
- Budget
- Invoice
- Presentation
- Questionnaire
- Resume
- Memo

Each uploaded document will be classified into one of these categories, which can then be used to apply specific extraction strategies.

## Step 9: Monitor Processing

You can monitor the document processing in several ways:

1. **Web Interface**: View processing status and results
2. **AWS Step Functions Console**: Monitor workflow executions
3. **CloudWatch Logs**: View detailed processing logs
4. **SageMaker Console**: Monitor the SageMaker endpoint performance
5. **GraphQL API**: Query processing status programmatically

## Step 10: Clean Up

When you're done experimenting, you can clean up all resources to avoid incurring charges:

```bash
cdk destroy
```

!!! warning "SageMaker Costs"
    SageMaker endpoints incur charges as long as they are running. Make sure to destroy the stack when you're done to avoid unnecessary costs.

## Next Steps

Now that you have a working SageMaker UDOP Processor solution, consider:

- Fine-tuning the RVL-CDIP model for your specific document types
- Customizing the extraction logic based on document classification
- Integrating the solution with your existing systems
- Enhancing the web interface for your specific requirements
- Exploring other document classification models for your use case

For more information, refer to the [Amazon SageMaker documentation](https://docs.aws.amazon.com/sagemaker/) and the [GenAI IDP Accelerator documentation](https://gitlab.aws.dev/genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator).
