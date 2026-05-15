/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import {
  IConfigurationDefinition,
  IInvokable,
  IUnifiedDocumentProcessorConfigurationDefinition,
  Invokable,
  UnifiedDocumentProcessorConfigurationDefinition,
} from "@cdklabs/genai-idp";
import * as lambda from "aws-cdk-lib/aws-lambda";

/**
 * Options for configuring the SageMaker UDOP processor configuration definition.
 */
export interface SagemakerUdopProcessorConfigurationDefinitionOptions {
  /** Optional model for the extraction stage. */
  readonly extractionModel?: IBedrockInvokable;
  /** Optional model for the evaluation stage. */
  readonly evaluationModel?: IBedrockInvokable;
  /** Optional model for the summarization stage. */
  readonly summarizationModel?: IBedrockInvokable;
  /** Optional model for the assessment stage. */
  readonly assessmentModel?: IBedrockInvokable;
  /** Optional custom prompt generator Lambda function. */
  readonly customPromptGeneratorFunction?: lambda.IFunction;
}

/**
 * Interface for SageMaker UDOP processor configuration definition.
 */
export interface ISagemakerUdopProcessorConfigurationDefinition extends IConfigurationDefinition {
  readonly extractionInferenceProvider?: IInvokable;
  readonly evaluationModel?: IBedrockInvokable;
  readonly summarizationInferenceProvider?: IInvokable;
  readonly assessmentInferenceProvider?: IInvokable;
  readonly ocrBackend: "textract" | "bedrock" | "none";
  readonly customPromptGenerator?: lambda.IFunction;
}

/**
 * Configuration definition for SageMaker UDOP document processing.
 *
 * Delegates to `UnifiedDocumentProcessorConfigurationDefinition` for loading
 * configs from the unified config library. Maps SageMaker-specific options
 * to unified options. Classification is handled by the SageMaker endpoint
 * via LambdaHook, not by a Bedrock model.
 */
export class SagemakerUdopProcessorConfigurationDefinition {
  /** RVL-CDIP package sample preset. */
  static rvlCdipPackageSample(
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): ISagemakerUdopProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.rvlCdip(
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  /** Creates a configuration from a custom YAML file. */
  static fromFile(
    filePath: string,
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): ISagemakerUdopProcessorConfigurationDefinition {
    return this._wrap(
      UnifiedDocumentProcessorConfigurationDefinition.fromFile(
        filePath,
        this._toUnifiedOptions(options),
      ),
      options,
    );
  }

  /** Maps SageMaker options to unified options. Classification is excluded — handled by LambdaHook. */
  private static _toUnifiedOptions(
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ) {
    if (!options) return undefined;
    return {
      extractionInvokable: options.extractionModel
        ? Invokable.fromModel(options.extractionModel)
        : undefined,
      assessmentInvokable: options.assessmentModel
        ? Invokable.fromModel(options.assessmentModel)
        : undefined,
      summarizationInvokable: options.summarizationModel
        ? Invokable.fromModel(options.summarizationModel)
        : undefined,
      evaluationModel: options.evaluationModel,
      customPromptGenerator: options.customPromptGeneratorFunction,
    };
  }

  /** Wraps a unified definition with SageMaker-specific interface. */
  private static _wrap(
    unified: IUnifiedDocumentProcessorConfigurationDefinition,
    _options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): ISagemakerUdopProcessorConfigurationDefinition {
    return {
      extractionInferenceProvider: unified.extractionInferenceProvider,
      evaluationModel: unified.evaluationModel,
      summarizationInferenceProvider: unified.summarizationInferenceProvider,
      assessmentInferenceProvider: unified.assessmentInferenceProvider,
      ocrBackend: unified.ocrBackend,
      customPromptGenerator: unified.customPromptGenerator,
      raw: () => unified.raw(),
      validate: () => unified.validate(),
      isLegacyFormat: () => unified.isLegacyFormat(),
      isJsonSchemaFormat: () => unified.isJsonSchemaFormat(),
    };
  }
}
