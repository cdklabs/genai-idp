# @cdklabs/genai-idp-bedrock-llm-processor

## Constructs <a name="Constructs" id="Constructs"></a>

### BedrockLlmProcessor <a name="BedrockLlmProcessor" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

Bedrock LLM document processor facade over UnifiedDocumentProcessor.

Delegates all processing to the unified processor using the pipeline path
(non-BDA). Uses Amazon Bedrock foundation models for OCR, classification,
extraction, assessment, summarization, and evaluation.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer"></a>

```typescript
import { BedrockLlmProcessor } from '@cdklabs/genai-idp-bedrock-llm-processor'

new BedrockLlmProcessor(scope: Construct, id: string, props: BedrockLlmProcessorProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps">BedrockLlmProcessorProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps">BedrockLlmProcessorProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.with">with</a></code> | Applies one or more mixins to this construct. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockMaxRetriesExceeded">metricBedrockMaxRetriesExceeded</a></code> | Bedrock requests that exceeded max retries. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockNonRetryableErrors">metricBedrockNonRetryableErrors</a></code> | Bedrock non-retryable errors. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestLatency">metricBedrockRequestLatency</a></code> | Bedrock single-request latency in milliseconds. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsFailed">metricBedrockRequestsFailed</a></code> | Failed Bedrock model invocation requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsSucceeded">metricBedrockRequestsSucceeded</a></code> | Successful Bedrock model invocation requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsTotal">metricBedrockRequestsTotal</a></code> | Total Bedrock model invocation requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRetrySuccess">metricBedrockRetrySuccess</a></code> | Bedrock requests that succeeded after retry. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockThrottles">metricBedrockThrottles</a></code> | Bedrock request throttles. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockTotalLatency">metricBedrockTotalLatency</a></code> | Bedrock total latency including retries in milliseconds. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockUnexpectedErrors">metricBedrockUnexpectedErrors</a></code> | Bedrock unexpected errors. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocumentPages">metricInputDocumentPages</a></code> | Document pages submitted for extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocuments">metricInputDocuments</a></code> | Documents submitted for extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputTokens">metricInputTokens</a></code> | Input tokens consumed. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsFailed">metricLambdaHookRequestsFailed</a></code> | Failed LambdaHook invocation requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsSucceeded">metricLambdaHookRequestsSucceeded</a></code> | Successful LambdaHook invocation requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsTotal">metricLambdaHookRequestsTotal</a></code> | Total LambdaHook invocation requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricOutputTokens">metricOutputTokens</a></code> | Output tokens generated. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricTotalTokens">metricTotalTokens</a></code> | Total tokens used. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `with` <a name="with" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.with"></a>

```typescript
public with(mixins: ...IMixin[]): IConstruct
```

Applies one or more mixins to this construct.

Mixins are applied in order. The list of constructs is captured at the
start of the call, so constructs added by a mixin will not be visited.
Use multiple `with()` calls if subsequent mixins should apply to added
constructs.

###### `mixins`<sup>Required</sup> <a name="mixins" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.with.parameter.mixins"></a>

- *Type:* ...constructs.IMixin[]

The mixins to apply.

---

##### `metricBedrockMaxRetriesExceeded` <a name="metricBedrockMaxRetriesExceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockMaxRetriesExceeded"></a>

```typescript
public metricBedrockMaxRetriesExceeded(props?: MetricOptions): Metric
```

Bedrock requests that exceeded max retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockMaxRetriesExceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockNonRetryableErrors` <a name="metricBedrockNonRetryableErrors" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockNonRetryableErrors"></a>

```typescript
public metricBedrockNonRetryableErrors(props?: MetricOptions): Metric
```

Bedrock non-retryable errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockNonRetryableErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRequestLatency` <a name="metricBedrockRequestLatency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestLatency"></a>

```typescript
public metricBedrockRequestLatency(props?: MetricOptions): Metric
```

Bedrock single-request latency in milliseconds.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRequestsFailed` <a name="metricBedrockRequestsFailed" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsFailed"></a>

```typescript
public metricBedrockRequestsFailed(props?: MetricOptions): Metric
```

