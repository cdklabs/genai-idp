# v0.5.2 Parity — Remaining Items

## Already converted and working

- Core processing pipeline (unified processor with 12 functions, state machine, configuration, schema)
- ProcessingEnvironment (queue sender, queue processor, workflow tracker, concurrency, lookup, save reporting)
- ProcessingEnvironmentApi (20+ GraphQL resolvers)
- WebApplication (CloudFront, S3, CodeBuild, SSM settings)
- UserIdentity (Cognito)
- ReportingEnvironment (Glue database, 4 tables, crawler)
- 14 auxiliary feature modules (AgentAnalytics, AgentCompanionChat, CapacityPlanning, ChatWithDocument, DocumentDiscovery, DocumentEditing, Evaluation, HitlEnvironment, KnowledgeBaseQuery, MCPIntegration, ProcessingProgressMonitor, TestStudio, UserManagement)
- Invokable/IInvokable abstraction in core package for LambdaHook support
- UnifiedDocumentProcessorConfiguration with 10 preset configs and transform hooks
- BdaMetadataTable typed table

## Still to bring over

### High priority

1. **Post-processing Lambda hook** — `PostProcessingDecompressor` function triggered by EventBridge after workflow completion. Invokes a customer-provided Lambda ARN for downstream integrations. Should be a `ProcessingEnvironment`-level prop like `postProcessingLambdaHook?: lambda.IFunction`.

2. **InitializeConcurrencyTableLambda** — Custom resource that initializes the concurrency table counter on deployment. The `ConcurrencyTable` is created in CDK but the initialization custom resource is missing. Without it the counter row doesn't exist and the first queue processor invocation may fail.

### Medium priority

3. **Dataset deployer custom resources** — `TestStudio` has the deployer Lambda functions (`FccDatasetDeployer`, `DocSplitTestSetDeployer`, `OcrBenchmarkDeployer`) but the source also triggers them as CloudFormation custom resources that auto-deploy datasets on stack creation. The CDK `TestStudio` creates the functions but doesn't trigger them. The `W2DatasetDeployer` function isn't in CDK at all.

4. **ConfigurationBucket as a typed construct** — The source has a dedicated `ConfigurationBucket` with CORS, EventBridge, and lifecycle rules. In CDK, the unified processor takes `configurationBucket` as a prop (IoC) but doesn't provide a convenience construct. Consider a `ConfigurationBucket` construct with sensible defaults.

5. **Cognito external app client for MCP** — The source creates a separate Cognito app client for MCP integration (`CreateExternalAppClient` condition). The CDK `MCPIntegration` construct exists but may not create this client.

### Low priority / not needed

6. **LoggingBucket** — Centralized S3 access logging bucket. Operational concern — users handle this themselves or via Aspects.

7. **S3 bucket policies (SSL enforcement)** — Every source bucket has `EnforceSSLOnly`. Users can add via Aspects or `s3.BucketPolicy`.

8. **BackfillWorkerFunction / BackfillTriggerFunction** — Migration utilities for GSI attribute backfill when upgrading. Not needed for new deployments.

9. **DashboardMerger** — Lambda for merging CloudWatch dashboards. Not in CDK.

10. **ConfigurationCopyFunction** — Copies config library files from artifact bucket to configuration bucket during deployment. In CDK, configuration is pushed via custom resources from `*Configuration.bind()` methods, so this is handled differently.

## Not bringing over (by design)

- **WAF** — Users bring their own CloudFront / WAF
- **CloudFront geo restrictions / price class** — Users bring their own CloudFront
- **Permissions boundaries** — Handled by CDK Aspects
- **StacknameCheck** — CDK naming handles this
- **ReadPreviousIDPPattern** — Migration utility, not core functionality
- **ECR image scanning toggle** — Operational concern
