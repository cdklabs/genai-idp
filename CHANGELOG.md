# Changelog

All notable changes to the GenAI IDP Accelerator for AWS CDK will be documented in this file.

This project tracks functional parity with the [GenAI IDP Accelerator Core](https://github.com/aws-samples/generative-ai-cdk-constructs) releases.

## 2026-03-01

### Core Version Alignment
This release aligns the CDK constructs with GenAI IDP Accelerator Core v0.4.16.

### Added

#### Pattern 2 (Bedrock LLM Processor)
- Rule validation Lambda functions (`RuleValidationFunction` and `RuleValidationOrchestrationFunction`) for business rule validation in extraction workflow
- Custom prompt generator support via `customPromptGeneratorFunction` in configuration options
  - Accepts `lambda.IFunction` in configuration definition options
  - Automatically injects function ARN into configuration at `extraction.custom_prompt_lambda_arn`
  - Grants invoke permissions to extraction function
  - Supports both user-provided functions and ARN-based imports from configuration files

#### Pattern 3 (SageMaker UDOP Processor)
- Custom prompt generator support via `customPromptGeneratorFunction` in configuration options (same implementation as Pattern 2)

#### Configuration System
- System defaults merging at CDK synthesis time for all processor patterns
- `mergeConfigWithDefaults()` utility function in `config-merge-utils.ts` for merging user configurations with pattern-specific system defaults
- Automatic null value removal from merged configurations (CloudFormation compatibility)
- Static factory methods for all BDA processor configurations:
  - `BdaProcessorConfiguration.lendingPackageSample()`
  - `BdaProcessorConfiguration.lendingPackageSampleGovcloud()`
  - `BdaProcessorConfiguration.docsplit()`
  - `BdaProcessorConfiguration.ocrBenchmark()`
  - `BdaProcessorConfiguration.realkieFccVerified()`
  - `BdaProcessorConfiguration.rvlCdip()`

### Fixed
- CloudFormation deployment error caused by null values in merged configurations (Pattern 3)
- Evaluation function now always created in Pattern 2 (required by state machine definition)
- Lambda entry paths updated for relocated document-discovery functions (moved one level deeper)

### Changed

#### Architecture
- Relocated `DocumentDiscovery` from `src/document-discovery/` to `src/processing-environment-api/document-discovery/` to properly categorize as API feature
  - Maintains backward compatibility through top-level exports
  - Updated Lambda entry paths to reflect new directory structure

#### Documentation
- Updated all version references from v0.4.8 to v0.4.16 across README files, documentation, and JSDoc comments
- Removed "What's New" sections from README and documentation (CDK wrapper focuses on usage, not upstream features)
- Updated HITL JSDoc comments to reference v0.4.16 instead of v0.4.12

#### Configuration
- Pattern 3 integration test now uses custom configuration file with `max_tokens: 4096` override (compatible with Nova Pro's 5000 token limit)

### Deprecated
- Pattern 3 (SageMaker UDOP Processor) marked as deprecated, will be removed in v0.5.0

## 2026-02-25

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

