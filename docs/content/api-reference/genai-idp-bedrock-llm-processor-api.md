# @cdklabs/genai-idp-bedrock-llm-processor

## Constructs <a name="Constructs" id="Constructs"></a>

### BedrockLlmProcessor <a name="BedrockLlmProcessor" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

This processor implements an intelligent document processing workflow that uses Amazon Bedrock with Nova or Claude models for both page classification/grouping and information extraction.

The workflow consists of three main processing steps:

- OCR processing using Amazon Textract
- Page classification and grouping using Claude via Amazon Bedrock
- Field extraction using Claude via Amazon Bedrock

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
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingMaxRetriesExceeded">metricBedrockEmbeddingMaxRetriesExceeded</a></code> | Creates a CloudWatch metric for Bedrock embedding requests that exceeded max retries. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingNonRetryableErrors">metricBedrockEmbeddingNonRetryableErrors</a></code> | Creates a CloudWatch metric for Bedrock embedding non-retryable errors. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestLatency">metricBedrockEmbeddingRequestLatency</a></code> | Creates a CloudWatch metric for Bedrock embedding request latency. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsFailed">metricBedrockEmbeddingRequestsFailed</a></code> | Creates a CloudWatch metric for failed Bedrock embedding requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsSucceeded">metricBedrockEmbeddingRequestsSucceeded</a></code> | Creates a CloudWatch metric for successful Bedrock embedding requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsTotal">metricBedrockEmbeddingRequestsTotal</a></code> | Creates a CloudWatch metric for total Bedrock embedding requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingThrottles">metricBedrockEmbeddingThrottles</a></code> | Creates a CloudWatch metric for Bedrock embedding request throttles. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingUnexpectedErrors">metricBedrockEmbeddingUnexpectedErrors</a></code> | Creates a CloudWatch metric for Bedrock embedding unexpected errors. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockMaxRetriesExceeded">metricBedrockMaxRetriesExceeded</a></code> | Creates a CloudWatch metric for Bedrock requests that exceeded max retries. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockNonRetryableErrors">metricBedrockNonRetryableErrors</a></code> | Creates a CloudWatch metric for Bedrock non-retryable errors. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestLatency">metricBedrockRequestLatency</a></code> | Creates a CloudWatch metric for Bedrock request latency. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsFailed">metricBedrockRequestsFailed</a></code> | Creates a CloudWatch metric for failed Bedrock requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsSucceeded">metricBedrockRequestsSucceeded</a></code> | Creates a CloudWatch metric for successful Bedrock requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsTotal">metricBedrockRequestsTotal</a></code> | Creates a CloudWatch metric for total Bedrock requests. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRetrySuccess">metricBedrockRetrySuccess</a></code> | Creates a CloudWatch metric for successful Bedrock request retries. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockThrottles">metricBedrockThrottles</a></code> | Creates a CloudWatch metric for Bedrock request throttles. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockTotalLatency">metricBedrockTotalLatency</a></code> | Creates a CloudWatch metric for total Bedrock request latency. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockUnexpectedErrors">metricBedrockUnexpectedErrors</a></code> | Creates a CloudWatch metric for Bedrock unexpected errors. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricCacheReadInputTokens">metricCacheReadInputTokens</a></code> | Creates a CloudWatch metric for cache read input tokens. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricCacheWriteInputTokens">metricCacheWriteInputTokens</a></code> | Creates a CloudWatch metric for cache write input tokens. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocumentPages">metricInputDocumentPages</a></code> | Creates a CloudWatch metric for input document pages processed. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocuments">metricInputDocuments</a></code> | Creates a CloudWatch metric for input documents processed. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputTokens">metricInputTokens</a></code> | Creates a CloudWatch metric for input tokens consumed. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricOutputTokens">metricOutputTokens</a></code> | Creates a CloudWatch metric for output tokens generated. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricTotalTokens">metricTotalTokens</a></code> | Creates a CloudWatch metric for total tokens used. |

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

##### `metricBedrockEmbeddingMaxRetriesExceeded` <a name="metricBedrockEmbeddingMaxRetriesExceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingMaxRetriesExceeded"></a>

```typescript
public metricBedrockEmbeddingMaxRetriesExceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock embedding requests that exceeded max retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingMaxRetriesExceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingNonRetryableErrors` <a name="metricBedrockEmbeddingNonRetryableErrors" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingNonRetryableErrors"></a>

```typescript
public metricBedrockEmbeddingNonRetryableErrors(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock embedding non-retryable errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingNonRetryableErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingRequestLatency` <a name="metricBedrockEmbeddingRequestLatency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestLatency"></a>

```typescript
public metricBedrockEmbeddingRequestLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock embedding request latency.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingRequestsFailed` <a name="metricBedrockEmbeddingRequestsFailed" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsFailed"></a>

```typescript
public metricBedrockEmbeddingRequestsFailed(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for failed Bedrock embedding requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingRequestsSucceeded` <a name="metricBedrockEmbeddingRequestsSucceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsSucceeded"></a>

```typescript
public metricBedrockEmbeddingRequestsSucceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for successful Bedrock embedding requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingRequestsTotal` <a name="metricBedrockEmbeddingRequestsTotal" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsTotal"></a>

