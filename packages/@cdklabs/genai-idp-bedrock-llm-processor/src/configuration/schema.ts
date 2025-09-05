/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import * as path from "path";
import { CustomResource } from "aws-cdk-lib";
import { IBedrockLlmProcessor } from "../processor";

/**
 * Interface for Bedrock LLM configuration schema.
 * Defines the structure and validation rules for Bedrock LLM processor configuration.
 */
export interface IBedrockLlmProcessorConfigurationSchema {
  /**
   * Binds the configuration schema to a processor instance.
   * This method applies the schema definition to the processor's configuration table.
   *
   * @param processor The Bedrock LLM document processor to apply the schema to
   */
  bind(processor: IBedrockLlmProcessor): void;
}

/**
 * Schema definition for Bedrock LLM processor configuration.
 * Provides JSON Schema validation rules for the configuration UI and API.
 *
 * This class defines the structure, validation rules, and UI presentation
 * for the Bedrock LLM processor configuration, including document classes,
 * attributes, classification settings, extraction parameters, evaluation
 * criteria, and summarization options.
 */
export class BedrockLlmProcessorConfigurationSchema
  implements IBedrockLlmProcessorConfigurationSchema
{
  /**
   * Binds the configuration schema to a processor instance.
   * Creates a custom resource that updates the schema in the configuration table.
   *
   * @param processor The Bedrock LLM document processor to apply the schema to
   */
  public bind(processor: IBedrockLlmProcessor) {
    new CustomResource(processor, "SetSchema", {
      serviceToken: processor.environment.configurationFunction.functionArn,
      properties: {
        Schema: this.defaultSchemaDefinition(),
        // NOTE: this is for making sure this CR executes on changes
        ConfigurationTable: processor.environment.configurationTable.tableName,
      },
    });
  }

  /**
   * Generates the default schema definition for Bedrock LLM processor configuration.
   * Defines the structure, validation rules, and UI presentation for the configuration.
   *
   * @returns The JSON Schema definition for Bedrock LLM processor configuration
   * @private
   */
  // TODO: move this to asset
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
