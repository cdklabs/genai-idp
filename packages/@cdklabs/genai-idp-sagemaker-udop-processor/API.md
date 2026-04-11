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
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.with">with</a></code> | Applies one or more mixins to this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

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
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.property.model">model</a></code> | <code>@aws-cdk/aws-sagemaker-alpha.IModel</code> | The SageMaker model deployed to the endpoint. |

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

---

##### `model`<sup>Required</sup> <a name="model" id="@cdklabs/genai-idp-sagemaker-udop-processor.BasicSagemakerClassifier.property.model"></a>

```typescript
public readonly model: IModel;
```

- *Type:* @aws-cdk/aws-sagemaker-alpha.IModel

The SageMaker model deployed to the endpoint.

Exposed so that additional S3 bucket permissions can be granted
(e.g. working bucket access when used with the LambdaHook bridge).

---


### SagemakerUdopProcessor <a name="SagemakerUdopProcessor" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor">ISagemakerUdopProcessor</a>

SageMaker UDOP document processor facade over UnifiedDocumentProcessor.

Uses the unified processor's native SageMaker classification backend
to route classification requests to a SageMaker endpoint while delegating
all other processing to the pipeline path.

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
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.with">with</a></code> | Applies one or more mixins to this construct. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsFailed">metricBedrockRequestsFailed</a></code> | Failed Bedrock model invocation requests. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsSucceeded">metricBedrockRequestsSucceeded</a></code> | Successful Bedrock model invocation requests. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsTotal">metricBedrockRequestsTotal</a></code> | Total Bedrock model invocation requests. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocumentPages">metricInputDocumentPages</a></code> | Document pages submitted for extraction. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocuments">metricInputDocuments</a></code> | Documents submitted for extraction. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputTokens">metricInputTokens</a></code> | Input tokens consumed. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricOutputTokens">metricOutputTokens</a></code> | Output tokens generated. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

##### `metricBedrockRequestsFailed` <a name="metricBedrockRequestsFailed" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsFailed"></a>

```typescript
public metricBedrockRequestsFailed(props?: MetricOptions): Metric
```

Failed Bedrock model invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRequestsSucceeded` <a name="metricBedrockRequestsSucceeded" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsSucceeded"></a>

```typescript
public metricBedrockRequestsSucceeded(props?: MetricOptions): Metric
```

Successful Bedrock model invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRequestsTotal` <a name="metricBedrockRequestsTotal" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsTotal"></a>

```typescript
public metricBedrockRequestsTotal(props?: MetricOptions): Metric
```

Total Bedrock model invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricBedrockRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInputDocumentPages` <a name="metricInputDocumentPages" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocumentPages"></a>

```typescript
public metricInputDocumentPages(props?: MetricOptions): Metric
```

Document pages submitted for extraction.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocumentPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInputDocuments` <a name="metricInputDocuments" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocuments"></a>

```typescript
public metricInputDocuments(props?: MetricOptions): Metric
```

Documents submitted for extraction.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputDocuments.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInputTokens` <a name="metricInputTokens" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputTokens"></a>

```typescript
public metricInputTokens(props?: MetricOptions): Metric
```

Input tokens consumed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricInputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricOutputTokens` <a name="metricOutputTokens" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricOutputTokens"></a>

```typescript
public metricOutputTokens(props?: MetricOptions): Metric
```

Output tokens generated.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.metricOutputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

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
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>@cdklabs/genai-idp.EvaluationFunction</code> | The evaluation function if evaluation is enabled for this processor. |

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

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: EvaluationFunction;
```

- *Type:* @cdklabs/genai-idp.EvaluationFunction

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

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

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.Initializer"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinitionOptions } from '@cdklabs/genai-idp-sagemaker-udop-processor'

const sagemakerUdopProcessorConfigurationDefinitionOptions: SagemakerUdopProcessorConfigurationDefinitionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.assessmentModel">assessmentModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the assessment stage. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.customPromptGeneratorFunction">customPromptGeneratorFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Optional custom prompt generator Lambda function. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the evaluation stage. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.extractionModel">extractionModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the extraction stage. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.summarizationModel">summarizationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the summarization stage. |

---

##### `assessmentModel`<sup>Optional</sup> <a name="assessmentModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.assessmentModel"></a>

```typescript
public readonly assessmentModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the assessment stage.

---

##### `customPromptGeneratorFunction`<sup>Optional</sup> <a name="customPromptGeneratorFunction" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.customPromptGeneratorFunction"></a>

```typescript
public readonly customPromptGeneratorFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Optional custom prompt generator Lambda function.

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the evaluation stage.

---

##### `extractionModel`<sup>Optional</sup> <a name="extractionModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.extractionModel"></a>

```typescript
public readonly extractionModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the extraction stage.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the summarization stage.

---

### SagemakerUdopProcessorProps <a name="SagemakerUdopProcessorProps" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps"></a>

Configuration properties for the SageMaker UDOP document processor facade.

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
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.configurationBucket">configurationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket containing configuration files. |

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

The unified processor's classification function uses the SageMaker backend
to invoke this endpoint directly for document classification.

---

##### `configuration`<sup>Required</sup> <a name="configuration" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.configuration"></a>

```typescript
public readonly configuration: ISagemakerUdopProcessorConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a>

Configuration for the SageMaker UDOP document processor.

---

##### `configurationBucket`<sup>Required</sup> <a name="configurationBucket" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorProps.property.configurationBucket"></a>

```typescript
public readonly configurationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket containing configuration files.

---

## Classes <a name="Classes" id="Classes"></a>

### SagemakerUdopProcessorConfiguration <a name="SagemakerUdopProcessorConfiguration" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a>

