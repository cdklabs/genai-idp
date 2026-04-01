/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
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
 * Properties for the BDA Process Results function.
 *
 * This function processes BDA data automation results and writes them to the
 * tracking table. It has a unique `DB_NAME` environment variable pointing to
 * a BDA metadata table for storing execution records.
 *
 * @since 0.5.2
 */
export interface BdaProcessResultsFunctionProps extends IdpPythonFunctionOptions {
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
   * The DynamoDB table for BDA metadata records.
   * Stores execution_id/record_number pairs for BDA processing.
   * This table is specific to BDA result processing.
   */
  readonly bdaMetadataTable: dynamodb.ITable;

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
 * Lambda function that processes BDA data automation results.
 *
 * This function handles the output from Amazon Bedrock Data Automation jobs,
 * parsing results and writing structured data to the tracking table. It uses
 * a dedicated BDA metadata table (`DB_NAME`) for storing execution records.
 *
 * Environment variables:
 * - METRIC_NAMESPACE: CloudWatch metric namespace (stack name)
 * - LOG_LEVEL: Logging level
 * - APPSYNC_API_URL: Optional AppSync endpoint for real-time updates
 * - TRACKING_TABLE: Document tracking table name
 * - DOCUMENT_TRACKING_MODE: 'appsync' or 'dynamodb' based on AppSync URL presence
 * - DB_NAME: BDA metadata table name (function-specific)
 * - WORKING_BUCKET: Working bucket name for intermediate files
 * - CONFIGURATION_TABLE_NAME: Configuration table name
 *
 * Note: This function also needs SSM parameter access and BDA API permissions
 * (bedrock:GetDataAutomationProject, etc.), which are granted in the parent construct.
 *
 * @since 0.5.2
 */
export class BdaProcessResultsFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: BdaProcessResultsFunctionProps,
  ) {
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
        "bda_processresults_function",
      ),
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: cdk.Stack.of(scope).stackName,
        LOG_LEVEL: "WARN",
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.appSyncApiUrl ? "appsync" : "dynamodb",
        DB_NAME: props.bdaMetadataTable.tableName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
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
    props.bdaMetadataTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
