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
 * Properties for the Rule Validation Orchestration function.
 *
 * This function orchestrates rule validation across document sections and
 * aggregates results. It supports optional Bedrock Guardrails for content
 * filtering and integrates with the reporting system.
 *
 * @since 0.5.2
 */
export interface RuleValidationOrchestrationFunctionProps
  extends IdpPythonFunctionOptions {
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
   * The S3 bucket for reporting output.
   */
  readonly reportingBucket: s3.IBucket;

  /**
   * The name of the SaveReporting Lambda function for persisting reports.
   */
  readonly saveReportingFunctionName: string;

  /**
   * Optional Bedrock Guardrail ID for content filtering.
   * Must be provided together with `guardrailVersion`.
   */
  readonly guardrailId?: string;

  /**
   * Optional Bedrock Guardrail version.
   * Must be provided together with `guardrailId`.
   */
  readonly guardrailVersion?: string;

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
 * Lambda function that orchestrates rule validation across document sections.
 *
 * This function aggregates rule validation results from individual section
 * validations and produces a consolidated validation report. It supports
 * optional Bedrock Guardrails for content filtering and integrates with
 * the reporting system via SaveReportingFunction.
 *
 * Environment variables:
 * - METRIC_NAMESPACE: CloudWatch metric namespace (stack name)
 * - CONFIGURATION_TABLE_NAME: Configuration table name
 * - GUARDRAIL_ID_AND_VERSION: Optional Bedrock Guardrail ID:Version string
 * - LOG_LEVEL: Logging level
 * - APPSYNC_API_URL: Optional AppSync endpoint for real-time updates
 * - TRACKING_TABLE: Document tracking table name
 * - DOCUMENT_TRACKING_MODE: 'appsync' or 'dynamodb' based on AppSync URL presence
 * - WORKING_BUCKET: Working bucket name for intermediate files
 * - REPORTING_BUCKET: S3 bucket for reporting output
 * - SAVE_REPORTING_FUNCTION_NAME: Lambda function name for saving reports
 *
 * Note: This function needs Bedrock model invoke, Lambda invoke for
 * SaveReportingFunction, and optional Guardrail apply permissions,
 * granted in the parent construct.
 *
 * @since 0.5.2
 */
export class RuleValidationOrchestrationFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: RuleValidationOrchestrationFunctionProps,
  ) {
    const guardrailIdAndVersion =
      props.guardrailId && props.guardrailVersion
        ? `${props.guardrailId}:${props.guardrailVersion}`
        : "";

    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(
        __dirname,
        "../../../assets/lambdas/unified/rule-validation-orchestration-function",
      ),
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: cdk.Stack.of(scope).stackName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        GUARDRAIL_ID_AND_VERSION: guardrailIdAndVersion,
        LOG_LEVEL: "WARN",
        TRACKING_TABLE: props.trackingTable.tableName,
        DOCUMENT_TRACKING_MODE: props.appSyncApiUrl ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
        REPORTING_BUCKET: props.reportingBucket.bucketName,
        SAVE_REPORTING_FUNCTION_NAME: props.saveReportingFunctionName,
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
    props.reportingBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
