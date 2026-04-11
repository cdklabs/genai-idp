/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IProcessingEnvironment } from "@cdklabs/genai-idp";
import { CustomResource } from "aws-cdk-lib";
import { Construct } from "constructs";
import {
  SagemakerUdopProcessorConfigurationDefinition,
  SagemakerUdopProcessorConfigurationDefinitionOptions,
  ISagemakerUdopProcessorConfigurationDefinition,
} from "./definition";

/**
 * Interface for SageMaker UDOP processor configuration.
 */
export interface ISagemakerUdopProcessorConfiguration {
  /** The configuration definition. */
  readonly definition: ISagemakerUdopProcessorConfigurationDefinition;

  /**
   * Binds the configuration to a processor scope.
   * Writes the default configuration to the configuration table.
   */
  bind(
    scope: Construct,
    environment: IProcessingEnvironment,
  ): ISagemakerUdopProcessorConfigurationDefinition;
}

/**
 * Configuration management for SageMaker UDOP document processing.
 */
export class SagemakerUdopProcessorConfiguration implements ISagemakerUdopProcessorConfiguration {
  static rvlCdipPackageSample(
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): SagemakerUdopProcessorConfiguration {
    return new SagemakerUdopProcessorConfiguration(
      SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample(
        options,
      ),
    );
  }

  static fromFile(
    filePath: string,
    options?: SagemakerUdopProcessorConfigurationDefinitionOptions,
  ): SagemakerUdopProcessorConfiguration {
    return new SagemakerUdopProcessorConfiguration(
      SagemakerUdopProcessorConfigurationDefinition.fromFile(filePath, options),
    );
  }

  protected constructor(
    public readonly definition: ISagemakerUdopProcessorConfigurationDefinition,
  ) {}

  public bind(
    scope: Construct,
    environment: IProcessingEnvironment,
  ): ISagemakerUdopProcessorConfigurationDefinition {
    new CustomResource(scope, "UpdateDefaultConfig", {
      serviceToken: environment.configurationFunction.functionArn,
      properties: {
        Default: this.definition.raw(),
        ConfigurationTable: environment.configurationTable.tableName,
      },
    });

    return this.definition;
  }
}
