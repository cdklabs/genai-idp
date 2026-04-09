import path from "path";
import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha";
import {
  // Inference models - use alpha package
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
} from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { Database, IDatabase } from "@aws-cdk/aws-glue-alpha";
import {
  AgentAnalytics,
  AgentCompanionChat,
  AgentTable,
  ChatWithDocument,
  ConfigurationTable,
  DocumentDiscovery,
  Evaluation,
  IConfigurationTable,
  ITrackingTable,
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
  IKnowledgeBase,
} from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { CfnOutput, Duration, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  AuthorizationType,
  UserPoolDefaultAction,
} from "aws-cdk-lib/aws-appsync";
// import { SubnetSelection, SubnetType, Vpc } from "aws-cdk-lib/aws-ec2";
import { PolicyStatement, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { IKey, Key } from "aws-cdk-lib/aws-kms";
import { IFunction, Tracing } from "aws-cdk-lib/aws-lambda";
import { S3EventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, EventType, IBucket } from "aws-cdk-lib/aws-s3";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { OptionalAdminUser } from "./optional-admin";

export class BdaLendingStack extends Stack {
  // Shared infrastructure references used by feature factory methods
  private readonly encryptionKey: IKey;
  private readonly configurationTable: IConfigurationTable;
  private readonly trackingTable: ITrackingTable;
  private readonly metricNamespace: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // 1.    Creating necessary components for the Processing Environment.

    // 1.1   The namespace allows for uniquely identifying metrics that the solution generates
    this.metricNamespace = this.stackName;

    // 1.2   Creating the KMS key that will be used to encrypt the data & logs
    this.encryptionKey = new Key(this, "CustomerManagedEncryptionKey");
    // 1.2.1 Allowing the system to write logs
    this.encryptionKey.grantEncryptDecrypt(
      new ServicePrincipal("logs.amazonaws.com"),
    );

    // 1.3   Creating the input bucket. The input bucket is the entry point for our processing
    const inputBucket = new Bucket(this, "InputBucket", {
      encryptionKey: this.encryptionKey,
      eventBridgeEnabled: true, // <-- this is required
      removalPolicy: RemovalPolicy.DESTROY, // <-- this is for test only
      autoDeleteObjects: true, // <-- this is for test only
    });

    // 1.4.  Creating the output bucket. The output bucket stores the outputs of the processings.
    const outputBucket = new Bucket(this, "OutputBucket", {
      encryptionKey: this.encryptionKey,
      removalPolicy: RemovalPolicy.DESTROY, // <-- this is for test only
      autoDeleteObjects: true, // <-- this is for test only
    });

    // 1.5   Creating the interim storage for processing.
    const workingBucket = new Bucket(this, "WorkingBucket", {
      encryptionKey: this.encryptionKey,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 1.6   Creating the configuration table that stores the configuration and configuration schema
    this.configurationTable = new ConfigurationTable(
      this,
      "ConfigurationTable",
      {
        encryptionKey: this.encryptionKey,
      },
    );

    // 1.7.  Creating the tracking table that enables driving and taming scale
    this.trackingTable = new TrackingTable(this, "TrackingTable", {
      encryptionKey: this.encryptionKey,
    });

    // 2.    Creating the API that will serve as the interaction layer for the processing engine (in this example)
    //       as well as for the user interface.
    //       NOTE: API is not required for the processing environment, but in this example we'll use it there.

    // 2.1.  Creating user identity that will enable users to interact with the processing environment
    const userIdentity = new UserIdentity(this, "UserIdentity");

    // 2.1.1 Creating an optional admin user, a Cognito User that will be created in this stack.
    //       NOTE: This user is driven by a CloudFormation parameter, that is:
    //             if a parameter named AdminUser is set to an email - this will trigger creating a user for the email and generating a temporary password
    //             with AWS CDK CLI one needs to supply it as '--parameters AdminEmail=<correct-email>
    new OptionalAdminUser(this, "AdminUser", { userIdentity });

    // 2.1.2 allowing the user to read the input bucket so we can list out the entries in the UI.
    inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
    // 2.1.3 allowing the user to read the output bucket so we can list out the entries in the UI.
    outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

    // 2.2.  Creating the actual API that will be used by the UI (user interactions) and the processing environment (it will serve as a proxy to the tracking tables)
    const api = new ProcessingEnvironmentApi(this, "EnvApi", {
      inputBucket,
      outputBucket,
      encryptionKey: this.encryptionKey,
      configurationTable: this.configurationTable,
      trackingTable: this.trackingTable,
      authorizationConfig: {
        defaultAuthorization: {
          // NOTE: the user pool authorization will allow the UI (in general: external entities) to interact with the service
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userIdentity.userPool,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
        // NOTE: this will allow the lambda functions that underpin the processing to interact with the API layer
        additionalAuthorizationModes: [
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
    });

    // 2.2.1. Allowing the necessary permissions to the authenticated role, i.e. the users signed in to the UI.
    api.grantQuery(userIdentity.identityPool.authenticatedRole);
    api.grantSubscription(userIdentity.identityPool.authenticatedRole);

    // 3.     Creating the processing environment with auxiliary capabilities.

    // 3.1.   Creating the reporting environment that can be used to build statistical information on the processed documents
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

    // 3.2.   Creating the processing environment that is an environment in which the processor operates.
    const environment = new ProcessingEnvironment(this, "Environment", {
      key: this.encryptionKey,
      inputBucket,
      outputBucket,
      workingBucket,
      configurationTable: this.configurationTable,
      trackingTable: this.trackingTable,
      // NOTE: this is optional, but very important. If we set the api - the api will be used by the processor for notifying on progress
      //       If, however, we omit this - the underlying Lambda functions will interact with the tracking table directly
      api,
      metricNamespace: this.metricNamespace,
      reportingEnvironment,
    });

    // 4.    Creating the processor, the actual engine for performing the IDP function.

    // 4.1.  Configuration bucket for pipeline configuration files
    const configurationBucket = new Bucket(this, "ConfigurationBucket", {
      encryptionKey: this.encryptionKey,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 4.2.  Creating the processor — BDA blueprints and project are auto-created from the config classes.
    const processor = new BdaProcessor(this, "Pattern1", {
      environment,
      configurationBucket,
      configuration: BdaProcessorConfiguration.lendingPackageSample(),
    });

    // 5.    Creating the UI for the users to have an application to interact with.
    //       NOTE: features contribute settings via webApplication.enable() at synth time using cdk.Lazy.string()

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

    // 6.    Setting up a Knowledge Base for RAG (Retrieval-Augmented Generation) over processed documents.

    const knowledgeBase = this.createKnowledgeBase(outputBucket);

    // 6.1.  Defining the chat model used for conversational features (knowledge base queries, chat with document)
    const chatModel = CrossRegionInferenceProfile.fromConfig({
      model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
      geoRegion: CrossRegionInferenceProfileRegion.US,
    });

    // 7.    Enabling auxiliary features via the plugin architecture.
    //       Each feature is constructed independently, then enabled in the API and/or WebApplication.

    // 7.1.  User management for role-based access control
    const userManagement = this.createUserManagement(userIdentity);
    api.enable(userManagement);

    // 7.2.  AI companion chat for operational assistance and analytics queries
    const agentCompanionChat = this.createAgentCompanionChat({
      lookupFunction: environment.lookupFunction,
      reportingDatabase: reportingEnvironment.reportingDatabase,
      reportingBucket: reportingEnvironment.reportingBucket,
      tracing: environment.tracing,
    });
    api.enable(agentCompanionChat);

    // 7.3.  Knowledge base querying of processed documents
    const knowledgeBaseQuery = this.createKnowledgeBaseQuery(
      knowledgeBase,
      chatModel,
    );
    api.enable(knowledgeBaseQuery);
    webApplication.enable(knowledgeBaseQuery);

    // 7.4.  Real-time processing progress notifications via GraphQL subscriptions
    const progressMonitor = this.createProgressMonitor(processor.stateMachine);
    api.enable(progressMonitor);

    // 7.5.  Document discovery for automated configuration generation from sample documents
    const documentDiscovery = this.createDocumentDiscovery();
    api.enable(documentDiscovery);
    webApplication.enable(documentDiscovery);

    // 7.6.  Evaluation baseline management for accuracy measurement against ground truth
    const evaluationBaselineBucket = new Bucket(this, "EvaluationBaselineBucket", {
      encryptionKey: this.encryptionKey,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const evaluation = this.createEvaluation(
      evaluationBaselineBucket,
      outputBucket,
    );
    api.enable(evaluation);
    webApplication.enable(evaluation);

    // 7.7.  Conversational AI for individual document interaction (chat with a specific processed document)
    const chatWithDocument = this.createChatWithDocument(
      knowledgeBase,
      chatModel,
      outputBucket,
    );
    api.enable(chatWithDocument);

    // 7.8.  AI-powered analytics agent for processing insights and metrics
    const agentAnalytics = this.createAgentAnalytics(reportingEnvironment);
    api.enable(agentAnalytics);

    // 8.    Stack outputs
    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }

  // ---------------------------------------------------------------------------
  // Private factory methods — one per feature, keeping the constructor readable.
  // ---------------------------------------------------------------------------

  /**
   * Creates the vector knowledge base with an S3 data source and automatic ingestion pipeline.
   * Processed documents from the output bucket are embedded and made queryable via RAG.
   */
  private createKnowledgeBase(outputBucket: Bucket): IKnowledgeBase {
    const knowledgeBase = new VectorKnowledgeBase(this, "GenAIIDPKB", {
      embeddingsModel: EmbeddingModel.TITAN_EMBED_TEXT_V2_512,
    });

    // Connect the output bucket as a data source — ChunkingStrategy.NONE because documents are already structured by the processor
    const s3DataSource = new S3DataSource(this, "GenAIIDPKBDS", {
      bucket: outputBucket,
      knowledgeBase: knowledgeBase,
      dataSourceName: "processings",
      chunkingStrategy: ChunkingStrategy.NONE,
    });

    // Automatic ingestion: triggers when new documents land in the output bucket
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

    return knowledgeBase;
  }

  /** User management for role-based access control. */
  private createUserManagement(userIdentity: UserIdentity): UserManagement {
    return new UserManagement(this, "UserManagement", {
      userIdentity,
    });
  }

  /**
   * AI companion chat for operational assistance and analytics queries.
   * Session and messages tables are required — consumers own billing, retention, and removal policy decisions.
   */
  private createAgentCompanionChat(deps: {
    lookupFunction: IFunction;
    reportingDatabase: IDatabase;
    reportingBucket: IBucket;
    tracing?: Tracing;
  }): AgentCompanionChat {
    return new AgentCompanionChat(this, "AgentCompanionChat", {
      sessionTable: new SessionTable(this, "ChatSessionTable", {
        encryptionKey: this.encryptionKey,
      }),
      messagesTable: new MessagesTable(this, "ChatMessagesTable", {
        encryptionKey: this.encryptionKey,
      }),
      configurationTable: this.configurationTable,
      trackingTable: this.trackingTable,
      lookupFunction: deps.lookupFunction,
      cloudWatchLogGroupPrefix: `/aws/lambda/${this.stackName}`,
      athenaDatabase: deps.reportingDatabase,
      athenaOutputLocation: `s3://${deps.reportingBucket.bucketName}/athena-results/`,
      encryptionKey: this.encryptionKey,
      tracing: deps.tracing,
    });
  }

  /** Knowledge base querying of processed documents via natural language. */
  private createKnowledgeBaseQuery(
    knowledgeBase: IKnowledgeBase,
    chatModel: IBedrockInvokable,
  ): KnowledgeBaseQuery {
    return new KnowledgeBaseQuery(this, "KnowledgeBaseQuery", {
      knowledgeBase,
      knowledgeBaseModel: chatModel,
      encryptionKey: this.encryptionKey,
    });
  }

  /** Real-time processing progress notifications via GraphQL subscriptions. */
  private createProgressMonitor(
    stateMachine: IStateMachine,
  ): ProcessingProgressMonitor {
    return new ProcessingProgressMonitor(this, "ProgressMonitor", {
      stateMachine,
      encryptionKey: this.encryptionKey,
    });
  }

  /** Document discovery for automated configuration generation from sample documents. */
  private createDocumentDiscovery(): DocumentDiscovery {
    return new DocumentDiscovery(this, "Discovery", {
      discoveryBucket: new Bucket(this, "DiscoveryBucket", {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }),
      configurationTable: this.configurationTable,
      encryptionKey: this.encryptionKey,
    });
  }

  /** Evaluation baseline management for accuracy measurement against ground truth. */
  private createEvaluation(
    evaluationBaselineBucket: IBucket,
    outputBucket: IBucket,
  ): Evaluation {
    return new Evaluation(this, "Evaluation", {
      evaluationBaselineBucket,
      outputBucket,
      encryptionKey: this.encryptionKey,
    });
  }

  /** Conversational AI for individual document interaction (chat with a specific processed document). */
  private createChatWithDocument(
    knowledgeBase: IKnowledgeBase,
    chatModel: IBedrockInvokable,
    outputBucket: IBucket,
  ): ChatWithDocument {
    return new ChatWithDocument(this, "ChatWithDocument", {
      knowledgeBase,
      chatModel,
      trackingTable: this.trackingTable,
      configurationTable: this.configurationTable,
      outputBucket,
      encryptionKey: this.encryptionKey,
    });
  }

  /**
   * AI-powered analytics agent for processing insights and metrics.
   * Agent table is required — consumers own billing, retention, and removal policy decisions.
   */
  private createAgentAnalytics(
    reportingEnvironment: ReportingEnvironment,
  ): AgentAnalytics {
    return new AgentAnalytics(this, "AgentAnalytics", {
      agentTable: new AgentTable(this, "AgentAnalyticsTable", {
        encryptionKey: this.encryptionKey,
      }),
      trackingTable: this.trackingTable,
      configurationTable: this.configurationTable,
      model: CrossRegionInferenceProfile.fromConfig({
        model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
        geoRegion: CrossRegionInferenceProfileRegion.US,
      }),
      metricNamespace: this.metricNamespace,
      reportingEnvironment,
      encryptionKey: this.encryptionKey,
    });
  }
}
