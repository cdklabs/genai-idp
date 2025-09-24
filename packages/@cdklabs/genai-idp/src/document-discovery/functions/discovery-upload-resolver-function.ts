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
import { IDiscoveryTable } from "../discovery-table";

/**
 * Properties for configuring the DiscoveryUploadResolverFunction.
 */
export interface DiscoveryUploadResolverFunctionProps
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
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
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
      entry: path.join(
        __dirname,
        "../../../assets/lambdas/discovery_upload_resolver",
      ),
      handler: "index.handler",
      runtime: lambda.Runtime.PYTHON_3_12,
      memorySize: 512,
      environment: {
        DISCOVERY_TABLE_NAME: props.discoveryTable.tableName,
        DISCOVERY_QUEUE_URL: props.discoveryQueue.queueUrl,
        INPUT_BUCKET_NAME: props.inputBucket.bucketName,
      },
      ...props,
    });

    // Grant permissions
    props.inputBucket.grantReadWrite(this);
    props.discoveryTable.grantReadWriteData(this);
    props.discoveryQueue.grantSendMessages(this);
  }
}
