/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import {
  DocumentProcessorProps,
  IProcessingEnvironment,
  IDocumentProcessor,
  ICustomPromptGenerator,
} from "@cdklabs/genai-idp";
import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as eventtargets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import {
  BedrockLlmProcessorConfigurationSchema,
  IBedrockLlmProcessorConfiguration,
} from "./configuration";
import { AssessmentFunction } from "./internal/assessment-function";
import { ClassificationFunction } from "./internal/classification-function";
import { ExtractionFunction } from "./internal/extraction-function";
import { HitlProcessFunction } from "./internal/hitl-process-function";
import { HitlStatusUpdateFunction } from "./internal/hitl-status-update-function";
import { HitlWaitFunction } from "./internal/hitl-wait-function";
import { OcrFunction } from "./internal/ocr-function";
import { ProcessResultsFunction } from "./internal/process-results-function";
import { SummarizationFunction } from "./internal/summarization-function";

/**
 * Interface for Bedrock LLM document processor implementation.
 *
 * Bedrock LLM Processor uses custom extraction with Amazon Bedrock models for flexible
 * document processing. This processor provides more control over the extraction
 * process and is ideal for custom document types or complex extraction needs
 * that require fine-grained control over the processing workflow.
 *
 * Use Bedrock LLM Processor when:
 * - Processing custom or complex document types not well-handled by BDA Processor
 * - You need more control over the extraction process and prompting
 * - You want to leverage foundation models directly with custom prompts
 * - You need to implement custom classification logic
 */
export interface IBedrockLlmProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the Bedrock LLM document processor.
 *
 * Bedrock LLM Processor uses custom extraction with Amazon Bedrock models, providing
 * flexible document processing capabilities for a wide range of document types.
 * This processor is ideal when you need more control over the extraction process
 * and want to implement custom classification and extraction logic using
 * foundation models directly.
 *
 * Bedrock LLM Processor offers a balance between customization and implementation complexity,
 * allowing you to define custom extraction schemas and prompts while leveraging
 * the power of Amazon Bedrock foundation models.
 */
export interface BedrockLlmProcessorProps extends DocumentProcessorProps {
  /**
   * Configuration for the Bedrock LLM document processor.
   * Provides customization options for the processing workflow,
   * including schema definitions, prompts, and evaluation settings.
   */
  readonly configuration: IBedrockLlmProcessorConfiguration;

  /**
   * The maximum number of concurrent workers for document classification.
   * Controls parallelism during the classification phase to optimize
   * throughput while managing resource utilization.
   *
   * @default 20
   */
  readonly classificationMaxWorkers?: number;

  /**
   * Optional Bedrock guardrail to apply to classification model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly classificationGuardrail?: bedrock.IGuardrail;

  /**
   * Optional Bedrock guardrail to apply to extraction model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly extractionGuardrail?: bedrock.IGuardrail;

  /**
   * Optional Bedrock guardrail to apply to summarization model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly summarizationGuardrail?: bedrock.IGuardrail;

  /**
   * Optional Bedrock guardrail to apply to assessment model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly assessmentGuardrail?: bedrock.IGuardrail;

  /**
   * Optional Bedrock guardrail to apply to OCR model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly ocrGuardrail?: bedrock.IGuardrail;

  /**
   * The maximum number of concurrent workers for OCR processing.
   * Controls parallelism during the text extraction phase to optimize
   * throughput while managing resource utilization.
   *
   * @default 20
   */
  readonly ocrMaxWorkers?: number;

  /**
   * Optional S3 bucket containing baseline documents for evaluation.
   * Used as ground truth when evaluating extraction accuracy by
   * comparing extraction results against known correct values.
   *
   * @default - No evaluation baseline bucket is configured
   */
  readonly evaluationBaselineBucket?: s3.IBucket;

  /**
   * Optional custom prompt generator for injecting business logic into extraction processing.
   * When provided, this Lambda function will be called to customize prompts based on
   * document content, business rules, or external system integrations.
   *
   * @default - No custom prompt generator is used
   */
  readonly customPromptGenerator?: ICustomPromptGenerator;

