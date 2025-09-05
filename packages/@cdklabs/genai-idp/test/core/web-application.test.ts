/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  ProcessingEnvironment,
  UserIdentity,
  WebApplication,
  ReportingEnvironment,
} from "../../src";

describe("WebApplication", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let userIdentity: UserIdentity;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");

    // Set bundling context directly on the stack node
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);
    expect(stack.bundlingRequired).toBe(false);

    // Create required buckets
    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    workingBucket = new Bucket(stack, "WorkingBucket");

    // Create processing environment
    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });

    // Create user identity
    userIdentity = new UserIdentity(stack, "UserIdentity", {});
  });

  describe("basic configuration", () => {
    test("creates web application with minimal configuration", () => {
      const webApp = new WebApplication(stack, "WebApp", {
        environment,
        userIdentity,
        apiUrl: "https://api.example.com/graphql",
      });

      expect(webApp).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify CloudFront distribution is created
      template.hasResourceProperties("AWS::CloudFront::Distribution", {
        DistributionConfig: {
          Enabled: true,
        },
      });

      // Verify S3 bucket for web assets
      template.hasResourceProperties("AWS::S3::Bucket", {
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true,
        },
      });
    });
  });

  describe("reporting integration", () => {
    test("handles reporting environment when available", () => {
      // Create all resources in the same stack
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

      const webApp = new WebApplication(stack, "WebApp", {
        environment: envWithReporting,
        userIdentity,
        apiUrl: "https://api.example.com/graphql",
      });

      expect(webApp).toBeDefined();
      expect(envWithReporting.reportingEnvironment).toBe(reportingEnvironment);

      const template = Template.fromStack(stack);

      // Verify reporting-related Lambda function is created
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Environment: {
          Variables: {
            REPORTING_BUCKET: Match.anyValue(),
          },
        },
      });
    });
  });

  describe("user identity integration", () => {
    test("integrates with user identity for authentication", () => {
      const webApp = new WebApplication(stack, "WebApp", {
        environment,
        userIdentity,
        apiUrl: "https://api.example.com/graphql",
      });

      expect(webApp).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify SSM parameter is created for configuration
      template.hasResourceProperties("AWS::SSM::Parameter", {
        Type: "String",
        Value: Match.anyValue(),
      });

      // Verify Cognito Identity Pool is created
      template.hasResourceProperties("AWS::Cognito::IdentityPool", {
        AllowUnauthenticatedIdentities: false,
      });
    });
  });
});
