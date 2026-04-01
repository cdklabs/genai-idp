#!/usr/bin/env node
/**
 * Extract the unified configuration schema from the CloudFormation template.
 *
 * Parses sources/patterns/unified/template.yaml, finds the UpdateSchemaConfig
 * custom resource, extracts its Schema property, and writes it as JSON to
 * schemas/unified/schema.json.
 *
 * CloudFormation intrinsic functions (!If, !Ref, !Sub, etc.) are resolved to
 * placeholder strings or filtered out since they are deploy-time values.
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Custom YAML types for ALL CloudFormation intrinsics
const cfnTypes = [
  new yaml.Type('!If', { kind: 'sequence', construct: (data) => data && data.length >= 2 ? data[1] : null }),
  new yaml.Type('!Ref', { kind: 'scalar', construct: (data) => data === 'AWS::NoValue' ? null : `\${${data}}` }),
  new yaml.Type('!Sub', { kind: 'scalar', construct: (data) => data }),
  new yaml.Type('!GetAtt', { kind: 'scalar', construct: (data) => `\${${data}}` }),
  new yaml.Type('!Equals', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Not', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!And', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Or', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Select', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Join', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Split', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!FindInMap', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Condition', { kind: 'scalar', construct: (data) => data }),
  new yaml.Type('!ImportValue', { kind: 'scalar', construct: (data) => data }),
  new yaml.Type('!Base64', { kind: 'scalar', construct: (data) => data }),
  new yaml.Type('!Cidr', { kind: 'sequence', construct: (data) => data }),
  new yaml.Type('!Transform', { kind: 'mapping', construct: (data) => data }),
  new yaml.Type('!GetAZs', { kind: 'scalar', construct: (data) => data }),
];

const cfnSchema = yaml.DEFAULT_SCHEMA.extend(cfnTypes);

/**
 * Recursively clean the schema object:
 * - Remove null/undefined values (from AWS::NoValue)
 * - Filter nulls from arrays (enum lists with conditional entries)
 * - Remove CloudFormation placeholder strings (${ParameterName})
 */
function cleanSchema(obj) {
  if (obj === null || obj === undefined) return undefined;
  if (typeof obj === 'string' && obj.match(/^\$\{.+\}$/)) return undefined;
  if (Array.isArray(obj)) {
    return obj
      .map(cleanSchema)
      .filter((item) => item !== null && item !== undefined);
  }
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = cleanSchema(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }
  return obj;
}

const templatePath = path.join(__dirname, '..', 'sources', 'patterns', 'unified', 'template.yaml');
const outputPath = path.join(__dirname, '..', 'schemas', 'unified', 'schema.json');

console.log(`Reading template from: ${templatePath}`);

const templateContent = fs.readFileSync(templatePath, 'utf8');
const template = yaml.load(templateContent, { schema: cfnSchema });

const schema = template?.Resources?.UpdateSchemaConfig?.Properties?.Schema;
if (!schema) {
  console.error('ERROR: Could not find Resources.UpdateSchemaConfig.Properties.Schema');
  process.exit(1);
}

const cleanedSchema = cleanSchema(schema);

// Ensure output directory exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// Write formatted JSON
const jsonOutput = JSON.stringify(cleanedSchema, null, 2) + '\n';
fs.writeFileSync(outputPath, jsonOutput);

console.log(`Schema extracted to: ${outputPath}`);

// Validate by re-reading
const validated = JSON.parse(fs.readFileSync(outputPath, 'utf8'));
const topLevelProps = Object.keys(validated.properties || {});
console.log(`Validation passed: valid JSON with ${topLevelProps.length} top-level properties`);
topLevelProps.forEach((prop) => console.log(`  - ${prop}`));
