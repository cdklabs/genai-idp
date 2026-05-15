/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as bedrock from "@aws-cdk/aws-bedrock-alpha/bedrock";
import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";

describe("BdaProcessor - Optional Features", () => {
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

  describe("configuration presets", () => {
    test("creates processor with lendingPackageSample", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });
      expect(processor).toBeDefined();
    });

    test("creates processor with lendingPackageSampleGovCloud", () => {
      const processor = new BdaProcessor(stack, "GovCloud", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSampleGovCloud(),
      });
      expect(processor).toBeDefined();
    });

    test("creates processor with docSplit", () => {
      const processor = new BdaProcessor(stack, "DocSplit", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.docSplit(),
      });
      expect(processor).toBeDefined();
    });

    test("creates processor with ocrBenchmark", () => {
      const processor = new BdaProcessor(stack, "OcrBenchmark", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.ocrBenchmark(),
      });
      expect(processor).toBeDefined();
    });

    test("creates processor with realkieFccVerified", () => {
      const processor = new BdaProcessor(stack, "RealkieFcc", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.realkieFccVerified(),
      });
      expect(processor).toBeDefined();
    });

    test("creates processor with rvlCdip", () => {
      const processor = new BdaProcessor(stack, "RvlCdip", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.rvlCdip(),
      });
      expect(processor).toBeDefined();
    });
  });

  describe("summarization model configuration", () => {
    test("accepts summarization model from options", () => {
      const processor = new BdaProcessor(stack, "Processor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample({
          summarizationModel: bedrock.CrossRegionInferenceProfile.fromConfig({
            geoRegion: bedrock.CrossRegionInferenceProfileRegion.US,
            model: bedrock.BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
          }),
        }),
      });

      expect(processor).toBeDefined();
    });
  });

  describe("concurrency configuration", () => {
    test("supports different concurrency levels", () => {
      const low = new BdaProcessor(stack, "Low", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
        maxProcessingConcurrency: 10,
      });

      const high = new BdaProcessor(stack, "High", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
        maxProcessingConcurrency: 500,
      });

      expect(low.maxProcessingConcurrency).toBe(10);
      expect(high.maxProcessingConcurrency).toBe(500);
    });
  });
});
