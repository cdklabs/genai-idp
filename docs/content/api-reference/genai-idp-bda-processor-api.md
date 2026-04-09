# @cdklabs/genai-idp-bda-processor

## Constructs <a name="Constructs" id="Constructs"></a>

### BdaProcessor <a name="BdaProcessor" id="@cdklabs/genai-idp-bda-processor.BdaProcessor"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

BDA document processor facade over UnifiedDocumentProcessor.

Creates BDA blueprints and a Data Automation Project from the configuration's
class definitions at CDK synth time, then delegates all processing to the
unified processor with `use_bda: true`.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer"></a>

```typescript
import { BdaProcessor } from '@cdklabs/genai-idp-bda-processor'

new BdaProcessor(scope: Construct, id: string, props: BdaProcessorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps">BdaProcessorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps">BdaProcessorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.isConstruct"></a>

```typescript
import { BdaProcessor } from '@cdklabs/genai-idp-bda-processor'

BdaProcessor.isConstruct(x: any)
```

Checks if `x` is a construct.

Use this method instead of `instanceof` to properly detect `Construct`
instances, even when the construct library is symlinked.

Explanation: in JavaScript, multiple copies of the `constructs` library on
disk are seen as independent, completely different libraries. As a
consequence, the class `Construct` in each copy of the `constructs` library
is seen as a different class, and an instance of one class will not test as
`instanceof` the other class. `npm install` will not create installations
like this, but users may manually symlink construct libraries together or
use a monorepo tool: in those cases, multiple copies of the `constructs`
library can be accidentally installed, and `instanceof` will behave
unpredictably. It is safest to avoid using `instanceof`, and using
this type-testing method instead.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.project">project</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject">IDataAutomationProject</a></code> | The BDA Data Automation Project created from the configuration classes. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>@cdklabs/genai-idp.EvaluationFunction</code> | The evaluation function if evaluation is enabled for this processor. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `project`<sup>Required</sup> <a name="project" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.property.project"></a>

```typescript
public readonly project: IDataAutomationProject;
```

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject">IDataAutomationProject</a>

The BDA Data Automation Project created from the configuration classes.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: EvaluationFunction;
```

- *Type:* @cdklabs/genai-idp.EvaluationFunction

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

---


## Structs <a name="Structs" id="Structs"></a>

### BdaProcessorConfigurationDefinitionOptions <a name="BdaProcessorConfigurationDefinitionOptions" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions"></a>

Options for configuring the BDA processor configuration definition.

Allows customization of evaluation and summarization models.
BDA handles OCR, classification, extraction, and assessment internally,
so those options are not exposed.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.Initializer"></a>

```typescript
import { BdaProcessorConfigurationDefinitionOptions } from '@cdklabs/genai-idp-bda-processor'

const bdaProcessorConfigurationDefinitionOptions: BdaProcessorConfigurationDefinitionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the evaluation stage. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.summarizationModel">summarizationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the summarization stage. |

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the evaluation stage.

Defines the model used for evaluating extraction accuracy.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the summarization stage.

Defines the model used for generating document summaries.

---

### BdaProcessorProps <a name="BdaProcessorProps" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps"></a>

Configuration properties for the BDA document processor facade.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.Initializer"></a>

```typescript
import { BdaProcessorProps } from '@cdklabs/genai-idp-bda-processor'

const bdaProcessorProps: BdaProcessorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.configuration">configuration</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration">IBdaProcessorConfiguration</a></code> | Configuration for the BDA document processor. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.configurationBucket">configurationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket containing configuration files. |

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Optional</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number
- *Default:* 100 concurrent workflows

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `configuration`<sup>Required</sup> <a name="configuration" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.configuration"></a>

```typescript
public readonly configuration: IBdaProcessorConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration">IBdaProcessorConfiguration</a>

Configuration for the BDA document processor.

The `use_bda: true` flag is forced automatically.

---

##### `configurationBucket`<sup>Required</sup> <a name="configurationBucket" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.configurationBucket"></a>

```typescript
public readonly configurationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket containing configuration files.

---

## Classes <a name="Classes" id="Classes"></a>

### BdaProcessorConfiguration <a name="BdaProcessorConfiguration" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration">IBdaProcessorConfiguration</a>

Configuration management for BDA document processing using Bedrock Data Automation.

This construct creates and manages the configuration for BDA document processing,
including schema definitions and configuration values. It provides a centralized
way to manage extraction schemas, evaluation settings, and summarization parameters.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.Initializer"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

