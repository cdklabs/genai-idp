/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as stepfunctions from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";

/**
 * Properties for configuring the GetStepFunctionExecutionResolverFunction.
 */
export interface GetStepFunctionExecutionResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The Step Functions state machine to query execution details from.
   * Function needs permissions to describe executions and get execution history.
   */
  readonly stateMachine: stepfunctions.IStateMachine;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that retrieves Step Functions execution details for GraphQL API responses.
 *
 * This function is used as a resolver in the ProcessingEnvironmentApi to fetch
 * detailed execution information from Step Functions, including step history,
 * status, and error details. It supports retrieving execution details with
 * comprehensive step-by-step breakdown for monitoring document processing workflows.
 */
export class GetStepFunctionExecutionResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new GetStepFunctionExecutionResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: GetStepFunctionExecutionResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "get_stepfunction_execution_resolver",
      ),
      handler: "lambda_handler",
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
            `find /tmp/builddir -type d -name "*.dist-info" -exec rm -rf {} +`,
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
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description:
        "This AWS Lambda Function gets Step Functions execution details for GraphQL API.",
      ...props,
    });

    // Grant permissions to describe executions and get execution history
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["states:DescribeExecution", "states:GetExecutionHistory"],
        resources: [
          // Allow access to executions of the specific state machine
          // Extract state machine name from ARN: arn:aws:states:region:account:stateMachine:name
          `arn:aws:states:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:execution:${cdk.Fn.select(6, cdk.Fn.split(":", props.stateMachine.stateMachineArn))}*`,
        ],
      }),
    );

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
