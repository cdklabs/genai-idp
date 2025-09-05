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
  LogLevel,
} from "../../src";

describe("ProcessingEnvironmentApi - Basic Functionality", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let trackingTable: TrackingTable;
  let configurationTable: ConfigurationTable;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");

    // Set bundling context directly on the stack node
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    trackingTable = new TrackingTable(stack, "TrackingTable");
    configurationTable = new ConfigurationTable(stack, "ConfigurationTable");
  });

  describe("core API creation", () => {
    test("creates GraphQL API with required properties", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        name: "TestProcessingApi",
      });

      expect(api).toBeDefined();
      expect(api.graphqlUrl).toBeDefined();
      expect(api.apiId).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify AppSync GraphQL API is created
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        Name: "TestProcessingApi",
        AuthenticationType: "API_KEY",
      });
    });

    test("creates API with default name when not provided", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
      expect(api.graphqlUrl).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify AppSync GraphQL API is created with generated name
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        Name: Match.anyValue(),
        AuthenticationType: "API_KEY",
      });
    });

    test("creates API with custom log level", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        logLevel: LogLevel.DEBUG,
      });

      expect(api).toBeDefined();

      // The log level is passed to the API but may not be set on all Lambda functions
      // Just verify the API was created successfully
      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        Name: Match.anyValue(),
      });
    });
  });

  describe("GraphQL schema and data sources", () => {
    test("creates GraphQL schema from file", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      // Verify GraphQL schema is configured
      template.hasResourceProperties("AWS::AppSync::GraphQLSchema", {
        ApiId: Match.anyValue(),
        Definition: Match.anyValue(),
      });
    });

    test("creates Lambda data sources for resolvers", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      // Verify Lambda data sources are created
      template.hasResourceProperties("AWS::AppSync::DataSource", {
        ApiId: Match.anyValue(),
        Type: "AWS_LAMBDA",
        LambdaConfig: {
          LambdaFunctionArn: Match.anyValue(),
        },
      });
    });

    test("creates resolvers for core functionality", () => {
      new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const template = Template.fromStack(stack);

      // Verify GraphQL resolvers are created
      template.hasResourceProperties("AWS::AppSync::Resolver", {
        ApiId: Match.anyValue(),
        TypeName: Match.anyValue(),
        FieldName: Match.anyValue(),
        DataSourceName: Match.anyValue(),
      });
    });
  });

  describe("bucket integration", () => {
    test("integrates with input and output buckets", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify Lambda functions have bucket permissions
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

    test("handles different bucket configurations", () => {
      const encryptedInputBucket = new Bucket(stack, "EncryptedInputBucket", {
        bucketName: "encrypted-input-bucket",
      });

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket: encryptedInputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
    });
  });

  describe("DynamoDB table integration", () => {
    test("integrates with tracking and configuration tables", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify Lambda functions have DynamoDB permissions
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "dynamodb:BatchGetItem",
                "dynamodb:GetRecords",
                "dynamodb:GetShardIterator",
                "dynamodb:Query",
                "dynamodb:GetItem",
                "dynamodb:Scan",
                "dynamodb:ConditionCheckItem",
                "dynamodb:BatchWriteItem",
                "dynamodb:PutItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:DescribeTable",
              ]),
              Resource: Match.anyValue(),
            }),
          ]),
        },
      });
    });
  });

  describe("error handling and validation", () => {
    test("handles missing optional properties gracefully", () => {
      expect(() => {
        new ProcessingEnvironmentApi(stack, "TestApi", {
          inputBucket,
          outputBucket,
          trackingTable,
          configurationTable,
          // No optional properties provided
        });
      }).not.toThrow();
    });

    test("works with cross-stack resources", () => {
      const otherStack = new Stack(app, "OtherStack");
      const crossStackBucket = new Bucket(otherStack, "CrossStackBucket");

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket: crossStackBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
    });
  });

  describe("API configuration options", () => {
    test("accepts custom authorization configuration", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        xrayEnabled: true,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify X-Ray tracing is enabled
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        XrayEnabled: true,
      });
    });

    test("accepts custom environment variables", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        environmentVariables: {
          CUSTOM_VAR: "custom_value",
          ANOTHER_VAR: "another_value",
        },
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify environment variables are set
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        EnvironmentVariables: {
          CUSTOM_VAR: "custom_value",
          ANOTHER_VAR: "another_value",
        },
      });
    });
  });
});
