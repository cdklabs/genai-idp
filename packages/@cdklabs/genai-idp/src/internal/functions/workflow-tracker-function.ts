/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration } from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IConcurrencyTable } from "../../concurrency-table";
import { IdpPythonFunctionOptions } from "../../functions";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { IProcessingEnvironmentApi } from "../../processing-environment-api";
import { IReportingEnvironment } from "../../reporting";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for configuring the WorkflowTrackerFunction.
 * This function tracks the status of document processing workflows
 * and updates tracking information when workflows complete or fail.
 */
export interface WorkflowTrackerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table that manages concurrency limits for document processing.
   * Used to release concurrency slots when workflows complete.
   */
  readonly concurrencyTable: IConcurrencyTable;

  /**
   * The namespace for CloudWatch metrics emitted by the workflow tracker.
   * Used to organize and identify metrics related to document processing.
   */
  readonly metricNamespace: string;

  readonly trackintTable: ITrackingTable;
  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The function reads extraction results from this bucket when workflows complete.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket where intermediate processing artifacts and working files are stored.
   * The function reads document data from this bucket to load processed documents.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional reporting environment for analytics and evaluation capabilities.
   * When provided, enables storage and querying of evaluation metrics and processing analytics.
   */
  readonly reportingEnvironment?: IReportingEnvironment;

  /**
   * Optional Lambda function that saves reporting data to the reporting bucket.
   * When provided, the workflow tracker will invoke this function to save analytics data.
   */
  readonly saveReportingDataFunction?: IFunction;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status.
   */
  readonly api?: IProcessingEnvironmentApi;
}

/**
 * A Lambda function that tracks the status of document processing workflows.
 *
 * This function is triggered by Step Functions execution status change events
 * and updates document tracking information when workflows complete or fail.
 * It also releases concurrency slots and emits metrics about workflow execution.
 */
export class WorkflowTrackerFunction extends PythonFunction {
  /**
   * Creates a new WorkflowTrackerFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: WorkflowTrackerFunctionProps,
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
        "workflow_tracker",
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
      layers: [IdpPythonLayerVersion.getOrCreate(scope, "docs_service")],
      timeout: Duration.seconds(30),
      environment: {
        CONCURRENCY_TABLE: props.concurrencyTable.tableName,
        METRIC_NAMESPACE: props.metricNamespace,
        TRACKING_TABLE: props.trackintTable.tableName,
        OUTPUT_BUCKET: props.outputBucket.bucketName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        ...(props.reportingEnvironment && {
          REPORTING_BUCKET:
            props.reportingEnvironment.reportingBucket.bucketName,
        }),
        ...(props.saveReportingDataFunction && {
          SAVE_REPORTING_FUNCTION_NAME:
            props.saveReportingDataFunction.functionName,
        }),
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    cloudwatch.Metric.grantPutMetricData(this);
    props.trackintTable.grantReadWriteData(this);
    props.concurrencyTable.grantReadWriteData(this);
    props.workingBucket.grantReadWrite(this);

    // Grant permission to invoke the save reporting data function if provided
    if (props.saveReportingDataFunction) {
      props.saveReportingDataFunction.grantInvoke(this);
    }

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
