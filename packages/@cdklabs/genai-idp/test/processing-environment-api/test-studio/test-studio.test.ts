/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cxapi from "aws-cdk-lib/cx-api";
import {
  TestStudio,
  TrackingTable,
  ConfigurationTable,
  ProcessingEnvironmentApi,
} from "../../../src";

describe("TestStudio", () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let trackingTable: TrackingTable;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    trackingTable = new TrackingTable(stack, "TrackingTable");
  });

  describe("Basic Functionality", () => {
    test("creates construct with minimal props", () => {
      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
      });

      expect(testStudio).toBeDefined();
      expect(testStudio.testTable).toBeDefined();
      expect(testStudio.testBucket).toBeDefined();
      expect(testStudio.testRunnerFunction).toBeDefined();
      expect(testStudio.testSetResolverFunction).toBeDefined();
      expect(testStudio.testResultsResolverFunction).toBeDefined();
      expect(testStudio.testSetCopyQueue).toBeDefined();
      expect(testStudio.testResultCacheUpdateQueue).toBeDefined();
    });

    test("creates Lambda functions", () => {
      new TestStudio(stack, "TestStudio", { trackingTable });

      const template = Template.fromStack(stack);

      // TestStudio creates 3 base functions: runner, set resolver, results resolver
      template.resourceCountIs("AWS::Lambda::Function", 3);
    });

    test("creates SQS queues with DLQs", () => {
      new TestStudio(stack, "TestStudio", { trackingTable });

      const template = Template.fromStack(stack);

      // 2 main queues + 2 DLQs = 4 total
      template.resourceCountIs("AWS::SQS::Queue", 4);
    });

    test("creates test table and test bucket by default", () => {
      new TestStudio(stack, "TestStudio", { trackingTable });

      const template = Template.fromStack(stack);

      // TestTable + TrackingTable = 2 tables
      template.resourceCountIs("AWS::DynamoDB::Table", 2);

      // TestBucket
      template.hasResourceProperties("AWS::S3::Bucket", {
        BucketEncryption: Match.objectLike({
          ServerSideEncryptionConfiguration: Match.anyValue(),
        }),
      });
    });
  });

  describe("Dataset Deployers", () => {
    test("does not create deployers by default", () => {
      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
      });

      expect(testStudio.fccDatasetDeployer).toBeUndefined();
      expect(testStudio.docSplitTestSetDeployer).toBeUndefined();
      expect(testStudio.ocrBenchmarkDeployer).toBeUndefined();
    });

    test("creates DocSplit deployer when enabled", () => {
      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
        enableDocSplitDataset: true,
      });

      expect(testStudio.docSplitTestSetDeployer).toBeDefined();

      const template = Template.fromStack(stack);

      // 3 base functions + 1 DocSplit deployer = 4
      template.resourceCountIs("AWS::Lambda::Function", 4);
    });

    test("creates OCR benchmark deployer when enabled", () => {
      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
        enableOcrBenchmark: true,
      });

      expect(testStudio.ocrBenchmarkDeployer).toBeDefined();

      const template = Template.fromStack(stack);

      // 3 base functions + 1 OCR benchmark deployer = 4
      template.resourceCountIs("AWS::Lambda::Function", 4);
    });

    test("creates all deployers when all enabled", () => {
      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
        enableRealKieDataset: true,
        enableDocSplitDataset: true,
        enableOcrBenchmark: true,
      });

      expect(testStudio.fccDatasetDeployer).toBeDefined();
      expect(testStudio.docSplitTestSetDeployer).toBeDefined();
      expect(testStudio.ocrBenchmarkDeployer).toBeDefined();
    });
  });

  describe("Configuration Options", () => {
    test("supports custom encryption key", () => {
      const encryptionKey = new kms.Key(stack, "CustomKey");

      new TestStudio(stack, "TestStudio", {
        trackingTable,
        encryptionKey,
      });

      const template = Template.fromStack(stack);

      // Verify table uses customer-managed encryption
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        SSESpecification: Match.objectLike({
          SSEEnabled: true,
          SSEType: "KMS",
        }),
      });

      // Verify bucket uses KMS encryption
      template.hasResourceProperties("AWS::S3::Bucket", {
        BucketEncryption: {
          ServerSideEncryptionConfiguration: Match.arrayWith([
            Match.objectLike({
              ServerSideEncryptionByDefault: Match.objectLike({
                SSEAlgorithm: "aws:kms",
              }),
            }),
          ]),
        },
      });
    });

    test("accepts custom test bucket", () => {
      const testBucket = new s3.Bucket(stack, "CustomTestBucket");

      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
        testBucket,
      });

      expect(testStudio.testBucket).toBe(testBucket);
    });

    test("accepts input and reporting buckets", () => {
      const inputBucket = new s3.Bucket(stack, "InputBucket");
      const reportingBucket = new s3.Bucket(stack, "ReportingBucket");

      expect(() => {
        new TestStudio(stack, "TestStudio", {
          trackingTable,
          inputBucket,
          reportingBucket,
        });
      }).not.toThrow();
    });
  });

  describe("API Integration", () => {
    test("enableInApi creates resolvers for test operations", () => {
      const testStudio = new TestStudio(stack, "TestStudio", {
        trackingTable,
      });

      const inputBucket = new s3.Bucket(stack, "InputBucket");
      const outputBucket = new s3.Bucket(stack, "OutputBucket");
      const configurationTable = new ConfigurationTable(
        stack,
        "ConfigurationTable",
      );

      const api = new ProcessingEnvironmentApi(stack, "Api", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      api.enable(testStudio);

      const template = Template.fromStack(stack);

      // Verify key resolvers are created
      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Query",
        FieldName: "getTestSets",
      });

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "addTestSet",
      });

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Query",
        FieldName: "getTestRun",
      });

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "startTestRun",
      });
    });
  });
});
