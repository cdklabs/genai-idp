/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import {
  DocumentProcessorProps,
  IDocumentProcessor,
  IProcessingEnvironment,
} from "@cdklabs/genai-idp";
import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
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
import { HitlProcessFunction } from "./internal/hitl-process-function";
import { HitlStatusUpdateFunction } from "./internal/hitl-status-update-function";
import { HitlWaitFunction } from "./internal/hitl-wait-function";
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
   * Enable Human In The Loop (HITL) review for documents with low confidence scores.
   * When enabled, documents that fall below the confidence threshold will be
   * sent for human review before proceeding with the workflow.
   *
   * @default false
   */
  readonly enableHITL?: boolean;

  /**
   * URL for the SageMaker A2I review portal used for HITL tasks.
   * This URL is provided to human reviewers to access documents that require
   * manual review and correction.
   *
   * @default - No review portal URL is provided
   */
  readonly sageMakerA2IReviewPortalURL?: string;
}

export class BdaProcessor extends Construct implements IBdaProcessor {
  public readonly environment: IProcessingEnvironment;
  public readonly maxProcessingConcurrency: number;
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

    const { evaluationBaselineBucket } = props;

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
        enableHITL: props.enableHITL,
        sageMakerA2IReviewPortalURL: props.sageMakerA2IReviewPortalURL,
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

    const hitlWaitFunction = new HitlWaitFunction(this, "HITLWaitFunction", {
      metricNamespace: this.environment.metricNamespace,
      logLevel: this.environment.logLevel,
      trackingTable: this.environment.trackingTable,
      bdaMetadataTable: bdaMetadataTable,
      workingBucket: this.environment.workingBucket,
      encryptionKey: this.environment.encryptionKey,
      sagemakerA2IReviewPortalUrl: props.sageMakerA2IReviewPortalURL,
      logGroup: new logs.LogGroup(this, "HITLWaitFunctionLogGroup", {
        encryptionKey: this.environment.encryptionKey,
        retention: this.environment.logRetention,
      }),
      ...this.environment.vpcConfiguration,
    });

    const hitlStatusUpdateFunction = new HitlStatusUpdateFunction(
      this,
      "HITLStatusUpdateFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        trackingTable: this.environment.trackingTable,
        outputBucket: this.environment.outputBucket,
        encryptionKey: this.environment.encryptionKey,
        logGroup: new logs.LogGroup(this, "HITLStatusUpdateFunctionLogGroup", {
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
          HITLWaitFunctionArn: hitlWaitFunction.functionArn,
          HITLStatusUpdateFunctionArn: hitlStatusUpdateFunction.functionArn,
          EnableHITL: props.enableHITL === true ? "true" : "false",
          SageMakerA2IReviewPortalURL: props.sageMakerA2IReviewPortalURL || "",
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
    hitlWaitFunction.grantInvoke(this.stateMachine);
    hitlStatusUpdateFunction.grantInvoke(this.stateMachine);

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

    // Create HITL Process Function for handling A2I completion events
    const hitlProcessFunction = new HitlProcessFunction(
      this,
      "HITLProcessFunction",
      {
        metricNamespace: this.environment.metricNamespace,
        logLevel: this.environment.logLevel,
        trackingTable: this.environment.trackingTable,
        bdaMetadataTable: bdaMetadataTable,
        inputBucket: this.environment.inputBucket,
        workingBucket: this.environment.workingBucket,
        outputBucket: this.environment.outputBucket,
        stateMachine: this.stateMachine,
        encryptionKey: this.environment.encryptionKey,
        logGroup: new logs.LogGroup(this, "HITLProcessFunctionLogGroup", {
          encryptionKey: this.environment.encryptionKey,
          retention: this.environment.logRetention,
        }),
        ...this.environment.vpcConfiguration,
      },
    );

    this.addHitlEvent(hitlProcessFunction);

    this.environment.attach(this, {
      evaluationBucket: evaluationBaselineBucket,
      evaluationModel: renderedDefinition.evaluationModel,
    });
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

  private addHitlEvent(hitlProcessFunction: HitlProcessFunction) {
    // Create EventBridge rule for HITL (SageMaker A2I) events
    const hitlEventRule = new events.Rule(this, "HITLEventRule", {
      eventPattern: {
        source: ["aws.sagemaker"],
        detailType: ["SageMaker A2I HumanLoop Status Change"],
        detail: {
          humanLoopStatus: ["Completed"],
        },
      },
    });

    // Add Lambda function as a target for the EventBridge rule
    hitlEventRule.addTarget(
      new eventtargets.LambdaFunction(hitlProcessFunction, {
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