Failed Bedrock model invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRequestsSucceeded` <a name="metricBedrockRequestsSucceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsSucceeded"></a>

```typescript
public metricBedrockRequestsSucceeded(props?: MetricOptions): Metric
```

Successful Bedrock model invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRequestsTotal` <a name="metricBedrockRequestsTotal" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsTotal"></a>

```typescript
public metricBedrockRequestsTotal(props?: MetricOptions): Metric
```

Total Bedrock model invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockRetrySuccess` <a name="metricBedrockRetrySuccess" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRetrySuccess"></a>

```typescript
public metricBedrockRetrySuccess(props?: MetricOptions): Metric
```

Bedrock requests that succeeded after retry.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRetrySuccess.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockThrottles` <a name="metricBedrockThrottles" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockThrottles"></a>

```typescript
public metricBedrockThrottles(props?: MetricOptions): Metric
```

Bedrock request throttles.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockTotalLatency` <a name="metricBedrockTotalLatency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockTotalLatency"></a>

```typescript
public metricBedrockTotalLatency(props?: MetricOptions): Metric
```

Bedrock total latency including retries in milliseconds.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockTotalLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricBedrockUnexpectedErrors` <a name="metricBedrockUnexpectedErrors" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockUnexpectedErrors"></a>

```typescript
public metricBedrockUnexpectedErrors(props?: MetricOptions): Metric
```

Bedrock unexpected errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockUnexpectedErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInputDocumentPages` <a name="metricInputDocumentPages" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocumentPages"></a>

```typescript
public metricInputDocumentPages(props?: MetricOptions): Metric
```

Document pages submitted for extraction.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocumentPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInputDocuments` <a name="metricInputDocuments" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocuments"></a>

```typescript
public metricInputDocuments(props?: MetricOptions): Metric
```

Documents submitted for extraction.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocuments.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInputTokens` <a name="metricInputTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputTokens"></a>

```typescript
public metricInputTokens(props?: MetricOptions): Metric
```

Input tokens consumed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricLambdaHookRequestsFailed` <a name="metricLambdaHookRequestsFailed" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsFailed"></a>

```typescript
public metricLambdaHookRequestsFailed(props?: MetricOptions): Metric
```

Failed LambdaHook invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricLambdaHookRequestsSucceeded` <a name="metricLambdaHookRequestsSucceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsSucceeded"></a>

```typescript
public metricLambdaHookRequestsSucceeded(props?: MetricOptions): Metric
```

Successful LambdaHook invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricLambdaHookRequestsTotal` <a name="metricLambdaHookRequestsTotal" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsTotal"></a>

```typescript
public metricLambdaHookRequestsTotal(props?: MetricOptions): Metric
```

Total LambdaHook invocation requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricLambdaHookRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricOutputTokens` <a name="metricOutputTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricOutputTokens"></a>

```typescript
public metricOutputTokens(props?: MetricOptions): Metric
```

Output tokens generated.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricOutputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricTotalTokens` <a name="metricTotalTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricTotalTokens"></a>

```typescript
public metricTotalTokens(props?: MetricOptions): Metric
```

Total tokens used.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricTotalTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.isConstruct"></a>

```typescript
import { BedrockLlmProcessor } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessor.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>@cdklabs/genai-idp.EvaluationFunction</code> | The evaluation function if evaluation is enabled for this processor. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: EvaluationFunction;
```

- *Type:* @cdklabs/genai-idp.EvaluationFunction

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

---


## Structs <a name="Structs" id="Structs"></a>

### BedrockLlmProcessorConfigurationDefinitionOptions <a name="BedrockLlmProcessorConfigurationDefinitionOptions" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions"></a>

Options for configuring the Bedrock LLM processor configuration definition.

Allows customization of all processing stages via Invokable providers.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.Initializer"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinitionOptions } from '@cdklabs/genai-idp-bedrock-llm-processor'

