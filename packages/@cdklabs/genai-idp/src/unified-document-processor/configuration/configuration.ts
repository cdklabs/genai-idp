/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { CustomResource } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Invokable } from "../../invokable";
import { IUnifiedDocumentProcessor } from "../unified-document-processor";
import {
  IUnifiedDocumentProcessorConfigurationDefinition,
  UnifiedDocumentProcessorConfigurationDefinition,
  UnifiedDocumentProcessorConfigurationDefinitionOptions,
} from "./definition";

/**
 * Interface for Unified Document Processor configuration.
 * Provides configuration management for the unified processing pipeline.
 *
 * @since 0.5.2
 */
export interface IUnifiedDocumentProcessorConfiguration {
  /**
   * Binds the configuration to a processor instance.
   * Creates custom resources that write the default configuration and schema
   * to the configuration table.
   *
   * @param processor The unified document processor to apply to
   * @returns The resolved configuration definition with inference providers
   */
  bind(
    processor: IUnifiedDocumentProcessor,
  ): IUnifiedDocumentProcessorConfigurationDefinition;
}

/**
 * Configuration management for the Unified Document Processor.
 *
 * Manages configuration definitions (default config values) for the unified
 * processing pipeline. Provides factory methods for preset configurations
 * and custom YAML files.
 *
 * @example
 * const config = UnifiedDocumentProcessorConfiguration.lendingPackageSample();
 * const processor = new UnifiedDocumentProcessor(this, 'Processor', {
 *   environment,
 *   configuration: config,
 *   configurationBucket,
 * });
 *
 * @since 0.5.2
 */
export class UnifiedDocumentProcessorConfiguration implements IUnifiedDocumentProcessorConfiguration {
  /** Creates a configuration from a custom YAML file. */
  static fromFile(
    filePath: string,
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.fromFile(
        filePath,
        options,
      ),
    );
  }

  /** Lending package sample preset. */
  static lendingPackageSample(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.lendingPackageSample(
        options,
      ),
    );
  }

  /** Lending package sample for GovCloud. */
  static lendingPackageSampleGovCloud(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.lendingPackageSampleGovCloud(
        options,
      ),
    );
  }

  /** Bank statement sample preset. */
  static bankStatementSample(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.bankStatementSample(
        options,
      ),
    );
  }

  /** Document splitting preset. */
  static docSplit(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.docSplit(options),
    );
  }

  /** OCR benchmark preset. */
  static ocrBenchmark(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.ocrBenchmark(options),
    );
  }

  /** RealKIE FCC verified preset. */
  static realkieFccVerified(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.realkieFccVerified(
        options,
      ),
    );
  }

  /** RVL-CDIP classification preset. */
  static rvlCdip(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.rvlCdip(options),
    );
  }

  /** RVL-CDIP with few-shot examples preset. */
  static rvlCdipWithFewShotExamples(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.rvlCdipWithFewShotExamples(
        options,
      ),
    );
  }

  /** Rule validation preset. */
  static ruleValidation(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.ruleValidation(options),
    );
  }

  /** Rule extraction preset. */
  static ruleExtraction(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): UnifiedDocumentProcessorConfiguration {
    return new UnifiedDocumentProcessorConfiguration(
      UnifiedDocumentProcessorConfigurationDefinition.ruleExtraction(options),
    );
  }

  protected constructor(
    private readonly definition: IUnifiedDocumentProcessorConfigurationDefinition,
  ) {}

  /**
   * Binds the configuration to a processor instance.
   * Creates a custom resource that writes the default configuration to the configuration table.
   * Also resolves LambdaHook functions from ARN when specified in config but not via CDK options.
   *
   * @param processor The unified document processor to bind to
   * @returns The configuration definition with resolved inference providers
   */
  public bind(
    processor: IUnifiedDocumentProcessor,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    new CustomResource(processor, "UpdateDefaultConfig", {
      serviceToken: processor.environment.configurationFunction.functionArn,
      properties: {
        Default: this.definition.raw(),
        ConfigurationTable: processor.environment.configurationTable.tableName,
      },
    });

    const rawConfig = this.definition.raw();
    let result: IUnifiedDocumentProcessorConfigurationDefinition =
      this.definition;

    // Import custom prompt generator from ARN if specified in config but not via CDK options
    const customPromptArn = rawConfig?.extraction?.custom_prompt_lambda_arn;
    if (customPromptArn && !this.definition.customPromptGenerator) {
      const importedFunction = lambda.Function.fromFunctionArn(
        processor,
        "CustomPromptGenerator",
        customPromptArn,
      );
      result = { ...result, customPromptGenerator: importedFunction };
    }

    // Import LambdaHook functions from ARN when specified in config but not via CDK options
    const hookImports: Array<{
      section: string;
      key: string;
      prop: keyof IUnifiedDocumentProcessorConfigurationDefinition;
      id: string;
    }> = [
      {
        section: "ocr",
        key: "model_lambda_hook_arn",
        prop: "ocrInferenceProvider",
        id: "OcrLambdaHook",
      },
      {
        section: "classification",
        key: "model_lambda_hook_arn",
        prop: "classificationInferenceProvider",
        id: "ClassificationLambdaHook",
      },
      {
        section: "extraction",
        key: "model_lambda_hook_arn",
        prop: "extractionInferenceProvider",
        id: "ExtractionLambdaHook",
      },
      {
        section: "assessment",
        key: "model_lambda_hook_arn",
        prop: "assessmentInferenceProvider",
        id: "AssessmentLambdaHook",
      },
      {
        section: "summarization",
        key: "model_lambda_hook_arn",
        prop: "summarizationInferenceProvider",
        id: "SummarizationLambdaHook",
      },
    ];

    for (const { section, key, prop, id } of hookImports) {
      const arn = rawConfig?.[section]?.[key];
      if (arn && !result[prop]) {
        result = {
          ...result,
          [prop]: Invokable.fromFunction(
            lambda.Function.fromFunctionArn(processor, id, arn),
          ),
        };
      }
    }

    return result;
  }
}
