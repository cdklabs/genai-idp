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
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the CreateA2IResourcesFunction.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface CreateA2IResourcesFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The ARN of the SageMaker workteam for A2I tasks.
   */
  readonly workteamArn: string;

  /**
   * The ARN of the IAM role for A2I Flow Definition.
   */
  readonly flowDefinitionRoleArn: string;

  /**
   * The S3 bucket for BDA output storage.
   */
  readonly outputBucket: IBucket;

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
 * A Lambda function that creates and manages Amazon A2I (Augmented AI) resources.
 *
 * This function handles the complete A2I lifecycle including:
 * - Create: Flow Definition and Human Task UI
 * - Update: Flow Definition and Human Task UI (delete old, create new)
 * - Delete: Comprehensive cleanup with verification and wait logic
 *
 * The function is designed as a CloudFormation custom resource handler
 * and manages SageMaker A2I resources for human-in-the-loop workflows.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class CreateA2IResourcesFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new CreateA2IResourcesFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: CreateA2IResourcesFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "create_a2i_resources",
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
      timeout: cdk.Duration.minutes(15), // Increased timeout for enhanced deletion verification
      memorySize: 256,
      description:
        "This AWS Lambda Function creates and manages Amazon A2I (Augmented AI) resources for HITL workflows.",
      environment: {
        STACK_NAME: cdk.Stack.of(scope).stackName,
        A2I_WORKTEAM_ARN: props.workteamArn,
        A2I_FLOW_DEFINITION_ROLE_ARN: props.flowDefinitionRoleArn,
        BDA_OUTPUT_BUCKET: props.outputBucket.bucketName,
        LOG_LEVEL: props.logLevel || LogLevel.INFO,
      },
      ...props,
    });

    // Grant permissions for SageMaker A2I operations
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "sagemaker:CreateFlowDefinition",
          "sagemaker:DeleteFlowDefinition",
          "sagemaker:DescribeFlowDefinition",
          "sagemaker:ListFlowDefinitions",
          "sagemaker:CreateHumanTaskUi",
          "sagemaker:DeleteHumanTaskUi",
          "sagemaker:DescribeHumanTaskUi",
          "sagemaker:ListHumanTaskUis",
        ],
        resources: ["*"], // SageMaker A2I operations require * resource access
      }),
    );

    // Grant permission to pass the Flow Definition role
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [props.flowDefinitionRoleArn],
      }),
    );

    // Grant S3 permissions for the output bucket
    props.outputBucket.grantReadWrite(this);

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
