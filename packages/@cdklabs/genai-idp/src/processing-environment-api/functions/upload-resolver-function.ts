/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";

/**
 * Properties for configuring the UploadResolverFunction.
 */
export interface UploadResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for input documents.
   * Function needs write access to generate presigned URLs for uploads.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket for output documents.
   * Function needs write access to generate presigned URLs for uploads.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional S3 bucket for evaluation baseline documents.
   * Function needs write access to generate presigned URLs for uploads.
   */
  readonly evaluationBaselineBucket?: IBucket;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that generates presigned URLs for document uploads via GraphQL API.
 *
 * This function serves as a resolver for upload operations, generating secure
 * presigned URLs that allow clients to upload documents directly to S3 buckets.
 * It supports uploads to input, output, and evaluation baseline buckets.
 */
export class UploadResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new UploadResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: UploadResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "upload_resolver",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            "mkdir -p /tmp/builddir",
            "mkdir -p /asset-output",
            "rsync -rL /asset-input/ /tmp/builddir",
            "cd /tmp/builddir",
            "sed -i '/\\.\\/lib/d' requirements.txt || true",
            "python -m pip install -r requirements.txt -t /tmp/builddir || true",
            'find /tmp/builddir -type d -name "*.dist-info" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "build" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "tests" -exec rm -rf {} +',
            "rsync -rL /tmp/builddir/ /asset-output",
            "rm -rf /tmp/builddir",
            "cd /asset-output",
          ].join(" && "),
        ],
      },
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      description:
        "Lambda function to return signed upload URL via GraphQL API",
      environment: {
        INPUT_BUCKET: props.inputBucket.bucketName,
        OUTPUT_BUCKET: props.outputBucket.bucketName,
        EVALUATION_BASELINE_BUCKET:
          props.evaluationBaselineBucket?.bucketName || "",
      },
      ...props,
    });

    // Grant permissions
    props.inputBucket.grantWrite(this);
    props.outputBucket.grantWrite(this);

    // If evaluation baseline bucket is provided, grant permissions
    props.evaluationBaselineBucket?.grantWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
