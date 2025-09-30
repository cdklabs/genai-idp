/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { FixedKeyTableProps } from "../fixed-key-table-props";

/**
 * Interface for the discovery tracking table.
 * This table tracks discovery job status and metadata.
 */
export interface IDiscoveryTable extends ITable {}

/**
 * A DynamoDB table for tracking discovery jobs.
 *
 * This construct creates a table that stores discovery job information
 * including status, document keys, and processing metadata.
 */
export class DiscoveryTable extends Table implements IDiscoveryTable {
  /**
   * Creates a new DiscoveryTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: FixedKeyTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: { name: "jobId", type: AttributeType.STRING },
      timeToLiveAttribute: "ttl",
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
