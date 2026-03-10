/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IGuardrail } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { IDatabase } from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";
import { AgentChatProcessorFunction } from "./functions";
import * as agentCompanionChatFunctions from "./functions";
import { IMessagesTable } from "./messages-table";
import { ISessionTable } from "./session-table";
import { IConfigurationTable } from "../../configuration-table";
import { ITrackingTable } from "../../tracking-table";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IApiFeature,
} from "../processing-environment-api";

/**
 * Interface for Agent Companion Chat construct.
 *
 * Provides interactive AI assistant with multi-agent orchestration.
 * Enables session-based chat with real-time streaming through AppSync.
 *
 */
export interface IAgentCompanionChat extends IConstruct {
  /**
   * DynamoDB table for chat session storage.
   */
  readonly sessionTable: ISessionTable;

  /**
   * DynamoDB table for chat messages storage.
   */
  readonly messagesTable: IMessagesTable;

  /**
   * Lambda function for agent orchestration.
   */
  readonly orchestratorFunction: lambda.IFunction;

  /**
   * Optional data sources for chat context.
   */
  readonly chatDataSources?: string[];
}

/**
 * Properties for AgentCompanionChat construct.
 *
 */
export interface AgentCompanionChatProps {
  /**
   * DynamoDB table for chat session storage.
   * Consumers are responsible for configuring billing mode, encryption,
   * point-in-time recovery, and removal policy.
   */
  readonly sessionTable: ISessionTable;

  /**
   * DynamoDB table for chat messages storage.
   * Consumers are responsible for configuring billing mode, encryption,
   * point-in-time recovery, and removal policy.
   */
  readonly messagesTable: IMessagesTable;

  /**
   * The DynamoDB table for configuration settings.
   * Required for agent access to document schemas and processing configurations.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The DynamoDB table for tracking document processing status.
   * Required for analytics agent to query processing history.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The Lambda function for looking up document information.
   * Required for retrieving document metadata and processing status.
   */
  readonly lookupFunction: lambda.IFunction;

  /**
   * CloudWatch log group prefix for the stack.
   * Required for identifying log groups for error analysis.
   */
  readonly cloudWatchLogGroupPrefix: string;

  /**
   * Comma-separated list of CloudWatch log group names.
   * Used by error analyzer agent to search logs.
   *
   * @default - Agent will discover log groups dynamically using the prefix
   */
  readonly cloudWatchLogGroups?: string;

  /**
   * Optional Athena database for analytics queries.
   * Used by analytics agent to query processing metrics.
   */
  readonly athenaDatabase?: IDatabase;

  /**
   * Optional S3 location for Athena query results.
   * Used to store intermediate query results.
   */
  readonly athenaOutputLocation?: string;

  /**
   * Optional Bedrock Guardrail for agent responses.
   * Used to apply content filtering to agent responses.
   */
  readonly guardrail?: IGuardrail;

  /**
   * Optional KMS key for encrypting chat data.
   * When provided, ensures chat sessions and messages are encrypted at rest.
   *
   * @default - AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Enable Code Intelligence agent for code-related queries.
   * When enabled, adds specialized agent for code analysis and generation.
   *
   * @default false
   */
  readonly enableCodeIntelligence?: boolean;

  /**
   * Optional data sources for chat context.
   * Provides additional context for agent responses.
   *
   * @default - No additional data sources
   */
  readonly chatDataSources?: string[];

  /**
   * Data retention period for chat messages and sessions.
   * Controls TTL for chat messages and sessions.
   *
   * @default Duration.days(30)
   */
  readonly dataRetention?: cdk.Duration;

  /**
   * The AWS region for Bedrock API calls.
   * Used to invoke Bedrock models for agent responses.
   *
   * @default - Current stack region
   */
  readonly bedrockRegion?: string;

  /**
   * Enable AWS X-Ray tracing for Lambda functions.
   * When enabled, provides distributed tracing capabilities for debugging and performance analysis.
   *
   * @default lambda.Tracing.DISABLED
   */
  readonly tracing?: lambda.Tracing;
}

/**
 * Agent Companion Chat construct for AI assistant capabilities.
 *
 * Provides comprehensive AI assistant capabilities including:
 * - Multi-agent orchestration (Analytics, Error Analyzer, General)
 * - Session-based conversation management
 * - Real-time streaming through AppSync
 * - Conversation history with sliding window (last 20 turns)
 * - Optional Code Intelligence agent
 *
 * Agent Companion Chat integrates with the ProcessingEnvironment to provide
 * intelligent assistance for document processing workflows, error diagnosis,
 * and system analytics.
 *
 */
