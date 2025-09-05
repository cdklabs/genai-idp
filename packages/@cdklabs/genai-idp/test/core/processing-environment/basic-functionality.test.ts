/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as s3 from "aws-cdk-lib/aws-s3";
import { ProcessingEnvironment, ReportingEnvironment } from "../../../src";

describe("ProcessingEnvironment - Basic Functionality", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
      },
    });
    stack = new Stack(app, "TestStack");
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    workingBucket = new Bucket(stack, "WorkingBucket");
  });

  describe("core resource creation", () => {
    test("creates processing environment with required resources", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.inputBucket).toBe(inputBucket);
      expect(environment.outputBucket).toBe(outputBucket);
      expect(environment.workingBucket).toBe(workingBucket);
      expect(environment.configurationTable).toBeDefined();
      expect(environment.trackingTable).toBeDefined();
    });

    test("verifies bucket properties are correctly set", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.inputBucket).toBe(inputBucket);
      expect(environment.outputBucket).toBe(outputBucket);
      expect(environment.workingBucket).toBe(workingBucket);
    });

    test("creates and exposes configuration table", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.configurationTable).toBeDefined();
      expect(environment.configurationFunction).toBeDefined();
    });

    test("creates and exposes tracking table", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.trackingTable).toBeDefined();
    });
  });

  describe("reporting configuration", () => {
    test("uses provided reporting environment", () => {
      // Create a ReportingEnvironment using the actual class
      const reportingBucket = new s3.Bucket(stack, "ReportingBucket");
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

      expect(environment.reportingEnvironment).toBe(reportingEnvironment);
      expect(environment.saveReportingDataFunction).toBeDefined();
    });

    test("works without reporting environment", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment.reportingEnvironment).toBeUndefined();
    });
  });

  describe("API configuration", () => {
    test("uses provided API", () => {
      // Create a mock API that implements IProcessingEnvironmentApi
      const mockApi = {
        grantMutation: jest.fn(),
      } as any; // Simple mock for testing

      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
        api: mockApi,
      });

      expect(environment.api).toBe(mockApi);
      expect(mockApi.grantMutation).toHaveBeenCalled();
    });

    test("works without API", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment.api).toBeUndefined();
    });

    test("handles optional API configuration", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.api).toBeUndefined();
    });
  });

  describe("optional configurations", () => {
    test("handles optional VPC configuration", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.vpcConfiguration).toBeUndefined();
    });

    test("handles optional encryption key", () => {
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket,
        metricNamespace: "TestNamespace",
      });

      expect(environment).toBeDefined();
      expect(environment.encryptionKey).toBeUndefined();
    });
  });
});
