/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { LogLevel } from "../../log-level";
import { VpcConfiguration } from "../../vpc-configuration";

/**
 * Properties for the Error Analyzer resolver function.
 *
 * This function provides GraphQL resolvers for error analysis operations,
 * enabling AI-powered failure diagnosis through the ProcessingEnvironmentApi.
 */
export interface ErrorAnalyzerResolverFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The Error Analyzer Lambda function for AI-powered analysis.
   * This function performs the actual error analysis and troubleshooting.
   */
  readonly analyzerFunction: lambda.IFunction;

  /**
   * The DynamoDB table for storing trace IDs and analysis results.
   * Used for persisting analysis data and correlation information.
   */
  readonly traceTable: dynamodb.ITable;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The log level for the resolver function.
   * Controls the verbosity of logs generated during GraphQL operations.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The retention period for CloudWatch logs.
   * Controls how long resolver logs are kept for troubleshooting.
   */
  readonly logRetention?: cdk.aws_logs.RetentionDays;

  /**
   * Optional VPC configuration for the resolver function.
   * When provided, deploys the function within a VPC with specified settings.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Lambda function that provides GraphQL resolvers for error analysis operations.
 *
 * This function handles GraphQL queries and mutations for error analysis,
 * coordinating with the Error Analyzer function to provide AI-powered troubleshooting.
 */
export class ErrorAnalyzerResolverFunction
  extends lambda_python.PythonFunction
{
  constructor(
    scope: Construct,
    id: string,
    props: ErrorAnalyzerResolverFunctionProps,
  ) {
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
        "error_analyzer_resolver",
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
      timeout: cdk.Duration.minutes(5),
      memorySize: 1024,
      environment: {
        ANALYZER_FUNCTION_NAME: props.analyzerFunction.functionName,
        TRACE_TABLE_NAME: props.traceTable.tableName,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
      },
      logGroup: props.logRetention
        ? new cdk.aws_logs.LogGroup(scope, `${id}LogGroup`, {
            encryptionKey: props.encryptionKey,
            retention: props.logRetention,
          })
        : undefined,
      ...props.vpcConfiguration,
    });

    // Grant permissions
    props.analyzerFunction.grantInvoke(this);
    props.traceTable.grantReadWriteData(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
  }
}
