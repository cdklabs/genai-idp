# Lending Document Processing with Bedrock Data Automation and Knowledge Base

This walkthrough guides you through deploying and using the BDA Processor sample application, which demonstrates document processing for lending documents using Amazon Bedrock Data Automation with integrated Knowledge Base capabilities.

## Overview

The BDA Lending sample showcases how to:

- Process lending documents like mortgage applications, loan agreements, and financial statements
- Extract structured data using Amazon Bedrock Data Automation
- Automatically ingest processed documents into a Knowledge Base for conversational queries
- Query processed documents using natural language through the Knowledge Base
- Track document processing status through a GraphQL API
- View and manage documents through a web interface

## Architecture

The sample deploys the following components:

- S3 buckets for input documents and processing results
- Amazon Bedrock Data Automation project for document processing
- **Amazon Bedrock Knowledge Base with vector search capabilities**
- **Automatic document ingestion pipeline for processed documents**
- AWS Step Functions workflow for orchestration
- AWS Lambda functions for processing tasks and Knowledge Base ingestion
- Amazon DynamoDB tables for configuration and tracking
- Amazon AppSync GraphQL API for querying processing status and Knowledge Base
- Amazon CloudFront distribution for the web interface

### Knowledge Base Integration

The solution includes a sophisticated Knowledge Base integration that:

- **Automatically ingests processed documents** from the output S3 bucket into a vector database
- **Enables natural language queries** over processed document content
- **Provides conversational search** capabilities through the web interface
- **Maintains document traceability** with source citations in query responses
- **Uses Amazon Titan Embeddings** for vector representation of document content
- **Leverages Amazon Nova Pro** for generating contextual responses to user queries

## Prerequisites

Before you begin, ensure you have:

1. **AWS Account**: With permissions to create the required resources
2. **AWS CLI**: Configured with appropriate credentials
3. **Node.js**: Version 18 or later (use NVM to install the version specified in `.nvmrc`)
4. **AWS CDK**: Version 2.x installed globally
5. **Docker**: For building Lambda functions
6. **Amazon Bedrock Access**: Ensure your account has access to Amazon Bedrock and the required models:
   - **Amazon Titan Embed Text v2** (for document embeddings)
   - **Amazon Nova Pro v1** (for conversational queries)
   - **Models required by Bedrock Data Automation** (varies by configuration)

## Step 1: Clone the Repository

First, clone the GenAI IDP Accelerator repository and navigate to the sample directory:

