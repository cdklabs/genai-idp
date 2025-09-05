/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration, Stack } from "aws-cdk-lib";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for the Custom Prompt Generator function.
 *
 * This function provides custom business logic injection for document processing
 * workflows in Patterns 2 and 3, enabling dynamic prompt customization based on
 * document content, business rules, or external system integrations.
 */
export interface CustomPromptGeneratorFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to custom prompt generation.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during prompt customization.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table containing configuration data.
   * Used to load customer-specific configurations and business rules.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Used to access document context and processing history.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket where source documents are stored.
   * Used to access document content for prompt customization.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents are stored.
   * Used to store customized prompts and processing artifacts.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket for temporary working files during processing.
   * Used for intermediate prompt generation artifacts.
   */
  readonly workingBucket: IBucket;

  /**
   * The KMS key used for encryption.
   * Applied to all encrypted resources and operations.
   */
  readonly encryptionKey?: IKey;
}

/**
 * Lambda function for custom prompt generation.
 *
 * This function implements custom business logic for prompt generation in document
 * processing workflows. It receives template placeholders and returns customized
 * prompts based on document content, business rules, or external integrations.
 *
 * Key features:
 * - Template placeholder support (DOCUMENT_TEXT, DOCUMENT_CLASS, etc.)
 * - Business rule integration
 * - External system connectivity
 * - Fail-fast error handling
 * - Comprehensive logging and observability
 */
export class CustomPromptGeneratorFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: CustomPromptGeneratorFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "custom_prompt_generator",
      ),
      handler: "index.lambda_handler",
      runtime: Runtime.PYTHON_3_12,
      memorySize: 512,
      timeout: Duration.minutes(5),
      environment: {
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        METRIC_NAMESPACE: props.metricNamespace,
        CONFIGURATION_TABLE: props.configurationTable.tableName,
        TRACKING_TABLE: props.trackingTable.tableName,
        INPUT_BUCKET: props.inputBucket.bucketName,
        OUTPUT_BUCKET: props.outputBucket.bucketName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        ...(props.encryptionKey && { KMS_KEY_ID: props.encryptionKey.keyId }),
      },
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope))],
      logGroup: props.logGroup,
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets,
      securityGroups: props.securityGroups,
    });

    // Grant permissions to read configuration and tracking tables
    props.configurationTable.grantReadData(this);
    props.trackingTable.grantReadWriteData(this);

    // Grant access to S3 buckets for document processing
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);

    // Grant KMS permissions if encryption key is provided
    if (props.encryptionKey) {
      props.encryptionKey.grantDecrypt(this);
      props.encryptionKey.grantEncrypt(this);
    }
  }
}
