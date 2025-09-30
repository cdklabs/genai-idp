/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";
import { IDiscoveryTable } from "../discovery-table";

/**
 * Properties for configuring the DiscoveryUploadResolverFunction.
 */
export interface DiscoveryUploadResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for discovery document uploads.
   */
  readonly discoveryBucket: IBucket;

  /**
   * The discovery tracking table.
   */
  readonly discoveryTable: IDiscoveryTable;

  /**
   * The discovery processing queue.
   */
  readonly discoveryQueue: sqs.IQueue;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The log level for the function.
   */
  readonly logLevel?: LogLevel;
}

/**
 * A Lambda function that handles discovery document uploads via GraphQL API.
 *
 * This function generates presigned URLs for document uploads and creates
 * discovery job entries in the tracking table.
 */
export class DiscoveryUploadResolverFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: DiscoveryUploadResolverFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      entry: path.join(
        __dirname,
        "../../../assets/lambdas/discovery_upload_resolver",
      ),
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 512,
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
            `rm -rf /tm p/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      environment: {
        LOG_LEVEL: props.logLevel?.toString() || "INFO",
        DISCOVERY_BUCKET: props.discoveryBucket.bucketName,
        DISCOVERY_TRACKING_TABLE: props.discoveryTable.tableName,
        DISCOVERY_QUEUE_URL: props.discoveryQueue.queueUrl,
      },
    });

    // Grant permissions
    props.discoveryBucket.grantReadWrite(this);
    props.discoveryTable.grantReadWriteData(this);
    props.discoveryQueue.grantSendMessages(this);

    // Grant KMS permissions if encryption key is provided
    if (props.encryptionKey) {
      props.encryptionKey.grantEncryptDecrypt(this);
    }
  }
}
