/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { IGuardrail } from "@aws-cdk/aws-bedrock-alpha/bedrock";
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
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IInvokable } from "../invokable";

export interface OcrFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the OCR function.
   * Used to organize and identify metrics related to OCR processing.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the OCR function.
   * Controls the verbosity of logs generated during OCR processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The maximum number of concurrent workers for OCR processing.
   * Controls parallelism during the text extraction phase to optimize
   * throughput while managing resource utilization.
   *
   * @default 20
   */
  readonly maxWorkers?: number;

  /**
   * The DynamoDB table that stores configuration data.
   * Contains settings and parameters for the OCR process.
   */
  readonly configurationTable: ITable;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates OCR results in this table.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket containing input documents to be processed.
   * Source of documents that need OCR processing.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents are stored.
   * Destination for the OCR processing results.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket used for temporary working files during processing.
   * Used to store intermediate results and compressed document data.
   */
  readonly workingBucket: IBucket;

  /**
   * OCR backend to use for text extraction.
   * @default "textract"
   */
  readonly ocrBackend?: "textract" | "bedrock" | "none";

  /**
   * The inference provider for OCR.
   * Can be a Bedrock model or a custom Lambda function (LambdaHook).
   *
   * @default - No inference provider
   */
  readonly inferenceProvider?: IInvokable;

  /**
   * Optional Bedrock guardrail to apply to OCR model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly ocrGuardrail?: IGuardrail;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status
   * and notify clients about processing progress.
   */
  readonly api?: IProcessingEnvironmentApi;
}

/**
 * Lambda function that performs optical character recognition (OCR) on documents.
 *
 * Extracts text content from document pages using Amazon Textract or Bedrock vision models.
 * Supports multiple OCR backends including Textract for standard text extraction and
 * Bedrock for vision-based extraction of complex document layouts.
 *
 */
export class OcrFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: OcrFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "ocr_function",
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
            // Removing as they will be pulled by the Layer
            `sed -i '/numpy/d' requirements.txt || true`,
            `sed -i '/pandas/d' requirements.txt || true`,
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
        IdpPythonLayerVersion.getOrCreate(
          Stack.of(scope),
          "ocr",
          "docs_service",
        ),
      ],
      timeout: Duration.seconds(900),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        MAX_WORKERS: `${props.maxWorkers ?? 20}`,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    Metric.grantPutMetricData(this);
    props.configurationTable.grantReadWriteData(this);
    props.trackingTable.grantReadWriteData(this);

    const ocrBackend = props.ocrBackend || "textract";

    if (ocrBackend === "textract") {
      // Textract Policy
      this.addToRolePolicy(
        new PolicyStatement({
          actions: ["textract:DetectDocumentText", "textract:AnalyzeDocument"],
          resources: ["*"],
        }),
      );
    }
    // No permissions needed for "none" backend

    props.inferenceProvider?.grantInvoke(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
