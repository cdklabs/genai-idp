/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { ProcessingEnvironment, ReportingEnvironment } from "../../src";

describe("Internal Functions", () => {
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

  describe("basic environment setup", () => {
    test("creates processing environment with basic functions", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.configurationFunction).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify basic infrastructure is created (DynamoDB tables don't have explicit names)
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        AttributeDefinitions: Match.anyValue(),
      });

      // Verify SQS queue is created
      template.hasResourceProperties("AWS::SQS::Queue", {
        VisibilityTimeout: Match.anyValue(),
      });
    });
  });

  describe("save reporting data function", () => {
    test("creates save reporting data function when reporting is enabled", () => {
      // Create all resources in the same stack
      const reportingBucket = new Bucket(stack, "ReportingBucket");
      const reportingDatabase = new glue.Database(stack, "ReportingDatabase", {
        databaseName: "test-reporting-db",
      });

      const reportingEnvironment = new ReportingEnvironment(
        stack,
        "ReportingEnvironment",
        {
          reportingBucket,
          reportingDatabase,
        },
      );

      const envWithReporting = new ProcessingEnvironment(
        stack,
        "EnvWithReporting",
        {
          inputBucket,
          outputBucket,
          workingBucket,
          metricNamespace: "TestNamespace",
          reportingEnvironment,
        },
      );

      expect(envWithReporting).toBeDefined();
      expect(envWithReporting.saveReportingDataFunction).toBeDefined();
      expect(envWithReporting.reportingEnvironment).toBe(reportingEnvironment);

      const template = Template.fromStack(stack);

      // Verify Lambda function for saving reporting data
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Environment: {
          Variables: {
            LOG_LEVEL: "INFO",
            METRIC_NAMESPACE: "TestNamespace",
          },
        },
      });

      // Verify IAM permissions for reporting operations
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith(["s3:PutObject"]),
              Resource: Match.anyValue(),
            }),
          ]),
        },
      });
    });

    test("works without reporting environment", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.saveReportingDataFunction).toBeUndefined();
      expect(environment.reportingEnvironment).toBeUndefined();
    });
  });
});
