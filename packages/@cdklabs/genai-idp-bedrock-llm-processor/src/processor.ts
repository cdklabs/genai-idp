/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import {
  DocumentProcessorProps,
  EvaluationFunction,
  IDocumentProcessor,
  IProcessingEnvironment,
  IUnifiedDocumentProcessor,
  IUnifiedDocumentProcessorConfiguration,
  IUnifiedDocumentProcessorConfigurationDefinition,
  UnifiedDocumentProcessor,
} from "@cdklabs/genai-idp";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { IBedrockLlmProcessorConfiguration } from "./configuration";

/**
 * Interface for Bedrock LLM document processor implementation.
 *
 * @since 0.5.2
 */
export interface IBedrockLlmProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the Bedrock LLM document processor facade.
 *
 * @since 0.5.2
 */
export interface BedrockLlmProcessorProps extends DocumentProcessorProps {
  /**
   * Configuration for the Bedrock LLM document processor.
   */
  readonly configuration: IBedrockLlmProcessorConfiguration;

  /**
   * The S3 bucket containing configuration files.
   */
  readonly configurationBucket: s3.IBucket;
}

/**
 * Bedrock LLM document processor facade over UnifiedDocumentProcessor.
 *
 * Delegates all processing to the unified processor using the pipeline path
 * (non-BDA). Uses Amazon Bedrock foundation models for OCR, classification,
 * extraction, assessment, summarization, and evaluation.
 *
 * @since 0.5.2
 */
export class BedrockLlmProcessor
  extends Construct
  implements IBedrockLlmProcessor
{
  public readonly environment: IProcessingEnvironment;
  public readonly maxProcessingConcurrency: number;
  public readonly stateMachine: sfn.IStateMachine;
  public readonly evaluationFunction?: EvaluationFunction;

  private readonly innerProcessor: UnifiedDocumentProcessor;

  constructor(scope: Construct, id: string, props: BedrockLlmProcessorProps) {
    super(scope, id);

    const renderedDefinition = props.configuration.bind(
      this,
      props.environment,
    );

    // Pass-through configuration for the unified processor
    const unifiedConfig: IUnifiedDocumentProcessorConfiguration = {
      bind: (
        _processor: IUnifiedDocumentProcessor,
      ): IUnifiedDocumentProcessorConfigurationDefinition => {
        return {
          ocrInferenceProvider: renderedDefinition.ocrInferenceProvider,
          classificationInferenceProvider:
            renderedDefinition.classificationInferenceProvider,
          extractionInferenceProvider:
            renderedDefinition.extractionInferenceProvider,
          assessmentInferenceProvider:
            renderedDefinition.assessmentInferenceProvider,
          summarizationInferenceProvider:
            renderedDefinition.summarizationInferenceProvider,
          evaluationModel: renderedDefinition.evaluationModel,
          ocrBackend: renderedDefinition.ocrBackend,
          customPromptGenerator: renderedDefinition.customPromptGenerator,
          raw: () => renderedDefinition.raw(),
          validate: () => renderedDefinition.validate(),
          isLegacyFormat: () => renderedDefinition.isLegacyFormat(),
          isJsonSchemaFormat: () => renderedDefinition.isJsonSchemaFormat(),
        };
      },
    };

    this.innerProcessor = new UnifiedDocumentProcessor(this, "Unified", {
      environment: props.environment,
      configurationBucket: props.configurationBucket,
      maxProcessingConcurrency: props.maxProcessingConcurrency,
      configuration: unifiedConfig,
    });

    this.environment = this.innerProcessor.environment;
    this.maxProcessingConcurrency =
      this.innerProcessor.maxProcessingConcurrency;
    this.stateMachine = this.innerProcessor.stateMachine;
    this.evaluationFunction = this.innerProcessor.evaluationFunction;
  }

  // ========================================
  // CloudWatch Metrics — Bedrock Requests
  // ========================================

  /** Total Bedrock model invocation requests. */
  public metricBedrockRequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestsTotal(props);
  }
  /** Successful Bedrock model invocation requests. */
  public metricBedrockRequestsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestsSucceeded(props);
  }
  /** Failed Bedrock model invocation requests. */
  public metricBedrockRequestsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestsFailed(props);
  }
  /** Bedrock single-request latency in milliseconds. */
  public metricBedrockRequestLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestLatency(props);
  }
  /** Bedrock total latency including retries in milliseconds. */
  public metricBedrockTotalLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockTotalLatency(props);
  }
  /** Bedrock requests that succeeded after retry. */
  public metricBedrockRetrySuccess(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRetrySuccess(props);
  }
  /** Bedrock request throttles. */
  public metricBedrockThrottles(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockThrottles(props);
  }
  /** Bedrock requests that exceeded max retries. */
  public metricBedrockMaxRetriesExceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockMaxRetriesExceeded(props);
  }
  /** Bedrock non-retryable errors. */
  public metricBedrockNonRetryableErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockNonRetryableErrors(props);
  }
  /** Bedrock unexpected errors. */
  public metricBedrockUnexpectedErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockUnexpectedErrors(props);
  }

  // ========================================
  // CloudWatch Metrics — Token Usage
  // ========================================

  /** Input tokens consumed. */
  public metricInputTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricInputTokens(props);
  }
  /** Output tokens generated. */
  public metricOutputTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricOutputTokens(props);
  }
  /** Total tokens used. */
  public metricTotalTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricTotalTokens(props);
  }

  // ========================================
  // CloudWatch Metrics — Document Processing
  // ========================================

  /** Documents submitted for extraction. */
  public metricInputDocuments(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricInputDocuments(props);
  }
  /** Document pages submitted for extraction. */
  public metricInputDocumentPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricInputDocumentPages(props);
  }

  // ========================================
  // CloudWatch Metrics — LambdaHook
  // ========================================

  /** Total LambdaHook invocation requests. */
  public metricLambdaHookRequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricLambdaHookRequestsTotal(props);
  }
  /** Successful LambdaHook invocation requests. */
  public metricLambdaHookRequestsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricLambdaHookRequestsSucceeded(props);
  }
  /** Failed LambdaHook invocation requests. */
  public metricLambdaHookRequestsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricLambdaHookRequestsFailed(props);
  }
}
