# Agent Development Conventions

Coding conventions and architectural patterns for the GenAI IDP Accelerator. All constructs are **experimental** — breaking changes are acceptable without deprecation.

## Code Organization

### Module Structure

Every feature is a self-contained module:

```
src/{feature-name}/
├── index.ts                         # Exports all public components
├── {feature-name}.ts                # Main construct
├── {feature-name}-table.ts          # Feature-specific table (if needed)
└── functions/
    ├── index.ts
    └── {function-name}-function.ts
```

- ✅ Each feature gets its own folder with its own `index.ts`
- ✅ Lambda functions go in `functions/` subfolder
- ❌ No feature files in root `src/`; no new Lambdas in `src/internal/functions/`

### Package Layout

```
src/
├── document-discovery/             # Core: config generation from samples
├── reporting/                      # Core: evaluation metrics
├── processing-environment-api/     # Auxiliary features + GraphQL API
│   ├── agent-analytics/
│   ├── agent-companion-chat/
│   ├── error-analyzer/
│   ├── mcp-integration/
│   ├── test-studio/
│   └── functions/                  # API resolver functions
├── functions/                      # Shared/utility functions
├── internal/                       # Internal utilities
├── hitl/                           # Human-in-the-loop
├── custom-prompt-generator/
└── index.ts                        # Main exports
```

## Architectural Separation

Classify every new feature as **core processing** or **auxiliary**.

**Core processing** — directly impacts document processing workflows. Integrated via `ProcessingEnvironment` constructor props:
- `DocumentDiscovery`, `ReportingEnvironment`

**Auxiliary** — provides UI, testing, diagnostics, or querying. Integrated via `enable()`:
- `KnowledgeBaseQuery`, `Evaluation`, `ChatWithDocument`, `AgentAnalytics`, `AgentCompanionChat`, `ProgressMonitor`, `UserManagement`, `DocumentDiscovery` (API+UI side)

```typescript
// Core — constructor props
const environment = new ProcessingEnvironment(this, 'Env', {
  inputBucket, outputBucket, workingBucket,
  configurationTable, trackingTable, api, reportingEnvironment,
});

// Auxiliary — construct independently, then enable
const evaluation = new Evaluation(this, 'Eval', { ... });
api.enable(evaluation);
webApp.enable(evaluation);

// ❌ Never pass features as constructor props on API or WebApp
```

### Adding New Features

1. Classify as core or auxiliary
2. Implement as standalone construct (no API/UI dependency at construction)
3. Implement `IApiFeature` if it needs GraphQL resolvers
4. Implement `IWebAppFeature` if it needs UI settings or CORS
5. Feature-specific resources (buckets, tables) are constructor props on the feature
6. Update samples to use `api.enable()` / `webApp.enable()`

## Feature Integration Pattern

Plugin architecture: features are constructed independently, then enabled in API and/or WebApp.

### Interfaces

```typescript
export interface IApiFeature {
  enableInApi(api: IProcessingEnvironmentApi): void;
}
export interface IWebAppFeature {
  enableInWebApp(webApp: IWebApplication): void;
}
```

Two interfaces (not one combined) gives compile-time type safety — `webApp.enable(apiOnlyFeature)` is a type error.

### Usage

```typescript
// Target-driven (preferred for multiple features)
api.enable(knowledgeBaseQuery);
api.enable(evaluation);
webApp.enable(knowledgeBaseQuery);

// Feature-driven (preferred for one feature across targets)
kbQuery.enableInApi(api);
kbQuery.enableInWebApp(webApp);
```

### Implementation Template

```typescript
export class MyFeature extends Construct implements IApiFeature, IWebAppFeature {
  private readonly myResource: IMyResource;

  constructor(scope: Construct, id: string, props: MyFeatureProps) {
    super(scope, id);
    this.myResource = props.myResource; // Feature owns its resources
  }

  public enableInApi(api: IProcessingEnvironmentApi): void {
    const fn = new MyFunction(api as Construct, 'Fn', { ... });
    const ds = api.addLambdaDataSource('DS', fn);
    ds.createResolver('Resolver', { typeName: 'Query', fieldName: 'myQuery' });
  }

  public enableInWebApp(webApp: IWebApplication): void {
    webApp.addSetting('MyFeatureEnabled', 'true');
    webApp.addCorsBucket(this.myResource);
  }
}
```

### Resource Ownership

- Feature-specific resources → constructor props on the feature
- Shared resources (e.g. `uploadResolverFunction`) → exposed on `IProcessingEnvironmentApi`
- Features must NOT depend on API/WebApp at construction time — only at `enable()` time

### Feature Matrix

