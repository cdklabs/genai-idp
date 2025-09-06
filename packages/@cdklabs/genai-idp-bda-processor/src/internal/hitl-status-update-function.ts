/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import {
  IdpPythonFunctionOptions,
  ITrackingTable,
  LogLevel,
} from "@cdklabs/genai-idp";
import { Duration } from "aws-cdk-lib";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

/**
 * Properties for the HITL status update function.
 *
 * This function is responsible for updating document HITL metadata
 * after HITL completion, marking sections as reviewed and updating
 * the document status.
 */
export interface HitlStatusUpdateFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to HITL status updates,
   * including completion counts and processing times.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during HITL status updates.
   * Higher log levels provide more detailed information for troubleshooting.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates this table with HITL completion status when
   * human review is completed.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The function updates documents in this bucket to reflect HITL completion status.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function, including
   * document content, metadata, and any sensitive information.
   */
  readonly encryptionKey?: IKey;
}

export class HitlStatusUpdateFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: HitlStatusUpdateFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "hitl-status-update-function",
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
      timeout: Duration.minutes(5),
      memorySize: 256,
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        METRIC_NAMESPACE: props.metricNamespace,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
      },
    });
    props.outputBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    props.trackingTable.grantFullAccess(this);
    Metric.grantPutMetricData(this);
  }
}
