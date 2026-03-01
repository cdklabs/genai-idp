/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import fs from "fs";
import {
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
  IBedrockInvokable,
} from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { FoundationModelIdentifier } from "aws-cdk-lib/aws-bedrock";
import yaml from "yaml";

// Export config merge utilities
export * from "./config-merge-utils";

/**
 * Type alias for backward compatibility.
 * IInvokable is now IBedrockInvokable from the alpha module.
 */
export type IInvokable = IBedrockInvokable;

/**
 * Converts a model name string to an appropriate IBedrockInvokable implementation.
 * Handles region-specific model identifiers with prefixes (us., eu., apac.)
 * and creates the appropriate cross-region inference profile when needed.
 *
 * @param modelName The model identifier string, optionally with region prefix
 * @returns An IBedrockInvokable implementation for the specified model
 */
export function modelNameToInvokable(modelName: string): IBedrockInvokable {
  if (modelName.startsWith("us.")) {
    return CrossRegionInferenceProfile.fromConfig({
      geoRegion: CrossRegionInferenceProfileRegion.US,
      model: BedrockFoundationModel.fromCdkFoundationModelId(
        new FoundationModelIdentifier(modelName.substring(3)),
        {
          supportsCrossRegion: true,
        },
      ),
    });
  }
  if (modelName.startsWith("eu.")) {
    return CrossRegionInferenceProfile.fromConfig({
      geoRegion: CrossRegionInferenceProfileRegion.EU,
      model: BedrockFoundationModel.fromCdkFoundationModelId(
        new FoundationModelIdentifier(modelName.substring(3)),
        {
          supportsCrossRegion: true,
        },
      ),
    });
  }
  if (modelName.startsWith("apac.")) {
    return CrossRegionInferenceProfile.fromConfig({
      geoRegion: CrossRegionInferenceProfileRegion.APAC,
      model: BedrockFoundationModel.fromCdkFoundationModelId(
        new FoundationModelIdentifier(modelName.substring(3)),
        {
          supportsCrossRegion: true,
        },
      ),
    });
  }

  return BedrockFoundationModel.fromCdkFoundationModelId(
    new FoundationModelIdentifier(modelName),
  );
}

/**
 * Utility class for loading configuration definitions from files.
 * Provides methods to parse YAML configuration files into JavaScript objects.
 */
export class ConfigurationDefinitionLoader {
  /**
   * Loads and parses a YAML configuration file.
   *
   * @param filePath Path to the YAML configuration file
   * @returns Parsed configuration object
   */
  static fromFile(filePath: string) {
    return yaml.parse(fs.readFileSync(filePath, { encoding: "utf-8" })) as {
      [key: string]: any;
    };
  }
}
