/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as cr from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { AgentCoreGatewayManagerFunction } from "./functions";

/**
 * Properties for the AgentCore Gateway Deployer construct.
 */
export interface AgentCoreGatewayDeployerProps {
  /**
   * Cognito User Pool for OAuth 2.0 authentication.
   * Required for authenticating MCP client applications.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * Cognito client ID for OAuth 2.0 authentication.
   * Used to configure the gateway's JWT authorizer.
   */
  readonly clientId: string;

  /**
   * Lambda function for analytics agent operations.
   * This function will be registered as a target in the gateway.
   */
  readonly analyticsAgentFunction: lambda.IFunction;

  /**
   * Optional encryption key for the deployment function.
   * Used to encrypt/decrypt data during deployment.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Supported AWS regions for cross-region deployment.
   * The gateway will be deployed in the current region.
   *
   * @default - Current region only
   */
  readonly supportedRegions?: string[];
}

/**
 * Custom resource construct for deploying AgentCore Gateway.
 *
 * This construct creates a CloudFormation custom resource that deploys
 * an AWS Bedrock AgentCore Gateway with OAuth 2.0 authentication using
 * the provided Cognito User Pool. The gateway enables external applications
 * to access IDP analytics through the Model Context Protocol (MCP).
 *
 */
export class AgentCoreGatewayDeployer extends Construct {
  /**
   * The Lambda function that manages the gateway deployment.
   */
  public readonly gatewayManagerFunction: lambda.IFunction;

  /**
   * The custom resource that triggers the gateway deployment.
   */
  public readonly customResource: cdk.CustomResource;

  /**
   * The IAM execution role for the gateway.
   */
  public readonly gatewayExecutionRole: iam.IRole;

  constructor(
    scope: Construct,
    id: string,
    props: AgentCoreGatewayDeployerProps,
  ) {
    super(scope, id);

    // Create IAM execution role for the gateway
    this.gatewayExecutionRole = new iam.Role(this, "GatewayExecutionRole", {
      assumedBy: new iam.ServicePrincipal("bedrock-agentcore.amazonaws.com"),
      description: "Execution role for AgentCore Gateway",
      inlinePolicies: {
        GatewayExecutionPolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["lambda:InvokeFunction"],
              resources: [props.analyticsAgentFunction.functionArn],
            }),
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
              ],
              resources: ["arn:aws:logs:*:*:*"],
            }),
          ],
        }),
      },
    });

    // Create the gateway manager function
    this.gatewayManagerFunction = new AgentCoreGatewayManagerFunction(
      this,
      "GatewayManagerFunction",
      {
        userPool: props.userPool,
        clientId: props.clientId,
        analyticsLambdaArn: props.analyticsAgentFunction.functionArn,
        executionRoleArn: this.gatewayExecutionRole.roleArn,
        encryptionKey: props.encryptionKey,
      },
    );

    // Grant the gateway manager function permissions to manage AgentCore resources
    this.gatewayManagerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["bedrock-agentcore:*"],
        resources: ["*"],
      }),
    );

    // Grant permission to pass the execution role
    this.gatewayManagerFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [this.gatewayExecutionRole.roleArn],
      }),
    );

    // Create the custom resource provider
    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: this.gatewayManagerFunction,
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });

    // Create the custom resource
    this.customResource = new cdk.CustomResource(this, "Resource", {
      serviceToken: provider.serviceToken,
      properties: {
        StackName: cdk.Stack.of(this).stackName,
        Region: cdk.Stack.of(this).region,
        UserPoolId: props.userPool.userPoolId,
        ClientId: props.clientId,
        LambdaArn: props.analyticsAgentFunction.functionArn,
        ExecutionRoleArn: this.gatewayExecutionRole.roleArn,
        SupportedRegions: props.supportedRegions || [cdk.Stack.of(this).region],
        // Add a timestamp to force updates when needed
        Timestamp: new Date().toISOString(),
      },
    });

    // Add dependencies to ensure proper deployment order
    this.customResource.node.addDependency(this.gatewayManagerFunction);
    this.customResource.node.addDependency(this.gatewayExecutionRole);
    this.customResource.node.addDependency(props.analyticsAgentFunction);
  }

  /**
   * Get the gateway URL endpoint.
   */
  public get gatewayUrl(): string {
    return this.customResource.getAttString("GatewayUrl");
  }

  /**
   * Get the gateway ID.
   */
  public get gatewayId(): string {
    return this.customResource.getAttString("GatewayId");
  }

  /**
   * Get the gateway ARN.
   */
  public get gatewayArn(): string {
    return this.customResource.getAttString("GatewayArn");
  }
}
