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
  /** The BDA Data Automation Project created from the configuration classes. */
  public readonly project: IDataAutomationProject;

  constructor(scope: Construct, id: string, props: BdaProcessorProps) {
    super(scope, id);

    // Read the raw config to get class definitions for blueprint creation
    const rawConfig = props.configuration.definition.raw();

    // Create BDA blueprints from config classes using L2 constructs
    const classes: any[] = rawConfig.classes || [];
    const blueprints: Blueprint[] = classes.map((idpClass, i) => {
      const className =
        idpClass.$id || idpClass["x-aws-idp-document-type"] || `Class${i}`;
      return new Blueprint(this, `Blueprint${sanitizeId(className)}`, {
        type: BlueprintType.DOCUMENT,
        schema: translateClassToBlueprint(idpClass),
      });
    });

    // Create BDA Data Automation Project linking all blueprints
    const project = new DataAutomationProject(this, "Project", {
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

    this.project = project;

    // Bind configuration — writes default config + BDA project ARN to config table
    const bdaDefinition = props.configuration.bind(
      this,
      props.environment,
      project.arn,
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
    const innerProcessor = new UnifiedDocumentProcessor(this, "Unified", {
      environment: props.environment,
      configurationBucket: props.configurationBucket,
      maxProcessingConcurrency: props.maxProcessingConcurrency,
      configuration: unifiedConfig,
    });

    // Delegate IDocumentProcessor properties
    this.environment = innerProcessor.environment;
    this.maxProcessingConcurrency = innerProcessor.maxProcessingConcurrency;
    this.stateMachine = innerProcessor.stateMachine;
    this.evaluationFunction = innerProcessor.evaluationFunction;
  }
}

function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, "");
}
