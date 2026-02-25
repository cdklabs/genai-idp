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

/**
 * Properties for the Get Agent Chat Messages function.
 *
 * This function retrieves chat messages for a given session.
 */
export interface GetAgentChatMessagesFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for chat messages storage.
   * The function queries this table to retrieve conversation history.
   */
  readonly messagesTable: IMessagesTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that retrieves chat messages for a session.
 *
 * This function queries the ChatMessagesTable by PK/SK to retrieve
 * the conversation history for a specific chat session.
 */
export class GetAgentChatMessagesFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: GetAgentChatMessagesFunctionProps,
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
        "get_agent_chat_messages_resolver",
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
      },
    });

    // Grant permissions
    props.messagesTable.grantReadData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
