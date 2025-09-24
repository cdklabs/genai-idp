/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { IBucket } from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IDiscoveryTable } from "../discovery-table";

/**
 * Properties for configuring the DiscoveryProcessorFunction.
 */
export interface DiscoveryProcessorFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for input documents.
   */
  readonly inputBucket: IBucket;

  /**
   * The discovery tracking table.
   */
  readonly discoveryTable: IDiscoveryTable;

  /**
   * The discovery processing queue.
   */
  readonly discoveryQueue: sqs.IQueue;

  /**
   * The AppSync API URL for status updates.
   */
  readonly appSyncApiUrl: string;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that processes discovery jobs from SQS queue.
 *
 * This function analyzes documents to identify structure, field types,
 * and organizational patterns for automated configuration generation.
 */
export class DiscoveryProcessorFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: DiscoveryProcessorFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "../../../assets/lambdas/discovery_processor",
      ),
      handler: "index.handler",
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2),
      environment: {
        DISCOVERY_TABLE_NAME: props.discoveryTable.tableName,
        INPUT_BUCKET_NAME: props.inputBucket.bucketName,
        APPSYNC_API_URL: props.appSyncApiUrl,
      },
      ...props,
    });

    // Grant permissions
    props.inputBucket.grantRead(this);
    props.discoveryTable.grantReadWriteData(this);

    // Add SQS event source
    this.addEventSource(
      new SqsEventSource(props.discoveryQueue, {
        batchSize: 1,
      }),
    );
  }
}
