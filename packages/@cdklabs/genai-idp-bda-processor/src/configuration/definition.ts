/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { IBedrockInvokable as IInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import {
  ConfigurationDefinition,
  ConfigurationDefinitionLoader,
  IConfigurationDefinition,
  mergeConfigWithDefaults,
  modelNameToInvokable,
} from "@cdklabs/genai-idp";
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
export interface IBdaProcessorConfigurationDefinition extends IConfigurationDefinition {
  /**
   * Optional invokable model used for evaluating extraction results.
   * When provided, enables assessment of extraction quality and accuracy by
   * comparing extraction results against expected values.
   */
  readonly evaluationModel?: IInvokable;

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
   * This configuration includes full class definitions and extraction schemas.
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
   * Creates a minimal configuration definition for GovCloud deployments.
   * This configuration demonstrates the "minimal override" pattern where only
   * GovCloud-compatible model IDs are specified, and all other settings
   * (classes, prompts, etc.) are inherited from system defaults at runtime.
   *
   * This approach is useful when you want to:
   * - Use system default class definitions
   * - Only override region-specific settings (like model IDs)
   * - Keep your config file minimal and maintainable
   *
   * @param options Optional customization for evaluation and summarization settings
   * @returns A minimal configuration definition for GovCloud deployment
   */
  static lendingPackageSampleGovCloud(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
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
   * Creates a configuration definition for document splitting.
   * This configuration focuses on splitting multi-document files into
   * individual documents for processing.
   *
   * @param options Optional customization for evaluation and summarization settings
   * @returns A configuration definition for document splitting
   */
  static docSplit(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
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
   * Creates a configuration definition for OCR benchmarking.
   * This configuration is designed for evaluating OCR performance
   * across different document types and quality levels.
   *
   * @param options Optional customization for evaluation and summarization settings
   * @returns A configuration definition for OCR benchmarking
   */
  static ocrBenchmark(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
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
   * @param options Optional customization for evaluation and summarization settings
   * @returns A configuration definition for RealKIE FCC documents
   */
  static realkieFccVerified(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
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
   * Creates a configuration definition for RVL-CDIP document classification.
   * This configuration is designed for the RVL-CDIP dataset, which contains
   * 16 classes of document images for classification tasks.
   *
   * @param options Optional customization for evaluation and summarization settings
   * @returns A configuration definition for RVL-CDIP processing
   */
  static rvlCdip(
    options?: BdaProcessorConfigurationDefinitionOptions,
  ): IBdaProcessorConfigurationDefinition {
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
    let _evaluationInvokable: IInvokable | undefined;

    // Set invokables from options if provided, regardless of config file content
    if (options?.summarizationModel) {
      _summarizationInvokable = options.summarizationModel;
    }
    if (options?.evaluationModel) {
      _evaluationInvokable = options.evaluationModel;
    }

    // Load user config from file
    const userConfig = ConfigurationDefinitionLoader.fromFile(filePath);

    // Merge with system defaults for pattern-1 (BDA processor)
    // This ensures we have all required fields (like model info) at synthesis time
    const mergedConfig = mergeConfigWithDefaults(userConfig, "pattern-1");

    const def = new ConfigurationDefinition({
      configurationObject: mergedConfig,
      transforms: [
        {
          flatPath: "evaluation.llm_method.model",
          transform: (modelName?: string) => {
            if (options?.evaluationModel) {
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
