import path from "path";
import {
  // Inference models - use alpha package
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
} from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { Database } from "@aws-cdk/aws-glue-alpha";
import {
  AgentAnalytics,
  AgentCompanionChat,
  AgentTable,
  ChatWithDocument,
  ConfigurationTable,
  DocumentDiscovery,
  Evaluation,
  KnowledgeBaseQuery,
  MessagesTable,
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
  ProcessingProgressMonitor,
  ReportingEnvironment,
  SessionTable,
  TrackingTable,
  UserIdentity,
  UserManagement,
  WebApplication,
} from "@cdklabs/genai-idp";
import {
  BdaProcessor,
  BdaProcessorConfiguration,
} from "@cdklabs/genai-idp-bda-processor";
import {
  // Knowledge Base constructs - keep from old package
  VectorKnowledgeBase,
  S3DataSource,
  ChunkingStrategy,
  // Embedding models - keep from old package for type compatibility
  BedrockFoundationModel as EmbeddingModel,
} from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  UserPoolDefaultAction,
} from "aws-cdk-lib/aws-appsync";
// import { SubnetSelection, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Key } from "aws-cdk-lib/aws-kms";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { BedrockDataAutomation } from "./bedrock-data-automation";
import { OptionalAdminUser } from "./optional-admin";

