/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * JSON Schema validation utilities for configuration.
 *
 * Provides validation and migration support for document class configurations
 * in both legacy and JSON Schema formats.
 */

/**
 * JSON Schema standard fields
 */
export const SCHEMA_FIELD = "$schema";
export const ID_FIELD = "$id";
export const DEFS_FIELD = "$defs";
export const REF_FIELD = "$ref";
export const SCHEMA_TYPE = "type";
export const SCHEMA_PROPERTIES = "properties";
export const SCHEMA_ITEMS = "items";
export const SCHEMA_REQUIRED = "required";
export const SCHEMA_DESCRIPTION = "description";

/**
 * JSON Schema types
 */
export const TYPE_OBJECT = "object";
export const TYPE_ARRAY = "array";
export const TYPE_STRING = "string";
export const TYPE_NUMBER = "number";
export const TYPE_BOOLEAN = "boolean";

/**
 * AWS IDP extension fields (x-aws-idp-* prefix)
 */
export const X_AWS_IDP_DOCUMENT_TYPE = "x-aws-idp-document-type";
export const X_AWS_IDP_EXAMPLES = "x-aws-idp-examples";
export const X_AWS_IDP_LIST_ITEM_DESCRIPTION =
  "x-aws-idp-list-item-description";
export const X_AWS_IDP_ORIGINAL_NAME = "x-aws-idp-original-name";
export const X_AWS_IDP_EVALUATION_METHOD = "x-aws-idp-evaluation-method";
export const X_AWS_IDP_CONFIDENCE_THRESHOLD = "x-aws-idp-confidence-threshold";
export const X_AWS_IDP_PROMPT_OVERRIDE = "x-aws-idp-prompt-override";
export const X_AWS_IDP_CLASS_PROMPT = "x-aws-idp-class-prompt";
export const X_AWS_IDP_ATTRIBUTES_PROMPT = "x-aws-idp-attributes-prompt";
export const X_AWS_IDP_IMAGE_PATH = "x-aws-idp-image-path";
export const X_AWS_IDP_DOCUMENT_NAME_REGEX = "x-aws-idp-document-name-regex";
export const X_AWS_IDP_PAGE_CONTENT_REGEX = "x-aws-idp-page-content-regex";

/**
 * Legacy format field names
 */
export const LEGACY_ATTRIBUTES = "attributes";
export const LEGACY_NAME = "name";
export const LEGACY_DESCRIPTION = "description";
export const LEGACY_ATTRIBUTE_TYPE = "attribute_type";
export const LEGACY_GROUP_ATTRIBUTES = "group_attributes";
export const LEGACY_LIST_ITEM_TEMPLATE = "list_item_template";
export const LEGACY_ITEM_ATTRIBUTES = "item_attributes";
export const LEGACY_ITEM_DESCRIPTION = "item_description";
export const LEGACY_EVALUATION_METHOD = "evaluation_method";
export const LEGACY_CONFIDENCE_THRESHOLD = "confidence_threshold";
export const LEGACY_PROMPT_OVERRIDE = "prompt_override";
export const LEGACY_EXAMPLES = "examples";
export const LEGACY_CLASS_PROMPT = "class_prompt";
export const LEGACY_ATTRIBUTES_PROMPT = "attributes_prompt";
export const LEGACY_IMAGE_PATH = "image_path";
export const LEGACY_DOCUMENT_NAME_REGEX = "document_name_regex";
export const LEGACY_DOCUMENT_PAGE_CONTENT_REGEX = "document_page_content_regex";

/**
 * Legacy attribute types
 */
export const ATTRIBUTE_TYPE_SIMPLE = "simple";
export const ATTRIBUTE_TYPE_GROUP = "group";
export const ATTRIBUTE_TYPE_LIST = "list";

/**
 * Result of JSON Schema validation
 */
export interface ValidationResult {
  /**
   * Whether the configuration is valid
   */
  readonly valid: boolean;

  /**
   * Validation errors (if any)
   */
  readonly errors: string[];

  /**
   * Validation warnings (if any)
   */
  readonly warnings: string[];
}

/**
 * Detects if configuration data is in legacy format.
 *
 * Legacy format has:
 * - "attributes" key with list value
 * - No "$schema", "$id", or "properties" keys
 *
 * JSON Schema format has:
 * - "$schema", "$id", or "properties" keys
 * - "attributes" as dict (nested schema) or absent
 *
 * @param data Configuration data to check
 * @returns true if legacy format, false if JSON Schema or unknown
 */
export function isLegacyFormat(data: any): boolean {
  if (!data) {
    return false;
  }

  // Handle array of classes
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return false;
    }
    // Check first element
    return isLegacyFormat(data[0]);
  }

  // Handle single class/schema dict
  if (typeof data === "object") {
    // Definitive JSON Schema markers
    if (SCHEMA_FIELD in data || ID_FIELD in data || SCHEMA_PROPERTIES in data) {
      return false;
    }

    // Special marker for our schema format
    if (X_AWS_IDP_DOCUMENT_TYPE in data) {
      return false;
    }

    // Legacy marker: attributes is a list
    if (LEGACY_ATTRIBUTES in data) {
      const attributes = data[LEGACY_ATTRIBUTES];
      return Array.isArray(attributes);
    }

    // No attributes at all - assume modern format
    return false;
  }

  // Unknown type
  return false;
}

