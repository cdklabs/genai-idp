/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as stepfunctions from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the StepFunctionSubscriptionPublisherFunction.
 */
export interface StepFunctionSubscriptionPublisherFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The Step Functions state machine to monitor for execution status changes.
   * Function will be triggered by EventBridge when execution status changes.
   */
  readonly stateMachine: stepfunctions.IStateMachine;

  /**
   * The GraphQL API URL for making API calls.
   * Used to publish execution updates via GraphQL mutations.
   */
  readonly graphqlApiUrl: string;

  /**
   * The GraphQL API ARN for permission grants.
   * Used to allow the function to make GraphQL mutations.
   */
  readonly graphqlApiArn: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during execution.
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that automatically publishes Step Functions execution updates to GraphQL subscriptions.
 *
 * This function is triggered by EventBridge when Step Functions execution status changes
 * (RUNNING, SUCCEEDED, FAILED, TIMED_OUT, ABORTED). It retrieves the latest execution
 * details and publishes them to the GraphQL API via the publishStepFunctionExecutionUpdate
 * mutation, which triggers subscriptions for real-time monitoring.
 */
export class StepFunctionSubscriptionPublisherFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * The EventBridge rule that triggers this function on Step Functions status changes.
   */
  public readonly eventRule: events.Rule;

  /**
   * Creates a new StepFunctionSubscriptionPublisherFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: StepFunctionSubscriptionPublisherFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "stepfunction_subscription_publisher",
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
      timeout: cdk.Duration.seconds(30),
      memorySize: 256,
      description:
        "This AWS Lambda Function publishes Step Functions execution updates to GraphQL subscriptions via EventBridge.",
      environment: {
        APPSYNC_API_URL: props.graphqlApiUrl,
        LOG_LEVEL: props.logLevel || LogLevel.INFO,
      },
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

    // Grant permissions to invoke AppSync mutations
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ["appsync:GraphQL"],
        resources: [
          `${props.graphqlApiArn}/types/Mutation/fields/publishStepFunctionExecutionUpdate`,
        ],
      }),
    );

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Create EventBridge rule to trigger this function on Step Functions status changes
    this.eventRule = new events.Rule(this, "StepFunctionSubscriptionRule", {
      description:
        "Trigger Step Function subscription publisher on execution status changes",
      eventPattern: {
        source: ["aws.states"],
        detailType: ["Step Functions Execution Status Change"],
        detail: {
          stateMachineArn: [props.stateMachine.stateMachineArn],
          status: ["RUNNING", "SUCCEEDED", "FAILED", "TIMED_OUT", "ABORTED"],
        },
      },
      targets: [
        new targets.LambdaFunction(this, {
          retryAttempts: 3,
        }),
      ],
    });
  }
}
