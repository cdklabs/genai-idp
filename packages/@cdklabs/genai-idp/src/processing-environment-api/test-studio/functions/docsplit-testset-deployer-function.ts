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
 * Properties for the DocSplit Test Set Deployer function.
 *
 * This function deploys the DocSplit-Poly-Seq dataset for document
 * splitting and segmentation evaluation.
 */
export interface DocSplitTestSetDeployerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for storing test documents and baselines.
   * The function will deploy the DocSplit dataset to this bucket.
   */
  readonly testBucket: s3.IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that deploys the DocSplit-Poly-Seq dataset.
 *
 * This function downloads and deploys the DocSplit-Poly-Seq dataset
 * for evaluating document splitting and segmentation capabilities.
 * The dataset includes various document types with ground truth
 * segmentation annotations for systematic evaluation.
 *
 * It's designed to be used as a CloudFormation custom resource
 * during stack deployment.
 *
 * @since v0.4.16
 */
export class DocSplitTestSetDeployerFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: DocSplitTestSetDeployerFunctionProps,
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
        "docsplit_testset_deployer",
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
