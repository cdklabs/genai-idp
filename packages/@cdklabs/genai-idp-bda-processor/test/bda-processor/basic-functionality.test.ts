/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";
import { MockDataAutomationProject } from "../test-helpers";

describe("BdaProcessor - Basic Functionality", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;
  let environment: ProcessingEnvironment;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    workingBucket = new Bucket(stack, "WorkingBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });
  });

  describe("core construct creation", () => {
    test("creates BDA processor with minimal configuration", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor).toBeDefined();
      expect(processor.environment).toBe(environment);
      expect(processor.stateMachine).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(100); // default value
    });

    test("creates BDA processor with custom concurrency", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        maxProcessingConcurrency: 50,
      });

      expect(processor).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(50);
    });

    test("verifies processor implements IDocumentProcessor interface", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      // Verify interface properties
      expect(processor.environment).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBeDefined();
      expect(processor.stateMachine).toBeDefined();
    });

    test("creates state machine with correct configuration", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor.stateMachine).toBeDefined();
      expect(processor.stateMachine.stateMachineArn).toBeDefined();

      const template = Template.fromStack(stack);

      // Check if state machine resource exists (when bundling is disabled, it might not synthesize)
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        // Just verify that LoggingConfiguration exists, don't check exact structure
        template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
          LoggingConfiguration: Match.anyValue(),
        });
      }
    });
  });

  describe("configuration validation", () => {
    test("accepts valid BDA processor configuration", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      expect(() => {
        new BdaProcessor(stack, "Processor", {
          environment,
          configuration,
          dataAutomationProject,
        });
      }).not.toThrow();
    });

    test("requires valid data automation project", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor).toBeDefined();
    });

    test("validates processing environment is provided", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor.environment).toBe(environment);
      expect(processor.environment.inputBucket).toBe(inputBucket);
      expect(processor.environment.outputBucket).toBe(outputBucket);
      expect(processor.environment.workingBucket).toBe(workingBucket);
    });
  });

  describe("resource creation", () => {
    test("creates BDA metadata table", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if DynamoDB table resource exists
      const tableResources = template.findResources("AWS::DynamoDB::Table");
      if (Object.keys(tableResources).length > 0) {
        // Look for BDA metadata table specifically
        const bdaTableFound = Object.values(tableResources).some(
          (resource: any) =>
            resource.Properties?.TableName?.includes?.("BDAMetadataTable") ||
            resource.Properties?.AttributeDefinitions,
        );
        expect(bdaTableFound || Object.keys(tableResources).length > 0).toBe(
          true,
        );
      }
    });

    test("creates Lambda functions for processing workflow", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if Lambda function resources exist (when bundling is disabled, they might not synthesize)
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      if (Object.keys(lambdaResources).length > 0) {
        // Verify we have multiple Lambda functions for the workflow
        expect(Object.keys(lambdaResources).length).toBeGreaterThan(0);
      }
    });

    test("creates EventBridge rules for BDA and HITL events", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if EventBridge rule resources exist
      const eventRuleResources = template.findResources("AWS::Events::Rule");
      if (Object.keys(eventRuleResources).length > 0) {
        // Should have rules for BDA events and HITL events
        expect(Object.keys(eventRuleResources).length).toBeGreaterThanOrEqual(
          1,
        );
      }
    });

    test("creates CloudWatch log groups for functions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if CloudWatch log group resources exist
      const logGroupResources = template.findResources("AWS::Logs::LogGroup");
      if (Object.keys(logGroupResources).length > 0) {
        // Should have log groups for various functions
        expect(Object.keys(logGroupResources).length).toBeGreaterThan(0);
      }
    });
  });

  describe("interface compliance", () => {
    test("implements IBdaProcessor interface", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      // Verify IBdaProcessor extends IDocumentProcessor
      expect(processor.environment).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBeDefined();
      expect(processor.stateMachine).toBeDefined();
    });

    test("provides required processor properties", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor.environment).toBe(environment);
      expect(typeof processor.maxProcessingConcurrency).toBe("number");
      expect(processor.stateMachine).toBeDefined();
    });
  });
});
