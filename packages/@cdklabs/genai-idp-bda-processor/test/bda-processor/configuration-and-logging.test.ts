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

describe("BdaProcessor - Configuration and Logging", () => {
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

  describe("configuration schema binding", () => {
    test("binds configuration during processor creation", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor).toBeDefined();
    });

    test("handles configuration with custom concurrency", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
        maxProcessingConcurrency: 200,
      });

      expect(processor.maxProcessingConcurrency).toBe(200);
    });
  });

  describe("logging configuration", () => {
    test("creates log groups for Lambda functions", () => {
      new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      const template = Template.fromStack(stack);
      const logGroupResources = template.findResources("AWS::Logs::LogGroup");
      expect(Object.keys(logGroupResources).length).toBeGreaterThan(0);
    });

    test("uses environment metric namespace", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      expect(processor.environment.metricNamespace).toBe("TestNamespace");
    });
  });
});
