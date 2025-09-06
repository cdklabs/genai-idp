/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import {
  IdpPythonFunctionOptions,
  IdpPythonLayerVersion,
  IProcessingEnvironmentApi,
  ITrackingTable,
  LogLevel,
} from "@cdklabs/genai-idp";
import { Duration, Stack } from "aws-cdk-lib";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface ProcessResultsFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Serves as a temporary storage location during document processing
   * for files generated during the extraction workflow.
   */
  readonly workingBucket: IBucket;

  /**
   * The namespace for CloudWatch metrics emitted by the process results function.
   * Used to organize and identify metrics related to results processing.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the process results function.
   * Controls the verbosity of logs generated during results processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket containing input documents to be processed.
   * Source of documents that need results processing.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents are stored.
   * Destination for the processing results.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: IKey;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status
   * and notify clients about processing progress.
   */
  readonly api?: IProcessingEnvironmentApi;
}

export class ProcessResultsFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ProcessResultsFunctionProps,
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
        "processresults_function",
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
      layers: [
        IdpPythonLayerVersion.getOrCreate(Stack.of(scope), "docs_service"),
      ],
      timeout: Duration.seconds(900),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    Metric.grantPutMetricData(this);
    props.trackingTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
