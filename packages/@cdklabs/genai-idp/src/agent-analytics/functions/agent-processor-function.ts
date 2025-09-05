/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import * as glue from "@aws-cdk/aws-glue-alpha";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { Duration, Stack } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";

/**
 * Properties for the Agent Processor function.
 */
export interface AgentProcessorFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table for agent job tracking.
   */
  readonly agentTable: dynamodb.ITable;

  /**
   * AppSync GraphQL API URL for publishing updates.
   */
  readonly appSyncApiUrl: string;

  /**
   * Athena database for analytics queries.
   */
  readonly athenaDatabase: glue.IDatabase;

  /**
   * S3 bucket for Athena query results.
   */
  readonly athenaBucket: s3.IBucket;

  /**
   * The foundation model or inference profile to use for document analysis agent.
   */
  readonly model: bedrock.IInvokable;

  /**
   * The KMS key used for encryption.
   */
  readonly encryptionKey?: IKey;

  /**
   * Optional Secrets Manager secret for external MCP agents.
   */
  readonly externalMcpAgentsSecret?: secretsmanager.ISecret;
}

/**
 * Lambda function for processing agent analytics queries.
 *
 * This function processes natural language queries using AWS Bedrock AgentCore,
 * converting them to SQL queries and generating visualizations. It uses a multi-tool
 * approach with secure code execution in Bedrock sandboxes.
 */
export class AgentProcessorFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: AgentProcessorFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "agent_processor",
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
            // `rsync -rLv /asset-input/${indexPath}/ /asset-output/${indexPath}`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            // Clean up unnecessary files in the temp directory
            `find /tmp/builddir -type d -name "*.dist-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            // Copy only necessary dependencies to the output
            `rsync -rL /tmp/builddir/ /asset-output`,
            // Clean up temporary directory
            `rm -rf /tm p/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      memorySize: 1024,
      timeout: Duration.minutes(15),
      environment: {
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        STRANDS_LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        AGENT_TABLE: props.agentTable.tableName,
        APPSYNC_API_URL: props.appSyncApiUrl,
        ATHENA_DATABASE: props.athenaDatabase.databaseName,
        ATHENA_OUTPUT_LOCATION:
          props.athenaBucket.s3UrlForObject("athena-results"),
        DOCUMENT_ANALYSIS_AGENT_MODEL_ID: cdk.Fn.select(
          1,
          cdk.Fn.split("/", props.model.invokableArn),
        ),
        AWS_STACK_NAME: Stack.of(scope).stackName,
        METRIC_NAMESPACE: props.metricNamespace,
        ...(props.encryptionKey && { KMS_KEY_ID: props.encryptionKey.keyId }),
      },
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope), "agents")],
    });

    // Grant permissions to read/write agent table
    props.agentTable.grantReadWriteData(this);

    // Grant Bedrock permissions
    props.model.grantInvoke(this);

    // Grant Bedrock AgentCore permissions for code interpreter
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "bedrock-agentcore:StartCodeInterpreterSession",
          "bedrock-agentcore:StopCodeInterpreterSession",
          "bedrock-agentcore:InvokeCodeInterpreter",
          "bedrock-agentcore:GetCodeInterpreterSession",
          "bedrock-agentcore:ListCodeInterpreterSessions",
        ],
        resources: [
          `arn:${Stack.of(this).partition}:bedrock-agentcore:*:aws:code-interpreter/*`,
        ],
      }),
    );

    // Grant Athena permissions
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "athena:StartQueryExecution",
          "athena:GetQueryExecution",
          "athena:GetQueryResults",
          "athena:StopQueryExecution",
          "athena:GetWorkGroup",
          "athena:GetDataCatalog",
          "athena:GetDatabase",
          "athena:GetTableMetadata",
          "athena:ListDatabases",
          "athena:ListTableMetadata",
        ],
        resources: ["*"],
      }),
    );

    // Grant S3 permissions for Athena results
    props.athenaBucket.grantReadWrite(this);

    // Grant Glue permissions for data catalog
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "glue:GetDatabase",
          "glue:GetDatabases",
          "glue:GetTable",
          "glue:GetTables",
          "glue:GetPartitions",
        ],
        resources: ["*"],
      }),
    );

    // Grant external MCP agents secret access if provided
    if (props.externalMcpAgentsSecret) {
      props.externalMcpAgentsSecret.grantRead(this);
    }

    // Grant KMS permissions if encryption key is provided
    if (props.encryptionKey) {
      props.encryptionKey.grantDecrypt(this);
      props.encryptionKey.grantEncrypt(this);
    }
  }
}
