/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration } from "aws-cdk-lib";
import { IFunction, Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";
import { IProcessingEnvironmentApi } from "../../processing-environment-api";
import { IReportingEnvironment } from "../../reporting";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for configuring the EvaluationFunction.
 * This function evaluates extraction results against baseline documents
 * to measure accuracy and quality of the document processing.
 */
export interface EvaluationFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the evaluation function.
   * Used to organize and identify metrics related to document evaluation.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the evaluation function.
   * Controls the verbosity of logs generated during evaluation.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The function reads extraction results from this bucket for evaluation.
   */
  readonly outputBucket: IBucket;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates evaluation results in this table.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table that stores configuration settings.
   * Contains evaluation criteria and thresholds used during evaluation.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The S3 bucket where baseline documents are stored.
   * These documents contain known correct values used as ground truth for evaluation.
   */
  readonly baselineBucket: IBucket;

  /**
   * The S3 bucket used for temporary storage during document processing.
   * Contains intermediate processing artifacts and working files.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional reporting environment for analytics and evaluation capabilities.
   * When provided, enables storage and querying of evaluation metrics and processing analytics.
   */
  readonly reportingEnvironment?: IReportingEnvironment;

  /**
   * Optional Lambda function that saves reporting data to the reporting bucket.
   * When provided, the evaluation function will invoke this function to save analytics data.
   */
  readonly saveReportingDataFunction?: IFunction;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status.
   */
  readonly api?: IProcessingEnvironmentApi;
}

/**
 * A Lambda function that evaluates extraction results against baseline documents.
 *
 * This function compares the structured data extracted from documents against
 * known correct values (baselines) to measure accuracy and quality. It supports
 * multiple evaluation methods including exact match, fuzzy match, semantic similarity,
 * and LLM-based evaluation.
 */
export class EvaluationFunction extends PythonFunction {
  /**
   * Creates a new EvaluationFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(scope: Construct, id: string, props: EvaluationFunctionProps) {
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
        "evaluation_function",
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
            `rm -rf /tm p/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      layers: [
        IdpPythonLayerVersion.getOrCreate(scope, "evaluation", "docs_service"),
      ],
      timeout: Duration.seconds(30),
      environment: {
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        METRIC_NAMESPACE: props.metricNamespace,
        TRACKING_TABLE: props.trackingTable.tableName,
        PROCESSING_OUTPUT_BUCKET: props.outputBucket.bucketName,
        EVALUATION_OUTPUT_BUCKET: props.outputBucket.bucketName,
        BASELINE_BUCKET: props.baselineBucket.bucketName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
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

    props.trackingTable.grantReadWriteData(this);
    props.configurationTable.grantReadData(this);
    props.baselineBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);

    // Grant permission to invoke the save reporting data function if provided
    props.saveReportingDataFunction?.grantInvoke(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
