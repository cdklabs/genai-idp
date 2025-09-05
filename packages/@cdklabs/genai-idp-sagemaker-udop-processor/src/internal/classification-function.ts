/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { IEndpoint } from "@aws-cdk/aws-sagemaker-alpha";
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

export interface ClassificationFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the classification function.
   * Used to organize and identify metrics related to document classification.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the classification function.
   * Controls the verbosity of logs generated during classification.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The maximum number of concurrent workers for document classification.
   * Controls parallelism during the classification phase to optimize
   * throughput while managing resource utilization.
   *
   * @default 20
   */
  readonly maxWorkers?: number;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates classification results in this table.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The SageMaker endpoint used for document classification.
   * The endpoint hosts the model that performs document classification.
   */
  readonly sagemakerEndpoint: IEndpoint;

  /**
   * The DynamoDB table that stores configuration data.
   * Contains settings and parameters for the classification process.
   */
  readonly configurationTable: ITable;

  /**
   * The S3 bucket containing input documents to be classified.
   * Source of documents that need classification.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where classified documents are stored.
   * Destination for the classification results.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket for intermediate processing files.
   * Used for temporary storage during document processing workflow.
   */
  readonly workingBucket: IBucket;

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
  /**
   * Optional Bedrock guardrail to apply to classification model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines.
   */
  readonly classificationGuardrail?: bedrock.IGuardrail;
}

export class ClassificationFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ClassificationFunctionProps,
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
        "classification_function",
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
          "classification",
          "docs_service",
        ),
      ],
      timeout: Duration.seconds(900),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        MAX_WORKERS: `${props.maxWorkers ?? 20}`,
        TRACKING_TABLE: props.trackingTable.tableName,
        SAGEMAKER_ENDPOINT_NAME: props.sagemakerEndpoint.endpointName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        GUARDRAIL_ID_AND_VERSION: props.classificationGuardrail
          ? `${props.classificationGuardrail.guardrailId}:${props.classificationGuardrail.guardrailVersion}`
          : "",
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    // Grant permissions
    Metric.grantPutMetricData(this);
    props.trackingTable.grantReadWriteData(this);
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    props.configurationTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);
    props.sagemakerEndpoint.grantInvoke(this);
    props.classificationGuardrail?.grantApply(this);
  }
}
