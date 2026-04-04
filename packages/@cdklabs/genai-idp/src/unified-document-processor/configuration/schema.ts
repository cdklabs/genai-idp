/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import * as path from "path";
import { CustomResource } from "aws-cdk-lib";
import { IUnifiedDocumentProcessor } from "../unified-document-processor";

/**
 * Interface for the Unified Document Processor configuration schema.
 * Defines the structure and validation rules for the unified processor configuration.
 *
 * @since 0.5.2
 */
export interface IUnifiedDocumentProcessorConfigurationSchema {
  /**
   * Binds the configuration schema to a unified processor instance.
   * This method applies the schema definition to the processor's configuration table
   * via a custom resource backed by the environment's configuration function.
   *
   * @param processor The unified document processor to apply the schema to
   */
  bind(processor: IUnifiedDocumentProcessor): void;
}

/**
 * Schema definition for the Unified Document Processor configuration.
 * Provides JSON Schema validation rules for the configuration UI and API.
 *
 * The schema is read from the bundled `schemas/unified/schema.json` file,
 * which defines the structure, validation rules, and UI presentation
 * for the unified processor configuration including the `use_bda` runtime
 * routing toggle, document classes, OCR settings, classification, extraction,
 * assessment, summarization, evaluation, discovery, agents, and rule validation.
 *
 * @since 0.5.2
 */
export class UnifiedDocumentProcessorConfigurationSchema
  implements IUnifiedDocumentProcessorConfigurationSchema
{
  constructor() {}

  /**
   * Binds the configuration schema to a unified processor instance.
   * Creates a custom resource that updates the schema in the configuration table.
   *
   * @param processor The unified document processor to apply the schema to
   */
  public bind(processor: IUnifiedDocumentProcessor): void {
    new CustomResource(processor, "UpdateSchemaConfig", {
      serviceToken: processor.environment.configurationFunction.functionArn,
      properties: {
        Schema: this.defaultSchemaDefinition(),
        ConfigurationTable: processor.environment.configurationTable.tableName,
      },
    });
  }

  /**
   * Reads and parses the unified schema definition from the bundled assets.
   * @private
   */
  private defaultSchemaDefinition(): { [key: string]: any } {
    const schemaPath = path.join(
      __dirname,
      "..",
      "..",
      "..",
      "assets",
      "schemas",
      "unified",
      "schema.json",
    );
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    return JSON.parse(schemaContent);
  }
}
