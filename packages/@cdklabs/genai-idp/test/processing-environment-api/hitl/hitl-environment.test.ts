/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cxapi from "aws-cdk-lib/cx-api";
import { LogLevel } from "../../../src/log-level";
import { HitlEnvironment } from "../../../src/processing-environment-api/hitl/hitl-environment";
import { TrackingTable } from "../../../src/tracking-table";

describe("HitlEnvironment", () => {
  let stack: cdk.Stack;
  let trackingTable: TrackingTable;

  beforeEach(() => {
    const app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");

    // Disable bundling for faster tests
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    // Create mock tracking table
    trackingTable = new TrackingTable(stack, "MockTrackingTable");
  });

  describe("Basic Functionality", () => {
    test("creates HITL environment with minimal configuration", () => {
      expect(stack.bundlingRequired).toBe(false);

      const hitlEnv = new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
      });

      expect(hitlEnv).toBeDefined();
      expect(hitlEnv.completeSectionReviewFunction).toBeDefined();
    });

    test("creates CompleteSectionReviewFunction", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
      });

      const template = Template.fromStack(stack);

      // Should create 1 Lambda function
      template.resourceCountIs("AWS::Lambda::Function", 1);

      // Verify function has correct environment variables
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            TRACKING_TABLE_NAME: {
              Ref: stack.getLogicalId(
                trackingTable.node.defaultChild as dynamodb.CfnTable,
              ),
            },
          },
        },
      });
    });

    test("creates CloudWatch log group for function", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::Logs::LogGroup", 1);
    });
  });

  describe("Configuration Options", () => {
    test("supports custom log level", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
        logLevel: LogLevel.DEBUG,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            LOG_LEVEL: "DEBUG",
          },
        },
      });
    });

    test("supports custom KMS encryption key", () => {
      const encryptionKey = new kms.Key(stack, "TestKey");

      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
        encryptionKey,
      });

      const template = Template.fromStack(stack);

      // Verify log group is encrypted
      template.hasResourceProperties("AWS::Logs::LogGroup", {
        KmsKeyId: {
          "Fn::GetAtt": [
            stack.getLogicalId(encryptionKey.node.defaultChild as kms.CfnKey),
            "Arn",
          ],
        },
      });
    });

    test("supports custom log retention", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
        logRetention: logs.RetentionDays.ONE_MONTH,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Logs::LogGroup", {
        RetentionInDays: 30,
      });
    });

    test("supports VPC configuration", () => {
      const vpc = new cdk.aws_ec2.Vpc(stack, "TestVpc");
      const securityGroup = new cdk.aws_ec2.SecurityGroup(stack, "TestSG", {
        vpc,
      });

      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
        vpcConfiguration: {
          vpc,
          securityGroups: [securityGroup],
          vpcSubnets: {
            subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
        },
      });

      const template = Template.fromStack(stack);

      // Verify VPC configuration exists (actual structure may vary)
      template.hasResourceProperties("AWS::Lambda::Function", {
        VpcConfig: {
          SecurityGroupIds: [
            {
              "Fn::GetAtt": [
                stack.getLogicalId(
                  securityGroup.node
                    .defaultChild as cdk.aws_ec2.CfnSecurityGroup,
                ),
                "GroupId",
              ],
            },
          ],
        },
      });
    });
  });

  describe("Interface Implementation", () => {
    test("implements IHitlEnvironment interface correctly", () => {
      const hitlEnv = new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
      });

      // Verify interface property is accessible
      expect(hitlEnv.completeSectionReviewFunction).toBeDefined();
      expect(hitlEnv.completeSectionReviewFunction.functionName).toBeDefined();
    });
  });

  describe("DynamoDB Permissions", () => {
    test("grants read/write permissions to tracking table", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        trackingTable,
      });

      const template = Template.fromStack(stack);

      // Verify IAM policy grants DynamoDB permissions
      // The policy will have multiple statements (SQS, DynamoDB, KMS if applicable)
      // We just need to verify that DynamoDB permissions are present
      const resources = template.findResources("AWS::IAM::Policy");
      const policyStatements = Object.values(resources).flatMap(
        (resource: any) => resource.Properties.PolicyDocument.Statement,
      );

      // Find the DynamoDB statement
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
});
