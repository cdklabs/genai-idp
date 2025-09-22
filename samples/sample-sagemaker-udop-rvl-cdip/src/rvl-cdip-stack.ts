import { InstanceType } from "@aws-cdk/aws-sagemaker-alpha";
import {
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
  UserIdentity,
  WebApplication,
} from "@cdklabs/genai-idp";
import {
  SagemakerUdopProcessor,
  BasicSagemakerClassifier,
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
import { OptionalAdminUser } from "./optional-admin";
import { RvlCdipModel } from "./rvl-cdip-model";

export class RvlCdipStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const metricNamespace = this.stackName;

    const key = new Key(this, "Key");
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

    const { modelData } = new RvlCdipModel(this, "RvlCdipModel");

    const classifier = new BasicSagemakerClassifier(this, "RvlCdipClassifier", {
      key,
      outputBucket,
      modelData,
      instanceType: InstanceType.G5_2XLARGE,
    });

    const environment = new ProcessingEnvironment(this, "Environment", {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace,
    });

    new SagemakerUdopProcessor(this, "Processor", {
      environment,
      classifierEndpoint: classifier.endpoint, // Pass the endpoint directly
      configuration: SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(),
    });

    const api = new ProcessingEnvironmentApi(this, "EnvironmentApi", {
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
      webAppBucket: new Bucket(this, "WebAppBucket", {
        websiteIndexDocument: "index.html",
        websiteErrorDocument: "index.html",
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      }),
      userIdentity,
      environment,
      apiUrl: api.graphqlUrl,
    });

    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }
}
