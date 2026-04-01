/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for the ListDocumentsByDateRange resolver function.
 *
 * This function handles the `listDocumentsByDateRange` GraphQL query,
 * querying the TrackingTable for documents within a specified date range.
 *
 * @since 0.5.2
 */
export interface ListDocumentsByDateRangeResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The tracking table that stores document metadata.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional KMS key for encrypting function resources.
   *
   * @default - AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that resolves the listDocumentsByDateRange query.
 *
 * Queries the TrackingTable for documents within a specified date range,
 * returning paginated results.
 *
 * @since 0.5.2
 */
export class ListDocumentsByDateRangeResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: ListDocumentsByDateRangeResolverFunctionProps,
  ) {
    const encryptionKey = props.encryptionKey;

    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "list_documents_range_resolver",
      ),
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope))],
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.minutes(2),
      memorySize: 512,
      description:
        "Lambda function to list documents by date range via GraphQL API",
      environment: {
        TRACKING_TABLE_NAME: props.trackingTable.tableName,
      },
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        encryptionMasterKey: encryptionKey,
        retentionPeriod: cdk.Duration.days(14),
      }),
      ...props,
    });

    props.trackingTable.grantReadData(this);
    encryptionKey?.grantEncryptDecrypt(this);
  }
}
