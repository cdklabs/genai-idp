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
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for configuring the DeleteDocumentResolverFunction.
 */
export interface DeleteDocumentResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The tracking table that stores document metadata.
   * Function needs read/write access to remove document records.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket containing input documents.
   * Function needs read/write access to delete input documents.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket containing processed output documents.
   * Function needs read/write access to delete output documents.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that deletes documents via GraphQL API.
 *
 * This function serves as a resolver for document deletion operations,
 * removing documents from both the tracking table and S3 buckets.
 * It ensures complete cleanup of document data across all storage locations.
 */
export class DeleteDocumentResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new DeleteDocumentResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: DeleteDocumentResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "delete_document_resolver",
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
      description: "Lambda function to delete documents via GraphQL API",
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        INPUT_BUCKET: props.inputBucket.bucketName,
        OUTPUT_BUCKET: props.outputBucket.bucketName,
      },
      ...props,
    });

    // Grant permissions
    props.trackingTable.grantReadWriteData(this);
    props.inputBucket.grantReadWrite(this);
    props.outputBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
