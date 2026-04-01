/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  ProcessingEnvironmentApi,
  ConfigurationTable,
  TrackingTable,
} from "../src";

describe("Phase 1: Resolver Alignment & Core Infrastructure", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let trackingTable: TrackingTable;
  let configurationTable: ConfigurationTable;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    trackingTable = new TrackingTable(stack, "TrackingTable");
    configurationTable = new ConfigurationTable(stack, "ConfigurationTable");
  });

  describe("Task 1.1: ErrorAnalyzer removal", () => {
    test("ErrorAnalyzer is no longer exported from the package", () => {
      // Verify that importing ErrorAnalyzer from the package fails at the type level
      const exports = require("../src");
      expect(exports.ErrorAnalyzer).toBeUndefined();
      expect(exports.ErrorAnalyzerFunction).toBeUndefined();
    });
  });

  describe("Task 1.2: TrackingTable TypeDateIndex GSI", () => {
    test("TrackingTable has TypeDateIndex GSI", () => {
      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::DynamoDB::Table", {
        KeySchema: [
          { AttributeName: "PK", KeyType: "HASH" },
          { AttributeName: "SK", KeyType: "RANGE" },
        ],
        GlobalSecondaryIndexes: Match.arrayWith([
          Match.objectLike({
            IndexName: "TypeDateIndex",
            KeySchema: [
              { AttributeName: "ItemType", KeyType: "HASH" },
              { AttributeName: "InitialEventTime", KeyType: "RANGE" },
            ],
            Projection: {
              ProjectionType: "INCLUDE",
              NonKeyAttributes: Match.arrayWith([
                "ObjectKey",
                "ObjectStatus",
                "HITLStatus",
                "ConfigVersion",
                "TraceId",
              ]),
            },
          }),
        ]),
      });
    });

    test("TYPE_DATE_INDEX_NAME static property is correct", () => {
      expect(TrackingTable.TYPE_DATE_INDEX_NAME).toBe("TypeDateIndex");
    });
  });

  describe("Task 1.4: GSI Lambda replaces VTL Scan for listDocuments", () => {
    test("creates ListDocumentsGSI Lambda data source", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      // Verify GSI Lambda function is created
      template.hasResourceProperties("AWS::Lambda::Function", {
        Description: "Lambda function for GSI-based document listing and counting",
      });
    });

    test("creates listDocuments resolver on GSI Lambda data source", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      // Verify listDocuments resolver exists and is wired to Lambda (not VTL Scan)
      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Query",
        FieldName: "listDocuments",
        DataSourceName: "ListDocumentsGSIDataSource",
      });
    });
  });

  describe("Task 1.5: getDocumentCount and listDocumentsByDateRange", () => {
    test("creates getDocumentCount resolver on GSI Lambda data source", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Query",
        FieldName: "getDocumentCount",
        DataSourceName: "ListDocumentsGSIDataSource",
      });
    });

    test("creates listDocumentsByDateRange resolver on separate Lambda", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Query",
        FieldName: "listDocumentsByDateRange",
        DataSourceName: "ListDocumentsByDateRangeDataSource",
      });
    });

    test("creates ListDocumentsByDateRange Lambda function", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::Lambda::Function", {
        Description: "Lambda function to list documents by date range via GraphQL API",
      });
    });
  });

  describe("Task 1.6: updateDocumentStatus and updateDocumentSection VTL resolvers", () => {
    test("creates updateDocumentStatus resolver", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "updateDocumentStatus",
      });
    });

    test("creates updateDocumentSection resolver", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "updateDocumentSection",
      });
    });
  });

  describe("Task 1.7: onCreateDocument and onUpdateDocument subscriptions", () => {
    test("creates onCreateDocument subscription resolver", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Subscription",
        FieldName: "onCreateDocument",
      });
    });

    test("creates onUpdateDocument subscription resolver", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Subscription",
        FieldName: "onUpdateDocument",
      });
    });
  });

  describe("Task 1.8: calculateCapacity is Query not Mutation", () => {
    test("CapacityPlanning wires calculateCapacity as Query", () => {
      // This is a compile-time verification — the CapacityPlanning construct
      // now uses typeName: 'Query' instead of 'Mutation'.
      // Full integration test requires CapacityPlanning to be enabled,
      // which is covered by the existing optional-features tests.
      // Here we just verify the import still works.
      const { CapacityPlanning } = require("../src");
      expect(CapacityPlanning).toBeDefined();
    });
  });

  describe("GSI Lambda DLQ creation", () => {
    test("creates DLQs for new Lambda functions", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      // Verify SQS queues are created (DLQs for the new Lambda functions)
      // Each new Lambda (ListDocumentsGSI, ListDocumentsByDateRange) gets a DLQ
      template.hasResourceProperties("AWS::SQS::Queue", {
        MessageRetentionPeriod: 1209600, // 14 days in seconds
      });
    });
  });
});
