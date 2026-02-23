/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
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
        "agent_chat_processor",
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
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        SESSION_TABLE_NAME: props.sessionTable.tableName,
        ENABLE_CODE_INTELLIGENCE: props.enableCodeIntelligence
          ? "true"
          : "false",
      },
    });

    // Grant permissions
    props.sessionTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
