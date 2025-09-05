/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the CognitoUpdaterHitlFunction.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface CognitoUpdaterHitlFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The Cognito User Pool to update.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * The Cognito User Pool Client for A2I integration.
   */
  readonly userPoolClient: cognito.IUserPoolClient;

  /**
   * The name of the SageMaker workteam.
   */
  readonly workteamName: string;

  /**
   * The log level for the function.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that updates Cognito configuration for HITL workflows.
 *
 * This function resolves circular dependency issues between SageMaker A2I resources
 * and Cognito configuration by updating the Cognito User Pool Client with the
 * necessary settings for A2I integration after the workteam has been created.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class CognitoUpdaterHitlFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new CognitoUpdaterHitlFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: CognitoUpdaterHitlFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "cognito_updater_hitl",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            // Create temporary directory for dependencies
            `mkdir -p /tmp/builddir`,
            // Copy source files directly to output
            `mkdir -p /asset-output`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            // Clean up unnecessary files in the temp directory
            `find /tmp/builddir -type d -name "*.dist-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            // Copy only necessary dependencies to the output
            `rsync -rL /tmp/builddir/ /asset-output`,
            // Clean up temporary directory
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.seconds(60),
      memorySize: 256,
      description:
        "This AWS Lambda Function updates Cognito configuration for HITL workflows to resolve circular dependencies.",
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        CLIENT_ID: props.userPoolClient.userPoolClientId,
        WORKTEAM_NAME: props.workteamName,
        LOG_LEVEL: props.logLevel || LogLevel.INFO,
      },
      ...props,
    });

    // Grant permissions to update Cognito User Pool Client
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cognito-idp:UpdateUserPoolClient",
          "cognito-idp:DescribeUserPoolClient",
        ],
        resources: [props.userPool.userPoolArn],
      }),
    );

    // Grant permissions for CloudFormation custom resource responses
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [
          "arn:aws:s3:::cloudformation-custom-resource-response-*",
          "arn:aws:s3:::cloudformation-custom-resource-response-*/*",
        ],
      }),
    );

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
