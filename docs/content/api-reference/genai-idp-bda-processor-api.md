# @cdklabs/genai-idp-bda-processor

## Constructs <a name="Constructs" id="Constructs"></a>

### BdaMetadataTable <a name="BdaMetadataTable" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable">IBdaMetadataTable</a>

A DynamoDB table for storing BDA processing metadata.

This table uses a composite key (execution_id, record_number) to efficiently store
and query metadata about individual records processed by Bedrock Data Automation.
The table design supports tracking the processing status and results of each
document record within a BDA execution.

Key features:
- Partition key: execution_id (String) - identifies the BDA execution
- Sort key: record_number (Number) - identifies individual records within the execution
- TTL enabled with ExpiresAfter attribute for automatic cleanup
- Point-in-time recovery enabled for data protection
- KMS encryption for data security

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

new BdaMetadataTable(scope: Construct, id: string, props?: BdaMetadataTableProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps">BdaMetadataTableProps</a></code> | Configuration properties for the DynamoDB table. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps">BdaMetadataTableProps</a>

Configuration properties for the DynamoDB table.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the resource policy associated with this file system. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grant">grant</a></code> | Adds an IAM policy statement associated with this table to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantFullAccess">grantFullAccess</a></code> | Permits all DynamoDB operations ("dynamodb:*") to an IAM principal. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantReadData">grantReadData</a></code> | Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantReadWriteData">grantReadWriteData</a></code> | Permits an IAM principal to all data read/write operations to this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStream">grantStream</a></code> | Adds an IAM policy statement associated with this table's stream to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStreamRead">grantStreamRead</a></code> | Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantTableListStreams">grantTableListStreams</a></code> | Permits an IAM Principal to list streams attached to current dynamodb table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantWriteData">grantWriteData</a></code> | Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metric">metric</a></code> | Return the given named metric for this Table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConditionalCheckFailedRequests">metricConditionalCheckFailedRequests</a></code> | Metric for the conditional check failed requests this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConsumedReadCapacityUnits">metricConsumedReadCapacityUnits</a></code> | Metric for the consumed read capacity units this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConsumedWriteCapacityUnits">metricConsumedWriteCapacityUnits</a></code> | Metric for the consumed write capacity units this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSuccessfulRequestLatency">metricSuccessfulRequestLatency</a></code> | Metric for the successful request latency this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSystemErrors">metricSystemErrors</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSystemErrorsForOperations">metricSystemErrorsForOperations</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequests">metricThrottledRequests</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperation">metricThrottledRequestsForOperation</a></code> | How many requests are throttled on this table, for the given operation. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperations">metricThrottledRequestsForOperations</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricUserErrors">metricUserErrors</a></code> | Metric for the user errors. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addGlobalSecondaryIndex">addGlobalSecondaryIndex</a></code> | Add a global secondary index of table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addLocalSecondaryIndex">addLocalSecondaryIndex</a></code> | Add a local secondary index of table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexReadCapacity">autoScaleGlobalSecondaryIndexReadCapacity</a></code> | Enable read capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexWriteCapacity">autoScaleGlobalSecondaryIndexWriteCapacity</a></code> | Enable write capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleReadCapacity">autoScaleReadCapacity</a></code> | Enable read capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleWriteCapacity">autoScaleWriteCapacity</a></code> | Enable write capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.schema">schema</a></code> | Get schema attributes of table or index. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.applyRemovalPolicy"></a>

```typescript
public applyRemovalPolicy(policy: RemovalPolicy): void
```

Apply the given removal policy to this resource.

The Removal Policy controls what happens to this resource when it stops
being managed by CloudFormation, either because you've removed it from the
CDK application or because you've made a change that requires the resource
to be replaced.

The resource can be deleted (`RemovalPolicy.DESTROY`), or left in your AWS
account for data recovery and cleanup later (`RemovalPolicy.RETAIN`).

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(statement: PolicyStatement): AddToResourcePolicyResult
```

Adds a statement to the resource policy associated with this file system.

A resource policy will be automatically created upon the first call to `addToResourcePolicy`.

Note that this does not work with imported file systems.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addToResourcePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The policy statement to add.

---

##### `grant` <a name="grant" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grant"></a>

```typescript
public grant(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grant.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:PutItem", "dynamodb:GetItem", ...).

---

##### `grantFullAccess` <a name="grantFullAccess" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantFullAccess"></a>

```typescript
public grantFullAccess(grantee: IGrantable): Grant
```

Permits all DynamoDB operations ("dynamodb:*") to an IAM principal.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantFullAccess.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadData` <a name="grantReadData" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantReadData"></a>

```typescript
public grantReadData(grantee: IGrantable): Grant
```

Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantReadData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadWriteData` <a name="grantReadWriteData" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantReadWriteData"></a>

```typescript
public grantReadWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal to all data read/write operations to this table.

BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan,
BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantReadWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantStream` <a name="grantStream" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStream"></a>

```typescript
public grantStream(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table's stream to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStream.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStream.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:DescribeStream", "dynamodb:GetRecords", ...).

---

##### `grantStreamRead` <a name="grantStreamRead" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStreamRead"></a>

```typescript
public grantStreamRead(grantee: IGrantable): Grant
```

Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantStreamRead.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantTableListStreams` <a name="grantTableListStreams" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantTableListStreams"></a>

```typescript
public grantTableListStreams(grantee: IGrantable): Grant
```

Permits an IAM Principal to list streams attached to current dynamodb table.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantTableListStreams.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

##### `grantWriteData` <a name="grantWriteData" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantWriteData"></a>

```typescript
public grantWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.grantWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConditionalCheckFailedRequests` <a name="metricConditionalCheckFailedRequests" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConditionalCheckFailedRequests"></a>

```typescript
public metricConditionalCheckFailedRequests(props?: MetricOptions): Metric
```

Metric for the conditional check failed requests this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConditionalCheckFailedRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedReadCapacityUnits` <a name="metricConsumedReadCapacityUnits" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConsumedReadCapacityUnits"></a>

```typescript
public metricConsumedReadCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed read capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConsumedReadCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedWriteCapacityUnits` <a name="metricConsumedWriteCapacityUnits" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConsumedWriteCapacityUnits"></a>

```typescript
public metricConsumedWriteCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed write capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricConsumedWriteCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSuccessfulRequestLatency` <a name="metricSuccessfulRequestLatency" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSuccessfulRequestLatency"></a>

```typescript
public metricSuccessfulRequestLatency(props?: MetricOptions): Metric
```

Metric for the successful request latency this table.

By default, the metric will be calculated as an average over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSuccessfulRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### ~~`metricSystemErrors`~~ <a name="metricSystemErrors" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSystemErrors"></a>

```typescript
public metricSystemErrors(props?: MetricOptions): Metric
```

Metric for the system errors this table.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSystemErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSystemErrorsForOperations` <a name="metricSystemErrorsForOperations" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSystemErrorsForOperations"></a>

```typescript
public metricSystemErrorsForOperations(props?: SystemErrorsForOperationsMetricOptions): IMetric
```

Metric for the system errors this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricSystemErrorsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.SystemErrorsForOperationsMetricOptions

---

##### ~~`metricThrottledRequests`~~ <a name="metricThrottledRequests" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequests"></a>

```typescript
public metricThrottledRequests(props?: MetricOptions): Metric
```

How many requests are throttled on this table.

Default: sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperation` <a name="metricThrottledRequestsForOperation" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperation"></a>

```typescript
public metricThrottledRequestsForOperation(operation: string, props?: MetricOptions): Metric
```

How many requests are throttled on this table, for the given operation.

Default: sum over 5 minutes

###### `operation`<sup>Required</sup> <a name="operation" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperation.parameter.operation"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperation.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperations` <a name="metricThrottledRequestsForOperations" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperations"></a>

```typescript
public metricThrottledRequestsForOperations(props?: OperationsMetricOptions): IMetric
```

How many requests are throttled on this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricThrottledRequestsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.OperationsMetricOptions

---

##### `metricUserErrors` <a name="metricUserErrors" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricUserErrors"></a>

```typescript
public metricUserErrors(props?: MetricOptions): Metric
```

Metric for the user errors.

Note that this metric reports user errors across all
the tables in the account and region the table resides in.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.metricUserErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addGlobalSecondaryIndex` <a name="addGlobalSecondaryIndex" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addGlobalSecondaryIndex"></a>

```typescript
public addGlobalSecondaryIndex(props: GlobalSecondaryIndexProps): void
```

Add a global secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addGlobalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexProps

the property of global secondary index.

---

##### `addLocalSecondaryIndex` <a name="addLocalSecondaryIndex" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addLocalSecondaryIndex"></a>

```typescript
public addLocalSecondaryIndex(props: LocalSecondaryIndexProps): void
```

Add a local secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.addLocalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps

the property of local secondary index.

---

##### `autoScaleGlobalSecondaryIndexReadCapacity` <a name="autoScaleGlobalSecondaryIndexReadCapacity" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexReadCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexReadCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleGlobalSecondaryIndexWriteCapacity` <a name="autoScaleGlobalSecondaryIndexWriteCapacity" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexWriteCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexWriteCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleReadCapacity` <a name="autoScaleReadCapacity" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleReadCapacity"></a>

```typescript
public autoScaleReadCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleWriteCapacity` <a name="autoScaleWriteCapacity" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleWriteCapacity"></a>

```typescript
public autoScaleWriteCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.autoScaleWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `schema` <a name="schema" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.schema"></a>

```typescript
public schema(indexName?: string): SchemaOptions
```

Get schema attributes of table or index.

###### `indexName`<sup>Optional</sup> <a name="indexName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.schema.parameter.indexName"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableArn">fromTableArn</a></code> | Creates a Table construct that represents an external table via table arn. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableAttributes">fromTableAttributes</a></code> | Creates a Table construct that represents an external table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableName">fromTableName</a></code> | Creates a Table construct that represents an external table via table name. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isConstruct"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

BdaMetadataTable.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isOwnedResource"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

BdaMetadataTable.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isResource"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

BdaMetadataTable.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromTableArn` <a name="fromTableArn" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableArn"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

BdaMetadataTable.fromTableArn(scope: Construct, id: string, tableArn: string)
```

Creates a Table construct that represents an external table via table arn.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableArn.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableArn.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableArn.parameter.tableArn"></a>

- *Type:* string

The table's ARN.

---

##### `fromTableAttributes` <a name="fromTableAttributes" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableAttributes"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

BdaMetadataTable.fromTableAttributes(scope: Construct, id: string, attrs: TableAttributes)
```

Creates a Table construct that represents an external table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableAttributes.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.TableAttributes

A `TableAttributes` object.

---

##### `fromTableName` <a name="fromTableName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableName"></a>

```typescript
import { BdaMetadataTable } from '@cdklabs/genai-idp-bda-processor'

BdaMetadataTable.fromTableName(scope: Construct, id: string, tableName: string)
```

Creates a Table construct that represents an external table via table name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableName.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableName.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.fromTableName.parameter.tableName"></a>

- *Type:* string

The table's name.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | KMS encryption key, if this table uses a customer-managed encryption key. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.resourcePolicy">resourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | Resource policy to assign to DynamoDB Table. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

KMS encryption key, if this table uses a customer-managed encryption key.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

##### `resourcePolicy`<sup>Optional</sup> <a name="resourcePolicy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.resourcePolicy"></a>

```typescript
public readonly resourcePolicy: PolicyDocument;
```

- *Type:* aws-cdk-lib.aws_iam.PolicyDocument
- *Default:* No resource policy statements are added to the created table.

Resource policy to assign to DynamoDB Table.

> [https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-resourcepolicy.html](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-properties-dynamodb-table-resourcepolicy.html)

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTable.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### BdaProcessor <a name="BdaProcessor" id="@cdklabs/genai-idp-bda-processor.BdaProcessor"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

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
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsFailed">metricBdaJobsFailed</a></code> | Creates a CloudWatch metric for failed BDA jobs. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsSucceeded">metricBdaJobsSucceeded</a></code> | Creates a CloudWatch metric for successful BDA jobs. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsTotal">metricBdaJobsTotal</a></code> | Creates a CloudWatch metric for total BDA jobs. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestLatency">metricBdaRequestLatency</a></code> | Creates a CloudWatch metric for BDA request latency. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsFailed">metricBdaRequestsFailed</a></code> | Creates a CloudWatch metric for failed BDA requests. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsMaxRetriesExceeded">metricBdaRequestsMaxRetriesExceeded</a></code> | Creates a CloudWatch metric for BDA requests that exceeded max retries. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsNonRetryableErrors">metricBdaRequestsNonRetryableErrors</a></code> | Creates a CloudWatch metric for BDA non-retryable errors. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsRetrySuccess">metricBdaRequestsRetrySuccess</a></code> | Creates a CloudWatch metric for successful BDA request retries. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsSucceeded">metricBdaRequestsSucceeded</a></code> | Creates a CloudWatch metric for successful BDA requests. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsThrottles">metricBdaRequestsThrottles</a></code> | Creates a CloudWatch metric for BDA request throttles. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsTotal">metricBdaRequestsTotal</a></code> | Creates a CloudWatch metric for total BDA requests. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsTotalLatency">metricBdaRequestsTotalLatency</a></code> | Creates a CloudWatch metric for total BDA request latency. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsUnexpectedErrors">metricBdaRequestsUnexpectedErrors</a></code> | Creates a CloudWatch metric for BDA unexpected errors. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedCustomPages">metricProcessedCustomPages</a></code> | Creates a CloudWatch metric for processed custom pages. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedDocuments">metricProcessedDocuments</a></code> | Creates a CloudWatch metric for processed documents. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedPages">metricProcessedPages</a></code> | Creates a CloudWatch metric for processed pages. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedStandardPages">metricProcessedStandardPages</a></code> | Creates a CloudWatch metric for processed standard pages. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `metricBdaJobsFailed` <a name="metricBdaJobsFailed" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsFailed"></a>

```typescript
public metricBdaJobsFailed(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for failed BDA jobs.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaJobsSucceeded` <a name="metricBdaJobsSucceeded" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsSucceeded"></a>

```typescript
public metricBdaJobsSucceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for successful BDA jobs.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaJobsTotal` <a name="metricBdaJobsTotal" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsTotal"></a>

```typescript
public metricBdaJobsTotal(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total BDA jobs.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaJobsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestLatency` <a name="metricBdaRequestLatency" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestLatency"></a>

```typescript
public metricBdaRequestLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for BDA request latency.

Measures individual request processing time.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsFailed` <a name="metricBdaRequestsFailed" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsFailed"></a>

```typescript
public metricBdaRequestsFailed(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for failed BDA requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsFailed.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsMaxRetriesExceeded` <a name="metricBdaRequestsMaxRetriesExceeded" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsMaxRetriesExceeded"></a>

```typescript
public metricBdaRequestsMaxRetriesExceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for BDA requests that exceeded max retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsMaxRetriesExceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsNonRetryableErrors` <a name="metricBdaRequestsNonRetryableErrors" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsNonRetryableErrors"></a>

```typescript
public metricBdaRequestsNonRetryableErrors(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for BDA non-retryable errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsNonRetryableErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsRetrySuccess` <a name="metricBdaRequestsRetrySuccess" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsRetrySuccess"></a>

```typescript
public metricBdaRequestsRetrySuccess(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for successful BDA request retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsRetrySuccess.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsSucceeded` <a name="metricBdaRequestsSucceeded" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsSucceeded"></a>

```typescript
public metricBdaRequestsSucceeded(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for successful BDA requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsSucceeded.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsThrottles` <a name="metricBdaRequestsThrottles" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsThrottles"></a>

```typescript
public metricBdaRequestsThrottles(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for BDA request throttles.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsTotal` <a name="metricBdaRequestsTotal" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsTotal"></a>

```typescript
public metricBdaRequestsTotal(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total BDA requests.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsTotal.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsTotalLatency` <a name="metricBdaRequestsTotalLatency" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsTotalLatency"></a>

```typescript
public metricBdaRequestsTotalLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total BDA request latency.

Measures total request processing time including retries.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsTotalLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricBdaRequestsUnexpectedErrors` <a name="metricBdaRequestsUnexpectedErrors" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsUnexpectedErrors"></a>

```typescript
public metricBdaRequestsUnexpectedErrors(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for BDA unexpected errors.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricBdaRequestsUnexpectedErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricProcessedCustomPages` <a name="metricProcessedCustomPages" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedCustomPages"></a>

```typescript
public metricProcessedCustomPages(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for processed custom pages.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedCustomPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricProcessedDocuments` <a name="metricProcessedDocuments" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedDocuments"></a>

```typescript
public metricProcessedDocuments(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for processed documents.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedDocuments.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricProcessedPages` <a name="metricProcessedPages" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedPages"></a>

```typescript
public metricProcessedPages(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for processed pages.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricProcessedStandardPages` <a name="metricProcessedStandardPages" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedStandardPages"></a>

```typescript
public metricProcessedStandardPages(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for processed standard pages.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp-bda-processor.BdaProcessor.metricProcessedStandardPages.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

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
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |

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


## Structs <a name="Structs" id="Structs"></a>

### BdaMetadataTableProps <a name="BdaMetadataTableProps" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps"></a>

Properties for the BDA Metadata Table.

Uses the same FixedKeyTableProps pattern as other tables in the genai-idp package.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.Initializer"></a>

```typescript
import { BdaMetadataTableProps } from '@cdklabs/genai-idp-bda-processor'

const bdaMetadataTableProps: BdaMetadataTableProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.billingMode">billingMode</a></code> | <code>aws-cdk-lib.aws_dynamodb.BillingMode</code> | Specify how you are charged for read and write throughput and how you manage capacity. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.contributorInsightsEnabled">contributorInsightsEnabled</a></code> | <code>boolean</code> | Whether CloudWatch contributor insights is enabled. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.deletionProtection">deletionProtection</a></code> | <code>boolean</code> | Enables deletion protection for the table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.encryption">encryption</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableEncryption</code> | Whether server-side encryption with an AWS managed customer master key is enabled. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | External KMS key to use for table encryption. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.importSource">importSource</a></code> | <code>aws-cdk-lib.aws_dynamodb.ImportSourceSpecification</code> | The properties of data being imported from the S3 bucket source to the table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.kinesisPrecisionTimestamp">kinesisPrecisionTimestamp</a></code> | <code>aws-cdk-lib.aws_dynamodb.ApproximateCreationDateTimePrecision</code> | Kinesis Data Stream approximate creation timestamp precision. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.kinesisStream">kinesisStream</a></code> | <code>aws-cdk-lib.aws_kinesis.IStream</code> | Kinesis Data Stream to capture item-level changes for the table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.maxReadRequestUnits">maxReadRequestUnits</a></code> | <code>number</code> | The maximum read request units for the table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.maxWriteRequestUnits">maxWriteRequestUnits</a></code> | <code>number</code> | The write request units for the table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.pointInTimeRecovery">pointInTimeRecovery</a></code> | <code>boolean</code> | Whether point-in-time recovery is enabled. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.pointInTimeRecoverySpecification">pointInTimeRecoverySpecification</a></code> | <code>aws-cdk-lib.aws_dynamodb.PointInTimeRecoverySpecification</code> | Whether point-in-time recovery is enabled and recoveryPeriodInDays is set. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.readCapacity">readCapacity</a></code> | <code>number</code> | The read capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The removal policy to apply to the DynamoDB Table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.replicaRemovalPolicy">replicaRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The removal policy to apply to the DynamoDB replica tables. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.replicationRegions">replicationRegions</a></code> | <code>string[]</code> | Regions where replica tables will be created. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.replicationTimeout">replicationTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout for a table replication operation in a single region. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.resourcePolicy">resourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | Resource policy to assign to table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.stream">stream</a></code> | <code>aws-cdk-lib.aws_dynamodb.StreamViewType</code> | When an item in the table is modified, StreamViewType determines what information is written to the stream for this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.tableClass">tableClass</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableClass</code> | Specify the table class. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.tableName">tableName</a></code> | <code>string</code> | Enforces a particular physical table name. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.waitForReplicationToFinish">waitForReplicationToFinish</a></code> | <code>boolean</code> | [WARNING: Use this flag with caution, misusing this flag may cause deleting existing replicas, refer to the detailed documentation for more information] Indicates whether CloudFormation stack waits for replication to finish. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.warmThroughput">warmThroughput</a></code> | <code>aws-cdk-lib.aws_dynamodb.WarmThroughput</code> | Specify values to pre-warm you DynamoDB Table Warm Throughput feature is not available for Global Table replicas using the `Table` construct. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.writeCapacity">writeCapacity</a></code> | <code>number</code> | The write capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput. |

---

##### `billingMode`<sup>Optional</sup> <a name="billingMode" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.billingMode"></a>

```typescript
public readonly billingMode: BillingMode;
```

- *Type:* aws-cdk-lib.aws_dynamodb.BillingMode
- *Default:* PROVISIONED if `replicationRegions` is not specified, PAY_PER_REQUEST otherwise

Specify how you are charged for read and write throughput and how you manage capacity.

---

##### `contributorInsightsEnabled`<sup>Optional</sup> <a name="contributorInsightsEnabled" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.contributorInsightsEnabled"></a>

```typescript
public readonly contributorInsightsEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Whether CloudWatch contributor insights is enabled.

---

##### `deletionProtection`<sup>Optional</sup> <a name="deletionProtection" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.deletionProtection"></a>

```typescript
public readonly deletionProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Enables deletion protection for the table.

---

##### `encryption`<sup>Optional</sup> <a name="encryption" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.encryption"></a>

```typescript
public readonly encryption: TableEncryption;
```

- *Type:* aws-cdk-lib.aws_dynamodb.TableEncryption
- *Default:* The table is encrypted with an encryption key managed by DynamoDB, and you are not charged any fee for using it.

Whether server-side encryption with an AWS managed customer master key is enabled.

This property cannot be set if `serverSideEncryption` is set.

> **NOTE**: if you set this to `CUSTOMER_MANAGED` and `encryptionKey` is not
> specified, the key that the Tablet generates for you will be created with
> default permissions. If you are using CDKv2, these permissions will be
> sufficient to enable the key for use with DynamoDB tables.  If you are
> using CDKv1, make sure the feature flag
> `@aws-cdk/aws-kms:defaultKeyPolicies` is set to `true` in your `cdk.json`.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* If `encryption` is set to `TableEncryption.CUSTOMER_MANAGED` and this property is undefined, a new KMS key will be created and associated with this table. If `encryption` and this property are both undefined, then the table is encrypted with an encryption key managed by DynamoDB, and you are not charged any fee for using it.

External KMS key to use for table encryption.

This property can only be set if `encryption` is set to `TableEncryption.CUSTOMER_MANAGED`.

---

##### `importSource`<sup>Optional</sup> <a name="importSource" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.importSource"></a>

```typescript
public readonly importSource: ImportSourceSpecification;
```

- *Type:* aws-cdk-lib.aws_dynamodb.ImportSourceSpecification
- *Default:* no data import from the S3 bucket

The properties of data being imported from the S3 bucket source to the table.

---

##### `kinesisPrecisionTimestamp`<sup>Optional</sup> <a name="kinesisPrecisionTimestamp" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.kinesisPrecisionTimestamp"></a>

```typescript
public readonly kinesisPrecisionTimestamp: ApproximateCreationDateTimePrecision;
```

- *Type:* aws-cdk-lib.aws_dynamodb.ApproximateCreationDateTimePrecision
- *Default:* ApproximateCreationDateTimePrecision.MICROSECOND

Kinesis Data Stream approximate creation timestamp precision.

---

##### `kinesisStream`<sup>Optional</sup> <a name="kinesisStream" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.kinesisStream"></a>

```typescript
public readonly kinesisStream: IStream;
```

- *Type:* aws-cdk-lib.aws_kinesis.IStream
- *Default:* no Kinesis Data Stream

Kinesis Data Stream to capture item-level changes for the table.

---

##### `maxReadRequestUnits`<sup>Optional</sup> <a name="maxReadRequestUnits" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.maxReadRequestUnits"></a>

```typescript
public readonly maxReadRequestUnits: number;
```

- *Type:* number
- *Default:* on-demand throughput is disabled

The maximum read request units for the table.

Careful if you add Global Secondary Indexes, as
those will share the table's maximum on-demand throughput.

Can only be provided if billingMode is PAY_PER_REQUEST.

---

##### `maxWriteRequestUnits`<sup>Optional</sup> <a name="maxWriteRequestUnits" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.maxWriteRequestUnits"></a>

```typescript
public readonly maxWriteRequestUnits: number;
```

- *Type:* number
- *Default:* on-demand throughput is disabled

The write request units for the table.

Careful if you add Global Secondary Indexes, as
those will share the table's maximum on-demand throughput.

Can only be provided if billingMode is PAY_PER_REQUEST.

---

##### ~~`pointInTimeRecovery`~~<sup>Optional</sup> <a name="pointInTimeRecovery" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.pointInTimeRecovery"></a>

- *Deprecated:* use `pointInTimeRecoverySpecification` instead

```typescript
public readonly pointInTimeRecovery: boolean;
```

- *Type:* boolean
- *Default:* false - point in time recovery is not enabled.

Whether point-in-time recovery is enabled.

---

##### `pointInTimeRecoverySpecification`<sup>Optional</sup> <a name="pointInTimeRecoverySpecification" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.pointInTimeRecoverySpecification"></a>

```typescript
public readonly pointInTimeRecoverySpecification: PointInTimeRecoverySpecification;
```

- *Type:* aws-cdk-lib.aws_dynamodb.PointInTimeRecoverySpecification
- *Default:* point in time recovery is not enabled.

Whether point-in-time recovery is enabled and recoveryPeriodInDays is set.

---

##### `readCapacity`<sup>Optional</sup> <a name="readCapacity" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.readCapacity"></a>

```typescript
public readonly readCapacity: number;
```

- *Type:* number
- *Default:* 5

The read capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput.

Can only be provided if billingMode is Provisioned.

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.RETAIN

The removal policy to apply to the DynamoDB Table.

---

##### `replicaRemovalPolicy`<sup>Optional</sup> <a name="replicaRemovalPolicy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.replicaRemovalPolicy"></a>

```typescript
public readonly replicaRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* undefined - use DynamoDB Table's removal policy

The removal policy to apply to the DynamoDB replica tables.

---

##### `replicationRegions`<sup>Optional</sup> <a name="replicationRegions" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.replicationRegions"></a>

```typescript
public readonly replicationRegions: string[];
```

- *Type:* string[]
- *Default:* no replica tables are created

Regions where replica tables will be created.

---

##### `replicationTimeout`<sup>Optional</sup> <a name="replicationTimeout" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.replicationTimeout"></a>

```typescript
public readonly replicationTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(30)

The timeout for a table replication operation in a single region.

---

##### `resourcePolicy`<sup>Optional</sup> <a name="resourcePolicy" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.resourcePolicy"></a>

```typescript
public readonly resourcePolicy: PolicyDocument;
```

- *Type:* aws-cdk-lib.aws_iam.PolicyDocument
- *Default:* No resource policy statement

Resource policy to assign to table.

---

##### `stream`<sup>Optional</sup> <a name="stream" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.stream"></a>

```typescript
public readonly stream: StreamViewType;
```

- *Type:* aws-cdk-lib.aws_dynamodb.StreamViewType
- *Default:* streams are disabled unless `replicationRegions` is specified

When an item in the table is modified, StreamViewType determines what information is written to the stream for this table.

---

##### `tableClass`<sup>Optional</sup> <a name="tableClass" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.tableClass"></a>

```typescript
public readonly tableClass: TableClass;
```

- *Type:* aws-cdk-lib.aws_dynamodb.TableClass
- *Default:* STANDARD

Specify the table class.

---

##### `tableName`<sup>Optional</sup> <a name="tableName" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string
- *Default:* <generated>

Enforces a particular physical table name.

---

##### `waitForReplicationToFinish`<sup>Optional</sup> <a name="waitForReplicationToFinish" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.waitForReplicationToFinish"></a>

```typescript
public readonly waitForReplicationToFinish: boolean;
```

- *Type:* boolean
- *Default:* true

[WARNING: Use this flag with caution, misusing this flag may cause deleting existing replicas, refer to the detailed documentation for more information] Indicates whether CloudFormation stack waits for replication to finish.

If set to false, the CloudFormation resource will mark the resource as
created and replication will be completed asynchronously. This property is
ignored if replicationRegions property is not set.

WARNING:
DO NOT UNSET this property if adding/removing multiple replicationRegions
in one deployment, as CloudFormation only supports one region replication
at a time. CDK overcomes this limitation by waiting for replication to
finish before starting new replicationRegion.

If the custom resource which handles replication has a physical resource
ID with the format `region` instead of `tablename-region` (this would happen
if the custom resource hasn't received an event since v1.91.0), DO NOT SET
this property to false without making a change to the table name.
This will cause the existing replicas to be deleted.

---

##### `warmThroughput`<sup>Optional</sup> <a name="warmThroughput" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.warmThroughput"></a>

```typescript
public readonly warmThroughput: WarmThroughput;
```

- *Type:* aws-cdk-lib.aws_dynamodb.WarmThroughput
- *Default:* warm throughput is not configured

Specify values to pre-warm you DynamoDB Table Warm Throughput feature is not available for Global Table replicas using the `Table` construct.

To enable Warm Throughput, use the `TableV2` construct instead.

---

##### `writeCapacity`<sup>Optional</sup> <a name="writeCapacity" id="@cdklabs/genai-idp-bda-processor.BdaMetadataTableProps.property.writeCapacity"></a>

```typescript
public readonly writeCapacity: number;
```

- *Type:* number
- *Default:* 5

The write capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput.

Can only be provided if billingMode is Provisioned.

---

### BdaProcessorConfigurationDefinitionOptions <a name="BdaProcessorConfigurationDefinitionOptions" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions"></a>

Options for configuring the BDA processor configuration definition.

Allows customization of evaluation and summarization models and parameters.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.Initializer"></a>

```typescript
import { BdaProcessorConfigurationDefinitionOptions } from '@cdklabs/genai-idp-bda-processor'

const bdaProcessorConfigurationDefinitionOptions: BdaProcessorConfigurationDefinitionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.evaluationModel">evaluationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional configuration for the evaluation stage. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.summarizationModel">summarizationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional configuration for the summarization stage. |

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional configuration for the evaluation stage.

Defines the model and parameters used for evaluating extraction accuracy.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional configuration for the summarization stage.

Defines the model and parameters used for generating document summaries.

---

### BdaProcessorProps <a name="BdaProcessorProps" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps"></a>

Configuration properties for the BDA document processor.

BDA Processor uses Amazon Bedrock Data Automation for document processing,
providing a managed solution for extracting structured data from documents
with minimal custom code. This processor leverages Amazon Bedrock's pre-built
document processing capabilities through Data Automation projects.

BDA Processor is the simplest implementation path for common document types
that are well-supported by Amazon Bedrock's extraction capabilities.

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
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.dataAutomationProject">dataAutomationProject</a></code> | <code><a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject">IDataAutomationProject</a></code> | The Bedrock Data Automation Project used for document processing. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.enableHITL">enableHITL</a></code> | <code>boolean</code> | Enable Human In The Loop (HITL) review for documents with low confidence scores. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.evaluationBaselineBucket">evaluationBaselineBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional S3 bucket containing baseline evaluation data for model performance assessment. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.sageMakerA2IReviewPortalURL">sageMakerA2IReviewPortalURL</a></code> | <code>string</code> | URL for the SageMaker A2I review portal used for HITL tasks. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.summarizationGuardrail">summarizationGuardrail</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail</code> | Optional Bedrock guardrail to apply to summarization model interactions. |

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

Provides customization options for the processing workflow,
including schema definitions and evaluation settings.

---

##### `dataAutomationProject`<sup>Required</sup> <a name="dataAutomationProject" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.dataAutomationProject"></a>

```typescript
public readonly dataAutomationProject: IDataAutomationProject;
```

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject">IDataAutomationProject</a>

The Bedrock Data Automation Project used for document processing.

This project defines the document processing workflow in Amazon Bedrock,
including document types, extraction schemas, and processing rules.

---

##### `enableHITL`<sup>Optional</sup> <a name="enableHITL" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.enableHITL"></a>

```typescript
public readonly enableHITL: boolean;
```

- *Type:* boolean
- *Default:* false

Enable Human In The Loop (HITL) review for documents with low confidence scores.

When enabled, documents that fall below the confidence threshold will be
sent for human review before proceeding with the workflow.

---

##### `evaluationBaselineBucket`<sup>Optional</sup> <a name="evaluationBaselineBucket" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.evaluationBaselineBucket"></a>

```typescript
public readonly evaluationBaselineBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket
- *Default:* No evaluation baseline bucket is configured

Optional S3 bucket containing baseline evaluation data for model performance assessment.

Used to store reference documents and expected outputs for evaluating
the accuracy and quality of document processing results.

---

##### `sageMakerA2IReviewPortalURL`<sup>Optional</sup> <a name="sageMakerA2IReviewPortalURL" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.sageMakerA2IReviewPortalURL"></a>

```typescript
public readonly sageMakerA2IReviewPortalURL: string;
```

- *Type:* string
- *Default:* No review portal URL is provided

URL for the SageMaker A2I review portal used for HITL tasks.

This URL is provided to human reviewers to access documents that require
manual review and correction.

---

##### `summarizationGuardrail`<sup>Optional</sup> <a name="summarizationGuardrail" id="@cdklabs/genai-idp-bda-processor.BdaProcessorProps.property.summarizationGuardrail"></a>

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
public bind(processor: IBdaProcessor): IBdaProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

This method applies the configuration to the processor.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.fromFile">fromFile</a></code> | Creates a configuration from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSample">lendingPackageSample</a></code> | Creates a configuration for lending package processing. |

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

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfiguration.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional configuration options.

---



### BdaProcessorConfigurationDefinition <a name="BdaProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition"></a>

Configuration definition for BDA document processing.

Provides methods to create and customize configuration for Bedrock Data Automation processing.

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
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile">fromFile</a></code> | Creates a configuration definition from a YAML file. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSample">lendingPackageSample</a></code> | Creates a default configuration definition for BDA processing. |

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.fromFile(filePath: string, options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a configuration definition from a YAML file.

Allows users to provide custom configuration files for document processing.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.fromFile.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional customization for evaluation and summarization settings.

---

##### `lendingPackageSample` <a name="lendingPackageSample" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSample"></a>

```typescript
import { BdaProcessorConfigurationDefinition } from '@cdklabs/genai-idp-bda-processor'

BdaProcessorConfigurationDefinition.lendingPackageSample(options?: BdaProcessorConfigurationDefinitionOptions)
```

Creates a default configuration definition for BDA processing.

This configuration includes basic settings for evaluation and summarization
when using Bedrock Data Automation projects.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinition.lendingPackageSample.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationDefinitionOptions">BdaProcessorConfigurationDefinitionOptions</a>

Optional customization for evaluation and summarization settings.

---



### BdaProcessorConfigurationSchema <a name="BdaProcessorConfigurationSchema" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationSchema"></a>

- *Implements:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationSchema">IBdaProcessorConfigurationSchema</a>

Schema definition for BDA processor configuration. Provides JSON Schema validation rules for the configuration UI and API.

This class defines the structure, validation rules, and UI presentation
for the BDA processor configuration, including document classes, attributes,
evaluation settings, and summarization parameters.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationSchema.Initializer"></a>

```typescript
import { BdaProcessorConfigurationSchema } from '@cdklabs/genai-idp-bda-processor'

new BdaProcessorConfigurationSchema()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationSchema.bind">bind</a></code> | Binds the configuration schema to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationSchema.bind"></a>

```typescript
public bind(processor: IBdaProcessor): void
```

Binds the configuration schema to a processor instance.

Creates a custom resource that updates the schema in the configuration table.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationSchema.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

The BDA document processor to apply the schema to.

---




## Protocols <a name="Protocols" id="Protocols"></a>

### IBdaMetadataTable <a name="IBdaMetadataTable" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable"></a>

- *Extends:* aws-cdk-lib.aws_dynamodb.ITable

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.BdaMetadataTable">BdaMetadataTable</a>, <a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable">IBdaMetadataTable</a>

Interface for the BDA metadata table.

This table stores metadata about BDA (Bedrock Data Automation) processing records,
enabling tracking of individual document processing records within BDA jobs.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS encryption key associated with this table. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.env"></a>

```typescript
public readonly env: ResourceEnvironment;
```

- *Type:* aws-cdk-lib.ResourceEnvironment

The environment this resource belongs to.

For resources that are created and managed by the CDK
(generally, those created by creating new class instances like Role, Bucket, etc.),
this is always the same as the environment of the stack they belong to;
however, for imported resources
(those obtained from static methods like fromRoleArn, fromBucketName, etc.),
that might be different than the stack they were imported into.

---

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS encryption key associated with this table.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp-bda-processor.IBdaMetadataTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

### IBdaProcessor <a name="IBdaProcessor" id="@cdklabs/genai-idp-bda-processor.IBdaProcessor"></a>

- *Extends:* @cdklabs/genai-idp.IDocumentProcessor

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessor">BdaProcessor</a>, <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

Interface for BDA document processor implementation.

BDA Processor uses Amazon Bedrock Data Automation for document processing,
leveraging pre-built extraction capabilities for common document types.
This processor is ideal for standard documents with well-defined structures
and requires minimal custom code to implement.

Use BDA Processor when:
- Processing standard document types like invoices, receipts, or forms
- You need a managed solution with minimal custom code
- You want to leverage Amazon Bedrock's pre-built extraction capabilities


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.environment">environment</a></code> | <code>@cdklabs/genai-idp.IProcessingEnvironment</code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |

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
public bind(processor: IBdaProcessor): IBdaProcessorConfigurationDefinition
```

Binds the configuration to a processor instance.

This method applies the configuration to the processor.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfiguration.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

The BDA document processor to apply to.

---


### IBdaProcessorConfigurationDefinition <a name="IBdaProcessorConfigurationDefinition" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition"></a>

- *Extends:* @cdklabs/genai-idp.IConfigurationDefinition

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition">IBdaProcessorConfigurationDefinition</a>

Interface for BDA processor configuration definition.

Defines the structure and capabilities of configuration for Bedrock Data Automation processing.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.evaluationModel">evaluationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | The invokable model used for evaluating extraction results. |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.summarizationModel">summarizationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional invokable model used for document summarization. |

---

##### `evaluationModel`<sup>Required</sup> <a name="evaluationModel" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

The invokable model used for evaluating extraction results.

Used to assess the quality and accuracy of extracted information by
comparing extraction results against expected values.

---

##### `summarizationModel`<sup>Optional</sup> <a name="summarizationModel" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationDefinition.property.summarizationModel"></a>

```typescript
public readonly summarizationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

Optional invokable model used for document summarization.

When provided, enables automatic generation of document summaries
that capture key information from processed documents.

---

### IBdaProcessorConfigurationSchema <a name="IBdaProcessorConfigurationSchema" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationSchema"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.BdaProcessorConfigurationSchema">BdaProcessorConfigurationSchema</a>, <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationSchema">IBdaProcessorConfigurationSchema</a>

Interface for BDA configuration schema.

Defines the structure and validation rules for BDA processor configuration.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationSchema.bind">bind</a></code> | Binds the configuration schema to a processor instance. |

---

##### `bind` <a name="bind" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationSchema.bind"></a>

```typescript
public bind(processor: IBdaProcessor): void
```

Binds the configuration schema to a processor instance.

This method applies the schema definition to the processor's configuration table.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp-bda-processor.IBdaProcessorConfigurationSchema.bind.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp-bda-processor.IBdaProcessor">IBdaProcessor</a>

The BDA document processor to apply the schema to.

---


### IDataAutomationProject <a name="IDataAutomationProject" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject">IDataAutomationProject</a>

Interface representing an Amazon Bedrock Data Automation Project.

Data Automation Projects in Amazon Bedrock provide a managed way to extract
structured data from documents using foundation models. This interface allows
the IDP solution to work with existing Bedrock Data Automation Projects.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject.grantInvokeAsync">grantInvokeAsync</a></code> | *No description.* |

---

##### `grantInvokeAsync` <a name="grantInvokeAsync" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject.grantInvokeAsync"></a>

```typescript
public grantInvokeAsync(grantee: IGrantable): Grant
```

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject.grantInvokeAsync.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp-bda-processor.IDataAutomationProject.property.arn">arn</a></code> | <code>string</code> | The Amazon Resource Name (ARN) of the Bedrock Data Automation Project. |

---

##### `arn`<sup>Required</sup> <a name="arn" id="@cdklabs/genai-idp-bda-processor.IDataAutomationProject.property.arn"></a>

```typescript
public readonly arn: string;
```

- *Type:* string

The Amazon Resource Name (ARN) of the Bedrock Data Automation Project.

This ARN is used to invoke the project for document processing and is
referenced in IAM policies to grant appropriate permissions.

Format: arn:aws:bedrock:{region}:{account}:data-automation-project/{project-id}

---

