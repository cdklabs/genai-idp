/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as events from "aws-cdk-lib/aws-events";
import * as eventtargets from "aws-cdk-lib/aws-events-targets";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";
import { DocumentProcessorProps, IDocumentProcessor } from "../document-processor";
import { IProcessingEnvironment } from "../processing-environment";
import { VpcConfiguration } from "../vpc-configuration";
import {
  AssessmentFunction,
  BdaCompletionFunction,
  BdaInvokeFunction,
  BdaProcessResultsFunction,
  ClassificationFunction,
  EvaluationFunction,
  ExtractionFunction,
  OcrFunction,
  ProcessResultsFunction,
  RuleValidationFunction,
  RuleValidationOrchestrationFunction,
  SummarizationFunction,
} from "./functions";

/**
 * Interface for the Unified Document Processor.
 *
 * The Unified Document Processor consolidates BDA and Pipeline processing modes
 * into a single construct with runtime routing via a `use_bda` configuration flag.
 * It implements `IDocumentProcessor` for seamless integration with `ProcessingEnvironment.attach()`.
 *
 * @since 0.5.2
 */
export interface IUnifiedDocumentProcessor extends IDocumentProcessor {
  /** BDA invoke function — invokes Bedrock Data Automation for document processing. */
  readonly bdaInvokeFunction: BdaInvokeFunction;
  /** BDA completion function — handles BDA job completion events via EventBridge. */
  readonly bdaCompletionFunction: BdaCompletionFunction;
  /** BDA process results function — processes BDA data automation results. */
  readonly bdaProcessResultsFunction: BdaProcessResultsFunction;
  /** OCR function — performs optical character recognition using Textract and Bedrock. */
  readonly ocrFunction: OcrFunction;
  /** Classification function — classifies documents using Bedrock model invocation. */
  readonly classificationFunction: ClassificationFunction;
  /** Extraction function — extracts structured data from documents using Bedrock. */
  readonly extractionFunction: ExtractionFunction;
  /** Assessment function — assesses extracted document data quality. */
  readonly assessmentFunction: AssessmentFunction;
  /** Process results function — processes pipeline results and writes final output. */
  readonly processResultsFunction: ProcessResultsFunction;
  /** Summarization function — summarizes document content using Bedrock. */
  readonly summarizationFunction: SummarizationFunction;
  /** Evaluation function — evaluates processing results against baselines. */
  readonly evaluationFunction: EvaluationFunction;
  /** Rule validation function — validates document sections against configured rules. */
  readonly ruleValidationFunction: RuleValidationFunction;
  /** Rule validation orchestration function — orchestrates and aggregates rule validation results. */
  readonly ruleValidationOrchestrationFunction: RuleValidationOrchestrationFunction;
}

/**
 * Configuration properties for the Unified Document Processor.
 *
 * The Unified Document Processor replicates the upstream v0.5.2 monolithic pattern,
 * deploying all 12 Lambda functions and a single unified Step Functions state machine
 * that routes between BDA and Pipeline modes at runtime.
 *
 * @since 0.5.2
 */
export interface UnifiedDocumentProcessorProps extends DocumentProcessorProps {
  /**
   * The S3 bucket containing classification, extraction, and assessment configuration files.
   * Used by Classification, Extraction, and Assessment functions in the pipeline branch.
   */
  readonly configurationBucket: s3.IBucket;

  /**
   * Optional DynamoDB table for BDA metadata records.
   * Stores execution_id/record_number pairs for BDA processing.
   * If not provided, a new table is created automatically.
   *
   * @default - A new BDA metadata table is created with PK=execution_id (S),
   * SK=record_number (N), TTL=ExpiresAfter
   */
  readonly bdaMetadataTable?: dynamodb.ITable;

  /**
   * Optional AppSync API URL for document tracking via GraphQL mutations.
   * When provided, functions use AppSync for real-time document status updates.
   * When absent, functions fall back to DynamoDB-based tracking.
   *
   * @default - DynamoDB-based tracking is used
   */
  readonly appSyncApiUrl?: string;