const bedrockLlmProcessorConfigurationDefinitionOptions: BedrockLlmProcessorConfigurationDefinitionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.assessmentInvokable">assessmentInvokable</a></code> | <code>@cdklabs/genai-idp.Invokable</code> | Optional inference provider for the assessment stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationInvokable">classificationInvokable</a></code> | <code>@cdklabs/genai-idp.Invokable</code> | Optional inference provider for the classification stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationMethod">classificationMethod</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a></code> | Optional classification method for document categorization. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.customPromptGeneratorFunction">customPromptGeneratorFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Optional custom prompt generator Lambda function. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the evaluation stage (Bedrock only, no LambdaHook). |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.extractionInvokable">extractionInvokable</a></code> | <code>@cdklabs/genai-idp.Invokable</code> | Optional inference provider for the extraction stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.ocrInvokable">ocrInvokable</a></code> | <code>@cdklabs/genai-idp.Invokable</code> | Optional inference provider for the OCR stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.summarizationInvokable">summarizationInvokable</a></code> | <code>@cdklabs/genai-idp.Invokable</code> | Optional inference provider for the summarization stage. |

---

##### `assessmentInvokable`<sup>Optional</sup> <a name="assessmentInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.assessmentInvokable"></a>

```typescript
public readonly assessmentInvokable: Invokable;
```

- *Type:* @cdklabs/genai-idp.Invokable

Optional inference provider for the assessment stage.

---

##### `classificationInvokable`<sup>Optional</sup> <a name="classificationInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationInvokable"></a>

```typescript
public readonly classificationInvokable: Invokable;
```

- *Type:* @cdklabs/genai-idp.Invokable

Optional inference provider for the classification stage.

---

##### `classificationMethod`<sup>Optional</sup> <a name="classificationMethod" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationMethod"></a>

```typescript
public readonly classificationMethod: ClassificationMethod;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a>

Optional classification method for document categorization.

---

##### `customPromptGeneratorFunction`<sup>Optional</sup> <a name="customPromptGeneratorFunction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.customPromptGeneratorFunction"></a>

```typescript
public readonly customPromptGeneratorFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Optional custom prompt generator Lambda function.

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the evaluation stage (Bedrock only, no LambdaHook).

---

##### `extractionInvokable`<sup>Optional</sup> <a name="extractionInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.extractionInvokable"></a>

```typescript
public readonly extractionInvokable: Invokable;
```

- *Type:* @cdklabs/genai-idp.Invokable

Optional inference provider for the extraction stage.

---

##### `ocrInvokable`<sup>Optional</sup> <a name="ocrInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.ocrInvokable"></a>

```typescript
public readonly ocrInvokable: Invokable;
```

- *Type:* @cdklabs/genai-idp.Invokable

Optional inference provider for the OCR stage.

---

##### `summarizationInvokable`<sup>Optional</sup> <a name="summarizationInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.summarizationInvokable"></a>

```typescript
public readonly summarizationInvokable: Invokable;
```

- *Type:* @cdklabs/genai-idp.Invokable

Optional inference provider for the summarization stage.

---

### BedrockLlmProcessorProps <a name="BedrockLlmProcessorProps" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps"></a>

Configuration properties for the Bedrock LLM document processor facade.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.Initializer"></a>

```typescript
import { BedrockLlmProcessorProps } from '@cdklabs/genai-idp-bedrock-llm-processor'

const bedrockLlmProcessorProps: BedrockLlmProcessorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.configuration">configuration</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration">IBedrockLlmProcessorConfiguration</a></code> | Configuration for the Bedrock LLM document processor. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.configurationBucket">configurationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket containing configuration files. |

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Optional</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number
- *Default:* 100 concurrent workflows

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `configuration`<sup>Required</sup> <a name="configuration" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.configuration"></a>

```typescript
public readonly configuration: IBedrockLlmProcessorConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration">IBedrockLlmProcessorConfiguration</a>

Configuration for the Bedrock LLM document processor.

---

##### `configurationBucket`<sup>Required</sup> <a name="configurationBucket" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.configurationBucket"></a>

