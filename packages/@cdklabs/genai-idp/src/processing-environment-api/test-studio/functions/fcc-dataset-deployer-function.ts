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
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";
import { ITrackingTable } from "../../../tracking-table";

/**
 * Properties for the FCC Dataset Deployer function.
 *
 * This function deploys the RealKIE-FCC-Verified dataset from HuggingFace
 * to the test bucket during stack deployment as a custom resource.
 */
export interface FccDatasetDeployerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for storing test documents and baselines.
   * The function will deploy the FCC dataset to this bucket.
   */
  readonly testSetBucket: s3.IBucket;

  /**
   * The DynamoDB table for tracking test sets.
   * The function will create a test set record for the deployed dataset.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that deploys the RealKIE-FCC-Verified dataset.
 *
 * This function downloads the RealKIE-FCC-Verified dataset from HuggingFace
 * and deploys it to the test bucket with proper baseline files for evaluation.
 * It's designed to be used as a CloudFormation custom resource during stack deployment.
 */
export class FccDatasetDeployerFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: FccDatasetDeployerFunctionProps,
  ) {
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
        "fcc_dataset_deployer",
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
      timeout: cdk.Duration.minutes(30), // Longer timeout for dataset download
      memorySize: 1024, // Higher memory for processing dataset
      environment: {
        TESTSET_BUCKET: props.testSetBucket.bucketName,
        TRACKING_TABLE: props.trackingTable.tableName,
      },
    });

    // Grant permissions
    props.testSetBucket.grantReadWrite(this);
    props.trackingTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
