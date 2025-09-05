/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as functions from "./functions";
import { LogLevel } from "../log-level";
import { VpcConfiguration } from "../vpc-configuration";
import { IWorkteam, Workteam } from "./sagemaker";

/**
 * Properties for configuring the HITL environment.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface HitlEnvironmentProps {
  /**
   * The Cognito User Pool for authentication.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * The Cognito User Group that contains the human reviewers.
   */
  readonly userGroup: cognito.CfnUserPoolGroup;

  /**
   * The S3 bucket for BDA output storage.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional existing private workforce ARN to use instead of creating a new workteam.
   */
  readonly existingPrivateWorkforceArn?: string;

  /**
   * The log level for HITL functions.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional KMS key for encrypting HITL resources.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The retention period for CloudWatch logs.
   * @default logs.RetentionDays.ONE_WEEK
   */
  readonly logRetention?: logs.RetentionDays;

  /**
   * Optional VPC configuration for HITL functions.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Interface for the HITL environment.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface IHitlEnvironment {
  /**
   * The SageMaker workteam for HITL tasks.
   */
  readonly workteam: IWorkteam;

  /**
   * The Cognito User Pool Client for A2I integration.
   */
  readonly userPoolClient: cognito.IUserPoolClient;

  /**
   * The workforce portal URL for human reviewers.
   */
  readonly workforcePortalUrl: string;

  /**
   * The labeling console URL for SageMaker Ground Truth.
   */
  readonly labelingConsoleUrl: string;
}