```typescript
public readonly configurationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket containing configuration files.

---

## Classes <a name="Classes" id="Classes"></a>

### BedrockLlmProcessorConfiguration <a name="BedrockLlmProcessorConfiguration" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration">IBedrockLlmProcessorConfiguration</a>

Configuration management for Bedrock LLM document processing.

Provides factory methods for preset configurations and custom YAML files.
Delegates to `UnifiedDocumentProcessorConfigurationDefinition` for loading
configs from the unified config library.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.Initializer"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

new BedrockLlmProcessorConfiguration(definition: IBedrockLlmProcessorConfigurationDefinition)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.Initializer.parameter.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.Initializer.parameter.definition"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a>

The configuration definition.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor scope. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind"></a>

```typescript
public bind(scope: Construct, environment: IProcessingEnvironment): IBedrockLlmProcessorConfigurationDefinition
```

Binds the configuration to a processor scope.

Writes the default configuration to the configuration table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind.parameter.environment"></a>

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bankStatementSample">bankStatementSample</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.docSplit">docSplit</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile">fromFile</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.healthcareMultisectionPackage">healthcareMultisectionPackage</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSample">lendingPackageSample</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud">lendingPackageSampleGovCloud</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ocrBenchmark">ocrBenchmark</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.realkieFccVerified">realkieFccVerified</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleExtraction">ruleExtraction</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleValidation">ruleValidation</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdip">rvlCdip</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples">rvlCdipWithFewShotExamples</a></code> | *No description.* |

---

##### `bankStatementSample` <a name="bankStatementSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bankStatementSample"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.bankStatementSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bankStatementSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `docSplit` <a name="docSplit" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.docSplit"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.docSplit(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.docSplit.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.fromFile(filePath: string, options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile.parameter.filePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `healthcareMultisectionPackage` <a name="healthcareMultisectionPackage" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.healthcareMultisectionPackage"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.healthcareMultisectionPackage(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.healthcareMultisectionPackage.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSample"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.lendingPackageSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `lendingPackageSampleGovCloud` <a name="lendingPackageSampleGovCloud" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `ocrBenchmark` <a name="ocrBenchmark" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ocrBenchmark"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.ocrBenchmark(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ocrBenchmark.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `realkieFccVerified` <a name="realkieFccVerified" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.realkieFccVerified"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.realkieFccVerified(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.realkieFccVerified.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `ruleExtraction` <a name="ruleExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleExtraction"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.ruleExtraction(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleExtraction.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `ruleValidation` <a name="ruleValidation" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleValidation"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.ruleValidation(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleValidation.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdip` <a name="rvlCdip" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdip"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.rvlCdip(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdip.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdipWithFewShotExamples` <a name="rvlCdipWithFewShotExamples" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.property.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.property.definition"></a>

```typescript
public readonly definition: IBedrockLlmProcessorConfigurationDefinition;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a>

The configuration definition.

---


### BedrockLlmProcessorConfigurationDefinition <a name="BedrockLlmProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition"></a>

Configuration definition for Bedrock LLM document processing.

Delegates to `UnifiedDocumentProcessorConfigurationDefinition` for loading
configs from the unified config library. Maps bedrock-llm-specific options
to unified options.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.Initializer"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

new BedrockLlmProcessorConfigurationDefinition()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.bankStatementSample">bankStatementSample</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.docSplit">docSplit</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile">fromFile</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage">healthcareMultisectionPackage</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSample">lendingPackageSample</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud">lendingPackageSampleGovCloud</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ocrBenchmark">ocrBenchmark</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.realkieFccVerified">realkieFccVerified</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleExtraction">ruleExtraction</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleValidation">ruleValidation</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdip">rvlCdip</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples">rvlCdipWithFewShotExamples</a></code> | *No description.* |

---

##### `bankStatementSample` <a name="bankStatementSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.bankStatementSample"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.bankStatementSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.bankStatementSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `docSplit` <a name="docSplit" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.docSplit"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.docSplit(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.docSplit.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.fromFile(filePath: string, options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile.parameter.filePath"></a>

- *Type:* string

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `healthcareMultisectionPackage` <a name="healthcareMultisectionPackage" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSample"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.lendingPackageSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `lendingPackageSampleGovCloud` <a name="lendingPackageSampleGovCloud" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `ocrBenchmark` <a name="ocrBenchmark" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ocrBenchmark"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.ocrBenchmark(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ocrBenchmark.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `realkieFccVerified` <a name="realkieFccVerified" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.realkieFccVerified"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.realkieFccVerified(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.realkieFccVerified.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `ruleExtraction` <a name="ruleExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleExtraction"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.ruleExtraction(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleExtraction.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `ruleValidation` <a name="ruleValidation" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleValidation"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.ruleValidation(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleValidation.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdip` <a name="rvlCdip" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdip"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.rvlCdip(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdip.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---