  /**
   * Optional Bedrock Guardrail ID for content filtering.
   * Applied to Extraction, Summarization, RuleValidation, and RuleValidationOrchestration functions.
   * Must be provided together with `guardrailVersion`.
   *
   * @default - No guardrail is applied
   */
  readonly guardrailId?: string;

  /**
   * Optional Bedrock Guardrail version.
   * Must be provided together with `guardrailId`.
   *
   * @default - No guardrail is applied
   */
  readonly guardrailVersion?: string;

  /**
   * Optional S3 bucket for evaluation reporting output.
   * Required by the Evaluation and RuleValidationOrchestration functions.
   * Typically provided from a ReportingEnvironment.
   *
   * @default - Reporting features are disabled
   */
  readonly reportingBucket?: s3.IBucket;

  /**
   * Optional S3 bucket for evaluation baselines.
   * Required by the Evaluation function for baseline comparison.
   * Typically provided from a ReportingEnvironment.
   *
   * @default - Baseline evaluation is disabled
   */
  readonly baselineBucket?: s3.IBucket;

  /**
   * Optional name of the SaveReporting Lambda function for persisting reports.
   * Required by the Evaluation and RuleValidationOrchestration functions.
   * Typically provided from a ReportingEnvironment.
   *
   * @default - Reporting persistence is disabled
   */
  readonly saveReportingFunctionName?: string;

  /**
   * Optional KMS encryption key for encrypting resources created by this construct.
   * Applied to the BDA metadata table, DLQs, and log groups.
   *
   * @default - AWS managed encryption is used
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional VPC configuration for Lambda functions.
   * When provided, all Lambda functions are deployed within the specified VPC.
   *
   * @default - Functions are not deployed in a VPC
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Unified Document Processor using a single Step Functions state machine
 * that routes between BDA and Pipeline processing modes at runtime.
 *
 * This construct consolidates the upstream v0.5.2 unified pattern, deploying
 * all 12 Lambda functions and a single state machine with a `RouteByProcessingMode`
 * Choice state. The `use_bda` configuration flag determines which branch executes
 * at runtime — no CDK-time decision is needed.
 *
 * Both branches share HITL check, Rule Validation, Summarization, and Evaluation steps.
 *
 * Integrates with `ProcessingEnvironment.attach()` via the `IDocumentProcessor` interface.
 *
 * @since 0.5.2
 */
export class UnifiedDocumentProcessor
  extends Construct
  implements IUnifiedDocumentProcessor
{
  /** The processing environment this processor is attached to. */
  public readonly environment: IProcessingEnvironment;
  /** Maximum number of documents that can be processed concurrently. */
  public readonly maxProcessingConcurrency: number;
  /** The Step Functions state machine that orchestrates the unified processing workflow. */
  public readonly stateMachine: sfn.IStateMachine;

  // BDA-specific functions
  public readonly bdaInvokeFunction: BdaInvokeFunction;
  public readonly bdaCompletionFunction: BdaCompletionFunction;
  public readonly bdaProcessResultsFunction: BdaProcessResultsFunction;

  // Pipeline-specific functions
  public readonly ocrFunction: OcrFunction;
  public readonly classificationFunction: ClassificationFunction;
  public readonly extractionFunction: ExtractionFunction;
  public readonly assessmentFunction: AssessmentFunction;
  public readonly processResultsFunction: ProcessResultsFunction;

  // Shared functions
  public readonly summarizationFunction: SummarizationFunction;
  public readonly evaluationFunction: EvaluationFunction;
  public readonly ruleValidationFunction: RuleValidationFunction;
  public readonly ruleValidationOrchestrationFunction: RuleValidationOrchestrationFunction;

  constructor(
    scope: Construct,
    id: string,
    props: UnifiedDocumentProcessorProps,
  ) {
    super(scope, id);

    this.maxProcessingConcurrency = props.maxProcessingConcurrency ?? 1;
    this.environment = props.environment;

    const env = this.environment;
    const encryptionKey = props.encryptionKey ?? env.encryptionKey;
    const vpcConfiguration = props.vpcConfiguration ?? env.vpcConfiguration;

    // Create BDA Metadata Table if not provided
    const bdaMetadataTable =
      props.bdaMetadataTable ??
      new dynamodb.Table(this, "BDAMetadataTable", {
        partitionKey: {
          name: "execution_id",
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: {
          name: "record_number",
          type: dynamodb.AttributeType.NUMBER,
        },
        timeToLiveAttribute: "ExpiresAfter",
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        pointInTimeRecovery: true,
        encryption: encryptionKey
          ? dynamodb.TableEncryption.CUSTOMER_MANAGED
          : dynamodb.TableEncryption.AWS_MANAGED,
        encryptionKey: encryptionKey,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });

    // Shared function props
    const sharedProps = {
      trackingTable: env.trackingTable,
      configurationTable: env.configurationTable,
      inputBucket: env.inputBucket,
      outputBucket: env.outputBucket,
      workingBucket: env.workingBucket,
      encryptionKey,
      vpcConfiguration,
    };

    const appSyncProps = {
      appSyncApiUrl: props.appSyncApiUrl,
    };

    const guardrailProps = {
      guardrailId: props.guardrailId,
      guardrailVersion: props.guardrailVersion,
    };

    // ========================================
    // BDA-specific Lambda functions
    // ========================================

    this.bdaInvokeFunction = new BdaInvokeFunction(
      this,
      "BdaInvokeFunction",
      sharedProps,
    );

    this.bdaCompletionFunction = new BdaCompletionFunction(
      this,
      "BdaCompletionFunction",
      sharedProps,
    );

    this.bdaProcessResultsFunction = new BdaProcessResultsFunction(
      this,
      "BdaProcessResultsFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        bdaMetadataTable,
      },
    );

    // ========================================
    // Pipeline-specific Lambda functions
    // ========================================

    this.ocrFunction = new OcrFunction(this, "OcrFunction", {
      ...sharedProps,
      ...appSyncProps,
    });

    this.classificationFunction = new ClassificationFunction(
      this,
      "ClassificationFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        configurationBucket: props.configurationBucket,
      },
    );

    this.extractionFunction = new ExtractionFunction(
      this,
      "ExtractionFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        ...guardrailProps,
        configurationBucket: props.configurationBucket,
      },
    );