Configuration management for SageMaker UDOP document processing.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.Initializer"></a>

```typescript
import { SagemakerUdopProcessorConfiguration } from '@cdklabs/genai-idp-sagemaker-udop-processor'

new SagemakerUdopProcessorConfiguration(definition: ISagemakerUdopProcessorConfigurationDefinition)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.Initializer.parameter.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.Initializer.parameter.definition"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a>

The configuration definition.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor scope. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind"></a>

```typescript
public bind(scope: Construct, environment: IProcessingEnvironment): ISagemakerUdopProcessorConfigurationDefinition
```

Binds the configuration to a processor scope.

Writes the default configuration to the configuration table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.bind.parameter.environment"></a>

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile">fromFile</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.rvlCdipPackageSample">rvlCdipPackageSample</a></code> | *No description.* |

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile"></a>

```typescript
import { SagemakerUdopProcessorConfiguration } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfiguration.fromFile(filePath: string, options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile.parameter.filePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdipPackageSample` <a name="rvlCdipPackageSample" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.rvlCdipPackageSample"></a>

```typescript
import { SagemakerUdopProcessorConfiguration } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.rvlCdipPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.property.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration.property.definition"></a>

```typescript
public readonly definition: ISagemakerUdopProcessorConfigurationDefinition;
```

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a>

The configuration definition.

---


### SagemakerUdopProcessorConfigurationDefinition <a name="SagemakerUdopProcessorConfigurationDefinition" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition"></a>

Configuration definition for SageMaker UDOP document processing.

Delegates to `UnifiedDocumentProcessorConfigurationDefinition` for loading
configs from the unified config library. Maps SageMaker-specific options
to unified options. Classification is handled by the SageMaker endpoint
via LambdaHook, not by a Bedrock model.

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
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile">fromFile</a></code> | Creates a configuration from a custom YAML file. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample">rvlCdipPackageSample</a></code> | RVL-CDIP package sample preset. |

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinition } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfigurationDefinition.fromFile(filePath: string, options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

Creates a configuration from a custom YAML file.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile.parameter.filePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdipPackageSample` <a name="rvlCdipPackageSample" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample"></a>

```typescript
import { SagemakerUdopProcessorConfigurationDefinition } from '@cdklabs/genai-idp-sagemaker-udop-processor'

SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample(options?: SagemakerUdopProcessorConfigurationDefinitionOptions)
```

RVL-CDIP package sample preset.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinition.rvlCdipPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfigurationDefinitionOptions">SagemakerUdopProcessorConfigurationDefinitionOptions</a>

---



## Protocols <a name="Protocols" id="Protocols"></a>

### ISagemakerUdopProcessor <a name="ISagemakerUdopProcessor" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor"></a>

- *Extends:* @cdklabs/genai-idp.IDocumentProcessor

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessor">SagemakerUdopProcessor</a>, <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor">ISagemakerUdopProcessor</a>

Interface for SageMaker UDOP document processor implementation.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>@cdklabs/genai-idp.EvaluationFunction</code> | The evaluation function if evaluation is enabled for this processor. |

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

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: EvaluationFunction;
```

- *Type:* @cdklabs/genai-idp.EvaluationFunction

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

---

### ISagemakerUdopProcessorConfiguration <a name="ISagemakerUdopProcessorConfiguration" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.SagemakerUdopProcessorConfiguration">SagemakerUdopProcessorConfiguration</a>, <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration">ISagemakerUdopProcessorConfiguration</a>

Interface for SageMaker UDOP processor configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor scope. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind"></a>

```typescript
public bind(scope: Construct, environment: IProcessingEnvironment): ISagemakerUdopProcessorConfigurationDefinition
```

Binds the configuration to a processor scope.

Writes the default configuration to the configuration table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.bind.parameter.environment"></a>

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.property.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfiguration.property.definition"></a>

```typescript
public readonly definition: ISagemakerUdopProcessorConfigurationDefinition;
```

- *Type:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a>

The configuration definition.

---

### ISagemakerUdopProcessorConfigurationDefinition <a name="ISagemakerUdopProcessorConfigurationDefinition" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition"></a>

- *Extends:* @cdklabs/genai-idp.IConfigurationDefinition

- *Implemented By:* <a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition">ISagemakerUdopProcessorConfigurationDefinition</a>

Interface for SageMaker UDOP processor configuration definition.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.ocrBackend">ocrBackend</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.assessmentInferenceProvider">assessmentInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.customPromptGenerator">customPromptGenerator</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.extractionInferenceProvider">extractionInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.summarizationInferenceProvider">summarizationInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |

---

##### `ocrBackend`<sup>Required</sup> <a name="ocrBackend" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.ocrBackend"></a>

```typescript
public readonly ocrBackend: string;
```

- *Type:* string

---

##### `assessmentInferenceProvider`<sup>Optional</sup> <a name="assessmentInferenceProvider" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.assessmentInferenceProvider"></a>

```typescript
public readonly assessmentInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

##### `customPromptGenerator`<sup>Optional</sup> <a name="customPromptGenerator" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.customPromptGenerator"></a>

```typescript
public readonly customPromptGenerator: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

---

##### `extractionInferenceProvider`<sup>Optional</sup> <a name="extractionInferenceProvider" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.extractionInferenceProvider"></a>

```typescript
public readonly extractionInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

##### `summarizationInferenceProvider`<sup>Optional</sup> <a name="summarizationInferenceProvider" id="@cdklabs/genai-idp-sagemaker-udop-processor.ISagemakerUdopProcessorConfigurationDefinition.property.summarizationInferenceProvider"></a>

```typescript
public readonly summarizationInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

