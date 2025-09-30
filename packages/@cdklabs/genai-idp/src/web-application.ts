/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Asset } from "aws-cdk-lib/aws-s3-assets";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { md5hash } from "aws-cdk-lib/core/lib/helpers-internal";
import { Construct } from "constructs";
import { IProcessingEnvironment } from "./processing-environment";
import { IUserIdentity } from "./user-identity";

/**
 * Interface for the web application that provides a user interface for the document processing solution.
 * Enables users to upload documents, monitor processing status, and access extraction results.
 */
export interface IWebApplication {
  /**
   * The S3 bucket where the web application assets are deployed.
   * Contains the static files for the web UI including HTML, CSS, and JavaScript.
   */
  readonly bucket: s3.IBucket;

  /**
   * The CloudFront distribution that serves the web application.
   * Provides global content delivery with low latency and high performance.
   */
  readonly distribution: cloudfront.IDistribution;
}

export interface WebApplicationProps {
  /**
   * Optional pre-existing S3 bucket to use for the web application.
   * When not provided, a new bucket will be created.
   */
  readonly webAppBucket?: s3.IBucket;

  /**
   * Optional pre-existing CloudFront distribution to use for the web application.
   * When not provided, a default distribution will be created with sensible defaults
   * that work well for most use cases.
   *
   * @default - A new distribution is created with best-practice defaults
   */
  readonly distribution?: cloudfront.IDistribution;

  /**
   * The processing environment that provides shared infrastructure and services.
   * Contains input/output buckets, tracking tables, API endpoints, and other
   * resources needed for document processing operations.
   */
  readonly environment: IProcessingEnvironment;

  /**
   * The GraphQL API URL for the processing environment.
   * This allows for flexible URL configuration including custom domains,
   * cross-stack references, or external API endpoints.
   *
   * @example
   * // Using a CDK-generated API URL
   * apiUrl: myApi.graphqlUrl
   *
   * // Using a custom domain
   * apiUrl: 'https://api.mydomain.com/graphql'
   *
   * // Using a cross-stack reference
   * apiUrl: 'https://abc123.appsync-api.us-east-1.amazonaws.com/graphql'
   */
  readonly apiUrl: string;

  /**
   * The S3 Bucket used for storing CloudFront and S3 access logs.
   * Helps with security auditing and troubleshooting.
   */
  readonly loggingBucket?: s3.IBucket;

  /**
   * Controls whether the UI allows users to sign up with any email domain.
   * When true, enables self-service registration for all users.
   * When false, sign-up functionality is restricted and must be managed by administrators.
   *
   * @default false
   */
  readonly shouldAllowSignUpEmailDomain?: boolean;

  /**
   * The user identity management system that handles authentication
   * and authorization for the web application.
   * Provides Cognito resources for user management and secure access to AWS resources.
   */
  readonly userIdentity: IUserIdentity;

  /**
   * Whether to automatically configure CORS rules on S3 buckets for CloudFront access.
   * When true, the library will configure CORS rules on the input, output, and discovery buckets
   * to allow access from the CloudFront distribution domain.
   *
   * When false, users are responsible for configuring CORS rules themselves.
   * This is useful when users have existing CORS policies or need custom CORS configurations.
   *
   * @default true
   */
  readonly autoConfigure?: boolean;
}

export class WebApplication extends Construct implements IWebApplication {
  public readonly bucket: s3.IBucket;
  public readonly distribution: cloudfront.IDistribution;

