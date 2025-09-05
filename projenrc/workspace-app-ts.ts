import { TypeScriptWorkspace, TypeScriptWorkspaceOptions } from "cdklabs-projen-project-types/lib/yarn";

/**
 * TypeScript app.
 *
 * @pjid typescript-app
 */
export class TypeScriptWorkspaceAppProject extends TypeScriptWorkspace {
    constructor(options: TypeScriptWorkspaceOptions) {

        super({
            allowLibraryDependencies: false,
            entrypoint: "", // "main" is not needed in typescript apps
            ...options,
        });
    }
}
