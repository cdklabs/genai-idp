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
 * Properties for configuring the TestResultsResolverFunction.
 */
export interface TestResultsResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The tracking table for storing test execution results.
   * This table stores test run metadata and results.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional S3 bucket for storing evaluation reports and results.
   * Used for detailed test result data and metrics aggregation.
   */
  readonly reportingBucket?: s3.IBucket;

  /**
   * Optional SQS queue for test result cache updates.
   * Used to queue metric calculation jobs for completed test runs.
   */
  readonly testResultCacheUpdateQueue?: sqs.IQueue;

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
 * A Lambda function that manages test results through GraphQL API.
 *
 * This function serves as a resolver for test result related GraphQL operations,
 * handling test result retrieval, comparison, and analysis operations.
 * It provides both real-time status updates and detailed result analysis
 * with metrics aggregation and caching for performance optimization.
 */
export class TestResultsResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new TestResultsResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: TestResultsResolverFunctionProps,
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
        "test_results_resolver",
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
      memorySize: 1024, // Higher memory for processing large result sets
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        REPORTING_BUCKET: props.reportingBucket?.bucketName || "",
        TEST_RESULT_CACHE_UPDATE_QUEUE_URL:
          props.testResultCacheUpdateQueue?.queueUrl || "",
      },
    });

    // Grant permissions
    props.trackingTable.grantReadWriteData(this);
    props.reportingBucket?.grantRead(this);
    props.testResultCacheUpdateQueue?.grantSendMessages(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
