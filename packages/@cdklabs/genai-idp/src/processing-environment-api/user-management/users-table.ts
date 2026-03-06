/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, Table, ITable } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { FixedKeyTableProps } from "../../fixed-key-table-props";

/**
 * Properties for configuring the UsersTable.
 * The table uses a fixed partition key (PK) and sort key (SK) structure.
 */
export type UsersTableProps = FixedKeyTableProps;

/**
 * Interface for the Users table.
 * This table stores user metadata and profile information for the application.
 */
export interface IUsersTable extends ITable {}

/**
 * A DynamoDB table for storing user metadata and profile information.
 *
 * This table uses a single-table design pattern with:
 * - PK: USER#{userId} - Partition key for user records
 * - SK: USER#{userId} - Sort key (same as PK for user records)
 * - EmailIndex: GSI on email attribute for email-based lookups
 *
 * The table stores user information including:
 * - User ID and email
 * - Persona (Admin, Reviewer)
 * - Status and timestamps
 *
 */
export class UsersTable extends Table implements IUsersTable {
  constructor(scope: Construct, id: string, props?: UsersTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
    });

    // Add GSI for email-based lookups
    this.addGlobalSecondaryIndex({
      indexName: "EmailIndex",
      partitionKey: { name: "email", type: AttributeType.STRING },
    });
  }
}
