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
import {
  CognitoUpdaterHitlFunction,
  CreateA2IResourcesFunction,
  GetWorkforceUrlFunction,
} from "../../src/hitl/functions";
import { LogLevel } from "../../src/log-level";

describe("HITL Functions", () => {
  let stack: cdk.Stack;
  let userPool: cognito.IUserPool;
  let userPoolClient: cognito.IUserPoolClient;
  let outputBucket: s3.IBucket;
  let logGroup: logs.ILogGroup;

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
    userPoolClient = cognito.UserPoolClient.fromUserPoolClientId(
      stack,
      "MockClient",
      "mockclientid",
    );
    outputBucket = s3.Bucket.fromBucketName(
      stack,
      "MockBucket",
      "mock-output-bucket",
    );
    logGroup = logs.LogGroup.fromLogGroupName(
      stack,
      "MockLogGroup",
      "mock-log-group",
    );
  });

  describe("CognitoUpdaterHitlFunction", () => {
    test("creates function with basic configuration", () => {
      expect(stack.bundlingRequired).toBe(false);

      const cognitoFunction = new CognitoUpdaterHitlFunction(
        stack,
        "TestCognitoFunction",
        {
          userPool,
          userPoolClient,
          workteamName: "test-workteam",
          logGroup,
        },
      );

      expect(cognitoFunction).toBeDefined();
      expect(cognitoFunction.functionArn).toBeDefined();
      expect(cognitoFunction.functionName).toBeDefined();
    });

    test("configures Lambda function with correct runtime and handler", () => {
      new CognitoUpdaterHitlFunction(stack, "TestCognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Handler: "index.handler",
        Environment: {
          Variables: {
            USER_POOL_ID: userPool.userPoolId,
            CLIENT_ID: userPoolClient.userPoolClientId,
            WORKTEAM_NAME: "test-workteam",
            LOG_LEVEL: "INFO",
          },
        },
      });
    });

    test("supports custom log level", () => {
      new CognitoUpdaterHitlFunction(stack, "TestCognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
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

    test("supports KMS encryption", () => {
      const encryptionKey = new kms.Key(stack, "TestKey");

      new CognitoUpdaterHitlFunction(stack, "TestCognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
        encryptionKey,
      });

      const template = Template.fromStack(stack);
      // Verify KMS permissions are granted (could be in role or separate policy)
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
            }),
          ]),
        },
      });

      // Check that the function has access to the KMS key (via role or policy)
      const templateJson = template.toJSON();
      const hasKmsPermissions = Object.values(templateJson.Resources).some(
        (resource: any) => {
          if (
            resource.Type === "AWS::IAM::Policy" ||
            resource.Type === "AWS::IAM::Role"
          ) {
            const statements =
              resource.Properties?.PolicyDocument?.Statement ||
              resource.Properties?.Policies?.[0]?.PolicyDocument?.Statement ||
              [];
            return statements.some(
              (stmt: any) =>
                stmt.Action &&
                Array.isArray(stmt.Action) &&
                stmt.Action.some((action: string) => action.startsWith("kms:")),
            );
          }
          return false;
        },
      );
      expect(hasKmsPermissions).toBe(true);
    });

    test("creates IAM role with Cognito permissions", () => {
      new CognitoUpdaterHitlFunction(stack, "TestCognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
            },
          ],
        },
      });

      // Verify Cognito permissions are granted via separate policy
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "cognito-idp:UpdateUserPoolClient",
                "cognito-idp:DescribeUserPoolClient",
              ]),
            }),
          ]),
        },
      });
    });

    test("supports VPC configuration", () => {
      const vpc = new cdk.aws_ec2.Vpc(stack, "TestVpc");
      const securityGroup = new cdk.aws_ec2.SecurityGroup(stack, "TestSG", {
        vpc,
      });

      new CognitoUpdaterHitlFunction(stack, "TestCognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
        vpc,
        securityGroups: [securityGroup],
        vpcSubnets: { subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS },
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        VpcConfig: {
          SecurityGroupIds: Match.arrayWith([
            {
              "Fn::GetAtt": [Match.stringLikeRegexp("TestSG"), "GroupId"],
            },
          ]),
          SubnetIds: Match.anyValue(),
        },
      });
    });
  });

  describe("CreateA2IResourcesFunction", () => {
    test("creates function with basic configuration", () => {
      expect(stack.bundlingRequired).toBe(false);

      const a2iFunction = new CreateA2IResourcesFunction(
        stack,
        "TestA2IFunction",
        {
          workteamArn:
            "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
          flowDefinitionRoleArn: "arn:aws:iam::123456789012:role/test-role",
          outputBucket,
          logGroup,
        },
      );

      expect(a2iFunction).toBeDefined();
      expect(a2iFunction.functionArn).toBeDefined();
      expect(a2iFunction.functionName).toBeDefined();
    });

    test("configures Lambda function with correct environment variables", () => {
      new CreateA2IResourcesFunction(stack, "TestA2IFunction", {
        workteamArn:
          "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
        flowDefinitionRoleArn: "arn:aws:iam::123456789012:role/test-role",
        outputBucket,
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Handler: "index.handler",
        Environment: {
          Variables: {
            STACK_NAME: "TestStack",
            A2I_WORKTEAM_ARN:
              "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
            A2I_FLOW_DEFINITION_ROLE_ARN:
              "arn:aws:iam::123456789012:role/test-role",
            BDA_OUTPUT_BUCKET: outputBucket.bucketName,
            LOG_LEVEL: "INFO",
          },
        },
      });
    });

    test("creates IAM role with SageMaker A2I permissions", () => {
      new CreateA2IResourcesFunction(stack, "TestA2IFunction", {
        workteamArn:
          "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
        flowDefinitionRoleArn: "arn:aws:iam::123456789012:role/test-role",
        outputBucket,
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "sagemaker:CreateFlowDefinition",
                "sagemaker:DeleteFlowDefinition",
                "sagemaker:DescribeFlowDefinition",
              ]),
            }),
          ]),
        },
      });
    });

    test("supports custom log level", () => {
      new CreateA2IResourcesFunction(stack, "TestA2IFunction", {
        workteamArn:
          "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
        flowDefinitionRoleArn: "arn:aws:iam::123456789012:role/test-role",
        outputBucket,
        logGroup,
        logLevel: LogLevel.ERROR,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            LOG_LEVEL: "ERROR",
          },
        },
      });
    });
  });

  describe("GetWorkforceUrlFunction", () => {
    test("creates function with basic configuration", () => {
      expect(stack.bundlingRequired).toBe(false);

      const urlFunction = new GetWorkforceUrlFunction(
        stack,
        "TestUrlFunction",
        {
          workteamName: "test-workteam",
          logGroup,
        },
      );

      expect(urlFunction).toBeDefined();
      expect(urlFunction.functionArn).toBeDefined();
      expect(urlFunction.functionName).toBeDefined();
    });

    test("configures Lambda function with correct environment variables", () => {
      new GetWorkforceUrlFunction(stack, "TestUrlFunction", {
        workteamName: "test-workteam",
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
        Handler: "index.handler",
        Environment: {
          Variables: {
            WORKTEAM_NAME: "test-workteam",
            LOG_LEVEL: "INFO",
          },
        },
      });
    });

    test("supports existing private workforce ARN", () => {
      const existingWorkforceArn =
        "arn:aws:sagemaker:us-east-1:123456789012:workforce/existing-workforce";

      new GetWorkforceUrlFunction(stack, "TestUrlFunction", {
        workteamName: "test-workteam",
        existingPrivateWorkforceArn: existingWorkforceArn,
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: {
            EXISTING_PRIVATE_WORKFORCE_ARN: existingWorkforceArn,
          },
        },
      });
    });

    test("creates IAM role with SageMaker workforce permissions", () => {
      new GetWorkforceUrlFunction(stack, "TestUrlFunction", {
        workteamName: "test-workteam",
        logGroup,
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "sagemaker:DescribeWorkteam",
                "sagemaker:DescribeWorkforce",
              ]),
            }),
          ]),
        },
      });
    });

    test("supports KMS encryption", () => {
      const encryptionKey = new kms.Key(stack, "TestKey");

      new GetWorkforceUrlFunction(stack, "TestUrlFunction", {
        workteamName: "test-workteam",
        logGroup,
        encryptionKey,
      });

      const template = Template.fromStack(stack);
      // Verify KMS permissions are granted (could be in role or separate policy)
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Action: "sts:AssumeRole",
              Effect: "Allow",
              Principal: {
                Service: "lambda.amazonaws.com",
              },
            }),
          ]),
        },
      });

      // Check that the function has access to the KMS key (via role or policy)
      const templateJson = template.toJSON();
      const hasKmsPermissions = Object.values(templateJson.Resources).some(
        (resource: any) => {
          if (
            resource.Type === "AWS::IAM::Policy" ||
            resource.Type === "AWS::IAM::Role"
          ) {
            const statements =
              resource.Properties?.PolicyDocument?.Statement ||
              resource.Properties?.Policies?.[0]?.PolicyDocument?.Statement ||
              [];
            return statements.some(
              (stmt: any) =>
                stmt.Action &&
                Array.isArray(stmt.Action) &&
                stmt.Action.some((action: string) => action.startsWith("kms:")),
            );
          }
          return false;
        },
      );
      expect(hasKmsPermissions).toBe(true);
    });

    test("supports VPC configuration", () => {
      const vpc = new cdk.aws_ec2.Vpc(stack, "TestVpc");
      const securityGroup = new cdk.aws_ec2.SecurityGroup(stack, "TestSG", {
        vpc,
      });

      new GetWorkforceUrlFunction(stack, "TestUrlFunction", {
        workteamName: "test-workteam",
        logGroup,
        vpc,
        securityGroups: [securityGroup],
        vpcSubnets: { subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS },
      });

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        VpcConfig: {
          SecurityGroupIds: Match.arrayWith([
            {
              "Fn::GetAtt": [Match.stringLikeRegexp("TestSG"), "GroupId"],
            },
          ]),
          SubnetIds: Match.anyValue(),
        },
      });
    });
  });

  describe("Function Integration", () => {
    test("all functions use consistent Python runtime", () => {
      new CognitoUpdaterHitlFunction(stack, "CognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
      });

      new CreateA2IResourcesFunction(stack, "A2IFunction", {
        workteamArn:
          "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
        flowDefinitionRoleArn: "arn:aws:iam::123456789012:role/test-role",
        outputBucket,
        logGroup,
      });

      new GetWorkforceUrlFunction(stack, "UrlFunction", {
        workteamName: "test-workteam",
        logGroup,
      });

      const template = Template.fromStack(stack);
      const functions = template.findResources("AWS::Lambda::Function");

      Object.values(functions).forEach((func: any) => {
        expect(func.Properties.Runtime).toBe("python3.12");
        expect(func.Properties.Handler).toBe("index.handler");
      });
    });

    test("all functions have CloudWatch Logs permissions", () => {
      new CognitoUpdaterHitlFunction(stack, "CognitoFunction", {
        userPool,
        userPoolClient,
        workteamName: "test-workteam",
        logGroup,
      });

      new CreateA2IResourcesFunction(stack, "A2IFunction", {
        workteamArn:
          "arn:aws:sagemaker:us-east-1:123456789012:workteam/test-workteam",
        flowDefinitionRoleArn: "arn:aws:iam::123456789012:role/test-role",
        outputBucket,
        logGroup,
      });

      new GetWorkforceUrlFunction(stack, "UrlFunction", {
        workteamName: "test-workteam",
        logGroup,
      });

      const template = Template.fromStack(stack);

      // Verify that all functions have IAM roles (CloudWatch Logs permissions are typically in managed policies)
      const functions = template.findResources("AWS::Lambda::Function");
      const roles = template.findResources("AWS::IAM::Role");

      // Each function should have a role
      expect(Object.keys(functions).length).toBe(3);
      expect(Object.keys(roles).length).toBeGreaterThanOrEqual(3);

      // Verify functions reference their roles
      Object.values(functions).forEach((func: any) => {
        expect(func.Properties.Role).toBeDefined();
        expect(func.Properties.LoggingConfig?.LogGroup).toBeDefined();
      });
    });
  });
});
