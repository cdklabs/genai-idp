/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { Arn, ArnFormat } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import {
  ConfigurationDefinition,
  IConfigurationDefinition,
} from "../../configuration-definition";
import {
  ConfigurationDefinitionLoader,
  mergeConfigWithDefaults,
  modelNameToInvokable,
} from "../../internal";
import { Invokable, InvokableType, IInvokable } from "../../invokable";

/**
 * Options for configuring the Unified Document Processor configuration definition.
 *
 * Use `Invokable.fromModel()` to wrap a Bedrock model or `Invokable.fromFunction()`
 * to wrap a Lambda function implementing the LambdaHook contract.
 *
 * @since 0.5.2
 */
export interface UnifiedDocumentProcessorConfigurationDefinitionOptions {
  /**
   * Optional inference provider for the OCR stage.
   * Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.
   *
   * @default - as defined in the configuration file
   */
  readonly ocrInvokable?: Invokable;

  /**
   * Optional inference provider for the classification stage.
   * Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.
   *
   * @default - as defined in the configuration file
   */
  readonly classificationInvokable?: Invokable;

  /**
   * Optional inference provider for the extraction stage.
   * Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.
   *
   * @default - as defined in the configuration file
   */
  readonly extractionInvokable?: Invokable;

  /**
   * Optional inference provider for the assessment stage.
   * Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.
   *
   * @default - as defined in the configuration file
   */
  readonly assessmentInvokable?: Invokable;

  /**
   * Optional inference provider for the summarization stage.
   * Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.
   *
   * @default - as defined in the configuration file
   */
  readonly summarizationInvokable?: Invokable;

  /**
   * Optional model for the evaluation stage.
   * Evaluation does not support LambdaHook — only Bedrock models.
   *
   * @default - as defined in the configuration file
   */
  readonly evaluationModel?: IBedrockInvokable;

  /**
   * Optional custom prompt generator Lambda function.
   * When provided, overrides the custom_prompt_lambda_arn in the configuration.
   *
   * @default - as defined in the configuration file
   */
  readonly customPromptGenerator?: lambda.IFunction;
}

/**
 * Interface for the Unified Document Processor configuration definition.
 * Exposes resolved inference providers for each processing stage.
 *
 * @since 0.5.2
 */
export interface IUnifiedDocumentProcessorConfigurationDefinition extends IConfigurationDefinition {
  /** Inference provider for OCR. */
  readonly ocrInferenceProvider?: IInvokable;
  /** Inference provider for classification. */
  readonly classificationInferenceProvider?: IInvokable;
  /** Inference provider for extraction. */
  readonly extractionInferenceProvider?: IInvokable;
  /** Inference provider for assessment. */
  readonly assessmentInferenceProvider?: IInvokable;
  /** Inference provider for summarization. */
  readonly summarizationInferenceProvider?: IInvokable;
  /** Model for evaluation (Bedrock only). */
  readonly evaluationModel?: IBedrockInvokable;
  /** OCR backend type. */
  readonly ocrBackend: "textract" | "bedrock" | "none";
  /** Custom prompt generator Lambda function. */
  readonly customPromptGenerator?: lambda.IFunction;
}

/**
 * Configuration definition for the Unified Document Processor.
 *
 * Provides factory methods to create configuration definitions from preset
 * config files or custom YAML files. Transforms resolve Bedrock model names
 * and LambdaHook ARNs into `IInvokable` instances for CDK-native permission grants.
 *
 * @since 0.5.2
 */
export class UnifiedDocumentProcessorConfigurationDefinition {
  /** Lending package sample preset. */
  static lendingPackageSample(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("lending-package-sample", options);
  }

  /** Lending package sample for GovCloud. */
  static lendingPackageSampleGovCloud(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("lending-package-sample-govcloud", options);
  }

  /** Bank statement sample preset. */
  static bankStatementSample(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("bank-statement-sample", options);
  }

  /** Document splitting preset. */
  static docSplit(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("docsplit", options);
  }

  /** OCR benchmark preset. */
  static ocrBenchmark(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("ocr-benchmark", options);
  }

  /** RealKIE FCC verified preset. */
  static realkieFccVerified(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("realkie-fcc-verified", options);
  }

  /** RVL-CDIP classification preset. */
  static rvlCdip(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("rvl-cdip", options);
  }

  /** RVL-CDIP with few-shot examples preset. */
  static rvlCdipWithFewShotExamples(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("rvl-cdip-with-few-shot-examples", options);
  }

  /** Rule validation preset. */
  static ruleValidation(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("rule-validation", options);
  }

  /** Rule extraction preset. */
  static ruleExtraction(
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromConfigLibrary("rule-extraction", options);
  }

  /**
   * Creates a configuration definition from a custom YAML file.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional overrides for inference providers
   * @returns A configuration definition loaded from the file
   */
  static fromFile(
    filePath: string,
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromFile(filePath, options);
  }

