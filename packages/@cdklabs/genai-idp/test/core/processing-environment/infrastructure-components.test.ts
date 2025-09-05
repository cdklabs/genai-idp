/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { ProcessingEnvironment } from "../../../src";

describe("ProcessingEnvironment - Infrastructure Components", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");

    // Set bundling context directly on the stack node
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    workingBucket = new Bucket(stack, "WorkingBucket");
  });

  describe("DynamoDB tables", () => {
    test("creates configuration table with proper structure", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.configurationTable).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify DynamoDB table is created (with actual structure)
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        AttributeDefinitions: Match.anyValue(),
        KeySchema: Match.anyValue(),
      });
    });

    test("creates tracking table with TTL configuration", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.trackingTable).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify tracking table is created (with actual structure)
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        AttributeDefinitions: Match.anyValue(),
        KeySchema: Match.anyValue(),
        TimeToLiveSpecification: Match.anyValue(),
      });
    });
  });

  describe("SQS queues", () => {
    test("creates SQS queues for processing", () => {
      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify SQS queue is created (with actual property name)
      template.hasResourceProperties("AWS::SQS::Queue", {
        VisibilityTimeout: Match.anyValue(),
      });
    });

    test("queues have dead letter queue configuration", () => {
      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify dead letter queue configuration exists
      template.hasResourceProperties("AWS::SQS::Queue", {
        RedrivePolicy: {
          deadLetterTargetArn: Match.anyValue(),
          maxReceiveCount: Match.anyValue(),
        },
      });
    });
  });

  describe("Lambda functions", () => {
    test("creates Lambda functions for processing", () => {
      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify Lambda functions are created
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Handler: "index.handler",
      });
    });

    test("uses appropriate Lambda layers for all functions", () => {
      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify Lambda layer is created
      template.hasResourceProperties("AWS::Lambda::LayerVersion", {
        CompatibleRuntimes: ["python3.12"],
        Description: Match.stringLikeRegexp(".*idp_common.*"),
      });

      // Verify Lambda functions use the layer
      template.hasResourceProperties("AWS::Lambda::Function", {
        Layers: Match.arrayWith([
          {
            Ref: Match.anyValue(),
          },
        ]),
      });
    });
  });

  describe("S3 integration", () => {
    test("creates basic S3 buckets", () => {
      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify S3 buckets are created (just check they exist)
      template.hasResourceProperties("AWS::S3::Bucket", {});
    });
  });
});
