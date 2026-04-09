/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Translates IDP class schemas (JSON Schema draft 2020-12 with x-aws-idp-* extensions)
 * to BDA blueprint schemas (JSON Schema draft-07 with inferenceType/instruction fields).
 *
 * This mirrors the Python `_transform_json_schema_to_bedrock_blueprint` logic from
 * `idp_common.bda.bda_blueprint_service`, executed at CDK synth time in TypeScript.
 *
 * @since 0.5.2
 */

/** IDP extension field prefixes to strip from the blueprint schema. */
const IDP_EXTENSION_FIELDS = ["x-aws-idp-", "$schema", "format", "required"];

/**
 * Translates a single IDP class schema to a BDA blueprint schema.
 *
 * @param idpClass The IDP class definition from the configuration YAML
 * @returns A BDA-compatible blueprint schema object
 */
export function translateClassToBlueprint(
  idpClass: Record<string, any>,
): Record<string, any> {
  // Deep copy to avoid mutating input
  const schema = JSON.parse(JSON.stringify(idpClass));

  // Extract class name before stripping extensions
  const className =
    schema.$id || schema["x-aws-idp-document-type"] || "Document";
  const description =
    schema.description || "Document schema for data extraction";

  // Strip IDP extension fields
  stripExtensionFields(schema);

  // Build base blueprint structure
  const blueprint: Record<string, any> = {
    $schema: "http://json-schema.org/draft-07/schema#",
    class: className,
    description: description,
    type: "object",
  };

  const defs = schema.$defs || {};
  const properties = schema.properties || {};

  if (Object.keys(defs).length > 0) {
    // Schema with $defs — process definitions and properties
    blueprint.definitions = {};
    for (const [defName, defValue] of Object.entries(defs)) {
      blueprint.definitions[sanitizeName(defName)] = processDefinition(
        defValue as Record<string, any>,
      );
    }

    blueprint.properties = {};
    for (const [propName, propValue] of Object.entries(properties)) {
      const prop = propValue as Record<string, any>;
      if (prop.$ref) {
        blueprint.properties[propName] = {
          $ref: normalizeRefPath(prop.$ref),
        };
      } else {
        blueprint.properties[propName] = addBdaFields(prop);
      }
    }
  } else {
    // Flat schema — all properties at top level
    blueprint.properties = {};
    for (const [propName, propValue] of Object.entries(properties)) {
      blueprint.properties[propName] = addBdaFields(
        propValue as Record<string, any>,
      );
    }
  }

  return blueprint;
}

/**
 * Processes a definition (from $defs) into BDA format.
 */
function processDefinition(def: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = { type: "object" };
  if (def.properties) {
    result.properties = {};
    for (const [propName, propValue] of Object.entries(def.properties)) {
      const prop = propValue as Record<string, any>;
      if (prop.$ref) {
        result.properties[propName] = {
          $ref: normalizeRefPath(prop.$ref),
        };
      } else {
        result.properties[propName] = addBdaFields(prop);
      }
    }
  }
  return result;
}

/**
 * Adds BDA-specific fields (inferenceType, instruction) to a property.
 * For leaf properties (string, number, boolean), adds inferenceType and instruction.
 * For arrays, preserves items and adds instruction.
 * For objects with properties, recurses.
 */
function addBdaFields(prop: Record<string, any>): Record<string, any> {
  const propType = prop.type || "string";

  if (propType === "array") {
    const result: Record<string, any> = {
      type: "array",
      instruction: prop.description || prop.instruction || "-",
    };
    if (prop.items) {
      if (prop.items.$ref) {
        result.items = { $ref: normalizeRefPath(prop.items.$ref) };
      } else if (prop.items.properties) {
        result.items = processDefinition(prop.items);
      } else {
        result.items = { type: prop.items.type || "string" };
      }
    }
    return result;
  }

  if (propType === "object" && prop.properties) {
    return processDefinition(prop);
  }

  // Leaf property
  return {
    type: propType,
    inferenceType: "explicit",
    instruction:
      prop.description ||
      prop.instruction ||
      "Extract this field from the document",
  };
}

/**
 * Converts $defs references to definitions references (draft 2020-12 → draft-07)
 * and sanitizes the definition name in the path.
 */
function normalizeRefPath(refPath: string): string {
  // Extract the definition name from the ref path
  const match = refPath.match(/^#\/\$defs\/(.+)$/);
  if (match) {
    return `#/definitions/${sanitizeName(match[1])}`;
  }
  // Already in definitions format, just sanitize the name
  const defMatch = refPath.match(/^#\/definitions\/(.+)$/);
  if (defMatch) {
    return `#/definitions/${sanitizeName(defMatch[1])}`;
  }
  return refPath;
}

/**
 * Sanitizes definition names — replaces spaces and special characters,
 * converts to UPPER_SNAKE_CASE for BDA compatibility.
 */
function sanitizeName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\s_-]/g, "")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
}

/**
 * Recursively strips IDP extension fields from a schema object.
 */
function stripExtensionFields(obj: Record<string, any>): void {
  for (const key of Object.keys(obj)) {
    if (IDP_EXTENSION_FIELDS.some((prefix) => key.startsWith(prefix))) {
      delete obj[key];
    } else if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      stripExtensionFields(obj[key]);
    } else if (Array.isArray(obj[key])) {
      for (const item of obj[key]) {
        if (typeof item === "object" && item !== null) {
          stripExtensionFields(item);
        }
      }
    }
  }
}
