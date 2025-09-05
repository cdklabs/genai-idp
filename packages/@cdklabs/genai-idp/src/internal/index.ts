/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import fs from "fs";
import {
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
  IInvokable,
} from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { FoundationModelIdentifier } from "aws-cdk-lib/aws-bedrock";
import yaml from "yaml";

/**
 * Converts a model name string to an appropriate IInvokable implementation.
 * Handles region-specific model identifiers with prefixes (us., eu., apac.)
 * and creates the appropriate cross-region inference profile when needed.
 *
 * @param modelName The model identifier string, optionally with region prefix
 * @returns An IInvokable implementation for the specified model
 */
export function modelNameToInvokable(modelName: string): IInvokable {
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
