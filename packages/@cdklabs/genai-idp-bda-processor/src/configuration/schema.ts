/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import * as path from "path";
import { CustomResource } from "aws-cdk-lib";
import { IBdaProcessor } from "../processor";

/**
 * Interface for BDA configuration schema.
 * Defines the structure and validation rules for BDA processor configuration.
 */
export interface IBdaProcessorConfigurationSchema {
  /**
   * Binds the configuration schema to a processor instance.
   * This method applies the schema definition to the processor's configuration table.
   *
   * @param processor The BDA document processor to apply the schema to
   */
  bind(processor: IBdaProcessor): void;
}

/**
 * Schema definition for BDA processor configuration.
 * Provides JSON Schema validation rules for the configuration UI and API.
 *
 * This class defines the structure, validation rules, and UI presentation
 * for the BDA processor configuration, including document classes, attributes,
 * evaluation settings, and summarization parameters.
 */
export class BdaProcessorConfigurationSchema
  implements IBdaProcessorConfigurationSchema
{
  /**
   * Creates a new BdaProcessorConfigurationSchema.
   */
  constructor() {}

  /**
   * Binds the configuration schema to a processor instance.
   * Creates a custom resource that updates the schema in the configuration table.
   *
   * @param processor The BDA document processor to apply the schema to
   */
  public bind(processor: IBdaProcessor) {
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
   * Generates the default schema definition for BDA processor configuration.
   * Defines the structure, validation rules, and UI presentation for the configuration.
   *
   * @returns The JSON Schema definition for BDA processor configuration
   * @private
   */
  private defaultSchemaDefinition(): { [key: string]: any } {
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
