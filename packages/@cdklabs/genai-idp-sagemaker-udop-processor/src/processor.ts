/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
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
import { ISagemakerUdopProcessorConfiguration } from "./configuration";

/**
 * Interface for SageMaker UDOP document processor implementation.
 */
export interface ISagemakerUdopProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the SageMaker UDOP document processor facade.
 */
export interface SagemakerUdopProcessorProps extends DocumentProcessorProps {
  /**
   * Configuration for the SageMaker UDOP document processor.
   */
  readonly configuration: ISagemakerUdopProcessorConfiguration;

  /**
   * The S3 bucket containing configuration files.
   */
  readonly configurationBucket: s3.IBucket;

  /**
   * The SageMaker endpoint used for document classification.
   * The unified processor's classification function uses the SageMaker backend
   * to invoke this endpoint directly for document classification.
   */
  readonly classifierEndpoint: sagemaker.IEndpoint;
}

/**
 * SageMaker UDOP document processor facade over UnifiedDocumentProcessor.
 *
 * Uses the unified processor's native SageMaker classification backend
 * to route classification requests to a SageMaker endpoint while delegating
 * all other processing to the pipeline path.
 */
export class SagemakerUdopProcessor
  extends Construct
  implements ISagemakerUdopProcessor
{
  public readonly environment: IProcessingEnvironment;
  public readonly maxProcessingConcurrency: number;
  public readonly stateMachine: sfn.IStateMachine;
  public readonly evaluationFunction?: EvaluationFunction;

  private readonly innerProcessor: UnifiedDocumentProcessor;

  constructor(
    scope: Construct,
    id: string,
    props: SagemakerUdopProcessorProps,
  ) {
    super(scope, id);

    // Bind configuration
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
          ocrInferenceProvider: undefined,
          classificationInferenceProvider: undefined,
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
      classifierEndpoint: props.classifierEndpoint,
    });

    this.environment = this.innerProcessor.environment;
    this.maxProcessingConcurrency =
      this.innerProcessor.maxProcessingConcurrency;
    this.stateMachine = this.innerProcessor.stateMachine;
    this.evaluationFunction = this.innerProcessor.evaluationFunction;
  }

  // ========================================
  // CloudWatch Metrics
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
}
