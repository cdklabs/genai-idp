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
import { Construct } from "constructs";
import { IConfigurationTable } from "../../../configuration-table";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { ITrackingTable } from "../../../tracking-table";
import { ITestTable } from "../test-table";

/**
 * Properties for the Test Runner function.
 *
 * This function executes test sets and manages test execution lifecycle,
 * including test set creation, execution tracking, and results management.
 */
export interface TestRunnerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for storing test sets and execution results.
   * The function uses this table to manage test metadata and results.
   */
  readonly testTable: ITestTable;

  /**
   * The S3 bucket for storing test documents and baselines.
   * The function uses this bucket to access test files and store results.
   */
  readonly testBucket: s3.IBucket;

  /**
   * The DynamoDB table for tracking document processing.
   * Used for test execution tracking and configuration capture.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for configuration storage.
   * Used to capture current configuration during test execution.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that executes test sets and manages test execution lifecycle.
 *
 * This function handles test set creation, execution tracking, and results management
 * for systematic testing and evaluation of document processing workflows.
 */
export class TestRunnerFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: TestRunnerFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "test_runner",
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
        TEST_TABLE_NAME: props.testTable.tableName,
        TEST_BUCKET_NAME: props.testBucket.bucketName,
        TRACKING_TABLE: props.trackingTable.tableName,
        CONFIG_TABLE: props.configurationTable.tableName,
      },
    });

    // Grant permissions
    props.testTable.grantReadWriteData(this);
    props.testBucket.grantReadWrite(this);
    props.trackingTable.grantReadWriteData(this);
    props.configurationTable.grantReadData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
