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

export interface ExtractionFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the extraction function.
   * Used to organize and identify metrics related to document extraction.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the extraction function.
   * Controls the verbosity of logs generated during extraction.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that stores configuration data.
   * Contains settings and parameters for the extraction process.
   */
  readonly configurationTable: ITable;

  readonly trackingTable: ITrackingTable;
  /**
   * The S3 bucket containing input documents to be extracted.
   * Source of documents that need extraction.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where extracted documents are stored.
   * Destination for the extraction results.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket used for temporary working files during processing.
   * Used to store intermediate results and compressed document data.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: IKey;

  /**
   * The Bedrock model to use for extraction.
   * The AI model that will extract information from documents.
   */
  readonly extractionModel: bedrock.IInvokable;

  /**
   * Optional Bedrock guardrail to apply to extraction model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines.
   */
  readonly extractionGuardrail?: bedrock.IGuardrail;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status
   * and notify clients about processing progress.
   */
  readonly api?: IProcessingEnvironmentApi;
}

export class ExtractionFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: ExtractionFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "extraction_function",
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
        IdpPythonLayerVersion.getOrCreate(
          Stack.of(scope),
          "extraction",
          "docs_service",
        ),
      ],
      timeout: Duration.seconds(900),
      memorySize: 512,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        GUARDRAIL_ID_AND_VERSION: props.extractionGuardrail
          ? `${props.extractionGuardrail.guardrailId}:${props.extractionGuardrail.guardrailVersion}`
          : "",
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    props.configurationTable.grantReadWriteData(this);
    Metric.grantPutMetricData(this);
    props.trackingTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    props.extractionModel.grantInvoke(this);
    props.extractionGuardrail?.grantApply(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
  }
}
