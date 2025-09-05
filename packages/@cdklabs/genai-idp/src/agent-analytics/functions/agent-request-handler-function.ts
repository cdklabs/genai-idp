/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration, Stack } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { IKey } from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";

/**
 * Properties for the Agent Request Handler function.
 */
export interface AgentRequestHandlerFunctionProps
  extends IdpPythonFunctionOptions {
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
   * The agent processor function to invoke for processing queries.
   */
  readonly agentProcessorFunction: lambda.IFunction;

  /**
   * Data retention period in days.
   * @default 30
   */
  readonly dataRetentionDays?: number;

  /**
   * The KMS key used for encryption.
   */
  readonly encryptionKey?: IKey;
}

/**
 * Lambda function for handling agent query requests.
 *
 * This function receives agent query requests from the GraphQL API and manages
 * the job lifecycle, including creating job records and invoking the agent processor.
 */
export class AgentRequestHandlerFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: AgentRequestHandlerFunctionProps,
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
        "agent_request_handler",
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
      memorySize: 512,
      timeout: Duration.minutes(1),
      environment: {
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        AGENT_TABLE: props.agentTable.tableName,
        AGENT_PROCESSOR_FUNCTION: props.agentProcessorFunction.functionName,
        DATA_RETENTION_DAYS: props.dataRetentionDays?.toString() ?? "30",
        METRIC_NAMESPACE: props.metricNamespace,
        ...(props.encryptionKey && { KMS_KEY_ID: props.encryptionKey.keyId }),
      },
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope))],
    });

    // Grant permissions to read/write agent table
    props.agentTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Grant permission to invoke agent processor function
    props.agentProcessorFunction.grantInvoke(this);
  }
}
