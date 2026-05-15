/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  SagemakerUdopProcessor,
  SagemakerUdopProcessorConfiguration,
  BasicSagemakerClassifier,
} from "../src";

describe("SagemakerUdopProcessor - Facade", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let configurationBucket: Bucket;
  let classifierEndpoint: sagemaker.IEndpoint;

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

    classifierEndpoint = sagemaker.Endpoint.fromEndpointName(
      stack,
      "MockEndpoint",
      "test-endpoint",
    );
  });

  describe("core construct creation", () => {
    test("creates processor with minimal configuration", () => {
      const processor = new SagemakerUdopProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        classifierEndpoint,
        configuration:
          SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(),
      });

      expect(processor).toBeDefined();
      expect(processor.environment).toBe(environment);
      expect(processor.stateMachine).toBeDefined();
      expect(processor.maxProcessingConcurrency).toBe(1);
    });

    test("creates exactly one state machine", () => {
      new SagemakerUdopProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        classifierEndpoint,
        configuration:
          SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(),
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
    });

    test("creates classification bridge Lambda with GENAIIDP prefix", () => {
      new SagemakerUdopProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        classifierEndpoint,
        configuration:
          SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(),
      });

      const template = Template.fromStack(stack);
      // The bridge Lambda should have SAGEMAKER_ENDPOINT_NAME env var
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({
            SAGEMAKER_ENDPOINT_NAME: "test-endpoint",
          }),
        },
      });
    });
  });

  describe("module exports", () => {
    test("SagemakerUdopProcessor can be imported", () => {
      expect(SagemakerUdopProcessor).toBeDefined();
    });

    test("SagemakerUdopProcessorConfiguration can be imported", () => {
      expect(SagemakerUdopProcessorConfiguration).toBeDefined();
    });

    test("BasicSagemakerClassifier can be imported", () => {
      expect(BasicSagemakerClassifier).toBeDefined();
    });
  });

  describe("metrics", () => {
    test("exposes Bedrock request metrics", () => {
      const processor = new SagemakerUdopProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        classifierEndpoint,
        configuration:
          SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(),
      });

      expect(processor.metricBedrockRequestsTotal()).toBeDefined();
      expect(processor.metricBedrockRequestsSucceeded()).toBeDefined();
      expect(processor.metricBedrockRequestsFailed()).toBeDefined();
    });
  });
});
