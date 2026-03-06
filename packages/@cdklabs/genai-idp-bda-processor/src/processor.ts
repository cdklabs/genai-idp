/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as bedrock from "@aws-cdk/aws-bedrock-alpha/bedrock";
import {
  DocumentProcessorProps,
  IDocumentProcessor,
  IProcessingEnvironment,
  SectionSplittingStrategy,
} from "@cdklabs/genai-idp";
import { EvaluationFunction } from "@cdklabs/genai-idp/lib/internal/functions/evaluation-function";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as events from "aws-cdk-lib/aws-events";
import * as eventtargets from "aws-cdk-lib/aws-events-targets";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { BdaMetadataTable } from "./bda-metadata-table";
import { IBdaProcessorConfiguration } from "./configuration/configuration";
import { BdaProcessorConfigurationSchema } from "./configuration/schema";
import { IDataAutomationProject } from "./data-automation-project";
import { BdaCompletionFunction } from "./internal/bda-completion-function";
import { BdaInvokeFunction } from "./internal/bda-invoke-function";
import { ProcessResultsFunction } from "./internal/process-results-function";
import { SummarizationFunction } from "./internal/summarization-function";

/**
 * Interface for BDA document processor implementation.
 *
 * BDA Processor uses Amazon Bedrock Data Automation for document processing,
 * leveraging pre-built extraction capabilities for common document types.
 * This processor is ideal for standard documents with well-defined structures
 * and requires minimal custom code to implement.
 *
 * Use BDA Processor when:
 * - Processing standard document types like invoices, receipts, or forms
 * - You need a managed solution with minimal custom code
 * - You want to leverage Amazon Bedrock's pre-built extraction capabilities
 */
export interface IBdaProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the BDA document processor.
 *
 * BDA Processor uses Amazon Bedrock Data Automation for document processing,
 * providing a managed solution for extracting structured data from documents
 * with minimal custom code. This processor leverages Amazon Bedrock's pre-built
 * document processing capabilities through Data Automation projects.
 *
 * BDA Processor is the simplest implementation path for common document types
 * that are well-supported by Amazon Bedrock's extraction capabilities.
 */
export interface BdaProcessorProps extends DocumentProcessorProps {
  /**
   * Configuration for the BDA document processor.
   * Provides customization options for the processing workflow,
   * including schema definitions and evaluation settings.
   */
  readonly configuration: IBdaProcessorConfiguration;

  /**
   * Optional Bedrock guardrail to apply to summarization model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines
   * by filtering inappropriate content and enforcing usage policies.
   *
   * @default - No guardrail is applied
   */
  readonly summarizationGuardrail?: bedrock.IGuardrail;

  /**
   * The Bedrock Data Automation Project used for document processing.
   * This project defines the document processing workflow in Amazon Bedrock,
   * including document types, extraction schemas, and processing rules.
   */
  readonly dataAutomationProject: IDataAutomationProject;

  /**
   * Optional S3 bucket containing baseline evaluation data for model performance assessment.
   * Used to store reference documents and expected outputs for evaluating
   * the accuracy and quality of document processing results.
   *
   * @default - No evaluation baseline bucket is configured
   */
  readonly evaluationBaselineBucket?: s3.IBucket;

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
   *    */
  readonly sectionSplittingStrategy?: SectionSplittingStrategy;

  /**
   * Enable discovery integration for BDA blueprint generation.
   *
   * When enabled, allows the discovery module to automatically generate
   * BDA blueprints from document samples, streamlining the configuration process.
   *
   * @default false
   *    */
  readonly enableDiscovery?: boolean;
}

/**
 * BDA document processor using Amazon Bedrock Data Automation.
 *
 * Orchestrates document processing through a Step Functions state machine that
 * invokes BDA for extraction, processes results, generates summaries, and
 * evaluates accuracy. Automatically attaches to the processing environment
 * for queue-based document ingestion.
 *
 */
export class BdaProcessor extends Construct implements IBdaProcessor {
  /** The processing environment this processor is attached to. */
  public readonly environment: IProcessingEnvironment;
  /** Maximum number of documents that can be processed concurrently. */
  public readonly maxProcessingConcurrency: number;
  /** The Step Functions state machine that orchestrates the processing workflow. */
  public readonly stateMachine: sfn.IStateMachine;

