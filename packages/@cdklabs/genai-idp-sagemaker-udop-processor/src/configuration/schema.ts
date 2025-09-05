/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import * as path from "path";
import { CustomResource } from "aws-cdk-lib";
import { SagemakerUdopProcessor } from "../processor";

/**
 * Interface for SageMaker UDOP configuration schema.
 * Defines the structure and validation rules for SageMaker UDOP processor configuration.
 */
export interface ISagemakerUdopProcessorConfigurationSchema {
  /**
   * Binds the configuration schema to a processor instance.
   * This method applies the schema definition to the processor's configuration table.
   *
   * @param processor The SageMaker UDOP document processor to apply the schema to
   */
  bind(processor: SagemakerUdopProcessor): void;
}

/**
 * Schema definition for SageMaker UDOP processor configuration.
 * Provides JSON Schema validation rules for the configuration UI and API.
 *
 * This class defines the structure, validation rules, and UI presentation
 * for the SageMaker UDOP processor configuration, including document classes,
 * attributes, extraction parameters, evaluation criteria, and summarization options.
 * It's specialized for use with SageMaker endpoints for document classification.
 */
export class SagemakerUdopProcessorConfigurationSchema
  implements ISagemakerUdopProcessorConfigurationSchema
{
  /**
   * Binds the configuration schema to a processor instance.
   * Creates a custom resource that updates the schema in the configuration table.
   *
   * @param processor The SageMaker UDOP document processor to apply the schema to
   */
  public bind(processor: SagemakerUdopProcessor) {
    new CustomResource(processor, "UpdateSchemaConfig", {
      serviceToken: processor.environment.configurationFunction.functionArn,
      properties: {
        Schema: this.defaultSchemaDefinition(),
        // NOTE: this is for making sure this CR executes on changes
        ConfigurationTable: processor.environment.configurationTable.tableName,
      },
    });
  }

  /**
   * Generates the default schema definition for SageMaker UDOP processor configuration.
   * Defines the structure, validation rules, and UI presentation for the configuration.
   *
   * @returns The JSON Schema definition for SageMaker UDOP processor configuration
   * @private
   */
  private defaultSchemaDefinition(): {
    [key: string]: any;
  } {
    const schemaPath = path.join(
      __dirname,
      "..",
      "..",
      "assets",
      "schema",
      "schema.json",
    );
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    return JSON.parse(schemaContent);
  }
}
