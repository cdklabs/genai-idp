/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
import { FixedKeyTableProps as TestTableProps } from "../../fixed-key-table-props";

/**
 * Interface for the test management table.
 * This table stores test sets, executions, and results for document processing evaluation,
 * enabling comprehensive testing and analysis of document processing workflows.
 */
export interface ITestTable extends ITable {}

/**
 * A DynamoDB table for storing test sets, executions, and results.
 *
 * This table uses a composite key (PK, SK) to efficiently store and query
 * different types of test-related data including test set metadata, execution
 * records, and result comparisons. The table design supports various access
 * patterns needed for test management and analysis.
 *
 * Test data stored in this table includes:
 * - Test set definitions and metadata
 * - Test execution tracking and status
 * - Test result comparisons and analytics
 * - Document processing evaluation metrics
 */
export class TestTable extends Table implements ITestTable {
  /**
   * Creates a new TestTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: TestTableProps) {
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

export { TestTableProps };