| Feature            | `IApiFeature` | `IWebAppFeature` |
|--------------------|:---:|:---:|
| DocumentDiscovery  | ✅  | ✅  |
| KnowledgeBaseQuery | ✅  | ✅  |
| Evaluation         | ✅  | ✅  |
| ChatWithDocument   | ✅  | ❌  |
| AgentAnalytics     | ✅  | ❌  |
| ProgressMonitor    | ✅  | ❌  |
| UserManagement     | ✅  | ❌  |
| AgentCompanionChat | ✅  | ❌  |

### WebApplication SSM Integration

`WebApplication` uses `cdk.Lazy.string()` for its SSM settings parameter. Features contribute settings via `addSetting()` during `enableInWebApp()`, resolved at synth time. Features can also call `addCorsBucket()` for CloudFront CORS access.

## DynamoDB Table Patterns

Always use typed table interfaces (`ITrackingTable`, `IConfigurationTable`) instead of generic `dynamodb.ITable`.

```typescript
export interface I{Name}Table extends ITable {}

export class {Name}Table extends Table implements I{Name}Table {
  constructor(scope: Construct, id: string, props?: {Name}TableProps) {
    super(scope, id, {
      ...props,
      partitionKey: { name: "PK", type: AttributeType.STRING },
      sortKey: { name: "SK", type: AttributeType.STRING },
      timeToLiveAttribute: "ExpiresAfter",
    });
  }
}
export type {Name}TableProps = FixedKeyTableProps;
```

Use `FixedKeyTableProps` as base. Define fixed keys/TTL in constructor. Export interface + props type.

## Construct Design Patterns

All constructs follow IoC — accept typed interfaces, provide sensible defaults:

```typescript
export interface {Feature}Props {
  readonly {resource}?: I{Resource};        // Optional with default
  readonly {required}: I{Required};         // Required dependency
  readonly enable{Feature}?: boolean;       // Feature flag, default false
  readonly encryptionKey?: kms.IKey;        // Encryption support
  readonly vpcConfiguration?: VpcConfiguration; // VPC support
}

export class {Feature} extends Construct implements I{Feature} {
  public readonly {resource}: I{Resource};

  constructor(scope: Construct, id: string, props: {Feature}Props) {
    super(scope, id);
    this.{resource} = props.{resource} ?? new {Resource}(this, 'R', { /* defaults */ });
  }
}
```

Rules: typed interfaces for all resources, optional props with defaults, support encryption/VPC injection, no `any` types, no hardcoded configs.

## Lambda Function Patterns

```typescript
export interface {Fn}Props extends IdpPythonFunctionOptions {
  readonly {table}: I{Table};
  readonly encryptionKey?: kms.IKey;
}

export class {Fn} extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: {Fn}Props) {
    super(scope, id, {
      ...props,
      entry: path.join(__dirname, "../../../sources/src/lambda/{fn}"),
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      timeout: props.timeout ?? cdk.Duration.minutes(15),
      memorySize: props.memorySize ?? 1024,
      environment: { ...props.environment, TABLE_NAME: props.{table}.tableName },
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        encryptionMasterKey: props.encryptionKey,
        retentionPeriod: cdk.Duration.days(14),
      }),
    });
    props.{table}.grantReadWriteData(this);
  }
}
```

## Naming Conventions

| Category | Convention | Example |
|----------|-----------|---------|
| Modules/files | `kebab-case` | `agent-companion-chat/` |
| Classes | `PascalCase` | `TestStudio` |
| Interfaces | `IPascalCase` | `ITestStudio` |
| Props | `PascalCaseProps` | `TestStudioProps` |
| Properties | `camelCase` | `sessionTable` |
| Constants | `UPPER_SNAKE_CASE` | `DEFAULT_TIMEOUT` |
| Boolean flags | `enable*`, `is*`, `has*` | `enableCodeIntelligence` |
| Tables | `{Feature}Table` | `SessionTable` |
| Functions | `{Purpose}Function` | `TestRunnerFunction` |
| Queues | `{Purpose}Queue` | `TestSetCopyQueue` |
| Buckets | `{purpose}Bucket` | `reportingBucket` |

## Import/Export Patterns

Each module's `index.ts` exports all public components via `export * from "./{file}"`. Main `src/index.ts` re-exports all modules. Use typed module imports (`import { ITrackingTable } from "../../tracking-table"`) — avoid generic CDK imports for table types.

## Documentation Standards

All public classes, interfaces, and methods require JSDoc with brief description, detailed explanation, `@param`/`@returns` tags, and `@since` version. Use inline comments for validation logic and resource creation decisions.

## Validation

Validate required props in constructors with descriptive errors. Validate conditional dependencies (e.g., `enableX` requires `resourceY`). Lambda functions should have DLQs with 14-day retention and retry logic.

---

When in doubt, follow patterns in `document-discovery` and `reporting` modules.