  constructor(scope: Construct, id: string, props: BdaProcessorProps) {
    super(scope, id);

    this.maxProcessingConcurrency = props.maxProcessingConcurrency ?? 100;
    this.environment = props.environment;

    const schema = new BdaProcessorConfigurationSchema();
    schema.bind(this);

    // Create BDA Metadata Table for tracking BDA process records
    const bdaMetadataTable = new BdaMetadataTable(this, "BDAMetadataTable", {
      encryptionKey: this.environment.encryptionKey,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
    });

    const renderedDefinition = props.configuration.bind(this);

    const invokeBDAFunction = new BdaInvokeFunction(this, "InvokeBDAFunction", {
      metricNamespace: this.environment.metricNamespace,
      logLevel: this.environment.logLevel,
      inputBucket: this.environment.inputBucket,
      outputBucket: this.environment.outputBucket,
      workingBucket: this.environment.workingBucket,
      trackingTable: this.environment.trackingTable,
      project: props.dataAutomationProject,
      logGroup: new logs.LogGroup(this, "InvokeBDAFunctionLogGroup", {
        encryptionKey: this.environment.encryptionKey,
        retention: this.environment.logRetention,
      }),
      ...this.environment.vpcConfiguration,
    });

    const processResultsFunction = new ProcessResultsFunction(
      this,
      "ProcessResultsFunction",
      {
        trackingTable: this.environment.trackingTable,
        configurationTable: this.environment.configurationTable,
        bdaMetadataTable: bdaMetadataTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        dataAutomationProject: props.dataAutomationProject,
        encryptionKey: this.environment.encryptionKey,
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "ProcessResultsFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
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
        trackingTable: this.environment.trackingTable,
        configurationTable: this.environment.configurationTable,
        inputBucket: this.environment.inputBucket,
        outputBucket: this.environment.outputBucket,
        workingBucket: this.environment.workingBucket,
        encryptionKey: this.environment.encryptionKey,
        summarizationModel: renderedDefinition.summarizationModel,
        summarizationGuardrail: props.summarizationGuardrail,
        api: this.environment.api,
        logGroup: new logs.LogGroup(this, "SummarizationFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    // Workaround: Explicitly grant invoke permissions for cross-region inference profiles
    // The grantInvoke() method on CrossRegionInferenceProfile.fromConfig() doesn't add IAM permissions
    if (renderedDefinition.summarizationModel) {
      summarizationFunction.addToRolePolicy(
        new cdk.aws_iam.PolicyStatement({
          actions: ["bedrock:InvokeModel", "bedrock:GetInferenceProfile"],
          resources: [
            cdk.Stack.of(this).formatArn({
              service: "bedrock",
              resource: "inference-profile",
              resourceName: "*",
              arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
            }),
          ],
        }),
      );
    }

    // Always create evaluation function
    const evaluationFunction = new EvaluationFunction(
      this,
      "EvaluationFunction",
      {
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
      },
    );

    this.stateMachine = new sfn.StateMachine(
      this,
      "DocumentProcessingStateMachine",
      {
        definitionBody: sfn.DefinitionBody.fromFile(
          path.join(__dirname, "..", "assets", "sfn", "workflow.asl.json"),
        ),
        definitionSubstitutions: {
          InvokeBDALambdaArn: invokeBDAFunction.functionArn,
          ProcessResultsLambdaArn: processResultsFunction.functionArn,
          SummarizationLambdaArn: summarizationFunction.functionArn,
          EvaluationLambdaArn: evaluationFunction.functionArn,
          OutputBucket: this.environment.outputBucket.bucketName,
          WorkingBucket: this.environment.workingBucket.bucketName,
          BDAProjectArn: props.dataAutomationProject.arn,
        },
        logs: {
          destination: new logs.LogGroup(this, "StateMachineLogGroup", {
            encryptionKey: this.environment.encryptionKey,
            retention: this.environment.logRetention,
          }),
          level: sfn.LogLevel.ALL,
          includeExecutionData: true,
        },
      },
    );

    invokeBDAFunction.grantInvoke(this.stateMachine);
    processResultsFunction.grantInvoke(this.stateMachine);
    summarizationFunction.grantInvoke(this.stateMachine);
    evaluationFunction.grantInvoke(this.stateMachine);

    const bdaCompletionFunction = new BdaCompletionFunction(
      this,
      "BDACompletionFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        trackingTable: this.environment.trackingTable,
        stateMachine: this.stateMachine,
        encryptionKey: this.environment.encryptionKey,
        logGroup: new logs.LogGroup(this, "BDACompletionFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    this.addEvent(bdaCompletionFunction);

    // Attach processor to environment (creates queue processor and event rules)
    this.environment.attach(this);
  }

  private addEvent(bdaCompletionFunction: BdaCompletionFunction) {
    // Create EventBridge rule for BDA events
    const bdaEventRule = new events.Rule(this, "BDAEventRule", {
      eventPattern: {
        source: ["aws.bedrock"],
        detailType: [
          "Bedrock Data Automation Job Succeeded",
          "Bedrock Data Automation Job Failed With Client Error",
          "Bedrock Data Automation Job Failed With Service Error",
        ],
      },
    });

    // Add Lambda function as a target for the EventBridge rule
    bdaEventRule.addTarget(
      new eventtargets.LambdaFunction(bdaCompletionFunction, {
        maxEventAge: cdk.Duration.hours(2),
        retryAttempts: 3,
      }),
    );
  }

  // ========================================
  // CloudWatch Metrics Methods
  // ========================================

  /**
   * Creates a CloudWatch metric for total BDA requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total BDA requests
   */
  public metricBdaRequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsTotal",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for successful BDA requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for successful BDA requests
   */
  public metricBdaRequestsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsSucceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for failed BDA requests.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for failed BDA requests
   */
  public metricBdaRequestsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsFailed",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for BDA request latency.
   * Measures individual request processing time.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for BDA request latency in milliseconds
   */
  public metricBdaRequestLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsLatency",
      unit: cloudwatch.Unit.MILLISECONDS,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for total BDA request latency.
   * Measures total request processing time including retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total BDA request latency in milliseconds
   */
  public metricBdaRequestsTotalLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsTotalLatency",
      unit: cloudwatch.Unit.MILLISECONDS,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for BDA request throttles.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for BDA request throttles
   */
  public metricBdaRequestsThrottles(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsThrottles",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for successful BDA request retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for successful BDA request retries
   */
  public metricBdaRequestsRetrySuccess(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsRetrySuccess",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for BDA requests that exceeded max retries.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for BDA requests that exceeded max retries
   */
  public metricBdaRequestsMaxRetriesExceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsMaxRetriesExceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for BDA non-retryable errors.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for BDA non-retryable errors
   */
  public metricBdaRequestsNonRetryableErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsNonRetryableErrors",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for BDA unexpected errors.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for BDA unexpected errors
   */
  public metricBdaRequestsUnexpectedErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDARequestsUnexpectedErrors",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for total BDA jobs.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for total BDA jobs
   */
  public metricBdaJobsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDAJobsTotal",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for successful BDA jobs.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for successful BDA jobs
   */
  public metricBdaJobsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDAJobsSucceeded",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for failed BDA jobs.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for failed BDA jobs
   */
  public metricBdaJobsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "BDAJobsFailed",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for processed documents.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for processed documents
   */
  public metricProcessedDocuments(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "ProcessedDocuments",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for processed pages.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for processed pages
   */
  public metricProcessedPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "ProcessedPages",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for processed custom pages.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for processed custom pages
   */
  public metricProcessedCustomPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "ProcessedCustomPages",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }

  /**
   * Creates a CloudWatch metric for processed standard pages.
   *
   * @param props - Optional metric configuration properties
   * @returns CloudWatch Metric for processed standard pages
   */
  public metricProcessedStandardPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return new cloudwatch.Metric({
      namespace: this.environment.metricNamespace,
      metricName: "ProcessedStandardPages",
      unit: cloudwatch.Unit.COUNT,
      ...props,
    });
  }
}
