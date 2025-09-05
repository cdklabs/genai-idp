/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { Construct } from "constructs";
import { FixedKeyTableProps as ConcurrencyTableProps } from "./fixed-key-table-props";

/**
 * Interface for the concurrency management table.
 * This table is used to track and limit concurrent document processing tasks,
 * preventing resource exhaustion and ensuring system stability under load.
 */
export interface IConcurrencyTable extends ITable {}

/**
 * A DynamoDB table for managing concurrency limits in document processing.
 *
 * This construct creates a table with a custom resource that initializes
 * concurrency counters, allowing the system to control how many documents
 * are processed simultaneously to prevent resource exhaustion.
 */
export class ConcurrencyTable extends Table implements IConcurrencyTable {
  /**
   * Creates a new ConcurrencyTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: ConcurrencyTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: { name: "counter_id", type: AttributeType.STRING },
    });

    // Lambda Function to initialize the concurrency table
    const initializeConcurrencyTableLambda = new lambda_python.PythonFunction(
      this,
      "InitializeConcurrencyTableLambda",
      {
        runtime: lambda.Runtime.PYTHON_3_12,
        entry: path.join(
          __dirname,
          "..",
          "assets",
          "lambdas",
          "initialize_counter",
        ),
        bundling: {
          commandHooks: {
            beforeBundling: (_i: string, _o: string): string[] => {
              return [];
            },
            afterBundling: (_i: string, outputDir: string): string[] => {
              return [
                `find ${outputDir} -type d -name "*.dist-info" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "*.egg-info" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "__pycache__" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "build" -exec rm -rf {} +`,
                `find ${outputDir} -type d -name "tests" -exec rm -rf {} +`,
              ];
            },
          },
        },
        timeout: cdk.Duration.seconds(30),
        environment: {
          CONCURRENCY_TABLE: this.tableName,
        },
      },
    );

    // Custom resource to initialize the concurrency table
    new cdk.CustomResource(this, "InitializeConcurrencyTableCustomResource", {
      serviceToken: initializeConcurrencyTableLambda.functionArn,
      properties: {
        TableName: this.tableName,
      },
    });

    this.grantReadWriteData(initializeConcurrencyTableLambda);
  }
}
