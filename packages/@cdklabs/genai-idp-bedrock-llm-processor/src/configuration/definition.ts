/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import {
  ConfigurationDefinition,
  ConfigurationDefinitionLoader,
  IConfigurationDefinition,
  mergeConfigWithDefaults,
  modelNameToInvokable,
} from "@cdklabs/genai-idp";
import { Arn, ArnFormat } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { ClassificationMethod } from "../classification-method";
import { IInvokable, Invokable } from "../invokable";

/**
 * Options for configuring the Bedrock LLM processor configuration definition.
 * Allows customization of classification, extraction, evaluation, summarization, and OCR stages.
 */
export interface BedrockLlmProcessorConfigurationDefinitionOptions {
  /**
   * Optional model for the classification stage.
   */
  readonly classificationModel?: IBedrockInvokable;
  /**
   * Optional classification method to use for document categorization.
   * Determines how documents are analyzed and categorized before extraction.
   */
  readonly classificationMethod?: ClassificationMethod;

  /**
   * Optional model for the extraction stage.
   */
  readonly extractionModel?: IBedrockInvokable;

  /**
   * Optional model for the evaluation stage.
   */
  readonly evaluationModel?: IBedrockInvokable;

  /**
   * Optional model for the summarization stage.
   */
  readonly summarizationModel?: IBedrockInvokable;

  /**
   * Optional model for the assessment stage.
   */
  readonly assessmentModel?: IBedrockInvokable;

  /**
   * Optional model for the OCR stage when using Bedrock-based OCR.
   * Only used when the OCR backend is set to 'bedrock' in the configuration.
   */
  readonly ocrModel?: IBedrockInvokable;

  /**
   * Optional custom prompt generator Lambda function.
   * When provided, the function ARN will be injected into the configuration
   * at `extraction.custom_prompt_lambda_arn`.
   */
  readonly customPromptGeneratorFunction?: lambda.IFunction;

  /**
   * Optional Lambda function for custom OCR inference.
   * When provided, the function ARN is injected into the configuration as
   * `ocr.model_lambda_hook_arn` and the OCR model is set to `LambdaHook`.
   * The function receives a Converse API-compatible payload and must return
   * a Converse API-compatible response.
   *
   * @default - No custom OCR function; uses Bedrock or Textract
   */
  readonly ocrFunction?: lambda.IFunction;

  /**
   * Optional Lambda function for custom classification inference.
   * When provided, the function ARN is injected into the configuration as
   * `classification.model_lambda_hook_arn` and the classification model is set to `LambdaHook`.
   * The function receives a Converse API-compatible payload and must return
   * a Converse API-compatible response.
   *
   * @default - No custom classification function; uses Bedrock model
   */
  readonly classificationFunction?: lambda.IFunction;

  /**
   * Optional Lambda function for custom extraction inference.
   * When provided, the function ARN is injected into the configuration as
   * `extraction.model_lambda_hook_arn` and the extraction model is set to `LambdaHook`.
   * The function receives a Converse API-compatible payload and must return
   * a Converse API-compatible response.
   *
   * @default - No custom extraction function; uses Bedrock model
   */
  readonly extractionFunction?: lambda.IFunction;

  /**
   * Optional Lambda function for custom assessment inference.
   * When provided, the function ARN is injected into the configuration as
   * `assessment.model_lambda_hook_arn` and the assessment model is set to `LambdaHook`.
   * The function receives a Converse API-compatible payload and must return
   * a Converse API-compatible response.
   *
   * @default - No custom assessment function; uses Bedrock model
   */
  readonly assessmentFunction?: lambda.IFunction;

  /**
   * Optional Lambda function for custom summarization inference.
   * When provided, the function ARN is injected into the configuration as
   * `summarization.model_lambda_hook_arn` and the summarization model is set to `LambdaHook`.
   * The function receives a Converse API-compatible payload and must return
   * a Converse API-compatible response.
   *
   * @default - No custom summarization function; uses Bedrock model
   */
  readonly summarizationFunction?: lambda.IFunction;
}

export interface IBedrockLlmProcessorConfigurationDefinition extends IConfigurationDefinition {
  /**
   * The inference provider used for document classification.
   * Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
   * wrapped via Invokable.fromFunction() (LambdaHook pattern).
   *
   * @default - as defined in the definition file
   */
  readonly classificationInferenceProvider?: IInvokable;

  /**
   * The method used for document classification.
   * Determines how documents are analyzed and categorized before extraction.
   * Different methods offer varying levels of accuracy and performance.
   *
   * @default - as defined in the definition file
   */
  readonly classificationMethod: ClassificationMethod;

