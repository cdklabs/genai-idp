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
    }

    public get bundleTask(): Task {
        return this.tasks.tryFind("bundle") ?? this.tasks.addTask("bundle");
    }
}