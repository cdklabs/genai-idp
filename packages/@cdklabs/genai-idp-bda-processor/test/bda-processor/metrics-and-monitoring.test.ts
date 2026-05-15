/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";

describe("BdaProcessor - Metrics and Monitoring", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let configurationBucket: Bucket;
  let processor: BdaProcessor;

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

    processor = new BdaProcessor(stack, "Processor", {
      environment,
      configurationBucket,
      configuration: BdaProcessorConfiguration.lendingPackageSample(),
    });
  });

  describe("processor properties", () => {
    test("exposes environment with metric namespace", () => {
      expect(processor.environment.metricNamespace).toBe("TestNamespace");
    });

    test("exposes state machine for monitoring", () => {
      expect(processor.stateMachine).toBeDefined();
      expect(processor.stateMachine.stateMachineArn).toBeDefined();
    });

    test("exposes BDA project for monitoring", () => {
      expect(processor.project).toBeDefined();
      expect(processor.project.arn).toBeDefined();
    });
  });

  describe("environment metrics delegation", () => {
    test("environment exposes metric namespace for custom metrics", () => {
      expect(processor.environment.metricNamespace).toBe("TestNamespace");
    });
  });
});