  private static _fromConfigLibrary(
    presetName: string,
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "configs",
        "unified",
        presetName,
        "config.yaml",
      ),
      options,
    );
  }

  private static _fromFile(
    filePath: string,
    options?: UnifiedDocumentProcessorConfigurationDefinitionOptions,
  ): IUnifiedDocumentProcessorConfigurationDefinition {
    let _ocrInferenceProvider: IInvokable | undefined;
    let _classificationInferenceProvider: IInvokable | undefined;
    let _extractionInferenceProvider: IInvokable | undefined;
    let _assessmentInferenceProvider: IInvokable | undefined;
    let _summarizationInferenceProvider: IInvokable | undefined;
    let _evaluationModel: IBedrockInvokable | undefined;
    let _ocrBackend: "textract" | "bedrock" | "none" = "textract";
    let _customPromptGenerator: lambda.IFunction | undefined;
    let _customPromptLambdaArn: string | undefined;

    if (options?.customPromptGenerator) {
      _customPromptGenerator = options.customPromptGenerator;
    }

    const userConfig = ConfigurationDefinitionLoader.fromFile(filePath);
    const mergedConfig = mergeConfigWithDefaults(userConfig, "pattern-2");

    const def = new ConfigurationDefinition({
      configurationObject: mergedConfig,
      transforms: [
        // OCR backend detection
        {
          flatPath: "ocr.backend",
          transform: (value?: string) => {
            if (value === "bedrock" || value === "none") {
              _ocrBackend = value;
            }
            return value;
          },
        },
        // Model transforms with LambdaHook support
        ...buildInvokableTransform(
          "ocr.model_id",
          options?.ocrInvokable,
          (inv) => {
            _ocrInferenceProvider = inv;
          },
        ),
        ...buildInvokableTransform(
          "classification.model",
          options?.classificationInvokable,
          (inv) => {
            _classificationInferenceProvider = inv;
          },
        ),
        ...buildInvokableTransform(
          "extraction.model",
          options?.extractionInvokable,
          (inv) => {
            _extractionInferenceProvider = inv;
          },
        ),
        ...buildInvokableTransform(
          "assessment.model",
          options?.assessmentInvokable,
          (inv) => {
            _assessmentInferenceProvider = inv;
          },
        ),
        ...buildInvokableTransform(
          "summarization.model",
          options?.summarizationInvokable,
          (inv) => {
            _summarizationInferenceProvider = inv;
          },
        ),
        // LambdaHook ARN transforms
        ...buildLambdaHookArnTransform(
          "ocr.model_lambda_hook_arn",
          options?.ocrInvokable,
        ),
        ...buildLambdaHookArnTransform(
          "classification.model_lambda_hook_arn",
          options?.classificationInvokable,
        ),
        ...buildLambdaHookArnTransform(
          "extraction.model_lambda_hook_arn",
          options?.extractionInvokable,
        ),
        ...buildLambdaHookArnTransform(
          "assessment.model_lambda_hook_arn",
          options?.assessmentInvokable,
        ),
        ...buildLambdaHookArnTransform(
          "summarization.model_lambda_hook_arn",
          options?.summarizationInvokable,
        ),
        // Evaluation (Bedrock only, no LambdaHook)
        {
          flatPath: "evaluation.llm_method.model",
          transform: (modelName?: string) => {
            if (options?.evaluationModel) {
              _evaluationModel = options.evaluationModel;
              return Arn.split(
                options.evaluationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            }
            if (modelName) {
              _evaluationModel = modelNameToInvokable(modelName);
            }
            return modelName;
          },
        },
        // Custom prompt generator
        {
          flatPath: "extraction.custom_prompt_lambda_arn",
          transform: (configValue?: string) => {
            if (options?.customPromptGenerator) {
              return options.customPromptGenerator.functionArn;
            }
            if (configValue) {
              _customPromptLambdaArn = configValue;
            }
            return configValue;
          },
        },
      ],
    });

    // Resolve custom prompt generator from ARN if not provided via options
    if (_customPromptLambdaArn && !_customPromptGenerator) {
      // Will be resolved during bind() when we have a scope
    }

    class LoadedDefinition implements IUnifiedDocumentProcessorConfigurationDefinition {
      public readonly ocrInferenceProvider = _ocrInferenceProvider;
      public readonly classificationInferenceProvider =
        _classificationInferenceProvider;
      public readonly extractionInferenceProvider =
        _extractionInferenceProvider;
      public readonly assessmentInferenceProvider =
        _assessmentInferenceProvider;
      public readonly summarizationInferenceProvider =
        _summarizationInferenceProvider;
      public readonly evaluationModel = _evaluationModel;
      public readonly ocrBackend = _ocrBackend;
      public readonly customPromptGenerator = _customPromptGenerator;

      raw() {
        return def.raw();
      }
      validate() {
        return def.validate();
      }
      isLegacyFormat() {
        return def.isLegacyFormat();
      }
      isJsonSchemaFormat() {
        return def.isJsonSchemaFormat();
      }
    }

    return new LoadedDefinition();
  }
}

/**
 * Builds model + LambdaHook transform pair for a given config path.
 * @internal
 */
function buildInvokableTransform(
  modelPath: string,
  invokable: Invokable | undefined,
  setter: (inv: IInvokable) => void,
) {
  return [
    {
      flatPath: modelPath,
      transform: (modelName?: string) => {
        if (invokable?._type === InvokableType.FUNCTION) {
          setter(invokable);
          return "LambdaHook";
        } else if (invokable?._type === InvokableType.MODEL) {
          setter(invokable);
          return Arn.split(
            invokable._model.invokableArn,
            ArnFormat.SLASH_RESOURCE_NAME,
          ).resourceName;
        } else {
          if (modelName) {
            setter(Invokable.fromModel(modelNameToInvokable(modelName)));
          }
          return modelName;
        }
      },
    },
  ];
}

/**
 * Builds LambdaHook ARN transform for a given config path.
 * @internal
 */
function buildLambdaHookArnTransform(
  arnPath: string,
  invokable: Invokable | undefined,
) {
  return [
    {
      flatPath: arnPath,
      transform: (configValue?: string) => {
        if (invokable?._type === InvokableType.FUNCTION) {
          return invokable._fn.functionArn;
        }
        return configValue;
      },
    },
  ];
}
