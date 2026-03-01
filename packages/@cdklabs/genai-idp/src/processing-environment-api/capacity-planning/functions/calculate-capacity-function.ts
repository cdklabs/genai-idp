/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../../configuration-table";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { ITrackingTable } from "../../../tracking-table";

/**
 * Properties for the Calculate Capacity function.
 *
 * This function performs capacity planning calculations for Pattern 2 workflows,
 * analyzing document processing metrics to optimize resource allocation.
 */
export interface CalculateCapacityFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for tracking document processing.
   * The function uses this table to analyze processing metrics and patterns.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for configuration storage.
   * The function uses this table to access configuration settings for capacity calculations.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that performs capacity planning calculations for Pattern 2 workflows.
 *
 * This function analyzes document processing metrics from the tracking table
 * to provide capacity planning recommendations and resource optimization insights.
 *
 * @since v0.4.16
 */
export class CalculateCapacityFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: CalculateCapacityFunctionProps,
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
        "..",
        "assets",
        "lambdas",
        "calculate_capacity",
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
      memorySize: 1024,
      environment: {
        TRACKING_TABLE_NAME: props.trackingTable.tableName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
      },
    });

    // Grant permissions
    props.trackingTable.grantReadData(this);
    props.configurationTable.grantReadData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
