/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { IConcurrencyTable } from "../../concurrency-table";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";
import { IProcessingEnvironmentApi } from "../../processing-environment-api";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for the QueueProcessor function.
 *
 * This function processes document requests from the queue and starts
 * Step Functions executions for document processing.
 */
export interface QueueProcessorFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   */
  readonly logLevel: LogLevel;

  /**
   * The Step Functions state machine that orchestrates the document processing workflow.
   * The function starts executions of this state machine for each document.
   */
  readonly stateMachine: sfn.IStateMachine;

  /**
   * The DynamoDB table that manages concurrency limits for document processing.
   * Helps prevent overloading the system with too many concurrent document processing tasks.
   */
  readonly concurrencyTable: IConcurrencyTable;

  /**
   * The maximum number of documents that can be processed concurrently.
   * Controls the throughput and resource utilization of the document processing system.
   */
  readonly maxConcurrent: number;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates this table with document processing status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status.
   */
  readonly api?: IProcessingEnvironmentApi;
}

/**
 * Lambda function that processes document requests from the queue.
 * Starts Step Functions executions for document processing while
 * respecting concurrency limits.
 */
export class QueueProcessorFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: QueueProcessorFunctionProps,
  ) {
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
        "queue_processor",
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
      environment: {
        LOG_LEVEL: props.logLevel,
        STATE_MACHINE_ARN: props.stateMachine.stateMachineArn,
        TRACKING_TABLE: props.trackingTable.tableName,
        CONCURRENCY_TABLE: props.concurrencyTable.tableName,
        MAX_CONCURRENT: `${props.maxConcurrent}`,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    props.stateMachine.grantStartExecution(this);
    props.trackingTable.grantFullAccess(this);
    props.concurrencyTable.grantFullAccess(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
