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
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the GetWorkforceUrlFunction.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface GetWorkforceUrlFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The name of the SageMaker workteam.
   */
  readonly workteamName: string;

  /**
   * Optional existing private workforce ARN.
   * When provided, the function will use this workforce instead of the workteam name.
   */
  readonly existingPrivateWorkforceArn?: string;

  /**
   * The log level for the function.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional KMS key for encrypting function resources.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that retrieves workforce portal URLs for HITL workflows.
 *
 * This function is designed as a CloudFormation custom resource handler
 * that retrieves the SageMaker workforce portal URL for human reviewers
 * to access documents that require manual review and correction.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class GetWorkforceUrlFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new GetWorkforceUrlFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: GetWorkforceUrlFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "get-workforce-url",
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
      memorySize: 256,
      description:
        "This AWS Lambda Function retrieves workforce portal URLs for HITL workflows.",
      environment: {
        WORKTEAM_NAME: props.workteamName,
        EXISTING_PRIVATE_WORKFORCE_ARN: props.existingPrivateWorkforceArn || "",
        LOG_LEVEL: props.logLevel || LogLevel.INFO,
      },
      ...props,
    });

    // Grant permissions to describe SageMaker workteams and workforces
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "sagemaker:DescribeWorkteam",
          "sagemaker:DescribeWorkforce",
          "sagemaker:ListWorkteams",
          "sagemaker:ListWorkforces",
        ],
        resources: ["*"], // SageMaker describe operations require * resource access
      }),
    );

    // Grant permissions for CloudFormation custom resource responses
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["s3:PutObject"],
        resources: [
          "arn:aws:s3:::cloudformation-custom-resource-response-*",
          "arn:aws:s3:::cloudformation-custom-resource-response-*/*",
        ],
      }),
    );

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
