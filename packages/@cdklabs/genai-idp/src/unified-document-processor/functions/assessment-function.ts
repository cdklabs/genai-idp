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
      architecture: lambda.Architecture.ARM_64,
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
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: cdk.Stack.of(scope).stackName,
        CONFIGURATION_BUCKET: props.configurationBucket.bucketName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        LOG_LEVEL: "WARN",
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.appSyncApiUrl ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
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
    props.configurationBucket.grantRead(this);
    props.workingBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