```typescript
public metricBedrockEmbeddingRequestsTotal(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total Bedrock embedding requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingThrottles` <a name="metricBedrockEmbeddingThrottles" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingThrottles"></a>

```typescript
public metricBedrockEmbeddingThrottles(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock embedding request throttles.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockEmbeddingUnexpectedErrors` <a name="metricBedrockEmbeddingUnexpectedErrors" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingUnexpectedErrors"></a>

```typescript
public metricBedrockEmbeddingUnexpectedErrors(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock embedding unexpected errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockEmbeddingUnexpectedErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockMaxRetriesExceeded` <a name="metricBedrockMaxRetriesExceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockMaxRetriesExceeded"></a>

```typescript
public metricBedrockMaxRetriesExceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock requests that exceeded max retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockMaxRetriesExceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockNonRetryableErrors` <a name="metricBedrockNonRetryableErrors" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockNonRetryableErrors"></a>

```typescript
public metricBedrockNonRetryableErrors(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock non-retryable errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockNonRetryableErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockRequestLatency` <a name="metricBedrockRequestLatency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestLatency"></a>

```typescript
public metricBedrockRequestLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock request latency.

Measures individual request processing time.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockRequestsFailed` <a name="metricBedrockRequestsFailed" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsFailed"></a>

```typescript
public metricBedrockRequestsFailed(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for failed Bedrock requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockRequestsSucceeded` <a name="metricBedrockRequestsSucceeded" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsSucceeded"></a>

```typescript
public metricBedrockRequestsSucceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for successful Bedrock requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockRequestsTotal` <a name="metricBedrockRequestsTotal" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsTotal"></a>

```typescript
public metricBedrockRequestsTotal(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total Bedrock requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockRetrySuccess` <a name="metricBedrockRetrySuccess" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRetrySuccess"></a>

```typescript
public metricBedrockRetrySuccess(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for successful Bedrock request retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockRetrySuccess.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockThrottles` <a name="metricBedrockThrottles" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockThrottles"></a>

```typescript
public metricBedrockThrottles(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock request throttles.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockTotalLatency` <a name="metricBedrockTotalLatency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockTotalLatency"></a>

```typescript
public metricBedrockTotalLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total Bedrock request latency.

Measures total request processing time including retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockTotalLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBedrockUnexpectedErrors` <a name="metricBedrockUnexpectedErrors" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockUnexpectedErrors"></a>

```typescript
public metricBedrockUnexpectedErrors(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for Bedrock unexpected errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricBedrockUnexpectedErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricCacheReadInputTokens` <a name="metricCacheReadInputTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricCacheReadInputTokens"></a>

```typescript
public metricCacheReadInputTokens(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for cache read input tokens.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricCacheReadInputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricCacheWriteInputTokens` <a name="metricCacheWriteInputTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricCacheWriteInputTokens"></a>

```typescript
public metricCacheWriteInputTokens(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for cache write input tokens.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricCacheWriteInputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricInputDocumentPages` <a name="metricInputDocumentPages" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocumentPages"></a>

```typescript
public metricInputDocumentPages(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for input document pages processed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocumentPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricInputDocuments` <a name="metricInputDocuments" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocuments"></a>

```typescript
public metricInputDocuments(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for input documents processed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputDocuments.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricInputTokens` <a name="metricInputTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputTokens"></a>

```typescript
public metricInputTokens(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for input tokens consumed.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricInputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricOutputTokens` <a name="metricOutputTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricOutputTokens"></a>

```typescript
public metricOutputTokens(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for output tokens generated.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricOutputTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricTotalTokens` <a name="metricTotalTokens" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricTotalTokens"></a>

```typescript
public metricTotalTokens(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total tokens used.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.metricTotalTokens.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

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
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure resources. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>any</code> | The evaluation function used for assessing extraction accuracy. |

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

The processing environment that provides shared infrastructure resources.

Includes buckets, tables, API, encryption, and VPC configuration used
by all processing functions within this processor.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number
- *Default:* 100

The maximum number of documents that can be processed concurrently.

Controls the parallelism of the Step Functions state machine to balance
throughput against resource consumption.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Coordinates OCR, classification, extraction, assessment, summarization,
rule validation, and evaluation steps in the correct sequence.

---

##### `evaluationFunction`<sup>Optional</sup> <a name="evaluationFunction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessor.property.evaluationFunction"></a>

```typescript
public readonly evaluationFunction: any;
```

- *Type:* any

The evaluation function used for assessing extraction accuracy.

When configured with a baseline bucket and evaluation model, this function
compares extraction results against known correct values.

---


## Structs <a name="Structs" id="Structs"></a>

### BedrockLlmProcessorConfigurationDefinitionOptions <a name="BedrockLlmProcessorConfigurationDefinitionOptions" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions"></a>

Options for configuring the Bedrock LLM processor configuration definition. Allows customization of classification, extraction, evaluation, summarization, and OCR stages.

Use `Invokable.fromModel()` to wrap a Bedrock model or `Invokable.fromFunction()` to wrap
a Lambda function implementing the LambdaHook contract.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.Initializer"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinitionOptions } from '@cdklabs/genai-idp-bedrock-llm-processor'

const bedrockLlmProcessorConfigurationDefinitionOptions: BedrockLlmProcessorConfigurationDefinitionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.assessmentInvokable">assessmentInvokable</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a></code> | Optional inference provider for the assessment stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationInvokable">classificationInvokable</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a></code> | Optional inference provider for the classification stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationMethod">classificationMethod</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a></code> | Optional classification method to use for document categorization. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.customPromptGeneratorFunction">customPromptGeneratorFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Optional custom prompt generator Lambda function. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional model for the evaluation stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.extractionInvokable">extractionInvokable</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a></code> | Optional inference provider for the extraction stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.ocrInvokable">ocrInvokable</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a></code> | Optional inference provider for the OCR stage. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.summarizationInvokable">summarizationInvokable</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a></code> | Optional inference provider for the summarization stage. |

---

##### `assessmentInvokable`<sup>Optional</sup> <a name="assessmentInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.assessmentInvokable"></a>

```typescript
public readonly assessmentInvokable: Invokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a>
- *Default:* as defined in the configuration file

