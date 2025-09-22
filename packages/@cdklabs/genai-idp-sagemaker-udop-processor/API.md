# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### BasicSagemakerClassifier <a name="BasicSagemakerClassifier" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier"></a>

A basic SageMaker-based document classifier for the Pattern 3 document processor.

This construct provides a simple way to deploy a SageMaker endpoint with a document
classification model that can categorize documents based on their content and structure.
It supports models like RVL-CDIP or UDOP for specialized document classification tasks.

The basic classifier includes standard auto-scaling capabilities and sensible defaults
for common use cases. For more advanced configurations, consider creating your own
SageMaker endpoint and passing it directly to the SagemakerUdopProcessor.

*Example*

```typescript
const classifier = new BasicSagemakerClassifier(this, 'Classifier', {
  outputBucket: bucket,
  modelData: ModelData.fromAsset('./model'),
  instanceType: InstanceType.ML_G4DN_XLARGE,
});

const processor = new SagemakerUdopProcessor(this, 'Processor', {
  environment,
  classifierEndpoint: classifier.endpoint,
  // ... other configuration
});
```


#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer"></a>

```typescript
import { BasicSagemakerClassifier } from '@cdklabs/genai-idp-sagemaker-udop-processor'

new BasicSagemakerClassifier(scope: Construct, id: string, props: BasicSagemakerClassifierProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps">BasicSagemakerClassifierProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps">BasicSagemakerClassifierProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.isConstruct"></a>

```typescript
import { BasicSagemakerClassifier } from '@cdklabs/genai-idp-sagemaker-udop-processor'

BasicSagemakerClassifier.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.property.endpoint">endpoint</a></code> | <code>@aws-cdk/aws-sagemaker-alpha.IEndpoint</code> | The SageMaker endpoint that hosts the document classification model. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `endpoint`<sup>Required</sup> <a name="endpoint" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.property.endpoint"></a>

```typescript
public readonly endpoint: IEndpoint;
```

- *Type:* @aws-cdk/aws-sagemaker-alpha.IEndpoint

The SageMaker endpoint that hosts the document classification model.

This endpoint is invoked during document processing to determine
document types and categories.

---


### SagemakerUdopProcessor <a name="SagemakerUdopProcessor" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor">ISagemakerUdopProcessor</a>

SageMaker UDOP document processor implementation that uses specialized models for document processing.

This processor implements an intelligent document processing workflow that uses specialized
models like UDOP (Unified Document Processing) or RVL-CDIP deployed on SageMaker for document classification,
followed by foundation models for information extraction.

SageMaker UDOP Processor is ideal for specialized document types that require custom classification models
beyond what's possible with foundation models alone, such as complex forms, technical documents,
or domain-specific content. It provides the highest level of customization for document
classification while maintaining the flexibility of foundation models for extraction.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer"></a>

