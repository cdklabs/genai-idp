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
import { IBucket } from "aws-cdk-lib/aws-s3";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { IBdaMetadataTable } from "../bda-metadata-table";

/**
 * Properties for the HITL process function.
 *
 * This function is triggered by EventBridge when SageMaker A2I human loop status changes
 * to "Completed". It processes the human review results and continues the document
 * processing workflow by sending task success/failure to the Step Functions state machine.
 */
export interface HitlProcessFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to HITL processing,
   * including completion counts, processing times, and error rates.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during HITL processing.
   * Higher log levels provide more detailed information for troubleshooting.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function reads from this table to correlate HITL completion events
   * with the original document processing workflow.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for storing BDA process records metadata.
   * Used to track individual document processing records within BDA jobs,
   * enabling detailed monitoring and HITL workflow coordination.
   */
  readonly bdaMetadataTable: IBdaMetadataTable;

  /**
   * The S3 bucket containing input documents that were processed.
   * The function may reference original documents to correlate with
   * HITL completion results during post-processing.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Used for reading HITL results and temporary storage during processing.
   */
  readonly workingBucket: IBucket;

  /**
   * The S3 bucket where processed documents and final results are stored.
   * The function writes the final processed results after HITL completion.
   */
  readonly outputBucket: IBucket;

  /**
   * The Step Functions state machine for document processing.
   * The function sends task success/failure signals to continue the workflow
   * after human review is completed.
   */
  readonly stateMachine: IStateMachine;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function, including
   * HITL results, document content, and any sensitive information.
   */
  readonly encryptionKey?: IKey;
}

/**
 * Lambda function for processing HITL (Human-in-the-Loop) completion events.
 *
 * This function is triggered by EventBridge when SageMaker A2I human loop status changes
 * to "Completed". It processes the human review results and continues the document
 * processing workflow by sending task success/failure to the Step Functions state machine.
 */
export class HitlProcessFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: HitlProcessFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "hitl-process-function",
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
      timeout: Duration.seconds(300),
      memorySize: 512,
      environment: {
        DYNAMODB_TABLE: props.bdaMetadataTable.tableName,
        TRACKING_TABLE: props.trackingTable.tableName,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        METRIC_NAMESPACE: props.metricNamespace,
      },
    });

    // Grant permissions to access DynamoDB tables
    props.trackingTable.grantReadWriteData(this);
    props.bdaMetadataTable.grantReadWriteData(this);

    // Grant permissions to access S3 buckets
    props.inputBucket.grantRead(this);
    props.workingBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);

    // Grant permissions to send task success/failure to Step Functions
    props.stateMachine.grantTaskResponse(this);

    // Grant permissions to use the KMS key
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Grant permissions to publish CloudWatch metrics
    Metric.grantPutMetricData(this);
  }
}
