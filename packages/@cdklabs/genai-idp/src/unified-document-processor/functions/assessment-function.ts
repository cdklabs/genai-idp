/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { IInvokable } from "../../invokable";
import { LogLevel } from "../../log-level";
import { IProcessingEnvironmentApi } from "../../processing-environment-api";
import { ITrackingTable } from "../../tracking-table";
import { VpcConfiguration } from "../../vpc-configuration";

/**
 * Properties for the Assessment function.
 *
 * This function assesses extracted document data using Bedrock model invocation.
 * It requires a configuration bucket for assessment rules.
 *
 * @since 0.5.2
 */
export interface AssessmentFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for tracking document processing status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for configuration storage.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The CloudWatch metric namespace for emitting processing metrics.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The S3 bucket for input documents.
   */
  readonly inputBucket: s3.IBucket;

  /**
   * The S3 bucket for processed output.
   */
  readonly outputBucket: s3.IBucket;

  /**
   * The S3 bucket for intermediate working files.
   */
  readonly workingBucket: s3.IBucket;

  /**
   * The S3 bucket for assessment configuration files.
   */
  readonly configurationBucket: s3.IBucket;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status.
   */
  readonly api?: IProcessingEnvironmentApi;

  /**
   * Optional KMS encryption key.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional VPC configuration for the Lambda function.
   */
  readonly vpcConfiguration?: VpcConfiguration;

  /**
   * Optional inference provider for assessment.
   * Can be a Bedrock model or a custom Lambda function (LambdaHook).
   *
   * @default - No inference provider; permissions granted in parent construct
   */
  readonly inferenceProvider?: IInvokable;
}

/**
 * Lambda function that assesses extracted document data.
 *
 * This function uses Bedrock model invocation to assess the quality and accuracy
 * of extracted data from document sections. It operates in the pipeline processing
 * branch after extraction.
 *
 * Environment variables:
 * - METRIC_NAMESPACE: CloudWatch metric namespace (stack name)
 * - CONFIGURATION_BUCKET: S3 bucket for assessment configuration
 * - CONFIGURATION_TABLE_NAME: Configuration table name
 * - LOG_LEVEL: Logging level
 * - APPSYNC_API_URL: Optional AppSync endpoint for real-time updates
 * - TRACKING_TABLE: Document tracking table name
 * - DOCUMENT_TRACKING_MODE: 'appsync' or 'dynamodb' based on AppSync URL presence
 * - WORKING_BUCKET: Working bucket name for intermediate files
 *
 * Note: This function needs Bedrock model invoke and ConfigurationBucket read
 * permissions, granted in the parent construct.
 *
 * @since 0.5.2
 */
export class AssessmentFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: AssessmentFunctionProps) {
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
        "unified",
        "assessment_function",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            `mkdir -p /tmp/builddir`,
            `mkdir -p /asset-output`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            `rsync -rL /tmp/builddir/ /asset-output`,
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      layers: [
        IdpPythonLayerVersion.getOrCreateForArchitecture(
          scope,
          lambda.Architecture.X86_64,
          "assessment",
          "docs_service",
        ),
      ],
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        CONFIGURATION_BUCKET: props.configurationBucket.bucketName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
      ...(props.vpcConfiguration && {
        vpc: props.vpcConfiguration.vpc,
        vpcSubnets: props.vpcConfiguration.vpcSubnets,
        securityGroups: props.vpcConfiguration.securityGroups,
        allowAllOutbound: props.vpcConfiguration.allowAllOutbound,
        allowAllIpv6Outbound: props.vpcConfiguration.allowAllIpv6Outbound,
      }),
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        encryption: props.encryptionKey
          ? sqs.QueueEncryption.KMS
          : sqs.QueueEncryption.SQS_MANAGED,
        encryptionMasterKey: props.encryptionKey,
        retentionPeriod: cdk.Duration.days(14),
      }),
      retryAttempts: 2,
    });

    // Grant permissions
    cloudwatch.Metric.grantPutMetricData(this);
    props.trackingTable.grantReadWriteData(this);
    props.configurationTable.grantReadData(this);
    props.configurationBucket.grantRead(this);
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    props.inferenceProvider?.grantInvoke(this);
    props.api?.grantMutation(this);
  }
}