```typescript
import { SagemakerUdopProcessor } from '@cdklabs/genai-idp-sagemaker-udop-processor'

new SagemakerUdopProcessor(scope: Construct, id: string, props: SagemakerUdopProcessorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps">SagemakerUdopProcessorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps">SagemakerUdopProcessorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricClassificationRequestsTotal">metricClassificationRequestsTotal</a></code> | Creates a CloudWatch metric for total classification requests. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocumentPages">metricInputDocumentPages</a></code> | Creates a CloudWatch metric for input document pages processed. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocuments">metricInputDocuments</a></code> | Creates a CloudWatch metric for input documents processed. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `metricClassificationRequestsTotal` <a name="metricClassificationRequestsTotal" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricClassificationRequestsTotal"></a>

```typescript
public metricClassificationRequestsTotal(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total classification requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricClassificationRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricInputDocumentPages` <a name="metricInputDocumentPages" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocumentPages"></a>

```typescript
public metricInputDocumentPages(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for input document pages processed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocumentPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricInputDocuments` <a name="metricInputDocuments" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocuments"></a>

```typescript
public metricInputDocuments(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for input documents processed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocuments.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.isConstruct"></a>

```typescript
import { SagemakerUdopProcessor } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessor.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---


## Structs <a name="Structs" id="Structs"></a>

### BasicSagemakerClassifierProps <a name="BasicSagemakerClassifierProps" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps"></a>

Configuration properties for the basic SageMaker-based document classifier.

This classifier uses a SageMaker endpoint to categorize documents based on
their content and structure, enabling targeted extraction strategies.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.Initializer"></a>

```typescript
import { BasicSagemakerClassifierProps } from '@cdklabs/genai-idp-sagemaker-udop-processor'

const basicSagemakerClassifierProps: BasicSagemakerClassifierProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.instanceType">instanceType</a></code> | <code>@aws-cdk/aws-sagemaker-alpha.InstanceType</code> | The instance type to use for the SageMaker endpoint. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.modelData">modelData</a></code> | <code>@aws-cdk/aws-sagemaker-alpha.ModelData</code> | The model data for the SageMaker endpoint. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where classification outputs will be stored. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.key">key</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key for encrypting classifier resources. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.maxInstanceCount">maxInstanceCount</a></code> | <code>number</code> | The maximum number of instances for the SageMaker endpoint. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.minInstanceCount">minInstanceCount</a></code> | <code>number</code> | The minimum number of instances for the SageMaker endpoint. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.scaleInCooldown">scaleInCooldown</a></code> | <code>aws-cdk-lib.Duration</code> | The cooldown period after scaling in before another scale-in action can occur. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.scaleOutCooldown">scaleOutCooldown</a></code> | <code>aws-cdk-lib.Duration</code> | The cooldown period after scaling out before another scale-out action can occur. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.targetInvocationsPerInstancePerMinute">targetInvocationsPerInstancePerMinute</a></code> | <code>number</code> | The target number of invocations per instance per minute. |

---

##### `instanceType`<sup>Required</sup> <a name="instanceType" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.instanceType"></a>

```typescript
public readonly instanceType: InstanceType;
```

- *Type:* @aws-cdk/aws-sagemaker-alpha.InstanceType

The instance type to use for the SageMaker endpoint.

Determines the computational resources available for document classification.
For deep learning models, GPU instances are typically recommended.

---

##### `modelData`<sup>Required</sup> <a name="modelData" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.modelData"></a>

```typescript
public readonly modelData: ModelData;
```

- *Type:* @aws-cdk/aws-sagemaker-alpha.ModelData

The model data for the SageMaker endpoint.

Contains the trained model artifacts that will be deployed to the endpoint.
This can be a pre-trained document classification model like RVL-CDIP or UDOP.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where classification outputs will be stored.

Contains intermediate results from the document classification process.

---

##### `key`<sup>Optional</sup> <a name="key" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.key"></a>

```typescript
public readonly key: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key for encrypting classifier resources.

When provided, ensures data security for the SageMaker endpoint
and associated resources.

---

##### `maxInstanceCount`<sup>Optional</sup> <a name="maxInstanceCount" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.maxInstanceCount"></a>

```typescript
public readonly maxInstanceCount: number;
```

- *Type:* number
- *Default:* 4

The maximum number of instances for the SageMaker endpoint.

Controls the maximum capacity for document classification during high load.

---

##### `minInstanceCount`<sup>Optional</sup> <a name="minInstanceCount" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.minInstanceCount"></a>

```typescript
public readonly minInstanceCount: number;
```

- *Type:* number
- *Default:* 1

The minimum number of instances for the SageMaker endpoint.

Controls the baseline capacity for document classification.

---

##### `scaleInCooldown`<sup>Optional</sup> <a name="scaleInCooldown" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.scaleInCooldown"></a>

```typescript
public readonly scaleInCooldown: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* cdk.Duration.minutes(5)

The cooldown period after scaling in before another scale-in action can occur.

Prevents rapid fluctuations in endpoint capacity.

---

##### `scaleOutCooldown`<sup>Optional</sup> <a name="scaleOutCooldown" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.scaleOutCooldown"></a>

```typescript
public readonly scaleOutCooldown: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* cdk.Duration.minutes(1)

The cooldown period after scaling out before another scale-out action can occur.

Prevents rapid fluctuations in endpoint capacity.

---

##### `targetInvocationsPerInstancePerMinute`<sup>Optional</sup> <a name="targetInvocationsPerInstancePerMinute" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifierProps.property.targetInvocationsPerInstancePerMinute"></a>

```typescript
public readonly targetInvocationsPerInstancePerMinute: number;
```

- *Type:* number
- *Default:* 20

The target number of invocations per instance per minute.

Used to determine when to scale the endpoint in or out.

---

### SagemakerUdopProcessorConfigurationDefinitionOptions <a name="SagemakerUdopProcessorConfigurationDefinitionOptions" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions"></a>

Options for configuring the SageMaker UDOP processor configuration definition.

Allows customization of extraction, evaluation, and summarization stages.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.Initializer"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinitionOptions } from '@cdklabs/genai-idp-sagemaker-udop-processor'

const sagemakerUdopProcessorConfigurationDefinitionOptions: SagemakerUdopProcessorConfigurationDefinitionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.assessmentModel">assessmentModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional invokable model used for evaluating assessment results. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.evaluationModel">evaluationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional configuration for the evaluation stage. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.extractionModel">extractionModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional configuration for the extraction stage. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.summarizationModel">summarizationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional configuration for the summarization stage. |

---

##### `assessmentModel`<sup>Optional</sup> <a name="assessmentModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.assessmentModel"></a>

```typescript
public readonly assessmentModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable
- *Default:* as defined in the definition file

Optional invokable model used for evaluating assessment results.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
Used to assess the quality and accuracy of extracted information by
comparing assessment results against expected values.

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional configuration for the evaluation stage.

Defines the model and parameters used for evaluating extraction accuracy.

---

##### `extractionModel`<sup>Optional</sup> <a name="extractionModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.extractionModel"></a>

```typescript
public readonly extractionModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional configuration for the extraction stage.

Defines the model and parameters used for information extraction.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional configuration for the summarization stage.

Defines the model and parameters used for generating document summaries.

---

### SagemakerUdopProcessorProps <a name="SagemakerUdopProcessorProps" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps"></a>

Configuration properties for the SageMaker UDOP document processor.

SageMaker UDOP Processor uses specialized document processing with SageMaker endpoints
for document classification, combined with foundation models for extraction.
This processor is ideal for specialized document types that require custom
classification models for accurate document categorization before extraction.

SageMaker UDOP Processor offers the highest level of customization for document processing,
allowing you to deploy and use specialized models for document classification
while still leveraging foundation models for extraction tasks. This processor
is particularly useful for domain-specific document processing needs.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.Initializer"></a>

```typescript
import { SagemakerUdopProcessorProps } from '@cdklabs/genai-idp-sagemaker-udop-processor'

const sagemakerUdopProcessorProps: SagemakerUdopProcessorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.classifierEndpoint">classifierEndpoint</a></code> | <code>@aws-cdk/aws-sagemaker-alpha.IEndpoint</code> | The SageMaker endpoint used for document classification. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.configuration">configuration</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a></code> | Configuration for the SageMaker UDOP document processor. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.assessmentGuardrail">assessmentGuardrail</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail</code> | Optional Bedrock guardrail to apply to assessment model interactions. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.classificationGuardrail">classificationGuardrail</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail</code> | Optional Bedrock guardrail to apply to classification model interactions. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.customPromptGenerator">customPromptGenerator</a></code> | <code>@cdklabs/genai-idp.ICustomPromptGenerator</code> | Optional custom prompt generator for injecting business logic into extraction processing. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.evaluationBaselineBucket">evaluationBaselineBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional S3 bucket containing baseline documents for evaluation. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.evaluationEnabled">evaluationEnabled</a></code> | <code>boolean</code> | Controls whether extraction results are evaluated for accuracy. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.extractionGuardrail">extractionGuardrail</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail</code> | Optional Bedrock guardrail to apply to extraction model interactions. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.ocrMaxWorkers">ocrMaxWorkers</a></code> | <code>number</code> | The maximum number of concurrent workers for OCR processing. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.summarizationGuardrail">summarizationGuardrail</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail</code> | Optional Bedrock guardrail to apply to summarization model interactions. |

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Optional</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number
- *Default:* 100 concurrent workflows

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `classifierEndpoint`<sup>Required</sup> <a name="classifierEndpoint" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.classifierEndpoint"></a>

```typescript
public readonly classifierEndpoint: IEndpoint;
```

- *Type:* @aws-cdk/aws-sagemaker-alpha.IEndpoint

The SageMaker endpoint used for document classification.

Determines document types based on content and structure analysis using
specialized models like RVL-CDIP or UDOP deployed on SageMaker.

This is a key component of Pattern 3, enabling specialized document classification
beyond what's possible with foundation models alone. Users can create their own
SageMaker endpoint using any method (CDK constructs, existing endpoints, etc.)
and pass it directly to the processor.

---

##### `configuration`<sup>Required</sup> <a name="configuration" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.configuration"></a>

```typescript
public readonly configuration: ISagemakerUdopProcessorConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a>

Configuration for the SageMaker UDOP document processor.

Provides customization options for the processing workflow,
including schema definitions, prompts, and evaluation settings.

---

##### `assessmentGuardrail`<sup>Optional</sup> <a name="assessmentGuardrail" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.assessmentGuardrail"></a>

```typescript
public readonly assessmentGuardrail: IGuardrail;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to assessment model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `classificationGuardrail`<sup>Optional</sup> <a name="classificationGuardrail" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.classificationGuardrail"></a>

```typescript
public readonly classificationGuardrail: IGuardrail;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to classification model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `customPromptGenerator`<sup>Optional</sup> <a name="customPromptGenerator" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.customPromptGenerator"></a>

```typescript
public readonly customPromptGenerator: ICustomPromptGenerator;
```

- *Type:* @cdklabs/genai-idp.ICustomPromptGenerator
- *Default:* No custom prompt generator is used

Optional custom prompt generator for injecting business logic into extraction processing.

When provided, this Lambda function will be called to customize prompts based on
document content, business rules, or external system integrations.

---

##### `evaluationBaselineBucket`<sup>Optional</sup> <a name="evaluationBaselineBucket" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.evaluationBaselineBucket"></a>

```typescript
public readonly evaluationBaselineBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* No evaluation baseline bucket is configured

Optional S3 bucket containing baseline documents for evaluation.

Used as ground truth when evaluating extraction accuracy by
comparing extraction results against known correct values.

Required when evaluationEnabled is true.

---

##### `evaluationEnabled`<sup>Optional</sup> <a name="evaluationEnabled" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.evaluationEnabled"></a>

```typescript
public readonly evaluationEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Controls whether extraction results are evaluated for accuracy.

When enabled, compares extraction results against expected values
to measure extraction quality and identify improvement areas.

---

##### `extractionGuardrail`<sup>Optional</sup> <a name="extractionGuardrail" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.extractionGuardrail"></a>

```typescript
public readonly extractionGuardrail: IGuardrail;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to extraction model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `ocrMaxWorkers`<sup>Optional</sup> <a name="ocrMaxWorkers" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.ocrMaxWorkers"></a>

```typescript
public readonly ocrMaxWorkers: number;
```

- *Type:* number
- *Default:* 20

The maximum number of concurrent workers for OCR processing.

Controls parallelism during the text extraction phase to optimize
throughput while managing resource utilization.

---

##### `summarizationGuardrail`<sup>Optional</sup> <a name="summarizationGuardrail" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.summarizationGuardrail"></a>

```typescript
public readonly summarizationGuardrail: IGuardrail;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to summarization model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

## Classes <a name="Classes" id="Classes"></a>

### SagemakerUdopProcessorConfiguration <a name="SagemakerUdopProcessorConfiguration" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a>

Configuration management for SageMaker UDOP document processing using SageMaker for classification.

This construct creates and manages the configuration for SageMaker UDOP document processing,
including schema definitions, extraction prompts, and configuration values.
It provides a centralized way to manage document classes, extraction schemas, and
model parameters for specialized document processing with SageMaker.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.Initializer"></a>

```typescript
import { SagemakerUdopProcessorConfiguration } from '@cdklabs/genai-idp-sagemaker-udop-processor'

new SagemakerUdopProcessorConfiguration(definition: ISagemakerUdopProcessorConfigurationDefinition)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.Initializer.parameter.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a></code> | The configuration definition instance. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.Initializer.parameter.definition"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a>

The configuration definition instance.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind"></a>

```typescript
public bind(processor: ISagemakerUdopProcessor): ISagemakerUdopProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

This method applies the configuration to the processor.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor">ISagemakerUdopProcessor</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile">fromFile</a></code> | Creates a configuration from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.rvlCdipPackageSample">rvlCdipPackageSample</a></code> | Creates a default configuration with standard settings. |

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile"></a>

```typescript
import { SagemakerUdopProcessorConfiguration } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfiguration.fromFile(filePath: string, options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

Creates a configuration from a YAML file.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

Optional configuration options to override file settings.

---

##### `rvlCdipPackageSample` <a name="rvlCdipPackageSample" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.rvlCdipPackageSample"></a>

```typescript
import { SagemakerUdopProcessorConfiguration } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

Creates a default configuration with standard settings.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.rvlCdipPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---



### SagemakerUdopProcessorConfigurationDefinition <a name="SagemakerUdopProcessorConfigurationDefinition" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition"></a>

Configuration definition for SageMaker UDOP document processing.

Provides methods to create and customize configuration for SageMaker UDOP processing.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.Initializer"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinition } from '@cdklabs/genai-idp-sagemaker-udop-processor'

new SagemakerUdopProcessorConfigurationDefinition()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile">fromFile</a></code> | Creates a configuration definition from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample">rvlCdipPackageSample</a></code> | Creates a default configuration definition for SageMaker UDOP processing. |

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinition } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfigurationDefinition.fromFile(filePath: string, options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition from a YAML file.

Allows users to provide custom configuration files for document processing.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `rvlCdipPackageSample` <a name="rvlCdipPackageSample" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinition } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample(options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

Creates a default configuration definition for SageMaker UDOP processing.

This configuration includes basic settings for extraction, evaluation, and summarization
when using SageMaker for document classification.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---



### SagemakerUdopProcessorConfigurationSchema <a name="SagemakerUdopProcessorConfigurationSchema" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationSchema"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationSchema">ISagemakerUdopProcessorConfigurationSchema</a>

Schema definition for SageMaker UDOP processor configuration. Provides JSON Schema validation rules for the configuration UI and API.

This class defines the structure, validation rules, and UI presentation
for the SageMaker UDOP processor configuration, including document classes,
attributes, extraction parameters, evaluation criteria, and summarization options.
It's specialized for use with SageMaker endpoints for document classification.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationSchema.Initializer"></a>

```typescript
import { SagemakerUdopProcessorConfigurationSchema } from '@cdklabs/genai-idp-sagemaker-udop-processor'

new SagemakerUdopProcessorConfigurationSchema()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationSchema.bind">bind</a></code> | Binds the configuration schema to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationSchema.bind"></a>

```typescript
public bind(processor: SagemakerUdopProcessor): void
```

Binds the configuration schema to a processor instance.

Creates a custom resource that updates the schema in the configuration table.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationSchema.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor">SagemakerUdopProcessor</a>

The SageMaker UDOP document processor to apply the schema to.

---




## Protocols <a name="Protocols" id="Protocols"></a>

### ISagemakerUdopProcessor <a name="ISagemakerUdopProcessor" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor"></a>

- *Extends:* @cdklabs/genai-idp.IDocumentProcessor

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor">SagemakerUdopProcessor</a>, <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor">ISagemakerUdopProcessor</a>

Interface for SageMaker UDOP document processor implementation.

SageMaker UDOP Processor uses specialized document processing with SageMaker endpoints
for document classification, combined with foundation models for extraction.
This processor is ideal for specialized document types that require custom
classification models like RVL-CDIP or UDOP for accurate document categorization
before extraction.

Use SageMaker UDOP Processor when:
- Processing highly specialized or complex document types
- You need custom classification models beyond what foundation models can provide
- You have domain-specific document types requiring specialized handling
- You want to leverage fine-tuned models for specific document domains


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---

### ISagemakerUdopProcessorConfiguration <a name="ISagemakerUdopProcessorConfiguration" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration">SagemakerUdopProcessorConfiguration</a>, <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a>

Interface for SageMaker UDOP document processor configuration.

Provides configuration management for specialized document processing with SageMaker.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind"></a>

```typescript
public bind(processor: ISagemakerUdopProcessor): ISagemakerUdopProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

This method applies the configuration to the processor.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor">ISagemakerUdopProcessor</a>

The SageMaker UDOP document processor to apply to.

---


### ISagemakerUdopProcessorConfigurationDefinition <a name="ISagemakerUdopProcessorConfigurationDefinition" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition"></a>

- *Extends:* @cdklabs/genai-idp.IConfigurationDefinition

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a>

Interface for SageMaker UDOP processor configuration definition.

Defines the structure and capabilities of configuration for SageMaker UDOP processing.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.extractionModel">extractionModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | The invokable model used for information extraction. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.assessmentModel">assessmentModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional invokable model used for document assessment. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.evaluationModel">evaluationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional invokable model used for evaluating extraction results. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.summarizationModel">summarizationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional invokable model used for document summarization. |

---

##### `extractionModel`<sup>Required</sup> <a name="extractionModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.extractionModel"></a>

```typescript
public readonly extractionModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

The invokable model used for information extraction.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
Extracts structured data from documents based on defined schemas,
transforming unstructured content into structured information.

---

##### `assessmentModel`<sup>Optional</sup> <a name="assessmentModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.assessmentModel"></a>

```typescript
public readonly assessmentModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional invokable model used for document assessment.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional invokable model used for evaluating extraction results.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
Used to assess the quality and accuracy of extracted information by
comparing extraction results against expected values.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional invokable model used for document summarization.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
When provided, enables automatic generation of document summaries
that capture key information from processed documents.

---

### ISagemakerUdopProcessorConfigurationSchema <a name="ISagemakerUdopProcessorConfigurationSchema" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationSchema"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationSchema">SagemakerUdopProcessorConfigurationSchema</a>, <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationSchema">ISagemakerUdopProcessorConfigurationSchema</a>

Interface for SageMaker UDOP configuration schema.

Defines the structure and validation rules for SageMaker UDOP processor configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationSchema.bind">bind</a></code> | Binds the configuration schema to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationSchema.bind"></a>

```typescript
public bind(processor: SagemakerUdopProcessor): void
```

Binds the configuration schema to a processor instance.

This method applies the schema definition to the processor's configuration table.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationSchema.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor">SagemakerUdopProcessor</a>

The SageMaker UDOP document processor to apply the schema to.

---


