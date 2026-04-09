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
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for configuring the TestSetResolverFunction.
 */
export interface TestSetResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The tracking table for storing test set metadata.
   * This table stores test set information and status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket for storing test documents and baselines.
   * Used for test set file management operations.
   */
  readonly testSetBucket: s3.IBucket;

  /**
   * The S3 bucket for input documents.
   * Used when creating test sets from existing input files.
   */
  readonly inputBucket: s3.IBucket;

  /**
   * The SQS queue for test set file copying operations.
   * Used to queue file copying jobs for test set creation.
   */
  readonly testSetCopyQueue: sqs.IQueue;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;
}

/**
 * A Lambda function that manages test sets through GraphQL API.
 *
 * This function serves as a resolver for test set related GraphQL operations,
 * handling test set creation, deletion, listing, and file validation operations.
 * It supports both pattern-based test set creation from existing files
 * and direct upload of test set archives.
 */
export class TestSetResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new TestSetResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: TestSetResolverFunctionProps,
  ) {
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
        "test_set_resolver",
      ),
      bundling: {
        commandHooks: {
          beforeBundling: (_i: string, _o: string): string[] => {
            return [];
          },
          afterBundling: (_i: string, outputDir: string): string[] => {
            return [
              `find ${outputDir} -type d -name "*.egg-info" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "__pycache__" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "build" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "tests" -exec rm -rf {} +`,
            ];
          },
        },
      },
      timeout: cdk.Duration.minutes(15),
      memorySize: 512,
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        TEST_SET_BUCKET: props.testSetBucket.bucketName,
        INPUT_BUCKET: props.inputBucket.bucketName,
        TEST_SET_COPY_QUEUE_URL: props.testSetCopyQueue.queueUrl,
      },
    });

    // Grant permissions
    props.trackingTable.grantReadWriteData(this);
    props.testSetBucket.grantReadWrite(this);
    props.inputBucket.grantRead(this);
    props.testSetCopyQueue.grantSendMessages(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
