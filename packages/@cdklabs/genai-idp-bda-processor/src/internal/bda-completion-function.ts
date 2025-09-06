/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import {
  IdpPythonFunctionOptions,
  IdpPythonLayerVersion,
  ITrackingTable,
  LogLevel,
} from "@cdklabs/genai-idp";
import { Duration, Stack } from "aws-cdk-lib";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { Queue, QueueEncryption } from "aws-cdk-lib/aws-sqs";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

/**
 * Properties for the BDA completion function.
 *
 * This function handles the completion events from Amazon Bedrock Data Automation jobs,
 * updating the tracking table with job status and triggering appropriate follow-up actions.
 */
export interface BdaCompletionFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to document processing.
   * Metrics include job completion counts, processing times, and error rates.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   * Higher log levels provide more detailed information for troubleshooting.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates processing status in this table when BDA jobs complete,
   * fail, or encounter errors, maintaining the document processing lifecycle.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The dead letter queue for the function.
   * Messages that fail processing are sent to this queue for further analysis
   * and potential reprocessing.
   *
   * @default A new SQS queue is created with appropriate encryption and retention settings
   */
  readonly deadLetterQueue?: Queue;

  /**
   * The state machine that the function will interact with.
   * The function will send task responses to this state machine when BDA jobs complete,
   * allowing the workflow to continue with subsequent processing steps.
   */
  readonly stateMachine: IStateMachine;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function, including
   * document metadata, processing results, and any sensitive information.
   */
  readonly encryptionKey?: IKey;
}

export class BdaCompletionFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: BdaCompletionFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "bda_completion_function",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            // Create temporary directory for dependencies
            `mkdir -p /tmp/builddir`,
            // Copy source files directly to output
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
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope))],
      timeout: Duration.seconds(900),
      memorySize: 4096,
      deadLetterQueue:
        props.deadLetterQueue ??
        new Queue(scope, "BDACompletionFunctionDLQ", {
          encryption: QueueEncryption.KMS,
          encryptionMasterKey: props.encryptionKey,
          visibilityTimeout: Duration.seconds(30),
          retentionPeriod: Duration.days(4),
        }),
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        METRIC_NAMESPACE: props.metricNamespace,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
      },
    });

    // Grant permissions
    Metric.grantPutMetricData(this);
    props.trackingTable.grantReadData(this);
    props.stateMachine.grantTaskResponse(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