Optional inference provider for the assessment stage.

Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.

---

##### `classificationInvokable`<sup>Optional</sup> <a name="classificationInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationInvokable"></a>

```typescript
public readonly classificationInvokable: Invokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a>
- *Default:* as defined in the configuration file

Optional inference provider for the classification stage.

Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.

---

##### `classificationMethod`<sup>Optional</sup> <a name="classificationMethod" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.classificationMethod"></a>

```typescript
public readonly classificationMethod: ClassificationMethod;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a>

Optional classification method to use for document categorization.

Determines how documents are analyzed and categorized before extraction.

---

##### `customPromptGeneratorFunction`<sup>Optional</sup> <a name="customPromptGeneratorFunction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.customPromptGeneratorFunction"></a>

```typescript
public readonly customPromptGeneratorFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Optional custom prompt generator Lambda function.

When provided, the function ARN will be injected into the configuration
at `extraction.custom_prompt_lambda_arn`.

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable

Optional model for the evaluation stage.

Evaluation does not support LambdaHook — only Bedrock models.

---

##### `extractionInvokable`<sup>Optional</sup> <a name="extractionInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.extractionInvokable"></a>

```typescript
public readonly extractionInvokable: Invokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a>
- *Default:* as defined in the configuration file

Optional inference provider for the extraction stage.

Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.

---

##### `ocrInvokable`<sup>Optional</sup> <a name="ocrInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.ocrInvokable"></a>

```typescript
public readonly ocrInvokable: Invokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a>
- *Default:* as defined in the configuration file

Optional inference provider for the OCR stage.

Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.

---

##### `summarizationInvokable`<sup>Optional</sup> <a name="summarizationInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions.property.summarizationInvokable"></a>

```typescript
public readonly summarizationInvokable: Invokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a>
- *Default:* as defined in the configuration file

Optional inference provider for the summarization stage.

Use `Invokable.fromModel()` for a Bedrock model or `Invokable.fromFunction()` for a LambdaHook.

---

### BedrockLlmProcessorProps <a name="BedrockLlmProcessorProps" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps"></a>

Configuration properties for the Bedrock LLM document processor.

Bedrock LLM Processor uses custom extraction with Amazon Bedrock models, providing
flexible document processing capabilities for a wide range of document types.
This processor is ideal when you need more control over the extraction process
and want to implement custom classification and extraction logic using
foundation models directly.

Bedrock LLM Processor offers a balance between customization and implementation complexity,
allowing you to define custom extraction schemas and prompts while leveraging
the power of Amazon Bedrock foundation models.

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
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.assessmentGuardrail">assessmentGuardrail</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IGuardrail</code> | Optional Bedrock guardrail to apply to assessment model interactions. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.classificationGuardrail">classificationGuardrail</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IGuardrail</code> | Optional Bedrock guardrail to apply to classification model interactions. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.classificationMaxWorkers">classificationMaxWorkers</a></code> | <code>number</code> | The maximum number of concurrent workers for document classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.enableAgenticExtraction">enableAgenticExtraction</a></code> | <code>boolean</code> | Enable agentic extraction with Strands framework. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.enableEditSections">enableEditSections</a></code> | <code>boolean</code> | Enable edit sections feature for classification updates. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.enableRegexClassification">enableRegexClassification</a></code> | <code>boolean</code> | Enable regex-based classification for performance optimization. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.evaluationBaselineBucket">evaluationBaselineBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional S3 bucket containing baseline documents for evaluation. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.extractionGuardrail">extractionGuardrail</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IGuardrail</code> | Optional Bedrock guardrail to apply to extraction model interactions. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.maxPagesForClassification">maxPagesForClassification</a></code> | <code>number \| @cdklabs/genai-idp.MaxPagesForClassification</code> | Maximum pages for classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.ocrGuardrail">ocrGuardrail</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IGuardrail</code> | Optional Bedrock guardrail to apply to OCR model interactions. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.ocrMaxWorkers">ocrMaxWorkers</a></code> | <code>number</code> | The maximum number of concurrent workers for OCR processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.sectionSplittingStrategy">sectionSplittingStrategy</a></code> | <code>@cdklabs/genai-idp.SectionSplittingStrategy</code> | Section splitting strategy configuration. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.summarizationGuardrail">summarizationGuardrail</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IGuardrail</code> | Optional Bedrock guardrail to apply to summarization model interactions. |

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