  constructor(scope: Construct, id: string, props: WebApplicationProps) {
    super(scope, id);

    // SSM Parameter with settings directly set via stringValue
    const settingsParameter = new ssm.StringParameter(
      this,
      "SettingsParameter",
      {
        stringValue: JSON.stringify({
          StackName: cdk.Stack.of(this).stackName,
          Version: "0.3.16",
          InputBucket: props.environment.inputBucket.bucketName,
          DiscoveryBucket:
            props.environment.documentDiscovery?.discoveryBucket.bucketName ||
            "",
          OutputBucket: props.environment.outputBucket.bucketName,
          ReportingBucket:
            props.environment.reportingEnvironment?.reportingBucket
              .bucketName || "",
          ShouldUseDocumentKnowledgeBase: false,
        }),
      },
    );

    // INFO: This is as the settings parameter is used in a hook in the web app
    // TODO: Think if this should be moved to the webApplication itself
    settingsParameter.grantRead(
      props.userIdentity.identityPool.authenticatedRole,
    );

    // Create or use provided bucket
    this.bucket = props.webAppBucket ?? this.createDefaultBucket(props);

    // Create or use provided distribution
    this.distribution =
      props.distribution ?? this.createDefaultDistribution(props);

    // Configure integrations between distribution and other resources (if enabled)
    if (props.autoConfigure !== false) {
      this.configureIntegrations(props);
    }

    // Create Asset for UI source code (avoids polluting the website bucket)
    const reactAppAsset = new Asset(this, "ReactAppAsset", {
      path: path.join(__dirname, "..", "assets", "webapp", "ui"),
    });

    const environmentVariables = this.createCodeBuildEnvironmentVariables(
      settingsParameter,
      props,
      reactAppAsset,
    );

    // Create the CodeBuild Project
    const uiCodeBuildProject = new codebuild.Project(
      this,
      "UICodeBuildProject",
      {
        projectName: `${cdk.Stack.of(this).stackName}-webui-build`,
        description: `Web UI build for GenAIDP stack - ${cdk.Stack.of(this).stackName}`,
        encryptionKey: cdk.aws_kms.Alias.fromAliasName(
          this,
          "S3Key",
          "alias/aws/s3",
        ),
        source: codebuild.Source.s3({
          bucket: reactAppAsset.bucket,
          path: reactAppAsset.s3ObjectKey,
        }),
        environment: {
          buildImage: codebuild.LinuxBuildImage.AMAZON_LINUX_2_5,
          computeType: codebuild.ComputeType.MEDIUM,
          privileged: true,
        },
        environmentVariables,
        buildSpec: codebuild.BuildSpec.fromObjectToYaml({
          version: "0.2",
          phases: {
            pre_build: {
              commands: [
                "echo ${SOURCE_CODE_LOCATION}",
                "echo `ls -altr`",
                "echo `pwd`",
                "echo Installing NodeJS",
                "n 18.19.1",
                "npm install -g npm@10.2.4",
                "echo Installing Web UI dependencies",
                "npm install",
              ],
            },
            build: {
              commands: [
                "echo Build started on `date`",
                "cd $CODEBUILD_SRC_DIR",
                "echo Building Web UI",
                "npm run build",
                'printf \'{"RepositoryUri":"%s","ProjectName":"%s","ArtifactBucket":"%s"}\' $REPOSITORY_URI $PROJECT_NAME $ARTIFACT_BUCKET > build.json',
              ],
            },
            post_build: {
              commands: [
                "echo Build completed on `date`",
                "echo Copying Web UI",
                "find build -ls",
                "aws s3 cp --recursive build s3://${WEBAPP_BUCKET}/",
                "echo Invalidating CloudFront Distribution",
                "aws cloudfront create-invalidation --distribution-id \"$CLOUDFRONT_DISTRIBUTION_ID\" --paths '/*'",
              ],
            },
          },
          artifacts: {
            files: ["build.json"],
          },
        }),
        timeout: cdk.Duration.minutes(10),
      },
    );

    this.bucket.grantReadWrite(uiCodeBuildProject);
    this.distribution.grantCreateInvalidation(uiCodeBuildProject);

    // Create the Lambda function
    const startUICodeBuild = new lambda_python.PythonFunction(
      this,
      "StartUICodeBuild",
      {
        runtime: lambda.Runtime.PYTHON_3_12,
        entry: path.join(
          __dirname,
          "..",
          "assets",
          "lambdas",
          "start_codebuild",
        ),
        bundling: {
          commandHooks: {
            beforeBundling: (_i: string, _o: string): string[] => {
              return [];
            },
            afterBundling: (_i: string, outputDir: string): string[] => {
              return [
                `find ${outputDir} -type d -name "*.egg-info" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "__pycache__" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "build" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "tests" -exec rm -rf {} +`,
              ];
            },
          },
        },
        timeout: cdk.Duration.seconds(60),
        memorySize: 128,
        description: "This AWS Lambda Function kicks off a code build job.",
        logGroup: new logs.LogGroup(this, "StartUICodeBuildLogGroup", {
          encryptionKey: props.environment.encryptionKey, // Assuming this is defined elsewhere
          retention: logs.RetentionDays.ONE_WEEK, // Assuming this is defined elsewhere
        }),
        ...props.environment.vpcConfiguration,
      },
    );

    startUICodeBuild.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["codebuild:StartBuild", "codebuild:BatchGetBuilds"],
        resources: [uiCodeBuildProject.projectArn],
      }),
    );

    startUICodeBuild.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "events:PutRule",
          "events:DeleteRule",
          "events:PutTargets",
          "events:RemoveTargets",
        ],
        resources: [
          `arn:${cdk.Stack.of(this).partition}:events:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:rule/*`,
        ],
      }),
    );

    startUICodeBuild.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["lambda:AddPermission", "lambda:RemovePermission"],
        resources: [
          `arn:${cdk.Stack.of(this).partition}:lambda:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:function:*`,
        ],
      }),
    );

    // Create the Custom Resource
    new cdk.CustomResource(this, "CodeBuildRun", {
      resourceType: "Custom::CodeBuildRun",
      serviceToken: startUICodeBuild.functionArn,
      properties: {
        BuildProjectName: uiCodeBuildProject.projectName,
        SettingsParameter: settingsParameter.parameterName,
        CodeLocation: `${reactAppAsset.bucket.bucketName}/${reactAppAsset.s3ObjectKey}`,
        // INFO: This EnvHash is to make sure the UI is built on changing env vars
        EnvHash: md5hash(JSON.stringify(environmentVariables)),
      },
    });
  }

  /**
   * Creates a default S3 bucket for the web application with sensible defaults.
   * This is our "best guess" configuration that works well for most use cases.
   */
  private createDefaultBucket(props: WebApplicationProps): s3.Bucket {
    return new s3.Bucket(this, "webAppBucket", {
      encryption: s3.BucketEncryption.S3_MANAGED,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      versioned: true,
      serverAccessLogsBucket: props.loggingBucket,
      serverAccessLogsPrefix: props.loggingBucket
        ? "webapp-bucket-logs/"
        : undefined,
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
    });
  }

  /**
   * Creates a CloudFront distribution with sensible defaults for document processing applications.
   * This is our "best guess" configuration that works well for most use cases.
   */
  private createDefaultDistribution(
    props: WebApplicationProps,
  ): cloudfront.Distribution {
    // Add CloudFront Origin Access Identity (OAI)
    const cloudFrontOAI = new cloudfront.OriginAccessIdentity(
      this,
      "CloudFrontOriginAccessIdentity",
      {
        comment: `${cdk.Stack.of(this).stackName} CloudFront OAI for ${this.bucket.bucketName}`,
      },
    );

    this.bucket.grantRead(cloudFrontOAI);

    // INFO: as we're instructing the distribution to log here
    //       we need the distribution to have permissions to do so.
    props.loggingBucket?.addToResourcePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        principals: [new iam.ServicePrincipal("cloudfront.amazonaws.com")],
        actions: ["s3:PutObject"],
        resources: [props.loggingBucket.arnForObjects("*")],
        conditions: {
          StringEquals: {
            "aws:SourceAccount": cdk.Stack.of(this).account,
          },
        },
      }),
    );

    const securityHeadersPolicy = new cloudfront.ResponseHeadersPolicy(
      this,
      "SecurityHeadersPolicy",
      {
        responseHeadersPolicyName: `${cdk.Stack.of(this).stackName}-security-headers-policy`,
        comment: "Security headers policy",
        securityHeadersBehavior: {
          contentSecurityPolicy: {
            override: true,
            contentSecurityPolicy:
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; object-src 'self' blob: data: https:; base-uri 'none'; frame-ancestors 'self'; form-action 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https: wss://*.amazonaws.com wss://*.appsync-realtime-api.*.amazonaws.com wss://*.execute-api.*.amazonaws.com ws://localhost:*;",
          },
          strictTransportSecurity: {
            override: true,
            accessControlMaxAge: cdk.Duration.seconds(31536000),
            includeSubdomains: true,
            preload: false,
          },
          contentTypeOptions: {
            override: true,
          },
          frameOptions: {
            override: true,
            frameOption: cloudfront.HeadersFrameOption.SAMEORIGIN,
          },
          referrerPolicy: {
            override: true,
            referrerPolicy:
              cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          },
        },
      },
    );

    // Create CloudFront Distribution
    return new cloudfront.Distribution(this, "CloudFrontDistribution", {
      comment: `Web app cloudfront distribution ${cdk.Stack.of(this).stackName}`,
      defaultRootObject: "index.html",
      httpVersion: cloudfront.HttpVersion.HTTP2,
      enabled: true,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_ALL,
      enableIpv6: true,

      // TODO: this should be a part of configuration
      logBucket: props.loggingBucket,
      logFilePrefix: props.loggingBucket ? "cloudfront-logs" : undefined,
      logIncludesCookies: !!props.loggingBucket,

      // Default behavior
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessIdentity(this.bucket, {
          originAccessIdentity: cloudFrontOAI,
        }),
        compress: true,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
        responseHeadersPolicy: securityHeadersPolicy,
        cachePolicy: new cloudfront.CachePolicy(this, "WebUICachePolicy", {
          defaultTtl: cdk.Duration.seconds(600),
          minTtl: cdk.Duration.seconds(300),
          maxTtl: cdk.Duration.seconds(900),
        }),
      },

      // Custom error responses
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(300),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: cdk.Duration.seconds(300),
        },
      ],

      // No geo restrictions by default
      geoRestriction: undefined,
    });
  }

  /**
   * Configures CORS rules on S3 buckets for CloudFront access.
   * Works with both user-provided and default distributions.
   *
   * This method is only called when autoConfigure is true (default).
   * When autoConfigure is false, users are responsible for setting up CORS rules on input/output/discovery buckets.
   */
  private configureIntegrations(props: WebApplicationProps): void {
    // Get the distribution domain (works for both user-provided and default)
    const distributionDomain = this.distribution.distributionDomainName;

    // Configure CORS on input/output buckets
    if (props.environment.inputBucket instanceof s3.Bucket) {
      props.environment.inputBucket.addCorsRule({
        allowedHeaders: [
          "Content-Type",
          "x-amz-content-sha256",
          "x-amz-date",
          "Authorization",
          "x-amz-security-token",
        ],
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: [`https://${distributionDomain}`],
        exposedHeaders: ["ETag", "x-amz-server-side-encryption"],
        maxAge: 3000,
      });
    }

    if (props.environment.outputBucket instanceof s3.Bucket) {
      props.environment.outputBucket.addCorsRule({
        allowedHeaders: [
          "Content-Type",
          "x-amz-content-sha256",
          "x-amz-date",
          "Authorization",
          "x-amz-security-token",
        ],
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: [`https://${distributionDomain}`],
        exposedHeaders: ["ETag", "x-amz-server-side-encryption"],
        maxAge: 3000,
      });
    }

    // Configure CORS on discovery bucket
    if (
      props.environment.documentDiscovery?.discoveryBucket instanceof s3.Bucket
    ) {
      props.environment.documentDiscovery.discoveryBucket.addCorsRule({
        allowedHeaders: [
          "Content-Type",
          "x-amz-content-sha256",
          "x-amz-date",
          "Authorization",
          "x-amz-security-token",
        ],
        allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
        allowedOrigins: [`https://${distributionDomain}`],
        exposedHeaders: ["ETag", "x-amz-server-side-encryption"],
        maxAge: 3000,
      });
    }
  }

  /**
   * Creates environment variables for the CodeBuild project.
   * Includes distribution-specific variables that work with both user-provided and default distributions.
   */
  private createCodeBuildEnvironmentVariables(
    settingsParameter: ssm.StringParameter,
    props: WebApplicationProps,
    reactAppAsset: Asset,
  ): Record<string, codebuild.BuildEnvironmentVariable> {
    return {
      AWS_DEFAULT_REGION: { value: cdk.Stack.of(this).region },
      AWS_ACCOUNT_ID: { value: cdk.Stack.of(this).account },
      SOURCE_CODE_LOCATION: {
        value: `${reactAppAsset.bucket.bucketName}/${reactAppAsset.s3ObjectKey}`,
      },
      WEBAPP_BUCKET: { value: this.bucket.bucketName },
      CLOUDFRONT_DISTRIBUTION_ID: { value: this.distribution.distributionId },
      REACT_APP_SETTINGS_PARAMETER: {
        value: settingsParameter.parameterName,
      },
      REACT_APP_USER_POOL_ID: {
        value: props.userIdentity.userPool.userPoolId,
      },
      REACT_APP_USER_POOL_CLIENT_ID: {
        value: props.userIdentity.userPoolClient.userPoolClientId,
      },
      REACT_APP_IDENTITY_POOL_ID: {
        value: props.userIdentity.identityPool.identityPoolId,
      },
      REACT_APP_APPSYNC_GRAPHQL_URL: {
        value: props.apiUrl,
      },
      REACT_APP_AWS_REGION: { value: cdk.Stack.of(this).region },
      REACT_APP_SHOULD_HIDE_SIGN_UP: {
        value: props.shouldAllowSignUpEmailDomain ? "false" : "true",
      },
      REACT_APP_CLOUDFRONT_DOMAIN: {
        value: `https://${this.distribution.distributionDomainName}/`,
      },
    };
  }
}
