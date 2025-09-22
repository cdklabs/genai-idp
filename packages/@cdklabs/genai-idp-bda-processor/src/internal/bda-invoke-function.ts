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
import { IDataAutomationProject } from "../data-automation-project";

/**
 * Properties for the BDA invoke function.
 *
 * This function is responsible for initiating Amazon Bedrock Data Automation jobs,
 * sending documents for processing, and tracking the job status.
 */
export interface BdaInvokeFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to BDA job invocation,
   * including job initiation counts, processing times, and error rates.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during BDA job invocation.
   * Higher log levels provide more detailed information for troubleshooting.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates this table with BDA job IDs and initial status
   * when jobs are submitted for processing.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket containing input documents to be processed.
   * The function reads documents from this bucket before submitting them
   * to the BDA project for processing.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The function configures the BDA job to write results to this bucket
   * upon successful completion.
   */
  readonly outputBucket: IBucket;

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
   * The Bedrock Data Automation Project used for document processing.
   * This project defines the document processing workflow in Amazon Bedrock,
   * including document types, extraction schemas, and processing rules.
   */
  readonly project: IDataAutomationProject;
}

export class BdaInvokeFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: BdaInvokeFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "bda_invoke_function",
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
      timeout: Duration.seconds(900),
      memorySize: 4096,
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        METRIC_NAMESPACE: props.metricNamespace,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
      },
    });
    props.inputBucket.grantRead(this);
    props.workingBucket.grantReadWrite(this);
    props.outputBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    props.trackingTable.grantFullAccess(this);
    Metric.grantPutMetricData(this);
    props.project.grantInvokeAsync(this);
  }
}
