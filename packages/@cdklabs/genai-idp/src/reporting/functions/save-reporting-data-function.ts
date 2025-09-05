/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the SaveReportingDataFunction.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface SaveReportingDataFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket where reporting data will be saved in Parquet format.
   */
  readonly reportingBucket: IBucket;

  /**
   * The S3 bucket containing processed document outputs for reading.
   */
  readonly outputBucket: IBucket;

  /**
   * The metric namespace for CloudWatch metrics.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that saves document evaluation data to the reporting bucket in Parquet format.
 *
 * This function is responsible for:
 * - Converting document processing metrics to Parquet format
 * - Saving evaluation data to the reporting bucket with proper partitioning
 * - Supporting document-level, section-level, and attribute-level metrics
 * - Enabling analytics and business intelligence through structured data storage
 *
 * The function is typically invoked by other Lambda functions (evaluation_function, workflow_tracker)
 * to persist processing metrics and evaluation results for later analysis with Amazon Athena.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class SaveReportingDataFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
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
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.minutes(5), // 5 minutes for data processing
      memorySize: 1024, // 1GB for Parquet processing
      description:
        "This AWS Lambda Function saves document evaluation data to the reporting bucket in Parquet format for analytics.",
      environment: {
        LOG_LEVEL: props.logLevel || LogLevel.INFO,
        METRIC_NAMESPACE: props.metricNamespace,
      },
      ...props,
    });

    // Grant permissions to read from output bucket
    props.outputBucket.grantRead(this);

    // Grant permissions to write to reporting bucket
    props.reportingBucket.grantReadWrite(this);

    // Grant permissions to publish CloudWatch metrics
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["cloudwatch:PutMetricData"],
        resources: ["*"], // CloudWatch metrics require * resource access
      }),
    );

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
