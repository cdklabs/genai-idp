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

/**
 * Properties for the OCR Benchmark Deployer function.
 *
 * This function deploys OCR benchmarking datasets for evaluating
 * optical character recognition accuracy and performance.
 */
export interface OcrBenchmarkDeployerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for storing test documents and baselines.
   * The function will deploy the OCR benchmark dataset to this bucket.
   */
  readonly testBucket: s3.IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that deploys OCR benchmarking datasets.
 *
 * This function downloads and deploys OCR benchmark datasets
 * for evaluating optical character recognition capabilities.
 * The datasets include various document types with ground truth
 * text annotations for systematic OCR accuracy evaluation.
 *
 * It's designed to be used as a CloudFormation custom resource
 * during stack deployment.
 *
 * @since v0.4.16
 */
export class OcrBenchmarkDeployerFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: OcrBenchmarkDeployerFunctionProps,
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
        "ocr_benchmark_deployer",
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
        TEST_BUCKET_NAME: props.testBucket.bucketName,
      },
    });

    // Grant permissions
    props.testBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
