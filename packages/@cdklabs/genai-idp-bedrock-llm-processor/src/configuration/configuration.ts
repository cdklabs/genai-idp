/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IProcessingEnvironment, Invokable } from "@cdklabs/genai-idp";
import { CustomResource } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import {
  BedrockLlmProcessorConfigurationDefinition,
  BedrockLlmProcessorConfigurationDefinitionOptions,
  IBedrockLlmProcessorConfigurationDefinition,
} from "./definition";

/**
 * Interface for Bedrock LLM document processor configuration.
 */
export interface IBedrockLlmProcessorConfiguration {
  /** The configuration definition. */
  readonly definition: IBedrockLlmProcessorConfigurationDefinition;

  /**
   * Binds the configuration to a processor scope.
   * Writes the default configuration to the configuration table.
   *
   * @param scope The construct scope for creating custom resources
   * @param environment The processing environment providing the configuration function and table
   */
  bind(
    scope: Construct,
    environment: IProcessingEnvironment,
  ): IBedrockLlmProcessorConfigurationDefinition;
}

/**
 * Configuration management for Bedrock LLM document processing.
 *
 * Provides factory methods for preset configurations and custom YAML files.
 * Delegates to `UnifiedDocumentProcessorConfigurationDefinition` for loading
 * configs from the unified config library.
 */
export class BedrockLlmProcessorConfiguration implements IBedrockLlmProcessorConfiguration {
  static fromFile(
    filePath: string,
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.fromFile(filePath, options),
    );
  }

  static lendingPackageSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.lendingPackageSample(options),
    );
  }

  static lendingPackageSampleGovCloud(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud(
        options,
      ),
    );
  }

  static bankStatementSample(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.bankStatementSample(options),
    );
  }

  static docSplit(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.docSplit(options),
    );
  }

  static ocrBenchmark(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.ocrBenchmark(options),
    );
  }

  static realkieFccVerified(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.realkieFccVerified(options),
    );
  }

  static rvlCdip(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.rvlCdip(options),
    );
  }

  static rvlCdipWithFewShotExamples(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples(
        options,
      ),
    );
  }

  static ruleExtraction(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.ruleExtraction(options),
    );
  }

  static ruleValidation(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.ruleValidation(options),
    );
  }

  static healthcareMultisectionPackage(
    options?: BedrockLlmProcessorConfigurationDefinitionOptions,
  ): BedrockLlmProcessorConfiguration {
    return new BedrockLlmProcessorConfiguration(
      BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage(
        options,
      ),
    );
  }

  protected constructor(
    public readonly definition: IBedrockLlmProcessorConfigurationDefinition,
  ) {}

  public bind(
    scope: Construct,
    environment: IProcessingEnvironment,
  ): IBedrockLlmProcessorConfigurationDefinition {
    new CustomResource(scope, "UpdateDefaultConfig", {
      serviceToken: environment.configurationFunction.functionArn,
      properties: {
        Default: this.definition.raw(),
        ConfigurationTable: environment.configurationTable.tableName,
      },
    });

    const rawConfig = this.definition.raw();
    let result: IBedrockLlmProcessorConfigurationDefinition = this.definition;

    // Import custom prompt generator from ARN if specified in config but not via options
    const customPromptArn = rawConfig?.extraction?.custom_prompt_lambda_arn;
    if (customPromptArn && !this.definition.customPromptGenerator) {
      const importedFunction = lambda.Function.fromFunctionArn(
        scope,
        "CustomPromptGenerator",
        customPromptArn,
      );
      result = { ...result, customPromptGenerator: importedFunction };
    }

    // Import LambdaHook functions from ARN when specified in config but not via CDK options
    const hookImports: Array<{
      section: string;
      key: string;
      prop: keyof IBedrockLlmProcessorConfigurationDefinition;
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
            lambda.Function.fromFunctionArn(scope, id, arn),
          ),
        };
      }
    }

    return result;
  }
}
