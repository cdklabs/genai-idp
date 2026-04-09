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
import { IBdaProcessorConfiguration } from "./configuration";
import {
  Blueprint,
  BlueprintType,
  DataAutomationProject,
  IDataAutomationProject,
} from "./internal/bedrock";
import { translateClassToBlueprint } from "./internal/blueprint-translator";

/**
 * Interface for BDA document processor implementation.
 *
 * @since 0.5.2
 */
export interface IBdaProcessor extends IDocumentProcessor {}

/**
 * Configuration properties for the BDA document processor facade.
 *
 * @since 0.5.2
 */
export interface BdaProcessorProps extends DocumentProcessorProps {
  /**
   * Configuration for the BDA document processor.
   * The `use_bda: true` flag is forced automatically.
   */
  readonly configuration: IBdaProcessorConfiguration;

  /**
   * The S3 bucket containing configuration files.
   */
  readonly configurationBucket: s3.IBucket;
}

/**
 * BDA document processor facade over UnifiedDocumentProcessor.
 *
 * Creates BDA blueprints and a Data Automation Project from the configuration's
 * class definitions at CDK synth time, then delegates all processing to the
 * unified processor with `use_bda: true`.
 *
 * @since 0.5.2
 */
export class BdaProcessor extends Construct implements IBdaProcessor {
  public readonly environment: IProcessingEnvironment;
  public readonly maxProcessingConcurrency: number;
  public readonly stateMachine: sfn.IStateMachine;
  public readonly evaluationFunction?: EvaluationFunction;
  /** The BDA Data Automation Project used by this processor. */
  public readonly project: IDataAutomationProject;

  private readonly innerProcessor: UnifiedDocumentProcessor;

  constructor(scope: Construct, id: string, props: BdaProcessorProps) {
    super(scope, id);

    const rawConfig = props.configuration.definition.raw();

    // Create BDA project from config classes
    this.project = this.createProject(rawConfig);

    // Bind configuration — writes default config + BDA project ARN to config table
    const bdaDefinition = props.configuration.bind(
      this,
      props.environment,
      this.project.arn,
    );

    // Pass-through configuration for the unified processor
    const unifiedConfig: IUnifiedDocumentProcessorConfiguration = {
      bind: (
        _processor: IUnifiedDocumentProcessor,
      ): IUnifiedDocumentProcessorConfigurationDefinition => {
        return {
          ocrInferenceProvider: undefined,
          classificationInferenceProvider: undefined,
          extractionInferenceProvider: undefined,
          assessmentInferenceProvider: undefined,
          summarizationInferenceProvider:
            bdaDefinition._summarizationInferenceProvider,
          evaluationModel: bdaDefinition.evaluationModel,
          ocrBackend: "textract" as const,
          customPromptGenerator: undefined,
          raw: () => rawConfig,
          validate: () => bdaDefinition.validate(),
          isLegacyFormat: () => bdaDefinition.isLegacyFormat(),
          isJsonSchemaFormat: () => bdaDefinition.isJsonSchemaFormat(),
        };
      },
    };

    // Create the UnifiedDocumentProcessor
    this.innerProcessor = new UnifiedDocumentProcessor(this, "Unified", {
      environment: props.environment,
      configurationBucket: props.configurationBucket,
      maxProcessingConcurrency: props.maxProcessingConcurrency,
      configuration: unifiedConfig,
    });

    // Delegate IDocumentProcessor properties
    this.environment = this.innerProcessor.environment;
    this.maxProcessingConcurrency =
      this.innerProcessor.maxProcessingConcurrency;
    this.stateMachine = this.innerProcessor.stateMachine;
    this.evaluationFunction = this.innerProcessor.evaluationFunction;
  }

  // ========================================
  // CloudWatch Metrics — BDA Requests
  // ========================================

  /** Total BDA Data Automation invocation requests. */
  public metricBDARequestsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsTotal(props);
  }
  /** Successful BDA invocation requests. */
  public metricBDARequestsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsSucceeded(props);
  }
  /** Failed BDA invocation requests. */
  public metricBDARequestsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsFailed(props);
  }
  /** BDA single-request latency in milliseconds. */
  public metricBDARequestsLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsLatency(props);
  }
  /** BDA total latency including retries in milliseconds. */
  public metricBDARequestsTotalLatency(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsTotalLatency(props);
  }
  /** BDA requests that succeeded after retry. */
  public metricBDARequestsRetrySuccess(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsRetrySuccess(props);
  }
  /** BDA request throttles. */
  public metricBDARequestsThrottles(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsThrottles(props);
  }
  /** BDA requests that exceeded max retries. */
  public metricBDARequestsMaxRetriesExceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsMaxRetriesExceeded(props);
  }
  /** BDA non-retryable errors. */
  public metricBDARequestsNonRetryableErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsNonRetryableErrors(props);
  }
  /** BDA unexpected errors. */
  public metricBDARequestsUnexpectedErrors(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDARequestsUnexpectedErrors(props);
  }

  // ========================================
  // CloudWatch Metrics — BDA Jobs
  // ========================================

  /** Total BDA async jobs submitted. */
  public metricBDAJobsTotal(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDAJobsTotal(props);
  }
  /** Successful BDA async jobs. */
  public metricBDAJobsSucceeded(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDAJobsSucceeded(props);
  }
  /** Failed BDA async jobs. */
  public metricBDAJobsFailed(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricBDAJobsFailed(props);
  }

  // ========================================
  // CloudWatch Metrics — Document Processing
  // ========================================

  /** Documents processed by BDA. */
  public metricProcessedDocuments(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricProcessedDocuments(props);
  }
  /** Total pages processed. */
  public metricProcessedPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricProcessedPages(props);
  }
  /** Custom blueprint pages processed. */
  public metricProcessedCustomPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricProcessedCustomPages(props);
  }
  /** Standard pages processed. */
  public metricProcessedStandardPages(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricProcessedStandardPages(props);
  }
  /** Documents flagged for human-in-the-loop review. */
  public metricHITLTriggered(
    props?: cloudwatch.MetricOptions,
  ): cloudwatch.Metric {
    return this.innerProcessor.metricHITLTriggered(props);
  }

  // ========================================
  // CloudWatch Metrics — Bedrock (summarization/evaluation)
  // ========================================

  /** Total Bedrock model invocation requests (summarization, evaluation). */
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

  /**
   * Creates BDA blueprints and a Data Automation Project from config classes.
   */
  private createProject(rawConfig: any): IDataAutomationProject {
    const classes: any[] = rawConfig.classes || [];
    const blueprints: Blueprint[] = classes.map((idpClass, i) => {
      const className =
        idpClass.$id || idpClass["x-aws-idp-document-type"] || `Class${i}`;
      return new Blueprint(this, `Blueprint${sanitizeId(className)}`, {
        type: BlueprintType.DOCUMENT,
        schema: translateClassToBlueprint(idpClass),
      });
    });

    return new DataAutomationProject(this, "Project", {
      standardOutputConfiguration: {
        document: {
          extraction: {
            granularity: { types: ["PAGE", "ELEMENT"] },
            boundingBox: { state: "DISABLED" },
          },
          generativeField: { state: "DISABLED" },
          outputFormat: {
            textFormat: { types: ["MARKDOWN"] },
            additionalFileFormat: { state: "DISABLED" },
          },
        },
      },
      overrideConfiguration: {
        document: { splitter: { state: "ENABLED" } },
      },
      blueprints,
    });
  }
}

function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}