new BdaProcessorConfiguration(definition: IBdaProcessorConfigurationDefinition)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.Initializer.parameter.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a></code> | The configuration definition instance. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.Initializer.parameter.definition"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a>

The configuration definition instance.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.bind"></a>

```typescript
public bind(scope: Construct, environment: IProcessingEnvironment, bdaProjectArn?: string): IBdaProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

Creates a custom resource that writes the default configuration to the configuration table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.bind.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope for creating custom resources.

---

###### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.bind.parameter.environment"></a>

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment providing the configuration function and table.

---

###### `bdaProjectArn`<sup>Optional</sup> <a name="bdaProjectArn" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.bind.parameter.bdaProjectArn"></a>

- *Type:* string

Optional BDA project ARN to store alongside the config.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.docSplit">docSplit</a></code> | Creates a configuration for document splitting. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.fromFile">fromFile</a></code> | Creates a configuration from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSample">lendingPackageSample</a></code> | Creates a configuration for lending package processing. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSampleGovCloud">lendingPackageSampleGovCloud</a></code> | Creates a minimal configuration for GovCloud deployments. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.ocrBenchmark">ocrBenchmark</a></code> | Creates a configuration for OCR benchmarking. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.realkieFccVerified">realkieFccVerified</a></code> | Creates a configuration for RealKIE FCC verified documents. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.rvlCdip">rvlCdip</a></code> | Creates a configuration for RVL-CDIP document classification. |

---

##### `docSplit` <a name="docSplit" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.docSplit"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.docSplit(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration for document splitting.

This configuration focuses on splitting multi-document files into
individual documents for processing.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.docSplit.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.fromFile"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.fromFile(filePath: string, options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration from a YAML file.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options to override file settings.

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSample"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.lendingPackageSample(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration for lending package processing.

This configuration includes full class definitions and extraction schemas.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `lendingPackageSampleGovCloud` <a name="lendingPackageSampleGovCloud" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSampleGovCloud"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.lendingPackageSampleGovCloud(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a minimal configuration for GovCloud deployments.

This configuration demonstrates the "minimal override" pattern where only
GovCloud-compatible model IDs are specified, and all other settings
(classes, prompts, etc.) are inherited from system defaults at runtime.

This approach is useful when you want to:
- Use system default class definitions
- Only override region-specific settings (like model IDs)
- Keep your config file minimal and maintainable

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSampleGovCloud.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `ocrBenchmark` <a name="ocrBenchmark" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.ocrBenchmark"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.ocrBenchmark(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration for OCR benchmarking.

This configuration is designed for evaluating OCR performance
across different document types and quality levels.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.ocrBenchmark.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `realkieFccVerified` <a name="realkieFccVerified" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.realkieFccVerified"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.realkieFccVerified(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RealKIE FCC verified documents.

This configuration is optimized for processing FCC-verified documents
from the RealKIE dataset.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.realkieFccVerified.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `rvlCdip` <a name="rvlCdip" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.rvlCdip"></a>

```typescript
import { BdaProcessorConfiguration } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfiguration.rvlCdip(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RVL-CDIP document classification.

This configuration is designed for the RVL-CDIP dataset, which contains
16 classes of document images for classification tasks.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.rvlCdip.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.property.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a></code> | The configuration definition instance. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.property.definition"></a>

```typescript
public readonly definition: IBdaProcessorConfigurationDefinition;
```

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a>

The configuration definition instance.

---


### BdaProcessorConfigurationDefinition <a name="BdaProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition"></a>

Configuration definition for BDA document processing.

Loads configuration from the unified config library and forces `use_bda: true`.
Maps BDA-specific options (summarizationModel, evaluationModel) to the unified
configuration definition options.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.Initializer"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

new BdaProcessorConfigurationDefinition()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.docSplit">docSplit</a></code> | Document splitting preset with `use_bda: true`. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile">fromFile</a></code> | Creates a configuration definition from a custom YAML file with `use_bda: true`. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSample">lendingPackageSample</a></code> | Lending package sample preset with `use_bda: true`. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSampleGovCloud">lendingPackageSampleGovCloud</a></code> | Lending package sample for GovCloud with `use_bda: true`. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.ocrBenchmark">ocrBenchmark</a></code> | OCR benchmark preset with `use_bda: true`. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.realkieFccVerified">realkieFccVerified</a></code> | RealKIE FCC verified preset with `use_bda: true`. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.rvlCdip">rvlCdip</a></code> | RVL-CDIP classification preset with `use_bda: true`. |

---

##### `docSplit` <a name="docSplit" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.docSplit"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.docSplit(options?: BdaProcessorConfigurationDefinitionOptions)
```

Document splitting preset with `use_bda: true`.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.docSplit.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.fromFile(filePath: string, options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition from a custom YAML file with `use_bda: true`.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile.parameter.filePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSample"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.lendingPackageSample(options?: BdaProcessorConfigurationDefinitionOptions)
```

Lending package sample preset with `use_bda: true`.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---

##### `lendingPackageSampleGovCloud` <a name="lendingPackageSampleGovCloud" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSampleGovCloud"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.lendingPackageSampleGovCloud(options?: BdaProcessorConfigurationDefinitionOptions)
```

Lending package sample for GovCloud with `use_bda: true`.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSampleGovCloud.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---

##### `ocrBenchmark` <a name="ocrBenchmark" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.ocrBenchmark"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.ocrBenchmark(options?: BdaProcessorConfigurationDefinitionOptions)
```

OCR benchmark preset with `use_bda: true`.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.ocrBenchmark.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---

##### `realkieFccVerified` <a name="realkieFccVerified" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.realkieFccVerified"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.realkieFccVerified(options?: BdaProcessorConfigurationDefinitionOptions)
```

RealKIE FCC verified preset with `use_bda: true`.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.realkieFccVerified.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdip` <a name="rvlCdip" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.rvlCdip"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.rvlCdip(options?: BdaProcessorConfigurationDefinitionOptions)
```

RVL-CDIP classification preset with `use_bda: true`.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.rvlCdip.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

---



## Protocols <a name="Protocols" id="Protocols"></a>

### IBdaProcessor <a name="IBdaProcessor" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor"></a>

- *Extends:* @cdklabs/genai-idp.IDocumentProcessor

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor">BdaProcessor</a>, <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

Interface for BDA document processor implementation.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>@cdklabs/genai-idp.EvaluationFunction</code> | The evaluation function if evaluation is enabled for this processor. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: EvaluationFunction;
```

- *Type:* @cdklabs/genai-idp.EvaluationFunction

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

---

### IBdaProcessorConfiguration <a name="IBdaProcessorConfiguration" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration">BdaProcessorConfiguration</a>, <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration">IBdaProcessorConfiguration</a>

Interface for BDA document processor configuration.

Provides configuration management for Bedrock Data Automation processing.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.bind"></a>

```typescript
public bind(scope: Construct, environment: IProcessingEnvironment, bdaProjectArn?: string): IBdaProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

Writes the default configuration to the configuration table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.bind.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope for creating custom resources.

---

###### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.bind.parameter.environment"></a>

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment providing the configuration function and table.

---

###### `bdaProjectArn`<sup>Optional</sup> <a name="bdaProjectArn" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.bind.parameter.bdaProjectArn"></a>

- *Type:* string

Optional BDA project ARN to store alongside the config.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.property.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.property.definition"></a>

```typescript
public readonly definition: IBdaProcessorConfigurationDefinition;
```

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a>

The configuration definition.

---

### IBdaProcessorConfigurationDefinition <a name="IBdaProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition"></a>

- *Extends:* @cdklabs/genai-idp.IConfigurationDefinition

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a>

Interface for BDA processor configuration definition.

Exposes only BDA-relevant options (summarization, evaluation).


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for evaluating extraction results. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.summarizationModel">summarizationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for document summarization. |

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for evaluating extraction results.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for document summarization.

---

### IDataAutomationProject <a name="IDataAutomationProject" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject">IDataAutomationProject</a>

Interface representing an Amazon Bedrock Data Automation Project.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject.grantInvokeAsync">grantInvokeAsync</a></code> | Grant the given identity permissions to invoke this project asynchronously. |

---

##### `grantInvokeAsync` <a name="grantInvokeAsync" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject.grantInvokeAsync"></a>

```typescript
public grantInvokeAsync(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this project asynchronously.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject.grantInvokeAsync.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject.property.arn">arn</a></code> | <code>string</code> | The ARN of the Data Automation Project. |

---

##### `arn`<sup>Required</sup> <a name="arn" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject.property.arn"></a>

```typescript
public readonly arn: string;
```

- *Type:* string

The ARN of the Data Automation Project.

---

