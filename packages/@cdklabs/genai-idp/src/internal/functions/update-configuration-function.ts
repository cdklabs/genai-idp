/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import { aws_kms } from "aws-cdk-lib";
import * as lambda from "aws-cdk-lib/aws-lambda";

import { Construct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { IdpPythonFunctionOptions } from "../../functions";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";

/**
 * Properties for configuring the UpdateConfigurationFunction.
 */
export interface UpdateConfigurationFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The configuration table that will be updated by this function.
   * This table stores system-wide configuration settings.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly key?: aws_kms.IKey;
}

/**
 * A Lambda function for updating configuration settings in the configuration table.
 *
 * This function is used as a custom resource provider to initialize and update
 * configuration settings during deployment. It supports updating schema definitions,
 * default configurations, and other system settings stored in the configuration table.
 */
export class UpdateConfigurationFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new UpdateConfigurationFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: UpdateConfigurationFunctionProps,
  ) {
    super(scope, id, {
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "update_configuration",
      ),
      environment: {
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
      },
      layers: [IdpPythonLayerVersion.getOrCreate(scope)],
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets,
      securityGroups: props.securityGroups,
      bundling: {
        command: [
          "bash",
          "-c",
          [
            // Create temporary directory for dependencies
            `mkdir -p /tmp/builddir`,
            // Copy source files directly to output
            `mkdir -p /asset-output`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            `sed -i '/lib\\/idp_common_pkg/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            // Clean up unnecessary files in the temp directory
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            // Copy only necessary dependencies to the output
            `rsync -rL /tmp/builddir/ /asset-output`,
            // Clean up temporary directory
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
    });

    props.configurationTable.grantReadWriteData(this);
    props.key?.grantEncryptDecrypt(this);
  }
}
