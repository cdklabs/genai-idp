/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { ITrackingTable } from "../../../tracking-table";

/**
 * Properties for the AgentCore Analytics Processor function.
 *
 * This function provides analytics agent operations for MCP integration,
 * implementing the search_genaiidp tool for natural language queries
 * against the document processing system.
 */
export interface AgentCoreAnalyticsProcessorFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The Cognito User Pool for authentication.
   * Used for validating MCP client authentication.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * The Cognito client ID for OAuth 2.0 authentication.
   * Used for MCP client authentication validation.
   */
  readonly clientId: string;

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

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that provides analytics agent operations for MCP integration.
 *
 * This function implements the search_genaiidp tool for natural language queries
 * against the document processing system, enabling external applications to
 * interact with the system through the Model Context Protocol.
 */
export class AgentCoreAnalyticsProcessorFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: AgentCoreAnalyticsProcessorFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.lambda_handler",
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "agentcore_analytics_processor",
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
        USER_POOL_ID: props.userPool.userPoolId,
        CLIENT_ID: props.clientId,
        TRACKING_TABLE: props.trackingTable?.tableName || "",
        ATHENA_BUCKET: props.athenaBucket?.bucketName || "",
        ATHENA_DATABASE: props.athenaDatabase || "",
      },
    });

    // Grant DynamoDB permissions
    if (props.trackingTable) {
      props.trackingTable.grantReadData(this);
    }

    // Grant Athena permissions
    if (props.athenaBucket) {
      props.athenaBucket.grantReadWrite(this);

      // Grant Athena service permissions
      this.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "athena:StartQueryExecution",
            "athena:GetQueryExecution",
            "athena:GetQueryResults",
            "athena:StopQueryExecution",
            "athena:GetWorkGroup",
            "athena:ListQueryExecutions",
          ],
          resources: ["*"],
        }),
      );

      // Grant Glue permissions for Athena
      this.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "glue:GetDatabase",
            "glue:GetDatabases",
            "glue:GetTable",
            "glue:GetTables",
            "glue:GetPartition",
            "glue:GetPartitions",
            "glue:BatchCreatePartition",
            "glue:BatchDeletePartition",
          ],
          resources: ["*"],
        }),
      );
    }

    // Grant Bedrock permissions for analytics agent
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: ["*"],
      }),
    );

    // Grant permissions
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
