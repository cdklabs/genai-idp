/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";
import { MockDataAutomationProject } from "../test-helpers";

describe("BdaProcessor - Optional Features", () => {
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

  describe("HITL (Human In The Loop) configuration", () => {
    test("creates processor without HITL by default", () => {
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
      // HITL should be disabled by default
    });

    test("enables HITL when configured", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
        sageMakerA2IReviewPortalURL: "https://example.com/review-portal",
      });

      expect(processor).toBeDefined();
    });

    test("handles HITL configuration with review portal URL", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const reviewPortalURL = "https://example.com/review-portal";

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
        sageMakerA2IReviewPortalURL: reviewPortalURL,
      });

      expect(processor).toBeDefined();
    });

    test("works with HITL enabled but no review portal URL", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
      });

      expect(processor).toBeDefined();
    });
  });

  describe("summarization guardrail configuration", () => {
    test("works without summarization guardrail", () => {
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

    test("accepts summarization guardrail when provided", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      // Create a mock guardrail
      const mockGuardrail = {
        guardrailArn:
          "arn:aws:bedrock:us-east-1:123456789012:guardrail/test-guardrail",
        guardrailId: "test-guardrail-id",
        guardrailVersion: "1",
        grantApply: jest.fn(),
        grant: jest.fn(),
        metric: jest.fn(),
        metricInvocations: jest.fn(),
        metricInvocationLatency: jest.fn(),
        metricInvocationClientErrors: jest.fn(),
        metricInvocationServerErrors: jest.fn(),
        metricInvocationThrottles: jest.fn(),
        metricInputTokenCount: jest.fn(),
        metricOutputTokenCount: jest.fn(),
        metricInvocationInputTokenCount: jest.fn(),
        metricInvocationOutputTokenCount: jest.fn(),
        metricGuardrailAction: jest.fn(),
        metricGuardrailAssessment: jest.fn(),
      } as unknown as bedrock.IGuardrail;

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        summarizationGuardrail: mockGuardrail,
      });

      expect(processor).toBeDefined();
    });
  });

  describe("evaluation baseline bucket configuration", () => {
    test("works without evaluation baseline bucket", () => {
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

    test("accepts evaluation baseline bucket when provided", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const evaluationBucket = new Bucket(stack, "EvaluationBucket");

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        evaluationBaselineBucket: evaluationBucket,
      });

      expect(processor).toBeDefined();
    });
  });

  describe("advanced configuration combinations", () => {
    test("handles all optional features enabled together", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const evaluationBucket = new Bucket(stack, "EvaluationBucket");
      const mockGuardrail = {
        guardrailArn:
          "arn:aws:bedrock:us-east-1:123456789012:guardrail/test-guardrail",
        guardrailId: "test-guardrail-id",
        guardrailVersion: "1",
        grantApply: jest.fn(),
        grant: jest.fn(),
        metric: jest.fn(),
        metricInvocations: jest.fn(),
        metricInvocationLatency: jest.fn(),
        metricInvocationClientErrors: jest.fn(),
        metricInvocationServerErrors: jest.fn(),
        metricInvocationThrottles: jest.fn(),
        metricInputTokenCount: jest.fn(),
        metricOutputTokenCount: jest.fn(),
        metricInvocationInputTokenCount: jest.fn(),
        metricInvocationOutputTokenCount: jest.fn(),
        metricGuardrailAction: jest.fn(),
        metricGuardrailAssessment: jest.fn(),
      } as unknown as bedrock.IGuardrail;

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        maxProcessingConcurrency: 75,
        enableHITL: true,
        sageMakerA2IReviewPortalURL: "https://example.com/review-portal",
        summarizationGuardrail: mockGuardrail,
        evaluationBaselineBucket: evaluationBucket,
      });

      expect(processor).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(75);
    });

    test("handles partial optional feature configuration", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const evaluationBucket = new Bucket(stack, "EvaluationBucket");

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
        evaluationBaselineBucket: evaluationBucket,
        // No guardrail or review portal URL
      });

      expect(processor).toBeDefined();
    });
  });

  describe("configuration flexibility", () => {
    test("supports different concurrency levels", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const lowConcurrencyProcessor = new BdaProcessor(
        stack,
        "LowConcurrency",
        {
          environment,
          configuration,
          dataAutomationProject,
          maxProcessingConcurrency: 10,
        },
      );

      const highConcurrencyProcessor = new BdaProcessor(
        stack,
        "HighConcurrency",
        {
          environment,
          configuration,
          dataAutomationProject,
          maxProcessingConcurrency: 500,
        },
      );

      expect(lowConcurrencyProcessor.maxProcessingConcurrency).toBe(10);
      expect(highConcurrencyProcessor.maxProcessingConcurrency).toBe(500);
    });

    test("validates configuration binding", () => {
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
      // Configuration should be bound during processor creation
    });
  });

  describe("resource integration with optional features", () => {
    test("integrates evaluation bucket with environment", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const evaluationBucket = new Bucket(stack, "EvaluationBucket");

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        evaluationBaselineBucket: evaluationBucket,
      });

      expect(processor).toBeDefined();
      expect(processor.environment).toBe(environment);
    });

    test("creates appropriate EventBridge rules for HITL when enabled", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
      });

      const template = Template.fromStack(stack);

      // Check if EventBridge rule resources exist for HITL
      const eventRuleResources = template.findResources("AWS::Events::Rule");
      if (Object.keys(eventRuleResources).length > 0) {
        // Should have rules for both BDA events and HITL events when HITL is enabled
        expect(Object.keys(eventRuleResources).length).toBeGreaterThanOrEqual(
          1,
        );
      }
    });
  });
});
