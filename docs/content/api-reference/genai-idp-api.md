# @cdklabs/genai-idp


## Constructs <a name="Constructs" id="Constructs"></a>

### CognitoUpdaterHitlFunction <a name="CognitoUpdaterHitlFunction" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction"></a>

- *Implements:* aws-cdk-lib.aws_lambda.IFunction

A Lambda function that updates Cognito configuration for HITL workflows.

This function resolves circular dependency issues between SageMaker A2I resources
and Cognito configuration by updating the Cognito User Pool Client with the
necessary settings for A2I integration after the workteam has been created.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

new CognitoUpdaterHitlFunction(scope: Construct, id: string, props: CognitoUpdaterHitlFunctionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps">CognitoUpdaterHitlFunctionProps</a></code> | Configuration properties for the function. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps">CognitoUpdaterHitlFunctionProps</a>

Configuration properties for the function.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeCompositePrincipal">grantInvokeCompositePrincipal</a></code> | Grant multiple principals the ability to invoke this Lambda via CompositePrincipal. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeLatestVersion">grantInvokeLatestVersion</a></code> | Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeVersion">grantInvokeVersion</a></code> | Grant the given identity permissions to invoke the given version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.invalidateVersionBasedOn">invalidateVersionBasedOn</a></code> | Mix additional information into the hash of the Version object. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeCompositePrincipal` <a name="grantInvokeCompositePrincipal" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeCompositePrincipal"></a>

```typescript
public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
```

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

###### `compositePrincipal`<sup>Required</sup> <a name="compositePrincipal" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeCompositePrincipal.parameter.compositePrincipal"></a>

- *Type:* aws-cdk-lib.aws_iam.CompositePrincipal

---

##### `grantInvokeLatestVersion` <a name="grantInvokeLatestVersion" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeLatestVersion"></a>

```typescript
public grantInvokeLatestVersion(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeLatestVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeVersion` <a name="grantInvokeVersion" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeVersion"></a>

```typescript
public grantInvokeVersion(grantee: IGrantable, version: IVersion): Grant
```

Grant the given identity permissions to invoke the given version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `version`<sup>Required</sup> <a name="version" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.grantInvokeVersion.parameter.version"></a>

- *Type:* aws-cdk-lib.aws_lambda.IVersion

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addAlias"></a>

```typescript
public addAlias(aliasName: string, options?: AliasOptions): Alias
```

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of
the function as it is being updated during a deployment.

```ts
declare const fn: lambda.Function;

fn.addAlias('Live');

// Is equivalent to

new lambda.Alias(this, 'AliasLive', {
  aliasName: 'Live',
  version: fn.currentVersion,
});
```

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addLayers"></a>

```typescript
public addLayers(layers: ...ILayerVersion[]): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.addLayers.parameter.layers"></a>

- *Type:* ...aws-cdk-lib.aws_lambda.ILayerVersion[]

the layers to be added.

---

##### `invalidateVersionBasedOn` <a name="invalidateVersionBasedOn" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.invalidateVersionBasedOn"></a>

```typescript
public invalidateVersionBasedOn(x: string): void
```

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new
Version when anything about the Function changes (its code, its layers,
any of the other properties).

However, you can sometimes source information from places that the CDK cannot
look into, like the deploy-time values of SSM parameters. In those cases,
the CDK would not force the creation of a new Version object when it actually
should.

This method can be used to invalidate the current Version object. Pass in
any string into this method, and make sure the string changes when you know
a new Version needs to be created.

This method may be called more than once.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.invalidateVersionBasedOn.parameter.x"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isConstruct"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isOwnedResource"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isResource"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.classifyVersionProperty"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionArn"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

For `Function.addPermissions()` to work on this imported lambda, make sure that is
in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionAttributes"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

For `Function.addPermissions()` to work on this imported lambda, set the sameEnvironment property to true
if this imported lambda is in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionName"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAll"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllConcurrentExecutions"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllDuration"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllErrors"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllInvocations"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllThrottles"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { CognitoUpdaterHitlFunction } from '@cdklabs/genai-idp'

CognitoUpdaterHitlFunction.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.latestVersion"></a>

```typescript
public readonly latestVersion: IVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.IVersion

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which
means the function this version refers to can return different results in
different invocations.

To obtain a reference to an explicit version which references the current
function configuration, use `lambdaFunction.currentVersion` instead.

---

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that
pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention
period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention
to never expire even if it was configured with a different value.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunction.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### ConcurrencyTable <a name="ConcurrencyTable" id="@cdklabs/genai-idp.ConcurrencyTable"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IConcurrencyTable">IConcurrencyTable</a>

A DynamoDB table for managing concurrency limits in document processing.

This construct creates a table with a custom resource that initializes
concurrency counters, allowing the system to control how many documents
are processed simultaneously to prevent resource exhaustion.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ConcurrencyTable.Initializer"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

new ConcurrencyTable(scope: Construct, id: string, props?: FixedKeyTableProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps">FixedKeyTableProps</a></code> | Configuration properties for the DynamoDB table. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConcurrencyTable.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConcurrencyTable.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.FixedKeyTableProps">FixedKeyTableProps</a>

Configuration properties for the DynamoDB table.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the resource policy associated with this file system. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grant">grant</a></code> | Adds an IAM policy statement associated with this table to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantFullAccess">grantFullAccess</a></code> | Permits all DynamoDB operations ("dynamodb:*") to an IAM principal. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantReadData">grantReadData</a></code> | Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantReadWriteData">grantReadWriteData</a></code> | Permits an IAM principal to all data read/write operations to this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantStream">grantStream</a></code> | Adds an IAM policy statement associated with this table's stream to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantStreamRead">grantStreamRead</a></code> | Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantTableListStreams">grantTableListStreams</a></code> | Permits an IAM Principal to list streams attached to current dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.grantWriteData">grantWriteData</a></code> | Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metric">metric</a></code> | Return the given named metric for this Table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricConditionalCheckFailedRequests">metricConditionalCheckFailedRequests</a></code> | Metric for the conditional check failed requests this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricConsumedReadCapacityUnits">metricConsumedReadCapacityUnits</a></code> | Metric for the consumed read capacity units this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricConsumedWriteCapacityUnits">metricConsumedWriteCapacityUnits</a></code> | Metric for the consumed write capacity units this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricSuccessfulRequestLatency">metricSuccessfulRequestLatency</a></code> | Metric for the successful request latency this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricSystemErrors">metricSystemErrors</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricSystemErrorsForOperations">metricSystemErrorsForOperations</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequests">metricThrottledRequests</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperation">metricThrottledRequestsForOperation</a></code> | How many requests are throttled on this table, for the given operation. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperations">metricThrottledRequestsForOperations</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.metricUserErrors">metricUserErrors</a></code> | Metric for the user errors. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.addGlobalSecondaryIndex">addGlobalSecondaryIndex</a></code> | Add a global secondary index of table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.addLocalSecondaryIndex">addLocalSecondaryIndex</a></code> | Add a local secondary index of table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexReadCapacity">autoScaleGlobalSecondaryIndexReadCapacity</a></code> | Enable read capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexWriteCapacity">autoScaleGlobalSecondaryIndexWriteCapacity</a></code> | Enable write capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.autoScaleReadCapacity">autoScaleReadCapacity</a></code> | Enable read capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.autoScaleWriteCapacity">autoScaleWriteCapacity</a></code> | Enable write capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.schema">schema</a></code> | Get schema attributes of table or index. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.ConcurrencyTable.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.ConcurrencyTable.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.ConcurrencyTable.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="@cdklabs/genai-idp.ConcurrencyTable.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(statement: PolicyStatement): AddToResourcePolicyResult
```

Adds a statement to the resource policy associated with this file system.

A resource policy will be automatically created upon the first call to `addToResourcePolicy`.

Note that this does not work with imported file systems.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.ConcurrencyTable.addToResourcePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The policy statement to add.

---

##### `grant` <a name="grant" id="@cdklabs/genai-idp.ConcurrencyTable.grant"></a>

```typescript
public grant(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.ConcurrencyTable.grant.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:PutItem", "dynamodb:GetItem", ...).

---

##### `grantFullAccess` <a name="grantFullAccess" id="@cdklabs/genai-idp.ConcurrencyTable.grantFullAccess"></a>

```typescript
public grantFullAccess(grantee: IGrantable): Grant
```

Permits all DynamoDB operations ("dynamodb:*") to an IAM principal.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantFullAccess.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadData` <a name="grantReadData" id="@cdklabs/genai-idp.ConcurrencyTable.grantReadData"></a>

```typescript
public grantReadData(grantee: IGrantable): Grant
```

Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantReadData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadWriteData` <a name="grantReadWriteData" id="@cdklabs/genai-idp.ConcurrencyTable.grantReadWriteData"></a>

```typescript
public grantReadWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal to all data read/write operations to this table.

BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan,
BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantReadWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantStream` <a name="grantStream" id="@cdklabs/genai-idp.ConcurrencyTable.grantStream"></a>

```typescript
public grantStream(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table's stream to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantStream.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.ConcurrencyTable.grantStream.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:DescribeStream", "dynamodb:GetRecords", ...).

---

##### `grantStreamRead` <a name="grantStreamRead" id="@cdklabs/genai-idp.ConcurrencyTable.grantStreamRead"></a>

```typescript
public grantStreamRead(grantee: IGrantable): Grant
```

Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantStreamRead.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantTableListStreams` <a name="grantTableListStreams" id="@cdklabs/genai-idp.ConcurrencyTable.grantTableListStreams"></a>

```typescript
public grantTableListStreams(grantee: IGrantable): Grant
```

Permits an IAM Principal to list streams attached to current dynamodb table.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantTableListStreams.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

##### `grantWriteData` <a name="grantWriteData" id="@cdklabs/genai-idp.ConcurrencyTable.grantWriteData"></a>

```typescript
public grantWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConcurrencyTable.grantWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.ConcurrencyTable.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.ConcurrencyTable.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConditionalCheckFailedRequests` <a name="metricConditionalCheckFailedRequests" id="@cdklabs/genai-idp.ConcurrencyTable.metricConditionalCheckFailedRequests"></a>

```typescript
public metricConditionalCheckFailedRequests(props?: MetricOptions): Metric
```

Metric for the conditional check failed requests this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricConditionalCheckFailedRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedReadCapacityUnits` <a name="metricConsumedReadCapacityUnits" id="@cdklabs/genai-idp.ConcurrencyTable.metricConsumedReadCapacityUnits"></a>

```typescript
public metricConsumedReadCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed read capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricConsumedReadCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedWriteCapacityUnits` <a name="metricConsumedWriteCapacityUnits" id="@cdklabs/genai-idp.ConcurrencyTable.metricConsumedWriteCapacityUnits"></a>

```typescript
public metricConsumedWriteCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed write capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricConsumedWriteCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSuccessfulRequestLatency` <a name="metricSuccessfulRequestLatency" id="@cdklabs/genai-idp.ConcurrencyTable.metricSuccessfulRequestLatency"></a>

```typescript
public metricSuccessfulRequestLatency(props?: MetricOptions): Metric
```

Metric for the successful request latency this table.

By default, the metric will be calculated as an average over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricSuccessfulRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### ~~`metricSystemErrors`~~ <a name="metricSystemErrors" id="@cdklabs/genai-idp.ConcurrencyTable.metricSystemErrors"></a>

```typescript
public metricSystemErrors(props?: MetricOptions): Metric
```

Metric for the system errors this table.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricSystemErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSystemErrorsForOperations` <a name="metricSystemErrorsForOperations" id="@cdklabs/genai-idp.ConcurrencyTable.metricSystemErrorsForOperations"></a>

```typescript
public metricSystemErrorsForOperations(props?: SystemErrorsForOperationsMetricOptions): IMetric
```

Metric for the system errors this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricSystemErrorsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.SystemErrorsForOperationsMetricOptions

---

##### ~~`metricThrottledRequests`~~ <a name="metricThrottledRequests" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequests"></a>

```typescript
public metricThrottledRequests(props?: MetricOptions): Metric
```

How many requests are throttled on this table.

Default: sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperation` <a name="metricThrottledRequestsForOperation" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperation"></a>

```typescript
public metricThrottledRequestsForOperation(operation: string, props?: MetricOptions): Metric
```

How many requests are throttled on this table, for the given operation.

Default: sum over 5 minutes

###### `operation`<sup>Required</sup> <a name="operation" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperation.parameter.operation"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperation.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperations` <a name="metricThrottledRequestsForOperations" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperations"></a>

```typescript
public metricThrottledRequestsForOperations(props?: OperationsMetricOptions): IMetric
```

How many requests are throttled on this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricThrottledRequestsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.OperationsMetricOptions

---

##### `metricUserErrors` <a name="metricUserErrors" id="@cdklabs/genai-idp.ConcurrencyTable.metricUserErrors"></a>

```typescript
public metricUserErrors(props?: MetricOptions): Metric
```

Metric for the user errors.

Note that this metric reports user errors across all
the tables in the account and region the table resides in.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.metricUserErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addGlobalSecondaryIndex` <a name="addGlobalSecondaryIndex" id="@cdklabs/genai-idp.ConcurrencyTable.addGlobalSecondaryIndex"></a>

```typescript
public addGlobalSecondaryIndex(props: GlobalSecondaryIndexProps): void
```

Add a global secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.addGlobalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexProps

the property of global secondary index.

---

##### `addLocalSecondaryIndex` <a name="addLocalSecondaryIndex" id="@cdklabs/genai-idp.ConcurrencyTable.addLocalSecondaryIndex"></a>

```typescript
public addLocalSecondaryIndex(props: LocalSecondaryIndexProps): void
```

Add a local secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.addLocalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps

the property of local secondary index.

---

##### `autoScaleGlobalSecondaryIndexReadCapacity` <a name="autoScaleGlobalSecondaryIndexReadCapacity" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexReadCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexReadCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleGlobalSecondaryIndexWriteCapacity` <a name="autoScaleGlobalSecondaryIndexWriteCapacity" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexWriteCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexWriteCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleReadCapacity` <a name="autoScaleReadCapacity" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleReadCapacity"></a>

```typescript
public autoScaleReadCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleWriteCapacity` <a name="autoScaleWriteCapacity" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleWriteCapacity"></a>

```typescript
public autoScaleWriteCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConcurrencyTable.autoScaleWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `schema` <a name="schema" id="@cdklabs/genai-idp.ConcurrencyTable.schema"></a>

```typescript
public schema(indexName?: string): SchemaOptions
```

Get schema attributes of table or index.

###### `indexName`<sup>Optional</sup> <a name="indexName" id="@cdklabs/genai-idp.ConcurrencyTable.schema.parameter.indexName"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.fromTableArn">fromTableArn</a></code> | Creates a Table construct that represents an external table via table arn. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.fromTableAttributes">fromTableAttributes</a></code> | Creates a Table construct that represents an external table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.fromTableName">fromTableName</a></code> | Creates a Table construct that represents an external table via table name. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.ConcurrencyTable.isConstruct"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

ConcurrencyTable.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.ConcurrencyTable.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.ConcurrencyTable.isOwnedResource"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

ConcurrencyTable.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ConcurrencyTable.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.ConcurrencyTable.isResource"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

ConcurrencyTable.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ConcurrencyTable.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromTableArn` <a name="fromTableArn" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableArn"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

ConcurrencyTable.fromTableArn(scope: Construct, id: string, tableArn: string)
```

Creates a Table construct that represents an external table via table arn.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableArn.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableArn.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableArn.parameter.tableArn"></a>

- *Type:* string

The table's ARN.

---

##### `fromTableAttributes` <a name="fromTableAttributes" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableAttributes"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

ConcurrencyTable.fromTableAttributes(scope: Construct, id: string, attrs: TableAttributes)
```

Creates a Table construct that represents an external table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableAttributes.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.TableAttributes

A `TableAttributes` object.

---

##### `fromTableName` <a name="fromTableName" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableName"></a>

```typescript
import { ConcurrencyTable } from '@cdklabs/genai-idp'

ConcurrencyTable.fromTableName(scope: Construct, id: string, tableName: string)
```

Creates a Table construct that represents an external table via table name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableName.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableName.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.ConcurrencyTable.fromTableName.parameter.tableName"></a>

- *Type:* string

The table's name.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | KMS encryption key, if this table uses a customer-managed encryption key. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.resourcePolicy">resourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | Resource policy to assign to DynamoDB Table. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.ConcurrencyTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.ConcurrencyTable.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.ConcurrencyTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.ConcurrencyTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.ConcurrencyTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.ConcurrencyTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

KMS encryption key, if this table uses a customer-managed encryption key.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp.ConcurrencyTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

##### `resourcePolicy`<sup>Optional</sup> <a name="resourcePolicy" id="@cdklabs/genai-idp.ConcurrencyTable.property.resourcePolicy"></a>

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
| <code><a href="#@cdklabs/genai-idp.ConcurrencyTable.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.ConcurrencyTable.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### ConfigurationTable <a name="ConfigurationTable" id="@cdklabs/genai-idp.ConfigurationTable"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

A DynamoDB table for storing configuration settings for the document processing solution.

This table uses a fixed partition key "Configuration" to store various configuration
items such as extraction schemas, evaluation settings, and system parameters.
It provides a centralized location for managing configuration that can be
accessed by multiple components of the solution.

Configuration items stored in this table can include:
- Document extraction schemas and templates
- Model parameters and prompt configurations
- Evaluation criteria and thresholds
- UI settings and customizations
- Processing workflow configurations

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ConfigurationTable.Initializer"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

new ConfigurationTable(scope: Construct, id: string, props?: FixedKeyTableProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps">FixedKeyTableProps</a></code> | Configuration properties for the DynamoDB table. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConfigurationTable.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConfigurationTable.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.FixedKeyTableProps">FixedKeyTableProps</a>

Configuration properties for the DynamoDB table.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the resource policy associated with this file system. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grant">grant</a></code> | Adds an IAM policy statement associated with this table to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantFullAccess">grantFullAccess</a></code> | Permits all DynamoDB operations ("dynamodb:*") to an IAM principal. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantReadData">grantReadData</a></code> | Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantReadWriteData">grantReadWriteData</a></code> | Permits an IAM principal to all data read/write operations to this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantStream">grantStream</a></code> | Adds an IAM policy statement associated with this table's stream to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantStreamRead">grantStreamRead</a></code> | Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantTableListStreams">grantTableListStreams</a></code> | Permits an IAM Principal to list streams attached to current dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.grantWriteData">grantWriteData</a></code> | Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metric">metric</a></code> | Return the given named metric for this Table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricConditionalCheckFailedRequests">metricConditionalCheckFailedRequests</a></code> | Metric for the conditional check failed requests this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricConsumedReadCapacityUnits">metricConsumedReadCapacityUnits</a></code> | Metric for the consumed read capacity units this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricConsumedWriteCapacityUnits">metricConsumedWriteCapacityUnits</a></code> | Metric for the consumed write capacity units this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricSuccessfulRequestLatency">metricSuccessfulRequestLatency</a></code> | Metric for the successful request latency this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricSystemErrors">metricSystemErrors</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricSystemErrorsForOperations">metricSystemErrorsForOperations</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequests">metricThrottledRequests</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperation">metricThrottledRequestsForOperation</a></code> | How many requests are throttled on this table, for the given operation. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperations">metricThrottledRequestsForOperations</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.metricUserErrors">metricUserErrors</a></code> | Metric for the user errors. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.addGlobalSecondaryIndex">addGlobalSecondaryIndex</a></code> | Add a global secondary index of table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.addLocalSecondaryIndex">addLocalSecondaryIndex</a></code> | Add a local secondary index of table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexReadCapacity">autoScaleGlobalSecondaryIndexReadCapacity</a></code> | Enable read capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexWriteCapacity">autoScaleGlobalSecondaryIndexWriteCapacity</a></code> | Enable write capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.autoScaleReadCapacity">autoScaleReadCapacity</a></code> | Enable read capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.autoScaleWriteCapacity">autoScaleWriteCapacity</a></code> | Enable write capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.schema">schema</a></code> | Get schema attributes of table or index. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.ConfigurationTable.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.ConfigurationTable.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.ConfigurationTable.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="@cdklabs/genai-idp.ConfigurationTable.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(statement: PolicyStatement): AddToResourcePolicyResult
```

Adds a statement to the resource policy associated with this file system.

A resource policy will be automatically created upon the first call to `addToResourcePolicy`.

Note that this does not work with imported file systems.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.ConfigurationTable.addToResourcePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The policy statement to add.

---

##### `grant` <a name="grant" id="@cdklabs/genai-idp.ConfigurationTable.grant"></a>

```typescript
public grant(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.ConfigurationTable.grant.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:PutItem", "dynamodb:GetItem", ...).

---

##### `grantFullAccess` <a name="grantFullAccess" id="@cdklabs/genai-idp.ConfigurationTable.grantFullAccess"></a>

```typescript
public grantFullAccess(grantee: IGrantable): Grant
```

Permits all DynamoDB operations ("dynamodb:*") to an IAM principal.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantFullAccess.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadData` <a name="grantReadData" id="@cdklabs/genai-idp.ConfigurationTable.grantReadData"></a>

```typescript
public grantReadData(grantee: IGrantable): Grant
```

Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantReadData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadWriteData` <a name="grantReadWriteData" id="@cdklabs/genai-idp.ConfigurationTable.grantReadWriteData"></a>

```typescript
public grantReadWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal to all data read/write operations to this table.

BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan,
BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantReadWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantStream` <a name="grantStream" id="@cdklabs/genai-idp.ConfigurationTable.grantStream"></a>

```typescript
public grantStream(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table's stream to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantStream.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.ConfigurationTable.grantStream.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:DescribeStream", "dynamodb:GetRecords", ...).

---

##### `grantStreamRead` <a name="grantStreamRead" id="@cdklabs/genai-idp.ConfigurationTable.grantStreamRead"></a>

```typescript
public grantStreamRead(grantee: IGrantable): Grant
```

Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantStreamRead.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantTableListStreams` <a name="grantTableListStreams" id="@cdklabs/genai-idp.ConfigurationTable.grantTableListStreams"></a>

```typescript
public grantTableListStreams(grantee: IGrantable): Grant
```

Permits an IAM Principal to list streams attached to current dynamodb table.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantTableListStreams.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

##### `grantWriteData` <a name="grantWriteData" id="@cdklabs/genai-idp.ConfigurationTable.grantWriteData"></a>

```typescript
public grantWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ConfigurationTable.grantWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.ConfigurationTable.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.ConfigurationTable.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConditionalCheckFailedRequests` <a name="metricConditionalCheckFailedRequests" id="@cdklabs/genai-idp.ConfigurationTable.metricConditionalCheckFailedRequests"></a>

```typescript
public metricConditionalCheckFailedRequests(props?: MetricOptions): Metric
```

Metric for the conditional check failed requests this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricConditionalCheckFailedRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedReadCapacityUnits` <a name="metricConsumedReadCapacityUnits" id="@cdklabs/genai-idp.ConfigurationTable.metricConsumedReadCapacityUnits"></a>

```typescript
public metricConsumedReadCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed read capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricConsumedReadCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedWriteCapacityUnits` <a name="metricConsumedWriteCapacityUnits" id="@cdklabs/genai-idp.ConfigurationTable.metricConsumedWriteCapacityUnits"></a>

```typescript
public metricConsumedWriteCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed write capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricConsumedWriteCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSuccessfulRequestLatency` <a name="metricSuccessfulRequestLatency" id="@cdklabs/genai-idp.ConfigurationTable.metricSuccessfulRequestLatency"></a>

```typescript
public metricSuccessfulRequestLatency(props?: MetricOptions): Metric
```

Metric for the successful request latency this table.

By default, the metric will be calculated as an average over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricSuccessfulRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### ~~`metricSystemErrors`~~ <a name="metricSystemErrors" id="@cdklabs/genai-idp.ConfigurationTable.metricSystemErrors"></a>

```typescript
public metricSystemErrors(props?: MetricOptions): Metric
```

Metric for the system errors this table.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricSystemErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSystemErrorsForOperations` <a name="metricSystemErrorsForOperations" id="@cdklabs/genai-idp.ConfigurationTable.metricSystemErrorsForOperations"></a>

```typescript
public metricSystemErrorsForOperations(props?: SystemErrorsForOperationsMetricOptions): IMetric
```

Metric for the system errors this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricSystemErrorsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.SystemErrorsForOperationsMetricOptions

---

##### ~~`metricThrottledRequests`~~ <a name="metricThrottledRequests" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequests"></a>

```typescript
public metricThrottledRequests(props?: MetricOptions): Metric
```

How many requests are throttled on this table.

Default: sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperation` <a name="metricThrottledRequestsForOperation" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperation"></a>

```typescript
public metricThrottledRequestsForOperation(operation: string, props?: MetricOptions): Metric
```

How many requests are throttled on this table, for the given operation.

Default: sum over 5 minutes

###### `operation`<sup>Required</sup> <a name="operation" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperation.parameter.operation"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperation.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperations` <a name="metricThrottledRequestsForOperations" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperations"></a>

```typescript
public metricThrottledRequestsForOperations(props?: OperationsMetricOptions): IMetric
```

How many requests are throttled on this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricThrottledRequestsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.OperationsMetricOptions

---

##### `metricUserErrors` <a name="metricUserErrors" id="@cdklabs/genai-idp.ConfigurationTable.metricUserErrors"></a>

```typescript
public metricUserErrors(props?: MetricOptions): Metric
```

Metric for the user errors.

Note that this metric reports user errors across all
the tables in the account and region the table resides in.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.metricUserErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addGlobalSecondaryIndex` <a name="addGlobalSecondaryIndex" id="@cdklabs/genai-idp.ConfigurationTable.addGlobalSecondaryIndex"></a>

```typescript
public addGlobalSecondaryIndex(props: GlobalSecondaryIndexProps): void
```

Add a global secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.addGlobalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexProps

the property of global secondary index.

---

##### `addLocalSecondaryIndex` <a name="addLocalSecondaryIndex" id="@cdklabs/genai-idp.ConfigurationTable.addLocalSecondaryIndex"></a>

```typescript
public addLocalSecondaryIndex(props: LocalSecondaryIndexProps): void
```

Add a local secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.addLocalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps

the property of local secondary index.

---

##### `autoScaleGlobalSecondaryIndexReadCapacity` <a name="autoScaleGlobalSecondaryIndexReadCapacity" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexReadCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexReadCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleGlobalSecondaryIndexWriteCapacity` <a name="autoScaleGlobalSecondaryIndexWriteCapacity" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexWriteCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexWriteCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleReadCapacity` <a name="autoScaleReadCapacity" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleReadCapacity"></a>

```typescript
public autoScaleReadCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleWriteCapacity` <a name="autoScaleWriteCapacity" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleWriteCapacity"></a>

```typescript
public autoScaleWriteCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationTable.autoScaleWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `schema` <a name="schema" id="@cdklabs/genai-idp.ConfigurationTable.schema"></a>

```typescript
public schema(indexName?: string): SchemaOptions
```

Get schema attributes of table or index.

###### `indexName`<sup>Optional</sup> <a name="indexName" id="@cdklabs/genai-idp.ConfigurationTable.schema.parameter.indexName"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.fromTableArn">fromTableArn</a></code> | Creates a Table construct that represents an external table via table arn. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.fromTableAttributes">fromTableAttributes</a></code> | Creates a Table construct that represents an external table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.fromTableName">fromTableName</a></code> | Creates a Table construct that represents an external table via table name. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.ConfigurationTable.isConstruct"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

ConfigurationTable.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.ConfigurationTable.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.ConfigurationTable.isOwnedResource"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

ConfigurationTable.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ConfigurationTable.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.ConfigurationTable.isResource"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

ConfigurationTable.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ConfigurationTable.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromTableArn` <a name="fromTableArn" id="@cdklabs/genai-idp.ConfigurationTable.fromTableArn"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

ConfigurationTable.fromTableArn(scope: Construct, id: string, tableArn: string)
```

Creates a Table construct that represents an external table via table arn.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConfigurationTable.fromTableArn.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConfigurationTable.fromTableArn.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.ConfigurationTable.fromTableArn.parameter.tableArn"></a>

- *Type:* string

The table's ARN.

---

##### `fromTableAttributes` <a name="fromTableAttributes" id="@cdklabs/genai-idp.ConfigurationTable.fromTableAttributes"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

ConfigurationTable.fromTableAttributes(scope: Construct, id: string, attrs: TableAttributes)
```

Creates a Table construct that represents an external table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConfigurationTable.fromTableAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConfigurationTable.fromTableAttributes.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.ConfigurationTable.fromTableAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.TableAttributes

A `TableAttributes` object.

---

##### `fromTableName` <a name="fromTableName" id="@cdklabs/genai-idp.ConfigurationTable.fromTableName"></a>

```typescript
import { ConfigurationTable } from '@cdklabs/genai-idp'

ConfigurationTable.fromTableName(scope: Construct, id: string, tableName: string)
```

Creates a Table construct that represents an external table via table name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ConfigurationTable.fromTableName.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ConfigurationTable.fromTableName.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.ConfigurationTable.fromTableName.parameter.tableName"></a>

- *Type:* string

The table's name.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | KMS encryption key, if this table uses a customer-managed encryption key. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.resourcePolicy">resourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | Resource policy to assign to DynamoDB Table. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.ConfigurationTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.ConfigurationTable.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.ConfigurationTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.ConfigurationTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.ConfigurationTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.ConfigurationTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

KMS encryption key, if this table uses a customer-managed encryption key.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp.ConfigurationTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

##### `resourcePolicy`<sup>Optional</sup> <a name="resourcePolicy" id="@cdklabs/genai-idp.ConfigurationTable.property.resourcePolicy"></a>

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
| <code><a href="#@cdklabs/genai-idp.ConfigurationTable.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.ConfigurationTable.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### CreateA2IResourcesFunction <a name="CreateA2IResourcesFunction" id="@cdklabs/genai-idp.CreateA2IResourcesFunction"></a>

- *Implements:* aws-cdk-lib.aws_lambda.IFunction

A Lambda function that creates and manages Amazon A2I (Augmented AI) resources.

This function handles the complete A2I lifecycle including:
- Create: Flow Definition and Human Task UI
- Update: Flow Definition and Human Task UI (delete old, create new)
- Delete: Comprehensive cleanup with verification and wait logic

The function is designed as a CloudFormation custom resource handler
and manages SageMaker A2I resources for human-in-the-loop workflows.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

new CreateA2IResourcesFunction(scope: Construct, id: string, props: CreateA2IResourcesFunctionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps">CreateA2IResourcesFunctionProps</a></code> | Configuration properties for the function. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps">CreateA2IResourcesFunctionProps</a>

Configuration properties for the function.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeCompositePrincipal">grantInvokeCompositePrincipal</a></code> | Grant multiple principals the ability to invoke this Lambda via CompositePrincipal. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeLatestVersion">grantInvokeLatestVersion</a></code> | Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeVersion">grantInvokeVersion</a></code> | Grant the given identity permissions to invoke the given version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.invalidateVersionBasedOn">invalidateVersionBasedOn</a></code> | Mix additional information into the hash of the Version object. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeCompositePrincipal` <a name="grantInvokeCompositePrincipal" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeCompositePrincipal"></a>

```typescript
public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
```

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

###### `compositePrincipal`<sup>Required</sup> <a name="compositePrincipal" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeCompositePrincipal.parameter.compositePrincipal"></a>

- *Type:* aws-cdk-lib.aws_iam.CompositePrincipal

---

##### `grantInvokeLatestVersion` <a name="grantInvokeLatestVersion" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeLatestVersion"></a>

```typescript
public grantInvokeLatestVersion(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeLatestVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeVersion` <a name="grantInvokeVersion" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeVersion"></a>

```typescript
public grantInvokeVersion(grantee: IGrantable, version: IVersion): Grant
```

Grant the given identity permissions to invoke the given version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `version`<sup>Required</sup> <a name="version" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.grantInvokeVersion.parameter.version"></a>

- *Type:* aws-cdk-lib.aws_lambda.IVersion

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addAlias"></a>

```typescript
public addAlias(aliasName: string, options?: AliasOptions): Alias
```

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of
the function as it is being updated during a deployment.

```ts
declare const fn: lambda.Function;

fn.addAlias('Live');

// Is equivalent to

new lambda.Alias(this, 'AliasLive', {
  aliasName: 'Live',
  version: fn.currentVersion,
});
```

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addLayers"></a>

```typescript
public addLayers(layers: ...ILayerVersion[]): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.addLayers.parameter.layers"></a>

- *Type:* ...aws-cdk-lib.aws_lambda.ILayerVersion[]

the layers to be added.

---

##### `invalidateVersionBasedOn` <a name="invalidateVersionBasedOn" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.invalidateVersionBasedOn"></a>

```typescript
public invalidateVersionBasedOn(x: string): void
```

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new
Version when anything about the Function changes (its code, its layers,
any of the other properties).

However, you can sometimes source information from places that the CDK cannot
look into, like the deploy-time values of SSM parameters. In those cases,
the CDK would not force the creation of a new Version object when it actually
should.

This method can be used to invalidate the current Version object. Pass in
any string into this method, and make sure the string changes when you know
a new Version needs to be created.

This method may be called more than once.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.invalidateVersionBasedOn.parameter.x"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.isConstruct"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.isOwnedResource"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.isResource"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.classifyVersionProperty"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionArn"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

For `Function.addPermissions()` to work on this imported lambda, make sure that is
in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionAttributes"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

For `Function.addPermissions()` to work on this imported lambda, set the sameEnvironment property to true
if this imported lambda is in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionName"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAll"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllConcurrentExecutions"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllDuration"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllErrors"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllInvocations"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllThrottles"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { CreateA2IResourcesFunction } from '@cdklabs/genai-idp'

CreateA2IResourcesFunction.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.latestVersion"></a>

```typescript
public readonly latestVersion: IVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.IVersion

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which
means the function this version refers to can return different results in
different invocations.

To obtain a reference to an explicit version which references the current
function configuration, use `lambdaFunction.currentVersion` instead.

---

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that
pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention
period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention
to never expire even if it was configured with a different value.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunction.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.CreateA2IResourcesFunction.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### GetWorkforceUrlFunction <a name="GetWorkforceUrlFunction" id="@cdklabs/genai-idp.GetWorkforceUrlFunction"></a>

- *Implements:* aws-cdk-lib.aws_lambda.IFunction

A Lambda function that retrieves workforce portal URLs for HITL workflows.

This function is designed as a CloudFormation custom resource handler
that retrieves the SageMaker workforce portal URL for human reviewers
to access documents that require manual review and correction.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

new GetWorkforceUrlFunction(scope: Construct, id: string, props: GetWorkforceUrlFunctionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps">GetWorkforceUrlFunctionProps</a></code> | Configuration properties for the function. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps">GetWorkforceUrlFunctionProps</a>

Configuration properties for the function.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeCompositePrincipal">grantInvokeCompositePrincipal</a></code> | Grant multiple principals the ability to invoke this Lambda via CompositePrincipal. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeLatestVersion">grantInvokeLatestVersion</a></code> | Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeVersion">grantInvokeVersion</a></code> | Grant the given identity permissions to invoke the given version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.invalidateVersionBasedOn">invalidateVersionBasedOn</a></code> | Mix additional information into the hash of the Version object. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeCompositePrincipal` <a name="grantInvokeCompositePrincipal" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeCompositePrincipal"></a>

```typescript
public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
```

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

###### `compositePrincipal`<sup>Required</sup> <a name="compositePrincipal" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeCompositePrincipal.parameter.compositePrincipal"></a>

- *Type:* aws-cdk-lib.aws_iam.CompositePrincipal

---

##### `grantInvokeLatestVersion` <a name="grantInvokeLatestVersion" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeLatestVersion"></a>

```typescript
public grantInvokeLatestVersion(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeLatestVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeVersion` <a name="grantInvokeVersion" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeVersion"></a>

```typescript
public grantInvokeVersion(grantee: IGrantable, version: IVersion): Grant
```

Grant the given identity permissions to invoke the given version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `version`<sup>Required</sup> <a name="version" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.grantInvokeVersion.parameter.version"></a>

- *Type:* aws-cdk-lib.aws_lambda.IVersion

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addAlias"></a>

```typescript
public addAlias(aliasName: string, options?: AliasOptions): Alias
```

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of
the function as it is being updated during a deployment.

```ts
declare const fn: lambda.Function;

fn.addAlias('Live');

// Is equivalent to

new lambda.Alias(this, 'AliasLive', {
  aliasName: 'Live',
  version: fn.currentVersion,
});
```

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addLayers"></a>

```typescript
public addLayers(layers: ...ILayerVersion[]): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.addLayers.parameter.layers"></a>

- *Type:* ...aws-cdk-lib.aws_lambda.ILayerVersion[]

the layers to be added.

---

##### `invalidateVersionBasedOn` <a name="invalidateVersionBasedOn" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.invalidateVersionBasedOn"></a>

```typescript
public invalidateVersionBasedOn(x: string): void
```

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new
Version when anything about the Function changes (its code, its layers,
any of the other properties).

However, you can sometimes source information from places that the CDK cannot
look into, like the deploy-time values of SSM parameters. In those cases,
the CDK would not force the creation of a new Version object when it actually
should.

This method can be used to invalidate the current Version object. Pass in
any string into this method, and make sure the string changes when you know
a new Version needs to be created.

This method may be called more than once.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.invalidateVersionBasedOn.parameter.x"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.isConstruct"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.isOwnedResource"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.isResource"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.classifyVersionProperty"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionArn"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

For `Function.addPermissions()` to work on this imported lambda, make sure that is
in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionAttributes"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

For `Function.addPermissions()` to work on this imported lambda, set the sameEnvironment property to true
if this imported lambda is in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionName"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAll"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllConcurrentExecutions"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllDuration"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllErrors"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllInvocations"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllThrottles"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { GetWorkforceUrlFunction } from '@cdklabs/genai-idp'

GetWorkforceUrlFunction.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.latestVersion"></a>

```typescript
public readonly latestVersion: IVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.IVersion

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which
means the function this version refers to can return different results in
different invocations.

To obtain a reference to an explicit version which references the current
function configuration, use `lambdaFunction.currentVersion` instead.

---

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that
pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention
period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention
to never expire even if it was configured with a different value.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunction.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.GetWorkforceUrlFunction.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### HitlEnvironment <a name="HitlEnvironment" id="@cdklabs/genai-idp.HitlEnvironment"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IHitlEnvironment">IHitlEnvironment</a>

A construct that sets up the Human-in-the-Loop (HITL) environment for document processing.

This construct creates and manages all the necessary components for HITL workflows:
- SageMaker workteam for human reviewers
- Cognito User Pool Client for A2I integration
- A2I Flow Definition and Human Task UI management
- Workforce portal URL retrieval

The HITL environment enables human review of documents that fall below
confidence thresholds or require manual verification.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.HitlEnvironment.Initializer"></a>

```typescript
import { HitlEnvironment } from '@cdklabs/genai-idp'

new HitlEnvironment(scope: Construct, id: string, props: HitlEnvironmentProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps">HitlEnvironmentProps</a></code> | Configuration properties for the HITL environment. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.HitlEnvironment.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.HitlEnvironment.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.HitlEnvironment.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.HitlEnvironmentProps">HitlEnvironmentProps</a>

Configuration properties for the HITL environment.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.HitlEnvironment.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.HitlEnvironment.isConstruct"></a>

```typescript
import { HitlEnvironment } from '@cdklabs/genai-idp'

HitlEnvironment.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.HitlEnvironment.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.property.flowDefinitionRole">flowDefinitionRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | The IAM role for A2I Flow Definition. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.property.labelingConsoleUrl">labelingConsoleUrl</a></code> | <code>string</code> | The labeling console URL for SageMaker Ground Truth. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.property.userPoolClient">userPoolClient</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPoolClient</code> | The Cognito User Pool Client for A2I integration. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.property.workforcePortalUrl">workforcePortalUrl</a></code> | <code>string</code> | The workforce portal URL for human reviewers. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironment.property.workteam">workteam</a></code> | <code><a href="#@cdklabs/genai-idp.IWorkteam">IWorkteam</a></code> | The SageMaker workteam for HITL tasks. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.HitlEnvironment.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `flowDefinitionRole`<sup>Required</sup> <a name="flowDefinitionRole" id="@cdklabs/genai-idp.HitlEnvironment.property.flowDefinitionRole"></a>

```typescript
public readonly flowDefinitionRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

The IAM role for A2I Flow Definition.

---

##### `labelingConsoleUrl`<sup>Required</sup> <a name="labelingConsoleUrl" id="@cdklabs/genai-idp.HitlEnvironment.property.labelingConsoleUrl"></a>

```typescript
public readonly labelingConsoleUrl: string;
```

- *Type:* string

The labeling console URL for SageMaker Ground Truth.

---

##### `userPoolClient`<sup>Required</sup> <a name="userPoolClient" id="@cdklabs/genai-idp.HitlEnvironment.property.userPoolClient"></a>

```typescript
public readonly userPoolClient: IUserPoolClient;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPoolClient

The Cognito User Pool Client for A2I integration.

---

##### `workforcePortalUrl`<sup>Required</sup> <a name="workforcePortalUrl" id="@cdklabs/genai-idp.HitlEnvironment.property.workforcePortalUrl"></a>

```typescript
public readonly workforcePortalUrl: string;
```

- *Type:* string

The workforce portal URL for human reviewers.

---

##### `workteam`<sup>Required</sup> <a name="workteam" id="@cdklabs/genai-idp.HitlEnvironment.property.workteam"></a>

```typescript
public readonly workteam: IWorkteam;
```

- *Type:* <a href="#@cdklabs/genai-idp.IWorkteam">IWorkteam</a>

The SageMaker workteam for HITL tasks.

---


### ProcessingEnvironment <a name="ProcessingEnvironment" id="@cdklabs/genai-idp.ProcessingEnvironment"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a>

Core infrastructure for the Intelligent Document Processing solution.

This construct orchestrates the end-to-end document processing workflow,
from document ingestion to structured data extraction and result tracking.
It provides the shared infrastructure and services that all document
processor patterns use, including:

- S3 buckets for document storage
- DynamoDB tables for tracking and configuration
- SQS queues for document processing
- Lambda functions for workflow orchestration
- CloudWatch metrics and logs for monitoring
- GraphQL API for client interactions

The ProcessingEnvironment is designed to be pattern-agnostic, providing
the foundation that specific document processor implementations build upon.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ProcessingEnvironment.Initializer"></a>

```typescript
import { ProcessingEnvironment } from '@cdklabs/genai-idp'

new ProcessingEnvironment(scope: Construct, id: string, props: ProcessingEnvironmentProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps">ProcessingEnvironmentProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ProcessingEnvironment.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironment.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ProcessingEnvironment.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps">ProcessingEnvironmentProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.attach">attach</a></code> | Attaches a document processor to this processing environment. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.metricQueueLatency">metricQueueLatency</a></code> | Creates a CloudWatch metric for queue latency. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.metricTotalLatency">metricTotalLatency</a></code> | Creates a CloudWatch metric for total processing latency. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.metricWorkflowLatency">metricWorkflowLatency</a></code> | Creates a CloudWatch metric for workflow latency. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.ProcessingEnvironment.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `attach` <a name="attach" id="@cdklabs/genai-idp.ProcessingEnvironment.attach"></a>

```typescript
public attach(processor: IDocumentProcessor, options?: DocumentProcessorAttachmentOptions): void
```

Attaches a document processor to this processing environment.

Sets up the necessary event triggers, permissions, and integrations
to enable the processor to work with this environment.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp.ProcessingEnvironment.attach.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp.IDocumentProcessor">IDocumentProcessor</a>

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironment.attach.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp.DocumentProcessorAttachmentOptions">DocumentProcessorAttachmentOptions</a>

---

##### `metricQueueLatency` <a name="metricQueueLatency" id="@cdklabs/genai-idp.ProcessingEnvironment.metricQueueLatency"></a>

```typescript
public metricQueueLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for queue latency.

Measures the time from when a document is queued to when workflow processing starts.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ProcessingEnvironment.metricQueueLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricTotalLatency` <a name="metricTotalLatency" id="@cdklabs/genai-idp.ProcessingEnvironment.metricTotalLatency"></a>

```typescript
public metricTotalLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for total processing latency.

Measures the end-to-end time from document queuing to completion.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ProcessingEnvironment.metricTotalLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

##### `metricWorkflowLatency` <a name="metricWorkflowLatency" id="@cdklabs/genai-idp.ProcessingEnvironment.metricWorkflowLatency"></a>

```typescript
public metricWorkflowLatency(props?: MetricOptions): Metric
```

Creates a CloudWatch metric for workflow latency.

Measures the time from when workflow processing starts to completion.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.ProcessingEnvironment.metricWorkflowLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

Optional metric configuration properties.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.ProcessingEnvironment.isConstruct"></a>

```typescript
import { ProcessingEnvironment } from '@cdklabs/genai-idp'

ProcessingEnvironment.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.ProcessingEnvironment.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.configurationFunction">configurationFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The Lambda function that updates configuration settings. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.configurationTable">configurationTable</a></code> | <code><a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a></code> | The DynamoDB table that stores configuration settings. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.inputBucket">inputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where source documents to be processed are stored. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for document processing components. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The namespace for CloudWatch metrics emitted by the document processing system. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where processed documents and extraction results are stored. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.trackingTable">trackingTable</a></code> | <code><a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a></code> | The DynamoDB table that tracks document processing status and metadata. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.workingBucket">workingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket used for temporary storage during document processing. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.api">api</a></code> | <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a></code> | Optional ProcessingEnvironmentApi for progress notifications. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key used for encrypting sensitive data in the processing environment. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The retention period for CloudWatch logs generated by document processing components. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.reportingEnvironment">reportingEnvironment</a></code> | <code><a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a></code> | Optional reporting environment for analytics and evaluation capabilities. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.saveReportingDataFunction">saveReportingDataFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Optional Lambda function that saves reporting data to the reporting bucket. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironment.property.vpcConfiguration">vpcConfiguration</a></code> | <code><a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a></code> | Optional VPC configuration for document processing components. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.ProcessingEnvironment.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `configurationFunction`<sup>Required</sup> <a name="configurationFunction" id="@cdklabs/genai-idp.ProcessingEnvironment.property.configurationFunction"></a>

```typescript
public readonly configurationFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The Lambda function that updates configuration settings.

Used to initialize and update configuration during deployment and runtime.

---

##### `configurationTable`<sup>Required</sup> <a name="configurationTable" id="@cdklabs/genai-idp.ProcessingEnvironment.property.configurationTable"></a>

```typescript
public readonly configurationTable: IConfigurationTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

The DynamoDB table that stores configuration settings.

Contains document schemas, extraction parameters, and other system-wide settings.

---

##### `inputBucket`<sup>Required</sup> <a name="inputBucket" id="@cdklabs/genai-idp.ProcessingEnvironment.property.inputBucket"></a>

```typescript
public readonly inputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where source documents to be processed are stored.

This bucket is monitored for new document uploads to trigger processing.

---

##### `logLevel`<sup>Required</sup> <a name="logLevel" id="@cdklabs/genai-idp.ProcessingEnvironment.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>

The log level for document processing components.

Controls the verbosity of logs generated during document processing.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/genai-idp.ProcessingEnvironment.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The namespace for CloudWatch metrics emitted by the document processing system.

Used to organize and identify metrics related to document processing.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.ProcessingEnvironment.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where processed documents and extraction results are stored.

Contains the structured data output and processing artifacts.

---

##### `trackingTable`<sup>Required</sup> <a name="trackingTable" id="@cdklabs/genai-idp.ProcessingEnvironment.property.trackingTable"></a>

```typescript
public readonly trackingTable: ITrackingTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

The DynamoDB table that tracks document processing status and metadata.

Stores information about documents being processed, including status and results.

---

##### `workingBucket`<sup>Required</sup> <a name="workingBucket" id="@cdklabs/genai-idp.ProcessingEnvironment.property.workingBucket"></a>

```typescript
public readonly workingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket used for temporary storage during document processing.

Contains intermediate processing artifacts and working files.

---

##### `api`<sup>Optional</sup> <a name="api" id="@cdklabs/genai-idp.ProcessingEnvironment.property.api"></a>

```typescript
public readonly api: IProcessingEnvironmentApi;
```

- *Type:* <a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a>

Optional ProcessingEnvironmentApi for progress notifications.

When provided, functions will use GraphQL mutations to update document status.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.ProcessingEnvironment.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key used for encrypting sensitive data in the processing environment.

When provided, ensures that document content and metadata are encrypted at rest.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.ProcessingEnvironment.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays

The retention period for CloudWatch logs generated by document processing components.

Controls how long system logs are kept for troubleshooting and auditing.

---

##### `reportingEnvironment`<sup>Optional</sup> <a name="reportingEnvironment" id="@cdklabs/genai-idp.ProcessingEnvironment.property.reportingEnvironment"></a>

```typescript
public readonly reportingEnvironment: IReportingEnvironment;
```

- *Type:* <a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a>

Optional reporting environment for analytics and evaluation capabilities.

When provided, enables storage and querying of evaluation metrics and processing analytics.

---

##### `saveReportingDataFunction`<sup>Optional</sup> <a name="saveReportingDataFunction" id="@cdklabs/genai-idp.ProcessingEnvironment.property.saveReportingDataFunction"></a>

```typescript
public readonly saveReportingDataFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Optional Lambda function that saves reporting data to the reporting bucket.

Available when a reporting environment is provided.

---

##### `vpcConfiguration`<sup>Optional</sup> <a name="vpcConfiguration" id="@cdklabs/genai-idp.ProcessingEnvironment.property.vpcConfiguration"></a>

```typescript
public readonly vpcConfiguration: VpcConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a>

Optional VPC configuration for document processing components.

When provided, deploys processing components within a VPC with specified settings.

---


### ProcessingEnvironmentApi <a name="ProcessingEnvironmentApi" id="@cdklabs/genai-idp.ProcessingEnvironmentApi"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a>

A construct that provides a GraphQL API for tracking and managing document processing.

The ProcessingEnvironmentApi creates an AppSync GraphQL API with resolvers for:
- Querying document status and metadata
- Managing document processing (delete, reprocess)
- Accessing document contents and extraction results
- Uploading new documents for processing
- Copying documents to baseline for evaluation
- Querying document knowledge base (if configured)

It integrates with the processing environment's resources including DynamoDB tables,
S3 buckets, and optional knowledge base to provide a comprehensive interface for
monitoring and managing the document processing workflow.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer"></a>

```typescript
import { ProcessingEnvironmentApi } from '@cdklabs/genai-idp'

new ProcessingEnvironmentApi(scope: Construct, id: string, props: ProcessingEnvironmentApiProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps">ProcessingEnvironmentApiProps</a></code> | Configuration properties for the API. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps">ProcessingEnvironmentApiProps</a>

Configuration properties for the API.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addDynamoDbDataSource">addDynamoDbDataSource</a></code> | add a new DynamoDB data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addElasticsearchDataSource">addElasticsearchDataSource</a></code> | add a new elasticsearch data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addEventBridgeDataSource">addEventBridgeDataSource</a></code> | Add an EventBridge data source to this api. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addHttpDataSource">addHttpDataSource</a></code> | add a new http data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addLambdaDataSource">addLambdaDataSource</a></code> | add a new Lambda data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addNoneDataSource">addNoneDataSource</a></code> | add a new dummy data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addOpenSearchDataSource">addOpenSearchDataSource</a></code> | add a new OpenSearch data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource">addRdsDataSource</a></code> | add a new Rds data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2">addRdsDataSourceV2</a></code> | add a new Rds data source to this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addSchemaDependency">addSchemaDependency</a></code> | Add schema dependency to a given construct. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.createResolver">createResolver</a></code> | creates a new resolver for this datasource and API using the given properties. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.grant">grant</a></code> | Adds an IAM policy statement associated with this GraphQLApi to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.grantMutation">grantMutation</a></code> | Adds an IAM policy statement for Mutation access to this GraphQLApi to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.grantQuery">grantQuery</a></code> | Adds an IAM policy statement for Query access to this GraphQLApi to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.grantSubscription">grantSubscription</a></code> | Adds an IAM policy statement for Subscription access to this GraphQLApi to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addEnvironmentVariable">addEnvironmentVariable</a></code> | Add an environment variable to the construct. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addConfigurationTable">addConfigurationTable</a></code> | Add configuration table data sources and resolvers to the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addEvaluation">addEvaluation</a></code> | Add evaluation capabilities to the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addKnowledgeBase">addKnowledgeBase</a></code> | Add knowledge base querying capabilities to the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addStateMachine">addStateMachine</a></code> | Add Step Functions resolvers and monitoring for the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.addTrackingTable">addTrackingTable</a></code> | Add tracking table data sources and resolvers to the GraphQL API. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addDynamoDbDataSource` <a name="addDynamoDbDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addDynamoDbDataSource"></a>

```typescript
public addDynamoDbDataSource(id: string, table: ITable, options?: DataSourceOptions): DynamoDbDataSource
```

add a new DynamoDB data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addDynamoDbDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `table`<sup>Required</sup> <a name="table" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addDynamoDbDataSource.parameter.table"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.ITable

The DynamoDB table backing this data source.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addDynamoDbDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### ~~`addElasticsearchDataSource`~~ <a name="addElasticsearchDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addElasticsearchDataSource"></a>

```typescript
public addElasticsearchDataSource(id: string, domain: IDomain, options?: DataSourceOptions): ElasticsearchDataSource
```

add a new elasticsearch data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addElasticsearchDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `domain`<sup>Required</sup> <a name="domain" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addElasticsearchDataSource.parameter.domain"></a>

- *Type:* aws-cdk-lib.aws_elasticsearch.IDomain

The elasticsearch domain for this data source.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addElasticsearchDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addEventBridgeDataSource` <a name="addEventBridgeDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEventBridgeDataSource"></a>

```typescript
public addEventBridgeDataSource(id: string, eventBus: IEventBus, options?: DataSourceOptions): EventBridgeDataSource
```

Add an EventBridge data source to this api.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEventBridgeDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `eventBus`<sup>Required</sup> <a name="eventBus" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEventBridgeDataSource.parameter.eventBus"></a>

- *Type:* aws-cdk-lib.aws_events.IEventBus

The EventBridge EventBus on which to put events.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEventBridgeDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addHttpDataSource` <a name="addHttpDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addHttpDataSource"></a>

```typescript
public addHttpDataSource(id: string, endpoint: string, options?: HttpDataSourceOptions): HttpDataSource
```

add a new http data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addHttpDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `endpoint`<sup>Required</sup> <a name="endpoint" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addHttpDataSource.parameter.endpoint"></a>

- *Type:* string

The http endpoint.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addHttpDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.HttpDataSourceOptions

The optional configuration for this data source.

---

##### `addLambdaDataSource` <a name="addLambdaDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addLambdaDataSource"></a>

```typescript
public addLambdaDataSource(id: string, lambdaFunction: IFunction, options?: DataSourceOptions): LambdaDataSource
```

add a new Lambda data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addLambdaDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `lambdaFunction`<sup>Required</sup> <a name="lambdaFunction" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addLambdaDataSource.parameter.lambdaFunction"></a>

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The Lambda function to call to interact with this data source.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addLambdaDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addNoneDataSource` <a name="addNoneDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addNoneDataSource"></a>

```typescript
public addNoneDataSource(id: string, options?: DataSourceOptions): NoneDataSource
```

add a new dummy data source to this API.

Useful for pipeline resolvers
and for backend changes that don't require a data source.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addNoneDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addNoneDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addOpenSearchDataSource` <a name="addOpenSearchDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addOpenSearchDataSource"></a>

```typescript
public addOpenSearchDataSource(id: string, domain: IDomain, options?: DataSourceOptions): OpenSearchDataSource
```

add a new OpenSearch data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addOpenSearchDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `domain`<sup>Required</sup> <a name="domain" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addOpenSearchDataSource.parameter.domain"></a>

- *Type:* aws-cdk-lib.aws_opensearchservice.IDomain

The OpenSearch domain for this data source.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addOpenSearchDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addRdsDataSource` <a name="addRdsDataSource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource"></a>

```typescript
public addRdsDataSource(id: string, serverlessCluster: IServerlessCluster, secretStore: ISecret, databaseName?: string, options?: DataSourceOptions): RdsDataSource
```

add a new Rds data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `serverlessCluster`<sup>Required</sup> <a name="serverlessCluster" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource.parameter.serverlessCluster"></a>

- *Type:* aws-cdk-lib.aws_rds.IServerlessCluster

The serverless cluster to interact with this data source.

---

###### `secretStore`<sup>Required</sup> <a name="secretStore" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource.parameter.secretStore"></a>

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The secret store that contains the username and password for the serverless cluster.

---

###### `databaseName`<sup>Optional</sup> <a name="databaseName" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource.parameter.databaseName"></a>

- *Type:* string

The optional name of the database to use within the cluster.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSource.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addRdsDataSourceV2` <a name="addRdsDataSourceV2" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2"></a>

```typescript
public addRdsDataSourceV2(id: string, serverlessCluster: IDatabaseCluster, secretStore: ISecret, databaseName?: string, options?: DataSourceOptions): RdsDataSource
```

add a new Rds data source to this API.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2.parameter.id"></a>

- *Type:* string

The data source's id.

---

###### `serverlessCluster`<sup>Required</sup> <a name="serverlessCluster" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2.parameter.serverlessCluster"></a>

- *Type:* aws-cdk-lib.aws_rds.IDatabaseCluster

The serverless V2 cluster to interact with this data source.

---

###### `secretStore`<sup>Required</sup> <a name="secretStore" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2.parameter.secretStore"></a>

- *Type:* aws-cdk-lib.aws_secretsmanager.ISecret

The secret store that contains the username and password for the serverless cluster.

---

###### `databaseName`<sup>Optional</sup> <a name="databaseName" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2.parameter.databaseName"></a>

- *Type:* string

The optional name of the database to use within the cluster.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addRdsDataSourceV2.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_appsync.DataSourceOptions

The optional configuration for this data source.

---

##### `addSchemaDependency` <a name="addSchemaDependency" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addSchemaDependency"></a>

```typescript
public addSchemaDependency(construct: CfnResource): boolean
```

Add schema dependency to a given construct.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addSchemaDependency.parameter.construct"></a>

- *Type:* aws-cdk-lib.CfnResource

the dependee.

---

##### `createResolver` <a name="createResolver" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.createResolver"></a>

```typescript
public createResolver(id: string, props: ExtendedResolverProps): Resolver
```

creates a new resolver for this datasource and API using the given properties.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.createResolver.parameter.id"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.createResolver.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_appsync.ExtendedResolverProps

---

##### `grant` <a name="grant" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grant"></a>

```typescript
public grant(grantee: IGrantable, resources: IamResource, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this GraphQLApi to an IAM principal's policy.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `resources`<sup>Required</sup> <a name="resources" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grant.parameter.resources"></a>

- *Type:* aws-cdk-lib.aws_appsync.IamResource

The set of resources to allow (i.e. ...:[region]:[accountId]:apis/GraphQLId/...).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grant.parameter.actions"></a>

- *Type:* ...string[]

The actions that should be granted to the principal (i.e. appsync:graphql ).

---

##### `grantMutation` <a name="grantMutation" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantMutation"></a>

```typescript
public grantMutation(grantee: IGrantable, fields: ...string[]): Grant
```

Adds an IAM policy statement for Mutation access to this GraphQLApi to an IAM principal's policy.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantMutation.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `fields`<sup>Required</sup> <a name="fields" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantMutation.parameter.fields"></a>

- *Type:* ...string[]

The fields to grant access to that are Mutations (leave blank for all).

---

##### `grantQuery` <a name="grantQuery" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantQuery"></a>

```typescript
public grantQuery(grantee: IGrantable, fields: ...string[]): Grant
```

Adds an IAM policy statement for Query access to this GraphQLApi to an IAM principal's policy.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantQuery.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `fields`<sup>Required</sup> <a name="fields" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantQuery.parameter.fields"></a>

- *Type:* ...string[]

The fields to grant access to that are Queries (leave blank for all).

---

##### `grantSubscription` <a name="grantSubscription" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantSubscription"></a>

```typescript
public grantSubscription(grantee: IGrantable, fields: ...string[]): Grant
```

Adds an IAM policy statement for Subscription access to this GraphQLApi to an IAM principal's policy.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantSubscription.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal.

---

###### `fields`<sup>Required</sup> <a name="fields" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.grantSubscription.parameter.fields"></a>

- *Type:* ...string[]

The fields to grant access to that are Subscriptions (leave blank for all).

---

##### `addEnvironmentVariable` <a name="addEnvironmentVariable" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEnvironmentVariable"></a>

```typescript
public addEnvironmentVariable(key: string, value: string): void
```

Add an environment variable to the construct.

###### `key`<sup>Required</sup> <a name="key" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEnvironmentVariable.parameter.key"></a>

- *Type:* string

---

###### `value`<sup>Required</sup> <a name="value" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEnvironmentVariable.parameter.value"></a>

- *Type:* string

---

##### `addConfigurationTable` <a name="addConfigurationTable" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addConfigurationTable"></a>

```typescript
public addConfigurationTable(configurationTable: IConfigurationTable): void
```

Add configuration table data sources and resolvers to the GraphQL API.

This method adds configuration management functionality including:
- Querying configuration settings
- Updating configuration parameters
- Managing document schemas and extraction parameters

*Example*

```typescript
// Add configuration table functionality after API creation
api.addConfigurationTable(myConfigurationTable);
```


###### `configurationTable`<sup>Required</sup> <a name="configurationTable" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addConfigurationTable.parameter.configurationTable"></a>

- *Type:* <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

The DynamoDB table that stores configuration settings.

---

##### `addEvaluation` <a name="addEvaluation" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEvaluation"></a>

```typescript
public addEvaluation(evaluationBaselineBucket: IBucket): void
```

Add evaluation capabilities to the GraphQL API.

This method adds document evaluation functionality, including the ability
to copy documents to a baseline bucket for evaluation purposes.
It creates the necessary resolvers and data sources for evaluation workflows.

*Example*

```typescript
// Add evaluation functionality after API creation
api.addEvaluation(myEvaluationBaselineBucket);
```


###### `evaluationBaselineBucket`<sup>Required</sup> <a name="evaluationBaselineBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addEvaluation.parameter.evaluationBaselineBucket"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket for storing evaluation baseline documents.

---

##### `addKnowledgeBase` <a name="addKnowledgeBase" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addKnowledgeBase"></a>

```typescript
public addKnowledgeBase(knowledgeBase: IKnowledgeBase, knowledgeBaseModel: IInvokable, knowledgeBaseGuardrail?: IGuardrail): void
```

Add knowledge base querying capabilities to the GraphQL API.

This method adds natural language querying functionality for processed documents
using Amazon Bedrock knowledge base. It creates the necessary resolvers and
data sources to enable document querying through the GraphQL API.

*Example*

```typescript
// Add knowledge base functionality after API creation
api.addKnowledgeBase(
  myKnowledgeBase,
  bedrock.BedrockFoundationModel.AMAZON_NOVA_PRO_V1_0,
  myGuardrail
);
```


###### `knowledgeBase`<sup>Required</sup> <a name="knowledgeBase" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addKnowledgeBase.parameter.knowledgeBase"></a>

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IKnowledgeBase

The Amazon Bedrock knowledge base for document querying.

---

###### `knowledgeBaseModel`<sup>Required</sup> <a name="knowledgeBaseModel" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addKnowledgeBase.parameter.knowledgeBaseModel"></a>

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

The invokable model to use for knowledge base queries.

---

###### `knowledgeBaseGuardrail`<sup>Optional</sup> <a name="knowledgeBaseGuardrail" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addKnowledgeBase.parameter.knowledgeBaseGuardrail"></a>

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail

Optional Bedrock guardrail to apply to model interactions.

---

##### `addStateMachine` <a name="addStateMachine" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addStateMachine"></a>

```typescript
public addStateMachine(stateMachine: IStateMachine): void
```

Add Step Functions resolvers and monitoring for the GraphQL API.

This method adds Step Functions execution monitoring capabilities to the API,
including query resolvers, mutation resolvers, and automatic subscription publishing.
It can be called after the API has been created to add Step Functions functionality
for the specified state machine.

*Example*

```typescript
// Add state machine monitoring after API creation
api.addStateMachine(myStateMachine);
```


###### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addStateMachine.parameter.stateMachine"></a>

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine to monitor.

---

##### `addTrackingTable` <a name="addTrackingTable" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addTrackingTable"></a>

```typescript
public addTrackingTable(trackingTable: ITrackingTable, inputBucket: IBucket, outputBucket: IBucket): void
```

Add tracking table data sources and resolvers to the GraphQL API.

This method adds all tracking table related functionality including:
- Document creation and management
- Document status tracking
- Document listing and querying
- Document metadata management
- Document deletion (from tracking table and S3 buckets)

*Example*

```typescript
// Add tracking table functionality after API creation
api.addTrackingTable(myTrackingTable, inputBucket, outputBucket);
```


###### `trackingTable`<sup>Required</sup> <a name="trackingTable" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addTrackingTable.parameter.trackingTable"></a>

- *Type:* <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

The DynamoDB table that tracks document processing status and metadata.

---

###### `inputBucket`<sup>Required</sup> <a name="inputBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addTrackingTable.parameter.inputBucket"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where source documents are stored.

---

###### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.addTrackingTable.parameter.outputBucket"></a>

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where processed documents are stored.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.fromGraphqlApiAttributes">fromGraphqlApiAttributes</a></code> | Import a GraphQL API through this function. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.isConstruct"></a>

```typescript
import { ProcessingEnvironmentApi } from '@cdklabs/genai-idp'

ProcessingEnvironmentApi.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.isOwnedResource"></a>

```typescript
import { ProcessingEnvironmentApi } from '@cdklabs/genai-idp'

ProcessingEnvironmentApi.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.isResource"></a>

```typescript
import { ProcessingEnvironmentApi } from '@cdklabs/genai-idp'

ProcessingEnvironmentApi.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromGraphqlApiAttributes` <a name="fromGraphqlApiAttributes" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.fromGraphqlApiAttributes"></a>

```typescript
import { ProcessingEnvironmentApi } from '@cdklabs/genai-idp'

ProcessingEnvironmentApi.fromGraphqlApiAttributes(scope: Construct, id: string, attrs: GraphqlApiAttributes)
```

Import a GraphQL API through this function.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.fromGraphqlApiAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

scope.

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.fromGraphqlApiAttributes.parameter.id"></a>

- *Type:* string

id.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.fromGraphqlApiAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_appsync.GraphqlApiAttributes

GraphQL API Attributes of an API.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.apiId">apiId</a></code> | <code>string</code> | an unique AWS AppSync GraphQL API identifier i.e. 'lxz775lwdrgcndgz3nurvac7oa'. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.arn">arn</a></code> | <code>string</code> | the ARN of the API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.graphQLEndpointArn">graphQLEndpointArn</a></code> | <code>string</code> | The GraphQL endpoint ARN. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.modes">modes</a></code> | <code>aws-cdk-lib.aws_appsync.AuthorizationType[]</code> | The Authorization Types for this GraphQL Api. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.visibility">visibility</a></code> | <code>aws-cdk-lib.aws_appsync.Visibility</code> | the visibility of the API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.appSyncDomainName">appSyncDomainName</a></code> | <code>string</code> | The AppSyncDomainName of the associated custom domain. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.graphqlUrl">graphqlUrl</a></code> | <code>string</code> | the URL of the endpoint created by AppSync. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | the CloudWatch Log Group for this API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.name">name</a></code> | <code>string</code> | the name of the API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.schema">schema</a></code> | <code>aws-cdk-lib.aws_appsync.ISchema</code> | the schema attached to this api (only available for GraphQL APIs, not available for merged APIs). |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.apiKey">apiKey</a></code> | <code>string</code> | the configured API key, if present. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `apiId`<sup>Required</sup> <a name="apiId" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.apiId"></a>

```typescript
public readonly apiId: string;
```

- *Type:* string

an unique AWS AppSync GraphQL API identifier i.e. 'lxz775lwdrgcndgz3nurvac7oa'.

---

##### `arn`<sup>Required</sup> <a name="arn" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.arn"></a>

```typescript
public readonly arn: string;
```

- *Type:* string

the ARN of the API.

---

##### `graphQLEndpointArn`<sup>Required</sup> <a name="graphQLEndpointArn" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.graphQLEndpointArn"></a>

```typescript
public readonly graphQLEndpointArn: string;
```

- *Type:* string

The GraphQL endpoint ARN.

---

##### `modes`<sup>Required</sup> <a name="modes" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.modes"></a>

```typescript
public readonly modes: AuthorizationType[];
```

- *Type:* aws-cdk-lib.aws_appsync.AuthorizationType[]

The Authorization Types for this GraphQL Api.

---

##### `visibility`<sup>Required</sup> <a name="visibility" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.visibility"></a>

```typescript
public readonly visibility: Visibility;
```

- *Type:* aws-cdk-lib.aws_appsync.Visibility

the visibility of the API.

---

##### `appSyncDomainName`<sup>Required</sup> <a name="appSyncDomainName" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.appSyncDomainName"></a>

```typescript
public readonly appSyncDomainName: string;
```

- *Type:* string

The AppSyncDomainName of the associated custom domain.

---

##### `graphqlUrl`<sup>Required</sup> <a name="graphqlUrl" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.graphqlUrl"></a>

```typescript
public readonly graphqlUrl: string;
```

- *Type:* string

the URL of the endpoint created by AppSync.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

the CloudWatch Log Group for this API.

---

##### `name`<sup>Required</sup> <a name="name" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

the name of the API.

---

##### `schema`<sup>Required</sup> <a name="schema" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.schema"></a>

```typescript
public readonly schema: ISchema;
```

- *Type:* aws-cdk-lib.aws_appsync.ISchema

the schema attached to this api (only available for GraphQL APIs, not available for merged APIs).

---

##### `apiKey`<sup>Optional</sup> <a name="apiKey" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.apiKey"></a>

```typescript
public readonly apiKey: string;
```

- *Type:* string
- *Default:* no api key

the configured API key, if present.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.ProcessingEnvironmentApi.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### ReportingEnvironment <a name="ReportingEnvironment" id="@cdklabs/genai-idp.ReportingEnvironment"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a>

A construct that creates the reporting table structure for document processing analytics.

This construct focuses on creating the Glue table schema for evaluation metrics,
using provided S3 bucket and Glue database resources. It creates:
- Document-level evaluation metrics table
- Section-level evaluation metrics table
- Attribute-level evaluation metrics table
- Metering data table

All tables are properly partitioned for efficient querying with Amazon Athena.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ReportingEnvironment.Initializer"></a>

```typescript
import { ReportingEnvironment } from '@cdklabs/genai-idp'

new ReportingEnvironment(scope: Construct, id: string, props: ReportingEnvironmentProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.ReportingEnvironmentProps">ReportingEnvironmentProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.ReportingEnvironment.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.ReportingEnvironment.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ReportingEnvironment.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.ReportingEnvironmentProps">ReportingEnvironmentProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.ReportingEnvironment.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.ReportingEnvironment.isConstruct"></a>

```typescript
import { ReportingEnvironment } from '@cdklabs/genai-idp'

ReportingEnvironment.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.ReportingEnvironment.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.attributeEvaluationsTable">attributeEvaluationsTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for attribute-level evaluation metrics. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.documentEvaluationsTable">documentEvaluationsTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for document-level evaluation metrics. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.meteringTable">meteringTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for metering data. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.reportingBucket">reportingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where evaluation metrics and reporting data are stored in Parquet format. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.reportingDatabase">reportingDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | The AWS Glue database containing tables for evaluation metrics. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironment.property.sectionEvaluationsTable">sectionEvaluationsTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for section-level evaluation metrics. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.ReportingEnvironment.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `attributeEvaluationsTable`<sup>Required</sup> <a name="attributeEvaluationsTable" id="@cdklabs/genai-idp.ReportingEnvironment.property.attributeEvaluationsTable"></a>

```typescript
public readonly attributeEvaluationsTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for attribute-level evaluation metrics.

Contains detailed evaluation metrics for individual extracted attributes.

---

##### `documentEvaluationsTable`<sup>Required</sup> <a name="documentEvaluationsTable" id="@cdklabs/genai-idp.ReportingEnvironment.property.documentEvaluationsTable"></a>

```typescript
public readonly documentEvaluationsTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for document-level evaluation metrics.

Contains accuracy, precision, recall, F1 score, and other document-level metrics.

---

##### `meteringTable`<sup>Required</sup> <a name="meteringTable" id="@cdklabs/genai-idp.ReportingEnvironment.property.meteringTable"></a>

```typescript
public readonly meteringTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for metering data.

Contains cost and usage metrics for document processing operations.

---

##### `reportingBucket`<sup>Required</sup> <a name="reportingBucket" id="@cdklabs/genai-idp.ReportingEnvironment.property.reportingBucket"></a>

```typescript
public readonly reportingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where evaluation metrics and reporting data are stored in Parquet format.

Contains document-level, section-level, and attribute-level evaluation metrics.

---

##### `reportingDatabase`<sup>Required</sup> <a name="reportingDatabase" id="@cdklabs/genai-idp.ReportingEnvironment.property.reportingDatabase"></a>

```typescript
public readonly reportingDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

The AWS Glue database containing tables for evaluation metrics.

Provides a structured catalog for querying evaluation data with Amazon Athena.

---

##### `sectionEvaluationsTable`<sup>Required</sup> <a name="sectionEvaluationsTable" id="@cdklabs/genai-idp.ReportingEnvironment.property.sectionEvaluationsTable"></a>

```typescript
public readonly sectionEvaluationsTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for section-level evaluation metrics.

Contains evaluation metrics for individual sections within documents.

---


### SaveReportingDataFunction <a name="SaveReportingDataFunction" id="@cdklabs/genai-idp.SaveReportingDataFunction"></a>

- *Implements:* aws-cdk-lib.aws_lambda.IFunction

A Lambda function that saves document evaluation data to the reporting bucket in Parquet format.

This function is responsible for:
- Converting document processing metrics to Parquet format
- Saving evaluation data to the reporting bucket with proper partitioning
- Supporting document-level, section-level, and attribute-level metrics
- Enabling analytics and business intelligence through structured data storage

The function is typically invoked by other Lambda functions (evaluation_function, workflow_tracker)
to persist processing metrics and evaluation results for later analysis with Amazon Athena.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.SaveReportingDataFunction.Initializer"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

new SaveReportingDataFunction(scope: Construct, id: string, props: SaveReportingDataFunctionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps">SaveReportingDataFunctionProps</a></code> | Configuration properties for the function. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.SaveReportingDataFunction.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.SaveReportingDataFunction.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps">SaveReportingDataFunctionProps</a>

Configuration properties for the function.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addEventSource">addEventSource</a></code> | Adds an event source to this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addEventSourceMapping">addEventSourceMapping</a></code> | Adds an event source that maps to this AWS Lambda function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addFunctionUrl">addFunctionUrl</a></code> | Adds a url to this lambda function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addPermission">addPermission</a></code> | Adds a permission to the Lambda resource policy. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addToRolePolicy">addToRolePolicy</a></code> | Adds a statement to the IAM role assumed by the instance. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.configureAsyncInvoke">configureAsyncInvoke</a></code> | Configures options for asynchronous invocation. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.considerWarningOnInvokeFunctionPermissions">considerWarningOnInvokeFunctionPermissions</a></code> | A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.grantInvoke">grantInvoke</a></code> | Grant the given identity permissions to invoke this Lambda. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeCompositePrincipal">grantInvokeCompositePrincipal</a></code> | Grant multiple principals the ability to invoke this Lambda via CompositePrincipal. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeLatestVersion">grantInvokeLatestVersion</a></code> | Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeUrl">grantInvokeUrl</a></code> | Grant the given identity permissions to invoke this Lambda Function URL. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeVersion">grantInvokeVersion</a></code> | Grant the given identity permissions to invoke the given version of this Lambda. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metric">metric</a></code> | Return the given named metric for this Function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricDuration">metricDuration</a></code> | How long execution of this Lambda takes. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricErrors">metricErrors</a></code> | How many invocations of this Lambda fail. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricInvocations">metricInvocations</a></code> | How often this Lambda is invoked. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricThrottles">metricThrottles</a></code> | How often this Lambda is throttled. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addAlias">addAlias</a></code> | Defines an alias for this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addEnvironment">addEnvironment</a></code> | Adds an environment variable to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.addLayers">addLayers</a></code> | Adds one or more Lambda Layers to this Lambda function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.invalidateVersionBasedOn">invalidateVersionBasedOn</a></code> | Mix additional information into the hash of the Version object. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.SaveReportingDataFunction.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.SaveReportingDataFunction.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.SaveReportingDataFunction.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addEventSource` <a name="addEventSource" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEventSource"></a>

```typescript
public addEventSource(source: IEventSource): void
```

Adds an event source to this function.

Event sources are implemented in the aws-cdk-lib/aws-lambda-event-sources module.

The following example adds an SQS Queue as an event source:
```
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
myFunction.addEventSource(new SqsEventSource(myQueue));
```

###### `source`<sup>Required</sup> <a name="source" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEventSource.parameter.source"></a>

- *Type:* aws-cdk-lib.aws_lambda.IEventSource

---

##### `addEventSourceMapping` <a name="addEventSourceMapping" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEventSourceMapping"></a>

```typescript
public addEventSourceMapping(id: string, options: EventSourceMappingOptions): EventSourceMapping
```

Adds an event source that maps to this AWS Lambda function.

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEventSourceMapping.parameter.id"></a>

- *Type:* string

---

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEventSourceMapping.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventSourceMappingOptions

---

##### `addFunctionUrl` <a name="addFunctionUrl" id="@cdklabs/genai-idp.SaveReportingDataFunction.addFunctionUrl"></a>

```typescript
public addFunctionUrl(options?: FunctionUrlOptions): FunctionUrl
```

Adds a url to this lambda function.

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.SaveReportingDataFunction.addFunctionUrl.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionUrlOptions

---

##### `addPermission` <a name="addPermission" id="@cdklabs/genai-idp.SaveReportingDataFunction.addPermission"></a>

```typescript
public addPermission(id: string, permission: Permission): void
```

Adds a permission to the Lambda resource policy.

> [Permission for details.](Permission for details.)

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.SaveReportingDataFunction.addPermission.parameter.id"></a>

- *Type:* string

The id for the permission construct.

---

###### `permission`<sup>Required</sup> <a name="permission" id="@cdklabs/genai-idp.SaveReportingDataFunction.addPermission.parameter.permission"></a>

- *Type:* aws-cdk-lib.aws_lambda.Permission

The permission to grant to this Lambda function.

---

##### `addToRolePolicy` <a name="addToRolePolicy" id="@cdklabs/genai-idp.SaveReportingDataFunction.addToRolePolicy"></a>

```typescript
public addToRolePolicy(statement: PolicyStatement): void
```

Adds a statement to the IAM role assumed by the instance.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.SaveReportingDataFunction.addToRolePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

---

##### `configureAsyncInvoke` <a name="configureAsyncInvoke" id="@cdklabs/genai-idp.SaveReportingDataFunction.configureAsyncInvoke"></a>

```typescript
public configureAsyncInvoke(options: EventInvokeConfigOptions): void
```

Configures options for asynchronous invocation.

###### `options`<sup>Required</sup> <a name="options" id="@cdklabs/genai-idp.SaveReportingDataFunction.configureAsyncInvoke.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EventInvokeConfigOptions

---

##### `considerWarningOnInvokeFunctionPermissions` <a name="considerWarningOnInvokeFunctionPermissions" id="@cdklabs/genai-idp.SaveReportingDataFunction.considerWarningOnInvokeFunctionPermissions"></a>

```typescript
public considerWarningOnInvokeFunctionPermissions(scope: Construct, action: string): void
```

A warning will be added to functions under the following conditions: - permissions that include `lambda:InvokeFunction` are added to the unqualified function.

function.currentVersion is invoked before or after the permission is created.

This applies only to permissions on Lambda functions, not versions or aliases.
This function is overridden as a noOp for QualifiedFunctionBase.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.SaveReportingDataFunction.considerWarningOnInvokeFunctionPermissions.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `action`<sup>Required</sup> <a name="action" id="@cdklabs/genai-idp.SaveReportingDataFunction.considerWarningOnInvokeFunctionPermissions.parameter.action"></a>

- *Type:* string

---

##### `grantInvoke` <a name="grantInvoke" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvoke"></a>

```typescript
public grantInvoke(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvoke.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeCompositePrincipal` <a name="grantInvokeCompositePrincipal" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeCompositePrincipal"></a>

```typescript
public grantInvokeCompositePrincipal(compositePrincipal: CompositePrincipal): Grant[]
```

Grant multiple principals the ability to invoke this Lambda via CompositePrincipal.

###### `compositePrincipal`<sup>Required</sup> <a name="compositePrincipal" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeCompositePrincipal.parameter.compositePrincipal"></a>

- *Type:* aws-cdk-lib.aws_iam.CompositePrincipal

---

##### `grantInvokeLatestVersion` <a name="grantInvokeLatestVersion" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeLatestVersion"></a>

```typescript
public grantInvokeLatestVersion(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke the $LATEST version or unqualified version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeLatestVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeUrl` <a name="grantInvokeUrl" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeUrl"></a>

```typescript
public grantInvokeUrl(grantee: IGrantable): Grant
```

Grant the given identity permissions to invoke this Lambda Function URL.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeUrl.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

##### `grantInvokeVersion` <a name="grantInvokeVersion" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeVersion"></a>

```typescript
public grantInvokeVersion(grantee: IGrantable, version: IVersion): Grant
```

Grant the given identity permissions to invoke the given version of this Lambda.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeVersion.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

---

###### `version`<sup>Required</sup> <a name="version" id="@cdklabs/genai-idp.SaveReportingDataFunction.grantInvokeVersion.parameter.version"></a>

- *Type:* aws-cdk-lib.aws_lambda.IVersion

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.SaveReportingDataFunction.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Function.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.SaveReportingDataFunction.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricDuration` <a name="metricDuration" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricDuration"></a>

```typescript
public metricDuration(props?: MetricOptions): Metric
```

How long execution of this Lambda takes.

Average over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricErrors` <a name="metricErrors" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricErrors"></a>

```typescript
public metricErrors(props?: MetricOptions): Metric
```

How many invocations of this Lambda fail.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricInvocations` <a name="metricInvocations" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricInvocations"></a>

```typescript
public metricInvocations(props?: MetricOptions): Metric
```

How often this Lambda is invoked.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottles` <a name="metricThrottles" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricThrottles"></a>

```typescript
public metricThrottles(props?: MetricOptions): Metric
```

How often this Lambda is throttled.

Sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addAlias` <a name="addAlias" id="@cdklabs/genai-idp.SaveReportingDataFunction.addAlias"></a>

```typescript
public addAlias(aliasName: string, options?: AliasOptions): Alias
```

Defines an alias for this function.

The alias will automatically be updated to point to the latest version of
the function as it is being updated during a deployment.

```ts
declare const fn: lambda.Function;

fn.addAlias('Live');

// Is equivalent to

new lambda.Alias(this, 'AliasLive', {
  aliasName: 'Live',
  version: fn.currentVersion,
});
```

###### `aliasName`<sup>Required</sup> <a name="aliasName" id="@cdklabs/genai-idp.SaveReportingDataFunction.addAlias.parameter.aliasName"></a>

- *Type:* string

The name of the alias.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.SaveReportingDataFunction.addAlias.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.AliasOptions

Alias options.

---

##### `addEnvironment` <a name="addEnvironment" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEnvironment"></a>

```typescript
public addEnvironment(key: string, value: string, options?: EnvironmentOptions): Function
```

Adds an environment variable to this Lambda function.

If this is a ref to a Lambda function, this operation results in a no-op.

###### `key`<sup>Required</sup> <a name="key" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEnvironment.parameter.key"></a>

- *Type:* string

The environment variable key.

---

###### `value`<sup>Required</sup> <a name="value" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEnvironment.parameter.value"></a>

- *Type:* string

The environment variable's value.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.SaveReportingDataFunction.addEnvironment.parameter.options"></a>

- *Type:* aws-cdk-lib.aws_lambda.EnvironmentOptions

Environment variable options.

---

##### `addLayers` <a name="addLayers" id="@cdklabs/genai-idp.SaveReportingDataFunction.addLayers"></a>

```typescript
public addLayers(layers: ...ILayerVersion[]): void
```

Adds one or more Lambda Layers to this Lambda function.

###### `layers`<sup>Required</sup> <a name="layers" id="@cdklabs/genai-idp.SaveReportingDataFunction.addLayers.parameter.layers"></a>

- *Type:* ...aws-cdk-lib.aws_lambda.ILayerVersion[]

the layers to be added.

---

##### `invalidateVersionBasedOn` <a name="invalidateVersionBasedOn" id="@cdklabs/genai-idp.SaveReportingDataFunction.invalidateVersionBasedOn"></a>

```typescript
public invalidateVersionBasedOn(x: string): void
```

Mix additional information into the hash of the Version object.

The Lambda Function construct does its best to automatically create a new
Version when anything about the Function changes (its code, its layers,
any of the other properties).

However, you can sometimes source information from places that the CDK cannot
look into, like the deploy-time values of SSM parameters. In those cases,
the CDK would not force the creation of a new Version object when it actually
should.

This method can be used to invalidate the current Version object. Pass in
any string into this method, and make sure the string changes when you know
a new Version needs to be created.

This method may be called more than once.

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.SaveReportingDataFunction.invalidateVersionBasedOn.parameter.x"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.classifyVersionProperty">classifyVersionProperty</a></code> | Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionArn">fromFunctionArn</a></code> | Import a lambda function into the CDK using its ARN. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionAttributes">fromFunctionAttributes</a></code> | Creates a Lambda function object which represents a function not defined within this stack. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionName">fromFunctionName</a></code> | Import a lambda function into the CDK using its name. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAll">metricAll</a></code> | Return the given named metric for this Lambda. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAllConcurrentExecutions">metricAllConcurrentExecutions</a></code> | Metric for the number of concurrent executions across all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAllDuration">metricAllDuration</a></code> | Metric for the Duration executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAllErrors">metricAllErrors</a></code> | Metric for the number of Errors executing all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAllInvocations">metricAllInvocations</a></code> | Metric for the number of invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAllThrottles">metricAllThrottles</a></code> | Metric for the number of throttled invocations of all Lambdas. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.metricAllUnreservedConcurrentExecutions">metricAllUnreservedConcurrentExecutions</a></code> | Metric for the number of unreserved concurrent executions across all Lambdas. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.SaveReportingDataFunction.isConstruct"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.SaveReportingDataFunction.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.SaveReportingDataFunction.isOwnedResource"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.SaveReportingDataFunction.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.SaveReportingDataFunction.isResource"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.SaveReportingDataFunction.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `classifyVersionProperty` <a name="classifyVersionProperty" id="@cdklabs/genai-idp.SaveReportingDataFunction.classifyVersionProperty"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.classifyVersionProperty(propertyName: string, locked: boolean)
```

Record whether specific properties in the `AWS::Lambda::Function` resource should also be associated to the Version resource.

See 'currentVersion' section in the module README for more details.

###### `propertyName`<sup>Required</sup> <a name="propertyName" id="@cdklabs/genai-idp.SaveReportingDataFunction.classifyVersionProperty.parameter.propertyName"></a>

- *Type:* string

The property to classify.

---

###### `locked`<sup>Required</sup> <a name="locked" id="@cdklabs/genai-idp.SaveReportingDataFunction.classifyVersionProperty.parameter.locked"></a>

- *Type:* boolean

whether the property should be associated to the version or not.

---

##### `fromFunctionArn` <a name="fromFunctionArn" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionArn"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.fromFunctionArn(scope: Construct, id: string, functionArn: string)
```

Import a lambda function into the CDK using its ARN.

For `Function.addPermissions()` to work on this imported lambda, make sure that is
in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionArn.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionArn.parameter.id"></a>

- *Type:* string

---

###### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionArn.parameter.functionArn"></a>

- *Type:* string

---

##### `fromFunctionAttributes` <a name="fromFunctionAttributes" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionAttributes"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.fromFunctionAttributes(scope: Construct, id: string, attrs: FunctionAttributes)
```

Creates a Lambda function object which represents a function not defined within this stack.

For `Function.addPermissions()` to work on this imported lambda, set the sameEnvironment property to true
if this imported lambda is in the same account and region as the stack you are importing it into.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent construct.

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionAttributes.parameter.id"></a>

- *Type:* string

The name of the lambda construct.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_lambda.FunctionAttributes

the attributes of the function to import.

---

##### `fromFunctionName` <a name="fromFunctionName" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionName"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.fromFunctionName(scope: Construct, id: string, functionName: string)
```

Import a lambda function into the CDK using its name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionName.parameter.scope"></a>

- *Type:* constructs.Construct

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionName.parameter.id"></a>

- *Type:* string

---

###### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.SaveReportingDataFunction.fromFunctionName.parameter.functionName"></a>

- *Type:* string

---

##### `metricAll` <a name="metricAll" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAll"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAll(metricName: string, props?: MetricOptions)
```

Return the given named metric for this Lambda.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAll.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAll.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllConcurrentExecutions` <a name="metricAllConcurrentExecutions" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllConcurrentExecutions"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAllConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllDuration` <a name="metricAllDuration" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllDuration"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAllDuration(props?: MetricOptions)
```

Metric for the Duration executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllDuration.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllErrors` <a name="metricAllErrors" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllErrors"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAllErrors(props?: MetricOptions)
```

Metric for the number of Errors executing all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllInvocations` <a name="metricAllInvocations" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllInvocations"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAllInvocations(props?: MetricOptions)
```

Metric for the number of invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllInvocations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllThrottles` <a name="metricAllThrottles" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllThrottles"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAllThrottles(props?: MetricOptions)
```

Metric for the number of throttled invocations of all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllThrottles.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricAllUnreservedConcurrentExecutions` <a name="metricAllUnreservedConcurrentExecutions" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllUnreservedConcurrentExecutions"></a>

```typescript
import { SaveReportingDataFunction } from '@cdklabs/genai-idp'

SaveReportingDataFunction.metricAllUnreservedConcurrentExecutions(props?: MetricOptions)
```

Metric for the number of unreserved concurrent executions across all Lambdas.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.SaveReportingDataFunction.metricAllUnreservedConcurrentExecutions.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64). |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.connections">connections</a></code> | <code>aws-cdk-lib.aws_ec2.Connections</code> | Access the Connections object. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.functionArn">functionArn</a></code> | <code>string</code> | ARN of this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.functionName">functionName</a></code> | <code>string</code> | Name of this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.grantPrincipal">grantPrincipal</a></code> | <code>aws-cdk-lib.aws_iam.IPrincipal</code> | The principal this Lambda Function is running as. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.isBoundToVpc">isBoundToVpc</a></code> | <code>boolean</code> | Whether or not this Lambda function was bound to a VPC. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.latestVersion">latestVersion</a></code> | <code>aws-cdk-lib.aws_lambda.IVersion</code> | The `$LATEST` version of this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.permissionsNode">permissionsNode</a></code> | <code>constructs.Node</code> | The construct node where permissions are attached. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.resourceArnsForGrantInvoke">resourceArnsForGrantInvoke</a></code> | <code>string[]</code> | The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke(). |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Execution role associated with this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.currentVersion">currentVersion</a></code> | <code>aws-cdk-lib.aws_lambda.Version</code> | Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The LogGroup where the Lambda function's logs are made available. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.runtime">runtime</a></code> | <code>aws-cdk-lib.aws_lambda.Runtime</code> | The runtime configured for this lambda. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The DLQ (as queue) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The DLQ (as topic) associated with this Lambda Function (this is an optional attribute). |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.timeout">timeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout configured for this lambda. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `architecture`<sup>Required</sup> <a name="architecture" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture

The architecture of this Lambda Function (this is an optional attribute and defaults to X86_64).

---

##### `connections`<sup>Required</sup> <a name="connections" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.connections"></a>

```typescript
public readonly connections: Connections;
```

- *Type:* aws-cdk-lib.aws_ec2.Connections

Access the Connections object.

Will fail if not a VPC-enabled Lambda Function

---

##### `functionArn`<sup>Required</sup> <a name="functionArn" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.functionArn"></a>

```typescript
public readonly functionArn: string;
```

- *Type:* string

ARN of this function.

---

##### `functionName`<sup>Required</sup> <a name="functionName" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string

Name of this function.

---

##### `grantPrincipal`<sup>Required</sup> <a name="grantPrincipal" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.grantPrincipal"></a>

```typescript
public readonly grantPrincipal: IPrincipal;
```

- *Type:* aws-cdk-lib.aws_iam.IPrincipal

The principal this Lambda Function is running as.

---

##### `isBoundToVpc`<sup>Required</sup> <a name="isBoundToVpc" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.isBoundToVpc"></a>

```typescript
public readonly isBoundToVpc: boolean;
```

- *Type:* boolean

Whether or not this Lambda function was bound to a VPC.

If this is is `false`, trying to access the `connections` object will fail.

---

##### `latestVersion`<sup>Required</sup> <a name="latestVersion" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.latestVersion"></a>

```typescript
public readonly latestVersion: IVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.IVersion

The `$LATEST` version of this function.

Note that this is reference to a non-specific AWS Lambda version, which
means the function this version refers to can return different results in
different invocations.

To obtain a reference to an explicit version which references the current
function configuration, use `lambdaFunction.currentVersion` instead.

---

##### `permissionsNode`<sup>Required</sup> <a name="permissionsNode" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.permissionsNode"></a>

```typescript
public readonly permissionsNode: Node;
```

- *Type:* constructs.Node

The construct node where permissions are attached.

---

##### `resourceArnsForGrantInvoke`<sup>Required</sup> <a name="resourceArnsForGrantInvoke" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.resourceArnsForGrantInvoke"></a>

```typescript
public readonly resourceArnsForGrantInvoke: string[];
```

- *Type:* string[]

The ARN(s) to put into the resource field of the generated IAM policy for grantInvoke().

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole

Execution role associated with this function.

---

##### `currentVersion`<sup>Required</sup> <a name="currentVersion" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.currentVersion"></a>

```typescript
public readonly currentVersion: Version;
```

- *Type:* aws-cdk-lib.aws_lambda.Version

Returns a `lambda.Version` which represents the current version of this Lambda function. A new version will be created every time the function's configuration changes.

You can specify options for this version using the `currentVersionOptions`
prop when initializing the `lambda.Function`.

---

##### `logGroup`<sup>Required</sup> <a name="logGroup" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup

The LogGroup where the Lambda function's logs are made available.

If either `logRetention` is set or this property is called, a CloudFormation custom resource is added to the stack that
pre-creates the log group as part of the stack deployment, if it already doesn't exist, and sets the correct log retention
period (never expire, by default).

Further, if the log group already exists and the `logRetention` is not set, the custom resource will reset the log retention
to never expire even if it was configured with a different value.

---

##### `runtime`<sup>Required</sup> <a name="runtime" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.runtime"></a>

```typescript
public readonly runtime: Runtime;
```

- *Type:* aws-cdk-lib.aws_lambda.Runtime

The runtime configured for this lambda.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue

The DLQ (as queue) associated with this Lambda Function (this is an optional attribute).

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic

The DLQ (as topic) associated with this Lambda Function (this is an optional attribute).

---

##### `timeout`<sup>Optional</sup> <a name="timeout" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.timeout"></a>

```typescript
public readonly timeout: Duration;
```

- *Type:* aws-cdk-lib.Duration

The timeout configured for this lambda.

---

#### Constants <a name="Constants" id="Constants"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunction.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.SaveReportingDataFunction.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### TrackingTable <a name="TrackingTable" id="@cdklabs/genai-idp.TrackingTable"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

A DynamoDB table for tracking document processing status and results.

This table uses a composite key (PK, SK) to efficiently store and query
information about documents being processed, including their current status,
processing history, and extraction results. The table design supports
various access patterns needed for monitoring and reporting on document
processing activities.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.TrackingTable.Initializer"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

new TrackingTable(scope: Construct, id: string, props?: FixedKeyTableProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps">FixedKeyTableProps</a></code> | Configuration properties for the DynamoDB table. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.TrackingTable.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.TrackingTable.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.FixedKeyTableProps">FixedKeyTableProps</a>

Configuration properties for the DynamoDB table.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.addToResourcePolicy">addToResourcePolicy</a></code> | Adds a statement to the resource policy associated with this file system. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grant">grant</a></code> | Adds an IAM policy statement associated with this table to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantFullAccess">grantFullAccess</a></code> | Permits all DynamoDB operations ("dynamodb:*") to an IAM principal. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantReadData">grantReadData</a></code> | Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantReadWriteData">grantReadWriteData</a></code> | Permits an IAM principal to all data read/write operations to this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantStream">grantStream</a></code> | Adds an IAM policy statement associated with this table's stream to an IAM principal's policy. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantStreamRead">grantStreamRead</a></code> | Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantTableListStreams">grantTableListStreams</a></code> | Permits an IAM Principal to list streams attached to current dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.grantWriteData">grantWriteData</a></code> | Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metric">metric</a></code> | Return the given named metric for this Table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricConditionalCheckFailedRequests">metricConditionalCheckFailedRequests</a></code> | Metric for the conditional check failed requests this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricConsumedReadCapacityUnits">metricConsumedReadCapacityUnits</a></code> | Metric for the consumed read capacity units this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricConsumedWriteCapacityUnits">metricConsumedWriteCapacityUnits</a></code> | Metric for the consumed write capacity units this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricSuccessfulRequestLatency">metricSuccessfulRequestLatency</a></code> | Metric for the successful request latency this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricSystemErrors">metricSystemErrors</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricSystemErrorsForOperations">metricSystemErrorsForOperations</a></code> | Metric for the system errors this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricThrottledRequests">metricThrottledRequests</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperation">metricThrottledRequestsForOperation</a></code> | How many requests are throttled on this table, for the given operation. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperations">metricThrottledRequestsForOperations</a></code> | How many requests are throttled on this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.metricUserErrors">metricUserErrors</a></code> | Metric for the user errors. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.addGlobalSecondaryIndex">addGlobalSecondaryIndex</a></code> | Add a global secondary index of table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.addLocalSecondaryIndex">addLocalSecondaryIndex</a></code> | Add a local secondary index of table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexReadCapacity">autoScaleGlobalSecondaryIndexReadCapacity</a></code> | Enable read capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexWriteCapacity">autoScaleGlobalSecondaryIndexWriteCapacity</a></code> | Enable write capacity scaling for the given GSI. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.autoScaleReadCapacity">autoScaleReadCapacity</a></code> | Enable read capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.autoScaleWriteCapacity">autoScaleWriteCapacity</a></code> | Enable write capacity scaling for this table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.schema">schema</a></code> | Get schema attributes of table or index. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.TrackingTable.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.TrackingTable.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.TrackingTable.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

##### `addToResourcePolicy` <a name="addToResourcePolicy" id="@cdklabs/genai-idp.TrackingTable.addToResourcePolicy"></a>

```typescript
public addToResourcePolicy(statement: PolicyStatement): AddToResourcePolicyResult
```

Adds a statement to the resource policy associated with this file system.

A resource policy will be automatically created upon the first call to `addToResourcePolicy`.

Note that this does not work with imported file systems.

###### `statement`<sup>Required</sup> <a name="statement" id="@cdklabs/genai-idp.TrackingTable.addToResourcePolicy.parameter.statement"></a>

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement

The policy statement to add.

---

##### `grant` <a name="grant" id="@cdklabs/genai-idp.TrackingTable.grant"></a>

```typescript
public grant(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grant.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.TrackingTable.grant.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:PutItem", "dynamodb:GetItem", ...).

---

##### `grantFullAccess` <a name="grantFullAccess" id="@cdklabs/genai-idp.TrackingTable.grantFullAccess"></a>

```typescript
public grantFullAccess(grantee: IGrantable): Grant
```

Permits all DynamoDB operations ("dynamodb:*") to an IAM principal.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantFullAccess.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadData` <a name="grantReadData" id="@cdklabs/genai-idp.TrackingTable.grantReadData"></a>

```typescript
public grantReadData(grantee: IGrantable): Grant
```

Permits an IAM principal all data read operations from this table: BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantReadData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantReadWriteData` <a name="grantReadWriteData" id="@cdklabs/genai-idp.TrackingTable.grantReadWriteData"></a>

```typescript
public grantReadWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal to all data read/write operations to this table.

BatchGetItem, GetRecords, GetShardIterator, Query, GetItem, Scan,
BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantReadWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantStream` <a name="grantStream" id="@cdklabs/genai-idp.TrackingTable.grantStream"></a>

```typescript
public grantStream(grantee: IGrantable, actions: ...string[]): Grant
```

Adds an IAM policy statement associated with this table's stream to an IAM principal's policy.

If `encryptionKey` is present, appropriate grants to the key needs to be added
separately using the `table.encryptionKey.grant*` methods.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantStream.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

###### `actions`<sup>Required</sup> <a name="actions" id="@cdklabs/genai-idp.TrackingTable.grantStream.parameter.actions"></a>

- *Type:* ...string[]

The set of actions to allow (i.e. "dynamodb:DescribeStream", "dynamodb:GetRecords", ...).

---

##### `grantStreamRead` <a name="grantStreamRead" id="@cdklabs/genai-idp.TrackingTable.grantStreamRead"></a>

```typescript
public grantStreamRead(grantee: IGrantable): Grant
```

Permits an IAM principal all stream data read operations for this table's stream: DescribeStream, GetRecords, GetShardIterator, ListStreams.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantStreamRead.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `grantTableListStreams` <a name="grantTableListStreams" id="@cdklabs/genai-idp.TrackingTable.grantTableListStreams"></a>

```typescript
public grantTableListStreams(grantee: IGrantable): Grant
```

Permits an IAM Principal to list streams attached to current dynamodb table.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantTableListStreams.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal (no-op if undefined).

---

##### `grantWriteData` <a name="grantWriteData" id="@cdklabs/genai-idp.TrackingTable.grantWriteData"></a>

```typescript
public grantWriteData(grantee: IGrantable): Grant
```

Permits an IAM principal all data write operations to this table: BatchWriteItem, PutItem, UpdateItem, DeleteItem, DescribeTable.

Appropriate grants will also be added to the customer-managed KMS key
if one was configured.

###### `grantee`<sup>Required</sup> <a name="grantee" id="@cdklabs/genai-idp.TrackingTable.grantWriteData.parameter.grantee"></a>

- *Type:* aws-cdk-lib.aws_iam.IGrantable

The principal to grant access to.

---

##### `metric` <a name="metric" id="@cdklabs/genai-idp.TrackingTable.metric"></a>

```typescript
public metric(metricName: string, props?: MetricOptions): Metric
```

Return the given named metric for this Table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `metricName`<sup>Required</sup> <a name="metricName" id="@cdklabs/genai-idp.TrackingTable.metric.parameter.metricName"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metric.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConditionalCheckFailedRequests` <a name="metricConditionalCheckFailedRequests" id="@cdklabs/genai-idp.TrackingTable.metricConditionalCheckFailedRequests"></a>

```typescript
public metricConditionalCheckFailedRequests(props?: MetricOptions): Metric
```

Metric for the conditional check failed requests this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricConditionalCheckFailedRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedReadCapacityUnits` <a name="metricConsumedReadCapacityUnits" id="@cdklabs/genai-idp.TrackingTable.metricConsumedReadCapacityUnits"></a>

```typescript
public metricConsumedReadCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed read capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricConsumedReadCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricConsumedWriteCapacityUnits` <a name="metricConsumedWriteCapacityUnits" id="@cdklabs/genai-idp.TrackingTable.metricConsumedWriteCapacityUnits"></a>

```typescript
public metricConsumedWriteCapacityUnits(props?: MetricOptions): Metric
```

Metric for the consumed write capacity units this table.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricConsumedWriteCapacityUnits.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSuccessfulRequestLatency` <a name="metricSuccessfulRequestLatency" id="@cdklabs/genai-idp.TrackingTable.metricSuccessfulRequestLatency"></a>

```typescript
public metricSuccessfulRequestLatency(props?: MetricOptions): Metric
```

Metric for the successful request latency this table.

By default, the metric will be calculated as an average over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricSuccessfulRequestLatency.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### ~~`metricSystemErrors`~~ <a name="metricSystemErrors" id="@cdklabs/genai-idp.TrackingTable.metricSystemErrors"></a>

```typescript
public metricSystemErrors(props?: MetricOptions): Metric
```

Metric for the system errors this table.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricSystemErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricSystemErrorsForOperations` <a name="metricSystemErrorsForOperations" id="@cdklabs/genai-idp.TrackingTable.metricSystemErrorsForOperations"></a>

```typescript
public metricSystemErrorsForOperations(props?: SystemErrorsForOperationsMetricOptions): IMetric
```

Metric for the system errors this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricSystemErrorsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.SystemErrorsForOperationsMetricOptions

---

##### ~~`metricThrottledRequests`~~ <a name="metricThrottledRequests" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequests"></a>

```typescript
public metricThrottledRequests(props?: MetricOptions): Metric
```

How many requests are throttled on this table.

Default: sum over 5 minutes

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequests.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperation` <a name="metricThrottledRequestsForOperation" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperation"></a>

```typescript
public metricThrottledRequestsForOperation(operation: string, props?: MetricOptions): Metric
```

How many requests are throttled on this table, for the given operation.

Default: sum over 5 minutes

###### `operation`<sup>Required</sup> <a name="operation" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperation.parameter.operation"></a>

- *Type:* string

---

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperation.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `metricThrottledRequestsForOperations` <a name="metricThrottledRequestsForOperations" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperations"></a>

```typescript
public metricThrottledRequestsForOperations(props?: OperationsMetricOptions): IMetric
```

How many requests are throttled on this table.

This will sum errors across all possible operations.
Note that by default, each individual metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricThrottledRequestsForOperations.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.OperationsMetricOptions

---

##### `metricUserErrors` <a name="metricUserErrors" id="@cdklabs/genai-idp.TrackingTable.metricUserErrors"></a>

```typescript
public metricUserErrors(props?: MetricOptions): Metric
```

Metric for the user errors.

Note that this metric reports user errors across all
the tables in the account and region the table resides in.

By default, the metric will be calculated as a sum over a period of 5 minutes.
You can customize this by using the `statistic` and `period` properties.

###### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.metricUserErrors.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_cloudwatch.MetricOptions

---

##### `addGlobalSecondaryIndex` <a name="addGlobalSecondaryIndex" id="@cdklabs/genai-idp.TrackingTable.addGlobalSecondaryIndex"></a>

```typescript
public addGlobalSecondaryIndex(props: GlobalSecondaryIndexProps): void
```

Add a global secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.addGlobalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.GlobalSecondaryIndexProps

the property of global secondary index.

---

##### `addLocalSecondaryIndex` <a name="addLocalSecondaryIndex" id="@cdklabs/genai-idp.TrackingTable.addLocalSecondaryIndex"></a>

```typescript
public addLocalSecondaryIndex(props: LocalSecondaryIndexProps): void
```

Add a local secondary index of table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.addLocalSecondaryIndex.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.LocalSecondaryIndexProps

the property of local secondary index.

---

##### `autoScaleGlobalSecondaryIndexReadCapacity` <a name="autoScaleGlobalSecondaryIndexReadCapacity" id="@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexReadCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexReadCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleGlobalSecondaryIndexWriteCapacity` <a name="autoScaleGlobalSecondaryIndexWriteCapacity" id="@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexWriteCapacity"></a>

```typescript
public autoScaleGlobalSecondaryIndexWriteCapacity(indexName: string, props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for the given GSI.

###### `indexName`<sup>Required</sup> <a name="indexName" id="@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.indexName"></a>

- *Type:* string

---

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.autoScaleGlobalSecondaryIndexWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleReadCapacity` <a name="autoScaleReadCapacity" id="@cdklabs/genai-idp.TrackingTable.autoScaleReadCapacity"></a>

```typescript
public autoScaleReadCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable read capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.autoScaleReadCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `autoScaleWriteCapacity` <a name="autoScaleWriteCapacity" id="@cdklabs/genai-idp.TrackingTable.autoScaleWriteCapacity"></a>

```typescript
public autoScaleWriteCapacity(props: EnableScalingProps): IScalableTableAttribute
```

Enable write capacity scaling for this table.

###### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.TrackingTable.autoScaleWriteCapacity.parameter.props"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.EnableScalingProps

---

##### `schema` <a name="schema" id="@cdklabs/genai-idp.TrackingTable.schema"></a>

```typescript
public schema(indexName?: string): SchemaOptions
```

Get schema attributes of table or index.

###### `indexName`<sup>Optional</sup> <a name="indexName" id="@cdklabs/genai-idp.TrackingTable.schema.parameter.indexName"></a>

- *Type:* string

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.isResource">isResource</a></code> | Check whether the given construct is a Resource. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.fromTableArn">fromTableArn</a></code> | Creates a Table construct that represents an external table via table arn. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.fromTableAttributes">fromTableAttributes</a></code> | Creates a Table construct that represents an external table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.fromTableName">fromTableName</a></code> | Creates a Table construct that represents an external table via table name. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.TrackingTable.isConstruct"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

TrackingTable.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.TrackingTable.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.TrackingTable.isOwnedResource"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

TrackingTable.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.TrackingTable.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.TrackingTable.isResource"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

TrackingTable.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.TrackingTable.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `fromTableArn` <a name="fromTableArn" id="@cdklabs/genai-idp.TrackingTable.fromTableArn"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

TrackingTable.fromTableArn(scope: Construct, id: string, tableArn: string)
```

Creates a Table construct that represents an external table via table arn.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.TrackingTable.fromTableArn.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.TrackingTable.fromTableArn.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.TrackingTable.fromTableArn.parameter.tableArn"></a>

- *Type:* string

The table's ARN.

---

##### `fromTableAttributes` <a name="fromTableAttributes" id="@cdklabs/genai-idp.TrackingTable.fromTableAttributes"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

TrackingTable.fromTableAttributes(scope: Construct, id: string, attrs: TableAttributes)
```

Creates a Table construct that represents an external table.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.TrackingTable.fromTableAttributes.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.TrackingTable.fromTableAttributes.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `attrs`<sup>Required</sup> <a name="attrs" id="@cdklabs/genai-idp.TrackingTable.fromTableAttributes.parameter.attrs"></a>

- *Type:* aws-cdk-lib.aws_dynamodb.TableAttributes

A `TableAttributes` object.

---

##### `fromTableName` <a name="fromTableName" id="@cdklabs/genai-idp.TrackingTable.fromTableName"></a>

```typescript
import { TrackingTable } from '@cdklabs/genai-idp'

TrackingTable.fromTableName(scope: Construct, id: string, tableName: string)
```

Creates a Table construct that represents an external table via table name.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.TrackingTable.fromTableName.parameter.scope"></a>

- *Type:* constructs.Construct

The parent creating construct (usually `this`).

---

###### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.TrackingTable.fromTableName.parameter.id"></a>

- *Type:* string

The construct's name.

---

###### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.TrackingTable.fromTableName.parameter.tableName"></a>

- *Type:* string

The table's name.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | KMS encryption key, if this table uses a customer-managed encryption key. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.resourcePolicy">resourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | Resource policy to assign to DynamoDB Table. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.TrackingTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.TrackingTable.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.TrackingTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.TrackingTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.TrackingTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.TrackingTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

KMS encryption key, if this table uses a customer-managed encryption key.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp.TrackingTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

##### `resourcePolicy`<sup>Optional</sup> <a name="resourcePolicy" id="@cdklabs/genai-idp.TrackingTable.property.resourcePolicy"></a>

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
| <code><a href="#@cdklabs/genai-idp.TrackingTable.property.PROPERTY_INJECTION_ID">PROPERTY_INJECTION_ID</a></code> | <code>string</code> | Uniquely identifies this class. |

---

##### `PROPERTY_INJECTION_ID`<sup>Required</sup> <a name="PROPERTY_INJECTION_ID" id="@cdklabs/genai-idp.TrackingTable.property.PROPERTY_INJECTION_ID"></a>

```typescript
public readonly PROPERTY_INJECTION_ID: string;
```

- *Type:* string

Uniquely identifies this class.

---

### UserIdentity <a name="UserIdentity" id="@cdklabs/genai-idp.UserIdentity"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IUserIdentity">IUserIdentity</a>

A construct that manages user authentication and authorization. Provides Cognito resources for user management and secure access to AWS resources.

This construct creates and configures:
- A Cognito User Pool for user registration and authentication
- A User Pool Client for the web application to interact with Cognito
- An Identity Pool that provides temporary AWS credentials to authenticated users

The UserIdentity construct enables secure access to the document processing solution,
ensuring that only authorized users can upload documents, view results, and
perform administrative actions.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.UserIdentity.Initializer"></a>

```typescript
import { UserIdentity } from '@cdklabs/genai-idp'

new UserIdentity(scope: Construct, id: string, props?: UserIdentityProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.UserIdentityProps">UserIdentityProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.UserIdentity.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.UserIdentity.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Optional</sup> <a name="props" id="@cdklabs/genai-idp.UserIdentity.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.UserIdentityProps">UserIdentityProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.UserIdentity.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.UserIdentity.isConstruct"></a>

```typescript
import { UserIdentity } from '@cdklabs/genai-idp'

UserIdentity.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.UserIdentity.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.property.identityPool">identityPool</a></code> | <code>aws-cdk-lib.aws_cognito_identitypool.IdentityPool</code> | The Cognito Identity Pool that provides temporary AWS credentials. |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.property.userPool">userPool</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPool</code> | The Cognito UserPool that stores user identities and credentials. |
| <code><a href="#@cdklabs/genai-idp.UserIdentity.property.userPoolClient">userPoolClient</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPoolClient</code> | The Cognito UserPool Client used by the web application for OAuth flows. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.UserIdentity.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `identityPool`<sup>Required</sup> <a name="identityPool" id="@cdklabs/genai-idp.UserIdentity.property.identityPool"></a>

```typescript
public readonly identityPool: IdentityPool;
```

- *Type:* aws-cdk-lib.aws_cognito_identitypool.IdentityPool

The Cognito Identity Pool that provides temporary AWS credentials.

---

##### `userPool`<sup>Required</sup> <a name="userPool" id="@cdklabs/genai-idp.UserIdentity.property.userPool"></a>

```typescript
public readonly userPool: IUserPool;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPool

The Cognito UserPool that stores user identities and credentials.

---

##### `userPoolClient`<sup>Required</sup> <a name="userPoolClient" id="@cdklabs/genai-idp.UserIdentity.property.userPoolClient"></a>

```typescript
public readonly userPoolClient: IUserPoolClient;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPoolClient

The Cognito UserPool Client used by the web application for OAuth flows.

---


### WebApplication <a name="WebApplication" id="@cdklabs/genai-idp.WebApplication"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IWebApplication">IWebApplication</a>

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.WebApplication.Initializer"></a>

```typescript
import { WebApplication } from '@cdklabs/genai-idp'

new WebApplication(scope: Construct, id: string, props: WebApplicationProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.WebApplication.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.WebApplication.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.WebApplication.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.WebApplicationProps">WebApplicationProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.WebApplication.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.WebApplication.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.WebApplication.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.WebApplicationProps">WebApplicationProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.WebApplication.toString">toString</a></code> | Returns a string representation of this construct. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.WebApplication.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.WebApplication.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.WebApplication.isConstruct"></a>

```typescript
import { WebApplication } from '@cdklabs/genai-idp'

WebApplication.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.WebApplication.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.WebApplication.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.WebApplication.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where the web application assets are deployed. |
| <code><a href="#@cdklabs/genai-idp.WebApplication.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | The CloudFront distribution that serves the web application. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.WebApplication.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="@cdklabs/genai-idp.WebApplication.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where the web application assets are deployed.

Contains the static files for the web UI including HTML, CSS, and JavaScript.

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="@cdklabs/genai-idp.WebApplication.property.distribution"></a>

```typescript
public readonly distribution: IDistribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution

The CloudFront distribution that serves the web application.

Provides global content delivery with low latency and high performance.

---


### Workteam <a name="Workteam" id="@cdklabs/genai-idp.Workteam"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IWorkteam">IWorkteam</a>

A construct that creates a SageMaker workteam for Human-in-the-Loop (HITL) workflows.

This construct sets up a private workteam that can be used with Amazon A2I (Augmented AI)
for human review tasks. The workteam is integrated with Cognito for authentication
and user management.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.Workteam.Initializer"></a>

```typescript
import { Workteam } from '@cdklabs/genai-idp'

new Workteam(scope: Construct, id: string, props: WorkteamProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.Workteam.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | The construct scope. |
| <code><a href="#@cdklabs/genai-idp.Workteam.Initializer.parameter.id">id</a></code> | <code>string</code> | The construct ID. |
| <code><a href="#@cdklabs/genai-idp.Workteam.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.WorkteamProps">WorkteamProps</a></code> | Configuration properties for the workteam. |

---

##### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.Workteam.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope.

---

##### `id`<sup>Required</sup> <a name="id" id="@cdklabs/genai-idp.Workteam.Initializer.parameter.id"></a>

- *Type:* string

The construct ID.

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.Workteam.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.WorkteamProps">WorkteamProps</a>

Configuration properties for the workteam.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.Workteam.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#@cdklabs/genai-idp.Workteam.applyRemovalPolicy">applyRemovalPolicy</a></code> | Apply the given removal policy to this resource. |

---

##### `toString` <a name="toString" id="@cdklabs/genai-idp.Workteam.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `applyRemovalPolicy` <a name="applyRemovalPolicy" id="@cdklabs/genai-idp.Workteam.applyRemovalPolicy"></a>

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

###### `policy`<sup>Required</sup> <a name="policy" id="@cdklabs/genai-idp.Workteam.applyRemovalPolicy.parameter.policy"></a>

- *Type:* aws-cdk-lib.RemovalPolicy

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.Workteam.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |
| <code><a href="#@cdklabs/genai-idp.Workteam.isOwnedResource">isOwnedResource</a></code> | Returns true if the construct was created by CDK, and false otherwise. |
| <code><a href="#@cdklabs/genai-idp.Workteam.isResource">isResource</a></code> | Check whether the given construct is a Resource. |

---

##### `isConstruct` <a name="isConstruct" id="@cdklabs/genai-idp.Workteam.isConstruct"></a>

```typescript
import { Workteam } from '@cdklabs/genai-idp'

Workteam.isConstruct(x: any)
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

###### `x`<sup>Required</sup> <a name="x" id="@cdklabs/genai-idp.Workteam.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

##### `isOwnedResource` <a name="isOwnedResource" id="@cdklabs/genai-idp.Workteam.isOwnedResource"></a>

```typescript
import { Workteam } from '@cdklabs/genai-idp'

Workteam.isOwnedResource(construct: IConstruct)
```

Returns true if the construct was created by CDK, and false otherwise.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.Workteam.isOwnedResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

##### `isResource` <a name="isResource" id="@cdklabs/genai-idp.Workteam.isResource"></a>

```typescript
import { Workteam } from '@cdklabs/genai-idp'

Workteam.isResource(construct: IConstruct)
```

Check whether the given construct is a Resource.

###### `construct`<sup>Required</sup> <a name="construct" id="@cdklabs/genai-idp.Workteam.isResource.parameter.construct"></a>

- *Type:* constructs.IConstruct

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.Workteam.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.Workteam.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.Workteam.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.Workteam.property.workteamArn">workteamArn</a></code> | <code>string</code> | The ARN of the SageMaker workteam. |
| <code><a href="#@cdklabs/genai-idp.Workteam.property.workteamName">workteamName</a></code> | <code>string</code> | The name of the SageMaker workteam. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.Workteam.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.Workteam.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.Workteam.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `workteamArn`<sup>Required</sup> <a name="workteamArn" id="@cdklabs/genai-idp.Workteam.property.workteamArn"></a>

```typescript
public readonly workteamArn: string;
```

- *Type:* string

The ARN of the SageMaker workteam.

---

##### `workteamName`<sup>Required</sup> <a name="workteamName" id="@cdklabs/genai-idp.Workteam.property.workteamName"></a>

```typescript
public readonly workteamName: string;
```

- *Type:* string

The name of the SageMaker workteam.

---


## Structs <a name="Structs" id="Structs"></a>

### CognitoUpdaterHitlFunctionProps <a name="CognitoUpdaterHitlFunctionProps" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps"></a>

Properties for configuring the CognitoUpdaterHitlFunction.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.Initializer"></a>

```typescript
import { CognitoUpdaterHitlFunctionProps } from '@cdklabs/genai-idp'

const cognitoUpdaterHitlFunctionProps: CognitoUpdaterHitlFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all ipv6 network traffic. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.applicationLogLevelV2">applicationLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.ApplicationLogLevel</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.ipv6AllowedForDualStack">ipv6AllowedForDualStack</a></code> | <code>boolean</code> | Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.loggingFormat">loggingFormat</a></code> | <code>aws-cdk-lib.aws_lambda.LoggingFormat</code> | Sets the loggingFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group the function sends logs to. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRemovalPolicy">logRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Determine the removal policy of the log group that is auto-created by this construct. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.recursiveLoop">recursiveLoop</a></code> | <code>aws-cdk-lib.aws_lambda.RecursiveLoop</code> | Sets the Recursive Loop Protection for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.systemLogLevelV2">systemLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.SystemLogLevel</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.userPool">userPool</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPool</code> | The Cognito User Pool to update. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.userPoolClient">userPoolClient</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPoolClient</code> | The Cognito User Pool Client for A2I integration. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.workteamName">workteamName</a></code> | <code>string</code> | The name of the SageMaker workteam. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key for encrypting function resources. |
| <code><a href="#@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for the function. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all
outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllIpv6Outbound` directly on the security group.

---

##### ~~`applicationLogLevel`~~<sup>Optional</sup> <a name="applicationLogLevel" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.applicationLogLevel"></a>

- *Deprecated:* Use `applicationLogLevelV2` as a property instead.

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the application log level for the function.

---

##### `applicationLogLevelV2`<sup>Optional</sup> <a name="applicationLogLevelV2" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.applicationLogLevelV2"></a>

```typescript
public readonly applicationLogLevelV2: ApplicationLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.ApplicationLogLevel
- *Default:* ApplicationLogLevel.INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `ipv6AllowedForDualStack`<sup>Optional</sup> <a name="ipv6AllowedForDualStack" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.ipv6AllowedForDualStack"></a>

```typescript
public readonly ipv6AllowedForDualStack: boolean;
```

- *Type:* boolean
- *Default:* false

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

---

##### ~~`logFormat`~~<sup>Optional</sup> <a name="logFormat" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logFormat"></a>

- *Deprecated:* Use `loggingFormat` as a property instead.

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* "Text"

Sets the logFormat for the function.

---

##### `loggingFormat`<sup>Optional</sup> <a name="loggingFormat" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.loggingFormat"></a>

```typescript
public readonly loggingFormat: LoggingFormat;
```

- *Type:* aws-cdk-lib.aws_lambda.LoggingFormat
- *Default:* LoggingFormat.TEXT

Sets the loggingFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` - default log group created by Lambda

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/\<function name\>.
However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16.
If you are deploying to another type of region, please check regional availability first.

---

##### ~~`logRemovalPolicy`~~<sup>Optional</sup> <a name="logRemovalPolicy" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRemovalPolicy"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.Retain

Determine the removal policy of the log group that is auto-created by this construct.

Normally you want to retain the log group so you can diagnose issues
from logs even after a deployment that no longer includes the log group.
In that case, use the normal date-based retention policy to age out your
logs.

---

##### ~~`logRetention`~~<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRetention"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can.
Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property
to instruct the Lambda function to send logs to it.
Migrating from `logRetention` to `logGroup` will cause the name of the log group to change.
Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:
```ts
import * as logs from 'aws-cdk-lib/aws-logs';

declare const myLogGroup: logs.LogGroup;
myLogGroup.logGroupName;
```

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `recursiveLoop`<sup>Optional</sup> <a name="recursiveLoop" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.recursiveLoop"></a>

```typescript
public readonly recursiveLoop: RecursiveLoop;
```

- *Type:* aws-cdk-lib.aws_lambda.RecursiveLoop
- *Default:* RecursiveLoop.Terminate

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recursive loops.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported for Java 11, Java 17, Python 3.12, Python 3.13, and .NET 8 runtime

---

##### ~~`systemLogLevel`~~<sup>Optional</sup> <a name="systemLogLevel" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.systemLogLevel"></a>

- *Deprecated:* Use `systemLogLevelV2` as a property instead.

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the system log level for the function.

---

##### `systemLogLevelV2`<sup>Optional</sup> <a name="systemLogLevelV2" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.systemLogLevelV2"></a>

```typescript
public readonly systemLogLevelV2: SystemLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.SystemLogLevel
- *Default:* SystemLogLevel.INFO

Sets the system log level for the function.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

##### `userPool`<sup>Required</sup> <a name="userPool" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.userPool"></a>

```typescript
public readonly userPool: IUserPool;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPool

The Cognito User Pool to update.

---

##### `userPoolClient`<sup>Required</sup> <a name="userPoolClient" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.userPoolClient"></a>

```typescript
public readonly userPoolClient: IUserPoolClient;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPoolClient

The Cognito User Pool Client for A2I integration.

---

##### `workteamName`<sup>Required</sup> <a name="workteamName" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.workteamName"></a>

```typescript
public readonly workteamName: string;
```

- *Type:* string

The name of the SageMaker workteam.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key for encrypting function resources.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.CognitoUpdaterHitlFunctionProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>
- *Default:* LogLevel.INFO

The log level for the function.

---

### ConfigurationDefinitionProps <a name="ConfigurationDefinitionProps" id="@cdklabs/genai-idp.ConfigurationDefinitionProps"></a>

Properties for creating a configuration definition.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.ConfigurationDefinitionProps.Initializer"></a>

```typescript
import { ConfigurationDefinitionProps } from '@cdklabs/genai-idp'

const configurationDefinitionProps: ConfigurationDefinitionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationDefinitionProps.property.configurationObject">configurationObject</a></code> | <code>{[ key: string ]: any}</code> | The configuration object to use. |
| <code><a href="#@cdklabs/genai-idp.ConfigurationDefinitionProps.property.transforms">transforms</a></code> | <code><a href="#@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform">IConfigurationDefinitionPropertyTransform</a>[]</code> | Optional transformations to apply to specific properties. |

---

##### `configurationObject`<sup>Required</sup> <a name="configurationObject" id="@cdklabs/genai-idp.ConfigurationDefinitionProps.property.configurationObject"></a>

```typescript
public readonly configurationObject: {[ key: string ]: any};
```

- *Type:* {[ key: string ]: any}

The configuration object to use.

Contains all settings for the document processing pipeline.

---

##### `transforms`<sup>Optional</sup> <a name="transforms" id="@cdklabs/genai-idp.ConfigurationDefinitionProps.property.transforms"></a>

```typescript
public readonly transforms: IConfigurationDefinitionPropertyTransform[];
```

- *Type:* <a href="#@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform">IConfigurationDefinitionPropertyTransform</a>[]

Optional transformations to apply to specific properties.

Used to modify configuration values during initialization.

---

### CreateA2IResourcesFunctionProps <a name="CreateA2IResourcesFunctionProps" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps"></a>

Properties for configuring the CreateA2IResourcesFunction.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.Initializer"></a>

```typescript
import { CreateA2IResourcesFunctionProps } from '@cdklabs/genai-idp'

const createA2IResourcesFunctionProps: CreateA2IResourcesFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all ipv6 network traffic. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.applicationLogLevelV2">applicationLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.ApplicationLogLevel</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.ipv6AllowedForDualStack">ipv6AllowedForDualStack</a></code> | <code>boolean</code> | Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.loggingFormat">loggingFormat</a></code> | <code>aws-cdk-lib.aws_lambda.LoggingFormat</code> | Sets the loggingFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group the function sends logs to. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRemovalPolicy">logRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Determine the removal policy of the log group that is auto-created by this construct. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.recursiveLoop">recursiveLoop</a></code> | <code>aws-cdk-lib.aws_lambda.RecursiveLoop</code> | Sets the Recursive Loop Protection for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.systemLogLevelV2">systemLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.SystemLogLevel</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.flowDefinitionRoleArn">flowDefinitionRoleArn</a></code> | <code>string</code> | The ARN of the IAM role for A2I Flow Definition. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket for BDA output storage. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.workteamArn">workteamArn</a></code> | <code>string</code> | The ARN of the SageMaker workteam for A2I tasks. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key for encrypting function resources. |
| <code><a href="#@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for the function. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all
outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllIpv6Outbound` directly on the security group.

---

##### ~~`applicationLogLevel`~~<sup>Optional</sup> <a name="applicationLogLevel" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.applicationLogLevel"></a>

- *Deprecated:* Use `applicationLogLevelV2` as a property instead.

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the application log level for the function.

---

##### `applicationLogLevelV2`<sup>Optional</sup> <a name="applicationLogLevelV2" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.applicationLogLevelV2"></a>

```typescript
public readonly applicationLogLevelV2: ApplicationLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.ApplicationLogLevel
- *Default:* ApplicationLogLevel.INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `ipv6AllowedForDualStack`<sup>Optional</sup> <a name="ipv6AllowedForDualStack" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.ipv6AllowedForDualStack"></a>

```typescript
public readonly ipv6AllowedForDualStack: boolean;
```

- *Type:* boolean
- *Default:* false

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

---

##### ~~`logFormat`~~<sup>Optional</sup> <a name="logFormat" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logFormat"></a>

- *Deprecated:* Use `loggingFormat` as a property instead.

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* "Text"

Sets the logFormat for the function.

---

##### `loggingFormat`<sup>Optional</sup> <a name="loggingFormat" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.loggingFormat"></a>

```typescript
public readonly loggingFormat: LoggingFormat;
```

- *Type:* aws-cdk-lib.aws_lambda.LoggingFormat
- *Default:* LoggingFormat.TEXT

Sets the loggingFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` - default log group created by Lambda

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/\<function name\>.
However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16.
If you are deploying to another type of region, please check regional availability first.

---

##### ~~`logRemovalPolicy`~~<sup>Optional</sup> <a name="logRemovalPolicy" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRemovalPolicy"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.Retain

Determine the removal policy of the log group that is auto-created by this construct.

Normally you want to retain the log group so you can diagnose issues
from logs even after a deployment that no longer includes the log group.
In that case, use the normal date-based retention policy to age out your
logs.

---

##### ~~`logRetention`~~<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRetention"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can.
Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property
to instruct the Lambda function to send logs to it.
Migrating from `logRetention` to `logGroup` will cause the name of the log group to change.
Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:
```ts
import * as logs from 'aws-cdk-lib/aws-logs';

declare const myLogGroup: logs.LogGroup;
myLogGroup.logGroupName;
```

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `recursiveLoop`<sup>Optional</sup> <a name="recursiveLoop" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.recursiveLoop"></a>

```typescript
public readonly recursiveLoop: RecursiveLoop;
```

- *Type:* aws-cdk-lib.aws_lambda.RecursiveLoop
- *Default:* RecursiveLoop.Terminate

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recursive loops.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported for Java 11, Java 17, Python 3.12, Python 3.13, and .NET 8 runtime

---

##### ~~`systemLogLevel`~~<sup>Optional</sup> <a name="systemLogLevel" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.systemLogLevel"></a>

- *Deprecated:* Use `systemLogLevelV2` as a property instead.

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the system log level for the function.

---

##### `systemLogLevelV2`<sup>Optional</sup> <a name="systemLogLevelV2" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.systemLogLevelV2"></a>

```typescript
public readonly systemLogLevelV2: SystemLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.SystemLogLevel
- *Default:* SystemLogLevel.INFO

Sets the system log level for the function.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

##### `flowDefinitionRoleArn`<sup>Required</sup> <a name="flowDefinitionRoleArn" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.flowDefinitionRoleArn"></a>

```typescript
public readonly flowDefinitionRoleArn: string;
```

- *Type:* string

The ARN of the IAM role for A2I Flow Definition.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket for BDA output storage.

---

##### `workteamArn`<sup>Required</sup> <a name="workteamArn" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.workteamArn"></a>

```typescript
public readonly workteamArn: string;
```

- *Type:* string

The ARN of the SageMaker workteam for A2I tasks.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key for encrypting function resources.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.CreateA2IResourcesFunctionProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>
- *Default:* LogLevel.INFO

The log level for the function.

---

### DocumentProcessorAttachmentOptions <a name="DocumentProcessorAttachmentOptions" id="@cdklabs/genai-idp.DocumentProcessorAttachmentOptions"></a>

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.Initializer"></a>

```typescript
import { DocumentProcessorAttachmentOptions } from '@cdklabs/genai-idp'

const documentProcessorAttachmentOptions: DocumentProcessorAttachmentOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.property.evaluationBucket">evaluationBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.property.evaluationModel">evaluationModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | *No description.* |
| <code><a href="#@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.property.prefix">prefix</a></code> | <code>string</code> | *No description.* |

---

##### `evaluationBucket`<sup>Optional</sup> <a name="evaluationBucket" id="@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.property.evaluationBucket"></a>

```typescript
public readonly evaluationBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

---

##### `evaluationModel`<sup>Optional</sup> <a name="evaluationModel" id="@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.property.evaluationModel"></a>

```typescript
public readonly evaluationModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable

---

##### `prefix`<sup>Optional</sup> <a name="prefix" id="@cdklabs/genai-idp.DocumentProcessorAttachmentOptions.property.prefix"></a>

```typescript
public readonly prefix: string;
```

- *Type:* string

---

### DocumentProcessorProps <a name="DocumentProcessorProps" id="@cdklabs/genai-idp.DocumentProcessorProps"></a>

Properties required to configure a document processor implementation.

Document processors are responsible for extracting structured data from unstructured documents
using various AI/ML services and processing patterns.

The GenAI IDP Accelerator provides multiple processor implementations to handle different
document processing scenarios, from standard forms to complex specialized documents.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.DocumentProcessorProps.Initializer"></a>

```typescript
import { DocumentProcessorProps } from '@cdklabs/genai-idp'

const documentProcessorProps: DocumentProcessorProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.DocumentProcessorProps.property.environment">environment</a></code> | <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a></code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp.DocumentProcessorProps.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp.DocumentProcessorProps.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* <a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a>

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Optional</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp.DocumentProcessorProps.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number
- *Default:* 100 concurrent workflows

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

### FixedKeyTableProps <a name="FixedKeyTableProps" id="@cdklabs/genai-idp.FixedKeyTableProps"></a>

Properties for a DynamoDB Table that has a predefined, fixed partitionKey, sortKey, and timeToLiveAttribute.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.FixedKeyTableProps.Initializer"></a>

```typescript
import { FixedKeyTableProps } from '@cdklabs/genai-idp'

const fixedKeyTableProps: FixedKeyTableProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.billingMode">billingMode</a></code> | <code>aws-cdk-lib.aws_dynamodb.BillingMode</code> | Specify how you are charged for read and write throughput and how you manage capacity. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.contributorInsightsEnabled">contributorInsightsEnabled</a></code> | <code>boolean</code> | Whether CloudWatch contributor insights is enabled. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.deletionProtection">deletionProtection</a></code> | <code>boolean</code> | Enables deletion protection for the table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.encryption">encryption</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableEncryption</code> | Whether server-side encryption with an AWS managed customer master key is enabled. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | External KMS key to use for table encryption. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.importSource">importSource</a></code> | <code>aws-cdk-lib.aws_dynamodb.ImportSourceSpecification</code> | The properties of data being imported from the S3 bucket source to the table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.kinesisPrecisionTimestamp">kinesisPrecisionTimestamp</a></code> | <code>aws-cdk-lib.aws_dynamodb.ApproximateCreationDateTimePrecision</code> | Kinesis Data Stream approximate creation timestamp precision. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.kinesisStream">kinesisStream</a></code> | <code>aws-cdk-lib.aws_kinesis.IStream</code> | Kinesis Data Stream to capture item-level changes for the table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.maxReadRequestUnits">maxReadRequestUnits</a></code> | <code>number</code> | The maximum read request units for the table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.maxWriteRequestUnits">maxWriteRequestUnits</a></code> | <code>number</code> | The write request units for the table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.pointInTimeRecovery">pointInTimeRecovery</a></code> | <code>boolean</code> | Whether point-in-time recovery is enabled. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.pointInTimeRecoverySpecification">pointInTimeRecoverySpecification</a></code> | <code>aws-cdk-lib.aws_dynamodb.PointInTimeRecoverySpecification</code> | Whether point-in-time recovery is enabled and recoveryPeriodInDays is set. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.readCapacity">readCapacity</a></code> | <code>number</code> | The read capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.removalPolicy">removalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The removal policy to apply to the DynamoDB Table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.replicaRemovalPolicy">replicaRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | The removal policy to apply to the DynamoDB replica tables. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.replicationRegions">replicationRegions</a></code> | <code>string[]</code> | Regions where replica tables will be created. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.replicationTimeout">replicationTimeout</a></code> | <code>aws-cdk-lib.Duration</code> | The timeout for a table replication operation in a single region. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.resourcePolicy">resourcePolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyDocument</code> | Resource policy to assign to table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.stream">stream</a></code> | <code>aws-cdk-lib.aws_dynamodb.StreamViewType</code> | When an item in the table is modified, StreamViewType determines what information is written to the stream for this table. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.tableClass">tableClass</a></code> | <code>aws-cdk-lib.aws_dynamodb.TableClass</code> | Specify the table class. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.tableName">tableName</a></code> | <code>string</code> | Enforces a particular physical table name. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.waitForReplicationToFinish">waitForReplicationToFinish</a></code> | <code>boolean</code> | [WARNING: Use this flag with caution, misusing this flag may cause deleting existing replicas, refer to the detailed documentation for more information] Indicates whether CloudFormation stack waits for replication to finish. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.warmThroughput">warmThroughput</a></code> | <code>aws-cdk-lib.aws_dynamodb.WarmThroughput</code> | Specify values to pre-warm you DynamoDB Table Warm Throughput feature is not available for Global Table replicas using the `Table` construct. |
| <code><a href="#@cdklabs/genai-idp.FixedKeyTableProps.property.writeCapacity">writeCapacity</a></code> | <code>number</code> | The write capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput. |

---

##### `billingMode`<sup>Optional</sup> <a name="billingMode" id="@cdklabs/genai-idp.FixedKeyTableProps.property.billingMode"></a>

```typescript
public readonly billingMode: BillingMode;
```

- *Type:* aws-cdk-lib.aws_dynamodb.BillingMode
- *Default:* PROVISIONED if `replicationRegions` is not specified, PAY_PER_REQUEST otherwise

Specify how you are charged for read and write throughput and how you manage capacity.

---

##### `contributorInsightsEnabled`<sup>Optional</sup> <a name="contributorInsightsEnabled" id="@cdklabs/genai-idp.FixedKeyTableProps.property.contributorInsightsEnabled"></a>

```typescript
public readonly contributorInsightsEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

Whether CloudWatch contributor insights is enabled.

---

##### `deletionProtection`<sup>Optional</sup> <a name="deletionProtection" id="@cdklabs/genai-idp.FixedKeyTableProps.property.deletionProtection"></a>

```typescript
public readonly deletionProtection: boolean;
```

- *Type:* boolean
- *Default:* false

Enables deletion protection for the table.

---

##### `encryption`<sup>Optional</sup> <a name="encryption" id="@cdklabs/genai-idp.FixedKeyTableProps.property.encryption"></a>

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

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.FixedKeyTableProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* If `encryption` is set to `TableEncryption.CUSTOMER_MANAGED` and this property is undefined, a new KMS key will be created and associated with this table. If `encryption` and this property are both undefined, then the table is encrypted with an encryption key managed by DynamoDB, and you are not charged any fee for using it.

External KMS key to use for table encryption.

This property can only be set if `encryption` is set to `TableEncryption.CUSTOMER_MANAGED`.

---

##### `importSource`<sup>Optional</sup> <a name="importSource" id="@cdklabs/genai-idp.FixedKeyTableProps.property.importSource"></a>

```typescript
public readonly importSource: ImportSourceSpecification;
```

- *Type:* aws-cdk-lib.aws_dynamodb.ImportSourceSpecification
- *Default:* no data import from the S3 bucket

The properties of data being imported from the S3 bucket source to the table.

---

##### `kinesisPrecisionTimestamp`<sup>Optional</sup> <a name="kinesisPrecisionTimestamp" id="@cdklabs/genai-idp.FixedKeyTableProps.property.kinesisPrecisionTimestamp"></a>

```typescript
public readonly kinesisPrecisionTimestamp: ApproximateCreationDateTimePrecision;
```

- *Type:* aws-cdk-lib.aws_dynamodb.ApproximateCreationDateTimePrecision
- *Default:* ApproximateCreationDateTimePrecision.MICROSECOND

Kinesis Data Stream approximate creation timestamp precision.

---

##### `kinesisStream`<sup>Optional</sup> <a name="kinesisStream" id="@cdklabs/genai-idp.FixedKeyTableProps.property.kinesisStream"></a>

```typescript
public readonly kinesisStream: IStream;
```

- *Type:* aws-cdk-lib.aws_kinesis.IStream
- *Default:* no Kinesis Data Stream

Kinesis Data Stream to capture item-level changes for the table.

---

##### `maxReadRequestUnits`<sup>Optional</sup> <a name="maxReadRequestUnits" id="@cdklabs/genai-idp.FixedKeyTableProps.property.maxReadRequestUnits"></a>

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

##### `maxWriteRequestUnits`<sup>Optional</sup> <a name="maxWriteRequestUnits" id="@cdklabs/genai-idp.FixedKeyTableProps.property.maxWriteRequestUnits"></a>

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

##### ~~`pointInTimeRecovery`~~<sup>Optional</sup> <a name="pointInTimeRecovery" id="@cdklabs/genai-idp.FixedKeyTableProps.property.pointInTimeRecovery"></a>

- *Deprecated:* use `pointInTimeRecoverySpecification` instead

```typescript
public readonly pointInTimeRecovery: boolean;
```

- *Type:* boolean
- *Default:* false - point in time recovery is not enabled.

Whether point-in-time recovery is enabled.

---

##### `pointInTimeRecoverySpecification`<sup>Optional</sup> <a name="pointInTimeRecoverySpecification" id="@cdklabs/genai-idp.FixedKeyTableProps.property.pointInTimeRecoverySpecification"></a>

```typescript
public readonly pointInTimeRecoverySpecification: PointInTimeRecoverySpecification;
```

- *Type:* aws-cdk-lib.aws_dynamodb.PointInTimeRecoverySpecification
- *Default:* point in time recovery is not enabled.

Whether point-in-time recovery is enabled and recoveryPeriodInDays is set.

---

##### `readCapacity`<sup>Optional</sup> <a name="readCapacity" id="@cdklabs/genai-idp.FixedKeyTableProps.property.readCapacity"></a>

```typescript
public readonly readCapacity: number;
```

- *Type:* number
- *Default:* 5

The read capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput.

Can only be provided if billingMode is Provisioned.

---

##### `removalPolicy`<sup>Optional</sup> <a name="removalPolicy" id="@cdklabs/genai-idp.FixedKeyTableProps.property.removalPolicy"></a>

```typescript
public readonly removalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.RETAIN

The removal policy to apply to the DynamoDB Table.

---

##### `replicaRemovalPolicy`<sup>Optional</sup> <a name="replicaRemovalPolicy" id="@cdklabs/genai-idp.FixedKeyTableProps.property.replicaRemovalPolicy"></a>

```typescript
public readonly replicaRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* undefined - use DynamoDB Table's removal policy

The removal policy to apply to the DynamoDB replica tables.

---

##### `replicationRegions`<sup>Optional</sup> <a name="replicationRegions" id="@cdklabs/genai-idp.FixedKeyTableProps.property.replicationRegions"></a>

```typescript
public readonly replicationRegions: string[];
```

- *Type:* string[]
- *Default:* no replica tables are created

Regions where replica tables will be created.

---

##### `replicationTimeout`<sup>Optional</sup> <a name="replicationTimeout" id="@cdklabs/genai-idp.FixedKeyTableProps.property.replicationTimeout"></a>

```typescript
public readonly replicationTimeout: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.minutes(30)

The timeout for a table replication operation in a single region.

---

##### `resourcePolicy`<sup>Optional</sup> <a name="resourcePolicy" id="@cdklabs/genai-idp.FixedKeyTableProps.property.resourcePolicy"></a>

```typescript
public readonly resourcePolicy: PolicyDocument;
```

- *Type:* aws-cdk-lib.aws_iam.PolicyDocument
- *Default:* No resource policy statement

Resource policy to assign to table.

---

##### `stream`<sup>Optional</sup> <a name="stream" id="@cdklabs/genai-idp.FixedKeyTableProps.property.stream"></a>

```typescript
public readonly stream: StreamViewType;
```

- *Type:* aws-cdk-lib.aws_dynamodb.StreamViewType
- *Default:* streams are disabled unless `replicationRegions` is specified

When an item in the table is modified, StreamViewType determines what information is written to the stream for this table.

---

##### `tableClass`<sup>Optional</sup> <a name="tableClass" id="@cdklabs/genai-idp.FixedKeyTableProps.property.tableClass"></a>

```typescript
public readonly tableClass: TableClass;
```

- *Type:* aws-cdk-lib.aws_dynamodb.TableClass
- *Default:* STANDARD

Specify the table class.

---

##### `tableName`<sup>Optional</sup> <a name="tableName" id="@cdklabs/genai-idp.FixedKeyTableProps.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string
- *Default:* <generated>

Enforces a particular physical table name.

---

##### `waitForReplicationToFinish`<sup>Optional</sup> <a name="waitForReplicationToFinish" id="@cdklabs/genai-idp.FixedKeyTableProps.property.waitForReplicationToFinish"></a>

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

##### `warmThroughput`<sup>Optional</sup> <a name="warmThroughput" id="@cdklabs/genai-idp.FixedKeyTableProps.property.warmThroughput"></a>

```typescript
public readonly warmThroughput: WarmThroughput;
```

- *Type:* aws-cdk-lib.aws_dynamodb.WarmThroughput
- *Default:* warm throughput is not configured

Specify values to pre-warm you DynamoDB Table Warm Throughput feature is not available for Global Table replicas using the `Table` construct.

To enable Warm Throughput, use the `TableV2` construct instead.

---

##### `writeCapacity`<sup>Optional</sup> <a name="writeCapacity" id="@cdklabs/genai-idp.FixedKeyTableProps.property.writeCapacity"></a>

```typescript
public readonly writeCapacity: number;
```

- *Type:* number
- *Default:* 5

The write capacity for the table. Careful if you add Global Secondary Indexes, as those will share the table's provisioned throughput.

Can only be provided if billingMode is Provisioned.

---

### GetWorkforceUrlFunctionProps <a name="GetWorkforceUrlFunctionProps" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps"></a>

Properties for configuring the GetWorkforceUrlFunction.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.Initializer"></a>

```typescript
import { GetWorkforceUrlFunctionProps } from '@cdklabs/genai-idp'

const getWorkforceUrlFunctionProps: GetWorkforceUrlFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all ipv6 network traffic. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.applicationLogLevelV2">applicationLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.ApplicationLogLevel</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.ipv6AllowedForDualStack">ipv6AllowedForDualStack</a></code> | <code>boolean</code> | Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.loggingFormat">loggingFormat</a></code> | <code>aws-cdk-lib.aws_lambda.LoggingFormat</code> | Sets the loggingFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group the function sends logs to. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRemovalPolicy">logRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Determine the removal policy of the log group that is auto-created by this construct. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.recursiveLoop">recursiveLoop</a></code> | <code>aws-cdk-lib.aws_lambda.RecursiveLoop</code> | Sets the Recursive Loop Protection for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.systemLogLevelV2">systemLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.SystemLogLevel</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.workteamName">workteamName</a></code> | <code>string</code> | The name of the SageMaker workteam. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key for encrypting function resources. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.existingPrivateWorkforceArn">existingPrivateWorkforceArn</a></code> | <code>string</code> | Optional existing private workforce ARN. |
| <code><a href="#@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for the function. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all
outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllIpv6Outbound` directly on the security group.

---

##### ~~`applicationLogLevel`~~<sup>Optional</sup> <a name="applicationLogLevel" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.applicationLogLevel"></a>

- *Deprecated:* Use `applicationLogLevelV2` as a property instead.

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the application log level for the function.

---

##### `applicationLogLevelV2`<sup>Optional</sup> <a name="applicationLogLevelV2" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.applicationLogLevelV2"></a>

```typescript
public readonly applicationLogLevelV2: ApplicationLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.ApplicationLogLevel
- *Default:* ApplicationLogLevel.INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `ipv6AllowedForDualStack`<sup>Optional</sup> <a name="ipv6AllowedForDualStack" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.ipv6AllowedForDualStack"></a>

```typescript
public readonly ipv6AllowedForDualStack: boolean;
```

- *Type:* boolean
- *Default:* false

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

---

##### ~~`logFormat`~~<sup>Optional</sup> <a name="logFormat" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logFormat"></a>

- *Deprecated:* Use `loggingFormat` as a property instead.

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* "Text"

Sets the logFormat for the function.

---

##### `loggingFormat`<sup>Optional</sup> <a name="loggingFormat" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.loggingFormat"></a>

```typescript
public readonly loggingFormat: LoggingFormat;
```

- *Type:* aws-cdk-lib.aws_lambda.LoggingFormat
- *Default:* LoggingFormat.TEXT

Sets the loggingFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` - default log group created by Lambda

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/\<function name\>.
However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16.
If you are deploying to another type of region, please check regional availability first.

---

##### ~~`logRemovalPolicy`~~<sup>Optional</sup> <a name="logRemovalPolicy" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRemovalPolicy"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.Retain

Determine the removal policy of the log group that is auto-created by this construct.

Normally you want to retain the log group so you can diagnose issues
from logs even after a deployment that no longer includes the log group.
In that case, use the normal date-based retention policy to age out your
logs.

---

##### ~~`logRetention`~~<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRetention"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can.
Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property
to instruct the Lambda function to send logs to it.
Migrating from `logRetention` to `logGroup` will cause the name of the log group to change.
Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:
```ts
import * as logs from 'aws-cdk-lib/aws-logs';

declare const myLogGroup: logs.LogGroup;
myLogGroup.logGroupName;
```

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `recursiveLoop`<sup>Optional</sup> <a name="recursiveLoop" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.recursiveLoop"></a>

```typescript
public readonly recursiveLoop: RecursiveLoop;
```

- *Type:* aws-cdk-lib.aws_lambda.RecursiveLoop
- *Default:* RecursiveLoop.Terminate

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recursive loops.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported for Java 11, Java 17, Python 3.12, Python 3.13, and .NET 8 runtime

---

##### ~~`systemLogLevel`~~<sup>Optional</sup> <a name="systemLogLevel" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.systemLogLevel"></a>

- *Deprecated:* Use `systemLogLevelV2` as a property instead.

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the system log level for the function.

---

##### `systemLogLevelV2`<sup>Optional</sup> <a name="systemLogLevelV2" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.systemLogLevelV2"></a>

```typescript
public readonly systemLogLevelV2: SystemLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.SystemLogLevel
- *Default:* SystemLogLevel.INFO

Sets the system log level for the function.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

##### `workteamName`<sup>Required</sup> <a name="workteamName" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.workteamName"></a>

```typescript
public readonly workteamName: string;
```

- *Type:* string

The name of the SageMaker workteam.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key for encrypting function resources.

---

##### `existingPrivateWorkforceArn`<sup>Optional</sup> <a name="existingPrivateWorkforceArn" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.existingPrivateWorkforceArn"></a>

```typescript
public readonly existingPrivateWorkforceArn: string;
```

- *Type:* string

Optional existing private workforce ARN.

When provided, the function will use this workforce instead of the workteam name.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.GetWorkforceUrlFunctionProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>
- *Default:* LogLevel.INFO

The log level for the function.

---

### HitlEnvironmentProps <a name="HitlEnvironmentProps" id="@cdklabs/genai-idp.HitlEnvironmentProps"></a>

Properties for configuring the HITL environment.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.HitlEnvironmentProps.Initializer"></a>

```typescript
import { HitlEnvironmentProps } from '@cdklabs/genai-idp'

const hitlEnvironmentProps: HitlEnvironmentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket for BDA output storage. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.userGroup">userGroup</a></code> | <code>aws-cdk-lib.aws_cognito.CfnUserPoolGroup</code> | The Cognito User Group that contains the human reviewers. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.userPool">userPool</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPool</code> | The Cognito User Pool for authentication. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key for encrypting HITL resources. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.existingPrivateWorkforceArn">existingPrivateWorkforceArn</a></code> | <code>string</code> | Optional existing private workforce ARN to use instead of creating a new workteam. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for HITL functions. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The retention period for CloudWatch logs. |
| <code><a href="#@cdklabs/genai-idp.HitlEnvironmentProps.property.vpcConfiguration">vpcConfiguration</a></code> | <code><a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a></code> | Optional VPC configuration for HITL functions. |

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket for BDA output storage.

---

##### `userGroup`<sup>Required</sup> <a name="userGroup" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.userGroup"></a>

```typescript
public readonly userGroup: CfnUserPoolGroup;
```

- *Type:* aws-cdk-lib.aws_cognito.CfnUserPoolGroup

The Cognito User Group that contains the human reviewers.

---

##### `userPool`<sup>Required</sup> <a name="userPool" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.userPool"></a>

```typescript
public readonly userPool: IUserPool;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPool

The Cognito User Pool for authentication.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key for encrypting HITL resources.

---

##### `existingPrivateWorkforceArn`<sup>Optional</sup> <a name="existingPrivateWorkforceArn" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.existingPrivateWorkforceArn"></a>

```typescript
public readonly existingPrivateWorkforceArn: string;
```

- *Type:* string

Optional existing private workforce ARN to use instead of creating a new workteam.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>
- *Default:* LogLevel.INFO

The log level for HITL functions.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.ONE_WEEK

The retention period for CloudWatch logs.

---

##### `vpcConfiguration`<sup>Optional</sup> <a name="vpcConfiguration" id="@cdklabs/genai-idp.HitlEnvironmentProps.property.vpcConfiguration"></a>

```typescript
public readonly vpcConfiguration: VpcConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a>

Optional VPC configuration for HITL functions.

---

### IdpPythonFunctionOptions <a name="IdpPythonFunctionOptions" id="@cdklabs/genai-idp.IdpPythonFunctionOptions"></a>

Options for a Python Lambda function.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.Initializer"></a>

```typescript
import { IdpPythonFunctionOptions } from '@cdklabs/genai-idp'

const idpPythonFunctionOptions: IdpPythonFunctionOptions = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all ipv6 network traffic. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.applicationLogLevelV2">applicationLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.ApplicationLogLevel</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.ipv6AllowedForDualStack">ipv6AllowedForDualStack</a></code> | <code>boolean</code> | Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.loggingFormat">loggingFormat</a></code> | <code>aws-cdk-lib.aws_lambda.LoggingFormat</code> | Sets the loggingFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group the function sends logs to. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRemovalPolicy">logRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Determine the removal policy of the log group that is auto-created by this construct. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.recursiveLoop">recursiveLoop</a></code> | <code>aws-cdk-lib.aws_lambda.RecursiveLoop</code> | Sets the Recursive Loop Protection for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.systemLogLevelV2">systemLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.SystemLogLevel</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#@cdklabs/genai-idp.IdpPythonFunctionOptions.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all
outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllIpv6Outbound` directly on the security group.

---

##### ~~`applicationLogLevel`~~<sup>Optional</sup> <a name="applicationLogLevel" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.applicationLogLevel"></a>

- *Deprecated:* Use `applicationLogLevelV2` as a property instead.

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the application log level for the function.

---

##### `applicationLogLevelV2`<sup>Optional</sup> <a name="applicationLogLevelV2" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.applicationLogLevelV2"></a>

```typescript
public readonly applicationLogLevelV2: ApplicationLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.ApplicationLogLevel
- *Default:* ApplicationLogLevel.INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `ipv6AllowedForDualStack`<sup>Optional</sup> <a name="ipv6AllowedForDualStack" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.ipv6AllowedForDualStack"></a>

```typescript
public readonly ipv6AllowedForDualStack: boolean;
```

- *Type:* boolean
- *Default:* false

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

---

##### ~~`logFormat`~~<sup>Optional</sup> <a name="logFormat" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logFormat"></a>

- *Deprecated:* Use `loggingFormat` as a property instead.

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* "Text"

Sets the logFormat for the function.

---

##### `loggingFormat`<sup>Optional</sup> <a name="loggingFormat" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.loggingFormat"></a>

```typescript
public readonly loggingFormat: LoggingFormat;
```

- *Type:* aws-cdk-lib.aws_lambda.LoggingFormat
- *Default:* LoggingFormat.TEXT

Sets the loggingFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` - default log group created by Lambda

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/\<function name\>.
However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16.
If you are deploying to another type of region, please check regional availability first.

---

##### ~~`logRemovalPolicy`~~<sup>Optional</sup> <a name="logRemovalPolicy" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRemovalPolicy"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.Retain

Determine the removal policy of the log group that is auto-created by this construct.

Normally you want to retain the log group so you can diagnose issues
from logs even after a deployment that no longer includes the log group.
In that case, use the normal date-based retention policy to age out your
logs.

---

##### ~~`logRetention`~~<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRetention"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can.
Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property
to instruct the Lambda function to send logs to it.
Migrating from `logRetention` to `logGroup` will cause the name of the log group to change.
Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:
```ts
import * as logs from 'aws-cdk-lib/aws-logs';

declare const myLogGroup: logs.LogGroup;
myLogGroup.logGroupName;
```

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `recursiveLoop`<sup>Optional</sup> <a name="recursiveLoop" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.recursiveLoop"></a>

```typescript
public readonly recursiveLoop: RecursiveLoop;
```

- *Type:* aws-cdk-lib.aws_lambda.RecursiveLoop
- *Default:* RecursiveLoop.Terminate

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recursive loops.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported for Java 11, Java 17, Python 3.12, Python 3.13, and .NET 8 runtime

---

##### ~~`systemLogLevel`~~<sup>Optional</sup> <a name="systemLogLevel" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.systemLogLevel"></a>

- *Deprecated:* Use `systemLogLevelV2` as a property instead.

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the system log level for the function.

---

##### `systemLogLevelV2`<sup>Optional</sup> <a name="systemLogLevelV2" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.systemLogLevelV2"></a>

```typescript
public readonly systemLogLevelV2: SystemLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.SystemLogLevel
- *Default:* SystemLogLevel.INFO

Sets the system log level for the function.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="@cdklabs/genai-idp.IdpPythonFunctionOptions.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

### ProcessingEnvironmentApiBaseProps <a name="ProcessingEnvironmentApiBaseProps" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps"></a>

Properties for a GraphQL API that has a predefined schema.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.Initializer"></a>

```typescript
import { ProcessingEnvironmentApiBaseProps } from '@cdklabs/genai-idp'

const processingEnvironmentApiBaseProps: ProcessingEnvironmentApiBaseProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.authorizationConfig">authorizationConfig</a></code> | <code>aws-cdk-lib.aws_appsync.AuthorizationConfig</code> | Optional authorization configuration. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.domainName">domainName</a></code> | <code>aws-cdk-lib.aws_appsync.DomainOptions</code> | The domain name configuration for the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.environmentVariables">environmentVariables</a></code> | <code>{[ key: string ]: string}</code> | A map containing the list of resources with their properties and environment variables. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.introspectionConfig">introspectionConfig</a></code> | <code>aws-cdk-lib.aws_appsync.IntrospectionConfig</code> | A value indicating whether the API to enable (ENABLED) or disable (DISABLED) introspection. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.logConfig">logConfig</a></code> | <code>aws-cdk-lib.aws_appsync.LogConfig</code> | Logging configuration for this api. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.name">name</a></code> | <code>string</code> | the name of the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.ownerContact">ownerContact</a></code> | <code>string</code> | The owner contact information for an API resource. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.queryDepthLimit">queryDepthLimit</a></code> | <code>number</code> | A number indicating the maximum depth resolvers should be accepted when handling queries. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.resolverCountLimit">resolverCountLimit</a></code> | <code>number</code> | A number indicating the maximum number of resolvers that should be accepted when handling queries. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.visibility">visibility</a></code> | <code>aws-cdk-lib.aws_appsync.Visibility</code> | A value indicating whether the API is accessible from anywhere (GLOBAL) or can only be access from a VPC (PRIVATE). |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.xrayEnabled">xrayEnabled</a></code> | <code>boolean</code> | A flag indicating whether or not X-Ray tracing is enabled for the GraphQL API. |

---

##### `authorizationConfig`<sup>Optional</sup> <a name="authorizationConfig" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.authorizationConfig"></a>

```typescript
public readonly authorizationConfig: AuthorizationConfig;
```

- *Type:* aws-cdk-lib.aws_appsync.AuthorizationConfig
- *Default:* API Key authorization

Optional authorization configuration.

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.domainName"></a>

```typescript
public readonly domainName: DomainOptions;
```

- *Type:* aws-cdk-lib.aws_appsync.DomainOptions
- *Default:* no domain name

The domain name configuration for the GraphQL API.

The Route 53 hosted zone and CName DNS record must be configured in addition to this setting to
enable custom domain URL

---

##### `environmentVariables`<sup>Optional</sup> <a name="environmentVariables" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.environmentVariables"></a>

```typescript
public readonly environmentVariables: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No environment variables.

A map containing the list of resources with their properties and environment variables.

There are a few rules you must follow when creating keys and values:
  - Keys must begin with a letter.
  - Keys must be between 2 and 64 characters long.
  - Keys can only contain letters, numbers, and the underscore character (_).
  - Values can be up to 512 characters long.
  - You can configure up to 50 key-value pairs in a GraphQL API.

---

##### `introspectionConfig`<sup>Optional</sup> <a name="introspectionConfig" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.introspectionConfig"></a>

```typescript
public readonly introspectionConfig: IntrospectionConfig;
```

- *Type:* aws-cdk-lib.aws_appsync.IntrospectionConfig
- *Default:* IntrospectionConfig.ENABLED

A value indicating whether the API to enable (ENABLED) or disable (DISABLED) introspection.

---

##### `logConfig`<sup>Optional</sup> <a name="logConfig" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.logConfig"></a>

```typescript
public readonly logConfig: LogConfig;
```

- *Type:* aws-cdk-lib.aws_appsync.LogConfig
- *Default:* None

Logging configuration for this api.

---

##### `name`<sup>Optional</sup> <a name="name" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

the name of the GraphQL API.

---

##### `ownerContact`<sup>Optional</sup> <a name="ownerContact" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.ownerContact"></a>

```typescript
public readonly ownerContact: string;
```

- *Type:* string
- *Default:* No owner contact.

The owner contact information for an API resource.

This field accepts any string input with a length of 0 - 256 characters.

---

##### `queryDepthLimit`<sup>Optional</sup> <a name="queryDepthLimit" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.queryDepthLimit"></a>

```typescript
public readonly queryDepthLimit: number;
```

- *Type:* number
- *Default:* The default value is 0 (or unspecified) which indicates no maximum depth.

A number indicating the maximum depth resolvers should be accepted when handling queries.

Value must be withing range of 0 to 75

---

##### `resolverCountLimit`<sup>Optional</sup> <a name="resolverCountLimit" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.resolverCountLimit"></a>

```typescript
public readonly resolverCountLimit: number;
```

- *Type:* number
- *Default:* The default value is 0 (or unspecified), which will set the limit to 10000

A number indicating the maximum number of resolvers that should be accepted when handling queries.

Value must be withing range of 0 to 10000

---

##### `visibility`<sup>Optional</sup> <a name="visibility" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.visibility"></a>

```typescript
public readonly visibility: Visibility;
```

- *Type:* aws-cdk-lib.aws_appsync.Visibility
- *Default:* GLOBAL

A value indicating whether the API is accessible from anywhere (GLOBAL) or can only be access from a VPC (PRIVATE).

---

##### `xrayEnabled`<sup>Optional</sup> <a name="xrayEnabled" id="@cdklabs/genai-idp.ProcessingEnvironmentApiBaseProps.property.xrayEnabled"></a>

```typescript
public readonly xrayEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

A flag indicating whether or not X-Ray tracing is enabled for the GraphQL API.

---

### ProcessingEnvironmentApiProps <a name="ProcessingEnvironmentApiProps" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps"></a>

Properties for configuring the ProcessingEnvironmentApi construct.

Extends the base properties with additional settings specific to document processing.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.Initializer"></a>

```typescript
import { ProcessingEnvironmentApiProps } from '@cdklabs/genai-idp'

const processingEnvironmentApiProps: ProcessingEnvironmentApiProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.authorizationConfig">authorizationConfig</a></code> | <code>aws-cdk-lib.aws_appsync.AuthorizationConfig</code> | Optional authorization configuration. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.domainName">domainName</a></code> | <code>aws-cdk-lib.aws_appsync.DomainOptions</code> | The domain name configuration for the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.environmentVariables">environmentVariables</a></code> | <code>{[ key: string ]: string}</code> | A map containing the list of resources with their properties and environment variables. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.introspectionConfig">introspectionConfig</a></code> | <code>aws-cdk-lib.aws_appsync.IntrospectionConfig</code> | A value indicating whether the API to enable (ENABLED) or disable (DISABLED) introspection. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.logConfig">logConfig</a></code> | <code>aws-cdk-lib.aws_appsync.LogConfig</code> | Logging configuration for this api. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.name">name</a></code> | <code>string</code> | the name of the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.ownerContact">ownerContact</a></code> | <code>string</code> | The owner contact information for an API resource. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.queryDepthLimit">queryDepthLimit</a></code> | <code>number</code> | A number indicating the maximum depth resolvers should be accepted when handling queries. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.resolverCountLimit">resolverCountLimit</a></code> | <code>number</code> | A number indicating the maximum number of resolvers that should be accepted when handling queries. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.visibility">visibility</a></code> | <code>aws-cdk-lib.aws_appsync.Visibility</code> | A value indicating whether the API is accessible from anywhere (GLOBAL) or can only be access from a VPC (PRIVATE). |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.xrayEnabled">xrayEnabled</a></code> | <code>boolean</code> | A flag indicating whether or not X-Ray tracing is enabled for the GraphQL API. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.configurationTable">configurationTable</a></code> | <code><a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a></code> | The DynamoDB table that stores configuration settings. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.inputBucket">inputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where source documents to be processed are stored. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where processed documents and extraction results are stored. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.trackingTable">trackingTable</a></code> | <code><a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a></code> | The DynamoDB table that tracks document processing status and metadata. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key used for encrypting sensitive data in the processing environment. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.evaluationBaselineBucket">evaluationBaselineBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional S3 bucket name for storing evaluation baseline documents. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.knowledgeBase">knowledgeBase</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IKnowledgeBase</code> | Optional knowledge base identifier for document querying capabilities. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.knowledgeBaseGuardrail">knowledgeBaseGuardrail</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail</code> | Optional Bedrock guardrail to apply to model interactions. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.knowledgeBaseModel">knowledgeBaseModel</a></code> | <code>@cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable</code> | Optional invokable model to use for knowledge base queries. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for document processing components. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The retention period for CloudWatch logs generated by document processing components. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | Optional Step Functions state machine for document processing workflow. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.vpcConfiguration">vpcConfiguration</a></code> | <code><a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a></code> | Optional VPC configuration for document processing components. |

---

##### `authorizationConfig`<sup>Optional</sup> <a name="authorizationConfig" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.authorizationConfig"></a>

```typescript
public readonly authorizationConfig: AuthorizationConfig;
```

- *Type:* aws-cdk-lib.aws_appsync.AuthorizationConfig
- *Default:* API Key authorization

Optional authorization configuration.

---

##### `domainName`<sup>Optional</sup> <a name="domainName" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.domainName"></a>

```typescript
public readonly domainName: DomainOptions;
```

- *Type:* aws-cdk-lib.aws_appsync.DomainOptions
- *Default:* no domain name

The domain name configuration for the GraphQL API.

The Route 53 hosted zone and CName DNS record must be configured in addition to this setting to
enable custom domain URL

---

##### `environmentVariables`<sup>Optional</sup> <a name="environmentVariables" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.environmentVariables"></a>

```typescript
public readonly environmentVariables: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}
- *Default:* No environment variables.

A map containing the list of resources with their properties and environment variables.

There are a few rules you must follow when creating keys and values:
  - Keys must begin with a letter.
  - Keys must be between 2 and 64 characters long.
  - Keys can only contain letters, numbers, and the underscore character (_).
  - Values can be up to 512 characters long.
  - You can configure up to 50 key-value pairs in a GraphQL API.

---

##### `introspectionConfig`<sup>Optional</sup> <a name="introspectionConfig" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.introspectionConfig"></a>

```typescript
public readonly introspectionConfig: IntrospectionConfig;
```

- *Type:* aws-cdk-lib.aws_appsync.IntrospectionConfig
- *Default:* IntrospectionConfig.ENABLED

A value indicating whether the API to enable (ENABLED) or disable (DISABLED) introspection.

---

##### `logConfig`<sup>Optional</sup> <a name="logConfig" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.logConfig"></a>

```typescript
public readonly logConfig: LogConfig;
```

- *Type:* aws-cdk-lib.aws_appsync.LogConfig
- *Default:* None

Logging configuration for this api.

---

##### `name`<sup>Optional</sup> <a name="name" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.name"></a>

```typescript
public readonly name: string;
```

- *Type:* string

the name of the GraphQL API.

---

##### `ownerContact`<sup>Optional</sup> <a name="ownerContact" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.ownerContact"></a>

```typescript
public readonly ownerContact: string;
```

- *Type:* string
- *Default:* No owner contact.

The owner contact information for an API resource.

This field accepts any string input with a length of 0 - 256 characters.

---

##### `queryDepthLimit`<sup>Optional</sup> <a name="queryDepthLimit" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.queryDepthLimit"></a>

```typescript
public readonly queryDepthLimit: number;
```

- *Type:* number
- *Default:* The default value is 0 (or unspecified) which indicates no maximum depth.

A number indicating the maximum depth resolvers should be accepted when handling queries.

Value must be withing range of 0 to 75

---

##### `resolverCountLimit`<sup>Optional</sup> <a name="resolverCountLimit" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.resolverCountLimit"></a>

```typescript
public readonly resolverCountLimit: number;
```

- *Type:* number
- *Default:* The default value is 0 (or unspecified), which will set the limit to 10000

A number indicating the maximum number of resolvers that should be accepted when handling queries.

Value must be withing range of 0 to 10000

---

##### `visibility`<sup>Optional</sup> <a name="visibility" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.visibility"></a>

```typescript
public readonly visibility: Visibility;
```

- *Type:* aws-cdk-lib.aws_appsync.Visibility
- *Default:* GLOBAL

A value indicating whether the API is accessible from anywhere (GLOBAL) or can only be access from a VPC (PRIVATE).

---

##### `xrayEnabled`<sup>Optional</sup> <a name="xrayEnabled" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.xrayEnabled"></a>

```typescript
public readonly xrayEnabled: boolean;
```

- *Type:* boolean
- *Default:* false

A flag indicating whether or not X-Ray tracing is enabled for the GraphQL API.

---

##### `configurationTable`<sup>Required</sup> <a name="configurationTable" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.configurationTable"></a>

```typescript
public readonly configurationTable: IConfigurationTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

The DynamoDB table that stores configuration settings.

Contains document schemas, extraction parameters, and other system-wide settings.

---

##### `inputBucket`<sup>Required</sup> <a name="inputBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.inputBucket"></a>

```typescript
public readonly inputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where source documents to be processed are stored.

This bucket is monitored for new document uploads to trigger processing.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where processed documents and extraction results are stored.

Contains the structured data output and processing artifacts.

---

##### `trackingTable`<sup>Required</sup> <a name="trackingTable" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.trackingTable"></a>

```typescript
public readonly trackingTable: ITrackingTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

The DynamoDB table that tracks document processing status and metadata.

Stores information about documents being processed, including status and results.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key used for encrypting sensitive data in the processing environment.

When provided, ensures that document content and metadata are encrypted at rest.

---

##### `evaluationBaselineBucket`<sup>Optional</sup> <a name="evaluationBaselineBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.evaluationBaselineBucket"></a>

```typescript
public readonly evaluationBaselineBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Optional S3 bucket name for storing evaluation baseline documents.

Used for comparing extraction results against known correct values
to measure accuracy and evaluate model performance.

---

##### `knowledgeBase`<sup>Optional</sup> <a name="knowledgeBase" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.knowledgeBase"></a>

```typescript
public readonly knowledgeBase: IKnowledgeBase;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IKnowledgeBase

Optional knowledge base identifier for document querying capabilities.

When provided, enables natural language querying of processed documents
using the specified Amazon Bedrock knowledge base.

---

##### `knowledgeBaseGuardrail`<sup>Optional</sup> <a name="knowledgeBaseGuardrail" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.knowledgeBaseGuardrail"></a>

```typescript
public readonly knowledgeBaseGuardrail: IGuardrail;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IGuardrail

Optional Bedrock guardrail to apply to model interactions.

Helps ensure model outputs adhere to content policies and guidelines
by filtering inappropriate content and enforcing usage policies.

---

##### `knowledgeBaseModel`<sup>Optional</sup> <a name="knowledgeBaseModel" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.knowledgeBaseModel"></a>

```typescript
public readonly knowledgeBaseModel: IInvokable;
```

- *Type:* @cdklabs/generative-ai-cdk-constructs.bedrock.IInvokable
- *Default:* bedrock.BedrockFoundationModel.AMAZON_NOVA_PRO_V1_0

Optional invokable model to use for knowledge base queries.

Can be a Bedrock foundation model, Bedrock inference profile, or custom model.
Enables natural language querying of processed documents when a knowledge base is configured.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>

The log level for document processing components.

Controls the verbosity of logs generated during document processing.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays

The retention period for CloudWatch logs generated by document processing components.

Controls how long system logs are kept for troubleshooting and auditing.

---

##### `stateMachine`<sup>Optional</sup> <a name="stateMachine" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

Optional Step Functions state machine for document processing workflow.

When provided, enables querying of execution details and step-by-step
processing status through the GraphQL API.

---

##### `vpcConfiguration`<sup>Optional</sup> <a name="vpcConfiguration" id="@cdklabs/genai-idp.ProcessingEnvironmentApiProps.property.vpcConfiguration"></a>

```typescript
public readonly vpcConfiguration: VpcConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a>

Optional VPC configuration for document processing components.

When provided, deploys processing components within a VPC with specified settings.

---

### ProcessingEnvironmentProps <a name="ProcessingEnvironmentProps" id="@cdklabs/genai-idp.ProcessingEnvironmentProps"></a>

Configuration properties for the Intelligent Document Processing environment.

This construct orchestrates the end-to-end document processing workflow,
from document ingestion to structured data extraction and result tracking.

The processing environment provides the shared infrastructure and services
that all document processor patterns use, including storage, tracking,
API access, and monitoring capabilities.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.Initializer"></a>

```typescript
import { ProcessingEnvironmentProps } from '@cdklabs/genai-idp'

const processingEnvironmentProps: ProcessingEnvironmentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.inputBucket">inputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 location where source documents to be processed are stored. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The namespace for CloudWatch metrics emitted by the document processing system. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 location where processed documents and extraction results will be stored. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.workingBucket">workingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket used for temporary storage during document processing. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.api">api</a></code> | <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a></code> | Optional ProcessingEnvironmentApi for progress notifications. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.concurrencyTable">concurrencyTable</a></code> | <code><a href="#@cdklabs/genai-idp.IConcurrencyTable">IConcurrencyTable</a></code> | The store that manages concurrency limits for document processing. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.configurationTable">configurationTable</a></code> | <code><a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a></code> | Optional DynamoDB table for storing configuration settings. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.dataTrackingRetention">dataTrackingRetention</a></code> | <code>aws-cdk-lib.Duration</code> | The retention period for document tracking data. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.key">key</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The KMS key used for encrypting resources in the document processing workflow. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for the document processing components. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The retention period for CloudWatch logs generated by the document processing components. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.reportingEnvironment">reportingEnvironment</a></code> | <code><a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a></code> | Optional reporting environment for analytics and evaluation capabilities. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.trackingTable">trackingTable</a></code> | <code><a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a></code> | Optional document tracking table. |
| <code><a href="#@cdklabs/genai-idp.ProcessingEnvironmentProps.property.vpcConfiguration">vpcConfiguration</a></code> | <code><a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a></code> | Optional VPC configuration for document processing components. |

---

##### `inputBucket`<sup>Required</sup> <a name="inputBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.inputBucket"></a>

```typescript
public readonly inputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 location where source documents to be processed are stored.

This bucket will be monitored for new document uploads to trigger processing.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The namespace for CloudWatch metrics emitted by the document processing system.

Used to organize and identify metrics related to document processing.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 location where processed documents and extraction results will be stored.

Contains the structured data output and processing artifacts.

---

##### `workingBucket`<sup>Required</sup> <a name="workingBucket" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.workingBucket"></a>

```typescript
public readonly workingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket used for temporary storage during document processing.

Contains intermediate processing artifacts and working files.

---

##### `api`<sup>Optional</sup> <a name="api" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.api"></a>

```typescript
public readonly api: IProcessingEnvironmentApi;
```

- *Type:* <a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a>

Optional ProcessingEnvironmentApi for progress notifications.

When provided, functions will use GraphQL mutations to update document status
and notify clients about processing progress.

---

##### `concurrencyTable`<sup>Optional</sup> <a name="concurrencyTable" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.concurrencyTable"></a>

```typescript
public readonly concurrencyTable: IConcurrencyTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.IConcurrencyTable">IConcurrencyTable</a>
- *Default:* A new ConcurrencyTable is created

The store that manages concurrency limits for document processing.

Helps prevent overloading the system with too many concurrent document processing tasks.

---

##### `configurationTable`<sup>Optional</sup> <a name="configurationTable" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.configurationTable"></a>

```typescript
public readonly configurationTable: IConfigurationTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

Optional DynamoDB table for storing configuration settings.

When not provided, a new table will be created.
Contains document schemas, extraction parameters, and other system-wide settings.

---

##### `dataTrackingRetention`<sup>Optional</sup> <a name="dataTrackingRetention" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.dataTrackingRetention"></a>

```typescript
public readonly dataTrackingRetention: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 365 days

The retention period for document tracking data.

Controls how long document metadata and processing results are kept in the system.

---

##### `key`<sup>Optional</sup> <a name="key" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.key"></a>

```typescript
public readonly key: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

The KMS key used for encrypting resources in the document processing workflow.

Provides encryption for queues, logs, and other sensitive components.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>
- *Default:* LogLevel.INFO

The log level for the document processing components.

Controls the verbosity of logs generated during document processing.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* RetentionDays.ONE_WEEK

The retention period for CloudWatch logs generated by the document processing components.

Controls how long system logs are kept for troubleshooting and auditing.

---

##### `reportingEnvironment`<sup>Optional</sup> <a name="reportingEnvironment" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.reportingEnvironment"></a>

```typescript
public readonly reportingEnvironment: IReportingEnvironment;
```

- *Type:* <a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a>

Optional reporting environment for analytics and evaluation capabilities.

When provided, enables storage and querying of evaluation metrics and processing analytics.

---

##### `trackingTable`<sup>Optional</sup> <a name="trackingTable" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.trackingTable"></a>

```typescript
public readonly trackingTable: ITrackingTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

Optional document tracking table.

---

##### `vpcConfiguration`<sup>Optional</sup> <a name="vpcConfiguration" id="@cdklabs/genai-idp.ProcessingEnvironmentProps.property.vpcConfiguration"></a>

```typescript
public readonly vpcConfiguration: VpcConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a>

Optional VPC configuration for document processing components.

When provided, deploys processing components within a VPC with specified settings.

---

### ReportingEnvironmentProps <a name="ReportingEnvironmentProps" id="@cdklabs/genai-idp.ReportingEnvironmentProps"></a>

Properties for configuring the ReportingEnvironment construct.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.ReportingEnvironmentProps.Initializer"></a>

```typescript
import { ReportingEnvironmentProps } from '@cdklabs/genai-idp'

const reportingEnvironmentProps: ReportingEnvironmentProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironmentProps.property.reportingBucket">reportingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where evaluation metrics and reporting data will be stored. |
| <code><a href="#@cdklabs/genai-idp.ReportingEnvironmentProps.property.reportingDatabase">reportingDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | The AWS Glue database where reporting tables will be created. |

---

##### `reportingBucket`<sup>Required</sup> <a name="reportingBucket" id="@cdklabs/genai-idp.ReportingEnvironmentProps.property.reportingBucket"></a>

```typescript
public readonly reportingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where evaluation metrics and reporting data will be stored.

The construct will create Glue tables that reference this bucket location.

---

##### `reportingDatabase`<sup>Required</sup> <a name="reportingDatabase" id="@cdklabs/genai-idp.ReportingEnvironmentProps.property.reportingDatabase"></a>

```typescript
public readonly reportingDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

The AWS Glue database where reporting tables will be created.

The construct will create tables for document, section, attribute, and metering data.

---

### SaveReportingDataFunctionProps <a name="SaveReportingDataFunctionProps" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps"></a>

Properties for configuring the SaveReportingDataFunction.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.Initializer"></a>

```typescript
import { SaveReportingDataFunctionProps } from '@cdklabs/genai-idp'

const saveReportingDataFunctionProps: SaveReportingDataFunctionProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.adotInstrumentation">adotInstrumentation</a></code> | <code>aws-cdk-lib.aws_lambda.AdotInstrumentationConfig</code> | Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Whether to allow the Lambda to send all ipv6 network traffic. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.applicationLogLevel">applicationLogLevel</a></code> | <code>string</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.applicationLogLevelV2">applicationLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.ApplicationLogLevel</code> | Sets the application log level for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.architecture">architecture</a></code> | <code>aws-cdk-lib.aws_lambda.Architecture</code> | The system architectures compatible with this lambda function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.codeSigningConfig">codeSigningConfig</a></code> | <code>aws-cdk-lib.aws_lambda.ICodeSigningConfig</code> | Code signing config associated with this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.currentVersionOptions">currentVersionOptions</a></code> | <code>aws-cdk-lib.aws_lambda.VersionOptions</code> | Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.deadLetterQueue">deadLetterQueue</a></code> | <code>aws-cdk-lib.aws_sqs.IQueue</code> | The SQS queue to use if DLQ is enabled. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.deadLetterQueueEnabled">deadLetterQueueEnabled</a></code> | <code>boolean</code> | Enabled DLQ. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.deadLetterTopic">deadLetterTopic</a></code> | <code>aws-cdk-lib.aws_sns.ITopic</code> | The SNS topic to use as a DLQ. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.description">description</a></code> | <code>string</code> | A description of the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.environmentEncryption">environmentEncryption</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | The AWS KMS key that's used to encrypt your function's environment variables. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.ephemeralStorageSize">ephemeralStorageSize</a></code> | <code>aws-cdk-lib.Size</code> | The size of the function’s /tmp directory in MiB. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.events">events</a></code> | <code>aws-cdk-lib.aws_lambda.IEventSource[]</code> | Event sources for this function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.functionName">functionName</a></code> | <code>string</code> | A name for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.initialPolicy">initialPolicy</a></code> | <code>aws-cdk-lib.aws_iam.PolicyStatement[]</code> | Initial policy statements to add to the created Lambda Role. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.insightsVersion">insightsVersion</a></code> | <code>aws-cdk-lib.aws_lambda.LambdaInsightsVersion</code> | Specify the version of CloudWatch Lambda insights to use for monitoring. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.ipv6AllowedForDualStack">ipv6AllowedForDualStack</a></code> | <code>boolean</code> | Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logFormat">logFormat</a></code> | <code>string</code> | Sets the logFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.loggingFormat">loggingFormat</a></code> | <code>aws-cdk-lib.aws_lambda.LoggingFormat</code> | Sets the loggingFormat for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logGroup">logGroup</a></code> | <code>aws-cdk-lib.aws_logs.ILogGroup</code> | The log group the function sends logs to. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRemovalPolicy">logRemovalPolicy</a></code> | <code>aws-cdk-lib.RemovalPolicy</code> | Determine the removal policy of the log group that is auto-created by this construct. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The number of days log events are kept in CloudWatch Logs. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRetentionRetryOptions">logRetentionRetryOptions</a></code> | <code>aws-cdk-lib.aws_lambda.LogRetentionRetryOptions</code> | When log retention is specified, a custom resource attempts to create the CloudWatch log group. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRetentionRole">logRetentionRole</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | The IAM role for the Lambda function associated with the custom resource that sets the retention policy. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.maxEventAge">maxEventAge</a></code> | <code>aws-cdk-lib.Duration</code> | The maximum age of a request that Lambda sends to a function for processing. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.onFailure">onFailure</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for failed invocations. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.onSuccess">onSuccess</a></code> | <code>aws-cdk-lib.aws_lambda.IDestination</code> | The destination for successful invocations. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.paramsAndSecrets">paramsAndSecrets</a></code> | <code>aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion</code> | Specify the configuration of Parameters and Secrets Extension. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.profiling">profiling</a></code> | <code>boolean</code> | Enable profiling. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.profilingGroup">profilingGroup</a></code> | <code>aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup</code> | Profiling Group. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.recursiveLoop">recursiveLoop</a></code> | <code>aws-cdk-lib.aws_lambda.RecursiveLoop</code> | Sets the Recursive Loop Protection for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.reservedConcurrentExecutions">reservedConcurrentExecutions</a></code> | <code>number</code> | The maximum of concurrent executions you want to reserve for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.retryAttempts">retryAttempts</a></code> | <code>number</code> | The maximum number of times to retry when the function returns an error. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.role">role</a></code> | <code>aws-cdk-lib.aws_iam.IRole</code> | Lambda execution role. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.runtimeManagementMode">runtimeManagementMode</a></code> | <code>aws-cdk-lib.aws_lambda.RuntimeManagementMode</code> | Sets the runtime management configuration for a function's version. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | The list of security groups to associate with the Lambda's network interfaces. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.snapStart">snapStart</a></code> | <code>aws-cdk-lib.aws_lambda.SnapStartConf</code> | Enable SnapStart for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.systemLogLevel">systemLogLevel</a></code> | <code>string</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.systemLogLevelV2">systemLogLevelV2</a></code> | <code>aws-cdk-lib.aws_lambda.SystemLogLevel</code> | Sets the system log level for the function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.tracing">tracing</a></code> | <code>aws-cdk-lib.aws_lambda.Tracing</code> | Enable AWS X-Ray Tracing for Lambda Function. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC network to place Lambda network interfaces. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Where to place the network interfaces within the VPC. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The metric namespace for CloudWatch metrics. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket containing processed document outputs for reading. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.reportingBucket">reportingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where reporting data will be saved in Parquet format. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key for encrypting function resources. |
| <code><a href="#@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for the function. |

---

##### `adotInstrumentation`<sup>Optional</sup> <a name="adotInstrumentation" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.adotInstrumentation"></a>

```typescript
public readonly adotInstrumentation: AdotInstrumentationConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.AdotInstrumentationConfig
- *Default:* No ADOT instrumentation

Specify the configuration of AWS Distro for OpenTelemetry (ADOT) instrumentation.

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean
- *Default:* false

Whether to allow the Lambda to send all ipv6 network traffic.

If set to true, there will only be a single egress rule which allows all
outbound ipv6 traffic. If set to false, you must individually add traffic rules to allow the
Lambda to connect to network targets using ipv6.

Do not specify this property if the `securityGroups` or `securityGroup` property is set.
Instead, configure `allowAllIpv6Outbound` directly on the security group.

---

##### ~~`applicationLogLevel`~~<sup>Optional</sup> <a name="applicationLogLevel" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.applicationLogLevel"></a>

- *Deprecated:* Use `applicationLogLevelV2` as a property instead.

```typescript
public readonly applicationLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the application log level for the function.

---

##### `applicationLogLevelV2`<sup>Optional</sup> <a name="applicationLogLevelV2" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.applicationLogLevelV2"></a>

```typescript
public readonly applicationLogLevelV2: ApplicationLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.ApplicationLogLevel
- *Default:* ApplicationLogLevel.INFO

Sets the application log level for the function.

---

##### `architecture`<sup>Optional</sup> <a name="architecture" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.architecture"></a>

```typescript
public readonly architecture: Architecture;
```

- *Type:* aws-cdk-lib.aws_lambda.Architecture
- *Default:* Architecture.X86_64

The system architectures compatible with this lambda function.

---

##### `codeSigningConfig`<sup>Optional</sup> <a name="codeSigningConfig" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.codeSigningConfig"></a>

```typescript
public readonly codeSigningConfig: ICodeSigningConfig;
```

- *Type:* aws-cdk-lib.aws_lambda.ICodeSigningConfig
- *Default:* Not Sign the Code

Code signing config associated with this function.

---

##### `currentVersionOptions`<sup>Optional</sup> <a name="currentVersionOptions" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.currentVersionOptions"></a>

```typescript
public readonly currentVersionOptions: VersionOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.VersionOptions
- *Default:* default options as described in `VersionOptions`

Options for the `lambda.Version` resource automatically created by the `fn.currentVersion` method.

---

##### `deadLetterQueue`<sup>Optional</sup> <a name="deadLetterQueue" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.deadLetterQueue"></a>

```typescript
public readonly deadLetterQueue: IQueue;
```

- *Type:* aws-cdk-lib.aws_sqs.IQueue
- *Default:* SQS queue with 14 day retention period if `deadLetterQueueEnabled` is `true`

The SQS queue to use if DLQ is enabled.

If SNS topic is desired, specify `deadLetterTopic` property instead.

---

##### `deadLetterQueueEnabled`<sup>Optional</sup> <a name="deadLetterQueueEnabled" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.deadLetterQueueEnabled"></a>

```typescript
public readonly deadLetterQueueEnabled: boolean;
```

- *Type:* boolean
- *Default:* false unless `deadLetterQueue` is set, which implies DLQ is enabled.

Enabled DLQ.

If `deadLetterQueue` is undefined,
an SQS queue with default options will be defined for your Function.

---

##### `deadLetterTopic`<sup>Optional</sup> <a name="deadLetterTopic" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.deadLetterTopic"></a>

```typescript
public readonly deadLetterTopic: ITopic;
```

- *Type:* aws-cdk-lib.aws_sns.ITopic
- *Default:* no SNS topic

The SNS topic to use as a DLQ.

Note that if `deadLetterQueueEnabled` is set to `true`, an SQS queue will be created
rather than an SNS topic. Using an SNS topic as a DLQ requires this property to be set explicitly.

---

##### `description`<sup>Optional</sup> <a name="description" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* No description.

A description of the function.

---

##### `environmentEncryption`<sup>Optional</sup> <a name="environmentEncryption" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.environmentEncryption"></a>

```typescript
public readonly environmentEncryption: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey
- *Default:* AWS Lambda creates and uses an AWS managed customer master key (CMK).

The AWS KMS key that's used to encrypt your function's environment variables.

---

##### `ephemeralStorageSize`<sup>Optional</sup> <a name="ephemeralStorageSize" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.ephemeralStorageSize"></a>

```typescript
public readonly ephemeralStorageSize: Size;
```

- *Type:* aws-cdk-lib.Size
- *Default:* 512 MiB

The size of the function’s /tmp directory in MiB.

---

##### `events`<sup>Optional</sup> <a name="events" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.events"></a>

```typescript
public readonly events: IEventSource[];
```

- *Type:* aws-cdk-lib.aws_lambda.IEventSource[]
- *Default:* No event sources.

Event sources for this function.

You can also add event sources using `addEventSource`.

---

##### `functionName`<sup>Optional</sup> <a name="functionName" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.functionName"></a>

```typescript
public readonly functionName: string;
```

- *Type:* string
- *Default:* AWS CloudFormation generates a unique physical ID and uses that ID for the function's name. For more information, see Name Type.

A name for the function.

---

##### `initialPolicy`<sup>Optional</sup> <a name="initialPolicy" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.initialPolicy"></a>

```typescript
public readonly initialPolicy: PolicyStatement[];
```

- *Type:* aws-cdk-lib.aws_iam.PolicyStatement[]
- *Default:* No policy statements are added to the created Lambda role.

Initial policy statements to add to the created Lambda Role.

You can call `addToRolePolicy` to the created lambda to add statements post creation.

---

##### `insightsVersion`<sup>Optional</sup> <a name="insightsVersion" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.insightsVersion"></a>

```typescript
public readonly insightsVersion: LambdaInsightsVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.LambdaInsightsVersion
- *Default:* No Lambda Insights

Specify the version of CloudWatch Lambda insights to use for monitoring.

---

##### `ipv6AllowedForDualStack`<sup>Optional</sup> <a name="ipv6AllowedForDualStack" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.ipv6AllowedForDualStack"></a>

```typescript
public readonly ipv6AllowedForDualStack: boolean;
```

- *Type:* boolean
- *Default:* false

Allows outbound IPv6 traffic on VPC functions that are connected to dual-stack subnets.

Only used if 'vpc' is supplied.

---

##### ~~`logFormat`~~<sup>Optional</sup> <a name="logFormat" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logFormat"></a>

- *Deprecated:* Use `loggingFormat` as a property instead.

```typescript
public readonly logFormat: string;
```

- *Type:* string
- *Default:* "Text"

Sets the logFormat for the function.

---

##### `loggingFormat`<sup>Optional</sup> <a name="loggingFormat" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.loggingFormat"></a>

```typescript
public readonly loggingFormat: LoggingFormat;
```

- *Type:* aws-cdk-lib.aws_lambda.LoggingFormat
- *Default:* LoggingFormat.TEXT

Sets the loggingFormat for the function.

---

##### `logGroup`<sup>Optional</sup> <a name="logGroup" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logGroup"></a>

```typescript
public readonly logGroup: ILogGroup;
```

- *Type:* aws-cdk-lib.aws_logs.ILogGroup
- *Default:* `/aws/lambda/${this.functionName}` - default log group created by Lambda

The log group the function sends logs to.

By default, Lambda functions send logs to an automatically created default log group named /aws/lambda/\<function name\>.
However you cannot change the properties of this auto-created log group using the AWS CDK, e.g. you cannot set a different log retention.

Use the `logGroup` property to create a fully customizable LogGroup ahead of time, and instruct the Lambda function to send logs to it.

Providing a user-controlled log group was rolled out to commercial regions on 2023-11-16.
If you are deploying to another type of region, please check regional availability first.

---

##### ~~`logRemovalPolicy`~~<sup>Optional</sup> <a name="logRemovalPolicy" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRemovalPolicy"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRemovalPolicy: RemovalPolicy;
```

- *Type:* aws-cdk-lib.RemovalPolicy
- *Default:* RemovalPolicy.Retain

Determine the removal policy of the log group that is auto-created by this construct.

Normally you want to retain the log group so you can diagnose issues
from logs even after a deployment that no longer includes the log group.
In that case, use the normal date-based retention policy to age out your
logs.

---

##### ~~`logRetention`~~<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRetention"></a>

- *Deprecated:* use `logGroup` instead

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays
- *Default:* logs.RetentionDays.INFINITE

The number of days log events are kept in CloudWatch Logs.

When updating
this property, unsetting it doesn't remove the log retention policy. To
remove the retention policy, set the value to `INFINITE`.

This is a legacy API and we strongly recommend you move away from it if you can.
Instead create a fully customizable log group with `logs.LogGroup` and use the `logGroup` property
to instruct the Lambda function to send logs to it.
Migrating from `logRetention` to `logGroup` will cause the name of the log group to change.
Users and code and referencing the name verbatim will have to adjust.

In AWS CDK code, you can access the log group name directly from the LogGroup construct:
```ts
import * as logs from 'aws-cdk-lib/aws-logs';

declare const myLogGroup: logs.LogGroup;
myLogGroup.logGroupName;
```

---

##### `logRetentionRetryOptions`<sup>Optional</sup> <a name="logRetentionRetryOptions" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRetentionRetryOptions"></a>

```typescript
public readonly logRetentionRetryOptions: LogRetentionRetryOptions;
```

- *Type:* aws-cdk-lib.aws_lambda.LogRetentionRetryOptions
- *Default:* Default AWS SDK retry options.

When log retention is specified, a custom resource attempts to create the CloudWatch log group.

These options control the retry policy when interacting with CloudWatch APIs.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `logRetentionRole`<sup>Optional</sup> <a name="logRetentionRole" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logRetentionRole"></a>

```typescript
public readonly logRetentionRole: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A new role is created.

The IAM role for the Lambda function associated with the custom resource that sets the retention policy.

This is a legacy API and we strongly recommend you migrate to `logGroup` if you can.
`logGroup` allows you to create a fully customizable log group and instruct the Lambda function to send logs to it.

---

##### `maxEventAge`<sup>Optional</sup> <a name="maxEventAge" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.maxEventAge"></a>

```typescript
public readonly maxEventAge: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* Duration.hours(6)

The maximum age of a request that Lambda sends to a function for processing.

Minimum: 60 seconds
Maximum: 6 hours

---

##### `onFailure`<sup>Optional</sup> <a name="onFailure" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.onFailure"></a>

```typescript
public readonly onFailure: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for failed invocations.

---

##### `onSuccess`<sup>Optional</sup> <a name="onSuccess" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.onSuccess"></a>

```typescript
public readonly onSuccess: IDestination;
```

- *Type:* aws-cdk-lib.aws_lambda.IDestination
- *Default:* no destination

The destination for successful invocations.

---

##### `paramsAndSecrets`<sup>Optional</sup> <a name="paramsAndSecrets" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.paramsAndSecrets"></a>

```typescript
public readonly paramsAndSecrets: ParamsAndSecretsLayerVersion;
```

- *Type:* aws-cdk-lib.aws_lambda.ParamsAndSecretsLayerVersion
- *Default:* No Parameters and Secrets Extension

Specify the configuration of Parameters and Secrets Extension.

---

##### `profiling`<sup>Optional</sup> <a name="profiling" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.profiling"></a>

```typescript
public readonly profiling: boolean;
```

- *Type:* boolean
- *Default:* No profiling.

Enable profiling.

---

##### `profilingGroup`<sup>Optional</sup> <a name="profilingGroup" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.profilingGroup"></a>

```typescript
public readonly profilingGroup: IProfilingGroup;
```

- *Type:* aws-cdk-lib.aws_codeguruprofiler.IProfilingGroup
- *Default:* A new profiling group will be created if `profiling` is set.

Profiling Group.

---

##### `recursiveLoop`<sup>Optional</sup> <a name="recursiveLoop" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.recursiveLoop"></a>

```typescript
public readonly recursiveLoop: RecursiveLoop;
```

- *Type:* aws-cdk-lib.aws_lambda.RecursiveLoop
- *Default:* RecursiveLoop.Terminate

Sets the Recursive Loop Protection for Lambda Function.

It lets Lambda detect and terminate unintended recursive loops.

---

##### `reservedConcurrentExecutions`<sup>Optional</sup> <a name="reservedConcurrentExecutions" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.reservedConcurrentExecutions"></a>

```typescript
public readonly reservedConcurrentExecutions: number;
```

- *Type:* number
- *Default:* No specific limit - account limit.

The maximum of concurrent executions you want to reserve for the function.

---

##### `retryAttempts`<sup>Optional</sup> <a name="retryAttempts" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.retryAttempts"></a>

```typescript
public readonly retryAttempts: number;
```

- *Type:* number
- *Default:* 2

The maximum number of times to retry when the function returns an error.

Minimum: 0
Maximum: 2

---

##### `role`<sup>Optional</sup> <a name="role" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.role"></a>

```typescript
public readonly role: IRole;
```

- *Type:* aws-cdk-lib.aws_iam.IRole
- *Default:* A unique role will be generated for this lambda function. Both supplied and generated roles can always be changed by calling `addToRolePolicy`.

Lambda execution role.

This is the role that will be assumed by the function upon execution.
It controls the permissions that the function will have. The Role must
be assumable by the 'lambda.amazonaws.com' service principal.

The default Role automatically has permissions granted for Lambda execution. If you
provide a Role, you must add the relevant AWS managed policies yourself.

The relevant managed policies are "service-role/AWSLambdaBasicExecutionRole" and
"service-role/AWSLambdaVPCAccessExecutionRole".

---

##### `runtimeManagementMode`<sup>Optional</sup> <a name="runtimeManagementMode" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.runtimeManagementMode"></a>

```typescript
public readonly runtimeManagementMode: RuntimeManagementMode;
```

- *Type:* aws-cdk-lib.aws_lambda.RuntimeManagementMode
- *Default:* Auto

Sets the runtime management configuration for a function's version.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]
- *Default:* If the function is placed within a VPC and a security group is not specified, either by this or securityGroup prop, a dedicated security group will be created for this function.

The list of security groups to associate with the Lambda's network interfaces.

Only used if 'vpc' is supplied.

---

##### `snapStart`<sup>Optional</sup> <a name="snapStart" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.snapStart"></a>

```typescript
public readonly snapStart: SnapStartConf;
```

- *Type:* aws-cdk-lib.aws_lambda.SnapStartConf
- *Default:* No snapstart

Enable SnapStart for Lambda Function.

SnapStart is currently supported for Java 11, Java 17, Python 3.12, Python 3.13, and .NET 8 runtime

---

##### ~~`systemLogLevel`~~<sup>Optional</sup> <a name="systemLogLevel" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.systemLogLevel"></a>

- *Deprecated:* Use `systemLogLevelV2` as a property instead.

```typescript
public readonly systemLogLevel: string;
```

- *Type:* string
- *Default:* "INFO"

Sets the system log level for the function.

---

##### `systemLogLevelV2`<sup>Optional</sup> <a name="systemLogLevelV2" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.systemLogLevelV2"></a>

```typescript
public readonly systemLogLevelV2: SystemLogLevel;
```

- *Type:* aws-cdk-lib.aws_lambda.SystemLogLevel
- *Default:* SystemLogLevel.INFO

Sets the system log level for the function.

---

##### `tracing`<sup>Optional</sup> <a name="tracing" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.tracing"></a>

```typescript
public readonly tracing: Tracing;
```

- *Type:* aws-cdk-lib.aws_lambda.Tracing
- *Default:* Tracing.Disabled

Enable AWS X-Ray Tracing for Lambda Function.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc
- *Default:* Function is not placed within a VPC.

VPC network to place Lambda network interfaces.

Specify this if the Lambda function needs to access resources in a VPC.
This is required when `vpcSubnets` is specified.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection
- *Default:* the Vpc default strategy if not specified

Where to place the network interfaces within the VPC.

This requires `vpc` to be specified in order for interfaces to actually be
placed in the subnets. If `vpc` is not specify, this will raise an error.

Note: Internet access for Lambda Functions requires a NAT Gateway, so picking
public subnets is not allowed (unless `allowPublicSubnet` is set to `true`).

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The metric namespace for CloudWatch metrics.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket containing processed document outputs for reading.

---

##### `reportingBucket`<sup>Required</sup> <a name="reportingBucket" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.reportingBucket"></a>

```typescript
public readonly reportingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where reporting data will be saved in Parquet format.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key for encrypting function resources.

---

##### `logLevel`<sup>Optional</sup> <a name="logLevel" id="@cdklabs/genai-idp.SaveReportingDataFunctionProps.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>
- *Default:* LogLevel.INFO

The log level for the function.

---

### UserIdentityProps <a name="UserIdentityProps" id="@cdklabs/genai-idp.UserIdentityProps"></a>

Properties for configuring the UserIdentity construct.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.UserIdentityProps.Initializer"></a>

```typescript
import { UserIdentityProps } from '@cdklabs/genai-idp'

const userIdentityProps: UserIdentityProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.UserIdentityProps.property.identityPoolOptions">identityPoolOptions</a></code> | <code>aws-cdk-lib.aws_cognito_identitypool.IdentityPoolProps</code> | Configuration for the Identity Pool. |
| <code><a href="#@cdklabs/genai-idp.UserIdentityProps.property.userPool">userPool</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPool</code> | Optional pre-existing Cognito User Pool to use for authentication. |

---

##### `identityPoolOptions`<sup>Optional</sup> <a name="identityPoolOptions" id="@cdklabs/genai-idp.UserIdentityProps.property.identityPoolOptions"></a>

```typescript
public readonly identityPoolOptions: IdentityPoolProps;
```

- *Type:* aws-cdk-lib.aws_cognito_identitypool.IdentityPoolProps

Configuration for the Identity Pool.

Allows customization of the Cognito Identity Pool that provides
temporary AWS credentials to authenticated users.

---

##### `userPool`<sup>Optional</sup> <a name="userPool" id="@cdklabs/genai-idp.UserIdentityProps.property.userPool"></a>

```typescript
public readonly userPool: IUserPool;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPool

Optional pre-existing Cognito User Pool to use for authentication.

When not provided, a new User Pool will be created with standard settings.

---

### VpcConfiguration <a name="VpcConfiguration" id="@cdklabs/genai-idp.VpcConfiguration"></a>

Configuration for VPC settings of document processing components.

Controls VPC placement, subnet selection, and security group assignments
for Lambda functions and other resources in the processing environment.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.VpcConfiguration.Initializer"></a>

```typescript
import { VpcConfiguration } from '@cdklabs/genai-idp'

const vpcConfiguration: VpcConfiguration = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.VpcConfiguration.property.allowAllIpv6Outbound">allowAllIpv6Outbound</a></code> | <code>boolean</code> | Controls whether IPv6 outbound traffic is allowed to all destinations. |
| <code><a href="#@cdklabs/genai-idp.VpcConfiguration.property.allowAllOutbound">allowAllOutbound</a></code> | <code>boolean</code> | Controls whether outbound traffic is allowed to all destinations. |
| <code><a href="#@cdklabs/genai-idp.VpcConfiguration.property.securityGroups">securityGroups</a></code> | <code>aws-cdk-lib.aws_ec2.ISecurityGroup[]</code> | Optional security groups to apply to document processing components. |
| <code><a href="#@cdklabs/genai-idp.VpcConfiguration.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | Optional VPC where document processing components will be deployed. |
| <code><a href="#@cdklabs/genai-idp.VpcConfiguration.property.vpcSubnets">vpcSubnets</a></code> | <code>aws-cdk-lib.aws_ec2.SubnetSelection</code> | Optional subnet selection for VPC-deployed resources. |

---

##### `allowAllIpv6Outbound`<sup>Optional</sup> <a name="allowAllIpv6Outbound" id="@cdklabs/genai-idp.VpcConfiguration.property.allowAllIpv6Outbound"></a>

```typescript
public readonly allowAllIpv6Outbound: boolean;
```

- *Type:* boolean

Controls whether IPv6 outbound traffic is allowed to all destinations.

When true, allows document processing components to access external resources via IPv6.

---

##### `allowAllOutbound`<sup>Optional</sup> <a name="allowAllOutbound" id="@cdklabs/genai-idp.VpcConfiguration.property.allowAllOutbound"></a>

```typescript
public readonly allowAllOutbound: boolean;
```

- *Type:* boolean

Controls whether outbound traffic is allowed to all destinations.

When true, allows document processing components to access external resources.

---

##### `securityGroups`<sup>Optional</sup> <a name="securityGroups" id="@cdklabs/genai-idp.VpcConfiguration.property.securityGroups"></a>

```typescript
public readonly securityGroups: ISecurityGroup[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISecurityGroup[]

Optional security groups to apply to document processing components.

Controls network access and security rules for VPC-deployed resources.

---

##### `vpc`<sup>Optional</sup> <a name="vpc" id="@cdklabs/genai-idp.VpcConfiguration.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

Optional VPC where document processing components will be deployed.

When provided, Lambda functions and other resources will be deployed within this VPC.

---

##### `vpcSubnets`<sup>Optional</sup> <a name="vpcSubnets" id="@cdklabs/genai-idp.VpcConfiguration.property.vpcSubnets"></a>

```typescript
public readonly vpcSubnets: SubnetSelection;
```

- *Type:* aws-cdk-lib.aws_ec2.SubnetSelection

Optional subnet selection for VPC-deployed resources.

Determines which subnets within the VPC will host document processing components.

---

### WebApplicationProps <a name="WebApplicationProps" id="@cdklabs/genai-idp.WebApplicationProps"></a>

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.WebApplicationProps.Initializer"></a>

```typescript
import { WebApplicationProps } from '@cdklabs/genai-idp'

const webApplicationProps: WebApplicationProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.apiUrl">apiUrl</a></code> | <code>string</code> | The GraphQL API URL for the processing environment. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.environment">environment</a></code> | <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a></code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.userIdentity">userIdentity</a></code> | <code><a href="#@cdklabs/genai-idp.IUserIdentity">IUserIdentity</a></code> | The user identity management system that handles authentication and authorization for the web application. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.autoConfigure">autoConfigure</a></code> | <code>boolean</code> | Whether to automatically configure CORS rules on S3 buckets for CloudFront access. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | Optional pre-existing CloudFront distribution to use for the web application. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.loggingBucket">loggingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 Bucket used for storing CloudFront and S3 access logs. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.shouldAllowSignUpEmailDomain">shouldAllowSignUpEmailDomain</a></code> | <code>boolean</code> | Controls whether the UI allows users to sign up with any email domain. |
| <code><a href="#@cdklabs/genai-idp.WebApplicationProps.property.webAppBucket">webAppBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | Optional pre-existing S3 bucket to use for the web application. |

---

##### `apiUrl`<sup>Required</sup> <a name="apiUrl" id="@cdklabs/genai-idp.WebApplicationProps.property.apiUrl"></a>

```typescript
public readonly apiUrl: string;
```

- *Type:* string

The GraphQL API URL for the processing environment.

This allows for flexible URL configuration including custom domains,
cross-stack references, or external API endpoints.

---

*Example*

```typescript
// Using a CDK-generated API URL
apiUrl: myApi.graphqlUrl

// Using a custom domain
apiUrl: 'https://api.mydomain.com/graphql'

// Using a cross-stack reference
apiUrl: 'https://abc123.appsync-api.us-east-1.amazonaws.com/graphql'
```


##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp.WebApplicationProps.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* <a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a>

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `userIdentity`<sup>Required</sup> <a name="userIdentity" id="@cdklabs/genai-idp.WebApplicationProps.property.userIdentity"></a>

```typescript
public readonly userIdentity: IUserIdentity;
```

- *Type:* <a href="#@cdklabs/genai-idp.IUserIdentity">IUserIdentity</a>

The user identity management system that handles authentication and authorization for the web application.

Provides Cognito resources for user management and secure access to AWS resources.

---

##### `autoConfigure`<sup>Optional</sup> <a name="autoConfigure" id="@cdklabs/genai-idp.WebApplicationProps.property.autoConfigure"></a>

```typescript
public readonly autoConfigure: boolean;
```

- *Type:* boolean
- *Default:* true

Whether to automatically configure CORS rules on S3 buckets for CloudFront access.

When true, the library will configure CORS rules on the input and output buckets
to allow access from the CloudFront distribution domain.

When false, users are responsible for configuring CORS rules themselves.
This is useful when users have existing CORS policies or need custom CORS configurations.

---

##### `distribution`<sup>Optional</sup> <a name="distribution" id="@cdklabs/genai-idp.WebApplicationProps.property.distribution"></a>

```typescript
public readonly distribution: IDistribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution
- *Default:* A new distribution is created with best-practice defaults

Optional pre-existing CloudFront distribution to use for the web application.

When not provided, a default distribution will be created with sensible defaults
that work well for most use cases.

---

##### `loggingBucket`<sup>Optional</sup> <a name="loggingBucket" id="@cdklabs/genai-idp.WebApplicationProps.property.loggingBucket"></a>

```typescript
public readonly loggingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 Bucket used for storing CloudFront and S3 access logs.

Helps with security auditing and troubleshooting.

---

##### `shouldAllowSignUpEmailDomain`<sup>Optional</sup> <a name="shouldAllowSignUpEmailDomain" id="@cdklabs/genai-idp.WebApplicationProps.property.shouldAllowSignUpEmailDomain"></a>

```typescript
public readonly shouldAllowSignUpEmailDomain: boolean;
```

- *Type:* boolean
- *Default:* false

Controls whether the UI allows users to sign up with any email domain.

When true, enables self-service registration for all users.
When false, sign-up functionality is restricted and must be managed by administrators.

---

##### `webAppBucket`<sup>Optional</sup> <a name="webAppBucket" id="@cdklabs/genai-idp.WebApplicationProps.property.webAppBucket"></a>

```typescript
public readonly webAppBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

Optional pre-existing S3 bucket to use for the web application.

When not provided, a new bucket will be created.

---

### WorkteamProps <a name="WorkteamProps" id="@cdklabs/genai-idp.WorkteamProps"></a>

Properties for configuring the SageMaker workteam for HITL.

#### Initializer <a name="Initializer" id="@cdklabs/genai-idp.WorkteamProps.Initializer"></a>

```typescript
import { WorkteamProps } from '@cdklabs/genai-idp'

const workteamProps: WorkteamProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.WorkteamProps.property.userGroup">userGroup</a></code> | <code>aws-cdk-lib.aws_cognito.CfnUserPoolGroup</code> | The Cognito User Group that contains the human reviewers. |
| <code><a href="#@cdklabs/genai-idp.WorkteamProps.property.userPool">userPool</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPool</code> | The Cognito User Pool for authentication. |
| <code><a href="#@cdklabs/genai-idp.WorkteamProps.property.userPoolClient">userPoolClient</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPoolClient</code> | The Cognito User Pool Client for A2I integration. |
| <code><a href="#@cdklabs/genai-idp.WorkteamProps.property.description">description</a></code> | <code>string</code> | Description for the workteam. |
| <code><a href="#@cdklabs/genai-idp.WorkteamProps.property.existingPrivateWorkforceArn">existingPrivateWorkforceArn</a></code> | <code>string</code> | Optional existing private workforce ARN to use instead of creating a new workteam. |
| <code><a href="#@cdklabs/genai-idp.WorkteamProps.property.workTeamName">workTeamName</a></code> | <code>string</code> | *No description.* |

---

##### `userGroup`<sup>Required</sup> <a name="userGroup" id="@cdklabs/genai-idp.WorkteamProps.property.userGroup"></a>

```typescript
public readonly userGroup: CfnUserPoolGroup;
```

- *Type:* aws-cdk-lib.aws_cognito.CfnUserPoolGroup

The Cognito User Group that contains the human reviewers.

---

##### `userPool`<sup>Required</sup> <a name="userPool" id="@cdklabs/genai-idp.WorkteamProps.property.userPool"></a>

```typescript
public readonly userPool: IUserPool;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPool

The Cognito User Pool for authentication.

---

##### `userPoolClient`<sup>Required</sup> <a name="userPoolClient" id="@cdklabs/genai-idp.WorkteamProps.property.userPoolClient"></a>

```typescript
public readonly userPoolClient: IUserPoolClient;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPoolClient

The Cognito User Pool Client for A2I integration.

---

##### `description`<sup>Optional</sup> <a name="description" id="@cdklabs/genai-idp.WorkteamProps.property.description"></a>

```typescript
public readonly description: string;
```

- *Type:* string
- *Default:* "Private workteam for working on A2I tasks"

Description for the workteam.

---

##### `existingPrivateWorkforceArn`<sup>Optional</sup> <a name="existingPrivateWorkforceArn" id="@cdklabs/genai-idp.WorkteamProps.property.existingPrivateWorkforceArn"></a>

```typescript
public readonly existingPrivateWorkforceArn: string;
```

- *Type:* string

Optional existing private workforce ARN to use instead of creating a new workteam.

When provided, the construct will use the existing workforce instead of creating a new one.

---

##### `workTeamName`<sup>Optional</sup> <a name="workTeamName" id="@cdklabs/genai-idp.WorkteamProps.property.workTeamName"></a>

```typescript
public readonly workTeamName: string;
```

- *Type:* string

---

## Classes <a name="Classes" id="Classes"></a>

### ConfigurationDefinition <a name="ConfigurationDefinition" id="@cdklabs/genai-idp.ConfigurationDefinition"></a>

- *Implements:* <a href="#@cdklabs/genai-idp.IConfigurationDefinition">IConfigurationDefinition</a>

A configuration definition for document processing.

Manages configuration data and provides methods to access it.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ConfigurationDefinition.Initializer"></a>

```typescript
import { ConfigurationDefinition } from '@cdklabs/genai-idp'

new ConfigurationDefinition(props: ConfigurationDefinitionProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationDefinition.Initializer.parameter.props">props</a></code> | <code><a href="#@cdklabs/genai-idp.ConfigurationDefinitionProps">ConfigurationDefinitionProps</a></code> | Properties for the configuration definition. |

---

##### `props`<sup>Required</sup> <a name="props" id="@cdklabs/genai-idp.ConfigurationDefinition.Initializer.parameter.props"></a>

- *Type:* <a href="#@cdklabs/genai-idp.ConfigurationDefinitionProps">ConfigurationDefinitionProps</a>

Properties for the configuration definition.

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationDefinition.raw">raw</a></code> | Gets the raw configuration object. |

---

##### `raw` <a name="raw" id="@cdklabs/genai-idp.ConfigurationDefinition.raw"></a>

```typescript
public raw(): {[ key: string ]: any}
```

Gets the raw configuration object.




### ConfigurationDefinitionLoader <a name="ConfigurationDefinitionLoader" id="@cdklabs/genai-idp.ConfigurationDefinitionLoader"></a>

Utility class for loading configuration definitions from files.

Provides methods to parse YAML configuration files into JavaScript objects.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.ConfigurationDefinitionLoader.Initializer"></a>

```typescript
import { ConfigurationDefinitionLoader } from '@cdklabs/genai-idp'

new ConfigurationDefinitionLoader()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.ConfigurationDefinitionLoader.fromFile">fromFile</a></code> | Loads and parses a YAML configuration file. |

---

##### `fromFile` <a name="fromFile" id="@cdklabs/genai-idp.ConfigurationDefinitionLoader.fromFile"></a>

```typescript
import { ConfigurationDefinitionLoader } from '@cdklabs/genai-idp'

ConfigurationDefinitionLoader.fromFile(filePath: string)
```

Loads and parses a YAML configuration file.

###### `filePath`<sup>Required</sup> <a name="filePath" id="@cdklabs/genai-idp.ConfigurationDefinitionLoader.fromFile.parameter.filePath"></a>

- *Type:* string

Path to the YAML configuration file.

---



### IdpPythonLayerVersion <a name="IdpPythonLayerVersion" id="@cdklabs/genai-idp.IdpPythonLayerVersion"></a>

A singleton class that provides a Python Lambda Layer with the idp_common package.

#### Initializers <a name="Initializers" id="@cdklabs/genai-idp.IdpPythonLayerVersion.Initializer"></a>

```typescript
import { IdpPythonLayerVersion } from '@cdklabs/genai-idp'

new IdpPythonLayerVersion()
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |

---


#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.IdpPythonLayerVersion.getOrCreate">getOrCreate</a></code> | Gets or creates a singleton instance of the IdpPythonLayerVersion. |

---

##### `getOrCreate` <a name="getOrCreate" id="@cdklabs/genai-idp.IdpPythonLayerVersion.getOrCreate"></a>

```typescript
import { IdpPythonLayerVersion } from '@cdklabs/genai-idp'

IdpPythonLayerVersion.getOrCreate(scope: Construct, modules: ...string[])
```

Gets or creates a singleton instance of the IdpPythonLayerVersion.

###### `scope`<sup>Required</sup> <a name="scope" id="@cdklabs/genai-idp.IdpPythonLayerVersion.getOrCreate.parameter.scope"></a>

- *Type:* constructs.Construct

The construct scope where the layer should be created if it doesn't exist.

---

###### `modules`<sup>Required</sup> <a name="modules" id="@cdklabs/genai-idp.IdpPythonLayerVersion.getOrCreate.parameter.modules"></a>

- *Type:* ...string[]

The modules to install (using TypeScript spread operator).

---



## Protocols <a name="Protocols" id="Protocols"></a>

### IConcurrencyTable <a name="IConcurrencyTable" id="@cdklabs/genai-idp.IConcurrencyTable"></a>

- *Extends:* aws-cdk-lib.aws_dynamodb.ITable

- *Implemented By:* <a href="#@cdklabs/genai-idp.ConcurrencyTable">ConcurrencyTable</a>, <a href="#@cdklabs/genai-idp.IConcurrencyTable">IConcurrencyTable</a>

Interface for the concurrency management table.

This table is used to track and limit concurrent document processing tasks,
preventing resource exhaustion and ensuring system stability under load.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS encryption key associated with this table. |
| <code><a href="#@cdklabs/genai-idp.IConcurrencyTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.IConcurrencyTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.IConcurrencyTable.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.IConcurrencyTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.IConcurrencyTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.IConcurrencyTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.IConcurrencyTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS encryption key associated with this table.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp.IConcurrencyTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

### IConfigurationDefinition <a name="IConfigurationDefinition" id="@cdklabs/genai-idp.IConfigurationDefinition"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.ConfigurationDefinition">ConfigurationDefinition</a>, <a href="#@cdklabs/genai-idp.IConfigurationDefinition">IConfigurationDefinition</a>

Interface for configuration definitions.

Provides methods to access configuration data.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.IConfigurationDefinition.raw">raw</a></code> | Gets the raw configuration object. |

---

##### `raw` <a name="raw" id="@cdklabs/genai-idp.IConfigurationDefinition.raw"></a>

```typescript
public raw(): {[ key: string ]: any}
```

Gets the raw configuration object.


### IConfigurationDefinitionPropertyTransform <a name="IConfigurationDefinitionPropertyTransform" id="@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform">IConfigurationDefinitionPropertyTransform</a>

Defines a transformation to apply to a specific property in the configuration.

Used to modify configuration values during initialization.

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform.transform">transform</a></code> | Function to transform the property value. |

---

##### `transform` <a name="transform" id="@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform.transform"></a>

```typescript
public transform(value: any): any
```

Function to transform the property value.

###### `value`<sup>Required</sup> <a name="value" id="@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform.transform.parameter.value"></a>

- *Type:* any

The original property value.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform.property.flatPath">flatPath</a></code> | <code>string</code> | Dot-notation path to the property to transform (e.g., "extraction.model"). |

---

##### `flatPath`<sup>Required</sup> <a name="flatPath" id="@cdklabs/genai-idp.IConfigurationDefinitionPropertyTransform.property.flatPath"></a>

```typescript
public readonly flatPath: string;
```

- *Type:* string

Dot-notation path to the property to transform (e.g., "extraction.model").

---

### IConfigurationTable <a name="IConfigurationTable" id="@cdklabs/genai-idp.IConfigurationTable"></a>

- *Extends:* aws-cdk-lib.aws_dynamodb.ITable

- *Implemented By:* <a href="#@cdklabs/genai-idp.ConfigurationTable">ConfigurationTable</a>, <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

Interface for the configuration management table.

This table stores system-wide configuration settings for the document processing solution,
including extraction schemas, model parameters, evaluation criteria, and UI settings.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS encryption key associated with this table. |
| <code><a href="#@cdklabs/genai-idp.IConfigurationTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.IConfigurationTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.IConfigurationTable.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.IConfigurationTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.IConfigurationTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.IConfigurationTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.IConfigurationTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS encryption key associated with this table.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp.IConfigurationTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

### IDocumentProcessor <a name="IDocumentProcessor" id="@cdklabs/genai-idp.IDocumentProcessor"></a>

- *Extends:* constructs.IConstruct

- *Implemented By:* <a href="#@cdklabs/genai-idp.IDocumentProcessor">IDocumentProcessor</a>

Interface for document processor implementations.

Document processors handle the extraction of structured data from documents
using different processing patterns and AI/ML services.

The GenAI IDP Accelerator includes multiple processor implementations:
- Pattern 1: Uses Amazon Bedrock Data Automation for document processing with minimal custom code
- Pattern 2: Implements custom extraction using Amazon Bedrock foundation models for flexible processing
- Pattern 3: Provides specialized document processing using SageMaker endpoints for custom classification models

Each pattern is optimized for different document types, complexity levels, and customization needs.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IDocumentProcessor.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.IDocumentProcessor.property.environment">environment</a></code> | <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a></code> | The processing environment that provides shared infrastructure and services. |
| <code><a href="#@cdklabs/genai-idp.IDocumentProcessor.property.maxProcessingConcurrency">maxProcessingConcurrency</a></code> | <code>number</code> | The maximum number of documents that can be processed concurrently. |
| <code><a href="#@cdklabs/genai-idp.IDocumentProcessor.property.stateMachine">stateMachine</a></code> | <code>aws-cdk-lib.aws_stepfunctions.IStateMachine</code> | The Step Functions state machine that orchestrates the document processing workflow. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.IDocumentProcessor.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `environment`<sup>Required</sup> <a name="environment" id="@cdklabs/genai-idp.IDocumentProcessor.property.environment"></a>

```typescript
public readonly environment: IProcessingEnvironment;
```

- *Type:* <a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a>

The processing environment that provides shared infrastructure and services.

Contains input/output buckets, tracking tables, API endpoints, and other
resources needed for document processing operations.

---

##### `maxProcessingConcurrency`<sup>Required</sup> <a name="maxProcessingConcurrency" id="@cdklabs/genai-idp.IDocumentProcessor.property.maxProcessingConcurrency"></a>

```typescript
public readonly maxProcessingConcurrency: number;
```

- *Type:* number

The maximum number of documents that can be processed concurrently.

Controls the throughput and resource utilization of the document processing system.

---

##### `stateMachine`<sup>Required</sup> <a name="stateMachine" id="@cdklabs/genai-idp.IDocumentProcessor.property.stateMachine"></a>

```typescript
public readonly stateMachine: IStateMachine;
```

- *Type:* aws-cdk-lib.aws_stepfunctions.IStateMachine

The Step Functions state machine that orchestrates the document processing workflow.

Manages the sequence of processing steps and handles error conditions.
This state machine is triggered for each document that needs processing
and coordinates the entire extraction pipeline.

---

### IHitlEnvironment <a name="IHitlEnvironment" id="@cdklabs/genai-idp.IHitlEnvironment"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.HitlEnvironment">HitlEnvironment</a>, <a href="#@cdklabs/genai-idp.IHitlEnvironment">IHitlEnvironment</a>

Interface for the HITL environment.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IHitlEnvironment.property.labelingConsoleUrl">labelingConsoleUrl</a></code> | <code>string</code> | The labeling console URL for SageMaker Ground Truth. |
| <code><a href="#@cdklabs/genai-idp.IHitlEnvironment.property.userPoolClient">userPoolClient</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPoolClient</code> | The Cognito User Pool Client for A2I integration. |
| <code><a href="#@cdklabs/genai-idp.IHitlEnvironment.property.workforcePortalUrl">workforcePortalUrl</a></code> | <code>string</code> | The workforce portal URL for human reviewers. |
| <code><a href="#@cdklabs/genai-idp.IHitlEnvironment.property.workteam">workteam</a></code> | <code><a href="#@cdklabs/genai-idp.IWorkteam">IWorkteam</a></code> | The SageMaker workteam for HITL tasks. |

---

##### `labelingConsoleUrl`<sup>Required</sup> <a name="labelingConsoleUrl" id="@cdklabs/genai-idp.IHitlEnvironment.property.labelingConsoleUrl"></a>

```typescript
public readonly labelingConsoleUrl: string;
```

- *Type:* string

The labeling console URL for SageMaker Ground Truth.

---

##### `userPoolClient`<sup>Required</sup> <a name="userPoolClient" id="@cdklabs/genai-idp.IHitlEnvironment.property.userPoolClient"></a>

```typescript
public readonly userPoolClient: IUserPoolClient;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPoolClient

The Cognito User Pool Client for A2I integration.

---

##### `workforcePortalUrl`<sup>Required</sup> <a name="workforcePortalUrl" id="@cdklabs/genai-idp.IHitlEnvironment.property.workforcePortalUrl"></a>

```typescript
public readonly workforcePortalUrl: string;
```

- *Type:* string

The workforce portal URL for human reviewers.

---

##### `workteam`<sup>Required</sup> <a name="workteam" id="@cdklabs/genai-idp.IHitlEnvironment.property.workteam"></a>

```typescript
public readonly workteam: IWorkteam;
```

- *Type:* <a href="#@cdklabs/genai-idp.IWorkteam">IWorkteam</a>

The SageMaker workteam for HITL tasks.

---

### IProcessingEnvironment <a name="IProcessingEnvironment" id="@cdklabs/genai-idp.IProcessingEnvironment"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.ProcessingEnvironment">ProcessingEnvironment</a>, <a href="#@cdklabs/genai-idp.IProcessingEnvironment">IProcessingEnvironment</a>

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.attach">attach</a></code> | Attaches a document processor to this processing environment. |

---

##### `attach` <a name="attach" id="@cdklabs/genai-idp.IProcessingEnvironment.attach"></a>

```typescript
public attach(processor: IDocumentProcessor, options?: DocumentProcessorAttachmentOptions): void
```

Attaches a document processor to this processing environment.

Sets up the necessary event triggers, permissions, and integrations
to enable the processor to work with this environment.

###### `processor`<sup>Required</sup> <a name="processor" id="@cdklabs/genai-idp.IProcessingEnvironment.attach.parameter.processor"></a>

- *Type:* <a href="#@cdklabs/genai-idp.IDocumentProcessor">IDocumentProcessor</a>

The document processor to attach to this environment.

---

###### `options`<sup>Optional</sup> <a name="options" id="@cdklabs/genai-idp.IProcessingEnvironment.attach.parameter.options"></a>

- *Type:* <a href="#@cdklabs/genai-idp.DocumentProcessorAttachmentOptions">DocumentProcessorAttachmentOptions</a>

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.configurationFunction">configurationFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | The Lambda function that updates configuration settings. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.configurationTable">configurationTable</a></code> | <code><a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a></code> | The DynamoDB table that stores configuration settings. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.inputBucket">inputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where source documents to be processed are stored. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.logLevel">logLevel</a></code> | <code><a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a></code> | The log level for document processing components. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.metricNamespace">metricNamespace</a></code> | <code>string</code> | The namespace for CloudWatch metrics emitted by the document processing system. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.outputBucket">outputBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where processed documents and extraction results are stored. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.trackingTable">trackingTable</a></code> | <code><a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a></code> | The DynamoDB table that tracks document processing status and metadata. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.workingBucket">workingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket used for temporary storage during document processing. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.api">api</a></code> | <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a></code> | Optional ProcessingEnvironmentApi for progress notifications. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS key used for encrypting sensitive data in the processing environment. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.logRetention">logRetention</a></code> | <code>aws-cdk-lib.aws_logs.RetentionDays</code> | The retention period for CloudWatch logs generated by document processing components. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.reportingEnvironment">reportingEnvironment</a></code> | <code><a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a></code> | Optional reporting environment for analytics and evaluation capabilities. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.saveReportingDataFunction">saveReportingDataFunction</a></code> | <code>aws-cdk-lib.aws_lambda.IFunction</code> | Optional Lambda function that saves reporting data to the reporting bucket. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironment.property.vpcConfiguration">vpcConfiguration</a></code> | <code><a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a></code> | Optional VPC configuration for document processing components. |

---

##### `configurationFunction`<sup>Required</sup> <a name="configurationFunction" id="@cdklabs/genai-idp.IProcessingEnvironment.property.configurationFunction"></a>

```typescript
public readonly configurationFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

The Lambda function that updates configuration settings.

Used to initialize and update configuration during deployment and runtime.

---

##### `configurationTable`<sup>Required</sup> <a name="configurationTable" id="@cdklabs/genai-idp.IProcessingEnvironment.property.configurationTable"></a>

```typescript
public readonly configurationTable: IConfigurationTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.IConfigurationTable">IConfigurationTable</a>

The DynamoDB table that stores configuration settings.

Contains document schemas, extraction parameters, and other system-wide settings.

---

##### `inputBucket`<sup>Required</sup> <a name="inputBucket" id="@cdklabs/genai-idp.IProcessingEnvironment.property.inputBucket"></a>

```typescript
public readonly inputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where source documents to be processed are stored.

This bucket is monitored for new document uploads to trigger processing.

---

##### `logLevel`<sup>Required</sup> <a name="logLevel" id="@cdklabs/genai-idp.IProcessingEnvironment.property.logLevel"></a>

```typescript
public readonly logLevel: LogLevel;
```

- *Type:* <a href="#@cdklabs/genai-idp.LogLevel">LogLevel</a>

The log level for document processing components.

Controls the verbosity of logs generated during document processing.

---

##### `metricNamespace`<sup>Required</sup> <a name="metricNamespace" id="@cdklabs/genai-idp.IProcessingEnvironment.property.metricNamespace"></a>

```typescript
public readonly metricNamespace: string;
```

- *Type:* string

The namespace for CloudWatch metrics emitted by the document processing system.

Used to organize and identify metrics related to document processing.

---

##### `outputBucket`<sup>Required</sup> <a name="outputBucket" id="@cdklabs/genai-idp.IProcessingEnvironment.property.outputBucket"></a>

```typescript
public readonly outputBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where processed documents and extraction results are stored.

Contains the structured data output and processing artifacts.

---

##### `trackingTable`<sup>Required</sup> <a name="trackingTable" id="@cdklabs/genai-idp.IProcessingEnvironment.property.trackingTable"></a>

```typescript
public readonly trackingTable: ITrackingTable;
```

- *Type:* <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

The DynamoDB table that tracks document processing status and metadata.

Stores information about documents being processed, including status and results.

---

##### `workingBucket`<sup>Required</sup> <a name="workingBucket" id="@cdklabs/genai-idp.IProcessingEnvironment.property.workingBucket"></a>

```typescript
public readonly workingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket used for temporary storage during document processing.

Contains intermediate processing artifacts and working files.

---

##### `api`<sup>Optional</sup> <a name="api" id="@cdklabs/genai-idp.IProcessingEnvironment.property.api"></a>

```typescript
public readonly api: IProcessingEnvironmentApi;
```

- *Type:* <a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a>

Optional ProcessingEnvironmentApi for progress notifications.

When provided, functions will use GraphQL mutations to update document status
and notify clients about processing progress.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.IProcessingEnvironment.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS key used for encrypting sensitive data in the processing environment.

When provided, ensures that document content and metadata are encrypted at rest.

---

##### `logRetention`<sup>Optional</sup> <a name="logRetention" id="@cdklabs/genai-idp.IProcessingEnvironment.property.logRetention"></a>

```typescript
public readonly logRetention: RetentionDays;
```

- *Type:* aws-cdk-lib.aws_logs.RetentionDays

The retention period for CloudWatch logs generated by document processing components.

Controls how long system logs are kept for troubleshooting and auditing.

---

##### `reportingEnvironment`<sup>Optional</sup> <a name="reportingEnvironment" id="@cdklabs/genai-idp.IProcessingEnvironment.property.reportingEnvironment"></a>

```typescript
public readonly reportingEnvironment: IReportingEnvironment;
```

- *Type:* <a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a>

Optional reporting environment for analytics and evaluation capabilities.

When provided, enables storage and querying of evaluation metrics and processing analytics.

---

##### `saveReportingDataFunction`<sup>Optional</sup> <a name="saveReportingDataFunction" id="@cdklabs/genai-idp.IProcessingEnvironment.property.saveReportingDataFunction"></a>

```typescript
public readonly saveReportingDataFunction: IFunction;
```

- *Type:* aws-cdk-lib.aws_lambda.IFunction

Optional Lambda function that saves reporting data to the reporting bucket.

Available when a reporting environment is provided.

---

##### `vpcConfiguration`<sup>Optional</sup> <a name="vpcConfiguration" id="@cdklabs/genai-idp.IProcessingEnvironment.property.vpcConfiguration"></a>

```typescript
public readonly vpcConfiguration: VpcConfiguration;
```

- *Type:* <a href="#@cdklabs/genai-idp.VpcConfiguration">VpcConfiguration</a>

Optional VPC configuration for document processing components.

When provided, deploys processing components within a VPC with specified settings.

---

### IProcessingEnvironmentApi <a name="IProcessingEnvironmentApi" id="@cdklabs/genai-idp.IProcessingEnvironmentApi"></a>

- *Extends:* aws-cdk-lib.aws_appsync.IGraphqlApi

- *Implemented By:* <a href="#@cdklabs/genai-idp.ProcessingEnvironmentApi">ProcessingEnvironmentApi</a>, <a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi">IProcessingEnvironmentApi</a>

Interface for the document processing environment API.

Provides GraphQL API capabilities for monitoring and managing document processing.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.apiId">apiId</a></code> | <code>string</code> | an unique AWS AppSync GraphQL API identifier i.e. 'lxz775lwdrgcndgz3nurvac7oa'. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.arn">arn</a></code> | <code>string</code> | the ARN of the API. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.graphQLEndpointArn">graphQLEndpointArn</a></code> | <code>string</code> | The GraphQL endpoint ARN. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.modes">modes</a></code> | <code>aws-cdk-lib.aws_appsync.AuthorizationType[]</code> | The Authorization Types for this GraphQL Api. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.visibility">visibility</a></code> | <code>aws-cdk-lib.aws_appsync.Visibility</code> | the visibility of the API. |
| <code><a href="#@cdklabs/genai-idp.IProcessingEnvironmentApi.property.graphqlUrl">graphqlUrl</a></code> | <code>string</code> | The URL endpoint for the GraphQL API. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `apiId`<sup>Required</sup> <a name="apiId" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.apiId"></a>

```typescript
public readonly apiId: string;
```

- *Type:* string

an unique AWS AppSync GraphQL API identifier i.e. 'lxz775lwdrgcndgz3nurvac7oa'.

---

##### `arn`<sup>Required</sup> <a name="arn" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.arn"></a>

```typescript
public readonly arn: string;
```

- *Type:* string

the ARN of the API.

---

##### `graphQLEndpointArn`<sup>Required</sup> <a name="graphQLEndpointArn" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.graphQLEndpointArn"></a>

```typescript
public readonly graphQLEndpointArn: string;
```

- *Type:* string

The GraphQL endpoint ARN.

---

##### `modes`<sup>Required</sup> <a name="modes" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.modes"></a>

```typescript
public readonly modes: AuthorizationType[];
```

- *Type:* aws-cdk-lib.aws_appsync.AuthorizationType[]

The Authorization Types for this GraphQL Api.

---

##### `visibility`<sup>Required</sup> <a name="visibility" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.visibility"></a>

```typescript
public readonly visibility: Visibility;
```

- *Type:* aws-cdk-lib.aws_appsync.Visibility

the visibility of the API.

---

##### `graphqlUrl`<sup>Required</sup> <a name="graphqlUrl" id="@cdklabs/genai-idp.IProcessingEnvironmentApi.property.graphqlUrl"></a>

```typescript
public readonly graphqlUrl: string;
```

- *Type:* string

The URL endpoint for the GraphQL API.

Used by client applications to interact with the document processing system.

---

### IReportingEnvironment <a name="IReportingEnvironment" id="@cdklabs/genai-idp.IReportingEnvironment"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.ReportingEnvironment">ReportingEnvironment</a>, <a href="#@cdklabs/genai-idp.IReportingEnvironment">IReportingEnvironment</a>

Interface for the reporting environment that provides analytics and evaluation capabilities.

This environment stores evaluation metrics, document processing analytics, and metering data
in a structured format suitable for querying with Amazon Athena.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IReportingEnvironment.property.attributeEvaluationsTable">attributeEvaluationsTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for attribute-level evaluation metrics. |
| <code><a href="#@cdklabs/genai-idp.IReportingEnvironment.property.documentEvaluationsTable">documentEvaluationsTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for document-level evaluation metrics. |
| <code><a href="#@cdklabs/genai-idp.IReportingEnvironment.property.meteringTable">meteringTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for metering data. |
| <code><a href="#@cdklabs/genai-idp.IReportingEnvironment.property.reportingBucket">reportingBucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where evaluation metrics and reporting data are stored in Parquet format. |
| <code><a href="#@cdklabs/genai-idp.IReportingEnvironment.property.reportingDatabase">reportingDatabase</a></code> | <code>@aws-cdk/aws-glue-alpha.Database</code> | The AWS Glue database containing tables for evaluation metrics. |
| <code><a href="#@cdklabs/genai-idp.IReportingEnvironment.property.sectionEvaluationsTable">sectionEvaluationsTable</a></code> | <code>@aws-cdk/aws-glue-alpha.S3Table</code> | The Glue table for section-level evaluation metrics. |

---

##### `attributeEvaluationsTable`<sup>Required</sup> <a name="attributeEvaluationsTable" id="@cdklabs/genai-idp.IReportingEnvironment.property.attributeEvaluationsTable"></a>

```typescript
public readonly attributeEvaluationsTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for attribute-level evaluation metrics.

Contains detailed evaluation metrics for individual extracted attributes.

---

##### `documentEvaluationsTable`<sup>Required</sup> <a name="documentEvaluationsTable" id="@cdklabs/genai-idp.IReportingEnvironment.property.documentEvaluationsTable"></a>

```typescript
public readonly documentEvaluationsTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for document-level evaluation metrics.

Contains accuracy, precision, recall, F1 score, and other document-level metrics.

---

##### `meteringTable`<sup>Required</sup> <a name="meteringTable" id="@cdklabs/genai-idp.IReportingEnvironment.property.meteringTable"></a>

```typescript
public readonly meteringTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for metering data.

Contains cost and usage metrics for document processing operations.

---

##### `reportingBucket`<sup>Required</sup> <a name="reportingBucket" id="@cdklabs/genai-idp.IReportingEnvironment.property.reportingBucket"></a>

```typescript
public readonly reportingBucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where evaluation metrics and reporting data are stored in Parquet format.

Contains document-level, section-level, and attribute-level evaluation metrics.

---

##### `reportingDatabase`<sup>Required</sup> <a name="reportingDatabase" id="@cdklabs/genai-idp.IReportingEnvironment.property.reportingDatabase"></a>

```typescript
public readonly reportingDatabase: Database;
```

- *Type:* @aws-cdk/aws-glue-alpha.Database

The AWS Glue database containing tables for evaluation metrics.

Provides a structured catalog for querying evaluation data with Amazon Athena.

---

##### `sectionEvaluationsTable`<sup>Required</sup> <a name="sectionEvaluationsTable" id="@cdklabs/genai-idp.IReportingEnvironment.property.sectionEvaluationsTable"></a>

```typescript
public readonly sectionEvaluationsTable: S3Table;
```

- *Type:* @aws-cdk/aws-glue-alpha.S3Table

The Glue table for section-level evaluation metrics.

Contains evaluation metrics for individual sections within documents.

---

### ITrackingTable <a name="ITrackingTable" id="@cdklabs/genai-idp.ITrackingTable"></a>

- *Extends:* aws-cdk-lib.aws_dynamodb.ITable

- *Implemented By:* <a href="#@cdklabs/genai-idp.TrackingTable">TrackingTable</a>, <a href="#@cdklabs/genai-idp.ITrackingTable">ITrackingTable</a>

Interface for the document tracking table.

This table stores information about document processing status, metadata, and results,
enabling tracking of documents throughout their processing lifecycle from upload to completion.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.tableArn">tableArn</a></code> | <code>string</code> | Arn of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.tableName">tableName</a></code> | <code>string</code> | Table name of the dynamodb table. |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.encryptionKey">encryptionKey</a></code> | <code>aws-cdk-lib.aws_kms.IKey</code> | Optional KMS encryption key associated with this table. |
| <code><a href="#@cdklabs/genai-idp.ITrackingTable.property.tableStreamArn">tableStreamArn</a></code> | <code>string</code> | ARN of the table's stream, if there is one. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.ITrackingTable.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.ITrackingTable.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.ITrackingTable.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `tableArn`<sup>Required</sup> <a name="tableArn" id="@cdklabs/genai-idp.ITrackingTable.property.tableArn"></a>

```typescript
public readonly tableArn: string;
```

- *Type:* string

Arn of the dynamodb table.

---

##### `tableName`<sup>Required</sup> <a name="tableName" id="@cdklabs/genai-idp.ITrackingTable.property.tableName"></a>

```typescript
public readonly tableName: string;
```

- *Type:* string

Table name of the dynamodb table.

---

##### `encryptionKey`<sup>Optional</sup> <a name="encryptionKey" id="@cdklabs/genai-idp.ITrackingTable.property.encryptionKey"></a>

```typescript
public readonly encryptionKey: IKey;
```

- *Type:* aws-cdk-lib.aws_kms.IKey

Optional KMS encryption key associated with this table.

---

##### `tableStreamArn`<sup>Optional</sup> <a name="tableStreamArn" id="@cdklabs/genai-idp.ITrackingTable.property.tableStreamArn"></a>

```typescript
public readonly tableStreamArn: string;
```

- *Type:* string

ARN of the table's stream, if there is one.

---

### IUserIdentity <a name="IUserIdentity" id="@cdklabs/genai-idp.IUserIdentity"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.UserIdentity">UserIdentity</a>, <a href="#@cdklabs/genai-idp.IUserIdentity">IUserIdentity</a>

Interface for user identity management components.

Provides authentication and authorization for the web application.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IUserIdentity.property.identityPool">identityPool</a></code> | <code>aws-cdk-lib.aws_cognito_identitypool.IdentityPool</code> | The Cognito Identity Pool that provides temporary AWS credentials. |
| <code><a href="#@cdklabs/genai-idp.IUserIdentity.property.userPool">userPool</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPool</code> | The Cognito UserPool that stores user identities and credentials. |
| <code><a href="#@cdklabs/genai-idp.IUserIdentity.property.userPoolClient">userPoolClient</a></code> | <code>aws-cdk-lib.aws_cognito.IUserPoolClient</code> | The Cognito UserPool Client used by the web application for OAuth flows. |

---

##### `identityPool`<sup>Required</sup> <a name="identityPool" id="@cdklabs/genai-idp.IUserIdentity.property.identityPool"></a>

```typescript
public readonly identityPool: IdentityPool;
```

- *Type:* aws-cdk-lib.aws_cognito_identitypool.IdentityPool

The Cognito Identity Pool that provides temporary AWS credentials.

Allows authenticated users to access AWS services with appropriate permissions.

---

##### `userPool`<sup>Required</sup> <a name="userPool" id="@cdklabs/genai-idp.IUserIdentity.property.userPool"></a>

```typescript
public readonly userPool: IUserPool;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPool

The Cognito UserPool that stores user identities and credentials.

Handles user registration, authentication, and account management.

---

##### `userPoolClient`<sup>Required</sup> <a name="userPoolClient" id="@cdklabs/genai-idp.IUserIdentity.property.userPoolClient"></a>

```typescript
public readonly userPoolClient: IUserPoolClient;
```

- *Type:* aws-cdk-lib.aws_cognito.IUserPoolClient

The Cognito UserPool Client used by the web application for OAuth flows.

Enables the web UI to authenticate users against the UserPool.

---

### IWebApplication <a name="IWebApplication" id="@cdklabs/genai-idp.IWebApplication"></a>

- *Implemented By:* <a href="#@cdklabs/genai-idp.WebApplication">WebApplication</a>, <a href="#@cdklabs/genai-idp.IWebApplication">IWebApplication</a>

Interface for the web application that provides a user interface for the document processing solution.

Enables users to upload documents, monitor processing status, and access extraction results.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IWebApplication.property.bucket">bucket</a></code> | <code>aws-cdk-lib.aws_s3.IBucket</code> | The S3 bucket where the web application assets are deployed. |
| <code><a href="#@cdklabs/genai-idp.IWebApplication.property.distribution">distribution</a></code> | <code>aws-cdk-lib.aws_cloudfront.IDistribution</code> | The CloudFront distribution that serves the web application. |

---

##### `bucket`<sup>Required</sup> <a name="bucket" id="@cdklabs/genai-idp.IWebApplication.property.bucket"></a>

```typescript
public readonly bucket: IBucket;
```

- *Type:* aws-cdk-lib.aws_s3.IBucket

The S3 bucket where the web application assets are deployed.

Contains the static files for the web UI including HTML, CSS, and JavaScript.

---

##### `distribution`<sup>Required</sup> <a name="distribution" id="@cdklabs/genai-idp.IWebApplication.property.distribution"></a>

```typescript
public readonly distribution: IDistribution;
```

- *Type:* aws-cdk-lib.aws_cloudfront.IDistribution

The CloudFront distribution that serves the web application.

Provides global content delivery with low latency and high performance.

---

### IWorkteam <a name="IWorkteam" id="@cdklabs/genai-idp.IWorkteam"></a>

- *Extends:* aws-cdk-lib.IResource

- *Implemented By:* <a href="#@cdklabs/genai-idp.Workteam">Workteam</a>, <a href="#@cdklabs/genai-idp.IWorkteam">IWorkteam</a>

Interface for SageMaker workteam used in HITL workflows.


#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#@cdklabs/genai-idp.IWorkteam.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |
| <code><a href="#@cdklabs/genai-idp.IWorkteam.property.env">env</a></code> | <code>aws-cdk-lib.ResourceEnvironment</code> | The environment this resource belongs to. |
| <code><a href="#@cdklabs/genai-idp.IWorkteam.property.stack">stack</a></code> | <code>aws-cdk-lib.Stack</code> | The stack in which this resource is defined. |
| <code><a href="#@cdklabs/genai-idp.IWorkteam.property.workteamArn">workteamArn</a></code> | <code>string</code> | The ARN of the SageMaker workteam. |
| <code><a href="#@cdklabs/genai-idp.IWorkteam.property.workteamName">workteamName</a></code> | <code>string</code> | The name of the SageMaker workteam. |

---

##### `node`<sup>Required</sup> <a name="node" id="@cdklabs/genai-idp.IWorkteam.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `env`<sup>Required</sup> <a name="env" id="@cdklabs/genai-idp.IWorkteam.property.env"></a>

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

##### `stack`<sup>Required</sup> <a name="stack" id="@cdklabs/genai-idp.IWorkteam.property.stack"></a>

```typescript
public readonly stack: Stack;
```

- *Type:* aws-cdk-lib.Stack

The stack in which this resource is defined.

---

##### `workteamArn`<sup>Required</sup> <a name="workteamArn" id="@cdklabs/genai-idp.IWorkteam.property.workteamArn"></a>

```typescript
public readonly workteamArn: string;
```

- *Type:* string

The ARN of the SageMaker workteam.

---

##### `workteamName`<sup>Required</sup> <a name="workteamName" id="@cdklabs/genai-idp.IWorkteam.property.workteamName"></a>

```typescript
public readonly workteamName: string;
```

- *Type:* string

The name of the SageMaker workteam.

---

## Enums <a name="Enums" id="Enums"></a>

### LogLevel <a name="LogLevel" id="@cdklabs/genai-idp.LogLevel"></a>

Defines the logging verbosity levels for the document processing components.

Controls the amount of detail included in logs for troubleshooting and monitoring.

The log level affects all Lambda functions and other components in the IDP solution,
allowing administrators to adjust logging detail based on operational needs.

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#@cdklabs/genai-idp.LogLevel.DEBUG">DEBUG</a></code> | Most verbose logging level, includes detailed debugging information. Useful during development and troubleshooting but generates large log volumes. |
| <code><a href="#@cdklabs/genai-idp.LogLevel.INFO">INFO</a></code> | Standard logging level for operational information. Provides general information about the system's operation without excessive detail. |
| <code><a href="#@cdklabs/genai-idp.LogLevel.WARN">WARN</a></code> | Logs potentially harmful situations that don't prevent the system from working. |
| <code><a href="#@cdklabs/genai-idp.LogLevel.ERROR">ERROR</a></code> | Logs error events that might still allow the application to continue running. Indicates failures that should be investigated. |

---

##### `DEBUG` <a name="DEBUG" id="@cdklabs/genai-idp.LogLevel.DEBUG"></a>

Most verbose logging level, includes detailed debugging information. Useful during development and troubleshooting but generates large log volumes.

Includes detailed information about internal operations, variable values,
and processing steps that are useful for diagnosing issues.

---


##### `INFO` <a name="INFO" id="@cdklabs/genai-idp.LogLevel.INFO"></a>

Standard logging level for operational information. Provides general information about the system's operation without excessive detail.

Includes information about document processing events, workflow transitions,
and important operational milestones.

---


##### `WARN` <a name="WARN" id="@cdklabs/genai-idp.LogLevel.WARN"></a>

Logs potentially harmful situations that don't prevent the system from working.

Indicates issues that should be addressed but aren't critical failures.

Includes warnings about potential problems, performance issues,
or situations that might lead to errors if not addressed.

---


##### `ERROR` <a name="ERROR" id="@cdklabs/genai-idp.LogLevel.ERROR"></a>

Logs error events that might still allow the application to continue running. Indicates failures that should be investigated.

Includes information about processing failures, service errors,
and other issues that affect system functionality.

---

