import { yarn } from "cdklabs-projen-project-types";
import { Stability } from "projen/lib/cdk";
import { ReleasableCommits, TextFile } from "projen";
import { GitHub } from "projen/lib/github";
import { JobPermission } from "projen/lib/github/workflows-model";
import { AwsCdkTypeScriptWorkspace } from "./projenrc/awscdk-typescript-workspace";
import { AwsCdkTypeScriptWorkspaceApp } from "./projenrc/awscdk-workspace-app-ts";
import { ProjenStruct, Struct } from "@mrgrain/jsii-struct-builder";
import path from "path";

const stability = Stability.EXPERIMENTAL;
const CDK_VERSION = '2.206.0';
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

const lambdas = [
  "agent_processor",
  "agent_request_handler",
  "chat_with_document_resolver",
  "cognito_updater_hitl",
  "configuration_resolver",
  "copy_to_baseline_resolver",
  "create_a2i_resources",
  "create_document_resolver",
  "dashboard_merger",
  "delete_document_resolver",
  "evaluation_function",
  "get-workforce-url",
  "get_file_contents_resolver",
  "get_stepfunction_execution_resolver",
  "initialize_counter",
  "ipset_updater",
  "list_available_agents",
  "lookup_function",
  "publish_stepfunction_update_resolver",
  "query_knowledgebase_resolver",
  "queue_processor",
  "queue_sender",
  "reprocess_document_resolver",
  "save_reporting_data",
  "start_codebuild",
  "stepfunction_subscription_publisher",
  "update_configuration",
  "update_settings",
  "upload_resolver",
  "workflow_tracker"
];

lambdas.forEach((lambdaName) => {
  genaiIdp.bundleTask.spawn(genaiIdp.addTask(`bundle:handler:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ../../../sources/src/lambda/${lambdaName}/ assets/lambdas/${lambdaName}/.` }
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

const pattern1_lambdas = [
  "bda_completion_function",
  "bda_invoke_function",
  "processresults_function",
  "summarization_function",
  "hitl-status-update-function",
  "hitl-wait-function",
  "hitl-process-function"
];

pattern1_lambdas.forEach((lambdaName) => {
  idpPattern1.bundleTask.spawn(idpPattern1.addTask(`bundle:lambda:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ../../../sources/patterns/pattern-1/src/${lambdaName}/* assets/lambdas/${lambdaName}/.` }
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

const pattern2_lambdas = [
  "classification_function",
  "extraction_function",
  "ocr_function",
  "processresults_function",
  "summarization_function",
  "assessment_function"
];

pattern2_lambdas.forEach((lambdaName) => {
  idpPattern2.bundleTask.spawn(idpPattern2.addTask(`bundle:lambda:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ../../../sources/patterns/pattern-2/src/${lambdaName}/* assets/lambdas/${lambdaName}/.` }
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

const pattern3_lambdas = [
  "classification_function",
  "extraction_function",
  "ocr_function",
  "processresults_function",
  "summarization_function",
  "assessment_function"
];

pattern3_lambdas.forEach((lambdaName) => {
  p3BundleTask.spawn(idpPattern3.addTask(`bundle:lambda:${lambdaName}`, {
    steps: [
      { exec: `mkdir -p assets/lambdas/${lambdaName}` },
      { exec: `rsync -rLct ../../../sources/patterns/pattern-3/src/${lambdaName}/* assets/lambdas/${lambdaName}/.` }
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

const gh = GitHub.of(rootProject);

if (gh) {
  const docsWfl = gh.addWorkflow('docs');

  docsWfl.on({
    push: { branches: ['main'] },
    pullRequest: { branches: ['main'] },
    workflowDispatch: {}
  });

  docsWfl.addJob('build', {
    runsOn: ['ubuntu-latest'],
    permissions: {
      contents: JobPermission.READ,
      pages: JobPermission.WRITE,
      idToken: JobPermission.WRITE
    },
    steps: [
      {
        uses: 'actions/checkout@v4',
        with: { fetchDepth: 0 }
      },
      {
        name: 'Setup Python',
        uses: 'actions/setup-python@v4',
        with: { 'python-version': '3.x' }
      },
      {
        name: 'Install dependencies',
        run: 'pip install -r docs/requirements.txt'
      },
      {
        name: 'Build documentation',
        run: 'cd docs && mkdocs build'
      },
      {
        name: 'Upload Pages artifact',
        uses: 'actions/upload-pages-artifact@v3',
        with: { path: 'docs/site' }
      }
    ]
  });

  docsWfl.addJob('deploy', {
    if: "github.ref == 'refs/heads/main'",
    environment: {
      name: 'github-pages',
      url: '${{ steps.deployment.outputs.page_url }}'
    },
    runsOn: ['ubuntu-latest'],
    needs: ['build'],
    permissions: {
      contents: JobPermission.READ,
      pages: JobPermission.WRITE,
      idToken: JobPermission.WRITE
    },
    steps: [
      {
        name: 'Deploy to GitHub Pages',
        id: 'deployment',
        uses: 'actions/deploy-pages@v4'
      }
    ]
  });
}

rootProject.synth();