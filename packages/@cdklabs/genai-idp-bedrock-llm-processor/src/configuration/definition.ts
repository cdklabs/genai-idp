/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import {
  ConfigurationDefinition,
  ConfigurationDefinitionLoader,
  IConfigurationDefinition,
  modelNameToInvokable,
} from "@cdklabs/genai-idp";
import { IInvokable } from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { Arn, ArnFormat } from "aws-cdk-lib";
import { ClassificationMethod } from "../classification-method";

/**
 * Options for configuring the Bedrock LLM processor configuration definition.
 * Allows customization of classification, extraction, evaluation, summarization, and OCR stages.
 */
export interface BedrockLlmProcessorConfigurationDefinitionOptions {
  /**
   * Optional model for the classification stage.
   */
  readonly classificationModel?: IInvokable;
  /**
   * Optional classification method to use for document categorization.
   * Determines how documents are analyzed and categorized before extraction.
   */
  readonly classificationMethod?: ClassificationMethod;

  /**
   * Optional model for the extraction stage.
   */
  readonly extractionModel?: IInvokable;

  /**
   * Optional model for the evaluation stage.
   */
  readonly evaluationModel?: IInvokable;

  /**
   * Optional model for the summarization stage.
   */
  readonly summarizationModel?: IInvokable;

  /**
   * Optional model for the assessment stage.
   */
  readonly assessmentModel?: IInvokable;

  /**
   * Optional model for the OCR stage when using Bedrock-based OCR.
   * Only used when the OCR backend is set to 'bedrock' in the configuration.
   */
  readonly ocrModel?: IInvokable;
}

export interface IBedrockLlmProcessorConfigurationDefinition
  extends IConfigurationDefinition {
  /**
   * The invokable model used for document classification.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Determines document types and categories based on content analysis,
   * enabling targeted extraction strategies for different document types.
   *
   * @default - as defined in the definition file
   */
  readonly classificationModel: IInvokable;

  /**
   * The method used for document classification.
   * Determines how documents are analyzed and categorized before extraction.
   * Different methods offer varying levels of accuracy and performance.
   *
   * @default - as defined in the definition file
   */
  readonly classificationMethod: ClassificationMethod;

  /**
   * The invokable model used for information extraction.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Extracts structured data from documents based on defined schemas,
   * transforming unstructured content into structured information.
   *
   * @default - as defined in the definition file
   */
  readonly extractionModel: IInvokable;

  /**
   * Optional invokable model used for document summarization.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * When provided, enables automatic generation of document summaries
   * that capture key information from processed documents.
   *
   * @default - as defined in the definition file
   */
  readonly summarizationModel?: IInvokable;

  /**
   * Optional invokable model used for evaluating extraction results.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Used to assess the quality and accuracy of extracted information by
   * comparing extraction results against expected values.
   *
   * @default - as defined in the definition file
   */
  readonly evaluationModel?: IInvokable;

  /**
   * Optional invokable model used for evaluating assessment results.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Used to assess the quality and accuracy of extracted information by
   * comparing assessment results against expected values.
   *
   * @default - as defined in the definition file
   */
  readonly assessmentModel?: IInvokable;

  /**
   * Optional invokable model used for OCR when using Bedrock-based OCR.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Only used when the OCR backend is set to 'bedrock' in the configuration.
   * Provides vision-based text extraction capabilities for document processing.
   *
   * @default - as defined in the definition file
   */
  readonly ocrModel?: IInvokable;

  /**
   * OCR backend to use for text extraction.
   * Determines whether to use Amazon Textract or Bedrock for OCR processing.
   *
   * @default "textract"
   */
  readonly ocrBackend: "textract" | "bedrock";
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
   * Creates a configuration definition optimized for medical records summarization.
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
    let _classificationInvokable: IInvokable;
    let _classificationMethod: ClassificationMethod;
    let _extractionInvokable: IInvokable;
    let _summarizationInvokable: IInvokable | undefined;
    let _assessmentInvokable: IInvokable | undefined;
    let _evaluationInvokable: IInvokable | undefined;
    let _ocrInvokable: IInvokable | undefined;
    let _ocrBackend: "textract" | "bedrock";

    const def = new ConfigurationDefinition({
      configurationObject: ConfigurationDefinitionLoader.fromFile(filePath),
      transforms: [
        {
          flatPath: "assessment.model",
          transform: (modelName?: string) => {
            if (options?.assessmentModel) {
              _assessmentInvokable = options.assessmentModel;
              return Arn.split(
                options.assessmentModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _assessmentInvokable = modelNameToInvokable(modelName);
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "summarization.model",
          transform: (modelName?: string) => {
            if (options?.summarizationModel) {
              _summarizationInvokable = options?.summarizationModel;
              return Arn.split(
                options?.summarizationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _summarizationInvokable = modelNameToInvokable(modelName);
              }
              return modelName;
            }
          },
        },
        {
          flatPath: "classification.model",
          transform: (modelName?: string) => {
            if (options?.classificationModel) {
              _classificationInvokable = options.classificationModel;
              return Arn.split(
                options?.classificationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _classificationInvokable = modelNameToInvokable(modelName);
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
            if (options?.extractionModel) {
              _extractionInvokable = options.extractionModel;
              return Arn.split(
                options.extractionModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              if (modelName) {
                _extractionInvokable = modelNameToInvokable(modelName);
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
            if (options?.ocrModel) {
              _ocrInvokable = options.ocrModel;
              return Arn.split(
                options.ocrModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            } else {
              // Only create Bedrock model if backend is set to "bedrock"
              if (_ocrBackend === "bedrock" && modelName) {
                _ocrInvokable = modelNameToInvokable(modelName);
              }
              return modelName;
            }
          },
        },
      ],
    });

    class LoadedDefinition
      implements IBedrockLlmProcessorConfigurationDefinition
    {
      public readonly classificationMethod = _classificationMethod;
      public readonly extractionModel = _extractionInvokable;
      public readonly summarizationModel = _summarizationInvokable;
      public readonly evaluationModel = _evaluationInvokable;
      public readonly classificationModel = _classificationInvokable;
      public readonly assessmentModel = _assessmentInvokable;
      public readonly ocrModel = _ocrInvokable;
      public readonly ocrBackend = _ocrBackend;

      raw(): { [key: string]: any } {
        return def.raw();
      }
    }
    return new LoadedDefinition();
  }
}