  /**
   * The inference provider used for information extraction.
   * Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
   * wrapped via Invokable.fromFunction() (LambdaHook pattern).
   *
   * @default - as defined in the definition file
   */
  readonly extractionInferenceProvider?: IInvokable;

  /**
   * Optional inference provider used for document summarization.
   * Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
   * wrapped via Invokable.fromFunction() (LambdaHook pattern).
   *
   * @default - as defined in the definition file
   */
  readonly summarizationInferenceProvider?: IInvokable;

  /**
   * Optional invokable model used for evaluating extraction results.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Used to assess the quality and accuracy of extracted information by
   * comparing extraction results against expected values.
   *
   * @default - as defined in the definition file
   */
  readonly evaluationModel?: IBedrockInvokable;

  /**
   * Optional inference provider used for assessment.
   * Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
   * wrapped via Invokable.fromFunction() (LambdaHook pattern).
   *
   * @default - as defined in the definition file
   */
  readonly assessmentInferenceProvider?: IInvokable;

  /**
   * Optional inference provider used for OCR when using Bedrock-based OCR.
   * Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
   * wrapped via Invokable.fromFunction() (LambdaHook pattern).
   * Only used when the OCR backend is set to 'bedrock' in the configuration.
   *
   * @default - as defined in the definition file
   */
  readonly ocrInferenceProvider?: IInvokable;

  /**
   * OCR backend to use for text extraction.
   * Determines whether to use Amazon Textract or Bedrock for OCR processing.
   *
   * @default "textract"
   */
  readonly ocrBackend: "textract" | "bedrock";

  /**
   * Optional custom prompt generator Lambda function.
   * When provided, this function will be invoked during extraction to customize prompts.
   * This is either the function provided via configuration options, or imported from
   * the ARN specified in the configuration file.
   *
   * @default - undefined
   */
  readonly customPromptGenerator?: lambda.IFunction;
}

/**
 * Configuration definition for Pattern 2 document processing.
 * Provides methods to create and customize configuration for Bedrock LLM processing.
 */
