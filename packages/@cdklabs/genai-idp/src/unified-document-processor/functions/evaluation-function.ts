/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { ITrackingTable } from "../../tracking-table";
import { VpcConfiguration } from "../../vpc-configuration";

/**
 * Properties for the Evaluation function.
 *
 * This function evaluates document processing results against baselines.
 * It has the most environment variables of any function (12), including
 * reporting-specific variables for metrics and baseline comparison.
 *
 * @since 0.5.2
 */
export interface EvaluationFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for tracking document processing status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for configuration storage.
   */
  readonly configurationTable: IConfigurationTable;

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
   * The S3 bucket for evaluation reporting output.
   */
  readonly reportingBucket: s3.IBucket;

  /**
   * The S3 bucket for evaluation baselines.
   */
  readonly baselineBucket: s3.IBucket;

  /**
   * The name of the SaveReporting Lambda function for persisting evaluation reports.
   */
  readonly saveReportingFunctionName: string;

  /**
   * Optional AppSync API URL for document tracking via GraphQL mutations.
   * When provided, the function uses AppSync for real-time document status updates.
   */
  readonly appSyncApiUrl?: string;

  /**
   * Optional KMS encryption key.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional VPC configuration for the Lambda function.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Lambda function that evaluates document processing results.
 *
 * This function evaluates processing output against baselines and generates
 * evaluation metrics. It has the most environment variables of any function (12),
 * including reporting-specific variables for metrics and baseline comparison.
 * It needs Bedrock model invoke and Lambda invoke for SaveReportingFunction
 * permissions, granted in the parent construct.
 *
 * Environment variables:
 * - LOG_LEVEL: Logging level
 * - METRIC_NAMESPACE: CloudWatch metric namespace (stack name)
 * - APPSYNC_API_URL: Optional AppSync endpoint for real-time updates
 * - PROCESSING_OUTPUT_BUCKET: S3 bucket for processing output (same as outputBucket)
 * - EVALUATION_OUTPUT_BUCKET: S3 bucket for evaluation output (same as outputBucket)
 * - REPORTING_BUCKET: S3 bucket for reporting output
 * - BASELINE_BUCKET: S3 bucket for evaluation baselines
 * - SAVE_REPORTING_FUNCTION_NAME: Lambda function name for saving reports
 * - CONFIGURATION_TABLE_NAME: Configuration table name
 * - WORKING_BUCKET: Working bucket name for intermediate files
 * - DOCUMENT_TRACKING_MODE: 'appsync' or 'dynamodb' based on AppSync URL presence
 * - TRACKING_TABLE: Document tracking table name
 *
 * @since 0.5.2
 */
export class EvaluationFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: EvaluationFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(
        __dirname,
        "../../../assets/lambdas/unified/evaluation_function",
      ),
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        LOG_LEVEL: "WARN",
        METRIC_NAMESPACE: cdk.Stack.of(scope).stackName,
        PROCESSING_OUTPUT_BUCKET: props.outputBucket.bucketName,
        EVALUATION_OUTPUT_BUCKET: props.outputBucket.bucketName,
        REPORTING_BUCKET: props.reportingBucket.bucketName,
        BASELINE_BUCKET: props.baselineBucket.bucketName,
        SAVE_REPORTING_FUNCTION_NAME: props.saveReportingFunctionName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        DOCUMENT_TRACKING_MODE: props.appSyncApiUrl ? "appsync" : "dynamodb",
        TRACKING_TABLE: props.trackingTable.tableName,
        ...(props.appSyncApiUrl && {
          APPSYNC_API_URL: props.appSyncApiUrl,
        }),
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
    props.trackingTable.grantReadWriteData(this);
    props.configurationTable.grantReadData(this);
    props.workingBucket.grantReadWrite(this);
    props.outputBucket.grantReadWrite(this);
    props.reportingBucket.grantReadWrite(this);
    props.baselineBucket.grantRead(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