export class BdaLendingStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const metricNamespace = this.stackName;

    // const vpc = new Vpc(this, "Vpc");

    // const vpcSubnets: SubnetSelection = {
    //   subnetType: SubnetType.PRIVATE_WITH_EGRESS,
    // };

    const key = new Key(this, "CustomerManagedEncryptionKey");
    key.grantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

    const inputBucket = new Bucket(this, "InputBucket", {
      encryptionKey: key,
      eventBridgeEnabled: true, // <-- this is required
      removalPolicy: RemovalPolicy.DESTROY, // <-- this is for test only
      autoDeleteObjects: true, // <-- this is for test only
    });

    const outputBucket = new Bucket(this, "OutputBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY, // <-- this is for test only
      autoDeleteObjects: true, // <-- this is for test only
    });

    const userIdentity = new UserIdentity(this, "UserIdentity");

    new OptionalAdminUser(this, "AdminUser", { userIdentity });

    inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
    outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

    const workingBucket = new Bucket(this, "WorkingBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const configurationTable = new ConfigurationTable(
      this,
      "ConfigurationTable",
      {
        encryptionKey: key,
      },
    );

    const trackingTable = new TrackingTable(this, "TrackingTable", {
      encryptionKey: key,
    });

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
      // vpcConfiguration: {
      //   vpc,
      //   vpcSubnets,
      // },
    });

    api.grantQuery(userIdentity.identityPool.authenticatedRole);
    api.grantSubscription(userIdentity.identityPool.authenticatedRole);

    const reportingEnvironment = new ReportingEnvironment(
      this,
      "ReportingEnvironment",
      {
        reportingDatabase: new Database(this, "ReportingDatabase"),
        reportingBucket: new Bucket(this, "ReportingBucket", {
          removalPolicy: RemovalPolicy.DESTROY,
          autoDeleteObjects: true,
        }),
      },
    );

    const environment = new ProcessingEnvironment(this, "Environment", {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      configurationTable,
      trackingTable,
      api,
      metricNamespace,
      reportingEnvironment,
      // vpcConfiguration: {
      //   vpc,
      //   vpcSubnets,
      // },
    });

    const bda = new BedrockDataAutomation(this, "LendingBda");

    const evaluationBaselineBucket = new Bucket(
      this,
      "EvaluationBaselineBucket",
      {
        encryptionKey: key,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      },
    );

    const processor = new BdaProcessor(this, "Pattern1", {
      environment,
      dataAutomationProject: bda.project,
      evaluationBaselineBucket,
      configuration: BdaProcessorConfiguration.lendingPackageSample(),
    });

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

    const knowledgeBase = new VectorKnowledgeBase(this, "GenAIIDPKB", {
      embeddingsModel: EmbeddingModel.TITAN_EMBED_TEXT_V2_512,
    });

    const s3DataSource = new S3DataSource(this, "GenAIIDPKBDS", {
      bucket: outputBucket,
      knowledgeBase: knowledgeBase,
      dataSourceName: "processings",
      chunkingStrategy: ChunkingStrategy.NONE,
    });

    const s3PutEventSource = new S3EventSource(outputBucket, {
      events: [EventType.OBJECT_CREATED_PUT],
    });

    const lambdaIngestionJob = new NodejsFunction(this, "IngestionJob", {
      entry: path.join(__dirname, "lambda-fns", "ingest.ts"),
      timeout: Duration.minutes(15),
      environment: {
        KNOWLEDGE_BASE_ID: knowledgeBase.knowledgeBaseId,
        DATA_SOURCE_ID: s3DataSource.dataSourceId,
        BUCKET_ARN: outputBucket.bucketArn,
      },
    });

    lambdaIngestionJob.addEventSource(s3PutEventSource);
    lambdaIngestionJob.addToRolePolicy(
      new PolicyStatement({
        actions: ["bedrock:StartIngestionJob"],
        resources: [knowledgeBase.knowledgeBaseArn, outputBucket.bucketArn],
      }),
    );

    const chatModel = CrossRegionInferenceProfile.fromConfig({
      model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
      geoRegion: CrossRegionInferenceProfileRegion.US,
    });

    // Enable user management for role-based access control
    api.enable(
      new UserManagement(this, "UserManagement", {
        userIdentity,
      }),
    );

    // Enable AI companion chat for operational assistance and analytics queries
    const agentCompanionChat = new AgentCompanionChat(
      this,
      "AgentCompanionChat",
      {
        sessionTable: new SessionTable(this, "ChatSessionTable", {
          encryptionKey: key,
        }),
        messagesTable: new MessagesTable(this, "ChatMessagesTable", {
          encryptionKey: key,
        }),
        configurationTable,
        trackingTable,
        lookupFunction: environment.lookupFunction,
        cloudWatchLogGroupPrefix: `/aws/lambda/${this.stackName}`,
        athenaDatabase: reportingEnvironment.reportingDatabase,
        athenaOutputLocation: `s3://${reportingEnvironment.reportingBucket.bucketName}/athena-results/`,
        encryptionKey: key,
        tracing: environment.tracing,
      },
    );

    api.enable(agentCompanionChat);

    // Enable knowledge base querying of processed documents
    const knowledgeBaseQuery = new KnowledgeBaseQuery(
      this,
      "KnowledgeBaseQuery",
      {
        knowledgeBase,
        knowledgeBaseModel: chatModel,
        encryptionKey: key,
      },
    );

    api.enable(knowledgeBaseQuery);
    webApplication.enable(knowledgeBaseQuery);

    // Enable real-time processing progress notifications via subscriptions
    const progressMonitor = new ProcessingProgressMonitor(
      this,
      "ProgressMonitor",
      {
        stateMachine: processor.stateMachine,
        encryptionKey: key,
      },
    );

    api.enable(progressMonitor);

    // Enable document discovery for automated configuration generation
    const documentDiscovery = new DocumentDiscovery(this, "Discovery", {
      discoveryBucket: new Bucket(this, "DiscoveryBucket", {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }),
      configurationTable,
      encryptionKey: key,
    });

    api.enable(documentDiscovery);
    webApplication.enable(documentDiscovery);

    // Enable evaluation baseline management for accuracy measurement
    const evaluation = new Evaluation(this, "Evaluation", {
      evaluationBaselineBucket,
      outputBucket,
      encryptionKey: key,
    });

    api.enable(evaluation);
    webApplication.enable(evaluation);

    // Enable conversational AI for individual document interaction
    const chatWithDocument = new ChatWithDocument(this, "ChatWithDocument", {
      knowledgeBase,
      chatModel,
      trackingTable,
      configurationTable,
      outputBucket,
      encryptionKey: key,
    });

    api.enable(chatWithDocument);

    // Enable AI-powered analytics agent for processing insights
    const agentAnalytics = new AgentAnalytics(this, "AgentAnalytics", {
      agentTable: new AgentTable(this, "AgentAnalyticsTable", {
        encryptionKey: key,
      }),
      trackingTable,
      configurationTable,
      model: CrossRegionInferenceProfile.fromConfig({
        model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
        geoRegion: CrossRegionInferenceProfileRegion.US,
      }),
      metricNamespace,
      reportingEnvironment,
      encryptionKey: key,
    });

    api.enable(agentAnalytics);
    // webApplication.enable(agentAnalytics);

    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }
}
