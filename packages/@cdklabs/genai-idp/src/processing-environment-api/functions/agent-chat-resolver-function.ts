/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";

/**
 * Properties for the Agent Chat Resolver function.
 *
 * This function handles GraphQL resolvers for agent chat operations
 * including sending messages, managing sessions, and retrieving chat history.
 */
export interface AgentChatResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for chat session storage.
   * The function uses this table to manage conversation sessions and message history.
   */
  readonly sessionTable: dynamodb.ITable;

  /**
   * The Lambda function for agent orchestration.
   * Used to process chat messages and coordinate agent responses.
   */
  readonly orchestratorFunction: lambda.IFunction;

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
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: import("../../log-level").LogLevel;
}

/**
 * Lambda function that handles GraphQL resolvers for agent chat operations.
 *
 * This function provides resolvers for:
 * - sendAgentChatMessage: Process chat messages through agent orchestrator
 * - getAgentChatMessages: Retrieve chat history for a session
 * - listChatSessions: List all chat sessions for a user
 * - deleteChatSession: Delete a chat session and its messages
 * - updateChatSessionTitle: Update the title of a chat session
 */
export class AgentChatResolverFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: AgentChatResolverFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "agent_chat_resolver",
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
      timeout: cdk.Duration.minutes(2),
      memorySize: 512,
      environment: {
        SESSION_TABLE_NAME: props.sessionTable.tableName,
        ORCHESTRATOR_FUNCTION_NAME: props.orchestratorFunction.functionName,
        ENABLE_CODE_INTELLIGENCE: props.enableCodeIntelligence
          ? "true"
          : "false",
      },
    });

    // Grant permissions
    props.sessionTable.grantReadWriteData(this);
    props.orchestratorFunction.grantInvoke(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