##### `rvlCdipWithFewShotExamples` <a name="rvlCdipWithFewShotExamples" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

---



### Invokable <a name="Invokable" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable"></a>

- *Implements:* @cdklabs/genai-idp.IInvokable

Unified wrapper for Bedrock models and Lambda functions that implements IInvokable.

Use the static factory methods to create instances:

*Example*

```typescript
// From a Bedrock model
const provider = Invokable.fromModel(model);

// From a Lambda function (LambdaHook)
const provider = Invokable.fromFunction(fn);@since[object Object]
```


#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this resource. |

---

##### `grantInvoke` <a name="grantInvoke" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this resource.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable.fromFunction">fromFunction</a></code> | Create an Invokable from a Lambda function (LambdaHook pattern). |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable.fromModel">fromModel</a></code> | Create an Invokable from a Bedrock model or inference profile. |

---

##### `fromFunction` <a name="fromFunction" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable.fromFunction"></a>

```typescript
import { Invokable } from '@cdklabs/genai-idp-bedrock-llm-processor'

Invokable.fromFunction(fn: IFunction)
```

Create an Invokable from a Lambda function (LambdaHook pattern).

###### `fn`<sup>Required</sup> <a name="fn" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable.fromFunction.parameter.fn"></a>

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The Lambda function that implements the Converse API-compatible contract.

---

##### `fromModel` <a name="fromModel" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable.fromModel"></a>

```typescript
import { Invokable } from '@cdklabs/genai-idp-bedrock-llm-processor'

Invokable.fromModel(model: IBedrockInvokable)
```

Create an Invokable from a Bedrock model or inference profile.

###### `model`<sup>Required</sup> <a name="model" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable.fromModel.parameter.model"></a>

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

The Bedrock invokable model.

---



## Protocols <a name="Protocols" id="Protocols"></a>

### IBedrockLlmProcessor <a name="IBedrockLlmProcessor" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor"></a>

- *Extends:* @cdklabs/genai-idp.IDocumentProcessor

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor">BedrockLlmProcessor</a>, <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

Interface for Bedrock LLM document processor implementation.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>@cdklabs/genai-idp.EvaluationFunction</code> | The evaluation function if evaluation is enabled for this processor. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: EvaluationFunction;
```

- *Type:* @cdklabs/genai-idp.EvaluationFunction

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

---

### IBedrockLlmProcessorConfiguration <a name="IBedrockLlmProcessorConfiguration" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration">BedrockLlmProcessorConfiguration</a>, <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration">IBedrockLlmProcessorConfiguration</a>

Interface for Bedrock LLM document processor configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor scope. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind"></a>

```typescript
public bind(scope: Construct, environment: IProcessingEnvironment): IBedrockLlmProcessorConfigurationDefinition
```

Binds the configuration to a processor scope.

Writes the default configuration to the configuration table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope for creating custom resources.

---

###### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind.parameter.environment"></a>

- *Type:* @cdklabs/genai-idp.IProcessingEnvironment

The processing environment providing the configuration function and table.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.property.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a></code> | The configuration definition. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.property.definition"></a>

```typescript
public readonly definition: IBedrockLlmProcessorConfigurationDefinition;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a>

The configuration definition.

---

### IBedrockLlmProcessorConfigurationDefinition <a name="IBedrockLlmProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition"></a>

- *Extends:* @cdklabs/genai-idp.IConfigurationDefinition

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a>

Interface for Bedrock LLM processor configuration definition.

Exposes resolved inference providers for each processing stage.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationMethod">classificationMethod</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a></code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrBackend">ocrBackend</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.assessmentInferenceProvider">assessmentInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationInferenceProvider">classificationInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.customPromptGenerator">customPromptGenerator</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.extractionInferenceProvider">extractionInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrInferenceProvider">ocrInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.summarizationInferenceProvider">summarizationInferenceProvider</a></code> | <code>@cdklabs/genai-idp.IInvokable</code> | *No description.* |

---

##### `classificationMethod`<sup>Required</sup> <a name="classificationMethod" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationMethod"></a>

