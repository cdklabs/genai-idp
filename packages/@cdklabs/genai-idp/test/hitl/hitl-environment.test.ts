/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cxapi from "aws-cdk-lib/cx-api";
import { HitlEnvironment } from "../../src/hitl/hitl-environment";
import { LogLevel } from "../../src/log-level";

describe("HitlEnvironment", () => {
  let stack: cdk.Stack;
  let userPool: cognito.IUserPool;
  let userGroup: cognito.CfnUserPoolGroup;
  let outputBucket: s3.IBucket;

  beforeEach(() => {
    const app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");

    // Disable bundling for faster tests
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    // Create mock dependencies
    userPool = cognito.UserPool.fromUserPoolId(
      stack,
      "MockUserPool",
      "us-east-1_mockpool",
    );
    userGroup = new cognito.CfnUserPoolGroup(stack, "MockUserGroup", {
      userPoolId: userPool.userPoolId,
      groupName: "HitlReviewers",
    });
    outputBucket = s3.Bucket.fromBucketName(
      stack,
      "MockBucket",
      "mock-output-bucket",
    );
  });

  describe("Basic Functionality", () => {
    test("creates HITL environment with minimal configuration", () => {
      expect(stack.bundlingRequired).toBe(false);

      const hitlEnv = new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      expect(hitlEnv).toBeDefined();
      expect(hitlEnv.workteam).toBeDefined();
      expect(hitlEnv.userPoolClient).toBeDefined();
      expect(hitlEnv.flowDefinitionRole).toBeDefined();
      expect(hitlEnv.workforcePortalUrl).toBeDefined();
      expect(hitlEnv.labelingConsoleUrl).toBeDefined();
    });

    test("creates Cognito User Pool Client with correct configuration", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Cognito::UserPoolClient", {
        UserPoolId: userPool.userPoolId,
        GenerateSecret: true,
      });
    });

    test("creates SageMaker workteam", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::SageMaker::Workteam", {
        Description: "Private workteam for working on A2I tasks",
        MemberDefinitions: [
          {
            CognitoMemberDefinition: {
              CognitoUserPool: userPool.userPoolId,
              CognitoUserGroup: userGroup.groupName,
              CognitoClientId: Match.anyValue(),
            },
          },
        ],
      });
    });

    test("creates A2I Flow Definition IAM role with correct permissions", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "sagemaker.amazonaws.com",
              },
            },
          ],
        },
        ManagedPolicyArns: [
          {
            "Fn::Join": [
              "",
              [
                "arn:",
                { Ref: "AWS::Partition" },
                ":iam::aws:policy/AmazonSageMakerFullAccess",
              ],
            ],
          },
        ],
      });
    });

    test("creates Lambda functions for HITL operations", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);

      // Should create 3 Lambda functions
      template.resourceCountIs("AWS::Lambda::Function", 3);

      // Verify function names/purposes through their logical IDs
      const resources = template.findResources("AWS::Lambda::Function");
      const functionNames = Object.keys(resources);

      expect(
        functionNames.some((name) => name.includes("CognitoUpdaterFunction")),
      ).toBe(true);
      expect(
        functionNames.some((name) =>
          name.includes("CreateA2IResourcesFunction"),
        ),
      ).toBe(true);
      expect(
        functionNames.some((name) => name.includes("GetWorkforceUrlFunction")),
      ).toBe(true);
    });

    test("creates custom resources for function execution", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::CloudFormation::CustomResource", 3);
    });
  });

  describe("Configuration Options", () => {
    test("supports custom log level", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
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
        userPool,
        userGroup,
        outputBucket,
        encryptionKey,
      });

      const template = Template.fromStack(stack);

      // Verify KMS permissions in A2I Flow Definition role
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "sagemaker.amazonaws.com",
              },
            }),
          ]),
        },
        Policies: Match.arrayWith([
          Match.objectLike({
            PolicyName: "A2IFlowDefinitionAccess",
            PolicyDocument: {
              Statement: Match.arrayWith([
                Match.objectLike({
                  Effect: "Allow",
                  Action: Match.arrayWith([
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    "s3:ListBucket",
                  ]),
                  Resource: Match.anyValue(),
                }),
                Match.objectLike({
                  Effect: "Allow",
                  Action: Match.arrayWith([
                    "kms:Encrypt",
                    "kms:Decrypt",
                    "kms:ReEncrypt*",
                    "kms:GenerateDataKey*",
                    "kms:DescribeKey",
                  ]),
                  Resource: Match.anyValue(),
                }),
              ]),
            },
          }),
        ]),
      });
    });

    test("supports custom log retention", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
        logRetention: logs.RetentionDays.ONE_MONTH,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Logs::LogGroup", {
        RetentionInDays: 30,
      });
    });

    test("supports existing private workforce ARN", () => {
      const existingWorkforceArn =
        "arn:aws:sagemaker:us-east-1:123456789012:workforce/existing-workforce";

      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
        existingPrivateWorkforceArn: existingWorkforceArn,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::CloudFormation::CustomResource", {
        ExistingPrivateWorkforceArn: existingWorkforceArn,
      });
    });

    test("supports VPC configuration", () => {
      const vpc = new cdk.aws_ec2.Vpc(stack, "TestVpc");
      const securityGroup = new cdk.aws_ec2.SecurityGroup(stack, "TestSG", {
        vpc,
      });

      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
        vpcConfiguration: {
          vpc,
          securityGroups: [securityGroup],
          vpcSubnets: {
            subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
          },
        },
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        VpcConfig: {
          SecurityGroupIds: Match.anyValue(),
          SubnetIds: Match.anyValue(),
        },
      });
    });
  });

  describe("Resource Dependencies", () => {
    test("establishes correct dependency chain", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      const resources = template.findResources(
        "AWS::CloudFormation::CustomResource",
      );

      // Verify that custom resources exist (dependency validation happens at CDK level)
      expect(Object.keys(resources)).toHaveLength(3);
    });

    test("creates CloudWatch log groups for all functions", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      template.resourceCountIs("AWS::Logs::LogGroup", 3);
    });
  });

  describe("S3 Bucket Permissions", () => {
    test("grants correct S3 permissions to Flow Definition role", () => {
      new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "sagemaker.amazonaws.com",
              },
            }),
          ]),
        },
        Policies: Match.arrayWith([
          Match.objectLike({
            PolicyName: "A2IFlowDefinitionAccess",
            PolicyDocument: {
              Statement: Match.arrayWith([
                Match.objectLike({
                  Effect: "Allow",
                  Action: Match.arrayWith([
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject",
                    "s3:ListBucket",
                  ]),
                  Resource: Match.anyValue(),
                }),
              ]),
            },
          }),
        ]),
      });
    });
  });

  describe("Interface Implementation", () => {
    test("implements IHitlEnvironment interface correctly", () => {
      const hitlEnv = new HitlEnvironment(stack, "TestHitlEnvironment", {
        userPool,
        userGroup,
        outputBucket,
      });

      // Verify all interface properties are accessible
      expect(hitlEnv.workteam).toBeDefined();
      expect(hitlEnv.userPoolClient).toBeDefined();
      expect(hitlEnv.workforcePortalUrl).toBeDefined();
      expect(hitlEnv.labelingConsoleUrl).toBeDefined();

      // Verify types
      expect(typeof hitlEnv.workforcePortalUrl).toBe("string");
      expect(typeof hitlEnv.labelingConsoleUrl).toBe("string");
    });
  });
});
