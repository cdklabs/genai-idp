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

/**
 * Options for configuring the SageMaker UDOP processor configuration definition.
 * Allows customization of extraction, evaluation, and summarization stages.
 */
export interface SagemakerUdopProcessorConfigurationDefinitionOptions {
  /**
   * Optional configuration for the extraction stage.
   * Defines the model and parameters used for information extraction.
   */
  readonly extractionModel?: IInvokable;

  /**
   * Optional configuration for the evaluation stage.
   * Defines the model and parameters used for evaluating extraction accuracy.
   */
  readonly evaluationModel?: IInvokable;

  /**
   * Optional configuration for the summarization stage.
   * Defines the model and parameters used for generating document summaries.
   */
  readonly summarizationModel?: IInvokable;

  /**
   * Optional invokable model used for evaluating assessment results.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Used to assess the quality and accuracy of extracted information by
   * comparing assessment results against expected values.
   *
   * @default - as defined in the definition file
   */
  readonly assessmentModel?: IInvokable;
}

/**
 * Interface for SageMaker UDOP processor configuration definition.
 * Defines the structure and capabilities of configuration for SageMaker UDOP processing.
 */
export interface ISagemakerUdopProcessorConfigurationDefinition
  extends IConfigurationDefinition {
  /**
   * The invokable model used for information extraction.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Extracts structured data from documents based on defined schemas,
   * transforming unstructured content into structured information.
   */
  readonly extractionModel: IInvokable;

  /**
   * Optional invokable model used for evaluating extraction results.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * Used to assess the quality and accuracy of extracted information by
   * comparing extraction results against expected values.
   */
  readonly evaluationModel?: IInvokable;

  /**
   * Optional invokable model used for document summarization.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   * When provided, enables automatic generation of document summaries
   * that capture key information from processed documents.
   */
  readonly summarizationModel?: IInvokable;

  /**
   * Optional invokable model used for document assessment.
   * Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
   */
  readonly assessmentModel?: IInvokable;
}

/**
 * Configuration definition for SageMaker UDOP document processing.
 * Provides methods to create and customize configuration for SageMaker UDOP processing.
 */
export class SagemakerUdopProcessorConfigurationDefinition {
  /**
   * Creates a default configuration definition for SageMaker UDOP processing.
   * This configuration includes basic settings for extraction, evaluation, and summarization
   * when using SageMaker for document classification.
   *
   * @param options Optional customization for processing stages
   * @returns A configuration definition with default settings
   */
  static rvlCdipPackageSample(
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ) {
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
   * Creates a configuration definition from a YAML file.
   * Allows users to provide custom configuration files for document processing.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional customization for processing stages
   * @returns A configuration definition loaded from the file
   */
  static fromFile(
    filePath: string,
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): ISagemakerUdopProcessorConfigurationDefinition {
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
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): ISagemakerUdopProcessorConfigurationDefinition {
    let _extractionInvokable: IInvokable;
    let _evaluationInvokable: IInvokable;
    let _assessmentInvokable: IInvokable | undefined;
    let _summarizationInvokable: IInvokable;

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
      ],
    });

    class LoadedDefinition
      implements ISagemakerUdopProcessorConfigurationDefinition
    {
      public readonly extractionModel = _extractionInvokable;
      public readonly summarizationModel = _summarizationInvokable;
      public readonly evaluationModel = _evaluationInvokable;
      public readonly assessmentModel = _assessmentInvokable;
      raw(): { [key: string]: any } {
        return def.raw();
      }
    }
    return new LoadedDefinition();
  }
}
