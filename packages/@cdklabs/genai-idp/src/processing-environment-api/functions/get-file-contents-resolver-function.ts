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
 * Properties for configuring the GetFileContentsResolverFunction.
 */
export interface GetFileContentsResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket containing input documents.
   * Function needs read access to retrieve document contents.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket containing processed output documents.
   * Function needs read access to retrieve processed document contents.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that retrieves file contents from S3 buckets for GraphQL API responses.
 *
 * This function is used as a resolver in the ProcessingEnvironmentApi to fetch
 * document contents from various S3 buckets (input, output, configuration) and
 * return them to GraphQL clients. It supports retrieving both raw documents
 * and processed results.
 */
export class GetFileContentsResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new GetFileContentsResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: GetFileContentsResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "get_file_contents_resolver",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            // Create temporary directory for dependencies
            `mkdir -p /tmp/builddir`,
            // Copy source files directly to output
            `mkdir -p /asset-output`,
            // `rsync -rLv /asset-input/${indexPath}/ /asset-output/${indexPath}`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            // Clean up unnecessary files in the temp directory
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            // Copy only necessary dependencies to the output
            `rsync -rL /tmp/builddir/ /asset-output`,
            // Clean up temporary directory
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description:
        "This AWS Lambda Function gets the contents of a file from S3.",
      ...props,
    });

    // Grant permissions to read from S3 buckets
    props.inputBucket.grantRead(this);
    props.outputBucket.grantRead(this);

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
