import {
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
  ProcessingProgressMonitor,
  UserIdentity,
  WebApplication,
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
import { OptionalAdminUser } from "./optional-admin";

export class BedrockLlmStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // 1.    Creating necessary components for the Processing Environment.

    // 1.1   The namespace allows for uniquely identifying metrics that the solution generates
    const metricNamespace = this.stackName;

    // 1.2   Creating a VPC with isolated subnets for secure processing.
    //       NOTE: This sample demonstrates a fully private deployment — no internet gateway, all AWS service access via VPC endpoints.
    const noOfAzs = 2;
    const vpc = new Vpc(this, "Vpc", {
      maxAzs: noOfAzs,
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
          subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
        },
        DDB: {
          service: GatewayVpcEndpointAwsService.DYNAMODB,
          subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
        },
      },
    });

    // 1.2.1 Adding interface VPC endpoints for all AWS services used by the processing environment.
    //       Each endpoint enables private connectivity without traversing the public internet.
    vpc.addInterfaceEndpoint("SSM", {
      service: InterfaceVpcEndpointAwsService.SSM,
    });
    vpc.addInterfaceEndpoint("CWLOGS", {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });
    vpc.addInterfaceEndpoint("CWMONITORING", {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_MONITORING,
    });
    vpc.addInterfaceEndpoint("KMS", {
      service: InterfaceVpcEndpointAwsService.KMS,
    });
    vpc.addInterfaceEndpoint("BEDROCK", {
      service: InterfaceVpcEndpointAwsService.BEDROCK,
    });
    vpc.addInterfaceEndpoint("BEDROCKRUNTIME", {
      service: InterfaceVpcEndpointAwsService.BEDROCK_RUNTIME,
    });
    vpc.addInterfaceEndpoint("BEDROCKAGENTRUNTIME", {
      service: InterfaceVpcEndpointAwsService.BEDROCK_AGENT_RUNTIME,
    });
    vpc.addInterfaceEndpoint("STS", {
      service: InterfaceVpcEndpointAwsService.STS,
    });
    vpc.addInterfaceEndpoint("CODEBUILD", {
      service: InterfaceVpcEndpointAwsService.CODEBUILD,
    });
    vpc.addInterfaceEndpoint("EVENTBRIDGE", {
      service: InterfaceVpcEndpointAwsService.EVENTBRIDGE,
    });
    vpc.addInterfaceEndpoint("LAMBDA", {
      service: InterfaceVpcEndpointAwsService.LAMBDA,
    });
    vpc.addInterfaceEndpoint("SQS", {
      service: InterfaceVpcEndpointAwsService.SQS,
    });
    vpc.addInterfaceEndpoint("SFN", {
      service: InterfaceVpcEndpointAwsService.STEP_FUNCTIONS,
    });
    vpc.addInterfaceEndpoint("TEXTRACT", {
      service: InterfaceVpcEndpointAwsService.TEXTRACT,
    });

    const vpcSubnets: SubnetSelection = {
      subnetType: SubnetType.PRIVATE_ISOLATED,
    };

    // 1.3   Creating the KMS key that will be used to encrypt the data & logs
    const key = new Key(this, "CustomerManagedEncryptionKey");
    // 1.3.1 Allowing the system to write logs
    key.grantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

    // 1.4   Creating the input bucket. The input bucket is the entry point for our processing
    const inputBucket = new Bucket(this, "InputBucket", {
      encryptionKey: key,
      eventBridgeEnabled: true, // <-- this is required
      removalPolicy: RemovalPolicy.DESTROY, // <-- this is for test only
      autoDeleteObjects: true, // <-- this is for test only
    });

    // 1.5   Creating the interim storage for processing.
    const workingBucket = new Bucket(this, "WorkingBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // 1.6   Creating the output bucket. The output bucket stores the outputs of the processings.
    const outputBucket = new Bucket(this, "OutputBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY, // <-- this is for test only
      autoDeleteObjects: true, // <-- this is for test only
    });

    // 2.    Creating the API that will serve as the interaction layer for the processing engine
    //       as well as for the user interface.

    // 2.1.  Creating user identity that will enable users to interact with the processing environment
    const userIdentity = new UserIdentity(this, "UserIdentity");

    // 2.1.1 Creating an optional admin user, a Cognito User that will be created in this stack.
    //       NOTE: This user is driven by a CloudFormation parameter, that is:
    //             if a parameter named AdminUser is set to an email - this will trigger creating a user for the email and generating a temporary password
    //             with AWS CDK CLI one needs to supply it as '--parameters AdminEmail=<correct-email>
    new OptionalAdminUser(this, "AdminUser", { userIdentity });

    // 2.1.2 Allowing the user to read the input bucket so we can list out the entries in the UI.
    inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
    // 2.1.3 Allowing the user to read the output bucket so we can list out the entries in the UI.
    outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

    // 3.    Creating the processing environment.

    // 3.1   Creating the processing environment that is an environment in which the processor operates.
    //       NOTE: This sample includes VPC configuration for fully private deployment.
    const environment = new ProcessingEnvironment(this, "Environment", {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace,
      vpcConfiguration: {
        vpc,
        vpcSubnets,
      },
    });

    const configurationBucket = new Bucket(this, "ConfigurationBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    // 4.    Creating the processor, the actual engine for performing the IDP function.

    // 4.1   Creating the Bedrock LLM processor that uses Amazon Bedrock foundation models for document processing.
    const configPath = this.node.tryGetContext("configPath");
    const configuration = configPath
      ? BedrockLlmProcessorConfiguration.fromFile(configPath)
      : BedrockLlmProcessorConfiguration.lendingPackageSample();

    const processor = new BedrockLlmProcessor(this, "Processor", {
      environment,
      configurationBucket,
      configuration,
    });

    // 2.2.  Creating the actual API that will be used by the UI (user interactions) and the processing environment
    const api = new ProcessingEnvironmentApi(this, "Api", {
      ...environment,
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

    // 2.2.1 Allowing the necessary permissions to the authenticated role, i.e. the users signed in to the UI.
    api.grantQuery(userIdentity.identityPool.authenticatedRole);
    api.grantSubscription(userIdentity.identityPool.authenticatedRole);

    // 5.    Creating the UI for the users to have an application to interact with.
    //       NOTE: features contribute settings via webApplication.enable() at synth time using cdk.Lazy.string()

    const webApplication = new WebApplication(this, "WebApp", {
      webAppBucket: new Bucket(this, "webAppBucket", {
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }),
      environment,
      userIdentity,
      apiUrl: api.graphqlUrl,
    });

    // 6.    Enabling auxiliary features via the plugin architecture.
    //       Each feature is constructed independently, then enabled in the API and/or WebApplication.

    // 6.1.  Real-time processing progress notifications via GraphQL subscriptions
    const progressMonitor = new ProcessingProgressMonitor(
      this,
      "ProgressMonitor",
      {
        stateMachine: processor.stateMachine,
        encryptionKey: key,
      },
    );
    api.enable(progressMonitor);

    // 7.    Stack outputs
    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }
}
