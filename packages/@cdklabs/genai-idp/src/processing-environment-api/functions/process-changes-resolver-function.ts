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
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for configuring the ProcessChangesResolverFunction.
 */
export interface ProcessChangesResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The tracking table for document processing status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The SQS queue for document processing.
   */
  readonly documentQueue: IQueue;

  /**
   * The S3 bucket for working files.
   */
  readonly workingBucket: IBucket;

  /**
   * The S3 bucket containing input documents.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket for output documents.
   */
  readonly outputBucket: IBucket;

  /**
   * The GraphQL API URL for AppSync operations.
   */
  readonly appsyncApiUrl: string;

  /**
   * The GraphQL API ARN for AppSync permissions.
   */
  readonly graphqlApiArn: string;

  /**
   * Data retention period in days.
   */
  readonly dataRetentionInDays: number;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that processes section changes via GraphQL API.
 *
 * This function serves as a resolver for processing document section changes,
 * allowing clients to modify document sections and trigger reprocessing.
 */
export class ProcessChangesResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new ProcessChangesResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: ProcessChangesResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "process_changes_resolver",
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
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description: "Lambda function to process section changes via GraphQL API",
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        QUEUE_URL: props.documentQueue.queueUrl,
        DATA_RETENTION_IN_DAYS: props.dataRetentionInDays.toString(),
        WORKING_BUCKET: props.workingBucket.bucketName,
        INPUT_BUCKET: props.inputBucket.bucketName,
        OUTPUT_BUCKET: props.outputBucket.bucketName,
        APPSYNC_API_URL: props.appsyncApiUrl,
      },
      ...props,
    });

    // Grant permissions
    props.trackingTable.grantReadWriteData(this);
    props.documentQueue.grantSendMessages(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Allow AppSync access for document updates
    this.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["appsync:GraphQL"],
        resources: [`${props.graphqlApiArn}/types/Mutation/*`],
      }),
    );
  }
}
