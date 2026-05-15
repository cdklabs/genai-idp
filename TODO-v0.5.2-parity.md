# v0.5.2 Parity — Remaining Items

## Done

- Unified document processor with 12 functions, state machine, configuration, schema
- Configuration layer with 10 preset configs, transform hooks, LambdaHook support
- Invokable/IInvokable abstraction in core package, consolidated from bedrock-llm-processor
- BdaMetadataTable typed table
- All functions self-contained: typed props, internal grants, bundling, layers
- Architecture-aware layer building (ARM_64)
- Integ test passing end-to-end

## Remaining

- Unit test update (`test/unified-document-processor.test.ts` — `configuration` prop now required)
- Sample stack composing unified processor with API, WebApp, and auxiliary features

## Not needed (by design)

- Dataset deployers — users can use `s3.BucketDeployment` or custom resources
- Post-processing Lambda hook — users hook into the exposed `stateMachine` via EventBridge
- WAF, CloudFront geo/price — users bring their own CloudFront
- Permissions boundaries — CDK Aspects
- Concurrency table init — already handled by `ConcurrencyTable` construct
