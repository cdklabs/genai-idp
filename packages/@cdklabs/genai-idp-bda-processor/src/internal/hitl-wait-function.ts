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
import { Construct } from "constructs";
import { IBdaMetadataTable } from "../bda-metadata-table";

/**
 * Properties for the HITL wait function.
 *
 * This function is responsible for creating task tokens for sections and pages
 * that need human review and waiting for human review to complete.
 */
export interface HitlWaitFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to HITL operations,
   * including review counts, processing times, and completion rates.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during HITL operations.
   * Higher log levels provide more detailed information for troubleshooting.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates this table with HITL task tokens and status
   * when documents are submitted for human review.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for storing BDA process records metadata.
   * Used to track individual document processing records within BDA jobs,
   * enabling detailed monitoring and HITL workflow coordination.
   */
  readonly bdaMetadataTable: IBdaMetadataTable;

  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Serves as a temporary storage location during document processing
   * for files generated during the extraction workflow.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function, including
   * document content, metadata, and any sensitive information.
   */
  readonly encryptionKey?: IKey;

  /**
   * Optional URL for the SageMaker A2I review portal.
   * Provides a link for human reviewers to access documents that require
   * manual review and correction.
   *
   * @default - No review portal URL is provided
   */
  readonly sagemakerA2IReviewPortalUrl?: string;
}

export class HitlWaitFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: HitlWaitFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "hitl-wait-function",
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
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope))],
      timeout: Duration.minutes(15),
      memorySize: 256,
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        DYNAMODB_TABLE: props.bdaMetadataTable.tableName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        METRIC_NAMESPACE: props.metricNamespace,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        SAGEMAKER_A2I_REVIEW_PORTAL_URL:
          props.sagemakerA2IReviewPortalUrl || "",
      },
    });
    props.workingBucket.grantRead(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    props.trackingTable.grantFullAccess(this);
    props.bdaMetadataTable.grantReadWriteData(this);
    Metric.grantPutMetricData(this);
  }
}
