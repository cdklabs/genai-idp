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
import { LogLevel } from "../../log-level";

/**
 * Properties for configuring the QueryKnowledgeBaseResolverFunction.
 */
export interface QueryKnowledgeBaseResolverFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The Bedrock knowledge base to query.
   * Function needs query access to retrieve information from the knowledge base.
   */
  readonly knowledgeBase: bedrock.IKnowledgeBase;

  /**
   * The invokable model used for knowledge base queries.
   * This model processes natural language queries against the document knowledge base.
   */
  readonly knowledgeBaseModel: bedrock.IInvokable;

  readonly guardrail?: IGuardrail;
  /**
   * The log level for the function.
   * Controls the verbosity of function logging.
   */
  readonly logLevel: LogLevel;

  /**
   * Optional KMS key for encrypting function resources.
   * When provided, ensures data security for the Lambda function.
   */
  readonly encryptionKey?: kms.IKey;
}

/**
 * A Lambda function that queries Bedrock Knowledge Base via GraphQL API.
 *
 * This function serves as a resolver for knowledge base queries, allowing clients
 * to search and retrieve information from the document knowledge base using
 * natural language queries. It integrates with Amazon Bedrock to provide
 * intelligent document search capabilities.
 */
export class QueryKnowledgeBaseResolverFunction
  extends lambda_python.PythonFunction
  implements lambda.IFunction
{
  /**
   * Creates a new QueryKnowledgeBaseResolverFunction.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the function
   */
  constructor(
    scope: Construct,
    id: string,
    props: QueryKnowledgeBaseResolverFunctionProps,
  ) {
    super(scope, id, {
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "query_knowledgebase_resolver",
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
            'find /tmp/builddir -type d -name "*.dist-info" -exec rm -rf {} +',
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
      description:
        "Lambda function to query Bedrock Knowledge Base via GraphQL API",
      environment: {
        KB_ID: props.knowledgeBase.knowledgeBaseId,
        KB_ACCOUNT_ID: cdk.Aws.ACCOUNT_ID,
        KB_REGION: cdk.Aws.REGION,
        LOG_LEVEL: props.logLevel,
        MODEL_ID: cdk.Fn.select(
          1,
          cdk.Fn.split("/", props.knowledgeBaseModel.invokableArn),
        ),
        GUARDRAIL_ID_AND_VERSION: props.guardrail
          ? `${props.guardrail.guardrailId}:${props.guardrail.guardrailVersion}`
          : "",
      },
      ...props,
    });

    // Grant permissions
    props.knowledgeBase.grantQuery(this);
    props.knowledgeBaseModel.grantInvoke(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
