/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import * as path from "path";
import { CustomResource } from "aws-cdk-lib";
import { IUnifiedDocumentProcessor } from "./unified-document-processor";

/**
 * Interface for the Unified Document Processor configuration schema.
 * Defines the structure and validation rules for the unified processor configuration.
 *
 * @since 0.5.2
 */
export interface IUnifiedConfigurationSchema {
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
 * This class defines the structure, validation rules, and UI presentation
 * for the unified processor configuration, including the `use_bda` runtime
 * routing toggle, document classes, OCR settings, classification, extraction,
 * assessment, summarization, evaluation, discovery, agents, and rule validation.
 *
 * The schema is read from the bundled `assets/schemas/unified/schema.json` file,
 * which is extracted from the upstream `sources/patterns/unified/template.yaml`
 * `UpdateSchemaConfig` custom resource.
 *
 * @since 0.5.2
 */
export class UnifiedConfigurationSchema implements IUnifiedConfigurationSchema {
  /**
   * Creates a new UnifiedConfigurationSchema.
   *
   * @since 0.5.2
   */
  constructor() {}

  /**
   * Binds the configuration schema to a unified processor instance.
   * Creates a custom resource that updates the schema in the configuration table
   * using the environment's configuration function as the service token.
   *
   * @param processor The unified document processor to apply the schema to
   * @since 0.5.2
   */
  public bind(processor: IUnifiedDocumentProcessor): void {
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
   * Reads and parses the unified schema definition from the bundled assets.
   *
   * @returns The JSON Schema definition for unified processor configuration
   * @private
   */
  private defaultSchemaDefinition(): { [key: string]: any } {
    const schemaPath = path.join(
      __dirname,
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
