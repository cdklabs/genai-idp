/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";
import { UserManagementFunction, UserSyncFunction } from "./functions";
import { IUserIdentity } from "../../user-identity";
import { VpcConfiguration } from "../../vpc-configuration";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Interface for User Management construct.
 *
 * Provides user administration and synchronization capabilities for
 * Cognito-enabled deployments. Enables management of user accounts,
 * roles, and permissions through the GraphQL API.
 *
 * @since v0.4.16
 */
export interface IUserManagement extends IConstruct {
  /**
   * Lambda function that handles user administration operations.
   * Manages user creation, updates, deletion, and role assignments.
   */
  readonly managementFunction: lambda.IFunction;

  /**
   * Lambda function that handles user synchronization operations.
   * Ensures consistency between UserPool and IdentityPool.
   */
  readonly syncFunction: lambda.IFunction;
}

/**
 * Properties for UserManagement construct.
 *
 * @since v0.4.16
 */
export interface UserManagementProps {
  /**
   * The UserIdentity construct that provides Cognito UserPool and IdentityPool.
   * This is required as UserManagement only makes sense when Cognito authentication is enabled.
   *
   * The UserIdentity provides access to both the UserPool (for user authentication)
   * and IdentityPool (for AWS resource access), which are both needed for complete
   * user management functionality.
   */
  readonly userIdentity: IUserIdentity;

  /**
   * Optional encryption key for encrypting user management data.
   * When provided, ensures that user data processed by management functions is encrypted.
   *
   * @default - No encryption key
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional VPC configuration for Lambda functions.
   * When provided, deploys user management functions within a VPC.
   *
   * @default - No VPC configuration
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * User Management construct for user administration.
 *
 * Provides comprehensive user management capabilities for Cognito-enabled deployments,
 * including:
 *
 * - User account creation and deletion
 * - User attribute updates
 * - Role and permission management
 * - Password reset operations
 * - User synchronization between UserPool and IdentityPool
 *
 * **Important**: This construct should only be used when UserIdentity is configured
 * for the deployment. It requires both Cognito UserPool and IdentityPool to function
 * properly. For deployments without Cognito authentication, this construct is not needed.
 *
 * The UserManagement construct integrates with ProcessingEnvironmentApi to expose
 * user management operations through GraphQL mutations and queries, enabling
 * administrative users to manage accounts through the web interface.
 *
 * @since v0.4.16
 */
export class UserManagement
  extends Construct
  implements IUserManagement, IProcessingEnvironmentApiFeature
{
  /**
   * Lambda function that handles user administration operations.
   */
  public readonly managementFunction: lambda.IFunction;

  /**
   * Lambda function that handles user synchronization operations.
   */
  public readonly syncFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props: UserManagementProps) {
    super(scope, id);

    // Validate required dependencies
    if (!props.userIdentity) {
      throw new Error(
        "UserManagement requires a UserIdentity construct. " +
          "This construct is only applicable when Cognito authentication is enabled. " +
          "If you are not using Cognito, you do not need UserManagement.",
      );
    }

    // Create user management function
    this.managementFunction = new UserManagementFunction(
      this,
      "ManagementFunction",
      {
        userIdentity: props.userIdentity,
        encryptionKey: props.encryptionKey,
        ...props.vpcConfiguration,
      },
    );

    // Create user sync function
    this.syncFunction = new UserSyncFunction(this, "SyncFunction", {
      userIdentity: props.userIdentity,
      encryptionKey: props.encryptionKey,
      ...props.vpcConfiguration,
    });
  }

  /**
   * Attach this User Management feature to the ProcessingEnvironmentApi.
   *
   * This method integrates the user management functionality with the GraphQL API
   * by creating the necessary data sources and resolvers. It should be called after
   * both the API and this construct have been created.
   *
   * Example:
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const userManagement = new UserManagement(this, 'UserManagement', { ... });
   * userManagement.attachTo(api);
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    // Create data source for user management function
    const userManagementDataSource = api.addLambdaDataSource(
      "UserManagementDataSource",
      this.managementFunction,
      {
        name: "UserManagementResolver",
        description: "Lambda function for user management operations",
      },
    );

    // Create data source for user sync function
    const userSyncDataSource = api.addLambdaDataSource(
      "UserSyncDataSource",
      this.syncFunction,
      {
        name: "UserSyncResolver",
        description: "Lambda function for user synchronization operations",
      },
    );

    // Create resolvers for user management operations
    // Note: The exact GraphQL operations depend on the schema in sources/nested/appsync/src/api/schema.graphql
    userManagementDataSource.createResolver("CreateUserResolver", {
      typeName: "Mutation",
      fieldName: "createUser",
    });

    userManagementDataSource.createResolver("UpdateUserResolver", {
      typeName: "Mutation",
      fieldName: "updateUser",
    });

    userManagementDataSource.createResolver("DeleteUserResolver", {
      typeName: "Mutation",
      fieldName: "deleteUser",
    });

    userManagementDataSource.createResolver("ListUsersResolver", {
      typeName: "Query",
      fieldName: "listUsers",
    });

    // Create resolver for user sync operations
    userSyncDataSource.createResolver("SyncUserResolver", {
      typeName: "Mutation",
      fieldName: "syncUser",
    });
  }
}
