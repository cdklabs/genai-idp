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
 * Properties for the List Agent Chat Sessions function.
 *
 * This function lists all chat sessions for a given user.
 */
export interface ListAgentChatSessionsFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for chat session storage.
   * The function queries this table to retrieve all sessions for a user.
   */
  readonly sessionTable: ISessionTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that lists all chat sessions for a user.
 *
 * This function queries the ChatSessionsTable by userId to retrieve
 * all active chat sessions with their metadata.
 */
export class ListAgentChatSessionsFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: ListAgentChatSessionsFunctionProps,
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
        "list_agent_chat_sessions_resolver",
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
        CHAT_SESSIONS_TABLE: props.sessionTable.tableName,
      },
    });

    // Grant permissions
    props.sessionTable.grantReadData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
