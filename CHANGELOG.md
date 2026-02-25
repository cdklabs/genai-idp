# Changelog

All notable changes to the GenAI IDP Accelerator for AWS CDK will be documented in this file.

This project tracks functional parity with the [GenAI IDP Accelerator Core](https://github.com/aws-samples/generative-ai-cdk-constructs) releases.

## 2026-02-25

### Changed

#### Dependencies
- **Migrated to AWS CDK Bedrock Alpha Modules**: Models, inference profiles, and guardrails now use official `@aws-cdk/aws-bedrock-alpha` package instead of `@cdklabs/generative-ai-cdk-constructs`
  - `BedrockFoundationModel` - Migrated to alpha
  - `CrossRegionInferenceProfile` - Migrated to alpha
  - `CrossRegionInferenceProfileRegion` - Migrated to alpha
  - `IBedrockInvokable` (formerly `IInvokable`) - Migrated to alpha with backward compatibility type alias
  - `IGuardrail` and `Guardrail` - Migrated to alpha
  - Knowledge Base constructs (`IKnowledgeBase`, `VectorKnowledgeBase`, `S3DataSource`, `ChunkingStrategy`) remain on `@cdklabs/generative-ai-cdk-constructs` until available in alpha modules
  - **Impact**: No breaking changes for users. All existing code continues to work. This change provides official AWS support, enhanced features, and future-proofs the codebase.
  - **Files affected**: 28 files across all processor packages, API functions, and samples

#### Package Versions
- Updated `constructs` to 10.5.1 (from 10.4.4)
- Updated `aws-cdk-lib` to 2.240.0 (from 2.232.2)
- Updated `@cdklabs/generative-ai-cdk-constructs` to 0.1.314 (from 0.1.312)
- Updated `jsii` to ~5.9 (from ~5.8)
- Added `@aws-cdk/aws-bedrock-alpha` at 2.240.0-alpha.0
- Added `@aws-cdk/aws-bedrock-agentcore-alpha` at 2.240.0-alpha.0

## 2026-02-23

### Core Version Alignment
This release brings the CDK constructs to functional parity with GenAI IDP Accelerator Core v0.4.8.

### Added

#### Core (Processing Environment & Processors)
- `lookupFunction` property in `ProcessingEnvironment` for document metadata retrieval
- New configuration options: `SectionSplittingStrategy`, `MaxPagesForClassification`, `VectorStoreType`
- JSON schema validator for configuration validation
- X-Ray tracing support via `tracing` property

#### API (ProcessingEnvironmentApi)
- **Test Studio**: Automated test management and execution with FCC dataset support
- **Agent Companion Chat**: Interactive AI assistant with multi-agent orchestration, session management, and Bedrock guardrails
- **MCP Integration**: External application access through Model Context Protocol
- **Error Analyzer**: AI-powered failure diagnosis and troubleshooting
- **Agent Analytics**: Analytics agent for processing metrics and insights
- GraphQL resolvers for agent chat operations (list sessions, get messages, delete sessions)
- GraphQL resolvers for test studio operations (test sets, test results, test execution)
- GraphQL resolvers for error analyzer operations

#### UI (WebApplication)
- `enableDocumentKnowledgeBase` prop to control knowledge base features in UI
- `documentDiscovery` prop for discovery bucket configuration
- Support for Vite build system (migrated from Create React App)
- Node.js 22.14.0 and npm 11.1.0 support
- Environment variables migrated from `REACT_APP_*` to `VITE_*` prefix
- `VITE_CLOUDFRONT_DOMAIN` environment variable
- Explicit CloudFront cache policy naming for multi-stack deployments
- Build timeout increased from 10 to 30 minutes

#### Samples
- Process monitoring support in SageMaker UDOP RVL-CDIP sample via `api.addStateMachine()`

#### Documentation
- Agent development conventions guide (AGENTS.md)
- Comprehensive API documentation updates

### Fixed
- Evaluation function circular dependency resolved by creating functions in processor constructors before state machine
- `ConfigurationResolverFunction` missing `idp_common` layer
- Lambda handler path for `GetStepFunctionExecutionResolver` 
- Lambda entry paths for processing-environment-api functions
- `UpdateConfigurationFunction` layer usage with proper extras configuration
- EU region permissions for BDA processor
- Missing `api.addStateMachine()` call in bedrock-llm sample
- SageMaker UDOP processor now always creates evaluation function to satisfy workflow requirements

### Changed

#### Architecture
- Restructured auxiliary features under `processing-environment-api/` (Test Studio, Agent Companion Chat, MCP Integration, Error Analyzer, Agent Analytics)
- Core processing features remain at root level (Document Discovery, Reporting Environment)
- `ProcessingEnvironment.attach()` simplified to return `DocumentProcessorAttachmentResult` instead of void
- Evaluation functions now created in processor constructors (BdaProcessor, BedrockLlmProcessor, SageMakerUdopProcessor) before state machine creation
- `EvaluationFunction` constructor accepts configurable `entry` path parameter for processor-specific implementations

#### API Changes
- Removed `documentDiscovery` from `ProcessingEnvironmentProps` (moved to `WebApplicationProps`)
- Removed `evaluationBucket` and `evaluationModel` from `DocumentProcessorAttachmentOptions`
- Added `tracing` property to `ProcessingEnvironment` for X-Ray support
- `ProcessingEnvironmentApi` automatically integrates auxiliary features when provided in props
- New GraphQL resolvers for agent chat, test studio, and error analyzer

#### Breaking Changes
- `ProcessingEnvironment` no longer accepts `documentDiscovery` prop (moved to `WebApplicationProps`)
- `ProcessingEnvironment.attach()` signature changed to return `DocumentProcessorAttachmentResult`
- Web application environment variables changed from `REACT_APP_*` to `VITE_*`
- Build process changed from `npm install` to `npm ci`
