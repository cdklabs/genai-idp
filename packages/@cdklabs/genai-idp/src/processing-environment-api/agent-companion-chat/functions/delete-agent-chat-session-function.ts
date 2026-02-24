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
import { IMessagesTable } from "../messages-table";
import { ISessionTable } from "../session-table";

/**
 * Properties for the Delete Agent Chat Session function.
 *
 * This function deletes a chat session and all its associated messages.
 */
export interface DeleteAgentChatSessionFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for chat session storage.
   * The function deletes session metadata from this table.
   */
  readonly sessionTable: ISessionTable;

  /**
   * The DynamoDB table for chat messages storage.
   * The function deletes all messages for the session from this table.
   */
  readonly messagesTable: IMessagesTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that deletes a chat session and its messages.
 *
 * This function performs a batch delete operation to remove:
 * 1. The session metadata from ChatSessionsTable
 * 2. All messages associated with the session from ChatMessagesTable
 */
export class DeleteAgentChatSessionFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: DeleteAgentChatSessionFunctionProps,
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
        "delete_agent_chat_session_resolver",
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
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      environment: {
        LOG_LEVEL: "INFO",
        CHAT_MESSAGES_TABLE: props.messagesTable.tableName,
        CHAT_SESSIONS_TABLE: props.sessionTable.tableName,
      },
    });

    // Grant permissions
    props.sessionTable.grantReadWriteData(this);
    props.messagesTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
