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

describe("BdaProcessor - Basic Functionality", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;
  let configurationBucket: Bucket;
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
    configurationBucket = new Bucket(stack, "ConfigurationBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });
  });

  describe("core construct creation", () => {
    test("creates BDA processor with minimal configuration", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor).toBeDefined();
      expect(processor.environment).toBe(environment);
      expect(processor.stateMachine).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(1); // default from UnifiedDocumentProcessor
    });

    test("creates BDA processor with custom concurrency", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
        maxProcessingConcurrency: 50,
      });

      expect(processor.maxProcessingConcurrency).toBe(50);
    });

    test("verifies processor implements IDocumentProcessor interface", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor.environment).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBeDefined();
      expect(processor.stateMachine).toBeDefined();
    });

    test("exposes BDA project", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor.project).toBeDefined();
      expect(processor.project.arn).toBeDefined();
      expect(typeof processor.project.grantInvokeAsync).toBe("function");
    });
  });

  describe("BDA resource creation", () => {
    test("creates blueprints for each class in config", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const blueprints = template.findResources("AWS::Bedrock::Blueprint");
      // lending-package-sample has 6 classes
      expect(Object.keys(blueprints).length).toBe(6);
    });

    test("creates a single DataAutomationProject linking all blueprints", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::Bedrock::DataAutomationProject", 1);
    });

    test("creates exactly one state machine", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
    });

    test("creates state machine with logging", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
        LoggingConfiguration: Match.objectLike({
          IncludeExecutionData: true,
          Level: "ALL",
        }),
      });
    });
  });

  describe("configuration validation", () => {
    test("accepts valid BDA processor configuration", () => {
      expect(() => {
        new BdaProcessor(stack, "Processor", {
          environment,
          configurationBucket,
          configuration: BdaProcessorConfiguration.lendingPackageSample(),
        });
      }).not.toThrow();
    });

    test("writes BdaProjectArn to configuration table via custom resource", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      // Find the UpdateDefaultConfig custom resource and verify it has BdaProjectArn
      const customResources = template.findResources(
        "AWS::CloudFormation::CustomResource",
      );
      const hasProjectArn = Object.values(customResources).some(
        (r: any) => r.Properties?.BdaProjectArn !== undefined,
      );
      expect(hasProjectArn).toBe(true);
    });
  });
});
