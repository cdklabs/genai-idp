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
 * Properties for the BDA Completion function.
 *
 * This function handles BDA job completion events and signals the Step Functions
 * state machine via SendTaskSuccess/SendTaskFailure.
 *
 * @since 0.5.2
 */
export interface BdaCompletionFunctionProps extends IdpPythonFunctionOptions {
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
   * Optional KMS encryption key.
   */
  readonly encryptionKey?: kms.IKey;
  /**
   * Optional VPC configuration for the Lambda function.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Lambda function that handles BDA job completion events.
 *
 * This function is triggered by EventBridge rules when BDA data automation jobs complete.
 * It calls `states:SendTaskSuccess` or `states:SendTaskFailure` to resume the Step Functions
 * state machine that is waiting on a task token. It is NOT referenced in the ASL workflow
 * directly — it operates externally as a callback handler.
 *
 * Environment variables:
 * - TRACKING_TABLE: Document tracking table name
 * - METRIC_NAMESPACE: CloudWatch metric namespace (stack name)
 * - LOG_LEVEL: Logging level
 *
 * Note: This function needs `states:SendTaskSuccess` and `states:SendTaskFailure`
 * permissions on the state machine, which are granted in the parent construct (Task 0.10).
 *
 * @since 0.5.2
 */
export class BdaCompletionFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: BdaCompletionFunctionProps,
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
        "bda_completion_function",
      ),
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        METRIC_NAMESPACE: cdk.Stack.of(scope).stackName,
        LOG_LEVEL: "WARN",
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
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
