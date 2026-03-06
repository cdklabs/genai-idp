/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";

/**
 * Properties for the Calculate Capacity Resolver function.
 *
 * This function serves as a GraphQL resolver for capacity planning operations,
 * invoking the calculation function and returning results to the API.
 */
export interface CalculateCapacityResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The Lambda function that performs capacity calculations.
   * The resolver invokes this function to execute capacity planning logic.
   */
  readonly calculationFunction: lambda.IFunction;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function that serves as a GraphQL resolver for capacity planning operations.
 *
 * This function acts as a bridge between the GraphQL API and the capacity calculation
 * function, handling request/response transformation and error handling.
 *
 */
export class CalculateCapacityResolverFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: CalculateCapacityResolverFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.X86_64,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "calculate_capacity_resolver",
      ),
      bundling: {
        commandHooks: {
          beforeBundling: (_i: string, _o: string): string[] => {
            return [];
          },
          afterBundling: (_i: string, outputDir: string): string[] => {
            return [
              `find ${outputDir} -type d -name "*.egg-info" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "__pycache__" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "build" -exec rm -rf {} +`,
              `find ${outputDir} -type d -name "tests" -exec rm -rf {} +`,
            ];
          },
        },
      },
      timeout: cdk.Duration.minutes(15),
      memorySize: 512,
      environment: {
        CALCULATION_FUNCTION_NAME: props.calculationFunction.functionName,
      },
    });

    // Grant permissions
    props.calculationFunction.grantInvoke(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
