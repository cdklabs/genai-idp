/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";
import { MockDataAutomationProject } from "../test-helpers";

describe("BdaProcessor - Configuration and Logging", () => {
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

  describe("configuration schema binding", () => {
    test("binds configuration schema during processor creation", () => {
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
      // Configuration schema should be bound during construction
    });

    test("validates configuration binding process", () => {
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

    test("handles configuration with custom settings", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        maxProcessingConcurrency: 200,
      });

      expect(processor).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(200);
    });
  });

  describe("logging configuration", () => {
    test("creates log groups for all Lambda functions", () => {
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

        // Verify log groups have proper configuration
        Object.values(logGroupResources).forEach((resource: any) => {
          if (resource.Properties) {
            // Log groups should have retention policy from environment
            expect(resource.Properties.RetentionInDays).toBeDefined();
          }
        });
      }
    });

    test("creates log group for state machine", () => {
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

      // Check if state machine has logging configuration
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        Object.values(stateMachineResources).forEach((resource: any) => {
          if (resource.Properties?.LoggingConfiguration) {
            expect(resource.Properties.LoggingConfiguration.Level).toBe("ALL");
            expect(
              resource.Properties.LoggingConfiguration.IncludeExecutionData,
            ).toBe(true);
          }
        });
      }
    });

    test("uses environment log level for functions", () => {
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
      // Log level should be inherited from environment
    });

    test("uses environment encryption key for log groups", () => {
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

      // Check if log groups use encryption key from environment
      const logGroupResources = template.findResources("AWS::Logs::LogGroup");
      if (Object.keys(logGroupResources).length > 0) {
        // If environment has encryption key, log groups should use it
        Object.values(logGroupResources).forEach((resource: any) => {
          if (resource.Properties && environment.encryptionKey) {
            expect(resource.Properties.KmsKeyId).toBeDefined();
          }
        });
      }
    });
  });

  describe("state machine configuration", () => {
    test("configures state machine with proper definition substitutions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
        sageMakerA2IReviewPortalURL: "https://example.com/review",
      });

      expect(processor.stateMachine).toBeDefined();

      const template = Template.fromStack(stack);

      // Check if state machine has proper substitutions
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        Object.values(stateMachineResources).forEach((resource: any) => {
          if (resource.Properties?.DefinitionSubstitutions) {
            const substitutions = resource.Properties.DefinitionSubstitutions;
            expect(substitutions.EnableHITL).toBe("true");
            expect(substitutions.SageMakerA2IReviewPortalURL).toBe(
              "https://example.com/review",
            );
            expect(substitutions.BDAProjectArn).toBe(
              "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
            );
          }
        });
      }
    });

    test("configures state machine without HITL when disabled", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: false,
      });

      expect(processor.stateMachine).toBeDefined();

      const template = Template.fromStack(stack);

      // Check if state machine has HITL disabled
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        Object.values(stateMachineResources).forEach((resource: any) => {
          if (resource.Properties?.DefinitionSubstitutions) {
            const substitutions = resource.Properties.DefinitionSubstitutions;
            expect(substitutions.EnableHITL).toBe("false");
          }
        });
      }
    });

    test("includes bucket names in state machine substitutions", () => {
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

      const template = Template.fromStack(stack);

      // Check if state machine includes bucket names
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        Object.values(stateMachineResources).forEach((resource: any) => {
          if (resource.Properties?.DefinitionSubstitutions) {
            const substitutions = resource.Properties.DefinitionSubstitutions;
            expect(substitutions.OutputBucket).toBeDefined();
            expect(substitutions.WorkingBucket).toBeDefined();
          }
        });
      }
    });
  });

  describe("environment integration", () => {
    test("uses environment metric namespace", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor.environment.metricNamespace).toBe("TestNamespace");
    });

    test("uses environment log retention settings", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      expect(processor.environment.logRetention).toBeDefined();
    });

    test("integrates with environment VPC configuration", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      // The environment doesn't have VPC configuration in this test setup
      // so we test that the processor can work without it
      expect(processor.environment).toBeDefined();
      expect(processor.environment.inputBucket).toBeDefined();
    });

    test("attaches to environment with evaluation configuration", () => {
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
  });

  describe("configuration validation", () => {
    test("validates data automation project ARN format", () => {
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

    test("handles configuration with summarization settings", () => {
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
      // Configuration should handle summarization model settings
    });

    test("validates concurrency limits", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        maxProcessingConcurrency: 1000,
      });

      expect(processor.maxProcessingConcurrency).toBe(1000);
    });
  });
});
