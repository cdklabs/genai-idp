/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { yarn } from "cdklabs-projen-project-types";
import { Stability } from "projen/lib/cdk";
import { ReleasableCommits, TextFile } from "projen";
import { AwsCdkTypeScriptWorkspace } from "./projenrc/awscdk-typescript-workspace";
import { AwsCdkTypeScriptWorkspaceApp } from "./projenrc/awscdk-workspace-app-ts";
import { MkDocs } from "./projenrc/mkdocs";
import { UpstreamSourceSync } from "./projenrc/upstream-source-sync";
import { ProjenStruct, Struct } from "@mrgrain/jsii-struct-builder";
import path from "path";
import fs from 'fs';

const stability = Stability.EXPERIMENTAL;
const CDK_VERSION = '2.241.0';
const CONSTRUCTS_VERSION = '10.5.1';
const GENAI_CONSTRUCTS_VERSION = '0.1.314';
const JSII_VERSION = '~5.9';

const idpDeps = [
  `@aws-cdk/aws-lambda-python-alpha@^${CDK_VERSION}-alpha.0`,
  `@aws-cdk/aws-sagemaker-alpha@^${CDK_VERSION}-alpha.0`,
  `@aws-cdk/aws-glue-alpha@^${CDK_VERSION}-alpha.0`,
  `@aws-cdk/aws-bedrock-alpha@^${CDK_VERSION}-alpha.0`,
  `@aws-cdk/aws-bedrock-agentcore-alpha@^${CDK_VERSION}-alpha.0`,
  // INFO: atm, GenAI CDK Constructs only support NPM, PyPI, and .NET
  `@cdklabs/generative-ai-cdk-constructs@^${GENAI_CONSTRUCTS_VERSION}`
];

const rootProject = new yarn.CdkLabsMonorepo({
  defaultReleaseBranch: "main",
  stability,
  deps: ["@mrgrain/jsii-struct-builder"],
  devDeps: ["cdklabs-projen-project-types"],
  name: "idp-cdk-monorepo",
  github: true,
  release: true
});

const buildPackages = rootProject.addTask('build:packages');

/**
 * Create the GenAI IDP module with constructs
 */

const genaiIdp = new AwsCdkTypeScriptWorkspace({
  parent: rootProject,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "@cdklabs/genai-idp",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps, '@aws-cdk/cx-api', 'cdk-nag'],
  peerDeps: idpDeps,
  bundledDeps: ['yaml'],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
  jsiiOptions: {
    jsiiVersion: JSII_VERSION,
    stability,
    publishToPypi: {
      distName: `cdklabs.genai-idp`,
      module: `cdklabs.genai_idp`,
    },
    publishToNuget: {
      dotNetNamespace: 'Cdklabs.GenaiIdp',
      packageId: 'Cdklabs.GenaiIdp'
    }
  },
  releasableCommits: ReleasableCommits.featuresAndFixes('.')
});

const fixedKeyTablePropsPath = path.join(genaiIdp.srcdir, 'fixed-key-table-props.ts');