export class BedrockLlmProcessorConfigurationDefinition {
  /**
   * Creates a configuration definition for lending package sample processing.
   * This configuration includes settings for classification, extraction,
   * evaluation, and summarization optimized for lending documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for lending package processing
   */
  static lendingPackageSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "lending-package-sample",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for RVL-CDIP package sample processing.
   * This configuration includes settings for classification, extraction,
   * evaluation, and summarization optimized for RVL-CDIP documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for RVL-CDIP package processing
   */
  static rvlCdipPackageSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "rvl-cdip-package-sample",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for RVL-CDIP package sample with few-shot examples.
   * This configuration includes few-shot examples to improve classification and extraction
   * accuracy for RVL-CDIP documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for RVL-CDIP package processing with few-shot examples
   */
  static rvlCdipPackageSampleWithFewShotExamples(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "rvl-cdip-package-sample-with-few-shot-examples",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for bank statement sample processing.
   * This configuration includes settings for classification, extraction,
   * evaluation, and summarization optimized for bank statement documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for bank statement processing
   */
  static bankStatementSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "bank-statement-sample",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for criteria validation processing.
   * This configuration includes settings for validating documents against
   * specific criteria and requirements.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for criteria validation
   */
  static criteriaValidation(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "criteria-validation",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition optimized for checkbox attribute extraction.
   * This configuration includes specialized prompts and settings for detecting
   * and extracting checkbox states from documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for checkbox extraction
   */
  static checkboxedAttributesExtraction(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "checkboxed_attributes_extraction",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition with few-shot examples for multimodal page classification.
   * This configuration includes example prompts that demonstrate how to classify
   * document pages using both visual and textual information.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition with few-shot examples
   */
  static fewShotExampleWithMultimodalPageClassification(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "few_shot_example_with_multimodal_page_classification",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for medical records summarization.
   * This configuration includes specialized prompts and settings for extracting
   * and summarizing key information from medical documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for medical records summarization
   */
  static medicalRecordsSummarization(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "medical_records_summarization",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for document splitting.
   * This configuration focuses on splitting multi-document files into
   * individual documents for processing.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for document splitting
   */
  static docSplit(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "docsplit",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for healthcare multisection package processing.
   * This configuration includes settings optimized for processing complex healthcare
   * documents with multiple sections.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for healthcare multisection processing
   */
  static healthcareMultisectionPackage(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "healthcare-multisection-package",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a minimal configuration definition for GovCloud deployments.
   * This configuration demonstrates the "minimal override" pattern where only
   * GovCloud-compatible model IDs are specified, and all other settings
   * are inherited from system defaults at runtime.
   *
   * @param options Optional customization for processing stages
   * @returns A minimal configuration definition for GovCloud deployment
   */
  static lendingPackageSampleGovCloud(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "lending-package-sample-govcloud",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for OCR benchmarking.
   * This configuration is designed for evaluating OCR performance
   * across different document types and quality levels.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for OCR benchmarking
   */
  static ocrBenchmark(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "ocr-benchmark",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for RealKIE FCC verified documents.
   * This configuration is optimized for processing FCC-verified documents
   * from the RealKIE dataset.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for RealKIE FCC documents
   */
  static realkieFccVerified(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "realkie-fcc-verified",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for rule extraction.
   * This configuration includes settings for extracting business rules
   * and validation criteria from documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for rule extraction
   */
  static ruleExtraction(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "rule-extraction",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for rule validation.
   * This configuration includes settings for validating documents
   * against extracted business rules and criteria.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for rule validation
   */
  static ruleValidation(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "rule-validation",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for RVL-CDIP document classification.
   * This configuration is designed for the RVL-CDIP dataset, which contains
   * 16 classes of document images for classification tasks.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for RVL-CDIP processing
   */
  static rvlCdip(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "rvl-cdip",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition for RVL-CDIP with few-shot examples.
   * This configuration includes few-shot examples to improve classification
   * accuracy for RVL-CDIP documents.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition for RVL-CDIP with few-shot examples
   */
  static rvlCdipWithFewShotExamples(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(
      path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "configs",
        "rvl-cdip-with-few-shot-examples",
        "config.yaml",
      ),
      options,
    );
  }

  /**
   * Creates a configuration definition from a YAML file.
   * Allows users to provide custom configuration files for document processing.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional customization for processing stages
   * @returns A configuration definition loaded from the file
   */
  static fromFile(
    filePath: string,
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    return this._fromFile(filePath, options);
  }

  /**
   * Creates a configuration definition from a file.
   *
   * @param filePath Path to the configuration file
   * @param options Optional customization for processing stages
   * @returns A loaded configuration definition
   * @private
   */
  private static _fromFile(
    filePath: string,
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): IBedrockLlmProcessorConfigurationDefinition {
    let _classificationInferenceProvider: IInvokable | undefined;
    let _classificationMethod: ClassificationMethod;
    let _extractionInferenceProvider: IInvokable | undefined;
    let _summarizationInferenceProvider: IInvokable | undefined;
    let _assessmentInferenceProvider: IInvokable | undefined;
    let _evaluationInvokable: IBedrockInvokable | undefined;
    let _ocrInferenceProvider: IInvokable | undefined;
    let _ocrBackend: "textract" | "bedrock";
    let _customPromptGenerator: lambda.IFunction | undefined;
    let _customPromptLambdaArn: string | undefined;

    // Load user config from file
    const userConfig = ConfigurationDefinitionLoader.fromFile(filePath);

    // Merge with system defaults for pattern-2 (Bedrock LLM processor)
    // This ensures we have all required fields (like model info) at synthesis time
    const mergedConfig = mergeConfigWithDefaults(userConfig, "pattern-2");

    const def = new ConfigurationDefinition({
      configurationObject: mergedConfig,
      transforms: [
        {
          flatPath: "assessment.model",
          transform: (modelName?: string) => {
            if (options?.assessmentFunction) {
              _assessmentInferenceProvider = Invokable.fromFunction(options.assessmentFunction);
              return "LambdaHook";
            } else if (options?.assessmentModel) {
              _assessmentInferenceProvider = Invokable.fromModel(options.assessmentModel);
              return Arn.split(
                options.assessmentModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _assessmentInferenceProvider = Invokable.fromModel(modelNameToInvokable(modelName));
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "summarization.model",
          transform: (modelName?: string) => {
            if (options?.summarizationFunction) {
              _summarizationInferenceProvider = Invokable.fromFunction(options.summarizationFunction);
              return "LambdaHook";
            } else if (options?.summarizationModel) {
              _summarizationInferenceProvider = Invokable.fromModel(options?.summarizationModel);
              return Arn.split(
                options?.summarizationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _summarizationInferenceProvider = Invokable.fromModel(modelNameToInvokable(modelName));
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "classification.model",
          transform: (modelName?: string) => {
            if (options?.classificationFunction) {
              _classificationInferenceProvider = Invokable.fromFunction(options.classificationFunction);
              return "LambdaHook";
            } else if (options?.classificationModel) {
              _classificationInferenceProvider = Invokable.fromModel(options.classificationModel);
              return Arn.split(
                options?.classificationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _classificationInferenceProvider = Invokable.fromModel(modelNameToInvokable(modelName));
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "classification.classificationMethod",
          transform: (classificationMethod: any) => {
            if (options?.classificationMethod) {
              _classificationMethod = options.classificationMethod;
              return options?.classificationMethod;
            } else {
              _classificationMethod =
                classificationMethod as ClassificationMethod;
              return classificationMethod;
            }
          },
        },
        {
          flatPath: "extraction.model",
          transform: (modelName?: string) => {
            if (options?.extractionFunction) {
              _extractionInferenceProvider = Invokable.fromFunction(options.extractionFunction);
              return "LambdaHook";
            } else if (options?.extractionModel) {
              _extractionInferenceProvider = Invokable.fromModel(options.extractionModel);
              return Arn.split(
                options.extractionModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _extractionInferenceProvider = Invokable.fromModel(modelNameToInvokable(modelName));
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "evaluation.llm_method.model",
          transform: (modelName?: string) => {
            if (options?.evaluationModel) {
              _evaluationInvokable = options.evaluationModel;
              return Arn.split(
                options.evaluationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _evaluationInvokable = modelNameToInvokable(modelName);
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "ocr.backend",
          transform: (backend?: string) => {
            _ocrBackend = (backend as "textract" | "bedrock") || "textract";
            return _ocrBackend;
          },
        },
        {
          flatPath: "ocr.model_id",
          transform: (modelName?: string) => {
            if (options?.ocrFunction) {
              _ocrInferenceProvider = Invokable.fromFunction(options.ocrFunction);
              return "LambdaHook";
            } else if (options?.ocrModel) {
              _ocrInferenceProvider = Invokable.fromModel(options.ocrModel);
              return Arn.split(
                options.ocrModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              // Only create Bedrock model if backend is set to "bedrock"
              if (_ocrBackend === "bedrock" && modelName) {
                _ocrInferenceProvider = Invokable.fromModel(modelNameToInvokable(modelName));
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "ocr.model_lambda_hook_arn",
          transform: (configValue?: string) => {
            if (options?.ocrFunction) {
              return options.ocrFunction.functionArn;
            }
            return configValue;
          },
        },
        {
          flatPath: "classification.model_lambda_hook_arn",
          transform: (configValue?: string) => {
            if (options?.classificationFunction) {
              return options.classificationFunction.functionArn;
            }
            return configValue;
          },
        },
        {
          flatPath: "extraction.model_lambda_hook_arn",
          transform: (configValue?: string) => {
            if (options?.extractionFunction) {
              return options.extractionFunction.functionArn;
            }
            return configValue;
          },
        },
        {
          flatPath: "assessment.model_lambda_hook_arn",
          transform: (configValue?: string) => {
            if (options?.assessmentFunction) {
              return options.assessmentFunction.functionArn;
            }
            return configValue;
          },
        },
        {
          flatPath: "summarization.model_lambda_hook_arn",
          transform: (configValue?: string) => {
            if (options?.summarizationFunction) {
              return options.summarizationFunction.functionArn;
            }
            return configValue;
          },
        },
        {
          flatPath: "extraction.custom_prompt_lambda_arn",
          transform: (configValue?: string) => {
            // If user provided a Lambda function via options, use it and store its ARN
            if (options?.customPromptGeneratorFunction) {
              _customPromptGenerator = options.customPromptGeneratorFunction;
              _customPromptLambdaArn =
                options.customPromptGeneratorFunction.functionArn;
              return _customPromptLambdaArn;
            }
            // Otherwise, store the ARN from config file (will be imported by processor)
            _customPromptLambdaArn = configValue;
            return configValue;
          },
        },
      ],
    });

    class LoadedDefinition implements IBedrockLlmProcessorConfigurationDefinition {
      public readonly classificationMethod = _classificationMethod;
      public readonly classificationInferenceProvider = _classificationInferenceProvider;
      public readonly extractionInferenceProvider = _extractionInferenceProvider;
      public readonly summarizationInferenceProvider = _summarizationInferenceProvider;
      public readonly evaluationModel = _evaluationInvokable;
      public readonly assessmentInferenceProvider = _assessmentInferenceProvider;
      public readonly ocrInferenceProvider = _ocrInferenceProvider;
      public readonly ocrBackend = _ocrBackend;
      public readonly customPromptGenerator = _customPromptGenerator;

      raw(): { [key: string]: any } {
        return def.raw();
      }

      validate() {
        return def.validate();
      }

      isLegacyFormat(): boolean {
        return def.isLegacyFormat();
      }

      isJsonSchemaFormat(): boolean {
        return def.isJsonSchemaFormat();
      }
    }
    return new LoadedDefinition();
  }
}
