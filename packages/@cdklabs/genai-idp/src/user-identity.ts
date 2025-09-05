/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as cognito_identity from "aws-cdk-lib/aws-cognito-identitypool";
import { IdentityPoolProps } from "aws-cdk-lib/aws-cognito-identitypool";
import { Construct } from "constructs";

/**
 * Interface for user identity management components.
 * Provides authentication and authorization for the web application.
 */
export interface IUserIdentity {
  /**
   * The Cognito UserPool that stores user identities and credentials.
   * Handles user registration, authentication, and account management.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * The Cognito UserPool Client used by the web application for OAuth flows.
   * Enables the web UI to authenticate users against the UserPool.
   */
  readonly userPoolClient: cognito.IUserPoolClient;

  /**
   * The Cognito Identity Pool that provides temporary AWS credentials.
   * Allows authenticated users to access AWS services with appropriate permissions.
   */
  readonly identityPool: cognito_identity.IdentityPool;
}

/**
 * Properties for configuring the UserIdentity construct.
 */
export interface UserIdentityProps {
  /**
   * Optional pre-existing Cognito User Pool to use for authentication.
   * When not provided, a new User Pool will be created with standard settings.
   */
  readonly userPool?: cognito.IUserPool;

  /**
   * Configuration for the Identity Pool.
   * Allows customization of the Cognito Identity Pool that provides
   * temporary AWS credentials to authenticated users.
   */
  readonly identityPoolOptions?: IdentityPoolProps;
}

/**
 * A construct that manages user authentication and authorization.
 * Provides Cognito resources for user management and secure access to AWS resources.
 *
 * This construct creates and configures:
 * - A Cognito User Pool for user registration and authentication
 * - A User Pool Client for the web application to interact with Cognito
 * - An Identity Pool that provides temporary AWS credentials to authenticated users
 *
 * The UserIdentity construct enables secure access to the document processing solution,
 * ensuring that only authorized users can upload documents, view results, and
 * perform administrative actions.
 */
export class UserIdentity extends Construct implements IUserIdentity {
  /**
   * The Cognito UserPool that stores user identities and credentials.
   */
  public readonly userPool: cognito.IUserPool;

  /**
   * The Cognito UserPool Client used by the web application for OAuth flows.
   */
  public readonly userPoolClient: cognito.IUserPoolClient;

  /**
   * The Cognito Identity Pool that provides temporary AWS credentials.
   */
  public readonly identityPool: cognito_identity.IdentityPool;

  constructor(scope: Construct, id: string, props?: UserIdentityProps) {
    super(scope, id);

    // Create User Pool
    this.userPool =
      props?.userPool ??
      new cognito.UserPool(this, "UserPool", {
        deletionProtection: true,
        passwordPolicy: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireDigits: true,
          requireSymbols: true,
          tempPasswordValidity: cdk.Duration.days(3),
        },
        signInCaseSensitive: true,
        standardAttributes: {
          phoneNumber: { required: false },
          email: { required: true },
          givenName: { required: true },
          familyName: { required: true },
        },
        autoVerify: {
          email: true,
        },
        keepOriginal: {
          email: true,
        },
      });

    // Create User Pool Client
    this.userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool: this.userPool,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PHONE,
          cognito.OAuthScope.PROFILE,
        ],
      },
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
      enableTokenRevocation: true,
      authFlows: {
        userSrp: true,
        //refreshToken: true, TODO: check that
      },
      preventUserExistenceErrors: true,
      readAttributes: new cognito.ClientAttributes().withStandardAttributes({
        email: true,
        emailVerified: true,
        preferredUsername: true,
      }),
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],
    });

    // Create Identity Pool
    this.identityPool = new cognito_identity.IdentityPool(
      this,
      "IdentityPool",
      props?.identityPoolOptions,
    );

    this.identityPool.addUserPoolAuthentication(
      new cognito_identity.UserPoolAuthenticationProvider({
        userPool: this.userPool,
        userPoolClient: this.userPoolClient,
      }),
    );
  }
}