    this.assessmentFunction = new AssessmentFunction(
      this,
      "AssessmentFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        configurationBucket: props.configurationBucket,
      },
    );

    this.processResultsFunction = new ProcessResultsFunction(
      this,
      "ProcessResultsFunction",
      {
        ...sharedProps,
        ...appSyncProps,
      },
    );

    // ========================================
    // Shared Lambda functions
    // ========================================

    this.summarizationFunction = new SummarizationFunction(
      this,
      "SummarizationFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        ...guardrailProps,
      },
    );

    this.ruleValidationFunction = new RuleValidationFunction(
      this,
      "RuleValidationFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        ...guardrailProps,
      },
    );

    this.ruleValidationOrchestrationFunction =
      new RuleValidationOrchestrationFunction(
        this,
        "RuleValidationOrchestrationFunction",
        {
          ...sharedProps,
          ...appSyncProps,
          ...guardrailProps,
          reportingBucket:
            props.reportingBucket ??
            env.reportingEnvironment?.reportingBucket ??
            env.outputBucket,
          saveReportingFunctionName:
            props.saveReportingFunctionName ??
            env.saveReportingDataFunction?.functionName ??
            "",
        },
      );

    this.evaluationFunction = new EvaluationFunction(
      this,
      "EvaluationFunction",
      {
        ...sharedProps,
        ...appSyncProps,
        reportingBucket:
          props.reportingBucket ??
          env.reportingEnvironment?.reportingBucket ??
          env.outputBucket,
        baselineBucket:
          props.baselineBucket ?? env.outputBucket,
        saveReportingFunctionName:
          props.saveReportingFunctionName ??
          env.saveReportingDataFunction?.functionName ??
          "",
      },
    );

    // ========================================
    // State Machine
    // ========================================

    this.stateMachine = new sfn.StateMachine(
      this,
      "DocumentProcessingStateMachine",
      {
        definitionBody: sfn.DefinitionBody.fromFile(
          path.join(
            __dirname,
            "..",
            "..",
            "assets",
            "statemachine",
            "unified",
            "workflow.asl.json",
          ),
        ),
        definitionSubstitutions: {
          // BDA-specific
          InvokeBDALambdaArn: this.bdaInvokeFunction.functionArn,
          BDAProcessResultsLambdaArn:
            this.bdaProcessResultsFunction.functionArn,
          // Pipeline-specific
          OCRFunctionArn: this.ocrFunction.functionArn,
          ClassificationFunctionArn: this.classificationFunction.functionArn,
          ExtractionFunctionArn: this.extractionFunction.functionArn,
          AssessmentFunctionArn: this.assessmentFunction.functionArn,
          PipelineProcessResultsLambdaArn:
            this.processResultsFunction.functionArn,
          // Shared
          RuleValidationLambdaArn: this.ruleValidationFunction.functionArn,
          RuleValidationOrchestrationLambdaArn:
            this.ruleValidationOrchestrationFunction.functionArn,
          SummarizationLambdaArn: this.summarizationFunction.functionArn,
          EvaluationLambdaArn: this.evaluationFunction.functionArn,
          // S3 Buckets
          WorkingBucket: env.workingBucket.bucketName,
          OutputBucket: env.outputBucket.bucketName,
        },
        logs: {
          destination: new logs.LogGroup(this, "StateMachineLogGroup", {
            encryptionKey,
            retention: env.logRetention,
          }),
          level: sfn.LogLevel.ALL,
          includeExecutionData: true,
        },
      },
    );

    // ========================================
    // State Machine → Lambda invoke permissions
    // ========================================
    // All 11 functions referenced in the ASL (not BDA completion — it's callback-based)
    this.bdaInvokeFunction.grantInvoke(this.stateMachine);
    this.bdaProcessResultsFunction.grantInvoke(this.stateMachine);
    this.ocrFunction.grantInvoke(this.stateMachine);
    this.classificationFunction.grantInvoke(this.stateMachine);
    this.extractionFunction.grantInvoke(this.stateMachine);
    this.assessmentFunction.grantInvoke(this.stateMachine);
    this.processResultsFunction.grantInvoke(this.stateMachine);
    this.ruleValidationFunction.grantInvoke(this.stateMachine);
    this.ruleValidationOrchestrationFunction.grantInvoke(this.stateMachine);
    this.summarizationFunction.grantInvoke(this.stateMachine);
    this.evaluationFunction.grantInvoke(this.stateMachine);

    // BDA completion function needs SendTaskSuccess/SendTaskFailure on the state machine
    this.stateMachine.grantTaskResponse(this.bdaCompletionFunction);

    // ========================================
    // EventBridge rule for BDA job completion events
    // ========================================
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
    bdaEventRule.addTarget(
      new eventtargets.LambdaFunction(this.bdaCompletionFunction, {
        maxEventAge: cdk.Duration.hours(2),
        retryAttempts: 3,
      }),
    );

    // ========================================
    // IAM permissions for Lambda functions
    // ========================================
    this.grantBedrockPermissions();
    this.grantTextractPermissions();
    this.grantBdaApiPermissions();
    this.grantS3Permissions(props);

    // Attach processor to environment
    this.environment.attach(this);
  }

  /**
   * Grants Bedrock model invoke permissions to functions that need it.
   * OCR, Classification, Extraction, Assessment, Summarization, Evaluation,
   * RuleValidation, and RuleValidationOrchestration all invoke Bedrock models.
   */
  private grantBedrockPermissions(): void {
    const bedrockFunctions = [
      this.ocrFunction,
      this.classificationFunction,
      this.extractionFunction,
      this.assessmentFunction,
      this.summarizationFunction,
      this.evaluationFunction,
      this.ruleValidationFunction,
      this.ruleValidationOrchestrationFunction,
    ];

    const bedrockPolicy = new iam.PolicyStatement({
      actions: [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:GetInferenceProfile",
      ],
      resources: [
        cdk.Stack.of(this).formatArn({
          service: "bedrock",
          resource: "inference-profile",
          resourceName: "*",
          arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
        }),
        cdk.Stack.of(this).formatArn({
          service: "bedrock",
          resource: "foundation-model",
          resourceName: "*",
          arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
        }),
      ],
    });

    for (const fn of bedrockFunctions) {
      fn.addToRolePolicy(bedrockPolicy);
    }

    // Guardrail permissions for functions that support it
    const guardrailFunctions = [
      this.extractionFunction,
      this.summarizationFunction,
      this.ruleValidationFunction,
      this.ruleValidationOrchestrationFunction,
    ];

    const guardrailPolicy = new iam.PolicyStatement({
      actions: ["bedrock:ApplyGuardrail"],
      resources: [
        cdk.Stack.of(this).formatArn({
          service: "bedrock",
          resource: "guardrail",
          resourceName: "*",
          arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
        }),
      ],
    });

    for (const fn of guardrailFunctions) {
      fn.addToRolePolicy(guardrailPolicy);
    }
  }

  /**
   * Grants Textract permissions to the OCR function.
   */
  private grantTextractPermissions(): void {
    this.ocrFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: [
          "textract:DetectDocumentText",
          "textract:AnalyzeDocument",
        ],
        resources: ["*"],
      }),
    );
  }

  /**
   * Grants BDA API permissions to BDA-specific functions.
   */
  private grantBdaApiPermissions(): void {
    const bdaPolicy = new iam.PolicyStatement({
      actions: [
        "bedrock:InvokeDataAutomationAsync",
        "bedrock:GetDataAutomationStatus",
        "bedrock:GetDataAutomationProject",
        "bedrock:ListDataAutomationProjects",
        "bedrock:GetBlueprint",
        "bedrock:GetBlueprintRecommendation",
      ],
      resources: ["*"],
    });

    this.bdaInvokeFunction.addToRolePolicy(bdaPolicy);
    this.bdaProcessResultsFunction.addToRolePolicy(bdaPolicy);
  }

  /**
   * Grants S3 bucket permissions to functions that need cross-bucket access
   * beyond what was granted in individual function constructors.
   */
  private grantS3Permissions(props: UnifiedDocumentProcessorProps): void {
    const env = this.environment;

    // BDA invoke needs read on input bucket and write on working bucket
    env.inputBucket.grantRead(this.bdaInvokeFunction);
    env.workingBucket.grantReadWrite(this.bdaInvokeFunction);
    env.outputBucket.grantReadWrite(this.bdaInvokeFunction);

    // BDA process results needs read on input/output buckets
    env.inputBucket.grantRead(this.bdaProcessResultsFunction);
    env.outputBucket.grantReadWrite(this.bdaProcessResultsFunction);

    // OCR needs read on input bucket
    env.inputBucket.grantRead(this.ocrFunction);

    // Pipeline functions need input bucket read
    env.inputBucket.grantRead(this.classificationFunction);
    env.inputBucket.grantRead(this.extractionFunction);
    env.inputBucket.grantRead(this.assessmentFunction);

    // Output bucket access for process results
    env.inputBucket.grantRead(this.processResultsFunction);

    // Summarization needs input bucket read
    env.inputBucket.grantRead(this.summarizationFunction);

    // Evaluation needs input bucket read
    env.inputBucket.grantRead(this.evaluationFunction);

    // Rule validation functions need input bucket read
    env.inputBucket.grantRead(this.ruleValidationFunction);
    env.inputBucket.grantRead(this.ruleValidationOrchestrationFunction);

    // Configuration bucket read for pipeline functions
    props.configurationBucket.grantRead(this.ocrFunction);
  }
}
