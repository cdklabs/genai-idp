/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import { Stack } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for the ListDocumentsGSI resolver function.
 *
 * This function handles `listDocuments` and `getDocumentCount` GraphQL queries
 * using the TypeDateIndex GSI on the TrackingTable for efficient O(matched) queries
 * instead of full table scans.
 *
 * @since 0.5.2
 */
export interface ListDocumentsGSIResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The tracking table that stores document metadata.
   * Function queries the TypeDateIndex GSI for efficient document listing.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional users table for RBAC-based filtering.
   * When provided, the function checks user's allowedConfigVersions
   * to scope document visibility per user role.
   *
   * @default - No RBAC filtering by config version
   */
  readonly usersTable?: dynamodb.ITable;

  /**
   * Optional KMS key for encrypting function resources.
   *
   * @default - AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that resolves listDocuments and getDocumentCount queries
 * using the TypeDateIndex GSI on the TrackingTable.
 *
 * Replaces the previous VTL Scan-based listDocuments resolver with efficient
 * GSI queries. Supports RBAC filtering: Reviewers see only HITL-pending documents
 * plus their own completed reviews; other roles see all documents scoped by
 * allowedConfigVersions.
 *
 * @since 0.5.2
 */
export class ListDocumentsGSIResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new ListDocumentsGSIResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: ListDocumentsGSIResolverFunctionProps,
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
        "list_documents_gsi_resolver",
      ),
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope))],
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description:
        "Lambda function for GSI-based document listing and counting",
      environment: {
        TRACKING_TABLE_NAME: props.trackingTable.tableName,
        ...(props.usersTable
          ? { USERS_TABLE_NAME: props.usersTable.tableName }
          : {}),
      },
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        encryptionMasterKey: encryptionKey,
        retentionPeriod: cdk.Duration.days(14),
      }),
      ...props,
    });

    // Grant read on tracking table (including GSI)
    props.trackingTable.grantReadData(this);
    // Grant read on users table for RBAC filtering
    props.usersTable?.grantReadData(this);
    encryptionKey?.grantEncryptDecrypt(this);
  }
}
