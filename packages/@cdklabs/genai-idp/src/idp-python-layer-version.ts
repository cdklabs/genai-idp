/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as fs from "fs";
import path from "path";
import { PythonLayerVersion } from "@aws-cdk/aws-lambda-python-alpha";
import { AssetHashType, Stack } from "aws-cdk-lib";
import { Architecture, ILayerVersion, Runtime } from "aws-cdk-lib/aws-lambda";
import { md5hash } from "aws-cdk-lib/core/lib/helpers-internal";
import { Construct } from "constructs";

/**
 * A singleton class that provides a Python Lambda Layer with the idp_common package.
 */
export class IdpPythonLayerVersion {
  /**
   * Gets or creates a singleton instance of the IdpPythonLayerVersion.
   *
   * @param scope The construct scope where the layer should be created if it doesn't exist
   * @param modules The modules to install (using TypeScript spread operator)
   * @returns The singleton layer instance
   */
  public static getOrCreate(
    scope: Construct,
    ...modules: string[]
  ): ILayerVersion {
    return IdpPythonLayerVersion.getOrCreateForArchitecture(
      scope,
      Architecture.X86_64,
      ...modules,
    );
  }

  /**
   * Gets or creates a singleton instance of the IdpPythonLayerVersion for a specific architecture.
   *
   * @param scope The construct scope where the layer should be created if it doesn't exist
   * @param architecture The Lambda architecture to build the layer for
   * @param modules The modules to install
   * @returns The singleton layer instance
   */
  public static getOrCreateForArchitecture(
    scope: Construct,
    architecture: Architecture,
    ...modules: string[]
  ): ILayerVersion {
    // Sort modules to ensure consistent hash generation
    const sortedModules = modules.sort();

    // Create a unique hash based on the selected modules and architecture
    const moduleHash = md5hash(
      JSON.stringify({ modules: sortedModules, arch: architecture.name }),
    ).substring(0, 8);
    const layerId = `${IdpPythonLayerVersion.BASE_LAYER_ID}-${moduleHash}`;

    // Try to find an existing instance in the stack's construct tree
    const stack = Stack.of(scope);
    const existingLayer = stack.node.tryFindChild(layerId) as ILayerVersion;

    if (existingLayer) {
      return existingLayer;
    }

    // Build the pip install command with selected modules
    const pipInstallCommand =
      modules.length > 0
        ? `python -m pip install -e .[${modules.join(",")}] -t /asset-output/python`
        : `python -m pip install -e .[core] -t /asset-output/python`;

    // Compute a stable asset hash based on pyproject.toml content + modules + architecture
    // This prevents unnecessary rebuilds when only file timestamps change
    const entryPath = path.join(
      __dirname,
      "..",
      "assets",
      "lib",
      "idp_common_pkg",
    );
    const pyprojectContent = fs.readFileSync(
      path.join(entryPath, "pyproject.toml"),
      "utf8",
    );
    const assetHash = md5hash(
      JSON.stringify({
        pyproject: pyprojectContent,
        modules: sortedModules,
        arch: architecture.name,
        pipCommand: pipInstallCommand,
      }),
    );

    // Create a new instance if one doesn't exist
    const newLayer = new PythonLayerVersion(stack, layerId, {
      entry: entryPath,
      compatibleRuntimes: [Runtime.PYTHON_3_12],
      compatibleArchitectures: [architecture],
      description: `Lambda Layer containing the idp_common Python package with modules: ${modules.length > 0 ? modules.join(", ") : "core (base only)"} (${architecture.name})`,
      bundling: {
        assetHashType: AssetHashType.CUSTOM,
        assetHash,
        command: [
          "bash",
          "-c",
          // Create temporary directory for dependencies
          [
            `mkdir -p /tmp/builddir`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            pipInstallCommand,
            `mkdir -p /asset-output/python/idp_common`,
            `rsync -rL /tmp/builddir/idp_common/ /asset-output/python/idp_common`,
            // Clean up unnecessary files in the temp directory
            `find /asset-output -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /asset-output -type d -name "*.md" -exec rm -rf {} +`,
            `find /asset-output -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /asset-output -type d -name "build" -exec rm -rf {} +`,
            `find /asset-output -type d -name "tests" -exec rm -rf {} +`,
            `find /asset-output -type f -name "__editable__*" -exec rm -rf {} +`,
            // Clean up temporary directory
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
    });

    return newLayer;
  }

  // Base ID for the layer that will be used to find it in the construct tree
  private static readonly BASE_LAYER_ID =
    "com.amazonaws.cdk.cdklabs.genai-idp.idp-common-layer";
}