export class AgentCompanionChat
  extends Construct
  implements IAgentCompanionChat, IApiFeature
{
  /**
   * DynamoDB table for chat session storage.
   */
  public readonly sessionTable: ISessionTable;

  /**
   * DynamoDB table for chat messages storage.
   */
  public readonly messagesTable: IMessagesTable;

  /**
   * Lambda function for agent orchestration.
   */
  public readonly orchestratorFunction: lambda.IFunction;

  /**
   * Optional data sources for chat context.
   */
  public readonly chatDataSources?: string[];

  /**
   * Private storage for AppSync API URL, set during attachTo().
   */
  private _appsyncApiUrl?: string;

  constructor(scope: Construct, id: string, props: AgentCompanionChatProps) {
    super(scope, id);

    // Validate required props
    if (!props.configurationTable) {
      throw new Error("AgentCompanionChat requires a configurationTable");
    }
    if (!props.trackingTable) {
      throw new Error("AgentCompanionChat requires a trackingTable");
    }
    if (!props.lookupFunction) {
      throw new Error("AgentCompanionChat requires a lookupFunction");
    }
    if (!props.cloudWatchLogGroupPrefix) {
      throw new Error("AgentCompanionChat requires a cloudWatchLogGroupPrefix");
    }

    const stackName = cdk.Stack.of(this).stackName;

    this.chatDataSources = props.chatDataSources;

    // Use consumer-provided tables
    this.sessionTable = props.sessionTable;
    this.messagesTable = props.messagesTable;

    // Create orchestrator function using AgentChatProcessorFunction
    // Use Lazy.string() to defer API URL resolution until attachTo() is called
    this.orchestratorFunction = new AgentChatProcessorFunction(
      this,
      "OrchestratorFunction",
      {
        sessionTable: this.sessionTable,
        messagesTable: this.messagesTable,
        configurationTable: props.configurationTable,
        trackingTable: props.trackingTable,
        lookupFunction: props.lookupFunction,
        appsyncApiUrl: cdk.Lazy.string({
          produce: () => this._appsyncApiUrl || "",
        }),
        stackName: stackName,
        cloudWatchLogGroupPrefix: props.cloudWatchLogGroupPrefix,
        cloudWatchLogGroups: props.cloudWatchLogGroups,
        athenaDatabase: props.athenaDatabase?.databaseName,
        athenaOutputLocation: props.athenaOutputLocation,
        guardrailIdAndVersion: props.guardrail
          ? `${props.guardrail.guardrailId}:${props.guardrail.guardrailVersion}`
          : undefined,
        encryptionKey: props.encryptionKey,
        enableCodeIntelligence: props.enableCodeIntelligence,
        dataRetention: props.dataRetention,
        bedrockRegion: props.bedrockRegion,
        tracing: props.tracing,
      },
    );

    // Grant permissions
    this.sessionTable.grantReadWriteData(this.orchestratorFunction);
    this.messagesTable.grantReadWriteData(this.orchestratorFunction);

    // Grant Bedrock permissions
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: [
          `arn:${cdk.Aws.PARTITION}:bedrock:*::foundation-model/*`,
          `arn:${cdk.Aws.PARTITION}:bedrock:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:inference-profile/*`,
        ],
      }),
    );

    // Grant Bedrock AgentCore permissions for Code Intelligence
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "bedrock-agentcore:InvokeAgentRuntime",
          "bedrock-agentcore:StartCodeInterpreterSession",
          "bedrock-agentcore:StopCodeInterpreterSession",
          "bedrock-agentcore:InvokeCodeInterpreter",
          "bedrock-agentcore:GetCodeInterpreterSession",
          "bedrock-agentcore:ListCodeInterpreterSessions",
        ],
        resources: [
          "*",
          `arn:${cdk.Aws.PARTITION}:bedrock-agentcore:*:aws:code-interpreter/*`,
        ],
      }),
    );

    // Grant AppSync permissions for streaming
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ["appsync:GraphQL"],
        resources: ["*"], // Will be scoped to specific API in ProcessingEnvironmentApi
      }),
    );

    // Grant CloudWatch Logs permissions for error analysis
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams",
          "logs:FilterLogEvents",
          "logs:GetLogEvents",
        ],
        resources: [
          `arn:${cdk.Aws.PARTITION}:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:${props.cloudWatchLogGroupPrefix}*`,
          `arn:${cdk.Aws.PARTITION}:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/aws/vendedlogs/states/${stackName}*`,
          `arn:${cdk.Aws.PARTITION}:logs:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:log-group:/${stackName}*`,
        ],
      }),
    );

    // Grant CloudFormation permissions for stack resource discovery
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "cloudformation:DescribeStackResources",
          "cloudformation:DescribeStacks",
        ],
        resources: [
          `arn:${cdk.Aws.PARTITION}:cloudformation:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:stack/${stackName}/*`,
        ],
      }),
    );

    // Grant Lambda invoke permissions for stack functions
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ["lambda:InvokeFunction"],
        resources: [
          `arn:${cdk.Aws.PARTITION}:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:${stackName}*`,
        ],
      }),
    );

    // Grant Step Functions permissions for execution history
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ["states:DescribeExecution", "states:GetExecutionHistory"],
        resources: [
          `arn:${cdk.Aws.PARTITION}:states:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:execution:${stackName}*`,
        ],
      }),
    );

    // Grant X-Ray permissions for trace analysis
    this.orchestratorFunction.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "xray:GetTraceSummaries",
          "xray:BatchGetTraces",
          "xray:GetServiceGraph",
        ],
        resources: ["*"],
      }),
    );

    // Grant Athena and Glue permissions if reporting is configured
    if (props.athenaDatabase && props.athenaOutputLocation) {
      this.orchestratorFunction.addToRolePolicy(
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          actions: [
            "athena:StartQueryExecution",
            "athena:GetQueryExecution",
            "athena:GetQueryResults",
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:athena:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:workgroup/primary`,
            `arn:${cdk.Aws.PARTITION}:athena:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:datacatalog/*`,
          ],
        }),
      );

      this.orchestratorFunction.addToRolePolicy(
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          actions: [
            "glue:GetTable",
            "glue:GetTables",
            "glue:GetDatabase",
            "glue:GetDatabases",
            "glue:GetPartitions",
          ],
          resources: [
            `arn:${cdk.Aws.PARTITION}:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:catalog`,
            `arn:${cdk.Aws.PARTITION}:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:database/${props.athenaDatabase.databaseName}`,
            `arn:${cdk.Aws.PARTITION}:glue:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:table/${props.athenaDatabase.databaseName}/*`,
          ],
        }),
      );
    }

    // Grant Guardrail permissions if configured
    props.guardrail?.grantApply(this.orchestratorFunction);
  }

  /**
   * Enable this Agent Companion Chat feature in the ProcessingEnvironmentApi.
   *
   * This method integrates the AI assistant functionality with the GraphQL API
   * by creating the necessary data sources and resolvers. It should be called after
   * both the API and this construct have been created.
   *
   * Example:
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const agentCompanionChat = new AgentCompanionChat(this, 'AgentCompanionChat', { ... });
   * api.enable(agentCompanionChat);
   *
   * @param api The ProcessingEnvironmentApi to enable in
   *    */
  public enableInApi(api: IProcessingEnvironmentApi): void {
    // Store the API URL for lazy resolution in the orchestrator function
    this._appsyncApiUrl = api.graphqlUrl;

    // Import the resolver functions
    const { AgentChatResolverFunction } = functions;
    const {
      ListAgentChatSessionsFunction,
      GetAgentChatMessagesFunction,
      DeleteAgentChatSessionFunction,
    } = agentCompanionChatFunctions;

    // Create agent chat resolver function (handles sendAgentChatMessage)
    const agentChatResolverFunction = new AgentChatResolverFunction(
      api as any,
      "AgentChatResolverFunction",
      {
        sessionTable: this.sessionTable,
        messagesTable: this.messagesTable,
        orchestratorFunction: this.orchestratorFunction,
        enableCodeIntelligence: true, // Default to enabled
        encryptionKey: undefined, // Will use API's encryption key
      },
    );

    // Create list sessions function
    const listAgentChatSessionsFunction = new ListAgentChatSessionsFunction(
      api as any,
      "ListAgentChatSessionsFunction",
      {
        sessionTable: this.sessionTable,
        encryptionKey: undefined, // Will use API's encryption key
      },
    );

    // Create get messages function
    const getAgentChatMessagesFunction = new GetAgentChatMessagesFunction(
      api as any,
      "GetAgentChatMessagesFunction",
      {
        messagesTable: this.messagesTable,
        encryptionKey: undefined, // Will use API's encryption key
      },
    );

    // Create delete session function
    const deleteAgentChatSessionFunction = new DeleteAgentChatSessionFunction(
      api as any,
      "DeleteAgentChatSessionFunction",
      {
        sessionTable: this.sessionTable,
        messagesTable: this.messagesTable,
        encryptionKey: undefined, // Will use API's encryption key
      },
    );

    // Create data sources
    const agentChatDataSource = api.addLambdaDataSource(
      "AgentChatDataSource",
      agentChatResolverFunction,
    );

    const listSessionsDataSource = api.addLambdaDataSource(
      "ListAgentChatSessionsDataSource",
      listAgentChatSessionsFunction,
    );

    const getMessagesDataSource = api.addLambdaDataSource(
      "GetAgentChatMessagesDataSource",
      getAgentChatMessagesFunction,
    );

    const deleteSessionDataSource = api.addLambdaDataSource(
      "DeleteAgentChatSessionDataSource",
      deleteAgentChatSessionFunction,
    );

    // Create agent chat message resolver (mutation)
    agentChatDataSource.createResolver("SendAgentChatMessageResolver", {
      typeName: "Mutation",
      fieldName: "sendAgentChatMessage",
    });

    // Create list sessions resolver (query)
    listSessionsDataSource.createResolver("ListChatSessionsResolver", {
      typeName: "Query",
      fieldName: "listChatSessions",
    });

    // Create get messages resolver (query)
    getMessagesDataSource.createResolver("GetChatMessagesResolver", {
      typeName: "Query",
      fieldName: "getChatMessages",
    });

    // Create delete session resolver (mutation)
    deleteSessionDataSource.createResolver("DeleteChatSessionResolver", {
      typeName: "Mutation",
      fieldName: "deleteChatSession",
    });
  }
}
