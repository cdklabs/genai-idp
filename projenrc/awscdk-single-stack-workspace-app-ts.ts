import { SampleFile, TextFile } from 'projen';
import { AwsCdkTypeScriptWorkspaceApp, AwsCdkTypeScriptWorkspaceAppOptions } from './awscdk-workspace-app-ts';

export interface AwsCdkTypeScriptSingleStackWorkspaceAppOptions
  extends AwsCdkTypeScriptWorkspaceAppOptions {

  /**
   * @default "my-bucket-${AWS::Region}"
   */
  readonly fileAssetsBucketName: string;

  /**
   * @default the name of the project
   */
  readonly stackName?: string;

  /**
   * @default "prefix"
   */
  readonly bucketPrefix: string;
  readonly addVersionToBucketPrefix?: boolean;
  readonly version?: string;
}

export interface AwsCdkTypeScriptSingleStackAppOptionsBase
  extends AwsCdkTypeScriptSingleStackWorkspaceAppOptions {
  readonly bucketNameTemplate: string;
  readonly bucketPrefixTemplate: string;
}

/**
 * An AWS CDK TypeScript Single-Stack Application
 */
export abstract class AwsCdkTypeScriptSingleStackWorkspaceApp extends AwsCdkTypeScriptWorkspaceApp {
  constructor(options: AwsCdkTypeScriptSingleStackAppOptionsBase) {
    super({
      appEntrypoint: '../bin/app.ts',
      ...options,
      sampleCode: false,
    });
    const packageTask =
      this.tasks.tryFind('package') ?? this.addTask('package');

    const bucketNameTemplate = options.bucketNameTemplate;
    const bucketPrefixTemplate = options.bucketPrefixTemplate;

    packageTask.reset();

    const packageDefaultTask = this.addTask('package:default', {
      exec: 'cdk synth --no-notices --no-version-reporting --no-asset-metadata --no-path-metadata --quiet --output dist',
    });

    packageDefaultTask.env('SINGLESTACK_PACKAGE', 'SINGLESTACK_PACKAGE');
    packageDefaultTask.env('SINGLESTACK_DEFAULT_BUCKET', bucketNameTemplate);
    packageDefaultTask.env('SINGLESTACK_DEFAULT_BUCKET_PREFIX', bucketPrefixTemplate);

    packageTask.spawn(packageDefaultTask);

    // TODO: how to use specific roles to make this work?
    this.addDevDeps('cdk-assets');

    new TextFile(this, 'bin/app.ts', {
      lines: [
        '#!/usr/bin/env node',
        "import { App } from '../../../.././projenrc/app';",
        "import Stack from '../src/index';",
        '',
        'const app = new App();',
        `new Stack(app, '${options.stackName ?? this.name}');`,
        '',
        'app.synth();',
      ],
    });

    const sampleCode = options.sampleCode ?? true;

    if (sampleCode) {
      new SampleFile(this, 'src/index.ts', {
        contents: [
          "import { Stack } from 'aws-cdk-lib';",
          "import { Construct } from 'constructs';",
          'export default class SingleStack extends Stack {',
          '  constructor(scope: Construct, id: string) {',
          '    super(scope, id);',
          '  }',
          '}',
        ].join('\n'),
      });

      new SampleFile(this, 'test/index.test.ts', {
        contents: [
          "import { App } from 'aws-cdk-lib';",
          "import { Template } from 'aws-cdk-lib/assertions';",
          "import Stack from '../src/index';",
          '',
          "test('Snapshot', () => {",
          '  const app = new App();',
          "  const stack = new Stack(app, 'test');",
          '',
          '  const template = Template.fromStack(stack);',
          '  expect(template.toJSON()).toMatchSnapshot();',
          '});',
        ].join('\n'),
      });
    }

    // TODO: create deploy:dev task and remove the deploy task
    // TODO: create release:dev task for publishing assets to a test environment for testing the quicklinks
    // TODO: create release task for releasing to actual production. However, maybe it's a job for a github workflow?
  }
}
