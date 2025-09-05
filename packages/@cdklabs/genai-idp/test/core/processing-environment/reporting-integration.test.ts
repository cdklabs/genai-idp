/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { ProcessingEnvironment, ReportingEnvironment } from "../../../src";

describe("ProcessingEnvironment - Reporting Integration", () => {
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

  describe("reporting environment integration", () => {
    test("integrates with reporting environment and creates additional resources", () => {
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

      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
        reportingEnvironment,
      });

      expect(environment).toBeDefined();
      expect(environment.reportingEnvironment).toBe(reportingEnvironment);
      expect(environment.saveReportingDataFunction).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify additional Lambda function for reporting
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Environment: {
          Variables: {
            METRIC_NAMESPACE: "TestNamespace",
          },
        },
      });

      // Verify Glue database and tables are created
      template.hasResourceProperties("AWS::Glue::Database", {
        DatabaseInput: {
          Name: "test-reporting-db",
        },
      });

      template.hasResourceProperties("AWS::Glue::Table", {
        DatabaseName: {
          Ref: Match.anyValue(),
        },
        TableInput: {
          Name: Match.anyValue(),
        },
      });
    });

    test("reporting function has proper IAM permissions", () => {
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

      new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
        reportingEnvironment,
      });

      const template = Template.fromStack(stack);

      // Verify S3 permissions for reporting bucket
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
  });
});
