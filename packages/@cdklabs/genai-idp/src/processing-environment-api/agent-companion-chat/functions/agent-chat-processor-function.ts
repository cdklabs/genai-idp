/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../../configuration-table";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../../idp-python-layer-version";
import { ITrackingTable } from "../../../tracking-table";
import { IMessagesTable } from "../messages-table";
import { ISessionTable } from "../session-table";

/**
 * Properties for the Agent Chat Processor function.
 *
 * This function processes agent chat messages with streaming support,
 * creating a conversational orchestrator with all registered agents
 * and streaming responses in real-time via AppSync subscriptions.
 */
export interface AgentChatProcessorFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for chat session storage.
   * The function uses this table to manage conversation sessions.
   */
  readonly sessionTable: ISessionTable;

  /**
   * The DynamoDB table for chat messages storage.
   * The function uses this table to store individual messages and conversation turns.
   */
  readonly messagesTable: IMessagesTable;

  /**
   * The DynamoDB table for configuration settings.
   * Used to retrieve document schemas and processing configurations.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The DynamoDB table for tracking document processing status.
   * Used by analytics agent to query processing history and status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The Lambda function for looking up document information.
   * Used to retrieve document metadata and processing status.
   */
  readonly lookupFunction: lambda.IFunction;

  /**
   * The AppSync GraphQL API URL for streaming responses.
   * Used to publish incremental responses via subscriptions.
   */
  readonly appsyncApiUrl: string;

  /**
   * The Athena database for analytics queries.
   * Used by analytics agent to query processing metrics.
   */
  readonly athenaDatabase?: string;

  /**
   * The S3 location for Athena query results.
   * Used to store intermediate query results.
   */
  readonly athenaOutputLocation?: string;

  /**
   * The AWS Stack name for resource identification.
   * Used to identify CloudWatch log groups and other stack resources.
   */
  readonly stackName: string;

  /**
   * Optional Bedrock Guardrail ID and version.
   * Format: "guardrailId:version"
   * Used to apply content filtering to agent responses.
   */
  readonly guardrailIdAndVersion?: string;

  /**
   * CloudWatch log group prefix for the stack.
   * Used to identify log groups for error analysis.
   */
  readonly cloudWatchLogGroupPrefix: string;

  /**
   * Comma-separated list of CloudWatch log group names.
   * Used by error analyzer agent to search logs.
   *
   * @default - Empty string (agent will discover log groups dynamically)
   */
  readonly cloudWatchLogGroups?: string;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
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
   * Data retention period for chat messages and sessions.
   * Controls TTL for chat messages and sessions.
   *
   * @default Duration.days(30)
   */
  readonly dataRetention?: cdk.Duration;

  /**
   * Maximum number of conversation turns to keep in memory.
   * Controls the sliding window for conversation history.
   *
   * @default 20
   */
  readonly maxConversationTurns?: number;

  /**
   * Maximum message size in kilobytes.
   * Controls the size limit for individual messages.
   *
   * @default 8.5
   */
  readonly maxMessageSizeKb?: number;

  /**
   * The AWS region for Bedrock API calls.
   * Used to invoke Bedrock models for agent responses.
   *
   * @default - Current stack region
   */
  readonly bedrockRegion?: string;

  /**
   * Memory method for conversation history.
   * Determines how conversation history is stored and retrieved.
   *
   * @default "dynamodb"
   */
  readonly memoryMethod?: string;

  /**
   * Enable streaming responses.
   * When enabled, responses are streamed incrementally via AppSync.
   *
   * @default true
   */
  readonly streamingEnabled?: boolean;

  /**
   * The log level for Strands agent framework.
   * Controls verbosity of agent orchestration logs.
   *
   * @default - Same as function log level
   */
  readonly strandsLogLevel?: string;
}

/**
 * Lambda function that processes agent chat messages with streaming support.
 *
 * This function creates a conversational orchestrator with all registered agents
 * and streams responses in real-time via AppSync subscriptions.
 */
export class AgentChatProcessorFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: AgentChatProcessorFunctionProps,
  ) {
    const stack = Stack.of(scope);
    const bedrockRegion = props.bedrockRegion ?? stack.region;
    const dataRetention = props.dataRetention ?? cdk.Duration.days(30);
    const maxConversationTurns = props.maxConversationTurns ?? 20;
    const maxMessageSizeKb = props.maxMessageSizeKb ?? 8.5;
    const memoryMethod = props.memoryMethod ?? "dynamodb";
    const streamingEnabled = props.streamingEnabled ?? true;
    const strandsLogLevel = props.strandsLogLevel ?? "INFO";

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
        "agent_chat_processor",
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
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope), "agents")],
      timeout: cdk.Duration.minutes(10),
      memorySize: 1024,
      environment: {
        LOG_LEVEL: "INFO",
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        TRACKING_TABLE_NAME: props.trackingTable.tableName,
        LOOKUP_FUNCTION_NAME: props.lookupFunction.functionName,
        STRANDS_LOG_LEVEL: strandsLogLevel,
        BEDROCK_REGION: bedrockRegion,
        CHAT_MESSAGES_TABLE: props.messagesTable.tableName,
        ID_HELPER_CHAT_MEMORY_TABLE: props.sessionTable.tableName,
        MEMORY_METHOD: memoryMethod,
        STREAMING_ENABLED: streamingEnabled.toString(),
        MAX_CONVERSATION_TURNS: maxConversationTurns.toString(),
        MAX_MESSAGE_SIZE_KB: maxMessageSizeKb.toString(),
        DATA_RETENTION_DAYS: dataRetention.toDays().toString(),
        APPSYNC_API_URL: props.appsyncApiUrl,
        ATHENA_DATABASE: props.athenaDatabase ?? "",
        ATHENA_OUTPUT_LOCATION: props.athenaOutputLocation ?? "",
        AWS_STACK_NAME: props.stackName,
        GUARDRAIL_ID_AND_VERSION: props.guardrailIdAndVersion ?? "",
        CLOUDWATCH_LOG_GROUP_PREFIX: props.cloudWatchLogGroupPrefix,
        CLOUDWATCH_LOG_GROUPS: props.cloudWatchLogGroups ?? "",
        ENABLE_CODE_INTELLIGENCE: props.enableCodeIntelligence
          ? "true"
          : "false",
      },
    });

    // Grant permissions
    props.sessionTable.grantReadWriteData(this);
    props.messagesTable.grantReadWriteData(this);
    props.configurationTable.grantReadData(this);
    props.trackingTable.grantReadData(this);
    props.lookupFunction.grantInvoke(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