new ProjenStruct(genaiIdp, {
  name: 'FixedKeyTableProps',
  description: 'Properties for a DynamoDB Table that has a predefined, fixed partitionKey, sortKey, and timeToLiveAttribute',
  filePath: fixedKeyTablePropsPath,
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_dynamodb.TableProps'))
  .omit('partitionKey', 'sortKey', 'timeToLiveAttribute');

genaiIdp.eslint?.addIgnorePattern(fixedKeyTablePropsPath);

const environmentApiBasePropsPath = path.join(genaiIdp.srcdir, 'processing-environment-api', 'processing-environment-api-base-props.ts');
new ProjenStruct(genaiIdp, {
  name: 'ProcessingEnvironmentApiBaseProps',
  description: 'Properties for a GraphQL API that has a predefined schema',
  filePath: environmentApiBasePropsPath,
})
  .mixin(Struct.fromFqn('aws-cdk-lib.aws_appsync.GraphqlApiProps'))
  .omit('schema', 'definition')
  .update('name', { optional: true });

genaiIdp.eslint?.addIgnorePattern(environmentApiBasePropsPath);

const idpPythonFunctionOptionsPath = path.join(genaiIdp.srcdir, 'functions', 'idp-python-function-options.ts');

new ProjenStruct(genaiIdp, {
  name: 'IdpPythonFunctionOptions',
  description: 'Options for a Python Lambda function',
  filePath: idpPythonFunctionOptionsPath,
})
  .mixin(Struct.fromFqn('@aws-cdk/aws-lambda-python-alpha.PythonFunctionProps'))
  .omit('index', 'entry', 'handler', 'runtime', 'environment', 'memorySize', 'timeout', 'filesystem', 'bundling', 'failOnWarnings', 'allowAllOutbound', 'allowPublicSubnet', 'code', 'layers');
genaiIdp.eslint?.addIgnorePattern(idpPythonFunctionOptionsPath);

genaiIdp.bundleTask.spawn(genaiIdp.addTask("bundle:lambdas:lib", {
  steps: [
    { exec: 'mkdir -p assets/lib' },
    { exec: 'rsync -rLct ../../../sources/lib/ assets/lib/.' }
  ]
}));

// Custom prompt generator is already in assets/lambdas/custom_prompt_generator - no bundling needed

const lambdasDir = 'sources/src/lambda';
fs.readdirSync(lambdasDir).forEach(lambdaName => {

  const lambdaSrcDir = path.join('../../../', lambdasDir, lambdaName);

  genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:handler:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ${lambdaSrcDir}/ assets/lambdas/${lambdaName}/.` }
    ]
  }));
});

// Bundle AppSync schema and resolvers from nested structure
const appsyncLambdasDir = 'sources/nested/appsync/src/lambda';
if (fs.existsSync(appsyncLambdasDir)) {
  fs.readdirSync(appsyncLambdasDir).forEach(lambdaName => {
    const lambdaSrcDir = path.join('../../../', appsyncLambdasDir, lambdaName);
    genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:handler:${lambdaName}`, {
      steps: [
        { exec: `mkdir -p assets/lambdas/${lambdaName}` },
        { exec: `rsync -rLct ${lambdaSrcDir}/ assets/lambdas/${lambdaName}/.` }
      ]
    }));
  });
}

genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:appsync:env-api`, {
  steps: [
    { exec: `mkdir -p assets/appsync/env-api` },
    { exec: `rsync -rLct ../../../sources/nested/appsync/src/api/schema.graphql assets/appsync/env-api/.` }
  ]
}));

genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:webapp:ui`, {
  steps: [
    { exec: `mkdir -p assets/webapp/ui` },
    { exec: `rsync -rLct ../../../sources/src/ui/ assets/webapp/ui/.` }
  ]
}));

