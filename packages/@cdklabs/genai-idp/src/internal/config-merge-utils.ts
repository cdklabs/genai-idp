/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import * as path from "path";
import yaml from "yaml";

/**
 * Valid pattern names for IDP configurations.
 */
const VALID_PATTERNS = ["pattern-1", "pattern-2", "pattern-3"] as const;
export type Pattern = (typeof VALID_PATTERNS)[number];

/**
 * Recursively update target object with source object.
 * Nested objects are merged recursively. Other values are deep copied.
 *
 * @param target Target object to update (modified in place)
 * @param source Source object with updates
 * @returns Updated target object
 */
function deepUpdate(
  target: Record<string, any>,
  source: Record<string, any>,
): Record<string, any> {
  for (const [key, value] of Object.entries(source)) {
    if (
      key in target &&
      typeof target[key] === "object" &&
      target[key] !== null &&
      !Array.isArray(target[key]) &&
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Both are objects - recurse
      deepUpdate(target[key], value);
    } else {
      // Deep copy to avoid mutation issues
      target[key] = JSON.parse(JSON.stringify(value));
    }
  }
  return target;
}

/**
 * Load a YAML file and return its contents as an object.
 *
 * @param filePath Path to the YAML file
 * @returns Parsed YAML contents
 * @throws Error if file doesn't exist or contains invalid YAML
 */
function loadYamlFile(filePath: string): Record<string, any> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`YAML file not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const parsed = yaml.parse(content);

  return parsed ?? {};
}

/**
 * Recursively resolve _inherits directive in a config.
 * Supports both string (single file) and array (multiple files) inheritance.
 *
 * @param config Configuration with potential _inherits directive
 * @param defaultsDir Directory containing the defaults files
 * @param resolvedFiles Set of already resolved files (to prevent cycles)
 * @returns Merged configuration with all inheritance resolved
 */
function resolveInheritance(
  config: Record<string, any>,
  defaultsDir: string,
  resolvedFiles: Set<string> = new Set(),
): Record<string, any> {
  // Get _inherits directive (can be string or array)
  const inherits = config._inherits;
  delete config._inherits;

  if (!inherits) {
    return config;
  }

  // Normalize to array
  const inheritsList = Array.isArray(inherits) ? inherits : [inherits];

  // Start with empty config
  let result: Record<string, any> = {};

  // Process each inherited file in order
  for (const inheritFile of inheritsList) {
    if (resolvedFiles.has(inheritFile)) {
      console.warn(`Circular inheritance detected: ${inheritFile}`);
      continue;
    }

    const newResolvedFiles = new Set(resolvedFiles);
    newResolvedFiles.add(inheritFile);

    const inheritPath = path.join(defaultsDir, inheritFile);

    if (!fs.existsSync(inheritPath)) {
      throw new Error(`Inherited file not found: ${inheritPath}`);
    }

    // Load inherited config and recursively resolve its inheritance
    let inheritedConfig = loadYamlFile(inheritPath);
    inheritedConfig = resolveInheritance(
      inheritedConfig,
      defaultsDir,
      newResolvedFiles,
    );

    // Merge inherited config into result
    result = deepUpdate(result, inheritedConfig);
  }

  // Finally, merge the current config on top (it has highest priority)
  result = deepUpdate(result, config);

  return result;
}

/**
 * Load system defaults for a specific pattern.
 *
 * This function loads the pattern file and recursively resolves all
 * inheritance directives. Patterns can inherit from:
 * - A single base file: _inherits: base.yaml
 * - Multiple modules: _inherits: [base-notes.yaml, base-classes.yaml, ...]
 *
 * @param pattern Pattern name (pattern-1, pattern-2, pattern-3)
 * @returns Merged system defaults configuration
 * @throws Error if pattern is invalid or defaults files don't exist
 */
export function loadSystemDefaults(pattern: Pattern): Record<string, any> {
  if (!VALID_PATTERNS.includes(pattern)) {
    throw new Error(
      `Invalid pattern '${pattern}'. Valid patterns: ${VALID_PATTERNS.join(", ")}`,
    );
  }

  // Get the system_defaults directory (bundled in assets)
  const defaultsDir = path.join(__dirname, "../../assets/system_defaults");

  if (!fs.existsSync(defaultsDir)) {
    throw new Error(
      `System defaults directory not found: ${defaultsDir}. ` +
        "Ensure bundle task has been run.",
    );
  }

  // Load pattern-specific defaults
  const patternPath = path.join(defaultsDir, `${pattern}.yaml`);
  let patternConfig = loadYamlFile(patternPath);

  // Recursively resolve all inheritance
  const result = resolveInheritance(patternConfig, defaultsDir);

  return result;
}

/**
 * Recursively remove null values from an object.
 * This is necessary because CloudFormation doesn't allow null values in custom resource properties.
 *
 * @param obj Object to clean
 * @returns Object with null values removed
 */
function removeNullValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeNullValues).filter((item) => item !== undefined);
  }

  if (typeof obj === "object") {
    const result: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeNullValues(value);
      if (cleanedValue !== undefined) {
        result[key] = cleanedValue;
      }
    }
    return result;
  }

  return obj;
}

/**
 * Merge a user's config with system defaults.
 *
 * User values take precedence over defaults. Missing fields in user config
 * are populated from system defaults. Null values are removed from the final
 * configuration as CloudFormation doesn't allow them in custom resource properties.
 *
 * @param userConfig User's configuration object (may be partial)
 * @param pattern Pattern to use for defaults (pattern-1, pattern-2, pattern-3)
 * @returns Complete configuration with defaults applied and null values removed
 *
 * @example
 * ```typescript
 * const userConfig = {
 *   classification: { model: "us.amazon.nova-lite-v1:0" },
 *   classes: [...]
 * };
 * const result = mergeConfigWithDefaults(userConfig, "pattern-2");
 * // Result has all fields populated from defaults, with user's model override
 * ```
 */
export function mergeConfigWithDefaults(
  userConfig: Record<string, any>,
  pattern: Pattern,
): Record<string, any> {
  // Load system defaults
  const defaults = loadSystemDefaults(pattern);

  // Deep merge user config on top of defaults
  const result = JSON.parse(JSON.stringify(defaults)); // Deep copy
  deepUpdate(result, userConfig);

  // Remove null values (CloudFormation doesn't allow them)
  return removeNullValues(result);
}
