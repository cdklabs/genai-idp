/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
import { FixedKeyTableProps as TrackingTableProps } from "./fixed-key-table-props";

/**
 * Interface for the document tracking table.
 * This table stores information about document processing status, metadata, and results,
 * enabling tracking of documents throughout their processing lifecycle from upload to completion.
 */
export interface ITrackingTable extends ITable {}

/**
 * A DynamoDB table for tracking document processing status and results.
 *
 * This table uses a composite key (PK, SK) to efficiently store and query
 * information about documents being processed, including their current status,
 * processing history, and extraction results. The table design supports
 * various access patterns needed for monitoring and reporting on document
 * processing activities.
 */
export class TrackingTable extends Table implements ITrackingTable {
  /**
   * Creates a new TrackingTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: TrackingTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: "ExpiresAfter",
    });
  }
}
