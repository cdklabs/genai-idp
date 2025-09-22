/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CustomResource } from "aws-cdk-lib";
import { ISagemakerUdopProcessor } from "../processor";
import {
  ISagemakerUdopProcessorConfigurationDefinition,
  SagemakerUdopProcessorConfigurationDefinition,
  SagemakerUdopProcessorConfigurationDefinitionOptions,
} from "./definition";

/**
 * Interface for SageMaker UDOP document processor configuration.
 * Provides configuration management for specialized document processing with SageMaker.
 */
export interface ISagemakerUdopProcessorConfiguration {
  /**
   * Binds the configuration to a processor instance.
   * This method applies the configuration to the processor.
   *
   * @param processor The SageMaker UDOP document processor to apply to
   */
  bind(
    processor: ISagemakerUdopProcessor,
  ): ISagemakerUdopProcessorConfigurationDefinition;
}

/**
 * Configuration management for SageMaker UDOP document processing using SageMaker for classification.
 *
 * This construct creates and manages the configuration for SageMaker UDOP document processing,
 * including schema definitions, extraction prompts, and configuration values.
 * It provides a centralized way to manage document classes, extraction schemas, and
 * model parameters for specialized document processing with SageMaker.
 */
export class SagemakerUdopProcessorConfiguration
  implements ISagemakerUdopProcessorConfiguration
{
  /**
   * Creates a configuration from a YAML file.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional configuration options to override file settings
   * @returns A new SagemakerUdopProcessorConfiguration instance
   */
  static fromFile(
    filePath: string,
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): SagemakerUdopProcessorConfiguration {
    const definition = SagemakerUdopProcessorConfigurationDefinition.fromFile(
      filePath,
      options,
    );
    return new SagemakerUdopProcessorConfiguration(definition);
  }

  /**
   * Creates a default configuration with standard settings.
   *
   * @param options Optional configuration options
   * @returns A configuration definition with default settings
   */
  static rvlCdipPackageSample(
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): SagemakerUdopProcessorConfiguration {
    const definition =
      SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample(
        options,
      );
    return new SagemakerUdopProcessorConfiguration(definition);
  }

  /**
   * Protected constructor to enforce factory method usage.
   *
   * @param definition The configuration definition instance
   */
  protected constructor(
    private readonly definition: ISagemakerUdopProcessorConfigurationDefinition,
  ) {}

  public bind(
    processor: ISagemakerUdopProcessor,
  ): ISagemakerUdopProcessorConfigurationDefinition {
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
