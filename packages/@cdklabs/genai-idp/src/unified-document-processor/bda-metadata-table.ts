/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { FixedKeyTableProps } from "../fixed-key-table-props";

/**
 * Properties for the BDA Metadata Table.
 *
 * @since 0.5.2
 */
export type BdaMetadataTableProps = FixedKeyTableProps;

/**
 * Interface for the BDA metadata table.
 * This table stores metadata about BDA (Bedrock Data Automation) processing records,
 * enabling tracking of individual document processing records within BDA jobs.
 *
 * @since 0.5.2
 */
export interface IBdaMetadataTable extends ITable {}

/**
 * A DynamoDB table for storing BDA processing metadata.
 *
 * Uses a composite key (execution_id, record_number) to store and query metadata
 * about individual records processed by Bedrock Data Automation. TTL-enabled
 * with `ExpiresAfter` for automatic cleanup.
 *
 * @since 0.5.2
 */
export class BdaMetadataTable extends Table implements IBdaMetadataTable {
  /**
   * Creates a new BdaMetadataTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: BdaMetadataTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: {
        name: "execution_id",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "record_number",
        type: AttributeType.NUMBER,
      },
      timeToLiveAttribute: "ExpiresAfter",
    });
  }
}
