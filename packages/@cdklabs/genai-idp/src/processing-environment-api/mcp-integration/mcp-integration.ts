/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cognito from "aws-cdk-lib/aws-cognito";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct, IConstruct } from "constructs";
import { AgentCoreGatewayDeployer } from "./agentcore-gateway-deployer";
import { AgentCoreAnalyticsProcessorFunction } from "./functions";
import { ITrackingTable } from "../../tracking-table";

/**
 * Interface for MCP Integration construct.
 *
 * Enables external application access through Model Context Protocol.
 * Provides AgentCore Gateway deployment with OAuth 2.0 authentication.
 *
 * @since v0.4.8
 */
export interface IMCPIntegration extends IConstruct {
  /**
   * AgentCore Gateway endpoint for MCP access.
   */
  readonly gatewayEndpoint: string;

  /**
   * Cognito client ID for OAuth 2.0 authentication.
   */
  readonly clientId: string;

  /**
   * Lambda function for analytics agent operations.
   */
  readonly analyticsAgentFunction: lambda.IFunction;
}

/**
 * Properties for MCPIntegration construct.
 *
 * @since v0.4.8
 */
export interface MCPIntegrationProps {
  /**
   * Cognito User Pool for OAuth 2.0 authentication.
   * Required for authenticating MCP client applications.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * Optional KMS key for encrypting MCP data.
   * When provided, ensures MCP communications and data are encrypted.
   *
   * @default - No encryption key is used
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Supported AWS regions for cross-region MCP access.
   * Enables MCP gateway deployment in multiple regions for global access.
   *
   * @default - Current region only
   */
  readonly supportedRegions?: string[];

  /**
   * Optional DynamoDB tracking table for analytics queries.
   * When provided, enables analytics queries against document processing data.
   */
  readonly trackingTable?: ITrackingTable;

  /**
   * Optional S3 bucket for Athena query results.
   * When provided, enables Athena-based analytics queries.
   */
  readonly athenaBucket?: s3.IBucket;

  /**
   * Optional Athena database name for analytics queries.
   * Used for querying processed document data through Athena.
   */
  readonly athenaDatabase?: string;
}

/**
 * MCP Integration construct for external application access.
 *
 * Provides Model Context Protocol (MCP) integration capabilities including:
 * - AgentCore Gateway deployment with OAuth 2.0 authentication
 * - Analytics agent for natural language queries
 * - Cross-region support for global access
 * - Integration with Cognito for secure authentication
 *
 * MCP Integration enables external applications (like IDEs, chat clients, etc.)
 * to interact with the document processing system through a standardized protocol.
 *
 * @since v0.4.8
 */
export class MCPIntegration extends Construct implements IMCPIntegration {
  /**
   * AgentCore Gateway endpoint for MCP access.
   */
  public readonly gatewayEndpoint: string;

  /**
   * Cognito client ID for OAuth 2.0 authentication.
   */
  public readonly clientId: string;

  /**
   * Lambda function for analytics agent operations.
   */
  public readonly analyticsAgentFunction: lambda.IFunction;

  /**
   * AgentCore Gateway deployer for managing gateway lifecycle.
   */
  public readonly gatewayDeployer: AgentCoreGatewayDeployer;

  constructor(scope: Construct, id: string, props: MCPIntegrationProps) {
    super(scope, id);

    // Create Cognito app client for MCP authentication
    const appClient = props.userPool.addClient("MCPClient", {
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [cognito.OAuthScope.OPENID, cognito.OAuthScope.EMAIL],
      },
    });

    this.clientId = appClient.userPoolClientId;

    // Create analytics agent function using AgentCoreAnalyticsProcessorFunction
    this.analyticsAgentFunction = new AgentCoreAnalyticsProcessorFunction(
      this,
      "AnalyticsAgentFunction",
      {
        userPool: props.userPool,
        clientId: this.clientId,
        trackingTable: props.trackingTable,
        athenaBucket: props.athenaBucket,
        athenaDatabase: props.athenaDatabase,
        encryptionKey: props.encryptionKey,
      },
    );

    // Deploy AgentCore Gateway
    this.gatewayDeployer = new AgentCoreGatewayDeployer(
      this,
      "GatewayDeployer",
      {
        userPool: props.userPool,
        clientId: this.clientId,
        analyticsAgentFunction: this.analyticsAgentFunction,
        encryptionKey: props.encryptionKey,
        supportedRegions: props.supportedRegions,
      },
    );

    // Set the gateway endpoint from the deployer
    this.gatewayEndpoint = this.gatewayDeployer.gatewayUrl;

    // Grant permissions
    if (props.encryptionKey) {
      props.encryptionKey.grantEncryptDecrypt(this.analyticsAgentFunction);
    }
  }
}
