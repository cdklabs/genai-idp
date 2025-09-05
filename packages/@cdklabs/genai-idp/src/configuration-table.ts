/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
import { FixedKeyTableProps as ConfigurationTableProps } from "./fixed-key-table-props";

/**
 * Interface for the configuration management table.
 * This table stores system-wide configuration settings for the document processing solution,
 * including extraction schemas, model parameters, evaluation criteria, and UI settings.
 */
export interface IConfigurationTable extends ITable {}

/**
 * A DynamoDB table for storing configuration settings for the document processing solution.
 *
 * This table uses a fixed partition key "Configuration" to store various configuration
 * items such as extraction schemas, evaluation settings, and system parameters.
 * It provides a centralized location for managing configuration that can be
 * accessed by multiple components of the solution.
 *
 * Configuration items stored in this table can include:
 * - Document extraction schemas and templates
 * - Model parameters and prompt configurations
 * - Evaluation criteria and thresholds
 * - UI settings and customizations
 * - Processing workflow configurations
 */
export class ConfigurationTable extends Table implements IConfigurationTable {
  /**
   * Creates a new ConfigurationTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: ConfigurationTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: { name: "Configuration", type: AttributeType.STRING },
    });
  }
}
