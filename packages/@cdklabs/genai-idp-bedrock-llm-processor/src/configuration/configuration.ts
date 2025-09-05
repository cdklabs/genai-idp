/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CustomResource } from "aws-cdk-lib";
import {
  BedrockLlmProcessorConfigurationDefinition,
  BedrockLlmProcessorConfigurationDefinitionOptions,
  IBedrockLlmProcessorConfigurationDefinition,
} from "./definition";
import { IBedrockLlmProcessor } from "../processor";

/**
 * Interface for Bedrock LLM document processor configuration.
 * Provides configuration management for custom extraction with Bedrock models.
 */
export interface IBedrockLlmProcessorConfiguration {
  /**
   * Binds the configuration to a processor instance.
   * This method applies the configuration to the processor.
   *
   * @param processor The Bedrock LLM document processor to apply to
   */
  bind(
    processor: IBedrockLlmProcessor,
  ): IBedrockLlmProcessorConfigurationDefinition;
}

/**
 * Configuration management for Bedrock LLM document processing using custom extraction with Bedrock models.
 *
 * This construct creates and manages the configuration for Bedrock LLM document processing,
 * including schema definitions, classification prompts, extraction prompts, and configuration
 * values. It provides a centralized way to manage document classes, extraction schemas, and model parameters.
 */
export class BedrockLlmProcessorConfiguration
  implements IBedrockLlmProcessorConfiguration
{
  /**
   * Creates a configuration from a YAML file.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional configuration options to override file settings
   * @returns A new BedrockLlmProcessorConfiguration instance
   */
  static fromFile(
    filePath: string,
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition = BedrockLlmProcessorConfigurationDefinition.fromFile(
      filePath,
      options,
    );
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for lending package processing.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for lending package processing
   */
  static lendingPackageSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.lendingPackageSample(options);
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for RVL-CDIP package processing.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for RVL-CDIP package processing
   */
  static rvlCdipPackageSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSample(options);
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for RVL-CDIP package processing with few-shot examples.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for RVL-CDIP package processing with few-shot examples
   */
  static rvlCdipPackageSampleWithFewShotExamples(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSampleWithFewShotExamples(
        options,
      );
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for bank statement processing.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for bank statement processing
   */
  static bankStatementSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.bankStatementSample(options);
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for criteria validation.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for criteria validation
   */
  static criteriaValidation(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.criteriaValidation(options);
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for checkbox extraction.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for checkbox extraction
   */
  static checkboxedAttributesExtraction(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.checkboxedAttributesExtraction(
        options,
      );
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration with few-shot examples and multimodal page classification.
   *
   * @param options Optional configuration options
   * @returns A configuration definition with few-shot examples
   */
  static fewShotExampleWithMultimodalPageClassification(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.fewShotExampleWithMultimodalPageClassification(
        options,
      );
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Creates a configuration for medical records summarization.
   *
   * @param options Optional configuration options
   * @returns A configuration definition for medical records summarization
   */
  static medicalRecordsSummarization(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    const definition =
      BedrockLlmProcessorConfigurationDefinition.medicalRecordsSummarization(
        options,
      );
    return new BedrockLlmProcessorConfiguration(definition);
  }

  /**
   * Protected constructor to enforce factory method usage.
   *
   * @param definition The configuration definition instance
   */
  protected constructor(
    private readonly definition: IBedrockLlmProcessorConfigurationDefinition,
  ) {}

  public bind(
    processor: IBedrockLlmProcessor,
  ): IBedrockLlmProcessorConfigurationDefinition {
    new CustomResource(processor, "SetDefaultConfig", {
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