/**
 * Detects if configuration data is in JSON Schema format.
 *
 * Inverse of isLegacyFormat for clarity.
 *
 * @param data Configuration data to check
 * @returns true if JSON Schema format, false if legacy or unknown
 */
export function isJsonSchemaFormat(data: any): boolean {
  if (!data) {
    return false;
  }
  return !isLegacyFormat(data);
}

/**
 * Validates a JSON Schema configuration.
 *
 * Performs basic structural validation to ensure the schema is well-formed.
 * Does not perform full JSON Schema specification validation.
 *
 * @param schema JSON Schema to validate
 * @returns Validation result with errors and warnings
 */
export function validateJsonSchema(schema: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!schema || typeof schema !== "object") {
    errors.push("Schema must be an object");
    return { valid: false, errors, warnings };
  }

  // Check for required top-level fields
  if (!(SCHEMA_TYPE in schema)) {
    warnings.push('Schema missing "type" field');
  }

  // Check that type is object for document schemas
  if (schema[SCHEMA_TYPE] && schema[SCHEMA_TYPE] !== TYPE_OBJECT) {
    warnings.push(
      `Schema type is "${schema[SCHEMA_TYPE]}" but document schemas typically require type="object"`,
    );
  }

  // Check for properties
  if (!(SCHEMA_PROPERTIES in schema)) {
    warnings.push('Schema has no "properties" field - schema will be empty');
  }

  // Check for AWS IDP document type marker
  if (!(X_AWS_IDP_DOCUMENT_TYPE in schema)) {
    warnings.push(
      `Schema missing "${X_AWS_IDP_DOCUMENT_TYPE}" field - may not be recognized as a document type`,
    );
  }

  // Validate properties structure if present
  if (SCHEMA_PROPERTIES in schema) {
    const properties = schema[SCHEMA_PROPERTIES];
    if (typeof properties !== "object" || Array.isArray(properties)) {
      errors.push('Schema "properties" must be an object');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates configuration data and returns validation result.
 *
 * Automatically detects format (legacy or JSON Schema) and validates accordingly.
 *
 * @param data Configuration data to validate
 * @returns Validation result with errors and warnings
 */
export function validateConfiguration(data: any): ValidationResult {
  if (!data) {
    return {
      valid: false,
      errors: ["Configuration data is null or undefined"],
      warnings: [],
    };
  }

  // Handle array of configurations
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return {
        valid: false,
        errors: ["Configuration array is empty"],
        warnings: [],
      };
    }

    // Validate each item
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    data.forEach((item, index) => {
      const result = validateConfiguration(item);
      result.errors.forEach((error) => {
        allErrors.push(`[${index}] ${error}`);
      });
      result.warnings.forEach((warning) => {
        allWarnings.push(`[${index}] ${warning}`);
      });
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
    };
  }

  // Detect format and validate
  if (isLegacyFormat(data)) {
    // Legacy format - basic validation
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!(LEGACY_NAME in data)) {
      errors.push('Legacy configuration missing "name" field');
    }

    if (!(LEGACY_ATTRIBUTES in data)) {
      errors.push('Legacy configuration missing "attributes" field');
    } else if (!Array.isArray(data[LEGACY_ATTRIBUTES])) {
      errors.push('Legacy configuration "attributes" must be an array');
    }

    warnings.push(
      "Configuration is in legacy format - consider migrating to JSON Schema format",
    );

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  } else {
    // JSON Schema format
    return validateJsonSchema(data);
  }
}

/**
 * Cleans a JSON Schema by removing AWS IDP extension fields.
 *
 * Useful for generating standard JSON Schema output or for validation
 * with tools that don't support custom extensions.
 *
 * @param schema JSON Schema to clean
 * @param fieldsToRemove List of field prefixes to remove (default: ["x-aws-idp-"])
 * @returns Cleaned JSON Schema without extension fields
 */
export function cleanSchemaForGeneration(
  schema: any,
  fieldsToRemove: string[] = ["x-aws-idp-"],
): any {
  if (!schema || typeof schema !== "object") {
    return schema;
  }

  if (Array.isArray(schema)) {
    return schema.map((item) => cleanSchemaForGeneration(item, fieldsToRemove));
  }

  const cleaned: any = {};

  for (const [key, value] of Object.entries(schema)) {
    // Skip fields that match removal patterns
    if (fieldsToRemove.some((prefix) => key.startsWith(prefix))) {
      continue;
    }

    // Recursively clean nested objects
    if (typeof value === "object" && value !== null) {
      cleaned[key] = cleanSchemaForGeneration(value, fieldsToRemove);
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
}
