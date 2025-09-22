/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { ProcessingEnvironment, LogLevel } from "../../../src";

describe("ProcessingEnvironment - Configuration and Logging", () => {
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

  describe("log level configuration", () => {
    test("accepts custom log level configuration", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
        logLevel: LogLevel.DEBUG,
      });

      expect(environment).toBeDefined();
      expect(environment.logLevel).toBe(LogLevel.DEBUG);

      const template = Template.fromStack(stack);

      // Verify Lambda functions have DEBUG log level
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            LOG_LEVEL: "DEBUG",
          },
        },
      });
    });
  });

  describe("metric namespace configuration", () => {
    test("verifies metric namespace is properly set", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "CustomMetricsNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.metricNamespace).toBe("CustomMetricsNamespace");

      const template = Template.fromStack(stack);

      // Verify custom metrics namespace in Lambda environment
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            METRIC_NAMESPACE: "CustomMetricsNamespace",
          },
        },
      });
    });

    test("handles empty metric namespace gracefully", () => {
      expect(() => {
        new ProcessingEnvironment(stack, "Environment", {
          inputBucket,
          outputBucket,
          workingBucket,
          metricNamespace: "",
        });
      }).not.toThrow();
    });
  });

  describe("CloudWatch log configuration", () => {
    test("creates CloudWatch log groups for all functions", () => {
      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify CloudWatch log groups are created (without LogGroupName requirement)
      template.hasResourceProperties("AWS::Logs::LogGroup", {
        RetentionInDays: Match.anyValue(),
      });
    });

    test("accepts custom log retention configuration", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
        logRetention: 30, // 30 days
      });

      expect(environment).toBeDefined();
      expect(environment.logRetention).toBe(30);

      const template = Template.fromStack(stack);

      // Verify custom log retention
      template.hasResourceProperties("AWS::Logs::LogGroup", {
        RetentionInDays: 30,
      });
    });
  });

  describe("environment variable validation", () => {
    test("validates bucket configurations", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();

      // Verify buckets are properly referenced in Lambda environment variables
      const template = Template.fromStack(stack);

      // Check that at least one Lambda function has OUTPUT_BUCKET reference
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            OUTPUT_BUCKET: {
              Ref: Match.anyValue(),
            },
          },
        },
      });
    });
  });
});
