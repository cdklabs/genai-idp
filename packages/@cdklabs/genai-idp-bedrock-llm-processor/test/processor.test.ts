/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BedrockLlmProcessor, BedrockLlmProcessorConfiguration } from "../src";

describe("BedrockLlmProcessor - Facade", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let configurationBucket: Bucket;

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

    configurationBucket = new Bucket(stack, "ConfigurationBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket: new Bucket(stack, "InputBucket"),
      outputBucket: new Bucket(stack, "OutputBucket"),
      workingBucket: new Bucket(stack, "WorkingBucket"),
      metricNamespace: "TestNamespace",
    });
  });

  describe("core construct creation", () => {
    test("creates processor with minimal configuration", () => {
      const processor = new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor).toBeDefined();
      expect(processor.environment).toBe(environment);
      expect(processor.stateMachine).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(1);
    });

    test("creates processor with custom concurrency", () => {
      const processor = new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
        maxProcessingConcurrency: 50,
      });

      expect(processor.maxProcessingConcurrency).toBe(50);
    });

    test("creates exactly one state machine", () => {
      new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
    });

    test("creates state machine with logging", () => {
      new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
        LoggingConfiguration: Match.objectLike({
          IncludeExecutionData: true,
          Level: "ALL",
        }),
      });
    });

    test("creates Lambda functions", () => {
      new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      expect(Object.keys(lambdaResources).length).toBeGreaterThan(5);
    });
  });

  describe("configuration presets", () => {
    test("lendingPackageSample", () => {
      expect(() => {
        new BedrockLlmProcessor(stack, "P1", {
          environment,
          configurationBucket,
          configuration:
            BedrockLlmProcessorConfiguration.lendingPackageSample(),
        });
      }).not.toThrow();
    });

    test("bankStatementSample", () => {
      expect(() => {
        new BedrockLlmProcessor(stack, "P2", {
          environment,
          configurationBucket,
          configuration: BedrockLlmProcessorConfiguration.bankStatementSample(),
        });
      }).not.toThrow();
    });

    test("docSplit", () => {
      expect(() => {
        new BedrockLlmProcessor(stack, "P3", {
          environment,
          configurationBucket,
          configuration: BedrockLlmProcessorConfiguration.docSplit(),
        });
      }).not.toThrow();
    });

    test("rvlCdip", () => {
      expect(() => {
        new BedrockLlmProcessor(stack, "P4", {
          environment,
          configurationBucket,
          configuration: BedrockLlmProcessorConfiguration.rvlCdip(),
        });
      }).not.toThrow();
    });
  });

  describe("metrics", () => {
    test("exposes Bedrock request metrics", () => {
      const processor = new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor.metricBedrockRequestsTotal()).toBeDefined();
      expect(processor.metricBedrockRequestsSucceeded()).toBeDefined();
      expect(processor.metricBedrockRequestsFailed()).toBeDefined();
      expect(processor.metricBedrockRequestLatency()).toBeDefined();
    });

    test("exposes token metrics", () => {
      const processor = new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor.metricInputTokens()).toBeDefined();
      expect(processor.metricOutputTokens()).toBeDefined();
      expect(processor.metricTotalTokens()).toBeDefined();
    });

    test("exposes document processing metrics", () => {
      const processor = new BedrockLlmProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BedrockLlmProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor.metricInputDocuments()).toBeDefined();
      expect(processor.metricInputDocumentPages()).toBeDefined();
    });
  });
});
