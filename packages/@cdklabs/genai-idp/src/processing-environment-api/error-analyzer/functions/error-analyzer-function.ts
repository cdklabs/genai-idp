/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../../functions/idp-python-function-options";

/**
 * Properties for the Error Analyzer function.
 *
 * This function provides AI-powered failure diagnosis using Claude Sonnet 4
 * with CloudWatch log analysis and X-Ray trace correlation capabilities.
 */
export interface ErrorAnalyzerFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for storing trace IDs and analysis results.
   * The function uses this table to persist trace data and correlation information.
   */
  readonly traceTable: dynamodb.ITable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Model selection for AI-powered failure diagnosis.
   * Configures which foundation model to use for error analysis.
   *
   * @default "anthropic.claude-3-5-sonnet-20241022-v2:0"
   */
  readonly model?: string;

  /**
   * System prompt for error analysis.
   * Configures the AI model's behavior and analysis approach.
   */
  readonly systemPrompt?: string;

  /**
   * Enable CloudWatch log analysis capabilities.
   * When enabled, provides tools for log search, filtering, and correlation.
   *
   * @default true
   */
  readonly enableLogAnalysis?: boolean;

  /**
   * Enable X-Ray trace analysis capabilities.
   * When enabled, provides tools for distributed tracing and debugging.
   *
   * @default true
   */
  readonly enableTraceAnalysis?: boolean;
}

/**
 * Lambda function that provides AI-powered error analysis and troubleshooting.
 *
 * This function uses Claude Sonnet 4 to analyze document processing failures,
 * correlate CloudWatch logs, and provide intelligent troubleshooting recommendations.
 */
export class ErrorAnalyzerFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: ErrorAnalyzerFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "error_analyzer",
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
      memorySize: 2048,
      environment: {
        TRACE_TABLE_NAME: props.traceTable.tableName,
        MODEL_ID: props.model ?? "anthropic.claude-3-5-sonnet-20241022-v2:0",
        SYSTEM_PROMPT: props.systemPrompt ?? "",
        ENABLE_LOG_ANALYSIS:
          props.enableLogAnalysis !== false ? "true" : "false",
        ENABLE_TRACE_ANALYSIS:
          props.enableTraceAnalysis !== false ? "true" : "false",
      },
    });

    // Grant permissions
    props.traceTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // Grant CloudWatch Logs permissions for log analysis
    if (props.enableLogAnalysis !== false) {
      this.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "logs:DescribeLogGroups",
            "logs:DescribeLogStreams",
            "logs:FilterLogEvents",
            "logs:GetLogEvents",
            "logs:StartQuery",
            "logs:StopQuery",
            "logs:GetQueryResults",
          ],
          resources: ["*"],
        }),
      );
    }

    // Grant X-Ray permissions for trace analysis
    if (props.enableTraceAnalysis !== false) {
      this.addToRolePolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            "xray:GetTraceGraph",
            "xray:GetTraceSummaries",
            "xray:BatchGetTraces",
            "xray:GetServiceGraph",
            "xray:GetTimeSeriesServiceStatistics",
          ],
          resources: ["*"],
        }),
      );
    }

    // Grant Bedrock permissions for AI analysis
    this.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "bedrock:InvokeModel",
          "bedrock:InvokeModelWithResponseStream",
        ],
        resources: [
          `arn:aws:bedrock:*::foundation-model/${props.model ?? "anthropic.claude-3-5-sonnet-20241022-v2:0"}`,
        ],
      }),
    );
  }
}
