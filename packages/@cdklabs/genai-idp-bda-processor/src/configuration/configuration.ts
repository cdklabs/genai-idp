/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CustomResource } from "aws-cdk-lib";
import { IBdaProcessor } from "../processor";
import {
  BdaProcessorConfigurationDefinition,
  BdaProcessorConfigurationDefinitionOptions,
  IBdaProcessorConfigurationDefinition,
} from "./definition";

/**
 * Interface for BDA document processor configuration.
 * Provides configuration management for Bedrock Data Automation processing.
 */
export interface IBdaProcessorConfiguration {
  /**
   * Binds the configuration to a processor instance.
   * This method applies the configuration to the processor.
   *
   * @param processor The BDA document processor to apply to
   */
  bind(processor: IBdaProcessor): IBdaProcessorConfigurationDefinition;
}

/**
 * Configuration management for BDA document processing using Bedrock Data Automation.
 *
 * This construct creates and manages the configuration for BDA document processing,
 * including schema definitions and configuration values. It provides a centralized
 * way to manage extraction schemas, evaluation settings, and summarization parameters.
 */
export class BdaProcessorConfiguration implements IBdaProcessorConfiguration {
  /**
   * Creates a configuration from a YAML file.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional configuration options to override file settings
   * @returns A new BdaProcessorConfiguration instance
   */
  static fromFile(
    filePath: string,
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition = BdaProcessorConfigurationDefinition.fromFile(
      filePath,
      options,
    );
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for lending package processing.
   *
   * @param options Optional configuration options
   * @returns A configuration definition with default settings
   */
  static lendingPackageSample(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition =
      BdaProcessorConfigurationDefinition.lendingPackageSample(options);
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Protected constructor to enforce factory method usage.
   *
   * @param definition The configuration definition instance
   */
  protected constructor(
    private readonly definition: IBdaProcessorConfigurationDefinition,
  ) {}

  public bind(processor: IBdaProcessor): IBdaProcessorConfigurationDefinition {
    new CustomResource(processor, "UpdateDefaultConfig", {
      serviceToken: processor.environment.configurationFunction.functionArn,
      properties: {
        Default: this.definition.raw(),
        // NOTE: this is for making sure this CR executes on changes
        ConfigurationTable: processor.environment.configurationTable.tableName,
      },
    });

    return this.definition;
  }
}
