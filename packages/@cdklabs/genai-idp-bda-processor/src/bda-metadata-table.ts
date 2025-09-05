/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { FixedKeyTableProps } from "@cdklabs/genai-idp";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

/**
 * Properties for the BDA Metadata Table.
 * Uses the same FixedKeyTableProps pattern as other tables in the genai-idp package.
 */
export interface BdaMetadataTableProps extends FixedKeyTableProps {}

/**
 * Interface for the BDA metadata table.
 * This table stores metadata about BDA (Bedrock Data Automation) processing records,
 * enabling tracking of individual document processing records within BDA jobs.
 */
export interface IBdaMetadataTable extends ITable {}

/**
 * A DynamoDB table for storing BDA processing metadata.
 *
 * This table uses a composite key (execution_id, record_number) to efficiently store
 * and query metadata about individual records processed by Bedrock Data Automation.
 * The table design supports tracking the processing status and results of each
 * document record within a BDA execution.
 *
 * Key features:
 * - Partition key: execution_id (String) - identifies the BDA execution
 * - Sort key: record_number (Number) - identifies individual records within the execution
 * - TTL enabled with ExpiresAfter attribute for automatic cleanup
 * - Point-in-time recovery enabled for data protection
 * - KMS encryption for data security
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