// Bundle system defaults for config merging at synthesis time
genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:system-defaults`, {
  steps: [
    { exec: `mkdir -p assets/system_defaults` },
    { exec: `rsync -rLct ../../../sources/lib/idp_common_pkg/idp_common/config/system_defaults/*.yaml assets/system_defaults/.` }
  ]
}));

// Bundle unified pattern Lambda functions
genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:unified:lambdas`, {
  steps: [
    { exec: `mkdir -p assets/lambdas/unified` },
    { exec: `rsync -av ../../../sources/patterns/unified/src/ assets/lambdas/unified/` }
  ]
}));

// Bundle unified pattern state machine
genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:unified:statemachine`, {
  steps: [
    { exec: `mkdir -p assets/statemachine/unified` },
    { exec: `rsync -av ../../../sources/patterns/unified/statemachine/ assets/statemachine/unified/` }
  ]
}));

// Bundle unified pattern configuration schema
genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:unified:schema`, {
  steps: [
    { exec: `mkdir -p assets/schemas/unified` },
    { exec: `cp ../../../schemas/unified/schema.json assets/schemas/unified/schema.json` }
  ]
}));

// Bundle unified pattern configuration presets
const unifiedConfigsDir = 'sources/config_library/unified';
const unifiedConfigs = [
  "bank-statement-sample",
  "docsplit",
  "fake-w2",
  "healthcare-multisection-package",
  "lending-package-sample",
  "lending-package-sample-govcloud",
  "ocr-benchmark",
  "realkie-fcc-verified",
  "rule-extraction",
  "rule-validation",
  "rvl-cdip",
  "rvl-cdip-with-few-shot-examples",
];

unifiedConfigs.forEach((configName) => {
  genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:unified:config:${configName}`, {
    steps: [
      { exec: `mkdir -p assets/configs/unified/${configName}` },
      { exec: `rsync -rLct ../../../${unifiedConfigsDir}/${configName}/config.yaml assets/configs/unified/${configName}/.` }
    ]
  }));
});

buildPackages.exec(`yarn workspace ${genaiIdp.name} build`);

const idpPattern1 = new AwsCdkTypeScriptWorkspace({
  parent: rootProject,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "@cdklabs/genai-idp-bda-processor",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps, '@aws-cdk/cx-api', 'cdk-nag'],
  peerDeps: [...idpDeps, genaiIdp],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
  jsiiOptions: {
    jsiiVersion: JSII_VERSION,
    stability,
    publishToPypi: {
      distName: `cdklabs.genai-idp-bda-processor`,
      module: `cdklabs.genai_idp_bda_processor`,
    },
    publishToNuget: {
      dotNetNamespace: 'Cdklabs.GenaiIdpBdaProcessor',
      packageId: 'Cdklabs.GenaiIdpBdaProcessor'
    }
  },
  releasableCommits: ReleasableCommits.featuresAndFixes('.'),
});

// Bundle lambdas for Pattern 1 (BDA Processor) - read dynamically
// Guard: pattern-1 sources removed in v0.5.2 (consolidated into unified pattern)
const pattern1LambdasDir = 'sources/patterns/pattern-1/src';
if (fs.existsSync(pattern1LambdasDir)) {
  fs.readdirSync(pattern1LambdasDir).forEach((lambdaName) => {
    const lambdaSrcDir = path.join('../../../', pattern1LambdasDir, lambdaName);
    idpPattern1.bundleTask.spawn(idpPattern1.addTask(`bundle:lambda:${lambdaName}`, {
      steps: [
        { exec: `mkdir -p assets/lambdas/${lambdaName}` },
        { exec: `rsync -rLct ${lambdaSrcDir}/* assets/lambdas/${lambdaName}/.` }
      ]
    }));
  });
}

// BDA processor no longer bundles its own configs, state machine, or schema.
// It delegates to UnifiedDocumentProcessor from @cdklabs/genai-idp which
// bundles these assets itself.

buildPackages.exec(`yarn workspace ${idpPattern1.name} build`);

const idpPattern2 = new AwsCdkTypeScriptWorkspace({
  parent: rootProject,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "@cdklabs/genai-idp-bedrock-llm-processor",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps, '@aws-cdk/cx-api', 'cdk-nag'],
  peerDeps: [...idpDeps, genaiIdp],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
  jsiiOptions: {
    jsiiVersion: JSII_VERSION,
    stability,
    publishToPypi: {
      distName: `cdklabs.genai-idp-bedrock-llm-processor`,
      module: `cdklabs.genai_idp_bedrock_llm_processor`,
    },
    publishToNuget: {
      dotNetNamespace: 'Cdklabs.GenaiIdpBedrockLlmProcessor',
      packageId: 'Cdklabs.GenaiIdpBedrockLlmProcessor'
    }
  },
  releasableCommits: ReleasableCommits.featuresAndFixes('.'),
});

// Bedrock LLM Processor no longer bundles its own configs, lambdas, state machine, or schema.
// It delegates to UnifiedDocumentProcessor from @cdklabs/genai-idp which
// bundles these assets itself.

buildPackages.exec(`yarn workspace ${idpPattern2.name} build`);

const idpPattern3 = new AwsCdkTypeScriptWorkspace({
  parent: rootProject,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "@cdklabs/genai-idp-sagemaker-udop-processor",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps, '@aws-cdk/cx-api', 'cdk-nag'],
  peerDeps: [...idpDeps, genaiIdp],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
  jsiiOptions: {
    jsiiVersion: JSII_VERSION,
    stability,
    publishToPypi: {
      distName: `cdklabs.genai-idp-sagemaker-udop-processor`,
      module: `cdklabs.genai_idp_sagemaker_udop_processor`,
    },
    publishToNuget: {
      dotNetNamespace: 'Cdklabs.GenaiIdpSagemakerUdopProcessor',
      packageId: 'Cdklabs.GenaiIdpSagemakerUdopProcessor'
    }
  },
  releasableCommits: ReleasableCommits.featuresAndFixes('.'),
});

// SageMaker UDOP Processor no longer bundles its own configs, lambdas, state machine, or schema.
// It delegates to UnifiedDocumentProcessor from @cdklabs/genai-idp.
// Only the SageMaker classification bridge Lambda is bundled as a local asset.

buildPackages.exec(`yarn workspace ${idpPattern3.name} build`);


new AwsCdkTypeScriptWorkspaceApp({
  parent: rootProject,
  private: true,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "sample-bda-lending",
  workspaceScope: "samples",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps],
  deps: [...idpDeps, idpPattern1, genaiIdp, '@types/aws-lambda', '@aws-sdk/client-bedrock-agent'],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
});

new AwsCdkTypeScriptWorkspaceApp({
  parent: rootProject,
  private: true,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "sample-bedrock",
  workspaceScope: "samples",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps],
  deps: [...idpDeps, idpPattern2, genaiIdp],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
});

const sample3App = new AwsCdkTypeScriptWorkspaceApp({
  parent: rootProject,
  private: true,
  stability,
  authorName: "AWS",
  authorEmail: "aws-cdk-dev@amazon.com",
  name: "sample-sagemaker-udop-rvl-cdip",
  workspaceScope: "samples",
  repository: "https://github.com/cdklabs/genai-idp",
  devDeps: [...idpDeps, '@types/aws-lambda', '@aws-sdk/client-sagemaker'],
  deps: [...idpDeps, idpPattern3, genaiIdp],
  prettier: true,
  jest: true,
  cdkVersion: CDK_VERSION,
  constructsVersion: CONSTRUCTS_VERSION,
});

sample3App.eslint?.allowDevDeps(
  "src/lambda-fns/sagemaker_train_is_complete/index.ts",
);

new TextFile(rootProject, '.nvmrc', {
  lines: ['22']
});

rootProject.gitignore.addPatterns('.venv/', '.*.md', '.kiro/');

// Configure MkDocs with GitHub Pages and API documentation
new MkDocs(rootProject, {
  path: 'docs',
  github: true,
  githubOptions: {
    workflowName: 'docs'
  },
  docgenApiReferences: {
    projects: [genaiIdp, idpPattern1, idpPattern2, idpPattern3],
    targetPath: 'docs/content/api-reference'
  }
});

// Configure upstream source synchronization
new UpstreamSourceSync(rootProject, {
  upstreamRepo: 'https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws.git',
  schedule: '0 2 * * 1', // Weekly on Monday at 2 AM UTC
});

// Override default dependabot.yml to exclude sources/ directory
new TextFile(rootProject, '.github/dependabot.yml', {
  lines: [
    '# ~~ Generated by projen. To modify, edit .projenrc.ts and run "npx projen".',
    '',
    'version: 2',
    'updates:',
    '  - package-ecosystem: npm',
    '    directory: /',
    '    schedule:',
    '      interval: daily',
    '    exclude-paths:',
    '      - "sources/**"',
  ],
});

rootProject.synth();
