/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";
import { IProcessingEnvironmentApi } from "../../processing-environment-api";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for the QueueSender function.
 *
 * This function is triggered when new documents are uploaded to the input bucket
 * and sends document processing requests to the document queue.
 */
export interface QueueSenderFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   */
  readonly logLevel: LogLevel;

  /**
   * The SQS queue where document processing requests are sent.
   * Provides buffering and reliable delivery of document processing requests.
   */
  readonly documentQueue: sqs.IQueue;

  readonly trackingTable: ITrackingTable;
  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * Contains the structured data output and processing artifacts.
   */
  readonly outputBucket: IBucket;

  /**
   * The retention period for document tracking data.
   * Controls how long document metadata and processing results are kept in the system.
   */
  readonly dataRetentionInDays: number;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status.
   */
  readonly api?: IProcessingEnvironmentApi;
}

/**
 * Lambda function that sends documents to the processing queue.
 * Triggered when new documents are uploaded to the input bucket.
 */
export class QueueSenderFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: QueueSenderFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "queue_sender",
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
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      layers: [IdpPythonLayerVersion.getOrCreate(scope, "docs_service")],
      timeout: cdk.Duration.seconds(30),
      deadLetterQueue: props.deadLetterQueue,
      environment: {
        LOG_LEVEL: props.logLevel,
        QUEUE_URL: props.documentQueue.queueUrl,
        TRACKING_TABLE: props.trackingTable.tableName,
        DATA_RETENTION_IN_DAYS: `${props.dataRetentionInDays}`,
        OUTPUT_BUCKET: props.outputBucket.bucketName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    props.documentQueue.grantSendMessages(this);
    props.trackingTable.grantReadWriteData(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