```typescript
public readonly classificationMethod: ClassificationMethod;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a>

---

##### `ocrBackend`<sup>Required</sup> <a name="ocrBackend" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrBackend"></a>

```typescript
public readonly ocrBackend: string;
```

- *Type:* string

---

##### `assessmentInferenceProvider`<sup>Optional</sup> <a name="assessmentInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.assessmentInferenceProvider"></a>

```typescript
public readonly assessmentInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

##### `classificationInferenceProvider`<sup>Optional</sup> <a name="classificationInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationInferenceProvider"></a>

```typescript
public readonly classificationInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

##### `customPromptGenerator`<sup>Optional</sup> <a name="customPromptGenerator" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.customPromptGenerator"></a>

```typescript
public readonly customPromptGenerator: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

---

##### `extractionInferenceProvider`<sup>Optional</sup> <a name="extractionInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.extractionInferenceProvider"></a>

```typescript
public readonly extractionInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

##### `ocrInferenceProvider`<sup>Optional</sup> <a name="ocrInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrInferenceProvider"></a>

```typescript
public readonly ocrInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

##### `summarizationInferenceProvider`<sup>Optional</sup> <a name="summarizationInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.summarizationInferenceProvider"></a>

```typescript
public readonly summarizationInferenceProvider: IInvokable;
```

- *Type:* @cdklabs/genai-idp.IInvokable

---

### IInvokable <a name="IInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.IInvokable"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>

Unified interface for any resource that can serve as an inference backend.

Abstracts over Bedrock models and Lambda functions so that processing stage
constructs can grant invoke permissions without knowing the underlying type.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this resource. |

---

##### `grantInvoke` <a name="grantInvoke" id="@cdklabs/genai-idp-bedrock-llm-processor.IInvokable.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this resource.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bedrock-llm-processor.IInvokable.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant invoke permissions to.

---


## Enums <a name="Enums" id="Enums"></a>

### ClassificationMethod <a name="ClassificationMethod" id="@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod"></a>

Defines the methods available for document classification in Pattern 2 processing.

Document classification is a critical step in the IDP workflow that determines
how documents are categorized and processed. Different classification methods
offer varying levels of accuracy, performance, and capabilities.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION">MULTIMODAL_PAGE_LEVEL_CLASSIFICATION</a></code> | Uses multimodal models to classify documents at the page level. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION">TEXTBASED_HOLISTIC_CLASSIFICATION</a></code> | Uses text-based analysis to classify the entire document holistically. Considers the full document text content for classification decisions. |

---

##### `MULTIMODAL_PAGE_LEVEL_CLASSIFICATION` <a name="MULTIMODAL_PAGE_LEVEL_CLASSIFICATION" id="@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION"></a>

Uses multimodal models to classify documents at the page level.

Analyzes both text and visual elements on each page for classification.

This method is effective for documents where each page may belong to a different
document type or category. It provides high accuracy for complex layouts by
considering both textual content and visual structure of each page individually.

---


##### `TEXTBASED_HOLISTIC_CLASSIFICATION` <a name="TEXTBASED_HOLISTIC_CLASSIFICATION" id="@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION"></a>

Uses text-based analysis to classify the entire document holistically. Considers the full document text content for classification decisions.

This method is more efficient and cost-effective as it only processes the
extracted text. It works well for text-heavy documents where the document type
is consistent across all pages and visual elements are less important for classification.

---


### InvokableType <a name="InvokableType" id="@cdklabs/genai-idp-bedrock-llm-processor.InvokableType"></a>

The type of inference backend wrapped by an Invokable.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.InvokableType.MODEL">MODEL</a></code> | A Bedrock foundation model or inference profile. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.InvokableType.FUNCTION">FUNCTION</a></code> | A Lambda function implementing the LambdaHook contract. |

---

##### `MODEL` <a name="MODEL" id="@cdklabs/genai-idp-bedrock-llm-processor.InvokableType.MODEL"></a>

A Bedrock foundation model or inference profile.

---


##### `FUNCTION` <a name="FUNCTION" id="@cdklabs/genai-idp-bedrock-llm-processor.InvokableType.FUNCTION"></a>

A Lambda function implementing the LambdaHook contract.

---

