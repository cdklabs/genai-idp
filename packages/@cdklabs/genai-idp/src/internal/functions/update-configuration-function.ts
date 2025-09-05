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

/**
 * Properties for configuring the UpdateConfigurationFunction.
 */
export interface UpdateConfigurationFunctionProps
  extends IdpPythonFunctionOptions {
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
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets,
      securityGroups: props.securityGroups,
      bundling: {
        commandHooks: {
          beforeBundling: (_i: string, _o: string): string[] => {
            return [];
          },
          afterBundling: (_i: string, outputDir: string): string[] => {
            return [
              `find ${outputDir} -type d -name "*.dist-info" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "*.egg-info" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "__pycache__" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "build" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "tests" -exec rm -rf {} +`,
            ];
          },
        },
      },
    });

    props.configurationTable.grantReadWriteData(this);
    props.key?.grantEncryptDecrypt(this);
  }
}
