/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import {
  IConfigurationDefinition,
  IInvokable,
  Invokable,
  UnifiedDocumentProcessorConfigurationDefinition,
  IUnifiedDocumentProcessorConfigurationDefinition,
} from "@cdklabs/genai-idp";

/**
 * Options for configuring the BDA processor configuration definition.
 * Allows customization of evaluation and summarization models.
 * BDA handles OCR, classification, extraction, and assessment internally,
 * so those options are not exposed.
 */
export interface BdaProcessorConfigurationDefinitionOptions {
  /**
   * Optional model for the evaluation stage.
   * Defines the model used for evaluating extraction accuracy.
   */
  readonly evaluationModel?: IBedrockInvokable;

  /**
   * Optional model for the summarization stage.
   * Defines the model used for generating document summaries.
   */
  readonly summarizationModel?: IBedrockInvokable;
}

/**
 * Interface for BDA processor configuration definition.
 * Exposes only BDA-relevant options (summarization, evaluation).
 */
export interface IBdaProcessorConfigurationDefinition extends IConfigurationDefinition {
  /** Optional model for evaluating extraction results. */
  readonly evaluationModel?: IBedrockInvokable;
  /** Optional model for document summarization. */
  readonly summarizationModel?: IBedrockInvokable;
  /** @internal Resolved summarization inference provider from config or options. */
  readonly _summarizationInferenceProvider?: IInvokable;
}

/**
 * Configuration definition for BDA document processing.
 *
 * Loads configuration from the unified config library and forces `use_bda: true`.
 * Maps BDA-specific options (summarizationModel, evaluationModel) to the unified
 * configuration definition options.
 *
 * @since 0.5.2
 */
export class BdaProcessorConfigurationDefinition {
  /** Lending package sample preset with `use_bda: true`. */
  static lendingPackageSample(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified =
      UnifiedDocumentProcessorConfigurationDefinition.lendingPackageSample(
        BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
      );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /** Lending package sample for GovCloud with `use_bda: true`. */
  static lendingPackageSampleGovCloud(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified =
      UnifiedDocumentProcessorConfigurationDefinition.lendingPackageSampleGovCloud(
        BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
      );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /** Document splitting preset with `use_bda: true`. */
  static docSplit(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified = UnifiedDocumentProcessorConfigurationDefinition.docSplit(
      BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
    );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /** OCR benchmark preset with `use_bda: true`. */
  static ocrBenchmark(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified =
      UnifiedDocumentProcessorConfigurationDefinition.ocrBenchmark(
        BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
      );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /** RealKIE FCC verified preset with `use_bda: true`. */
  static realkieFccVerified(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified =
      UnifiedDocumentProcessorConfigurationDefinition.realkieFccVerified(
        BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
      );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /** RVL-CDIP classification preset with `use_bda: true`. */
  static rvlCdip(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified = UnifiedDocumentProcessorConfigurationDefinition.rvlCdip(
      BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
    );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /** Creates a configuration definition from a custom YAML file with `use_bda: true`. */
  static fromFile(
    filePath: string,
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    const unified = UnifiedDocumentProcessorConfigurationDefinition.fromFile(
      filePath,
      BdaProcessorConfigurationDefinition._toUnifiedOptions(options),
    );
    return BdaProcessorConfigurationDefinition._wrap(unified, options);
  }

  /**
   * Maps BDA-specific options to unified configuration definition options.
   * Only maps summarization and evaluation — BDA handles OCR, classification,
   * extraction, and assessment internally.
   */
  private static _toUnifiedOptions(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ) {
    if (!options) return undefined;
    return {
      summarizationInvokable: options.summarizationModel
        ? Invokable.fromModel(options.summarizationModel)
        : undefined,
      evaluationModel: options.evaluationModel,
    };
  }

  /**
   * Wraps a unified definition to force `use_bda: true` and expose
   * only BDA-relevant properties.
   */
  private static _wrap(
    unified: IUnifiedDocumentProcessorConfigurationDefinition,
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    // Force use_bda: true in the raw config
    const rawConfig = unified.raw();
    rawConfig.use_bda = true;

    // Resolve summarization inference provider: explicit option > config-derived
    const summarizationInferenceProvider = options?.summarizationModel
      ? Invokable.fromModel(options.summarizationModel)
      : unified.summarizationInferenceProvider;

    return {
      evaluationModel: options?.evaluationModel ?? unified.evaluationModel,
      summarizationModel: options?.summarizationModel,
      _summarizationInferenceProvider: summarizationInferenceProvider,
      raw: () => rawConfig,
      validate: () => unified.validate(),
      isLegacyFormat: () => unified.isLegacyFormat(),
      isJsonSchemaFormat: () => unified.isJsonSchemaFormat(),
    };
  }
}