Provides customization options for the processing workflow,
including schema definitions, prompts, and evaluation settings.

---

##### `assessmentGuardrail`<sup>Optional</sup> <a name="assessmentGuardrail" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.assessmentGuardrail"></a>

```typescript
public readonly assessmentGuardrail: IGuardrail;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to assessment model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `classificationGuardrail`<sup>Optional</sup> <a name="classificationGuardrail" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.classificationGuardrail"></a>

```typescript
public readonly classificationGuardrail: IGuardrail;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to classification model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `classificationMaxWorkers`<sup>Optional</sup> <a name="classificationMaxWorkers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.classificationMaxWorkers"></a>

```typescript
public readonly classificationMaxWorkers: number;
```

- *Type:* number
- *Default:* 20

The maximum number of concurrent workers for document classification.

Controls parallelism during the classification phase to optimize
throughput while managing resource utilization.

---

##### `enableAgenticExtraction`<sup>Optional</sup> <a name="enableAgenticExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.enableAgenticExtraction"></a>

```typescript
public readonly enableAgenticExtraction: boolean;
```

- *Type:* boolean
- *Default:* false

Enable agentic extraction with Strands framework.

When enabled, uses the Strands agent framework for intelligent, self-correcting
document extraction with iterative validation loops. This provides more robust
extraction for complex documents but may increase processing time.

---

##### `enableEditSections`<sup>Optional</sup> <a name="enableEditSections" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.enableEditSections"></a>

```typescript
public readonly enableEditSections: boolean;
```

- *Type:* boolean
- *Default:* false

Enable edit sections feature for classification updates.

When enabled, allows users to modify document classification through the UI
and trigger selective reprocessing of affected sections. This provides
flexibility to correct classification errors without reprocessing entire documents.

---

##### `enableRegexClassification`<sup>Optional</sup> <a name="enableRegexClassification" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.enableRegexClassification"></a>

```typescript
public readonly enableRegexClassification: boolean;
```

- *Type:* boolean
- *Default:* false

Enable regex-based classification for performance optimization.

When enabled, attempts to classify documents using regex patterns matching
document names or page content before falling back to LLM classification.
This can significantly improve performance and reduce costs for documents
with predictable naming patterns.

---

##### `evaluationBaselineBucket`<sup>Optional</sup> <a name="evaluationBaselineBucket" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.evaluationBaselineBucket"></a>

```typescript
public readonly evaluationBaselineBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* No evaluation baseline bucket is configured

Optional S3 bucket containing baseline documents for evaluation.

Used as ground truth when evaluating extraction accuracy by
comparing extraction results against known correct values.

---

##### `extractionGuardrail`<sup>Optional</sup> <a name="extractionGuardrail" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.extractionGuardrail"></a>

```typescript
public readonly extractionGuardrail: IGuardrail;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to extraction model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `maxPagesForClassification`<sup>Optional</sup> <a name="maxPagesForClassification" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.maxPagesForClassification"></a>

```typescript
public readonly maxPagesForClassification: number | MaxPagesForClassification;
```

- *Type:* number | @cdklabs/genai-idp.MaxPagesForClassification
- *Default:* MaxPagesForClassification.ALL

Maximum pages for classification.

Controls how many pages are sent to the classification model. Can be a specific
number or MaxPagesForClassification.ALL to use all pages. Limiting pages can
optimize costs and performance for large documents.

---

##### `ocrGuardrail`<sup>Optional</sup> <a name="ocrGuardrail" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.ocrGuardrail"></a>

```typescript
public readonly ocrGuardrail: IGuardrail;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to OCR model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `ocrMaxWorkers`<sup>Optional</sup> <a name="ocrMaxWorkers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.ocrMaxWorkers"></a>

```typescript
public readonly ocrMaxWorkers: number;
```

- *Type:* number
- *Default:* 20

The maximum number of concurrent workers for OCR processing.

Controls parallelism during the text extraction phase to optimize
throughput while managing resource utilization.

---

##### `sectionSplittingStrategy`<sup>Optional</sup> <a name="sectionSplittingStrategy" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.sectionSplittingStrategy"></a>

```typescript
public readonly sectionSplittingStrategy: SectionSplittingStrategy;
```

- *Type:* @cdklabs/genai-idp.SectionSplittingStrategy
- *Default:* SectionSplittingStrategy.LLM_DETERMINED

Section splitting strategy configuration.

Controls how multi-page documents are divided into sections during classification.
This affects how documents of the same type are grouped together and processed.

Options:
- DISABLED: Entire document treated as single section with first detected class
- PAGE: One section per page preventing automatic joining of same-type documents
- LLM_DETERMINED: Uses LLM boundary detection with "Start"/"Continue" indicators

---

##### `summarizationGuardrail`<sup>Optional</sup> <a name="summarizationGuardrail" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorProps.property.summarizationGuardrail"></a>

```typescript
public readonly summarizationGuardrail: IGuardrail;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IGuardrail
- *Default:* No guardrail is applied

Optional Bedrock guardrail to apply to summarization model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

## Classes <a name="Classes" id="Classes"></a>

### BedrockLlmProcessorConfiguration <a name="BedrockLlmProcessorConfiguration" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration">IBedrockLlmProcessorConfiguration</a>

Configuration management for Bedrock LLM document processing using custom extraction with Bedrock models.

