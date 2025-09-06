/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import { bedrock } from "@cdklabs/generative-ai-cdk-constructs";
import { IGuardrail } from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the ChatWithDocumentResolverFunction.
 */
export interface ChatWithDocumentResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The Bedrock knowledge base to query for document context.
   * Function needs query access to retrieve document information.
   */
  readonly knowledgeBase: bedrock.IKnowledgeBase;

  /**
   * The invokable model used for document chat functionality.
   * This model processes natural language conversations about documents.
   */
  readonly chatModel: bedrock.IInvokable;

  /**
   * Optional guardrail for content filtering and safety.
   */
  readonly guardrail?: IGuardrail;

  /**
   * The log level for the function.
   * Controls the verbosity of function logging.
   */
  readonly logLevel: LogLevel;

  /**
   * Optional KMS key for encrypting sensitive data.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * Lambda function for chat with document functionality.
 *
 * This function enables natural language conversations about processed documents
 * by combining document context from the knowledge base with conversational AI.
 * It maintains conversation history and provides contextual responses based on
 * document content.
 */
export class ChatWithDocumentResolverFunction extends lambda_python.PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ChatWithDocumentResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "chat_with_document_resolver",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            "mkdir -p /tmp/builddir",
            "mkdir -p /asset-output",
            "rsync -rL /asset-input/ /tmp/builddir",
            "cd /tmp/builddir",
            "sed -i '/\\.\\/lib/d' requirements.txt || true",
            "python -m pip install -r requirements.txt -t /tmp/builddir || true",
            'find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "build" -exec rm -rf {} +',
            'find /tmp/builddir -type d -name "tests" -exec rm -rf {} +',
            "rsync -rL /tmp/builddir/ /asset-output",
            "rm -rf /tmp/builddir",
            "cd /asset-output",
          ].join(" && "),
        ],
      },
      runtime: lambda.Runtime.PYTHON_3_12,
      timeout: cdk.Duration.seconds(60),
      memorySize: 512,
      description: "Lambda function to chat with documents via GraphQL API",
      environment: {
        KB_ID: props.knowledgeBase.knowledgeBaseId,
        KB_ACCOUNT_ID: cdk.Aws.ACCOUNT_ID,
        KB_REGION: cdk.Aws.REGION,
        LOG_LEVEL: props.logLevel,
        MODEL_ID: cdk.Fn.select(
          1,
          cdk.Fn.split("/", props.chatModel.invokableArn),
        ),
        GUARDRAIL_ID_AND_VERSION: props.guardrail
          ? `${props.guardrail.guardrailId}:${props.guardrail.guardrailVersion}`
          : "",
      },
      layers: [IdpPythonLayerVersion.getOrCreate(cdk.Stack.of(scope))],
      logGroup: props.logGroup,
      vpc: props.vpc,
      vpcSubnets: props.vpcSubnets,
      securityGroups: props.securityGroups,
    });

    // Grant permissions to query the knowledge base
    props.knowledgeBase.grantQuery(this);

    // Grant permissions to invoke the chat model
    this.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: [props.chatModel.invokableArn],
      }),
    );

    // Grant guardrail permissions if provided
    if (props.guardrail) {
      this.addToRolePolicy(
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          actions: ["bedrock:ApplyGuardrail"],
          resources: [props.guardrail.guardrailArn],
        }),
      );
    }

    // Grant KMS permissions if encryption key is provided
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
