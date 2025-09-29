import path from "path";
import { Database } from "@aws-cdk/aws-glue-alpha";
import {
  ConfigurationTable,
  DocumentDiscovery,
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
  ReportingEnvironment,
  TrackingTable,
  UserIdentity,
  WebApplication,
} from "@cdklabs/genai-idp";
import {
  BdaProcessor,
  BdaProcessorConfiguration,
} from "@cdklabs/genai-idp-bda-processor";
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

    const evaluationBaselineBucket = new Bucket(
      this,
      "EvaluationBaselineBucket",
      {
        encryptionKey: key,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      },
    );

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
      evaluationBaselineBucket,
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

    const discoveryBucket = new Bucket(this, 'DiscoveryBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    })
    const documentDiscovery = new DocumentDiscovery(this, "Discovery", {
      discoveryBucket
    });

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
      documentDiscovery
      // vpcConfiguration: {
      //   vpc,
      //   vpcSubnets,
      // },
    });

    const bda = new BedrockDataAutomation(this, "LendingBda");

    const processor = new BdaProcessor(this, "Pattern1", {
      environment,
      dataAutomationProject: bda.project,
      evaluationBaselineBucket,
      configuration: BdaProcessorConfiguration.lendingPackageSample(),
    });

    api.addStateMachine(processor.stateMachine);

    api.grantQuery(userIdentity.identityPool.authenticatedRole);
    api.grantSubscription(userIdentity.identityPool.authenticatedRole);

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
      embeddingsModel: BedrockFoundationModel.TITAN_EMBED_TEXT_V2_512,
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

    api.addKnowledgeBase(
      knowledgeBase,
      CrossRegionInferenceProfile.fromConfig({
        model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
        geoRegion: CrossRegionInferenceProfileRegion.US,
      }),
    );

    api.addAgentAnalytics(
      trackingTable,
      CrossRegionInferenceProfile.fromConfig({
        model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
        geoRegion: CrossRegionInferenceProfileRegion.US,
      }),
      reportingEnvironment,
    );

    api.addDocumentDiscovery(documentDiscovery);

    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }
}
