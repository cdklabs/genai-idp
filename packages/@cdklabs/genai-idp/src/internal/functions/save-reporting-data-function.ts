/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration } from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { IReportingEnvironment } from "../../reporting";

/**
 * Properties for configuring the SaveReportingDataFunction.
 * This function saves document evaluation data to the reporting bucket in Parquet format.
 */
export interface SaveReportingDataFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The reporting environment containing the S3 bucket and Glue tables.
   * Used to store evaluation metrics and reporting data.
   */
  readonly reportingEnvironment: IReportingEnvironment;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The function reads extraction results from this bucket for evaluation.
   */
  readonly outputBucket: IBucket;

  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to reporting operations.
   */
  readonly metricNamespace: string;
}

/**
 * A Lambda function that saves document evaluation data to the reporting bucket.
 *
 * This function processes evaluation results and stores them in Parquet format
 * in the reporting S3 bucket, organized by date and document type for efficient
 * querying with Amazon Athena.
 *
 * The function handles:
 * - Document-level evaluation metrics
 * - Section-level evaluation metrics
 * - Attribute-level evaluation metrics
 * - Metering data for cost tracking
 */
export class SaveReportingDataFunction extends PythonFunction {
  /**
   * Creates a new SaveReportingDataFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: SaveReportingDataFunctionProps,
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
        "save_reporting_data",
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
            // Copy source files to temporary directory
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
      layers: [IdpPythonLayerVersion.getOrCreate(scope, "reporting")],
      timeout: Duration.minutes(5),
      memorySize: 1024,
      environment: {
        LOG_LEVEL: "INFO", // Default log level
        METRIC_NAMESPACE: props.metricNamespace,
      },
    });

    // Grant permissions to write to the reporting bucket
    props.reportingEnvironment.reportingBucket.grantReadWrite(this);

    // Grant permissions to read from the output bucket
    props.outputBucket.grantRead(this);

    // Grant permissions to put CloudWatch metrics
    cloudwatch.Metric.grantPutMetricData(this);

    // Grant KMS permissions if encryption key is provided
    if (props.environmentEncryption) {
      props.environmentEncryption.grantEncryptDecrypt(this);
    }
  }
}