This construct creates and manages the configuration for Bedrock LLM document processing,
including schema definitions, classification prompts, extraction prompts, and configuration
values. It provides a centralized way to manage document classes, extraction schemas, and model parameters.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.Initializer"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

new BedrockLlmProcessorConfiguration(definition: IBedrockLlmProcessorConfigurationDefinition)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.Initializer.parameter.definition">definition</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a></code> | The configuration definition instance. |

---

##### `definition`<sup>Required</sup> <a name="definition" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.Initializer.parameter.definition"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a>

The configuration definition instance.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind"></a>

```typescript
public bind(processor: IBedrockLlmProcessor): IBedrockLlmProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

This method applies the configuration to the processor.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bankStatementSample">bankStatementSample</a></code> | Creates a configuration for bank statement processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.checkboxedAttributesExtraction">checkboxedAttributesExtraction</a></code> | Creates a configuration for checkbox extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.criteriaValidation">criteriaValidation</a></code> | Creates a configuration for criteria validation. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.docSplit">docSplit</a></code> | Creates a configuration for document splitting. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fewShotExampleWithMultimodalPageClassification">fewShotExampleWithMultimodalPageClassification</a></code> | Creates a configuration with few-shot examples and multimodal page classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile">fromFile</a></code> | Creates a configuration from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.healthcareMultisectionPackage">healthcareMultisectionPackage</a></code> | Creates a configuration for healthcare multisection package processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSample">lendingPackageSample</a></code> | Creates a configuration for lending package processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud">lendingPackageSampleGovCloud</a></code> | Creates a minimal configuration for GovCloud deployments. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.medicalRecordsSummarization">medicalRecordsSummarization</a></code> | Creates a configuration for medical records summarization. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ocrBenchmark">ocrBenchmark</a></code> | Creates a configuration for OCR benchmarking. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.realkieFccVerified">realkieFccVerified</a></code> | Creates a configuration for RealKIE FCC verified documents. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleExtraction">ruleExtraction</a></code> | Creates a configuration for rule extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleValidation">ruleValidation</a></code> | Creates a configuration for rule validation. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdip">rvlCdip</a></code> | Creates a configuration for RVL-CDIP document classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipPackageSample">rvlCdipPackageSample</a></code> | Creates a configuration for RVL-CDIP package processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipPackageSampleWithFewShotExamples">rvlCdipPackageSampleWithFewShotExamples</a></code> | Creates a configuration for RVL-CDIP package processing with few-shot examples. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples">rvlCdipWithFewShotExamples</a></code> | Creates a configuration for RVL-CDIP with few-shot examples. |

---

##### `bankStatementSample` <a name="bankStatementSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bankStatementSample"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.bankStatementSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for bank statement processing.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.bankStatementSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `checkboxedAttributesExtraction` <a name="checkboxedAttributesExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.checkboxedAttributesExtraction"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.checkboxedAttributesExtraction(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for checkbox extraction.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.checkboxedAttributesExtraction.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `criteriaValidation` <a name="criteriaValidation" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.criteriaValidation"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.criteriaValidation(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for criteria validation.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.criteriaValidation.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `docSplit` <a name="docSplit" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.docSplit"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.docSplit(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for document splitting.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.docSplit.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `fewShotExampleWithMultimodalPageClassification` <a name="fewShotExampleWithMultimodalPageClassification" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fewShotExampleWithMultimodalPageClassification"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.fewShotExampleWithMultimodalPageClassification(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration with few-shot examples and multimodal page classification.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fewShotExampleWithMultimodalPageClassification.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.fromFile(filePath: string, options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration from a YAML file.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options to override file settings.

---

##### `healthcareMultisectionPackage` <a name="healthcareMultisectionPackage" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.healthcareMultisectionPackage"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.healthcareMultisectionPackage(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for healthcare multisection package processing.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.healthcareMultisectionPackage.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSample"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.lendingPackageSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for lending package processing.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `lendingPackageSampleGovCloud` <a name="lendingPackageSampleGovCloud" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a minimal configuration for GovCloud deployments.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.lendingPackageSampleGovCloud.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `medicalRecordsSummarization` <a name="medicalRecordsSummarization" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.medicalRecordsSummarization"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.medicalRecordsSummarization(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for medical records summarization.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.medicalRecordsSummarization.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `ocrBenchmark` <a name="ocrBenchmark" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ocrBenchmark"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.ocrBenchmark(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for OCR benchmarking.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ocrBenchmark.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `realkieFccVerified` <a name="realkieFccVerified" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.realkieFccVerified"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.realkieFccVerified(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RealKIE FCC verified documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.realkieFccVerified.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `ruleExtraction` <a name="ruleExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleExtraction"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.ruleExtraction(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for rule extraction.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleExtraction.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `ruleValidation` <a name="ruleValidation" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleValidation"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.ruleValidation(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for rule validation.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.ruleValidation.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `rvlCdip` <a name="rvlCdip" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdip"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.rvlCdip(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RVL-CDIP document classification.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdip.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `rvlCdipPackageSample` <a name="rvlCdipPackageSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipPackageSample"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.rvlCdipPackageSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RVL-CDIP package processing.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `rvlCdipPackageSampleWithFewShotExamples` <a name="rvlCdipPackageSampleWithFewShotExamples" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipPackageSampleWithFewShotExamples"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.rvlCdipPackageSampleWithFewShotExamples(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RVL-CDIP package processing with few-shot examples.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipPackageSampleWithFewShotExamples.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---

##### `rvlCdipWithFewShotExamples` <a name="rvlCdipWithFewShotExamples" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples"></a>

```typescript
import { BedrockLlmProcessorConfiguration } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration for RVL-CDIP with few-shot examples.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration.rvlCdipWithFewShotExamples.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---



