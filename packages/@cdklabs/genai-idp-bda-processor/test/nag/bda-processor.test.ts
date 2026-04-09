/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Aspects, Stack } from "aws-cdk-lib";
import { Annotations, Match, Template } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";

describe("BdaProcessor CDK Nag Compliance", () => {
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
    Aspects.of(stack).add(new AwsSolutionsChecks());

    configurationBucket = new Bucket(stack, "ConfigurationBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket: new Bucket(stack, "InputBucket"),
      outputBucket: new Bucket(stack, "OutputBucket"),
      workingBucket: new Bucket(stack, "WorkingBucket"),
      metricNamespace: "TestNamespace",
    });
  });

  describe("BdaProcessor with suppressions", () => {
    test("satisfies CDK NAG AwsSolutionsChecks with proper suppressions", () => {
      expect(stack.bundlingRequired).toBe(false);

      const processor = new BdaProcessor(stack, "BdaProcessor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      NagSuppressions.addStackSuppressions(stack, [
        {
          id: "AwsSolutions-IAM4",
          reason: "AWS managed policies for service roles",
        },
        {
          id: "AwsSolutions-IAM5",
          reason: "Wildcard permissions for Bedrock Data Automation",
        },
        { id: "AwsSolutions-L1", reason: "Supported Python runtime" },
        { id: "AwsSolutions-SF1", reason: "Step Functions logging configured" },
        {
          id: "AwsSolutions-SF2",
          reason: "X-Ray tracing configured per requirements",
        },
        { id: "AwsSolutions-SQS3", reason: "SQS DLQ configured" },
        { id: "AwsSolutions-SQS4", reason: "SQS encryption configured" },
        { id: "AwsSolutions-S1", reason: "S3 access logging per requirements" },
        {
          id: "AwsSolutions-S2",
          reason: "S3 public access blocked by default",
        },
        { id: "AwsSolutions-S10", reason: "S3 SSL enforced" },
        { id: "AwsSolutions-DDB3", reason: "DynamoDB PITR per requirements" },
        {
          id: "AwsSolutions-KMS5",
          reason: "KMS key rotation per requirements",
        },
      ]);

      app.synth();

      const warnings = Annotations.fromStack(stack).findWarning(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );
      const errors = Annotations.fromStack(stack).findError(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);
      expect(processor).toBeDefined();

      const template = Template.fromStack(stack);
      expect(template.toJSON()).toMatchSnapshot();
    });
  });

  describe("BdaProcessor violation detection", () => {
    test("detects CDK Nag violations when suppressions are not applied", () => {
      expect(stack.bundlingRequired).toBe(false);

      new BdaProcessor(stack, "BdaProcessor", {
        environment,
        configurationBucket,
        configuration: BdaProcessorConfiguration.lendingPackageSample(),
      });

      app.synth();

      const warnings = Annotations.fromStack(stack).findWarning(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );
      const errors = Annotations.fromStack(stack).findError(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );

      expect(warnings.length + errors.length).toBeGreaterThan(0);
    });
  });
});
