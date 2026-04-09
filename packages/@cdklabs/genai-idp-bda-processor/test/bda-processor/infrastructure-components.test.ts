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

describe("BdaProcessor - Infrastructure Components", () => {
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

  describe("Lambda function creation", () => {
    test("creates Lambda functions for the unified processing workflow", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      // Unified processor creates multiple functions (BDA invoke, completion, process results,
      // OCR, classification, extraction, assessment, summarization, evaluation, etc.)
      expect(Object.keys(lambdaResources).length).toBeGreaterThan(5);
    });

    test("Lambda functions use Python runtime", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      Object.values(lambdaResources).forEach((resource: any) => {
        if (resource.Properties?.Runtime) {
          expect(resource.Properties.Runtime).toMatch(/python/);
        }
      });
    });
  });

  describe("DynamoDB table creation", () => {
    test("creates BDA metadata table", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const tableResources = template.findResources("AWS::DynamoDB::Table");
      // Should have tables from environment + BDA metadata table
      expect(Object.keys(tableResources).length).toBeGreaterThan(0);
    });
  });

  describe("Step Functions state machine", () => {
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

  describe("EventBridge rules", () => {
    test("creates EventBridge rule for BDA events", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const eventRuleResources = template.findResources("AWS::Events::Rule");
      expect(Object.keys(eventRuleResources).length).toBeGreaterThanOrEqual(1);

      // Verify BDA event pattern
      const hasBdaRule = Object.values(eventRuleResources).some(
        (resource: any) => {
          const pattern = resource.Properties?.EventPattern;
          return (
            pattern?.source?.includes("aws.bedrock") &&
            (pattern?.["detail-type"] || pattern?.detailType)
          );
        },
      );
      expect(hasBdaRule).toBe(true);
    });
  });

  describe("IAM roles and policies", () => {
    test("creates IAM roles for Lambda functions and state machine", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const roleResources = template.findResources("AWS::IAM::Role");
      expect(Object.keys(roleResources).length).toBeGreaterThan(0);
    });
  });
});
