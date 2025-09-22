/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import { Duration, Stack } from "aws-cdk-lib";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";

/**
 * Properties for the List Available Agents function.
 */
export interface ListAvailableAgentsFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional Secrets Manager secret for external MCP agents.
   */
  readonly externalMcpAgentsSecret?: secretsmanager.ISecret;

  /**
   * The KMS key used for encryption.
   */
  readonly encryptionKey?: IKey;
}

/**
 * Lambda function for listing available analytics agents.
 *
 * This function returns a list of available agents including both built-in
 * analytics agents and any configured external MCP agents.
 */
export class ListAvailableAgentsFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ListAvailableAgentsFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "list_available_agents",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            // Create temporary directory for dependencies
            `mkdir -p /tmp/builddir`,
            // Copy source files directly to output
            `mkdir -p /asset-output`,
            // `rsync -rLv /asset-input/${indexPath}/ /asset-output/${indexPath}`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            // Clean up unnecessary files in the temp directory
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            // Copy only necessary dependencies to the output
            `rsync -rL /tmp/builddir/ /asset-output`,
            // Clean up temporary directory
            `rm -rf /tm p/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      memorySize: 256,
      timeout: Duration.seconds(30),
      environment: {
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        METRIC_NAMESPACE: props.metricNamespace,
        ...(props.encryptionKey && { KMS_KEY_ID: props.encryptionKey.keyId }),
      },
      layers: [IdpPythonLayerVersion.getOrCreate(Stack.of(scope), "agents")],
    });

    // Grant external MCP agents secret access if provided
    if (props.externalMcpAgentsSecret) {
      props.externalMcpAgentsSecret.grantRead(this);
    }

    // Grant KMS permissions if encryption key is provided
    if (props.encryptionKey) {
      props.encryptionKey.grantDecrypt(this);
      props.encryptionKey.grantEncrypt(this);
    }
  }
}
