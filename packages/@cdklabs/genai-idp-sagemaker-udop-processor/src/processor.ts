/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as bedrock from "@aws-cdk/aws-bedrock-alpha/bedrock";
import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import {
  DocumentProcessorProps,
  IProcessingEnvironment,
  IDocumentProcessor,
  SectionSplittingStrategy,
} from "@cdklabs/genai-idp";
import { EvaluationFunction } from "@cdklabs/genai-idp/lib/internal/functions/evaluation-function";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { ISagemakerUdopProcessorConfiguration } from "./configuration";
import { SagemakerUdopProcessorConfigurationSchema } from "./configuration/schema";
import { AssessmentFunction } from "./internal/assessment-function";
import { ClassificationFunction } from "./internal/classification-function";
import { ExtractionFunction } from "./internal/extraction-function";
import { OcrFunction } from "./internal/ocr-function";
import { ProcessResultsFunction } from "./internal/process-results-function";
import { SummarizationFunction } from "./internal/summarization-function";

/**
 * Interface for SageMaker UDOP document processor implementation.
 *
 * @deprecated This processor pattern is deprecated and will be removed in v0.5.0.
 * Please migrate to Pattern 1 (BDA Processor) or Pattern 2 (Bedrock LLM Processor).
 *
 * SageMaker UDOP Processor uses specialized document processing with SageMaker endpoints
 * for document classification, combined with foundation models for extraction.
 * This processor is ideal for specialized document types that require custom
 * classification models like RVL-CDIP or UDOP for accurate document categorization
 * before extraction.
 *
 * Use SageMaker UDOP Processor when:
 * - Processing highly specialized or complex document types
 * - You need custom classification models beyond what foundation models can provide
 * - You have domain-specific document types requiring specialized handling
 * - You want to leverage fine-tuned models for specific document domains
 */
export interface ISagemakerUdopProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the SageMaker UDOP document processor.
 *
 * @deprecated This processor pattern is deprecated and will be removed in v0.5.0.
 * Please migrate to Pattern 1 (BDA Processor) or Pattern 2 (Bedrock LLM Processor).
 *
 * SageMaker UDOP Processor uses specialized document processing with SageMaker endpoints
 * for document classification, combined with foundation models for extraction.
 * This processor is ideal for specialized document types that require custom
 * classification models for accurate document categorization before extraction.
 *
 * SageMaker UDOP Processor offers the highest level of customization for document processing,
 * allowing you to deploy and use specialized models for document classification
 * while still leveraging foundation models for extraction tasks. This processor
 * is particularly useful for domain-specific document processing needs.
 */
export interface SagemakerUdopProcessorProps extends DocumentProcessorProps {
  /**
   * Configuration for the SageMaker UDOP document processor.
   * Provides customization options for the processing workflow,
   * including schema definitions, prompts, and evaluation settings.
   */
  readonly configuration: ISagemakerUdopProcessorConfiguration;

  /**
   * The maximum number of concurrent workers for OCR processing.
   * Controls parallelism during the text extraction phase to optimize
   * throughput while managing resource utilization.
   *
   * @default 20
   */
  readonly ocrMaxWorkers?: number;

  /**
   * Controls whether extraction results are evaluated for accuracy.
   * When enabled, compares extraction results against expected values
   * to measure extraction quality and identify improvement areas.
   *
   * @default false
   */
  readonly evaluationEnabled?: boolean;

  /**
   * Optional S3 bucket containing baseline documents for evaluation.
   * Used as ground truth when evaluating extraction accuracy by
   * comparing extraction results against known correct values.
   *
   * Required when evaluationEnabled is true.
   *
   * @default - No evaluation baseline bucket is configured
   */
  readonly evaluationBaselineBucket?: s3.IBucket;

  /**
   * Optional Bedrock guardrail to apply to extraction model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly extractionGuardrail?: bedrock.IGuardrail;

  /**
   * The SageMaker endpoint used for document classification.
   * Determines document types based on content and structure analysis using
   * specialized models like RVL-CDIP or UDOP deployed on SageMaker.
   *
   * This is a key component of Pattern 3, enabling specialized document classification
   * beyond what's possible with foundation models alone. Users can create their own
   * SageMaker endpoint using any method (CDK constructs, existing endpoints, etc.)
   * and pass it directly to the processor.
   */
  readonly classifierEndpoint: sagemaker.IEndpoint;

