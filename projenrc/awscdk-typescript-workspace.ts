/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/
import { TypeScriptWorkspace, TypeScriptWorkspaceOptions } from "cdklabs-projen-project-types/lib/yarn";
import { JsiiDocgen, JsiiProjectOptions } from "projen/lib/cdk";
import { Eslint } from "projen/lib/javascript";
import { Jsii } from "./jsii";
import { AutoDiscover, AwsCdkDepsJs } from "projen/lib/awscdk";
import { DependencyType, SampleDir, Task } from "projen";

export interface AwsCdkTypeScriptWorkspaceOptions extends TypeScriptWorkspaceOptions {
    readonly jsiiOptions: Partial<JsiiProjectOptions>;
    readonly cdkVersion: string;
    readonly constructsVersion: string;
}

export class AwsCdkTypeScriptWorkspace extends TypeScriptWorkspace {

    constructor(options: AwsCdkTypeScriptWorkspaceOptions) {
        super({
            ...options,
            disableTsconfig: true
        });

        this.addFields({ stability: options.stability });

        const eslint = Eslint.of(this);

        eslint?.ignorePatterns.push('test/**/*.snapshot/*');

        new Jsii(this, options.jsiiOptions);
        new JsiiDocgen(this);
        new AutoDiscover(this, {
            srcdir: this.srcdir,
            testdir: this.testdir,
            tsconfigPath: this.tsconfigDev.fileName,
            cdkDeps: new AwsCdkDepsJs(this, {
                dependencyType: DependencyType.PEER,
                cdkVersion: options.cdkVersion,
                constructsVersion: options.constructsVersion
            }),
        });

        new SampleDir(this, "src", {
            files: {
                "index.ts": "",
            },
        });

        this.root.addGitIgnore(this.workspaceDirectory + "/tsconfig.json");
        this.root.addGitIgnore(this.workspaceDirectory + "/assets");
        this.root.addGitIgnore(this.workspaceDirectory + "/test/integ/.tmp/");
        this.preCompileTask.spawn(this.bundleTask);

        // Override unbump task to preserve exact workspace dependency versions in devDependencies
        this.addUnbumpOverride();
    }

    private addUnbumpOverride(): void {
        const unbumpTask = this.tasks.tryFind('unbump');
        if (unbumpTask) {
            this.tasks.removeTask('unbump');
            this.addTask('unbump', {
                description: 'Restores version to 0.0.0',
                env: {
                    OUTFILE: 'package.json',
                    CHANGELOG: 'dist/changelog.md',
                    BUMPFILE: 'dist/version.txt',
                    RELEASETAG: 'dist/releasetag.txt',
                    RELEASE_TAG_PREFIX: `${this.name}@`,
                    VERSIONRCOPTIONS: '{"path":"."}',
                    BUMP_PACKAGE: 'commit-and-tag-version@^12',
                    RELEASABLE_COMMITS: 'git log --no-merges --oneline $LATEST_TAG..HEAD -E --grep "^(feat|fix){1}(\\([^()[:space:]]+\\))?(!)?:[[:blank:]]+.+" -- .',
                },
                steps: [
                    { builtin: 'release/reset-version' },
                    { 
                        spawn: 'gather-versions',
                        env: { RESET_VERSIONS: 'true' }
                    },
                    { 
                        exec: 'node -e "const fs = require(\'fs\'); const pkg = JSON.parse(fs.readFileSync(\'package.json\', \'utf8\')); if (pkg.devDependencies && pkg.devDependencies[\'@cdklabs/genai-idp\']) { pkg.devDependencies[\'@cdklabs/genai-idp\'] = \'0.0.0\'; } fs.writeFileSync(\'package.json\', JSON.stringify(pkg, null, 2) + \'\\n\');"'
                    }
                ]
            });
        }
    }

    public get bundleTask(): Task {
        return this.tasks.tryFind("bundle") ?? this.tasks.addTask("bundle");
    }
}