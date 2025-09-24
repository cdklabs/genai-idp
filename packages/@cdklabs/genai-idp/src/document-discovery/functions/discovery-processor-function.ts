/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import { IBucket } from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { IDiscoveryTable } from "../discovery-table";

/**
 * Properties for configuring the DiscoveryProcessorFunction.
 */
export interface DiscoveryProcessorFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket for input documents.
   */
  readonly inputBucket: IBucket;

  /**
   * The discovery tracking table.
   */
  readonly discoveryTable: IDiscoveryTable;

  /**
   * The discovery processing queue.
   */
  readonly discoveryQueue: sqs.IQueue;

  /**
   * The AppSync API URL for status updates.
   */
  readonly appSyncApiUrl: string;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that processes discovery jobs from SQS queue.
 *
 * This function analyzes documents to identify structure, field types,
 * and organizational patterns for automated configuration generation.
 */
export class DiscoveryProcessorFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: DiscoveryProcessorFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      entry: path.join(
        __dirname,
        "../../../assets/lambdas/discovery_processor",
      ),
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 1024,
      timeout: cdk.Duration.minutes(2),
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
      layers: [IdpPythonLayerVersion.getOrCreate(scope, "image")],
      environment: {
        DISCOVERY_TABLE_NAME: props.discoveryTable.tableName,
        INPUT_BUCKET_NAME: props.inputBucket.bucketName,
        APPSYNC_API_URL: props.appSyncApiUrl,
      },
    });

    // Grant permissions
    props.inputBucket.grantRead(this);
    props.discoveryTable.grantReadWriteData(this);

    // Add SQS event source
    this.addEventSource(
      new SqsEventSource(props.discoveryQueue, {
        batchSize: 1,
      }),
    );
  }
}
