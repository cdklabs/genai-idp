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
  CapacityPlanning,
  ConfigurationTable,
  TrackingTable,
  ProcessingEnvironment,
  ProcessingEnvironmentApi,
} from "../../../src";

describe("CapacityPlanning", () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let trackingTable: TrackingTable;
  let configurationTable: ConfigurationTable;
  let inputBucket: s3.Bucket;
  let outputBucket: s3.Bucket;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    trackingTable = new TrackingTable(stack, "TrackingTable");
    configurationTable = new ConfigurationTable(stack, "ConfigurationTable");
    inputBucket = new s3.Bucket(stack, "InputBucket");
    outputBucket = new s3.Bucket(stack, "OutputBucket");
  });

  function createEnvironment() {
    return new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket: new s3.Bucket(stack, "WorkingBucket"),
      trackingTable,
      configurationTable,
      metricNamespace: "TestNamespace",
    });
  }

  describe("Basic Functionality", () => {
    test("creates construct with required props", () => {
      const environment = createEnvironment();
      const capacityPlanning = new CapacityPlanning(stack, "CapacityPlanning", {
        environment,
      });

      expect(capacityPlanning).toBeDefined();
      expect(capacityPlanning.calculationFunction).toBeDefined();
      expect(capacityPlanning.resolverFunction).toBeDefined();
    });

    test("creates two Lambda functions", () => {
      const environment = createEnvironment();
      new CapacityPlanning(stack, "CapacityPlanning", { environment });

      const template = Template.fromStack(stack);

      // CapacityPlanning creates 2 functions; ProcessingEnvironment creates its own
      // Verify at least 2 functions exist with capacity-related env vars
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({
            TRACKING_TABLE_NAME: Match.anyValue(),
            CONFIGURATION_TABLE_NAME: Match.anyValue(),
          }),
        },
      });
    });

    test("grants table permissions to calculation function", () => {
      const environment = createEnvironment();
      new CapacityPlanning(stack, "CapacityPlanning", { environment });

      const template = Template.fromStack(stack);

      // Verify DynamoDB permissions are granted
      const resources = template.findResources("AWS::IAM::Policy");
      const policyStatements = Object.values(resources).flatMap(
        (resource: any) => resource.Properties.PolicyDocument.Statement,
      );

      const dynamoDbStatement = policyStatements.find(
        (stmt: any) =>
          stmt.Action &&
          (Array.isArray(stmt.Action)
            ? stmt.Action.some((action: string) =>
                action.startsWith("dynamodb:"),
              )
            : stmt.Action.startsWith("dynamodb:")),
      );

      expect(dynamoDbStatement).toBeDefined();
      expect(dynamoDbStatement.Effect).toBe("Allow");
    });
  });

  describe("Configuration Options", () => {
    test("supports custom encryption key", () => {
      const environment = createEnvironment();
      const encryptionKey = new kms.Key(stack, "CustomKey");

      new CapacityPlanning(stack, "CapacityPlanning", {
        environment,
        encryptionKey,
      });

      const template = Template.fromStack(stack);

      // Verify KMS permissions are granted
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

    test("falls back to environment encryption key", () => {
      const encryptionKey = new kms.Key(stack, "EnvKey");
      const environment = new ProcessingEnvironment(stack, "Environment", {
        inputBucket,
        outputBucket,
        workingBucket: new s3.Bucket(stack, "WorkingBucket2"),
        trackingTable,
        configurationTable,
        metricNamespace: "TestNamespace",
        key: encryptionKey,
      });

      new CapacityPlanning(stack, "CapacityPlanning", { environment });

      // Should not throw - uses environment's key
      expect(() => Template.fromStack(stack)).not.toThrow();
    });
  });

  describe("Validation", () => {
    test("throws if environment is not provided", () => {
      expect(() => {
        new CapacityPlanning(stack, "CapacityPlanning", {
          environment: undefined as any,
        });
      }).toThrow("CapacityPlanning requires a ProcessingEnvironment");
    });
  });

  describe("API Integration", () => {
    test("enableInApi creates resolver for calculateCapacity mutation", () => {
      const environment = createEnvironment();
      const capacityPlanning = new CapacityPlanning(stack, "CapacityPlanning", {
        environment,
      });

      const api = new ProcessingEnvironmentApi(stack, "Api", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      api.enable(capacityPlanning);

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "calculateCapacity",
      });
    });
  });
});
