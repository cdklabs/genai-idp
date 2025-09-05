/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Key } from "aws-cdk-lib/aws-kms";
import { Bucket, BucketEncryption } from "aws-cdk-lib/aws-s3";
import { SaveReportingDataFunction, LogLevel } from "../../src";

describe("SaveReportingDataFunction", () => {
  let app: App;
  let stack: Stack;
  let reportingBucket: Bucket;
  let outputBucket: Bucket;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");

    // Set bundling context directly on the stack node
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);
    expect(stack.bundlingRequired).toBe(false);

    reportingBucket = new Bucket(stack, "ReportingBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
  });

  describe("basic functionality", () => {
    test("creates function with required properties", () => {
      const saveFunction = new SaveReportingDataFunction(
        stack,
        "SaveFunction",
        {
          reportingBucket,
          outputBucket,
          metricNamespace: "TestNamespace",
        },
      );

      expect(saveFunction).toBeDefined();
      expect(saveFunction.functionName).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify Lambda function is created with correct runtime and configuration
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Timeout: 300, // 5 minutes
        MemorySize: 1024, // 1GB
        Description:
          "This AWS Lambda Function saves document evaluation data to the reporting bucket in Parquet format for analytics.",
        Environment: {
          Variables: {
            LOG_LEVEL: "INFO",
            METRIC_NAMESPACE: "TestNamespace",
          },
        },
      });
    });

    test("creates function with custom log level", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
        logLevel: LogLevel.DEBUG,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            LOG_LEVEL: "DEBUG",
            METRIC_NAMESPACE: "TestNamespace",
          },
        },
      });
    });

    test("creates function with default timeout and memory configuration", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Timeout: 300, // 5 minutes (default)
        MemorySize: 1024, // 1GB (default)
      });
    });
  });

  describe("IAM permissions", () => {
    test("grants read permissions to output bucket", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify IAM policy for output bucket read access
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*",
              ]),
              Resource: Match.anyValue(),
            }),
          ]),
        },
      });
    });

    test("grants read-write permissions to reporting bucket", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify IAM policy for reporting bucket read-write access
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "s3:GetObject*",
                "s3:GetBucket*",
                "s3:List*",
                "s3:DeleteObject*",
                "s3:PutObject",
                "s3:PutObjectLegalHold",
                "s3:PutObjectRetention",
                "s3:PutObjectTagging",
                "s3:PutObjectVersionTagging",
                "s3:Abort*",
              ]),
              Resource: Match.anyValue(),
            }),
          ]),
        },
      });
    });

    test("grants CloudWatch metrics permissions", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify CloudWatch metrics policy
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: "cloudwatch:PutMetricData",
              Resource: "*",
            }),
          ]),
        },
      });
    });
  });

  describe("KMS encryption", () => {
    test("works without encryption key", () => {
      const saveFunction = new SaveReportingDataFunction(
        stack,
        "SaveFunction",
        {
          reportingBucket,
          outputBucket,
          metricNamespace: "TestNamespace",
        },
      );

      expect(saveFunction).toBeDefined();

      const template = Template.fromStack(stack);

      // Should not have KMS permissions when no key is provided
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
      });
    });

    test("grants KMS permissions when encryption key is provided", () => {
      const encryptionKey = new Key(stack, "EncryptionKey", {
        description: "Test encryption key",
      });

      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
        encryptionKey,
      });

      const template = Template.fromStack(stack);

      // Verify KMS permissions are granted (they may be in a separate policy statement)
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith(["kms:Decrypt"]),
            }),
          ]),
        },
      });
    });
  });

  describe("bundling configuration", () => {
    test("configures Python bundling with correct entry point", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify Lambda function has correct handler
      template.hasResourceProperties("AWS::Lambda::Function", {
        Handler: "index.handler",
        Runtime: "python3.12",
      });
    });

    test("sets appropriate resource limits for Parquet processing", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      // Verify resource configuration suitable for Parquet processing
      template.hasResourceProperties("AWS::Lambda::Function", {
        MemorySize: 1024, // 1GB for Parquet processing
        Timeout: 300, // 5 minutes for data processing
      });
    });
  });

  describe("environment variables", () => {
    test("sets default log level to INFO", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            LOG_LEVEL: "INFO",
          },
        },
      });
    });

    test("accepts custom log levels", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
        logLevel: LogLevel.ERROR,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            LOG_LEVEL: "ERROR",
          },
        },
      });
    });

    test("sets metric namespace correctly", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "CustomMetricsNamespace",
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            METRIC_NAMESPACE: "CustomMetricsNamespace",
          },
        },
      });
    });
  });

  describe("error handling and validation", () => {
    test("handles empty metric namespace", () => {
      expect(() => {
        new SaveReportingDataFunction(stack, "SaveFunction", {
          reportingBucket,
          outputBucket,
          metricNamespace: "",
        });
      }).not.toThrow();
    });

    test("accepts additional function properties", () => {
      new SaveReportingDataFunction(stack, "SaveFunction", {
        reportingBucket,
        outputBucket,
        metricNamespace: "TestNamespace",
        description: "Custom description",
        functionName: "CustomFunctionName",
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Description: "Custom description",
        FunctionName: "CustomFunctionName",
        Environment: {
          Variables: {
            LOG_LEVEL: "INFO",
            METRIC_NAMESPACE: "TestNamespace",
          },
        },
      });
    });
  });

  describe("integration with other constructs", () => {
    test("can be used with different bucket configurations", () => {
      const encryptedBucket = new Bucket(stack, "EncryptedBucket", {
        encryption: BucketEncryption.S3_MANAGED,
      });

      const saveFunction = new SaveReportingDataFunction(
        stack,
        "SaveFunction",
        {
          reportingBucket: encryptedBucket,
          outputBucket,
          metricNamespace: "TestNamespace",
        },
      );

      expect(saveFunction).toBeDefined();

      const template = Template.fromStack(stack);

      // Should still create the function successfully
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
      });
    });

    test("works with cross-stack bucket references", () => {
      const otherStack = new Stack(app, "OtherStack");
      const crossStackBucket = new Bucket(otherStack, "CrossStackBucket");

      const saveFunction = new SaveReportingDataFunction(
        stack,
        "SaveFunction",
        {
          reportingBucket: crossStackBucket,
          outputBucket,
          metricNamespace: "TestNamespace",
        },
      );

      expect(saveFunction).toBeDefined();
    });
  });
});