### BedrockLlmProcessorConfigurationDefinition <a name="BedrockLlmProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition"></a>

Configuration definition for Pattern 2 document processing.

Provides methods to create and customize configuration for Bedrock LLM processing.

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
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.bankStatementSample">bankStatementSample</a></code> | Creates a configuration definition for bank statement sample processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.checkboxedAttributesExtraction">checkboxedAttributesExtraction</a></code> | Creates a configuration definition optimized for checkbox attribute extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.criteriaValidation">criteriaValidation</a></code> | Creates a configuration definition for criteria validation processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.docSplit">docSplit</a></code> | Creates a configuration definition for document splitting. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fewShotExampleWithMultimodalPageClassification">fewShotExampleWithMultimodalPageClassification</a></code> | Creates a configuration definition with few-shot examples for multimodal page classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile">fromFile</a></code> | Creates a configuration definition from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage">healthcareMultisectionPackage</a></code> | Creates a configuration definition for healthcare multisection package processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSample">lendingPackageSample</a></code> | Creates a configuration definition for lending package sample processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud">lendingPackageSampleGovCloud</a></code> | Creates a minimal configuration definition for GovCloud deployments. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.medicalRecordsSummarization">medicalRecordsSummarization</a></code> | Creates a configuration definition for medical records summarization. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ocrBenchmark">ocrBenchmark</a></code> | Creates a configuration definition for OCR benchmarking. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.realkieFccVerified">realkieFccVerified</a></code> | Creates a configuration definition for RealKIE FCC verified documents. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleExtraction">ruleExtraction</a></code> | Creates a configuration definition for rule extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleValidation">ruleValidation</a></code> | Creates a configuration definition for rule validation. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdip">rvlCdip</a></code> | Creates a configuration definition for RVL-CDIP document classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSample">rvlCdipPackageSample</a></code> | Creates a configuration definition for RVL-CDIP package sample processing. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSampleWithFewShotExamples">rvlCdipPackageSampleWithFewShotExamples</a></code> | Creates a configuration definition for RVL-CDIP package sample with few-shot examples. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples">rvlCdipWithFewShotExamples</a></code> | Creates a configuration definition for RVL-CDIP with few-shot examples. |

---

##### `bankStatementSample` <a name="bankStatementSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.bankStatementSample"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.bankStatementSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for bank statement sample processing.