  /**
   * Optional SageMaker A2I Review Portal URL for HITL workflows.
   * Used to provide human reviewers with access to the A2I review interface
   * for document validation and correction workflows.
   *
   * @default - No A2I review portal URL is configured
   */
  readonly sageMakerA2IReviewPortalUrl?: string;

  /**
   * Enable Human In The Loop (A2I) for document review.
   *
   * @default false
   */
  readonly enableHitl?: boolean;
}

/**
 * This processor implements an intelligent document processing workflow that uses Amazon Bedrock with Nova or Claude models for both page classification/grouping and information extraction.
 *
 * The workflow consists of three main processing steps:
 *
 * - OCR processing using Amazon Textract
 * - Page classification and grouping using Claude via Amazon Bedrock
 * - Field extraction using Claude via Amazon Bedrock
 */
export class BedrockLlmProcessor
  extends Construct
  implements IBedrockLlmProcessor
{
  public readonly environment: IProcessingEnvironment;
  public readonly maxProcessingConcurrency: number;
  public readonly stateMachine: sfn.IStateMachine;

  constructor(scope: Construct, id: string, props: BedrockLlmProcessorProps) {
    super(scope, id);

    this.environment = props.environment;
    this.maxProcessingConcurrency = props.maxProcessingConcurrency ?? 100;

    const schema = new BedrockLlmProcessorConfigurationSchema();
    schema.bind(this);
    const renderedConfiguration = props.configuration.bind(this);

    const { classificationMaxWorkers = 20, ocrMaxWorkers = 20 } = props;

    // Create Lambda Function
    const ocrFunction = new OcrFunction(this, "OCRFunction", {
      metricNamespace: this.environment.metricNamespace,
      logLevel: this.environment.logLevel,
      maxWorkers: ocrMaxWorkers,
      configurationTable: this.environment.configurationTable,
      trackingTable: this.environment.trackingTable,
      inputBucket: this.environment.inputBucket,
      outputBucket: this.environment.outputBucket,
      workingBucket: this.environment.workingBucket,
      ocrModel: renderedConfiguration.ocrModel,
      ocrGuardrail: props.ocrGuardrail,
      api: this.environment.api,
      logGroup: new logs.LogGroup(this, "OCRFunctionLogGroup", {
        encryptionKey: this.environment.encryptionKey,
        retention: this.environment.logRetention,
      }),
      ...this.environment.vpcConfiguration,
    });

    // Classification Function
    const classificationFunction = new ClassificationFunction(
      this,
      "ClassificationFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        maxWorkers: classificationMaxWorkers,
        trackingTable: this.environment.trackingTable,
        configurationTable: this.environment.configurationTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        encryptionKey: this.environment.encryptionKey,
        classificationModel: renderedConfiguration.classificationModel,
        classificationGuardrail: props.classificationGuardrail,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "ClassificationFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Extraction Function
    const extractionFunction = new ExtractionFunction(
      this,
      "ExtractionFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        configurationTable: this.environment.configurationTable,
        trackingTable: this.environment.trackingTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        encryptionKey: this.environment.encryptionKey,
        extractionModel: renderedConfiguration.extractionModel,
        extractionGuardrail: props.extractionGuardrail,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "ExtractionFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Assessment Function - always create for runtime configuration control
    const assessmentFunction = new AssessmentFunction(
      this,
      "AssessmentFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        configurationTable: this.environment.configurationTable,
        trackingTable: this.environment.trackingTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        assessmentModel: renderedConfiguration.assessmentModel,
        assessmentGuardrail: props.assessmentGuardrail,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "AssessmentFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Process Results Function
    const processResultsFunction = new ProcessResultsFunction(
      this,
      "ProcessResultsFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        trackingTable: this.environment.trackingTable,
        configurationTable: this.environment.configurationTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        encryptionKey: this.environment.encryptionKey,
        enableHitl: props.enableHitl,
        sageMakerA2IReviewPortalUrl: props.sageMakerA2IReviewPortalUrl,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "ProcessResultsFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Summarization Function - always create for runtime configuration control
    const summarizationFunction = new SummarizationFunction(
      this,
      "SummarizationFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        configurationTable: this.environment.configurationTable,
        trackingTable: this.environment.trackingTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        encryptionKey: this.environment.encryptionKey,
        summarizationModel: renderedConfiguration.summarizationModel,
        summarizationGuardrail: props.summarizationGuardrail,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "SummarizationFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // HITL Wait Function
    const hitlWaitFunction = new HitlWaitFunction(this, "HITLWaitFunction", {
      logLevel: this.environment.logLevel,
      trackingTable: this.environment.trackingTable,
      workingBucket: this.environment.workingBucket,
      api: this.environment.api,
      sageMakerA2IReviewPortalUrl: props.sageMakerA2IReviewPortalUrl,
      logGroup: new logs.LogGroup(this, "HITLWaitFunctionLogGroup", {
        encryptionKey: this.environment.encryptionKey,
        retention: this.environment.logRetention,
      }),
      ...this.environment.vpcConfiguration,
    });

    // HITL Status Update Function
    const hitlStatusUpdateFunction = new HitlStatusUpdateFunction(
      this,
      "HITLStatusUpdateFunction",
      {
        workingBucket: this.environment.workingBucket,
        encryptionKey: this.environment.encryptionKey,
        logGroup: new logs.LogGroup(this, "HITLStatusUpdateFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Create State Machine IAM Role
    const stateMachineRole = new iam.Role(this, "StateMachineRole", {
      assumedBy: new iam.ServicePrincipal("states.amazonaws.com"),
    });

    // Lambda Invoke Policies
    const lambdaFunctions = [
      ocrFunction,
      classificationFunction,
      extractionFunction,
      assessmentFunction,
      processResultsFunction,
      summarizationFunction,
      hitlWaitFunction,
      hitlStatusUpdateFunction,
    ];

    // Grant invoke permissions to all functions
    lambdaFunctions.forEach((func) => func.grantInvoke(stateMachineRole));

    // CloudWatch Logs Policy
    stateMachineRole.addToPolicy(
      new iam.PolicyStatement({
        actions: [
          "logs:CreateLogDelivery",
          "logs:GetLogDelivery",
          "logs:UpdateLogDelivery",
          "logs:DeleteLogDelivery",
          "logs:ListLogDeliveries",
          "logs:PutResourcePolicy",
          "logs:DescribeResourcePolicies",
          "logs:DescribeLogGroups",
        ],
        resources: ["*"],
      }),
    );

    // State Machine Log Group
    const stateMachineLogGroup = new logs.LogGroup(
      this,
      "StateMachineLogGroup",
      {
        encryptionKey: this.environment.encryptionKey,
        retention: this.environment.logRetention,
      },
    );

    // Create State Machine
    this.stateMachine = new sfn.StateMachine(
      this,
      "DocumentProcessingStateMachine",
      {
        definitionBody: sfn.DefinitionBody.fromFile(
          path.join(__dirname, "..", "assets", "sfn", "workflow.asl.json"),
        ),
        definitionSubstitutions: {
          OCRFunctionArn: ocrFunction.functionArn,
          ClassificationFunctionArn: classificationFunction.functionArn,
          ExtractionFunctionArn: extractionFunction.functionArn,
          AssessmentFunctionArn: assessmentFunction.functionArn,
          ProcessResultsLambdaArn: processResultsFunction.functionArn,
          SummarizationLambdaArn: summarizationFunction.functionArn,
          HITLWaitFunctionArn: hitlWaitFunction.functionArn,
          HITLStatusUpdateFunctionArn: hitlStatusUpdateFunction.functionArn,
          OutputBucket: this.environment.outputBucket.bucketName,
        },
        role: stateMachineRole,
        logs: {
          destination: stateMachineLogGroup,
          level: sfn.LogLevel.ALL,
          includeExecutionData: true,
        },
      },
    );

    // Create HITL Process Function for handling A2I completion events
    const hitlProcessFunction = new HitlProcessFunction(
      this,
      "HITLProcessFunction",
      {
        logLevel: this.environment.logLevel,
        trackingTable: this.environment.trackingTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        stateMachine: this.stateMachine,
        logGroup: new logs.LogGroup(this, "HITLProcessFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Create EventBridge rule for HITL (SageMaker A2I) events
    const hitlEventRule = new events.Rule(this, "HITLEventRule", {
      eventPattern: {
        source: ["aws.sagemaker"],
        detailType: ["SageMaker A2I HumanLoop Status Change"],
        detail: {
          humanLoopStatus: ["Completed", "Failed", "Stopped"],
        },
      },
    });

    // Add Lambda function as a target for the EventBridge rule
    hitlEventRule.addTarget(
      new eventtargets.LambdaFunction(hitlProcessFunction),
    );

    this.environment.attach(this);
  }

  // ========================================
  // CloudWatch Metrics Methods
  // ========================================

  /**
   * Creates a CloudWatch metric for input documents processed.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for input documents
   */
  public metricInputDocuments(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "InputDocuments",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for input document pages processed.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for input document pages
   */
  public metricInputDocumentPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "InputDocumentPages",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for total Bedrock requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total Bedrock requests
   */
  public metricBedrockRequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockRequestsTotal",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for successful Bedrock requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for successful Bedrock requests
   */
  public metricBedrockRequestsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockRequestsSucceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for failed Bedrock requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for failed Bedrock requests
   */
  public metricBedrockRequestsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockRequestsFailed",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock request latency.
   * Measures individual request processing time.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock request latency in milliseconds
   */
  public metricBedrockRequestLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockRequestLatency",
      unit: cloudwatch.Unit.MILLISECONDS,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for total Bedrock request latency.
   * Measures total request processing time including retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total Bedrock request latency in milliseconds
   */
  public metricBedrockTotalLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockTotalLatency",
      unit: cloudwatch.Unit.MILLISECONDS,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for successful Bedrock request retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for successful Bedrock request retries
   */
  public metricBedrockRetrySuccess(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockRetrySuccess",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock request throttles.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock request throttles
   */
  public metricBedrockThrottles(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockThrottles",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock requests that exceeded max retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock requests that exceeded max retries
   */
  public metricBedrockMaxRetriesExceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockMaxRetriesExceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock non-retryable errors.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock non-retryable errors
   */
  public metricBedrockNonRetryableErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockNonRetryableErrors",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock unexpected errors.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock unexpected errors
   */
  public metricBedrockUnexpectedErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockUnexpectedErrors",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for input tokens consumed.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for input tokens
   */
  public metricInputTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "InputTokens",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for output tokens generated.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for output tokens
   */
  public metricOutputTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "OutputTokens",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for total tokens used.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total tokens
   */
  public metricTotalTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "TotalTokens",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for cache read input tokens.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for cache read input tokens
   */
  public metricCacheReadInputTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "CacheReadInputTokens",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for cache write input tokens.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for cache write input tokens
   */
  public metricCacheWriteInputTokens(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "CacheWriteInputTokens",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for total Bedrock embedding requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total Bedrock embedding requests
   */
  public metricBedrockEmbeddingRequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingRequestsTotal",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for successful Bedrock embedding requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for successful Bedrock embedding requests
   */
  public metricBedrockEmbeddingRequestsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingRequestsSucceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for failed Bedrock embedding requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for failed Bedrock embedding requests
   */
  public metricBedrockEmbeddingRequestsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingRequestsFailed",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock embedding request latency.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock embedding request latency in milliseconds
   */
  public metricBedrockEmbeddingRequestLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingRequestLatency",
      unit: cloudwatch.Unit.MILLISECONDS,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock embedding request throttles.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock embedding request throttles
   */
  public metricBedrockEmbeddingThrottles(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingThrottles",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock embedding requests that exceeded max retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock embedding requests that exceeded max retries
   */
  public metricBedrockEmbeddingMaxRetriesExceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingMaxRetriesExceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock embedding non-retryable errors.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock embedding non-retryable errors
   */
  public metricBedrockEmbeddingNonRetryableErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingNonRetryableErrors",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for Bedrock embedding unexpected errors.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for Bedrock embedding unexpected errors
   */
  public metricBedrockEmbeddingUnexpectedErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BedrockEmbeddingUnexpectedErrors",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }
}
