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
import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { Duration, Stack } from "aws-cdk-lib";
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

/**
 * Properties for the summarization function.
 *
 * This function generates concise summaries of processed documents using
 * foundation models, providing a quick overview of document content and
 * key information extracted during processing.
 */
export interface SummarizationFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the summarization function.
   * Used to organize and identify metrics related to document summarization,
   * including processing times, token usage, and model performance.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the summarization function.
   * Controls the verbosity of logs generated during summarization.
   * Higher log levels provide more detailed information for troubleshooting
   * model interactions and summary generation.
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
   * The DynamoDB table that stores configuration data.
   * Contains settings and parameters for the summarization process,
   * including prompt templates, model parameters, and customization options.
   */
  readonly configurationTable: ITable;

  /**
   * The S3 bucket containing input documents to be summarized.
   * The function reads processed document content and extraction results
   * from this bucket to generate comprehensive summaries.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where summarized documents are stored.
   * The function writes generated summaries to this bucket for
   * downstream consumption and user presentation.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Used for temporary storage of files during the post-processing workflow,
   * such as intermediate JSON transformations or validation results.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function, including
   * document content, extraction results, and generated summaries.
   */
  readonly encryptionKey?: IKey;

  /**
   * Optional Bedrock model to use for summarization.
   * The AI foundation model that will generate document summaries,
   * such as Claude or Titan Text models with appropriate capabilities.
   */
  readonly summarizationModel?: bedrock.IInvokable;

  /**
   * Optional Bedrock guardrail to apply to summarization model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   * Particularly important for maintaining summary quality and compliance.
   */
  readonly summarizationGuardrail?: bedrock.IGuardrail;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status
   * and notify clients about processing progress.
   */
  readonly api?: IProcessingEnvironmentApi;
}

export class SummarizationFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: SummarizationFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "summarization_function",
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
      layers: [
        IdpPythonLayerVersion.getOrCreate(
          Stack.of(scope),
          "summarization",
          "appsync",
        ),
      ],
      timeout: Duration.seconds(900),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        GUARDRAIL_ID_AND_VERSION: props.summarizationGuardrail
          ? `${props.summarizationGuardrail.guardrailId}:${props.summarizationGuardrail.guardrailVersion}`
          : "",
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    Metric.grantPutMetricData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    props.trackingTable.grantReadWriteData(this);
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    props.configurationTable.grantReadWriteData(this);
    props.summarizationModel?.grantInvoke(this);
    props.summarizationGuardrail?.grantApply(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
