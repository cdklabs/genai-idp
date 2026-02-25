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
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";

/**
 * Properties for the AgentCore Gateway Manager function.
 *
 * This function manages AgentCore Gateway deployment and configuration,
 * handling gateway creation, OAuth 2.0 setup, and target configuration.
 */
export interface AgentCoreGatewayManagerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The Cognito User Pool for authentication.
   * Used for configuring OAuth 2.0 authentication for the gateway.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * The Cognito client ID for OAuth 2.0 authentication.
   * Used for gateway authentication configuration.
   */
  readonly clientId: string;

  /**
   * The Lambda function ARN for analytics agent operations.
   * Used as a target for the MCP gateway.
   */
  readonly analyticsLambdaArn: string;

  /**
   * The execution role ARN for the gateway.
   * Used for gateway permissions and operations.
   */
  readonly executionRoleArn: string;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that manages AgentCore Gateway deployment and configuration.
 *
 * This function handles gateway creation, OAuth 2.0 setup with Cognito,
 * and target configuration for MCP integration. It's used as a CloudFormation
 * custom resource provider.
 */
export class AgentCoreGatewayManagerFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: AgentCoreGatewayManagerFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "agentcore_gateway_manager",
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
      timeout: cdk.Duration.minutes(10),
      memorySize: 512,
      environment: {
        USER_POOL_ID: props.userPool.userPoolId,
        CLIENT_ID: props.clientId,
        LAMBDA_ARN: props.analyticsLambdaArn,
        EXECUTION_ROLE_ARN: props.executionRoleArn,
      },
    });

    // Grant permissions for AgentCore operations
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["bedrock-agentcore-control:*", "bedrock-agentcore:*"],
        resources: ["*"],
      }),
    );

    // Grant permissions
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
