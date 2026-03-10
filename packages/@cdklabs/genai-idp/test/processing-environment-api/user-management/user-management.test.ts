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
  UserManagement,
  UserIdentity,
  ConfigurationTable,
  TrackingTable,
  ProcessingEnvironmentApi,
} from "../../../src";

describe("UserManagement", () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let userIdentity: UserIdentity;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    userIdentity = new UserIdentity(stack, "UserIdentity");
  });

  describe("Basic Functionality", () => {
    test("creates construct with required props", () => {
      const userManagement = new UserManagement(stack, "UserManagement", {
        userIdentity,
      });

      expect(userManagement).toBeDefined();
      expect(userManagement.managementFunction).toBeDefined();
      expect(userManagement.syncFunction).toBeDefined();
      expect(userManagement.usersTable).toBeDefined();
    });

    test("creates two Lambda functions", () => {
      new UserManagement(stack, "UserManagement", { userIdentity });

      const template = Template.fromStack(stack);

      // UserManagement creates 2 Lambda functions (management + sync)
      template.resourceCountIs("AWS::Lambda::Function", 2);
    });

    test("creates UsersTable when not provided", () => {
      new UserManagement(stack, "UserManagement", { userIdentity });

      const template = Template.fromStack(stack);

      // Should create at least one DynamoDB table (UsersTable)
      template.hasResourceProperties("AWS::DynamoDB::Table", {
        KeySchema: Match.arrayWith([
          Match.objectLike({ AttributeName: "PK", KeyType: "HASH" }),
        ]),
      });
    });

    test("grants read/write permissions on users table", () => {
      new UserManagement(stack, "UserManagement", { userIdentity });

      const template = Template.fromStack(stack);

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
      const encryptionKey = new kms.Key(stack, "CustomKey");

      new UserManagement(stack, "UserManagement", {
        userIdentity,
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
    });

    test("supports custom admin and reviewer groups", () => {
      new UserManagement(stack, "UserManagement", {
        userIdentity,
        adminGroup: "SuperAdmins",
        reviewerGroup: "Reviewers",
      });

      const template = Template.fromStack(stack);

      // Verify environment variables include group names
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({
            ADMIN_GROUP: "SuperAdmins",
            REVIEWER_GROUP: "Reviewers",
          }),
        },
      });
    });
  });

  describe("Validation", () => {
    test("throws if userIdentity is not provided", () => {
      expect(() => {
        new UserManagement(stack, "UserManagement", {
          userIdentity: undefined as any,
        });
      }).toThrow("UserManagement requires a UserIdentity construct");
    });
  });

  describe("API Integration", () => {
    test("enableInApi creates resolvers for user operations", () => {
      const userManagement = new UserManagement(stack, "UserManagement", {
        userIdentity,
      });

      const inputBucket = new s3.Bucket(stack, "InputBucket");
      const outputBucket = new s3.Bucket(stack, "OutputBucket");
      const trackingTable = new TrackingTable(stack, "TrackingTable");
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

      api.enable(userManagement);

      const template = Template.fromStack(stack);

      // Verify resolvers for createUser, deleteUser, listUsers
      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "createUser",
      });

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Mutation",
        FieldName: "deleteUser",
      });

      template.hasResourceProperties("AWS::AppSync::Resolver", {
        TypeName: "Query",
        FieldName: "listUsers",
      });
    });
  });
});
