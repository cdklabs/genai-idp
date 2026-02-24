# Agent Development Conventions

This document outlines the coding conventions and architectural patterns for the GenAI IDP Accelerator repository. These conventions ensure consistency, maintainability, and adherence to AWS CDK best practices.

## Table of Contents

- [Code Organization](#code-organization)
- [Architectural Separation Principles](#architectural-separation-principles)
- [DynamoDB Table Patterns](#dynamodb-table-patterns)
- [Construct Design Patterns](#construct-design-patterns)
- [Lambda Function Patterns](#lambda-function-patterns)
- [Interface Design](#interface-design)
- [Naming Conventions](#naming-conventions)
- [Import/Export Patterns](#importexport-patterns)
- [Documentation Standards](#documentation-standards)

## Code Organization

### Modular Structure

All features must be organized into self-contained modules following the established pattern:

```
src/{feature-name}/
├── index.ts                           # Export all module components
├── {feature-name}.ts                  # Main construct
├── {feature-name}-table.ts           # Feature-specific table (if needed)
├── {supporting-constructs}.ts        # Additional constructs
└── functions/
    ├── index.ts                       # Export all functions
    └── {function-name}-function.ts    # Lambda functions
```

**Examples of Correct Structure:**
- `src/document-discovery/` - Document discovery module (core processing)
- `src/reporting/` - Reporting environment module (core processing)
- `src/processing-environment-api/test-studio/` - Test management module (auxiliary)
- `src/processing-environment-api/agent-companion-chat/` - AI assistant module (auxiliary)
- `src/processing-environment-api/agent-analytics/` - Analytics agent module (auxiliary)
- `src/processing-environment-api/error-analyzer/` - Error analysis module (auxiliary)
- `src/processing-environment-api/mcp-integration/` - MCP integration module (auxiliary)

**Rules:**
- ✅ Each feature gets its own module folder
- ✅ All Lambda functions go in `functions/` subfolder
- ✅ Each module has its own `index.ts` for exports
- ❌ No feature-specific files in root `src/` directory
- ❌ No Lambda functions in `src/internal/functions/` for new features

### Main Package Structure

```
src/
├── document-discovery/             # Core: Document discovery module
├── reporting/                      # Core: Reporting environment module
├── processing-environment-api/     # Auxiliary features and GraphQL API
│   ├── agent-analytics/           # Analytics agent
│   ├── agent-companion-chat/      # AI assistant
│   ├── error-analyzer/            # Error analysis
│   ├── mcp-integration/           # MCP integration
│   ├── test-studio/               # Test management
│   └── functions/                 # API resolver functions
├── functions/                      # Shared/utility functions
├── internal/                       # Internal utilities
├── hitl/                          # Human-in-the-loop components
├── custom-prompt-generator/        # Custom prompt generation
├── {core-constructs}.ts           # Core constructs (tables, environment, etc.)
└── index.ts                       # Main package exports
```

## Architectural Separation Principles

### Core Processing vs. Auxiliary Features

**All new features must be classified as either core processing or auxiliary functionality to maintain clear separation of concerns.**

#### Core Processing Features
Features that directly participate in or impact document processing workflows should be integrated with `ProcessingEnvironment`:

```typescript
// ✅ Core Processing - Belongs in ProcessingEnvironment
interface ProcessingEnvironmentProps {
  readonly documentDiscovery?: IDocumentDiscovery;        // Generates processing configurations
  readonly reportingEnvironment?: IReportingEnvironment;  // Captures processing metrics
}
```

**Criteria for Core Processing:**
- ✅ Directly modifies document processing workflow
- ✅ Generates configurations that affect processing
- ✅ Captures processing results or metrics
- ✅ Required for processing infrastructure to function

**Examples:**
- `DocumentDiscovery` - Generates configurations from document samples
- `ReportingEnvironment` - Stores evaluation metrics and processing analytics

#### Auxiliary Features
Features that provide interfaces, testing, or diagnostic capabilities should be integrated with `ProcessingEnvironmentApi`:

```typescript
// ✅ Auxiliary Features - Belongs in ProcessingEnvironmentApi
interface ProcessingEnvironmentApiProps {
  readonly testStudio?: ITestStudio;                      // Testing and validation
  readonly agentCompanionChat?: IAgentCompanionChat;      // User interface
  readonly mcpIntegration?: IMCPIntegration;              // External API access
  readonly errorAnalyzer?: IErrorAnalyzer;                // Diagnostic tools
}
```

**Criteria for Auxiliary Features:**
- ✅ Provides user interface or interaction capabilities
- ✅ Offers testing, validation, or diagnostic tools
- ✅ Enables external system integration
- ✅ Queries processing data without modifying workflows

**Examples:**
- `TestStudio` - Test management and execution (testing tool)
- `AgentCompanionChat` - Interactive AI assistant (user interface)
- `MCPIntegration` - External application access (API integration)
- `ErrorAnalyzer` - AI-powered failure diagnosis (diagnostic tool)

### Benefits of Separation

- **Clear Separation of Concerns**: Each construct has a focused responsibility
- **Reduced Coupling**: Core processing doesn't depend on UI/testing tools
- **Better Testability**: Core processing can be tested independently
- **Improved Maintainability**: Smaller, focused constructs are easier to maintain
- **Logical Grouping**: Features are grouped with their primary purpose

### Implementation Pattern

```typescript
// ✅ Correct - Separated responsibilities
const environment = new ProcessingEnvironment(this, 'Environment', {
  inputBucket,
  outputBucket,
  workingBucket,
  // Only core processing features
  documentDiscovery,
  reportingEnvironment,
});

const api = new ProcessingEnvironmentApi(this, 'Api', {
  inputBucket,
  outputBucket,
  trackingTable: environment.trackingTable,
  configurationTable: environment.configurationTable,
  // Auxiliary features here
  testStudio,
  agentCompanionChat,
  errorAnalyzer,
});

// ❌ Incorrect - Mixed responsibilities
const environment = new ProcessingEnvironment(this, 'Environment', {
  inputBucket,
  outputBucket,
  testStudio,        // Auxiliary feature in core processing
  agentCompanionChat, // User interface in processing environment
});
```

### Migration Strategy

When adding new features:

1. **Classify the feature** using the criteria above
2. **Add props to the appropriate construct** (ProcessingEnvironment vs ProcessingEnvironmentApi)
3. **Implement automatic integration** in the target construct's constructor
4. **Document the rationale** in the feature's JSDoc comments
5. **Update samples** to demonstrate the correct pattern

## DynamoDB Table Patterns

### Typed Table Interfaces

**Always use typed table interfaces instead of generic `dynamodb.ITable`:**

```typescript
// ✅ Correct - Use typed interfaces
readonly trackingTable: ITrackingTable;
readonly configurationTable: IConfigurationTable;
readonly testTable: ITestTable;
readonly sessionTable: ISessionTable;

// ❌ Incorrect - Generic interface
readonly trackingTable: dynamodb.ITable;
```

### Table Construct Pattern

All DynamoDB tables must follow this pattern:

```typescript
/**
 * Interface for the {purpose} table.
 * This table stores {description of data and purpose}.
 */
export interface I{Name}Table extends ITable {}

/**
 * A DynamoDB table for {purpose}.
 * 
 * This table uses a {key structure} to {access patterns}.
 * {Additional details about the table design}.
 */
export class {Name}Table extends Table implements I{Name}Table {
  constructor(scope: Construct, id: string, props?: {Name}TableProps) {
    super(scope, id, {
      ...props,
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },        // If composite key
      timeToLiveAttribute: "ExpiresAfter",                        // If TTL needed
    });
  }
}

export type {Name}TableProps = FixedKeyTableProps;
```

**Key Requirements:**
- Use `FixedKeyTableProps` as the base props type
- Define fixed partition key, sort key (if needed), and TTL attribute in constructor
- Provide comprehensive JSDoc documentation
- Export both interface and props type

## Construct Design Patterns

### Interface-Based Design (IoC Pattern)

All constructs must follow Inversion of Control principles:

```typescript
export interface {Feature}Props {
  /**
   * Optional {resource} for {purpose}.
   * @default - A new {resource} is created
   */
  readonly {resource}?: I{Resource};
  
  /**
   * Required {resource} for {purpose}.
   */
  readonly {requiredResource}: I{RequiredResource};
  
  /**
   * Enable {feature} functionality.
   * @default false
   */
  readonly enable{Feature}?: boolean;
  
  /**
   * Optional encryption key for {purpose}.
   */
  readonly encryptionKey?: kms.IKey;
  
  /**
   * Optional VPC configuration for Lambda functions.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}
```

**Rules:**
- ✅ Use typed interfaces for all AWS resources
- ✅ Make resources optional when sensible defaults exist
- ✅ Use boolean flags for optional features (`enable*`)
- ✅ Support encryption key injection
- ✅ Support VPC configuration where applicable
- ❌ Hardcode resource configurations
- ❌ Use generic `any` types

### Construct Implementation Pattern

```typescript
export class {Feature} extends Construct implements I{Feature} {
  public readonly {resource}: I{Resource};
  
  constructor(scope: Construct, id: string, props: {Feature}Props) {
    super(scope, id);
    
    // Validate required props
    if (!props.requiredResource) {
      throw new Error('{Feature} requires a {requiredResource}');
    }
    
    // Create or use provided resources
    this.{resource} = props.{resource} ?? new {Resource}(this, '{Resource}', {
      // Use sensible defaults
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: props.encryptionKey 
        ? dynamodb.TableEncryption.CUSTOMER_MANAGED 
        : dynamodb.TableEncryption.AWS_MANAGED,
      encryptionKey: props.encryptionKey,
    });
    
    // Grant permissions
    this.{resource}.grantReadWriteData(someFunction);
  }
}
```

## Lambda Function Patterns

### Function Props Interface

```typescript
export interface {Function}Props extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for {purpose}.
   * The function uses this table to {specific usage}.
   */
  readonly {table}: I{Table};
  
  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
  
  /**
   * Enable {feature} for {purpose}.
   * @default false
   */
  readonly enable{Feature}?: boolean;
}
```

### Function Implementation Pattern

```typescript
export class {Function} extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: {Function}Props) {
    super(scope, id, {
      ...props,
      entry: path.join(__dirname, "../../../sources/src/lambda/{function_name}"),
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      timeout: props.timeout ?? cdk.Duration.minutes(15),
      memorySize: props.memorySize ?? 1024,
      environment: {
        ...props.environment,
        {TABLE}_TABLE_NAME: props.{table}.tableName,
        ENABLE_{FEATURE}: props.enable{Feature}?.toString() ?? "false",
      },
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        encryptionMasterKey: props.encryptionKey,
        retentionPeriod: cdk.Duration.days(14),
      }),
    });
    
    // Grant permissions
    props.{table}.grantReadWriteData(this);
  }
}
```

## Interface Design

### Public Interfaces

All constructs must implement a public interface:

```typescript
export interface I{Feature} extends IConstruct {
  /**
   * Primary resource exposed by the construct.
   */
  readonly {primaryResource}: I{Resource};
  
  /**
   * Integration method for connecting with other constructs.
   * 
   * @param api The API to integrate with
   * @param additionalResource Additional resource needed for integration
   */
  integrateWith{System}(api: I{System}, additionalResource?: I{Resource}): void;
}
```

## Naming Conventions

### File and Directory Names
- **Modules**: `kebab-case` (e.g., `agent-companion-chat/`)
- **Files**: `kebab-case` (e.g., `test-runner-function.ts`)
- **Classes**: `PascalCase` (e.g., `TestStudio`, `SessionTable`)
- **Interfaces**: `IPascalCase` (e.g., `ITestStudio`, `ISessionTable`)
- **Props**: `PascalCaseProps` (e.g., `TestStudioProps`)
- **Enums**: `PascalCase` (e.g., `SectionSplittingStrategy`)

### Variable and Property Names
- **Properties**: `camelCase` (e.g., `sessionTable`, `enableCodeIntelligence`)
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_TIMEOUT`)
- **Boolean flags**: `enable*`, `is*`, `has*` (e.g., `enableRealKieDataset`)

### Resource Names
- **Tables**: `{Feature}Table` (e.g., `TestTable`, `SessionTable`)
- **Functions**: `{Purpose}Function` (e.g., `TestRunnerFunction`)
- **Queues**: `{Purpose}Queue` (e.g., `TestSetCopyQueue`)
- **Buckets**: `{purpose}Bucket` (e.g., `testBucket`, `reportingBucket`)

## Import/Export Patterns

### Module Exports

Each module's `index.ts` must export all public components:

```typescript
/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

export * from "./{feature-name}";
export * from "./{feature-name}-table";
export * from "./{supporting-constructs}";
export * from "./functions";
```

### Main Package Exports

The main `src/index.ts` must export from modules:

```typescript
// Core constructs
export * from "./processing-environment";
export * from "./tracking-table";
export * from "./configuration-table";

// Feature modules
export * from "./document-discovery";
export * from "./reporting";
export * from "./test-studio";
export * from "./agent-companion-chat";
export * from "./mcp-integration";
export * from "./error-analyzer";

// Shared utilities
export * from "./functions";
export * from "./vpc-configuration";
```

### Import Statements

```typescript
// ✅ Correct - Import from typed modules
import { ITrackingTable } from "../../tracking-table";
import { ISessionTable } from "../../session-table";

// ✅ Correct - Import from feature modules
import { TestStudio, ITestTable } from "./test-studio";

// ❌ Incorrect - Generic imports
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
```

## Documentation Standards

### JSDoc Requirements

All public classes, interfaces, and methods must have comprehensive JSDoc:

```typescript
/**
 * {Brief description of the construct/interface}.
 *
 * {Detailed description explaining purpose, usage, and key features}.
 * {Additional context about integration with other components}.
 *
 * @since v0.4.8
 */
export class {ClassName} {
  /**
   * {Description of the property and its purpose}.
   * {Additional context about when/how it's used}.
   */
  public readonly {propertyName}: I{Type};
  
  /**
   * {Description of the method and its purpose}.
   *
   * {Detailed explanation of behavior and side effects}.
   *
   * @param {paramName} {Description of parameter}
   * @param {optionalParam} {Description of optional parameter}
   * @returns {Description of return value}
   */
  public {methodName}({paramName}: {Type}, {optionalParam}?: {Type}): {ReturnType} {
    // Implementation
  }
}
```

### Code Comments

```typescript
// Validate required dependencies
if (!props.environment) {
  throw new Error('TestStudio requires a ProcessingEnvironment');
}

// Create or use provided session table
this.sessionTable = props.sessionTable ?? new SessionTable(this, "SessionTable", {
  // Use sensible defaults for new tables
  billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
  encryption: props.encryptionKey 
    ? dynamodb.TableEncryption.CUSTOMER_MANAGED 
    : dynamodb.TableEncryption.AWS_MANAGED,
});
```

## Validation and Error Handling

### Constructor Validation

```typescript
constructor(scope: Construct, id: string, props: {Feature}Props) {
  super(scope, id);
  
  // Validate required dependencies
  if (!props.requiredResource) {
    throw new Error('{Feature} requires a {requiredResource}');
  }
  
  // Validate optional dependencies
  if (props.enableFeature && !props.optionalResource) {
    throw new Error('{Feature} with {enableFeature} requires {optionalResource}');
  }
  
  // Continue with construct creation...
}
```

### Runtime Error Handling

```typescript
// Lambda functions should have DLQs and retry logic
deadLetterQueue: new sqs.Queue(this, 'FunctionDLQ', {
  encryptionMasterKey: props.encryptionKey,
  retentionPeriod: cdk.Duration.days(14),
}),
retryAttempts: 2,
```

## Backward Compatibility

### API Stability Rules

- ✅ All new props must be optional
- ✅ Existing constructs must work without changes
- ✅ Sensible defaults for new features
- ✅ No breaking changes to existing APIs
- ❌ Removing or renaming existing public properties
- ❌ Changing existing method signatures
- ❌ Modifying existing enum values

### Migration Support

```typescript
/**
 * @deprecated Use {newProperty} instead. Will be removed in v1.0.0.
 */
readonly oldProperty?: OldType;

/**
 * Replacement for deprecated {oldProperty}.
 * @since v0.4.8
 */
readonly newProperty?: NewType;
```

---

## Enforcement

These conventions are enforced through:
- Code reviews
- Automated linting (where applicable)
- Integration tests
- Documentation generation

When in doubt, follow the patterns established in existing modules like `document-discovery` and `reporting`.