This configuration includes settings for classification, extraction,
evaluation, and summarization optimized for bank statement documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.bankStatementSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `checkboxedAttributesExtraction` <a name="checkboxedAttributesExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.checkboxedAttributesExtraction"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.checkboxedAttributesExtraction(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition optimized for checkbox attribute extraction.

This configuration includes specialized prompts and settings for detecting
and extracting checkbox states from documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.checkboxedAttributesExtraction.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `criteriaValidation` <a name="criteriaValidation" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.criteriaValidation"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.criteriaValidation(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for criteria validation processing.

This configuration includes settings for validating documents against
specific criteria and requirements.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.criteriaValidation.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `docSplit` <a name="docSplit" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.docSplit"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.docSplit(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for document splitting.

This configuration focuses on splitting multi-document files into
individual documents for processing.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.docSplit.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `fewShotExampleWithMultimodalPageClassification` <a name="fewShotExampleWithMultimodalPageClassification" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fewShotExampleWithMultimodalPageClassification"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.fewShotExampleWithMultimodalPageClassification(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition with few-shot examples for multimodal page classification.

This configuration includes example prompts that demonstrate how to classify
document pages using both visual and textual information.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fewShotExampleWithMultimodalPageClassification.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.fromFile(filePath: string, options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition from a YAML file.

Allows users to provide custom configuration files for document processing.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `healthcareMultisectionPackage` <a name="healthcareMultisectionPackage" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for healthcare multisection package processing.

This configuration includes settings optimized for processing complex healthcare
documents with multiple sections.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.healthcareMultisectionPackage.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSample"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.lendingPackageSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for lending package sample processing.

This configuration includes settings for classification, extraction,
evaluation, and summarization optimized for lending documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `lendingPackageSampleGovCloud` <a name="lendingPackageSampleGovCloud" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a minimal configuration definition for GovCloud deployments.

This configuration demonstrates the "minimal override" pattern where only
GovCloud-compatible model IDs are specified, and all other settings
are inherited from system defaults at runtime.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `medicalRecordsSummarization` <a name="medicalRecordsSummarization" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.medicalRecordsSummarization"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.medicalRecordsSummarization(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for medical records summarization.

This configuration includes specialized prompts and settings for extracting
and summarizing key information from medical documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.medicalRecordsSummarization.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `ocrBenchmark` <a name="ocrBenchmark" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ocrBenchmark"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.ocrBenchmark(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for OCR benchmarking.

This configuration is designed for evaluating OCR performance
across different document types and quality levels.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ocrBenchmark.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `realkieFccVerified` <a name="realkieFccVerified" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.realkieFccVerified"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.realkieFccVerified(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for RealKIE FCC verified documents.

This configuration is optimized for processing FCC-verified documents
from the RealKIE dataset.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.realkieFccVerified.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `ruleExtraction` <a name="ruleExtraction" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleExtraction"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.ruleExtraction(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for rule extraction.

This configuration includes settings for extracting business rules
and validation criteria from documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleExtraction.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `ruleValidation` <a name="ruleValidation" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleValidation"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.ruleValidation(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for rule validation.

This configuration includes settings for validating documents
against extracted business rules and criteria.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.ruleValidation.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `rvlCdip` <a name="rvlCdip" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdip"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.rvlCdip(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for RVL-CDIP document classification.

This configuration is designed for the RVL-CDIP dataset, which contains
16 classes of document images for classification tasks.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdip.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `rvlCdipPackageSample` <a name="rvlCdipPackageSample" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSample"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSample(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for RVL-CDIP package sample processing.

This configuration includes settings for classification, extraction,
evaluation, and summarization optimized for RVL-CDIP documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `rvlCdipPackageSampleWithFewShotExamples` <a name="rvlCdipPackageSampleWithFewShotExamples" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSampleWithFewShotExamples"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSampleWithFewShotExamples(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for RVL-CDIP package sample with few-shot examples.

This configuration includes few-shot examples to improve classification and extraction
accuracy for RVL-CDIP documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipPackageSampleWithFewShotExamples.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---

##### `rvlCdipWithFewShotExamples` <a name="rvlCdipWithFewShotExamples" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples"></a>

```typescript
import { BedrockLlmProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bedrock-llm-processor'

BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples(options?: BedrockLlmProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition for RVL-CDIP with few-shot examples.

This configuration includes few-shot examples to improve classification
accuracy for RVL-CDIP documents.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationDefinitionOptions">BedrockLlmProcessorConfigurationDefinitionOptions</a>

Optional customization for processing stages.

---



### BedrockLlmProcessorConfigurationSchema <a name="BedrockLlmProcessorConfigurationSchema" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationSchema"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationSchema">IBedrockLlmProcessorConfigurationSchema</a>

Schema definition for Bedrock LLM processor configuration. Provides JSON Schema validation rules for the configuration UI and API.

This class defines the structure, validation rules, and UI presentation
for the Bedrock LLM processor configuration, including document classes,
attributes, classification settings, extraction parameters, evaluation
criteria, and summarization options.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationSchema.Initializer"></a>

```typescript
import { BedrockLlmProcessorConfigurationSchema } from '@cdklabs/genai-idp-bedrock-llm-processor'

new BedrockLlmProcessorConfigurationSchema()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationSchema.bind">bind</a></code> | Binds the configuration schema to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationSchema.bind"></a>

```typescript
public bind(processor: IBedrockLlmProcessor): void
```

Binds the configuration schema to a processor instance.

Creates a custom resource that updates the schema in the configuration table.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationSchema.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

The Bedrock LLM document processor to apply the schema to.

---




### Invokable <a name="Invokable" id="@cdklabs/genai-idp-bedrock-llm-processor.Invokable"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>

Unified wrapper for Bedrock models and Lambda functions that implements IInvokable.

Use the static factory methods to create instances:

*Example*

```typescript
// From a Bedrock model
const provider = Invokable.fromModel(model);

// From a Lambda function (LambdaHook)
const provider = Invokable.fromFunction(fn);
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

Bedrock LLM Processor uses custom extraction with Amazon Bedrock models for flexible
document processing. This processor provides more control over the extraction
process and is ideal for custom document types or complex extraction needs
that require fine-grained control over the processing workflow.

Use Bedrock LLM Processor when:
- Processing custom or complex document types not well-handled by BDA Processor
- You need more control over the extraction process and prompting
- You want to leverage foundation models directly with custom prompts
- You need to implement custom classification logic


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor.property.evaluationFunction">evaluationFunction</a></code> | <code>any</code> | The evaluation function if evaluation is enabled for this processor. |

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
public readonly evaluationFunction: any;
```

- *Type:* any

The evaluation function if evaluation is enabled for this processor.

The evaluation function is created by the ProcessingEnvironment when
evaluation baseline bucket and model are provided.

---

### IBedrockLlmProcessorConfiguration <a name="IBedrockLlmProcessorConfiguration" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfiguration">BedrockLlmProcessorConfiguration</a>, <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration">IBedrockLlmProcessorConfiguration</a>

Interface for Bedrock LLM document processor configuration.

Provides configuration management for custom extraction with Bedrock models.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind">bind</a></code> | Binds the configuration to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind"></a>

```typescript
public bind(processor: IBedrockLlmProcessor): IBedrockLlmProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

This method applies the configuration to the processor.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfiguration.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

The Bedrock LLM document processor to apply to.

---


### IBedrockLlmProcessorConfigurationDefinition <a name="IBedrockLlmProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition"></a>

- *Extends:* @cdklabs/genai-idp.IConfigurationDefinition

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition">IBedrockLlmProcessorConfigurationDefinition</a>


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationMethod">classificationMethod</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a></code> | The method used for document classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrBackend">ocrBackend</a></code> | <code>string</code> | OCR backend to use for text extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.assessmentInferenceProvider">assessmentInferenceProvider</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a></code> | Optional inference provider used for assessment. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationInferenceProvider">classificationInferenceProvider</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a></code> | The inference provider used for document classification. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.customPromptGenerator">customPromptGenerator</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Optional custom prompt generator Lambda function. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.evaluationModel">evaluationModel</a></code> | <code>@aws-cdk/aws-bedrock-alpha.IBedrockInvokable</code> | Optional invokable model used for evaluating extraction results. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.extractionInferenceProvider">extractionInferenceProvider</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a></code> | The inference provider used for information extraction. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrInferenceProvider">ocrInferenceProvider</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a></code> | Optional inference provider used for OCR when using Bedrock-based OCR. |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.summarizationInferenceProvider">summarizationInferenceProvider</a></code> | <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a></code> | Optional inference provider used for document summarization. |

---

##### `classificationMethod`<sup>Required</sup> <a name="classificationMethod" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationMethod"></a>

```typescript
public readonly classificationMethod: ClassificationMethod;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.ClassificationMethod">ClassificationMethod</a>
- *Default:* as defined in the definition file

The method used for document classification.

Determines how documents are analyzed and categorized before extraction.
Different methods offer varying levels of accuracy and performance.

---

##### `ocrBackend`<sup>Required</sup> <a name="ocrBackend" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrBackend"></a>

```typescript
public readonly ocrBackend: string;
```

- *Type:* string
- *Default:* "textract"

OCR backend to use for text extraction.

Determines whether to use Amazon Textract or Bedrock for OCR processing.

---

##### `assessmentInferenceProvider`<sup>Optional</sup> <a name="assessmentInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.assessmentInferenceProvider"></a>

```typescript
public readonly assessmentInferenceProvider: IInvokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>
- *Default:* as defined in the definition file

Optional inference provider used for assessment.

Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
wrapped via Invokable.fromFunction() (LambdaHook pattern).

---

##### `classificationInferenceProvider`<sup>Optional</sup> <a name="classificationInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.classificationInferenceProvider"></a>

```typescript
public readonly classificationInferenceProvider: IInvokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>
- *Default:* as defined in the definition file

The inference provider used for document classification.

Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
wrapped via Invokable.fromFunction() (LambdaHook pattern).

---

##### `customPromptGenerator`<sup>Optional</sup> <a name="customPromptGenerator" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.customPromptGenerator"></a>

```typescript
public readonly customPromptGenerator: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction
- *Default:* undefined

Optional custom prompt generator Lambda function.

When provided, this function will be invoked during extraction to customize prompts.
This is either the function provided via configuration options, or imported from
the ARN specified in the configuration file.

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IBedrockInvokable;
```

- *Type:* @aws-cdk/aws-bedrock-alpha.IBedrockInvokable
- *Default:* as defined in the definition file

Optional invokable model used for evaluating extraction results.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
Used to assess the quality and accuracy of extracted information by
comparing extraction results against expected values.

---

##### `extractionInferenceProvider`<sup>Optional</sup> <a name="extractionInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.extractionInferenceProvider"></a>

```typescript
public readonly extractionInferenceProvider: IInvokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>
- *Default:* as defined in the definition file

The inference provider used for information extraction.

Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
wrapped via Invokable.fromFunction() (LambdaHook pattern).

---

##### `ocrInferenceProvider`<sup>Optional</sup> <a name="ocrInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.ocrInferenceProvider"></a>

```typescript
public readonly ocrInferenceProvider: IInvokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>
- *Default:* as defined in the definition file

Optional inference provider used for OCR when using Bedrock-based OCR.

Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
wrapped via Invokable.fromFunction() (LambdaHook pattern).
Only used when the OCR backend is set to 'bedrock' in the configuration.

---

##### `summarizationInferenceProvider`<sup>Optional</sup> <a name="summarizationInferenceProvider" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationDefinition.property.summarizationInferenceProvider"></a>

```typescript
public readonly summarizationInferenceProvider: IInvokable;
```

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>
- *Default:* as defined in the definition file

Optional inference provider used for document summarization.

Can be a Bedrock model wrapped via Invokable.fromModel() or a Lambda function
wrapped via Invokable.fromFunction() (LambdaHook pattern).

---

### IBedrockLlmProcessorConfigurationSchema <a name="IBedrockLlmProcessorConfigurationSchema" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationSchema"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.BedrockLlmProcessorConfigurationSchema">BedrockLlmProcessorConfigurationSchema</a>, <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationSchema">IBedrockLlmProcessorConfigurationSchema</a>

Interface for Bedrock LLM configuration schema.

Defines the structure and validation rules for Bedrock LLM processor configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationSchema.bind">bind</a></code> | Binds the configuration schema to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationSchema.bind"></a>

```typescript
public bind(processor: IBedrockLlmProcessor): void
```

Binds the configuration schema to a processor instance.

This method applies the schema definition to the processor's configuration table.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessorConfigurationSchema.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IBedrockLlmProcessor">IBedrockLlmProcessor</a>

The Bedrock LLM document processor to apply the schema to.

---


### IInvokable <a name="IInvokable" id="@cdklabs/genai-idp-bedrock-llm-processor.IInvokable"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bedrock-llm-processor.Invokable">Invokable</a>, <a href="#@cdklabs/genai-idp-bedrock-llm-processor.IInvokable">IInvokable</a>

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

