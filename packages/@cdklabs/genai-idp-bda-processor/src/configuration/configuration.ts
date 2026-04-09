/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IProcessingEnvironment } from "@cdklabs/genai-idp";
import { CustomResource } from "aws-cdk-lib";
import { Construct } from "constructs";
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
  /** The configuration definition. */
  readonly definition: IBdaProcessorConfigurationDefinition;

  /**
   * Binds the configuration to a processor instance.
   * Writes the default configuration to the configuration table.
   *
   * @param scope The construct scope for creating custom resources
   * @param environment The processing environment providing the configuration function and table
   * @param bdaProjectArn Optional BDA project ARN to store alongside the config
   */
  bind(
    scope: Construct,
    environment: IProcessingEnvironment,
    bdaProjectArn?: string,
  ): IBdaProcessorConfigurationDefinition;
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
   * This configuration includes full class definitions and extraction schemas.
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
   * Creates a minimal configuration for GovCloud deployments.
   * This configuration demonstrates the "minimal override" pattern where only
   * GovCloud-compatible model IDs are specified, and all other settings
   * (classes, prompts, etc.) are inherited from system defaults at runtime.
   *
   * This approach is useful when you want to:
   * - Use system default class definitions
   * - Only override region-specific settings (like model IDs)
   * - Keep your config file minimal and maintainable
   *
   * @param options Optional configuration options
   * @returns A minimal configuration definition for GovCloud deployment
   */
  static lendingPackageSampleGovCloud(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition =
      BdaProcessorConfigurationDefinition.lendingPackageSampleGovCloud(options);
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for document splitting.
   * This configuration focuses on splitting multi-document files into
   * individual documents for processing.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for document splitting
   */
  static docSplit(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition = BdaProcessorConfigurationDefinition.docSplit(options);
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for OCR benchmarking.
   * This configuration is designed for evaluating OCR performance
   * across different document types and quality levels.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for OCR benchmarking
   */
  static ocrBenchmark(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition =
      BdaProcessorConfigurationDefinition.ocrBenchmark(options);
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for RealKIE FCC verified documents.
   * This configuration is optimized for processing FCC-verified documents
   * from the RealKIE dataset.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for RealKIE FCC documents
   */
  static realkieFccVerified(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition =
      BdaProcessorConfigurationDefinition.realkieFccVerified(options);
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for RVL-CDIP document classification.
   * This configuration is designed for the RVL-CDIP dataset, which contains
   * 16 classes of document images for classification tasks.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for RVL-CDIP processing
   */
  static rvlCdip(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): BdaProcessorConfiguration {
    const definition = BdaProcessorConfigurationDefinition.rvlCdip(options);
    return new BdaProcessorConfiguration(definition);
  }

  /**
   * Protected constructor to enforce factory method usage.
   *
   * @param definition The configuration definition instance
   */
  protected constructor(
    public readonly definition: IBdaProcessorConfigurationDefinition,
  ) {}

  /**
   * Binds the configuration to a processor instance.
   * Creates a custom resource that writes the default configuration to the configuration table.
   *
   * @param scope The construct scope for creating custom resources
   * @param environment The processing environment providing the configuration function and table
   * @param bdaProjectArn Optional BDA project ARN to store alongside the config
   * @returns The configuration definition with resolved model references
   */
  public bind(
    scope: Construct,
    environment: IProcessingEnvironment,
    bdaProjectArn?: string,
  ): IBdaProcessorConfigurationDefinition {
    new CustomResource(scope, "UpdateDefaultConfig", {
      serviceToken: environment.configurationFunction.functionArn,
      properties: {
        Default: this.definition.raw(),
        ConfigurationTable: environment.configurationTable.tableName,
        ...(bdaProjectArn && { BdaProjectArn: bdaProjectArn }),
      },
    });

    return this.definition;
  }
}
