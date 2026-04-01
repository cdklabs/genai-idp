/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  ProcessingEnvironment,
  UnifiedDocumentProcessor,
  IUnifiedDocumentProcessor,
  UnifiedDocumentProcessorProps,
} from "../src";

describe("UnifiedDocumentProcessor", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let configurationBucket: Bucket;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
      },
    });
    stack = new Stack(app, "TestStack");
    expect(stack.bundlingRequired).toBe(false);

    const inputBucket = new Bucket(stack, "InputBucket");
    const outputBucket = new Bucket(stack, "OutputBucket");
    const workingBucket = new Bucket(stack, "WorkingBucket");
    configurationBucket = new Bucket(stack, "ConfigurationBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });
  });

  describe("basic construct creation", () => {
    test("creates without errors with minimal required props", () => {
      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      expect(processor).toBeDefined();
    });

    test("IDocumentProcessor interface compliance — exposes stateMachine, maxProcessingConcurrency, environment", () => {
      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      expect(processor.stateMachine).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBeDefined();
      expect(processor.environment).toBe(environment);
    });

    test("IUnifiedDocumentProcessor interface — exposes all 12 Lambda functions", () => {
      const processor: IUnifiedDocumentProcessor = new UnifiedDocumentProcessor(
        stack,
        "Processor",
        {
          environment,
          configurationBucket,
        },
      );

      // BDA-specific
      expect(processor.bdaInvokeFunction).toBeDefined();
      expect(processor.bdaCompletionFunction).toBeDefined();
      expect(processor.bdaProcessResultsFunction).toBeDefined();
      // Pipeline-specific
      expect(processor.ocrFunction).toBeDefined();
      expect(processor.classificationFunction).toBeDefined();
      expect(processor.extractionFunction).toBeDefined();
      expect(processor.assessmentFunction).toBeDefined();
      expect(processor.processResultsFunction).toBeDefined();
      // Shared
      expect(processor.summarizationFunction).toBeDefined();
      expect(processor.evaluationFunction).toBeDefined();
      expect(processor.ruleValidationFunction).toBeDefined();
      expect(processor.ruleValidationOrchestrationFunction).toBeDefined();
    });

    test("defaults maxProcessingConcurrency to 1", () => {
      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      expect(processor.maxProcessingConcurrency).toBe(1);
    });

    test("accepts custom maxProcessingConcurrency", () => {
      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        maxProcessingConcurrency: 50,
      });

      expect(processor.maxProcessingConcurrency).toBe(50);
    });
  });

  describe("CloudFormation resource counts", () => {
    test("creates 12 Lambda functions", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      // 12 unified processor functions + possible framework-generated functions (e.g., EventBridge permission Lambda)
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      const processorFunctionCount = Object.keys(lambdaResources).filter(
        (key) => key.startsWith("Processor"),
      ).length;
      expect(processorFunctionCount).toBeGreaterThanOrEqual(12);
    });

    test("creates 1 state machine", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      const stateMachines = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      const processorStateMachines = Object.keys(stateMachines).filter(
        (key) => key.startsWith("Processor"),
      ).length;
      expect(processorStateMachines).toBe(1);
    });

    test("creates 12 SQS DLQs for Lambda functions", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      const sqsQueues = template.findResources("AWS::SQS::Queue");
      // Filter for DLQs belonging to the processor (each Lambda function creates one)
      const processorDlqs = Object.keys(sqsQueues).filter(
        (key) => key.startsWith("Processor") && key.includes("DLQ"),
      ).length;
      expect(processorDlqs).toBe(12);
    });

    test("creates BDA metadata DynamoDB table when not provided", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      const tables = template.findResources("AWS::DynamoDB::Table");
      const processorTables = Object.keys(tables).filter(
        (key) => key.startsWith("Processor"),
      );
      // Should have at least the BDA metadata table
      expect(processorTables.length).toBeGreaterThanOrEqual(1);
    });

    test("creates EventBridge rule for BDA completion events", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Events::Rule", {
        EventPattern: {
          source: ["aws.bedrock"],
          "detail-type": Match.arrayWith([
            "Bedrock Data Automation Job Succeeded",
          ]),
        },
      });
    });

    test("creates state machine log group", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      const logGroups = template.findResources("AWS::Logs::LogGroup");
      const processorLogGroups = Object.keys(logGroups).filter(
        (key) => key.startsWith("Processor"),
      );
      expect(processorLogGroups.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("state machine configuration", () => {
    test("state machine has definition substitutions for Lambda ARNs", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
        DefinitionSubstitutions: Match.objectLike({
          InvokeBDALambdaArn: Match.anyValue(),
          BDAProcessResultsLambdaArn: Match.anyValue(),
          OCRFunctionArn: Match.anyValue(),
          ClassificationFunctionArn: Match.anyValue(),
          ExtractionFunctionArn: Match.anyValue(),
          AssessmentFunctionArn: Match.anyValue(),
          PipelineProcessResultsLambdaArn: Match.anyValue(),
          RuleValidationLambdaArn: Match.anyValue(),
          RuleValidationOrchestrationLambdaArn: Match.anyValue(),
          SummarizationLambdaArn: Match.anyValue(),
          EvaluationLambdaArn: Match.anyValue(),
        }),
      });
    });

    test("state machine has logging configured", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
        LoggingConfiguration: {
          Destinations: Match.anyValue(),
          IncludeExecutionData: true,
          Level: "ALL",
        },
      });
    });
  });

  describe("IAM permissions", () => {
    test("state machine has invoke permissions on Lambda functions", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      // The state machine role should have lambda:InvokeFunction policies
      const policies = template.findResources("AWS::IAM::Policy");
      const stateMachinePolicies = Object.entries(policies).filter(
        ([key]) =>
          key.includes("DocumentProcessingStateMachine") &&
          key.includes("Role"),
      );
      expect(stateMachinePolicies.length).toBeGreaterThan(0);
    });

    test("Lambda functions have Bedrock permissions", () => {
      new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
      });

      const template = Template.fromStack(stack);
      // Check that IAM policies with bedrock:InvokeModel exist
      const policies = template.findResources("AWS::IAM::Policy");
      const bedrockPolicies = Object.values(policies).filter(
        (resource: any) => {
          const statements =
            resource.Properties?.PolicyDocument?.Statement ?? [];
          return statements.some((stmt: any) =>
            stmt.Action?.some?.((a: string) => a.includes("bedrock")),
          );
        },
      );
      expect(bedrockPolicies.length).toBeGreaterThan(0);
    });
  });

  describe("optional props", () => {
    test("accepts encryptionKey without errors", () => {
      const kms = require("aws-cdk-lib/aws-kms");
      const key = new kms.Key(stack, "TestKey");

      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        encryptionKey: key,
      });

      expect(processor).toBeDefined();
      expect(processor.stateMachine).toBeDefined();
    });

    test("accepts vpcConfiguration without errors", () => {
      const ec2 = require("aws-cdk-lib/aws-ec2");
      const vpc = new ec2.Vpc(stack, "TestVpc");

      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        vpcConfiguration: {
          vpc,
          vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        },
      });

      expect(processor).toBeDefined();
      expect(processor.stateMachine).toBeDefined();
    });

    test("accepts reportingBucket and baselineBucket without errors", () => {
      const reportingBucket = new Bucket(stack, "ReportingBucket");
      const baselineBucket = new Bucket(stack, "BaselineBucket");

      const processor = new UnifiedDocumentProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        reportingBucket,
        baselineBucket,
      });

      expect(processor).toBeDefined();
    });

    test("type definitions compile correctly", () => {
      const propsCheck: UnifiedDocumentProcessorProps = {
        environment,
        configurationBucket,
      } as any;
      expect(propsCheck).toBeDefined();

      const interfaceCheck: IUnifiedDocumentProcessor = {} as any;
      expect(interfaceCheck).toBeDefined();
    });
  });
});
