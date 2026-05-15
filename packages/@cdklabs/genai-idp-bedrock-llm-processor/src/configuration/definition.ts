/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import {
  IConfigurationDefinition,
  IInvokable,
  IUnifiedDocumentProcessorConfigurationDefinition,
  Invokable,
  UnifiedDocumentProcessorConfigurationDefinition,
} from "@cdklabs/genai-idp";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { ClassificationMethod } from "../classification-method";

/**
 * Options for configuring the Bedrock LLM processor configuration definition.
 * Allows customization of all processing stages via Invokable providers.
 */
export interface BedrockLlmProcessorConfigurationDefinitionOptions {
  /** Optional inference provider for the OCR stage. */
  readonly ocrInvokable?: Invokable;
  /** Optional inference provider for the classification stage. */
  readonly classificationInvokable?: Invokable;
  /** Optional classification method for document categorization. */
  readonly classificationMethod?: ClassificationMethod;
  /** Optional inference provider for the extraction stage. */
  readonly extractionInvokable?: Invokable;
  /** Optional model for the evaluation stage (Bedrock only, no LambdaHook). */
  readonly evaluationModel?: IBedrockInvokable;
  /** Optional inference provider for the summarization stage. */
  readonly summarizationInvokable?: Invokable;
  /** Optional inference provider for the assessment stage. */
  readonly assessmentInvokable?: Invokable;
  /** Optional custom prompt generator Lambda function. */
  readonly customPromptGeneratorFunction?: lambda.IFunction;
}

/**
 * Interface for Bedrock LLM processor configuration definition.
 * Exposes resolved inference providers for each processing stage.
 */
export interface IBedrockLlmProcessorConfigurationDefinition extends IConfigurationDefinition {
  readonly classificationInferenceProvider?: IInvokable;
  readonly classificationMethod: ClassificationMethod;
  readonly extractionInferenceProvider?: IInvokable;
  readonly summarizationInferenceProvider?: IInvokable;
  readonly evaluationModel?: IBedrockInvokable;
  readonly assessmentInferenceProvider?: IInvokable;
  readonly ocrInferenceProvider?: IInvokable;
  readonly ocrBackend: "textract" | "bedrock" | "none";
  readonly customPromptGenerator?: lambda.IFunction;
}

/**
 * Configuration definition for Bedrock LLM document processing.
 *
 * Delegates to `UnifiedDocumentProcessorConfigurationDefinition` for loading
 * configs from the unified config library. Maps bedrock-llm-specific options
 * to unified options.
 *
 * @since 0.5.2
 */
export class BedrockLlmProcessorConfigurationDefinition {
  static lendingPackageSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.lendingPackageSample(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static lendingPackageSampleGovCloud(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.lendingPackageSampleGovCloud(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static bankStatementSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.bankStatementSample(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static docSplit(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.docSplit(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static ocrBenchmark(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.ocrBenchmark(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static realkieFccVerified(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.realkieFccVerified(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static rvlCdip(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.rvlCdip(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static rvlCdipWithFewShotExamples(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.rvlCdipWithFewShotExamples(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static ruleExtraction(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.ruleExtraction(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static ruleValidation(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.ruleValidation(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static healthcareMultisectionPackage(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    // This preset exists in the unified config library but doesn't have
    // a dedicated factory method on UnifiedDocumentProcessorConfigurationDefinition.
    const configPath = path.join(
      path.dirname(
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        require.resolve("@cdklabs/genai-idp/package.json"),
      ),
      "assets",
      "configs",
      "unified",
      "healthcare-multisection-package",
      "config.yaml",
    );
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.fromFile(
        configPath,
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  static fromFile(
    filePath: string,
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.fromFile(
        filePath,
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  /** Maps bedrock-llm options to unified options. */
  private static _toUnifiedOptions(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ) {
    if (!options) return undefined;
    return {
      ocrInvokable: options.ocrInvokable,
      classificationInvokable: options.classificationInvokable,
      extractionInvokable: options.extractionInvokable,
      assessmentInvokable: options.assessmentInvokable,
      summarizationInvokable: options.summarizationInvokable,
      evaluationModel: options.evaluationModel,
      customPromptGenerator: options.customPromptGeneratorFunction,
    };
  }

  /** Wraps a unified definition with bedrock-llm-specific interface. */
  private static _wrap(
    unified: IUnifiedDocumentProcessorConfigurationDefinition,
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    const rawConfig = unified.raw();

    // Apply classificationMethod override if provided
    if (options?.classificationMethod && rawConfig.classification) {
      rawConfig.classification.classificationMethod =
        options.classificationMethod;
    }

    const classificationMethod =
      options?.classificationMethod ??
      (rawConfig.classification
        ?.classificationMethod as ClassificationMethod) ??
      ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION;

    return {
      classificationInferenceProvider: unified.classificationInferenceProvider,
      classificationMethod,
      extractionInferenceProvider: unified.extractionInferenceProvider,
      summarizationInferenceProvider: unified.summarizationInferenceProvider,
      evaluationModel: unified.evaluationModel,
      assessmentInferenceProvider: unified.assessmentInferenceProvider,
      ocrInferenceProvider: unified.ocrInferenceProvider,
      ocrBackend: unified.ocrBackend,
      customPromptGenerator: unified.customPromptGenerator,
      raw: () => rawConfig,
      validate: () => unified.validate(),
      isLegacyFormat: () => unified.isLegacyFormat(),
      isJsonSchemaFormat: () => unified.isJsonSchemaFormat(),
    };
  }
}