  /**
   * Optional Bedrock guardrail to apply to classification model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly classificationGuardrail?: bedrock.IGuardrail;

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
   * Enable edit sections feature for classification updates.
   *
   * When enabled, allows users to modify document classification through the UI
   * and trigger selective reprocessing of affected sections. This provides
   * flexibility to correct classification errors without reprocessing entire documents.
   *
   * @default false
   * @since v0.4.8
   */
  readonly enableEditSections?: boolean;

  /**
   * Section splitting strategy configuration.
   *
   * Controls how multi-page documents are divided into sections during classification.
   * This affects how documents of the same type are grouped together and processed.
   *
   * Options:
   * - DISABLED: Entire document treated as single section with first detected class
   * - PAGE: One section per page preventing automatic joining of same-type documents
   * - LLM_DETERMINED: Uses LLM boundary detection with "Start"/"Continue" indicators
   *
   * @default SectionSplittingStrategy.LLM_DETERMINED
   * @since v0.4.8
   */
  readonly sectionSplittingStrategy?: SectionSplittingStrategy;
}

/**
 * SageMaker UDOP document processor implementation that uses specialized models for document processing.
 *
 * @deprecated This processor pattern is deprecated and will be removed in v0.5.0.
 * Please migrate to Pattern 1 (BDA Processor) or Pattern 2 (Bedrock LLM Processor).
 *
 * This processor implements an intelligent document processing workflow that uses specialized
 * models like UDOP (Unified Document Processing) or RVL-CDIP deployed on SageMaker for document classification,
 * followed by foundation models for information extraction.
 *
 * SageMaker UDOP Processor is ideal for specialized document types that require custom classification models
 * beyond what's possible with foundation models alone, such as complex forms, technical documents,
 * or domain-specific content. It provides the highest level of customization for document
 * classification while maintaining the flexibility of foundation models for extraction.
 */