=== "Bash"

    ```bash
    git clone https://gitlab.aws.dev/genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator-cdk.git
    cd genaiic-idp-accelerator-cdk/samples/sample-bda-lending
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

The main stack is defined in `src/bda-lending-stack.ts` (TypeScript). Let's examine the key components:

=== "TypeScript"

    ```typescript linenums="1"
    // src/bda-lending-stack.ts
    import path from "path";
    import {
      ProcessingEnvironment,
      ProcessingEnvironmentApi,
      UserIdentity,
      WebApplication,
      ConfigurationTable,
      TrackingTable,
    } from "@cdklabs/genai-idp";
    import { BdaProcessor, BdaProcessorConfiguration } from "@cdklabs/genai-idp-bda-processor";
    import {
      BedrockFoundationModel,
      ChunkingStrategy,
      CrossRegionInferenceProfile,
      CrossRegionInferenceProfileRegion,
      S3DataSource,
      VectorKnowledgeBase,
    } from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
    import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
    import {
      AuthorizationType,
      UserPoolDefaultAction,
    } from "aws-cdk-lib/aws-appsync";
    import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
    import { Key } from "aws-cdk-lib/aws-kms";
    import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
    import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
    import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
    import { Construct } from "constructs";
    import { BedrockDataAutomation } from "./bedrock-data-automation";

    export class BdaLendingStack extends Stack {
      constructor(scope: Construct, id: string) {
        super(scope, id);

        const metricNamespace = this.stackName;

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

        const outputBucket = new Bucket(this, "OutputBucket", {
          encryptionKey: key,
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        });

        const workingBucket = new Bucket(this, "WorkingBucket", {
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

        // Create the Bedrock Data Automation project
        const bda = new BedrockDataAutomation(this, "LendingBda");

        // Create the BDA processor with lending configuration
        const processor = new BdaProcessor(this, "Pattern1", {
          environment,
          dataAutomationProject: bda.project,
          configuration: BdaProcessorConfiguration.lendingPackageSample()
        });

        // Add the processor's state machine to the API
        api.addStateMachine(processor.stateMachine);

        // Create Knowledge Base for conversational document queries
        const knowledgeBase = new VectorKnowledgeBase(this, "GenAIIDPKB", {
          embeddingsModel: BedrockFoundationModel.TITAN_EMBED_TEXT_V2_512,
        });

        // Create S3 data source for the Knowledge Base
        const s3DataSource = new S3DataSource(this, "GenAIIDPKBDS", {
          bucket: outputBucket,
          knowledgeBase: knowledgeBase,
          dataSourceName: "processings",
          chunkingStrategy: ChunkingStrategy.NONE,
        });

        // Create Lambda function for automatic Knowledge Base ingestion
        const lambdaIngestionJob = new NodejsFunction(this, "IngestionJob", {
          entry: path.join(__dirname, "lambda-fns", "ingest.ts"),
          timeout: Duration.minutes(15),
          environment: {
            KNOWLEDGE_BASE_ID: knowledgeBase.knowledgeBaseId,
            DATA_SOURCE_ID: s3DataSource.dataSourceId,
            BUCKET_ARN: outputBucket.bucketArn,
          },
        });

        // Configure S3 event trigger for automatic ingestion
        const s3PutEventSource = new S3EventSource(outputBucket, {
          events: [EventType.OBJECT_CREATED_PUT],
        });

        lambdaIngestionJob.addEventSource(s3PutEventSource);
        lambdaIngestionJob.addToRolePolicy(
          new PolicyStatement({
            actions: ["bedrock:StartIngestionJob"],
            resources: [knowledgeBase.knowledgeBaseArn, outputBucket.bucketArn],
          })
        );

        // Add Knowledge Base to the API with Nova Pro for conversational queries
        api.addKnowledgeBase(
          knowledgeBase,
          CrossRegionInferenceProfile.fromConfig({
            model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
            geoRegion: CrossRegionInferenceProfileRegion.US,
          }),
        );
        
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
          apiUrl: api.graphqlUrl,
        });

        // Output the web application URL
        new CfnOutput(this, "WebSiteUrl", {
          value: `https://${webApplication.distribution.distributionDomainName}`,
          description: "URL of the web application for document management and Knowledge Base queries",
        });
      }
    }
    ```

=== "Python"

    ```python linenums="1"
    # src/bda_lending_stack.py
    import os
    from aws_cdk import (
        Stack,
        RemovalPolicy,
        CfnOutput,
        Duration,
    )
    from aws_cdk.aws_s3 import Bucket, EventType
    from aws_cdk.aws_kms import Key
    from aws_cdk.aws_iam import ServicePrincipal, PolicyStatement
    from aws_cdk.aws_lambda_event_sources import S3EventSource
    from aws_cdk.aws_lambda_nodejs import NodejsFunction
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
    from cdklabs.genai_idp_bda_processor import (
        BdaProcessor,
        BdaProcessorConfiguration
    )
    from cdklabs.generative_ai_cdk_constructs.bedrock import (
        BedrockFoundationModel,
        ChunkingStrategy,
        CrossRegionInferenceProfile,
        CrossRegionInferenceProfileRegion,
        S3DataSource,
        VectorKnowledgeBase,
    )
    from constructs import Construct

    class BdaLendingStack(Stack):
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

            # Create the Bedrock Data Automation project
            bda = BedrockDataAutomation(self, "LendingBda")

            # Create the BDA processor with lending configuration
            processor = BdaProcessor(
                self, "Pattern1",
                environment=environment,
                data_automation_project=bda.project,
                configuration=BdaProcessorConfiguration.lending_package_sample()
            )

            # Add the processor's state machine to the API
            api.add_state_machine(processor.state_machine)

            # Create Knowledge Base for conversational document queries
            knowledge_base = VectorKnowledgeBase(
                self, "GenAIIDPKB",
                embeddings_model=BedrockFoundationModel.TITAN_EMBED_TEXT_V2_512,
            )

            # Create S3 data source for the Knowledge Base
            s3_data_source = S3DataSource(
                self, "GenAIIDPKBDS",
                bucket=output_bucket,
                knowledge_base=knowledge_base,
                data_source_name="processings",
                chunking_strategy=ChunkingStrategy.NONE,
            )

            # Create Lambda function for automatic Knowledge Base ingestion
            lambda_ingestion_job = NodejsFunction(
                self, "IngestionJob",
                entry=os.path.join(os.path.dirname(__file__), "lambda_fns", "ingest.ts"),
                timeout=Duration.minutes(15),
                environment={
                    "KNOWLEDGE_BASE_ID": knowledge_base.knowledge_base_id,
                    "DATA_SOURCE_ID": s3_data_source.data_source_id,
                    "BUCKET_ARN": output_bucket.bucket_arn,
                },
            )

            # Configure S3 event trigger for automatic ingestion
            s3_put_event_source = S3EventSource(
                output_bucket,
                events=[EventType.OBJECT_CREATED_PUT],
            )

            lambda_ingestion_job.add_event_source(s3_put_event_source)
            lambda_ingestion_job.add_to_role_policy(
                PolicyStatement(
                    actions=["bedrock:StartIngestionJob"],
                    resources=[knowledge_base.knowledge_base_arn, output_bucket.bucket_arn],
                )
            )

            # Add Knowledge Base to the API with Nova Pro for conversational queries
            api.add_knowledge_base(
                knowledge_base,
                CrossRegionInferenceProfile.from_config(
                    model=BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
                    geo_region=CrossRegionInferenceProfileRegion.US,
                ),
            )

            # Grant API permissions to authenticated users
            api.grant_query(user_identity.identity_pool.authenticated_role)
            api.grant_subscription(user_identity.identity_pool.authenticated_role)

            # Create web application for document management
            web_application = WebApplication(
                self, "WebApp",
                web_app_bucket=Bucket(
                    self, "webAppBucket",
                    website_index_document="index.html",
                    website_error_document="index.html",
                    removal_policy=RemovalPolicy.DESTROY,
                    auto_delete_objects=True,
                ),
                user_identity=user_identity,
                environment=environment,
                api_url=api.graphql_url,
            )

            # Output the web application URL
            CfnOutput(
                self, "WebSiteUrl",
                value=f"https://{web_application.distribution.distribution_domain_name}",
                description="URL of the web application for document management and Knowledge Base queries"
            )
    ```

=== "C#/.NET"

    ```csharp linenums="1"
    // src/BdaLendingStack.cs
    using System.IO;
    using Amazon.CDK;
    using Amazon.CDK.AWS.S3;
    using Amazon.CDK.AWS.KMS;
    using Amazon.CDK.AWS.IAM;
    using Amazon.CDK.AWS.AppSync;
    using Amazon.CDK.AWS.Lambda.EventSources;
    using Amazon.CDK.AWS.Lambda.NodeJS;
    using Cdklabs.GenaiIdp;
    using Cdklabs.GenaiIdpBdaProcessor;
    using Cdklabs.GenerativeAiCdkConstructs.Bedrock;
    using Constructs;

    namespace BdaLending
    {
        public class BdaLendingStack : Stack
        {
            public BdaLendingStack(Construct scope, string id, IStackProps props = null) : base(scope, id, props)
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

                // Create the Bedrock Data Automation project
                var bda = new BedrockDataAutomation(this, "LendingBda");

                // Create the BDA processor with lending configuration
                var processor = new BdaProcessor(this, "Pattern1", new BdaProcessorProps
                {
                    Environment = environment,
                    DataAutomationProject = bda.Project,
                    Configuration = BdaProcessorConfiguration.LendingPackageSample()
                });

                // Add the processor's state machine to the API
                api.AddStateMachine(processor.StateMachine);

                // Create Knowledge Base for conversational document queries
                var knowledgeBase = new VectorKnowledgeBase(this, "GenAIIDPKB", new VectorKnowledgeBaseProps
                {
                    EmbeddingsModel = BedrockFoundationModel.TITAN_EMBED_TEXT_V2_512,
                });

                // Create S3 data source for the Knowledge Base
                var s3DataSource = new S3DataSource(this, "GenAIIDPKBDS", new S3DataSourceProps
                {
                    Bucket = outputBucket,
                    KnowledgeBase = knowledgeBase,
                    DataSourceName = "processings",
                    ChunkingStrategy = ChunkingStrategy.NONE,
                });

                // Create Lambda function for automatic Knowledge Base ingestion
                var lambdaIngestionJob = new NodejsFunction(this, "IngestionJob", new NodejsFunctionProps
                {
                    Entry = Path.Join(System.IO.Directory.GetCurrentDirectory(), "src", "lambda-fns", "ingest.ts"),
                    Timeout = Duration.Minutes(15),
                    Environment = new Dictionary<string, string>
                    {
                        ["KNOWLEDGE_BASE_ID"] = knowledgeBase.KnowledgeBaseId,
                        ["DATA_SOURCE_ID"] = s3DataSource.DataSourceId,
                        ["BUCKET_ARN"] = outputBucket.BucketArn,
                    },
                });

                // Configure S3 event trigger for automatic ingestion
                var s3PutEventSource = new S3EventSource(outputBucket, new S3EventSourceProps
                {
                    Events = new[] { EventType.OBJECT_CREATED_PUT },
                });

                lambdaIngestionJob.AddEventSource(s3PutEventSource);
                lambdaIngestionJob.AddToRolePolicy(
                    new PolicyStatement(new PolicyStatementProps
                    {
                        Actions = new[] { "bedrock:StartIngestionJob" },
                        Resources = new[] { knowledgeBase.KnowledgeBaseArn, outputBucket.BucketArn },
                    })
                );

                // Add Knowledge Base to the API with Nova Pro for conversational queries
                api.AddKnowledgeBase(
                    knowledgeBase,
                    CrossRegionInferenceProfile.FromConfig(new CrossRegionInferenceProfileConfig
                    {
                        Model = BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
                        GeoRegion = CrossRegionInferenceProfileRegion.US,
                    })
                );

                // Grant API permissions to authenticated users
                api.GrantQuery(userIdentity.IdentityPool.AuthenticatedRole);
                api.GrantSubscription(userIdentity.IdentityPool.AuthenticatedRole);

                // Create web application for document management
                var webApplication = new WebApplication(this, "WebApp", new WebApplicationProps
                {
                    WebAppBucket = new Bucket(this, "webAppBucket", new BucketProps
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

                // Output the web application URL
                new CfnOutput(this, "WebSiteUrl", new CfnOutputProps
                {
                    Value = $"https://{webApplication.Distribution.DistributionDomainName}",
                    Description = "URL of the web application for document management and Knowledge Base queries"
                });
            }
        }
    }
    ```

### Knowledge Base Ingestion Lambda Function

The solution includes an automatic ingestion Lambda function that triggers whenever new processed documents are added to the output S3 bucket. Here's the implementation:

=== "TypeScript"

    ```typescript linenums="1"
    // src/lambda-fns/ingest.ts
    import {
      BedrockAgentClient,
      StartIngestionJobCommand,
    } from "@aws-sdk/client-bedrock-agent";
    import { Context, EventBridgeEvent } from "aws-lambda";

    const client = new BedrockAgentClient({ region: process.env.AWS_REGION });

    export const handler = async (
      event: EventBridgeEvent<string, string>,
      context: Context,
    ) => {
      const input = {
        knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
        dataSourceId: process.env.DATA_SOURCE_ID,
        clientToken: context.awsRequestId,
      };
      const command = new StartIngestionJobCommand(input);

      const response = await client.send(command);

      return JSON.stringify({
        ingestionJob: response.ingestionJob,
      });
    };
    ```

=== "Python"

    ```python linenums="1"
    # src/lambda_fns/ingest.py
    import json
    import os
    import boto3
    from typing import Dict, Any

    client = boto3.client('bedrock-agent')

    def handler(event: Dict[str, Any], context: Any) -> str:
        """
        Lambda function to start Knowledge Base ingestion job
        when new documents are added to the output bucket.
        """
        input_params = {
            'knowledgeBaseId': os.environ['KNOWLEDGE_BASE_ID'],
            'dataSourceId': os.environ['DATA_SOURCE_ID'],
            'clientToken': context.aws_request_id,
        }
        
        response = client.start_ingestion_job(**input_params)
        
        return json.dumps({
            'ingestionJob': response['ingestionJob']
        })
    ```

=== "C#/.NET"

    ```csharp linenums="1"
    // src/lambda-fns/Ingest.cs
    using System;
    using System.Text.Json;
    using System.Threading.Tasks;
    using Amazon.BedrockAgent;
    using Amazon.BedrockAgent.Model;
    using Amazon.Lambda.Core;

    [assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

    namespace BdaLending.LambdaFunctions
    {
        public class IngestFunction
        {
            private readonly IAmazonBedrockAgent _bedrockAgentClient;

            public IngestFunction()
            {
                _bedrockAgentClient = new AmazonBedrockAgentClient();
            }

            public async Task<string> Handler(object input, ILambdaContext context)
            {
                var request = new StartIngestionJobRequest
                {
                    KnowledgeBaseId = Environment.GetEnvironmentVariable("KNOWLEDGE_BASE_ID"),
                    DataSourceId = Environment.GetEnvironmentVariable("DATA_SOURCE_ID"),
                    ClientToken = context.AwsRequestId
                };

                var response = await _bedrockAgentClient.StartIngestionJobAsync(request);

                return JsonSerializer.Serialize(new
                {
                    ingestionJob = response.IngestionJob
                });
            }
        }
    }
    ```

This Lambda function:

- **Triggers automatically** when new files are added to the output S3 bucket
- **Starts an ingestion job** to process the new documents into the Knowledge Base
- **Uses the AWS request ID** as a client token to ensure idempotency
- **Returns the ingestion job details** for monitoring and logging

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

## Step 6: Configure Bedrock Model Access

Ensure you have access to the required Bedrock models:

1. Go to the [Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Request access to the models used by the Data Automation project
4. Wait for access approval (usually immediate for most models)

## Step 7: Configure the Bedrock Data Automation Project

After deployment, you need to configure the Bedrock Data Automation project:

1. Go to the [Amazon Bedrock console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Data Automation" in the left sidebar
3. Select the project created by the stack (it will have a name like "BdaLendingStack-LendingBda...")
4. Configure the document processing workflow:
   - Define document types (e.g., mortgage application, loan agreement)
   - Define extraction schemas for each document type
   - Configure processing options

## Step 8: Test the Solution

Now you can test the solution by uploading a sample lending document and querying the Knowledge Base:

### Document Processing Test

1. Access the web application using the URL from the deployment output
2. Sign in with the credentials provided during deployment
3. Upload a sample lending document (e.g., a mortgage application)
4. Monitor the processing status in the web interface
5. Once processing is complete, view the extracted data

Alternatively, you can upload documents directly to the S3 input bucket:

```bash
aws s3 cp sample-mortgage-application.pdf s3://YOUR-INPUT-BUCKET-NAME/
```

### Knowledge Base Query Test

After documents have been processed and ingested into the Knowledge Base, you can test the conversational query capabilities:

1. **Navigate to the Knowledge Base section** in the web application
2. **Ask natural language questions** about your processed documents, such as:
   - "What is the loan amount in the mortgage application?"
   - "Who is the borrower in document XYZ?"
   - "What are the key terms mentioned in the loan agreements?"
   - "Summarize the financial information from all processed documents"

3. **Review the responses** which will include:
   - **Contextual answers** generated by Amazon Nova Pro
   - **Source citations** linking back to the original processed documents
   - **Confidence scores** and relevance indicators

### GraphQL API Testing

You can also query the Knowledge Base programmatically using the GraphQL API:

```graphql
query QueryKnowledgeBase($input: QueryKnowledgeBaseInput!) {
  queryKnowledgeBase(input: $input) {
    response
    citations {
      retrievedReferences {
        content {
          text
        }
        location {
          s3Location {
            uri
          }
        }
      }
    }
    sessionId
  }
}
```

With variables:
```json
{
  "input": {
    "query": "What is the loan amount mentioned in the documents?",
    "sessionId": "optional-session-id-for-conversation-continuity"
  }
}
```

## Step 9: Monitor Processing

You can monitor the document processing and Knowledge Base operations in several ways:

### Document Processing Monitoring

1. **Web Interface**: View processing status and results
2. **AWS Step Functions Console**: Monitor workflow executions
3. **CloudWatch Logs**: View detailed processing logs
4. **GraphQL API**: Query processing status programmatically

### Knowledge Base Monitoring

1. **Amazon Bedrock Console**: 
   - Monitor Knowledge Base ingestion jobs
   - View data source synchronization status
   - Check vector database metrics

2. **CloudWatch Metrics**:
   - Knowledge Base query latency
   - Ingestion job success/failure rates
   - Vector search performance metrics

3. **Lambda Function Logs**:
   - Monitor automatic ingestion triggers
   - View ingestion job initiation logs
   - Debug any ingestion failures

### Key Metrics to Monitor

- **Document Processing Success Rate**: Percentage of documents successfully processed
- **Knowledge Base Ingestion Latency**: Time from document processing to Knowledge Base availability
- **Query Response Time**: Time taken to respond to Knowledge Base queries
- **Vector Search Accuracy**: Relevance of retrieved document chunks

## Step 10: Clean Up

When you're done experimenting, you can clean up all resources to avoid incurring charges:

```bash
cdk destroy
```

## Next Steps

Now that you have a working BDA Processor solution with Knowledge Base integration, consider:

### Document Processing Enhancements
- Customizing the extraction schemas for your specific document types
- Adding custom post-processing logic for the extracted data
- Integrating the solution with your existing systems
- Enhancing the web interface for your specific requirements

### Knowledge Base Optimizations
- **Fine-tuning chunking strategies** for better document segmentation
- **Implementing custom metadata** for enhanced search filtering
- **Adding web crawling capabilities** to ingest external reference documentation
- **Configuring advanced retrieval settings** for improved query accuracy

### Advanced Features
- **Multi-turn conversations** using session IDs for context continuity
- **Custom prompt engineering** for domain-specific query responses
- **Integration with external systems** via the GraphQL API
- **Automated document classification** before processing

### Production Considerations
- **Implementing proper security controls** and access management
- **Setting up monitoring and alerting** for production workloads
- **Configuring backup and disaster recovery** for the Knowledge Base
- **Optimizing costs** through appropriate model selection and usage patterns

For more information, refer to:
- [Amazon Bedrock Data Automation documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/data-automation.html)
- [Amazon Bedrock Knowledge Bases documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base.html)
- [GenAI IDP Accelerator documentation](https://gitlab.aws.dev/genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator)
