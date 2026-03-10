/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";
import { ErrorAnalyzerFunction } from "./functions";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IApiFeature,
} from "../processing-environment-api";

/**
 * Interface for Error Analyzer construct.
 *
 * Provides AI-powered failure diagnosis capabilities for document processing workflows.
 * Enables intelligent troubleshooting using Claude Sonnet 4 with CloudWatch log analysis
 * and X-Ray trace correlation.
 *
 */
export interface IErrorAnalyzer extends IConstruct {
  /**
   * Lambda function for AI-powered error analysis.
   */
  readonly analyzerFunction: lambda.IFunction;

  /**
   * Optional DynamoDB table for storing trace IDs and analysis results.
   */
  readonly traceTable?: dynamodb.ITable;
}

/**
 * Properties for ErrorAnalyzer construct.
 *
 */
export interface ErrorAnalyzerProps {
  /**
   * Optional DynamoDB table for storing trace IDs and analysis results.
   * When not provided, a new table will be created.
   *
   * @default - A new table is created
   */
  readonly traceTable?: dynamodb.ITable;

  /**
   * Optional KMS key for encrypting analysis data.
   * When provided, ensures trace data and analysis results are encrypted at rest.
   *
   * @default - AWS managed encryption
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
   *
   * @default - Default error analysis prompt
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
 * Error Analyzer construct for AI-powered failure diagnosis.
 *
 * Provides comprehensive error analysis capabilities including:
 * - AI-powered failure diagnosis using Claude Sonnet 4
 * - CloudWatch log analysis and correlation
 * - X-Ray trace analysis and debugging
 * - Request ID-based correlation
 * - Configurable model selection and system prompts
 *
 * Error Analyzer integrates with the ProcessingEnvironment to provide
 * intelligent troubleshooting for document processing workflows, helping
 * users quickly identify and resolve processing failures.
 *
 */
export class ErrorAnalyzer
  extends Construct
  implements IErrorAnalyzer, IApiFeature
{
  /**
   * Lambda function for AI-powered error analysis.
   */
  public readonly analyzerFunction: lambda.IFunction;

  /**
   * Optional DynamoDB table for storing trace IDs and analysis results.
   */
  public readonly traceTable?: dynamodb.ITable;

  constructor(scope: Construct, id: string, props: ErrorAnalyzerProps = {}) {
    super(scope, id);

    // Create or use provided trace table
    this.traceTable =
      props.traceTable ??
      new dynamodb.Table(this, "TraceTable", {
        partitionKey: {
          name: "requestId",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: { name: "timestamp", type: dynamodb.AttributeType.NUMBER },
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        encryption: props.encryptionKey
          ? dynamodb.TableEncryption.CUSTOMER_MANAGED
          : dynamodb.TableEncryption.AWS_MANAGED,
        encryptionKey: props.encryptionKey,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        pointInTimeRecovery: true,
        timeToLiveAttribute: "ttl",
      });

    // Create analyzer function
    this.analyzerFunction = new ErrorAnalyzerFunction(
      this,
      "AnalyzerFunction",
      {
        traceTable: this.traceTable!,
        encryptionKey: props.encryptionKey,
        model: props.model ?? "anthropic.claude-3-5-sonnet-20241022-v2:0",
        systemPrompt: props.systemPrompt,
        enableLogAnalysis: props.enableLogAnalysis ?? true,
        enableTraceAnalysis: props.enableTraceAnalysis ?? true,
      },
    );

    // Grant permissions
    this.traceTable?.grantReadWriteData(this.analyzerFunction);
  }

  /**
   * Enable this Error Analyzer feature in the ProcessingEnvironmentApi.
   *
   * This method integrates the error analysis functionality with the GraphQL API
   * by creating the necessary data sources and resolvers. It should be called after
   * both the API and this construct have been created.
   *
   * Example:
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const errorAnalyzer = new ErrorAnalyzer(this, 'ErrorAnalyzer', { ... });
   * api.enable(errorAnalyzer);
   *
   * @param api The ProcessingEnvironmentApi to enable in
   *    */
  public enableInApi(api: IProcessingEnvironmentApi): void {
    // Import the resolver functions
    const { ErrorAnalyzerResolverFunction } = functions;

    // Create error analyzer resolver function
    const errorAnalyzerResolverFunction = new ErrorAnalyzerResolverFunction(
      api as any,
      "ErrorAnalyzerResolverFunction",
      {
        analyzerFunction: this.analyzerFunction,
        traceTable: this.traceTable!,
        encryptionKey: undefined, // Will use API's encryption key
      },
    );

    // Create data source
    const errorAnalyzerDataSource = api.addLambdaDataSource(
      "ErrorAnalyzerDataSource",
      errorAnalyzerResolverFunction,
    );

    // Create error analysis resolvers
    errorAnalyzerDataSource.createResolver("AnalyzeErrorResolver", {
      typeName: "Mutation",
      fieldName: "analyzeError",
    });

    errorAnalyzerDataSource.createResolver("GetErrorAnalysisResolver", {
      typeName: "Query",
      fieldName: "getErrorAnalysis",
    });

    errorAnalyzerDataSource.createResolver("ListErrorAnalysesResolver", {
      typeName: "Query",
      fieldName: "listErrorAnalyses",
    });
  }
}
