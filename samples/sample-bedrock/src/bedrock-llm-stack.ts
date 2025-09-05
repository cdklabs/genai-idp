import {
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
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

    const metricNamespace = this.stackName;
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
          subnets: [
            {
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
          ],
        },
        DDB: {
          service: GatewayVpcEndpointAwsService.DYNAMODB,
          subnets: [
            {
              subnetType: SubnetType.PRIVATE_ISOLATED,
            },
          ],
        },
      },
    });

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

    const key = new Key(this, "CustomerManagedEncryptionKey");
    key.grantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

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

    const userIdentity = new UserIdentity(this, "UserIdentity");

    new OptionalAdminUser(this, "AdminUser", { userIdentity });

    inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
    outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

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

    new BedrockLlmProcessor(this, "Processor", {
      environment,
      configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
    });

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
          {
            authorizationType: AuthorizationType.IAM,
          },
        ],
      },
    });

    api.grantQuery(userIdentity.identityPool.authenticatedRole);
    api.grantSubscription(userIdentity.identityPool.authenticatedRole);

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

    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }
}
