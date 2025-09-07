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
const CDK_VERSION = '2.214.0';
const CONSTRUCTS_VERSION = '10.4.2';
const GENAI_CONSTRUCTS_VERSION = '0.1.309';

const idpDeps = [
  `@aws-cdk/aws-lambda-python-alpha@^${CDK_VERSION}-alpha.0`,
  `@aws-cdk/aws-sagemaker-alpha@^${CDK_VERSION}-alpha.0`,
  `@aws-cdk/aws-glue-alpha@^${CDK_VERSION}-alpha.0`,
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
    jsiiVersion: "~5.8",
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

genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:appsync:env-api`, {
  steps: [
    { exec: `mkdir -p assets/appsync/env-api` },
    { exec: `rsync -rLct ../../../sources/src/api/schema.graphql assets/appsync/env-api/.` }
  ]
}));

genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:webapp:ui`, {
  steps: [
    { exec: `mkdir -p assets/webapp/ui` },
    { exec: `rsync -rLct ../../../sources/src/ui/ assets/webapp/ui/.` }
  ]
}));

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
    jsiiVersion: "~5.8",
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
const pattern1LambdasDir = 'sources/patterns/pattern-1/src';
fs.readdirSync(pattern1LambdasDir).forEach((lambdaName) => {
  const lambdaSrcDir = path.join('../../../', pattern1LambdasDir, lambdaName);
  idpPattern1.bundleTask.spawn(idpPattern1.addTask(`bundle:lambda:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ${lambdaSrcDir}/* assets/lambdas/${lambdaName}/.` }
    ]
  }));
});

const pattern1_configs = [
  "lending-package-sample"
]

pattern1_configs.forEach((configName) => {
  idpPattern1.bundleTask.spawn(idpPattern1.addTask(`bundle:config:${configName}`, {
    steps: [
      { exec: `mkdir -p assets/configs/${configName}` },
      { exec: `rsync -rLct ../../../sources/config_library/pattern-1/${configName}/config.yaml assets/configs/${configName}/.` }
    ]
  }))
});

idpPattern1.bundleTask.spawn(idpPattern1.addTask(`bundle:state-machine`, {
  steps: [
    { exec: `mkdir -p assets/sfn` },
    { exec: `rsync -rLct ../../../sources/patterns/pattern-1/statemachine/workflow.asl.json assets/sfn/.` }
  ]
}));

// Bundle schema for Pattern 1 (BDA Processor)
idpPattern1.bundleTask.spawn(idpPattern1.addTask(`bundle:schema`, {
  steps: [
    { exec: `mkdir -p assets/schema` },
    { exec: `rsync -rLct ../../../schemas/pattern-1/schema.json assets/schema/.` }
  ]
}));

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
    jsiiVersion: "~5.8",
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

// Bundle lambdas for Pattern 2 (Bedrock LLM Processor) - read dynamically
const pattern2LambdasDir = 'sources/patterns/pattern-2/src';
fs.readdirSync(pattern2LambdasDir).forEach((lambdaName) => {
  const lambdaSrcDir = path.join('../../../', pattern2LambdasDir, lambdaName);
  idpPattern2.bundleTask.spawn(idpPattern2.addTask(`bundle:lambda:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ${lambdaSrcDir}/* assets/lambdas/${lambdaName}/.` }
    ]
  }));
});

const pattern2_configs = [
  "bank-statement-sample",
  "criteria-validation",
  "lending-package-sample",
  "rvl-cdip-package-sample",
  "rvl-cdip-package-sample-with-few-shot-examples",
]

pattern2_configs.forEach((configName) => {
  idpPattern2.bundleTask.spawn(idpPattern2.addTask(`bundle:config:${configName}`, {
    steps: [
      { exec: `mkdir -p assets/configs/${configName}` },
      { exec: `rsync -rLct ../../../sources/config_library/pattern-2/${configName}/config.yaml assets/configs/${configName}/.` }
    ]
  }))
});

idpPattern2.bundleTask.spawn(idpPattern2.addTask(`bundle:state-machine`, {
  steps: [
    { exec: `mkdir -p assets/sfn` },
    { exec: `rsync -rLct ../../../sources/patterns/pattern-2/statemachine/workflow.asl.json assets/sfn/.` }
  ]
}));

// Bundle schema for Pattern 2 (Bedrock LLM Processor)
idpPattern2.bundleTask.spawn(idpPattern2.addTask(`bundle:schema`, {
  steps: [
    { exec: `mkdir -p assets/schema` },
    { exec: `rsync -rLct ../../../schemas/pattern-2/schema.json assets/schema/.` }
  ]
}));

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
    jsiiVersion: "~5.8",
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

const p3BundleTask = idpPattern3.tasks.tryFind("bundle") ?? idpPattern3.tasks.addTask("bundle");
const p3PreCompileTask = idpPattern3.tasks.tryFind("pre-compile") ?? idpPattern3.tasks.addTask("pre-compile");

p3PreCompileTask.spawn(p3BundleTask);

// Bundle lambdas for Pattern 3 (SageMaker UDOP Processor) - read dynamically
const pattern3LambdasDir = 'sources/patterns/pattern-3/src';
fs.readdirSync(pattern3LambdasDir).forEach((lambdaName) => {
  const lambdaSrcDir = path.join('../../../', pattern3LambdasDir, lambdaName);
  p3BundleTask.spawn(idpPattern3.addTask(`bundle:lambda:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ${lambdaSrcDir}/* assets/lambdas/${lambdaName}/.` }
    ]
  }));
});

const pattern3_configs = [
  "rvl-cdip-package-sample"
]

pattern3_configs.forEach((configName) => {
  idpPattern3.bundleTask.spawn(idpPattern3.addTask(`bundle:config:${configName}`, {
    steps: [
      { exec: `mkdir -p assets/configs/${configName}` },
      { exec: `rsync -rLct ../../../sources/config_library/pattern-3/${configName}/config.yaml assets/configs/${configName}/.` }
    ]
  }))
});

p3BundleTask.spawn(idpPattern3.addTask(`bundle:state-machine`, {
  steps: [
    { exec: `mkdir -p assets/sfn` },
    { exec: `rsync -rLct ../../../sources/patterns/pattern-3/statemachine/workflow.asl.json assets/sfn/.` }
  ]
}));

// Bundle schema for Pattern 3 (SageMaker UDOP Processor)
p3BundleTask.spawn(idpPattern3.addTask(`bundle:schema`, {
  steps: [
    { exec: `mkdir -p assets/schema` },
    { exec: `rsync -rLct ../../../schemas/pattern-3/schema.json assets/schema/.` }
  ]
}));

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

rootProject.gitignore.addPatterns('.venv/', '.*.md');

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

rootProject.synth();