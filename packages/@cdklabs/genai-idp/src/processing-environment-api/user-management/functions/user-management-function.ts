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
import { IUsersTable } from "../users-table";

/**
 * Properties for the User Management function.
 *
 * This function handles user administration operations including
 * user creation, updates, deletion, and role management.
 */
export interface UserManagementFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The UserIdentity construct that provides Cognito UserPool and IdentityPool.
   * The function uses these resources to manage user accounts and permissions.
   */
  readonly userIdentity: IUserIdentity;

  /**
   * The DynamoDB table for storing user metadata.
   * This table stores additional user information beyond what's in Cognito.
   */
  readonly usersTable: IUsersTable;

  /**
   * Optional name of the admin group in Cognito UserPool.
   * Users in this group have administrative privileges.
   *
   * @default "Admin"
   */
  readonly adminGroup?: string;

  /**
   * Optional name of the reviewer group in Cognito UserPool.
   * Users in this group have review privileges.
   *
   * @default "Reviewer"
   */
  readonly reviewerGroup?: string;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that handles user administration operations.
 *
 * This function provides user management capabilities including:
 * - Creating new user accounts
 * - Updating user attributes
 * - Deleting user accounts
 * - Managing user roles and permissions
 * - Resetting passwords
 *
 * **Important**: This function requires a UserIdentity construct with both
 * UserPool and IdentityPool for complete user management functionality.
 *
 * @since v0.4.16
 */
export class UserManagementFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: UserManagementFunctionProps,
  ) {
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
        "user_management",
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
        USERS_TABLE_NAME: props.usersTable.tableName,
        ADMIN_GROUP: props.adminGroup || "Admin",
        REVIEWER_GROUP: props.reviewerGroup || "Reviewer",
      },
    });

    // Grant Cognito permissions for UserPool operations
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "cognito-idp:AdminCreateUser",
          "cognito-idp:AdminDeleteUser",
          "cognito-idp:AdminUpdateUserAttributes",
          "cognito-idp:AdminGetUser",
          "cognito-idp:AdminListGroupsForUser",
          "cognito-idp:AdminAddUserToGroup",
          "cognito-idp:AdminRemoveUserFromGroup",
          "cognito-idp:AdminResetUserPassword",
          "cognito-idp:AdminSetUserPassword",
          "cognito-idp:AdminEnableUser",
          "cognito-idp:AdminDisableUser",
          "cognito-idp:ListUsers",
          "cognito-idp:ListGroups",
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
          "cognito-identity:SetIdentityPoolRoles",
          "cognito-identity:DescribeIdentityPool",
        ],
        resources: [
          `arn:${cdk.Stack.of(this).partition}:cognito-identity:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:identitypool/${props.userIdentity.identityPool.identityPoolId}`,
        ],
      }),
    );

    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
