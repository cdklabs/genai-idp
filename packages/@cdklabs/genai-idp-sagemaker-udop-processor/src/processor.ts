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
  Invokable,
  UnifiedDocumentProcessor,
} from "@cdklabs/genai-idp";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ISagemakerUdopProcessorConfiguration } from "./configuration";
import { SagemakerClassificationHookFunction } from "./sagemaker-classification-hook-function";

/**
 * Interface for SageMaker UDOP document processor implementation.
 */
export interface ISagemakerUdopProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the SageMaker UDOP document processor facade.
 */
export interface SagemakerUdopProcessorProps extends DocumentProcessorProps {
  /** Configuration for the SageMaker UDOP document processor. */
  readonly configuration: ISagemakerUdopProcessorConfiguration;
  /** The S3 bucket containing configuration files. */
  readonly configurationBucket: s3.IBucket;
  /**
   * The SageMaker endpoint used for document classification.
   * A LambdaHook bridge reads page artifacts from `workLocationUri`
   * and calls this endpoint for classification.
   */
  readonly classifierEndpoint: sagemaker.IEndpoint;
}

/**
 * SageMaker UDOP document processor facade over UnifiedDocumentProcessor.
 *
 * Creates a LambdaHook bridge that uses `workLocationUri` to read page
 * artifacts (image, Textract JSON) from S3 and calls the SageMaker endpoint
 * for classification. All other stages delegate to the unified processor.
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

  constructor(scope: Construct, id: string, props: SagemakerUdopProcessorProps) {
    super(scope, id);

    // Create the SageMaker classification bridge Lambda
    const bridgeLambda = new SagemakerClassificationHookFunction(this, "ClassificationBridge", {
      functionName: cdk.Lazy.string({
        produce: () =>
          `GENAIIDP-${cdk.Names.uniqueResourceName(this, {
            maxLength: 40,
            allowedSpecialCharacters: "-",
          })}-sm-cls`,
      }),
      timeout: cdk.Duration.minutes(5),
      memorySize: 256,
      environment: {
        SAGEMAKER_ENDPOINT_NAME: props.classifierEndpoint.endpointName,
      },
    });

    // Grant permissions
    props.classifierEndpoint.grantInvoke(bridgeLambda);
    // Bridge Lambda reads page artifacts (image, rawText.json) from the output bucket
    props.environment.outputBucket.grantRead(bridgeLambda);

    const classificationInvokable = Invokable.fromFunction(bridgeLambda);

    // Bind configuration
    const renderedDefinition = props.configuration.bind(this, props.environment);

    // Pass-through configuration for the unified processor
    const unifiedConfig: IUnifiedDocumentProcessorConfiguration = {
      bind: (
        _processor: IUnifiedDocumentProcessor,
      ): IUnifiedDocumentProcessorConfigurationDefinition => {
        // Override classification to route through LambdaHook bridge
        const rawConfig = renderedDefinition.raw();
        if (!rawConfig.classification) rawConfig.classification = {};
        rawConfig.classification.model = "LambdaHook";
        rawConfig.classification.model_lambda_hook_arn = bridgeLambda.functionArn;

        return {
          ocrInferenceProvider: undefined,
          classificationInferenceProvider: classificationInvokable,
          extractionInferenceProvider: renderedDefinition.extractionInferenceProvider,
          assessmentInferenceProvider: renderedDefinition.assessmentInferenceProvider,
          summarizationInferenceProvider: renderedDefinition.summarizationInferenceProvider,
          evaluationModel: renderedDefinition.evaluationModel,
          ocrBackend: renderedDefinition.ocrBackend,
          customPromptGenerator: renderedDefinition.customPromptGenerator,
          raw: () => rawConfig,
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
    this.maxProcessingConcurrency = this.innerProcessor.maxProcessingConcurrency;
    this.stateMachine = this.innerProcessor.stateMachine;
    this.evaluationFunction = this.innerProcessor.evaluationFunction;
  }

  // ========================================
  // CloudWatch Metrics
  // ========================================

  public metricBedrockRequestsTotal(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestsTotal(props);
  }
  public metricBedrockRequestsSucceeded(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestsSucceeded(props);
  }
  public metricBedrockRequestsFailed(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricBedrockRequestsFailed(props);
  }
  public metricInputTokens(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricInputTokens(props);
  }
  public metricOutputTokens(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricOutputTokens(props);
  }
  public metricInputDocuments(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricInputDocuments(props);
  }
  public metricInputDocumentPages(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricInputDocumentPages(props);
  }
  public metricLambdaHookRequestsTotal(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricLambdaHookRequestsTotal(props);
  }
  public metricLambdaHookRequestsSucceeded(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricLambdaHookRequestsSucceeded(props);
  }
  public metricLambdaHookRequestsFailed(props?: cloudwatch.MetricOptions): cloudwatch.Metric {
    return this.innerProcessor.metricLambdaHookRequestsFailed(props);
  }
}
