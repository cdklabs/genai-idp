/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  ConfigurationTable,
  DocumentDiscovery,
  IProcessingEnvironmentApi,
} from "../src";

describe("DocumentDiscovery", () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let discoveryBucket: s3.IBucket;
  let configurationTable: ConfigurationTable;
  let mockApi: IProcessingEnvironmentApi;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");

    // Set bundling context to disable asset creation during tests
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    discoveryBucket = new s3.Bucket(stack, "DiscoveryBucket");
    configurationTable = new ConfigurationTable(stack, "ConfigurationTable");

    // Create mock API
    mockApi = {
      graphqlUrl: "https://example.appsync-api.us-east-1.amazonaws.com/graphql",
      grantMutation: jest.fn(),
    } as any;
  });

  test("creates discovery environment with required resources", () => {
    // WHEN
    const discovery = new DocumentDiscovery(stack, "Discovery", {
      discoveryBucket,
    });

    // THEN
    const template = Template.fromStack(stack);

    // Should create DynamoDB table
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      AttributeDefinitions: [
        {
          AttributeName: "jobId",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "jobId",
          KeyType: "HASH",
        },
      ],
    });

    // Should create SQS queue
    template.hasResourceProperties("AWS::SQS::Queue", {
      VisibilityTimeout: 300,
    });

    // Should NOT create Lambda functions yet (created in initializeFunctions)
    template.resourceCountIs("AWS::Lambda::Function", 0);

    // Should have discovery bucket, table, and queue
    expect(discovery.discoveryBucket).toBeDefined();
    expect(discovery.discoveryTable).toBeDefined();
    expect(discovery.discoveryQueue).toBeDefined();
  });

  test("initializes functions when initializeFunctions is called", () => {
    // GIVEN
    const discovery = new DocumentDiscovery(stack, "Discovery", {
      discoveryBucket,
    });

    // WHEN
    discovery.initializeFunctions(mockApi, configurationTable);

    // THEN
    const template = Template.fromStack(stack);

    // Should create Lambda functions after initialization
    template.resourceCountIs("AWS::Lambda::Function", 2);
  });

  test("throws error if initializeFunctions called twice", () => {
    // GIVEN
    const discovery = new DocumentDiscovery(stack, "Discovery", {
      discoveryBucket,
    });

    discovery.initializeFunctions(mockApi, configurationTable);

    // WHEN/THEN - CDK will throw construct name collision error
    expect(() => {
      discovery.initializeFunctions(mockApi, configurationTable);
    }).toThrow("There is already a Construct with name 'UploadResolver'");
  });
});
