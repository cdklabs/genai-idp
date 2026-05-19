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

import {
  App,
  Aspects,
  CfnOutput,
  CfnResource,
  RemovalPolicy,
  Stack,
} from "aws-cdk-lib";
import {
  AuthorizationType,
  UserPoolDefaultAction,
} from "aws-cdk-lib/aws-appsync";
import { CfnUserPool } from "aws-cdk-lib/aws-cognito";
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

// --- Optional Admin User (inline to avoid extra file in projen layout) ---

interface OptionalAdminUserProps {
  readonly userIdentity: {
    userPool: import("aws-cdk-lib/aws-cognito").IUserPool;
  };
}

class OptionalAdminUser extends Construct {
  constructor(scope: Construct, id: string, props: OptionalAdminUserProps) {
    super(scope, id);

    const adminEmail = process.env.SEEDFARMER_PARAMETER_ADMIN_EMAIL ?? "";

    if (adminEmail && adminEmail.length > 0) {
      const {
        CfnUserPoolUser,
        CfnUserPoolGroup,
        CfnUserPoolUserToGroupAttachment,
      } = require("aws-cdk-lib/aws-cognito");

      const adminUser = new CfnUserPoolUser(this, "AdminUser", {
        desiredDeliveryMediums: ["EMAIL"],
        userAttributes: [{ name: "email", value: adminEmail }],
        username: adminEmail,
        userPoolId: props.userIdentity.userPool.userPoolId,
      });

      const adminGroup = new CfnUserPoolGroup(this, "AdminGroup", {
        description: "Administrators",
        groupName: "Admin",
        precedence: 0,
        userPoolId: props.userIdentity.userPool.userPoolId,
      });

      new CfnUserPoolUserToGroupAttachment(
        this,
        "AdminUserToAdminGroupAttachment",
        {
          groupName: adminGroup.ref,
          username: adminUser.ref,
          userPoolId: props.userIdentity.userPool.userPoolId,
        },
      );
    }
  }
}

// --- Main Stack ---

export class BedrockIdpStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const metricNamespace = this.stackName;

    // VPC with isolated subnets — fully private deployment
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
          subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
        },
        DDB: {
          service: GatewayVpcEndpointAwsService.DYNAMODB,
          subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
        },
      },
    });

    // Interface VPC endpoints for all AWS services
    const endpoints = [
      ["SSM", InterfaceVpcEndpointAwsService.SSM],
      ["CWLOGS", InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS],
      ["CWMONITORING", InterfaceVpcEndpointAwsService.CLOUDWATCH_MONITORING],
      ["KMS", InterfaceVpcEndpointAwsService.KMS],
      ["BEDROCK", InterfaceVpcEndpointAwsService.BEDROCK],
      ["BEDROCKRUNTIME", InterfaceVpcEndpointAwsService.BEDROCK_RUNTIME],
      [
        "BEDROCKAGENTRUNTIME",
        InterfaceVpcEndpointAwsService.BEDROCK_AGENT_RUNTIME,
      ],
      ["STS", InterfaceVpcEndpointAwsService.STS],
      ["CODEBUILD", InterfaceVpcEndpointAwsService.CODEBUILD],
      ["EVENTBRIDGE", InterfaceVpcEndpointAwsService.EVENTBRIDGE],
      ["LAMBDA", InterfaceVpcEndpointAwsService.LAMBDA],
      ["SQS", InterfaceVpcEndpointAwsService.SQS],
      ["SFN", InterfaceVpcEndpointAwsService.STEP_FUNCTIONS],
      ["TEXTRACT", InterfaceVpcEndpointAwsService.TEXTRACT],
    ] as const;
    for (const [name, service] of endpoints) {
      vpc.addInterfaceEndpoint(name, { service });
    }

    const vpcSubnets: SubnetSelection = {
      subnetType: SubnetType.PRIVATE_ISOLATED,
    };

    // KMS key for encryption
    const key = new Key(this, "CustomerManagedEncryptionKey");
    key.grantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

    // S3 buckets
    const inputBucket = new Bucket(this, "InputBucket", {
      encryptionKey: key,
      eventBridgeEnabled: true,
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

    // User identity (Cognito)
    const userIdentity = new UserIdentity(this, "UserIdentity");
    new OptionalAdminUser(this, "AdminUser", { userIdentity });

    inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
    outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

    // Processing environment
    const environment = new ProcessingEnvironment(this, "Environment", {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace,
      vpcConfiguration: { vpc, vpcSubnets },
    });

    // Bedrock LLM processor
    const processor = new BedrockLlmProcessor(this, "Processor", {
      environment,
      configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
    });

    // API
    const api = new ProcessingEnvironmentApi(this, "Api", {
      ...environment,
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            userPool: userIdentity.userPool,
            defaultAction: UserPoolDefaultAction.ALLOW,
          },
        },
        additionalAuthorizationModes: [
          { authorizationType: AuthorizationType.IAM },
        ],
      },
    });

    api.grantQuery(userIdentity.identityPool.authenticatedRole);
    api.grantSubscription(userIdentity.identityPool.authenticatedRole);

    // Web application
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

    // Progress monitor
    const progressMonitor = new ProcessingProgressMonitor(
      this,
      "ProgressMonitor",
      {
        stateMachine: processor.stateMachine,
        encryptionKey: key,
      },
    );
    api.enable(progressMonitor);

    // SeedFarmer metadata output
    new CfnOutput(this, "metadata", {
      value: JSON.stringify({
        WebSiteUrl: `https://${webApplication.distribution.distributionDomainName}`,
      }),
    });
  }
}

// --- App ---
const app = new App();
new BedrockIdpStack(app, "BedrockIdpStack");

Aspects.of(app).add({
  visit(node) {
    if (node instanceof CfnUserPool) {
      node.addPropertyOverride("DeletionProtection", "INACTIVE");
    }
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  },
});

app.synth();
