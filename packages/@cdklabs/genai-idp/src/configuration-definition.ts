/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Transforms a value in a nested object based on a flat path.
 * Used internally to apply transformations to specific configuration properties.
 *
 * @param obj The object to transform
 * @param flatPath Array of keys representing the path to the target property
 * @param transform Function to transform the target value
 * @private
 */
function transformValue(
  obj: any,
  flatPath: string[],
  transform: (value: any) => any,
) {
  if (!obj || typeof obj !== "object" || flatPath.length === 0) {
    return;
  }

  const [currentKey, ...remainingPath] = flatPath;

  if (remainingPath.length === 0) {
    // We've reached the target path, set the value
    obj[currentKey] = transform(obj[currentKey]);
  } else if (currentKey in obj && typeof obj[currentKey] === "object") {
    // Continue traversing the path
    transformValue(obj[currentKey], remainingPath, transform);
  }
}

/**
 * Interface for configuration definitions.
 * Provides methods to access configuration data.
 */
export interface IConfigurationDefinition {
  /**
   * Gets the raw configuration object.
   *
   * @returns The configuration as a JavaScript object
   */
  raw(): { [key: string]: any };
}

/**
 * Defines a transformation to apply to a specific property in the configuration.
 * Used to modify configuration values during initialization.
 */
export interface IConfigurationDefinitionPropertyTransform {
  /**
   * Dot-notation path to the property to transform (e.g., "extraction.model").
   */
  readonly flatPath: string;

  /**
   * Function to transform the property value.
   *
   * @param value The original property value
   * @returns The transformed property value
   */
  transform(value: any): any;
}

/**
 * Properties for creating a configuration definition.
 */
export interface ConfigurationDefinitionProps {
  /**
   * The configuration object to use.
   * Contains all settings for the document processing pipeline.
   */
  readonly configurationObject: { [key: string]: any };

  /**
   * Optional transformations to apply to specific properties.
   * Used to modify configuration values during initialization.
   */
  readonly transforms?: IConfigurationDefinitionPropertyTransform[];
}

/**
 * A configuration definition for document processing.
 * Manages configuration data and provides methods to access it.
 */
export class ConfigurationDefinition implements IConfigurationDefinition {
  /**
   * The processed configuration contents.
   * @private
   */
  private readonly contents: { [key: string]: any };

  /**
   * Creates a new ConfigurationDefinition.
   *
   * @param props Properties for the configuration definition
   */
  constructor(props: ConfigurationDefinitionProps) {
    const raw = JSON.parse(JSON.stringify(props.configurationObject));
    props.transforms
      ?.filter((override) => !!override.transform)
      .forEach(({ flatPath: path, transform }) => {
        transformValue(raw, path.split("."), transform);
      });
    this.contents = raw;
  }

  /**
   * Gets the raw configuration object.
   *
   * @returns The configuration as a JavaScript object
   */
  raw() {
    return this.contents;
  }
}
