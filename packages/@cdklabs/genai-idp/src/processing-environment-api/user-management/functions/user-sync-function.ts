/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { IUserIdentity } from "../../../user-identity";

/**
 * Properties for the User Sync function.
 *
 * This function handles user synchronization operations between
 * Cognito UserPool and IdentityPool, ensuring consistent user state.
 */
export interface UserSyncFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The UserIdentity construct that provides Cognito UserPool and IdentityPool.
   * The function uses these resources to synchronize user data and permissions.
   */
  readonly userIdentity: IUserIdentity;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that handles user synchronization operations.
 *
 * This function ensures consistency between Cognito UserPool and IdentityPool
 * by synchronizing user data, roles, and permissions. It handles:
 * - User attribute synchronization
 * - Role and permission updates
 * - Identity mapping between UserPool and IdentityPool
 * - Cleanup of orphaned identities
 *
 * **Important**: This function requires a UserIdentity construct with both
 * UserPool and IdentityPool for complete synchronization functionality.
 *
 * @since v0.4.16
 */
export class UserSyncFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: UserSyncFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "user_sync",
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
      timeout: cdk.Duration.minutes(15),
      memorySize: 512,
      environment: {
        USER_POOL_ID: props.userIdentity.userPool.userPoolId,
        IDENTITY_POOL_ID: props.userIdentity.identityPool.identityPoolId,
      },
    });

    // Grant Cognito permissions for UserPool operations
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:ListUsers",
          "cognito-idp:ListUsersInGroup",
          "cognito-idp:DescribeUserPool",
        ],
        resources: [props.userIdentity.userPool.userPoolArn],
      }),
    );

    // Grant Cognito Identity Pool permissions
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cognito-identity:GetIdentityPoolRoles",
          "cognito-identity:DescribeIdentityPool",
          "cognito-identity:ListIdentities",
          "cognito-identity:DescribeIdentity",
        ],
        resources: [
          `arn:${cdk.Stack.of(this).partition}:cognito-identity:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:identitypool/${props.userIdentity.identityPool.identityPoolId}`,
        ],
      }),
    );

    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
