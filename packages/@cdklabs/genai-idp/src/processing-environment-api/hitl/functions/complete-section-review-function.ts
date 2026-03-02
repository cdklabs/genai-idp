/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { ITrackingTable } from "../../../tracking-table";

/**
 * Properties for the Complete Section Review function.
 *
 * This function handles the completion of section-level reviews in the HITL workflow.
 * It updates the tracking table with review results and triggers downstream processing.
 *
 * @since v0.4.16
 */
export interface CompleteSectionReviewFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for tracking document processing.
   * The function uses this table to update section review status and results.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that completes section-level reviews in the HITL workflow.
 *
 * This function handles the completion of human-in-the-loop section reviews,
 * updating the tracking table with review results and preserving metadata
 * such as estimated costs and page/section alignment.
 *
 * Key features:
 * - Handles Decimal serialization for DynamoDB
 * - Preserves estimated cost information
 * - Maintains page/section alignment
 * - Updates review status in tracking table
 *
 * @since v0.4.16
 */
export class CompleteSectionReviewFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: CompleteSectionReviewFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.X86_64,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "complete_section_review",
      ),
      timeout: cdk.Duration.minutes(15),
      memorySize: 1024,
      environment: {
        TRACKING_TABLE_NAME: props.trackingTable.tableName,
      },
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
