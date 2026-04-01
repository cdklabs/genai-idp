import {
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
  ProcessingProgressMonitor,
  UnifiedConfigurationSchema,
  UnifiedDocumentProcessor,
  UserIdentity,
  WebApplication,
} from "@cdklabs/genai-idp";

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

/**
 * Sample stack demonstrating the Unified Document Processor.
 *
 * The Unified Document Processor consolidates BDA and Pipeline processing modes
 * into a single construct with runtime routing via a `use_bda` configuration flag.
 * This sample shows the minimal setup required to deploy the unified processor
 * with a ProcessingEnvironment and API.
 *
 * @since 0.5.2
 */
export class UnifiedProcessorStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // 1. Shared infrastructure

    const metricNamespace = this.stackName;

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

    // 2. User identity

    const userIdentity = new UserIdentity(this, "UserIdentity");
    new OptionalAdminUser(this, "AdminUser", { userIdentity });

    inputBucket.grantRead(userIdentity.identityPool.authenticatedRole);
    outputBucket.grantRead(userIdentity.identityPool.authenticatedRole);

    // 3. Processing environment

    const environment = new ProcessingEnvironment(this, "Environment", {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace,
    });

    // 4. Unified Document Processor
    //    The configurationBucket holds classification/extraction/assessment configs
    //    used by the pipeline branch. The `use_bda` flag in the configuration schema
    //    determines which branch (BDA vs Pipeline) executes at runtime.

    const configurationBucket = new Bucket(this, "ConfigurationBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const processor = new UnifiedDocumentProcessor(this, "Processor", {
      environment,
      configurationBucket,
      encryptionKey: key,
    });

    // 4.1 Apply the unified configuration schema to the configuration table
    const schema = new UnifiedConfigurationSchema();
    schema.bind(processor);

    // 5. API

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

    // 6. Web application

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

    // 7. Auxiliary features

    const progressMonitor = new ProcessingProgressMonitor(
      this,
      "ProgressMonitor",
      {
        stateMachine: processor.stateMachine,
        encryptionKey: key,
      },
    );
    api.enable(progressMonitor);

    // 8. Stack outputs

    new CfnOutput(this, "WebSiteUrl", {
      value: `https://${webApplication.distribution.distributionDomainName}`,
    });
  }
}
