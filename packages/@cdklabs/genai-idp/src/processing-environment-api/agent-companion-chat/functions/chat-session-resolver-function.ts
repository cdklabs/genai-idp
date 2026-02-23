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
 * Properties for the Chat Session Resolver function.
 *
 * This function handles GraphQL resolvers for chat session management
 * including creating, listing, updating, and deleting chat sessions.
 */
export interface ChatSessionResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for chat session storage.
   * The function uses this table to manage conversation sessions and metadata.
   */
  readonly sessionTable: ISessionTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that handles GraphQL resolvers for chat session management.
 *
 * This function provides resolvers for:
 * - createChatSession: Create a new chat session
 * - listChatSessions: List all chat sessions for a user with pagination
 * - deleteChatSession: Delete a chat session and all its messages
 * - updateChatSessionTitle: Update the title of an existing chat session
 * - getChatSessionDetails: Get detailed information about a specific session
 */
export class ChatSessionResolverFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ChatSessionResolverFunctionProps,
  ) {
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
        "create_chat_session_resolver",
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
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      environment: {
        SESSION_TABLE_NAME: props.sessionTable.tableName,
        LOG_LEVEL: "INFO",
      },
    });

    // Grant permissions
    props.sessionTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