/**
 * A construct that sets up the Human-in-the-Loop (HITL) environment for document processing.
 *
 * This construct creates and manages all the necessary components for HITL workflows:
 * - SageMaker workteam for human reviewers
 * - Cognito User Pool Client for A2I integration
 * - A2I Flow Definition and Human Task UI management
 * - Workforce portal URL retrieval
 *
 * The HITL environment enables human review of documents that fall below
 * confidence thresholds or require manual verification.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class HitlEnvironment extends Construct implements IHitlEnvironment {
  /**
   * The SageMaker workteam for HITL tasks.
   */
  public readonly workteam: IWorkteam;

  /**
   * The Cognito User Pool Client for A2I integration.
   */
  public readonly userPoolClient: cognito.IUserPoolClient;

  /**
   * The workforce portal URL for human reviewers.
   */
  public readonly workforcePortalUrl: string;

  /**
   * The labeling console URL for SageMaker Ground Truth.
   */
  public readonly labelingConsoleUrl: string;

  /**
   * The IAM role for A2I Flow Definition.
   */
  public readonly flowDefinitionRole: iam.Role;

  /**
   * Creates a new HitlEnvironment.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the HITL environment
   */
  constructor(scope: Construct, id: string, props: HitlEnvironmentProps) {
    super(scope, id);

    const stackName = cdk.Stack.of(this).stackName;

    // Create Cognito User Pool Client for A2I with generate secret as true
    this.userPoolClient = new cognito.UserPoolClient(
      this,
      "UserPoolClientA2I",
      {
        userPool: props.userPool,
        userPoolClientName: `${stackName}-A2I-Client`,
        generateSecret: true,
      },
    );

    // Create SageMaker workteam
    this.workteam = new Workteam(this, "SageMakerWorkteam", {
      userPool: props.userPool,
      userPoolClient: this.userPoolClient,
      userGroup: props.userGroup,
      existingPrivateWorkforceArn: props.existingPrivateWorkforceArn,
    });

    // Create IAM role for A2I Flow Definition
    this.flowDefinitionRole = new iam.Role(this, "A2IFlowDefinitionRole", {
      assumedBy: new iam.ServicePrincipal("sagemaker.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSageMakerFullAccess"),
      ],
      inlinePolicies: {
        A2IFlowDefinitionAccess: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket",
              ],
              resources: [
                props.outputBucket.bucketArn,
                `${props.outputBucket.bucketArn}/*`,
              ],
            }),
            // Only add KMS policy statement if encryption key is provided
            ...(props.encryptionKey
              ? [
                  new iam.PolicyStatement({
                    effect: iam.Effect.ALLOW,
                    actions: [
                      "kms:Encrypt",
                      "kms:Decrypt",
                      "kms:ReEncrypt*",
                      "kms:GenerateDataKey*",
                      "kms:DescribeKey",
                    ],
                    resources: [props.encryptionKey.keyArn],
                  }),
                ]
              : []),
          ],
        }),
      },
    });

    // Create Cognito updater function to resolve circular dependency
    const cognitoUpdaterFunction = new functions.CognitoUpdaterHitlFunction(
      this,
      "CognitoUpdaterFunction",
      {
        userPool: props.userPool,
        userPoolClient: this.userPoolClient,
        workteamName: this.workteam.workteamName,
        logLevel: props.logLevel,
        encryptionKey: props.encryptionKey,
        logGroup: new logs.LogGroup(this, "CognitoUpdaterFunctionLogGroup", {
          encryptionKey: props.encryptionKey,
          retention: props.logRetention || logs.RetentionDays.ONE_WEEK,
        }),
        ...props.vpcConfiguration,
      },
    );

    // Create A2I resources management function
    const createA2IResourcesFunction = new functions.CreateA2IResourcesFunction(
      this,
      "CreateA2IResourcesFunction",
      {
        workteamArn: this.workteam.workteamArn,
        flowDefinitionRoleArn: this.flowDefinitionRole.roleArn,
        outputBucket: props.outputBucket,
        logLevel: props.logLevel,
        encryptionKey: props.encryptionKey,
        logGroup: new logs.LogGroup(
          this,
          "CreateA2IResourcesFunctionLogGroup",
          {
            encryptionKey: props.encryptionKey,
            retention: props.logRetention || logs.RetentionDays.ONE_WEEK,
          },
        ),
        ...props.vpcConfiguration,
      },
    );

    // Create workforce URL retrieval function
    const getWorkforceUrlFunction = new functions.GetWorkforceUrlFunction(
      this,
      "GetWorkforceUrlFunction",
      {
        workteamName: this.workteam.workteamName,
        existingPrivateWorkforceArn: props.existingPrivateWorkforceArn,
        logLevel: props.logLevel,
        encryptionKey: props.encryptionKey,
        logGroup: new logs.LogGroup(this, "GetWorkforceUrlFunctionLogGroup", {
          encryptionKey: props.encryptionKey,
          retention: props.logRetention || logs.RetentionDays.ONE_WEEK,
        }),
        ...props.vpcConfiguration,
      },
    );

    // Create custom resources to trigger the functions
    const cognitoUpdaterResource = new cdk.CustomResource(
      this,
      "CognitoUpdaterResource",
      {
        serviceToken: cognitoUpdaterFunction.functionArn,
        properties: {
          SourceCodeHash: "COGNITO_CLIENT_HASH_TOKEN", // This would be replaced during build
        },
      },
    );

    const a2iResourcesResource = new cdk.CustomResource(
      this,
      "A2IResourcesCustomResource",
      {
        serviceToken: createA2IResourcesFunction.functionArn,
        properties: {
          StackName: stackName,
          SourceCodeHash: "A2I_RESOURCES_HASH_TOKEN", // This would be replaced during build
        },
      },
    );

    const workforceUrlResource = new cdk.CustomResource(
      this,
      "WorkforceURLResource",
      {
        serviceToken: getWorkforceUrlFunction.functionArn,
        properties: {
          WorkteamName: this.workteam.workteamName,
          ExistingPrivateWorkforceArn: props.existingPrivateWorkforceArn || "",
        },
      },
    );

    // Set up dependencies
    cognitoUpdaterResource.node.addDependency(this.userPoolClient);
    cognitoUpdaterResource.node.addDependency(this.workteam);
    a2iResourcesResource.node.addDependency(cognitoUpdaterResource);
    workforceUrlResource.node.addDependency(a2iResourcesResource);

    // Extract URLs from custom resource responses
    this.workforcePortalUrl = workforceUrlResource.getAttString("PortalURL");
    this.labelingConsoleUrl =
      workforceUrlResource.getAttString("LabelingConsoleURL");
  }
}