export class SagemakerUdopProcessor
  extends Construct
  implements ISagemakerUdopProcessor
{
  public readonly environment: IProcessingEnvironment;
  public readonly maxProcessingConcurrency: number;
  public readonly stateMachine: sfn.IStateMachine;

  constructor(
    scope: Construct,
    id: string,
    props: SagemakerUdopProcessorProps,
  ) {
    super(scope, id);

    this.environment = props.environment;
    this.maxProcessingConcurrency = props.maxProcessingConcurrency ?? 100;

    const schema = new SagemakerUdopProcessorConfigurationSchema();
    schema.bind(this);
    const renderedDefinition = props.configuration.bind(this);

    const { ocrMaxWorkers = 20 } = props;

    const ocrFunction = new OcrFunction(this, "OCRFunction", {
      metricNamespace: this.environment.metricNamespace,
      logLevel: this.environment.logLevel,
      maxWorkers: ocrMaxWorkers,
      trackingTable: this.environment.trackingTable,
      configurationTable: this.environment.configurationTable,
      inputBucket: this.environment.inputBucket,
      outputBucket: this.environment.outputBucket,
      workingBucket: this.environment.workingBucket,
      api: this.environment.api,
      encryptionKey: this.environment.encryptionKey,
      logGroup: new logs.LogGroup(this, "OCRFunctionLogGroup", {
        encryptionKey: this.environment.encryptionKey,
        retention: this.environment.logRetention,
      }),
      ...this.environment.vpcConfiguration,
    });

    const classificationFunction = new ClassificationFunction(
      this,
      "ClassificationFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        maxWorkers: 20, // TODO: move to a prop
        trackingTable: props.environment.trackingTable,
        sagemakerEndpoint: props.classifierEndpoint,
        configurationTable: this.environment.configurationTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        api: this.environment.api,
        encryptionKey: this.environment.encryptionKey,
        classificationGuardrail: props.classificationGuardrail,
        logGroup: new logs.LogGroup(this, "ClassificationFunctionLogGroup", {
          retention: this.environment.logRetention,
          encryptionKey: this.environment.encryptionKey,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Create Extraction Lambda Function
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
        api: this.environment.api,
        encryptionKey: this.environment.encryptionKey,
        extractionModel: renderedDefinition.extractionModel,
        extractionGuardrail: props.extractionGuardrail,
        customPromptGenerator: renderedDefinition.customPromptGenerator,
        logGroup: new logs.LogGroup(this, "ExtractionFunctionLogGroup", {
          retention: this.environment.logRetention,
          encryptionKey: this.environment.encryptionKey,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Create Assessment Lambda Function
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
        api: this.environment.api,
        encryptionKey: this.environment.encryptionKey,
        assessmentModel: renderedDefinition.assessmentModel,
        assessmentGuardrail: props.assessmentGuardrail,
        logGroup: new logs.LogGroup(this, "AssessmentFunctionLogGroup", {
          retention: this.environment.logRetention,
          encryptionKey: this.environment.encryptionKey,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Create ProcessResults Lambda Function
    const processResultsFunction = new ProcessResultsFunction(
      this,
      "ProcessResultsFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        trackingTable: this.environment.trackingTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        api: this.environment.api,
        encryptionKey: this.environment.encryptionKey,
        logGroup: new logs.LogGroup(this, "ProcessResultsFunctionLogGroup", {
          retention: this.environment.logRetention,
          encryptionKey: this.environment.encryptionKey,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

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
        api: this.environment.api,
        encryptionKey: this.environment.encryptionKey,
        summarizationModel: renderedDefinition.summarizationModel,
        summarizationGuardrail: props.summarizationGuardrail,
        logGroup: new logs.LogGroup(this, "SummarizationFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Create evaluation function if baseline bucket and model are provided
    // Otherwise create a no-op function to satisfy the workflow
    let evaluationFunction: lambda.IFunction;
    if (props.evaluationBaselineBucket && renderedDefinition.evaluationModel) {
      evaluationFunction = new EvaluationFunction(this, "EvaluationFunction", {
        entry: path.join(
          __dirname,
          "..",
          "assets",
          "lambdas",
          "evaluation_function",
        ),
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        trackingTable: this.environment.trackingTable,
        configurationTable: this.environment.configurationTable,
        baselineBucket: props.evaluationBaselineBucket,
        reportingEnvironment: this.environment.reportingEnvironment,
        saveReportingDataFunction: this.environment.saveReportingDataFunction,
        api: this.environment.api,
        encryptionKey: this.environment.encryptionKey,
        evaluationModel: renderedDefinition.evaluationModel,
        logGroup: new logs.LogGroup(this, "EvaluationFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      });
    } else {
      // Create a no-op function when evaluation is not configured
      evaluationFunction = new lambda.Function(this, "NoOpEvaluationFunction", {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "index.handler",
        code: lambda.Code.fromInline(`
def handler(event, context):
    # No-op function when evaluation is not configured
    return event.get('document', event)
`),
        timeout: cdk.Duration.seconds(10),
        memorySize: 128,
        description: "No-op function when evaluation is not configured",
      });
    }

    // Create the state machine
    const sm = new sfn.StateMachine(this, "DocumentProcessingStateMachine", {
      definitionBody: sfn.DefinitionBody.fromFile(
        path.join(__dirname, "..", "assets", "sfn", "workflow.asl.json"),
      ),
      definitionSubstitutions: {
        OCRFunctionArn: ocrFunction.functionArn,
        ClassificationFunctionArn: classificationFunction.functionArn,
        ExtractionFunctionArn: extractionFunction.functionArn,
        AssessmentFunctionArn: assessmentFunction.functionArn,
        ProcessResultsLambdaArn: processResultsFunction.functionArn,
        IsSummarizationEnabled: renderedDefinition.summarizationModel
          ? "true"
          : "false",
        IsAssessmentEnabled: renderedDefinition.assessmentModel
          ? "true"
          : "false",
        SummarizationLambdaArn: summarizationFunction.functionArn,
        EvaluationLambdaArn: evaluationFunction.functionArn,
        OutputBucket: this.environment.outputBucket.bucketName,
      },
      logs: {
        level: sfn.LogLevel.ALL,
        includeExecutionData: true,
        destination: new logs.LogGroup(this, "StateMachineLogGroup", {
          retention: this.environment.logRetention,
          encryptionKey: this.environment.encryptionKey,
        }),
      },
    });

    ocrFunction.grantInvoke(sm);
    classificationFunction.grantInvoke(sm);
    extractionFunction.grantInvoke(sm);
    assessmentFunction.grantInvoke(sm);
    processResultsFunction.grantInvoke(sm);
    summarizationFunction.grantInvoke(sm);
    evaluationFunction.grantInvoke(sm);

    this.stateMachine = sm;
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
   * Creates a CloudWatch metric for total classification requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total classification requests
   */
  public metricClassificationRequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "ClassificationRequestsTotal",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }
}
