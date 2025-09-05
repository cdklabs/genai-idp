/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { md5hash } from "aws-cdk-lib/core/lib/helpers-internal";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";

/**
 * Properties for configuring the CopyToBaselineResolverFunction.
 */
export interface CopyToBaselineResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket containing processed output documents.
   * Function needs read/write access to copy documents from this bucket.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional S3 bucket for storing evaluation baseline documents.
   * Function needs read/write access to copy documents to this bucket.
   */
  readonly evaluationBaselineBucket: IBucket;

  /**
   * The GraphQL API URL for making API calls.
   * Used to update document status after copying operations.
   */
  readonly graphqlApiUrl: string;

  /**
   * The GraphQL API ARN for permission grants.
   * Used to allow the function to make GraphQL mutations.
   */
  readonly graphqlApiArn: string;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that copies files to baseline bucket via GraphQL API.
 *
 * This function serves as a resolver for copying processed documents to the
 * evaluation baseline bucket for use in accuracy evaluation. It supports
 * asynchronous processing and can invoke itself for long-running operations.
 */
export class CopyToBaselineResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new CopyToBaselineResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: CopyToBaselineResolverFunctionProps,
  ) {
    const functionName = `CopyToBaselineResolverFunction${md5hash(cdk.Stack.of(scope).stackName).substring(0, 8) + scope.node.id}`;
    const functionArn = `arn:${cdk.Aws.PARTITION}:lambda:${cdk.Aws.REGION}:${cdk.Aws.ACCOUNT_ID}:function:${functionName}`;

    super(scope, id, {
      functionName: functionName,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "copy_to_baseline_resolver",
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
        "Lambda function to copy files to baseline bucket via GraphQL API",
      environment: {
        OUTPUT_BUCKET: props.outputBucket.bucketName,
        EVALUATION_BASELINE_BUCKET: props.evaluationBaselineBucket.bucketName,
        APPSYNC_API_URL: props.graphqlApiUrl,
      },
      ...props,
    });

    // Grant permissions
    props.outputBucket.grantReadWrite(this);

    // If evaluation baseline bucket is provided, grant permissions
    props.evaluationBaselineBucket?.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Allow the function to invoke itself asynchronously
    this.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["lambda:InvokeFunction"],
        resources: [functionArn],
      }),
    );

    // Allow AppSync access for document updates
    this.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["appsync:GraphQL"],
        resources: [`${props.graphqlApiArn}/types/Mutation/*`],
      }),
    );
  }
}
