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
 * Options for configuring the BDA processor configuration definition.
 * Allows customization of evaluation and summarization models and parameters.
 */
export interface BdaProcessorConfigurationDefinitionOptions {
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
}

/**
 * Interface for BDA processor configuration definition.
 * Defines the structure and capabilities of configuration for Bedrock Data Automation processing.
 */
export interface IBdaProcessorConfigurationDefinition
  extends IConfigurationDefinition {
  /**
   * The invokable model used for evaluating extraction results.
   * Used to assess the quality and accuracy of extracted information by
   * comparing extraction results against expected values.
   */
  readonly evaluationModel: IInvokable;

  /**
   * Optional invokable model used for document summarization.
   * When provided, enables automatic generation of document summaries
   * that capture key information from processed documents.
   */
  readonly summarizationModel?: IInvokable;
  //updateFor(processor: IBdaProcessor): void;
}

/**
 * Configuration definition for BDA document processing.
 * Provides methods to create and customize configuration for Bedrock Data Automation processing.
 */
export class BdaProcessorConfigurationDefinition {
  /**
   * Creates a default configuration definition for BDA processing.
   * This configuration includes basic settings for evaluation and summarization
   * when using Bedrock Data Automation projects.
   *
   * @param options Optional customization for evaluation and summarization settings
   * @returns A configuration definition with default settings
   */
  static lendingPackageSample(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
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
   * Creates a configuration definition from a YAML file.
   * Allows users to provide custom configuration files for document processing.
   *
   * @param filePath Path to the YAML configuration file
   * @param options Optional customization for evaluation and summarization settings
   * @returns A configuration definition loaded from the file
   */
  static fromFile(
    filePath: string,
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    return this._fromFile(filePath, options);
  }

  /**
   * Creates a configuration definition from a file.
   *
   * @param filePath Path to the configuration file
   * @param options Optional customization for evaluation and summarization settings
   * @returns A loaded configuration definition
   * @private
   */
  private static _fromFile(
    filePath: string,
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
    let _summarizationInvokable: IInvokable | undefined;
    let _evaluationInvokable: IInvokable;

    const def = new ConfigurationDefinition({
      configurationObject: ConfigurationDefinitionLoader.fromFile(filePath),
      transforms: [
        {
          flatPath: "evaluation.llm_method.model",
          transform: (modelName?: string) => {
            if (options?.evaluationModel) {
              _evaluationInvokable = options.evaluationModel;
              return Arn.split(
                options.evaluationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            }
            if (modelName) {
              _evaluationInvokable = modelNameToInvokable(modelName);
            }
            return modelName;
          },
        },
        {
          flatPath: "summarization.model",
          transform: (modelName?: string) => {
            if (options?.summarizationModel) {
              _summarizationInvokable = options.summarizationModel;
              return Arn.split(
                options.summarizationModel.invokableArn,
                ArnFormat.SLASH_RESOURCE_NAME,
              ).resourceName;
            }
            if (modelName) {
              _summarizationInvokable = modelNameToInvokable(modelName);
            }
            return modelName;
          },
        },
      ],
    });
    class LoadedDefinition implements IBdaProcessorConfigurationDefinition {
      public readonly summarizationModel = _summarizationInvokable;
      public readonly evaluationModel = _evaluationInvokable;
      raw() {
        return def.raw();
      }
    }
    return new LoadedDefinition();
  }
}
