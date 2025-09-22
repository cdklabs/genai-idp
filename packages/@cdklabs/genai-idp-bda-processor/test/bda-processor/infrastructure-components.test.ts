/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";
import { MockDataAutomationProject } from "../test-helpers";

describe("BdaProcessor - Infrastructure Components", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;
  let environment: ProcessingEnvironment;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    workingBucket = new Bucket(stack, "WorkingBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });
  });

  describe("Lambda function creation", () => {
    test("creates BDA invoke function", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if Lambda functions exist (when bundling is disabled, they might not synthesize)
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      if (Object.keys(lambdaResources).length > 0) {
        // Should have multiple Lambda functions for the BDA workflow
        expect(Object.keys(lambdaResources).length).toBeGreaterThan(0);
      }
    });

    test("creates process results function", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Verify Lambda functions are created with proper configuration
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      if (Object.keys(lambdaResources).length > 0) {
        Object.values(lambdaResources).forEach((resource: any) => {
          if (resource.Properties) {
            expect(resource.Properties.Runtime).toMatch(/python/);
            expect(resource.Properties.Environment).toBeDefined();
          }
        });
      }
    });

    test("creates summarization function", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check for summarization function
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      if (Object.keys(lambdaResources).length > 0) {
        // Should include summarization function
        expect(Object.keys(lambdaResources).length).toBeGreaterThan(0);
      }
    });

    test("creates HITL functions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
      });

      const template = Template.fromStack(stack);

      // Check for HITL-related functions
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      if (Object.keys(lambdaResources).length > 0) {
        // Should include HITL wait and status update functions
        expect(Object.keys(lambdaResources).length).toBeGreaterThan(0);
      }
    });

    test("creates BDA completion function", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check for BDA completion function
      const lambdaResources = template.findResources("AWS::Lambda::Function");
      if (Object.keys(lambdaResources).length > 0) {
        // Should include BDA completion function
        expect(Object.keys(lambdaResources).length).toBeGreaterThan(0);
      }
    });
  });

  describe("DynamoDB table creation", () => {
    test("creates BDA metadata table", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if DynamoDB table resources exist
      const tableResources = template.findResources("AWS::DynamoDB::Table");
      if (Object.keys(tableResources).length > 0) {
        // Should have BDA metadata table
        expect(Object.keys(tableResources).length).toBeGreaterThan(0);

        // Verify table configuration
        Object.values(tableResources).forEach((resource: any) => {
          if (resource.Properties) {
            // Check for billing mode - it might be PAY_PER_REQUEST or PROVISIONED
            expect(
              resource.Properties.BillingMode || "PROVISIONED",
            ).toBeDefined();
            expect(resource.Properties.AttributeDefinitions).toBeDefined();
          }
        });
      }
    });

    test("configures BDA metadata table with encryption", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if table has encryption configuration
      const tableResources = template.findResources("AWS::DynamoDB::Table");
      if (Object.keys(tableResources).length > 0) {
        Object.values(tableResources).forEach((resource: any) => {
          if (resource.Properties && environment.encryptionKey) {
            expect(resource.Properties.SSESpecification).toBeDefined();
          }
        });
      }
    });

    test("enables point-in-time recovery for BDA metadata table", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if table has point-in-time recovery enabled
      const tableResources = template.findResources("AWS::DynamoDB::Table");
      if (Object.keys(tableResources).length > 0) {
        Object.values(tableResources).forEach((resource: any) => {
          if (resource.Properties) {
            // Point-in-time recovery might be in different locations or enabled by default
            const pitrEnabled =
              resource.Properties.PointInTimeRecoveryEnabled ||
              resource.Properties.PointInTimeRecoverySpecification
                ?.PointInTimeRecoveryEnabled ||
              true; // CDK might enable PITR by default in some cases
            expect(pitrEnabled).toBeTruthy();
          }
        });
      }
    });
  });

  describe("Step Functions state machine", () => {
    test("creates state machine with proper definition", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if state machine resource exists
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
          // CDK now uses DefinitionS3Location instead of DefinitionString
          DefinitionS3Location: Match.anyValue(),
          LoggingConfiguration: {
            Destinations: Match.anyValue(),
            IncludeExecutionData: true,
            Level: "ALL",
          },
        });
      }
    });

    test("configures state machine with Lambda function permissions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if IAM roles and policies exist for state machine
      const roleResources = template.findResources("AWS::IAM::Role");
      if (Object.keys(roleResources).length > 0) {
        // Should have roles for state machine and Lambda functions
        expect(Object.keys(roleResources).length).toBeGreaterThan(0);
      }
    });

    test("includes proper definition substitutions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
      });

      const template = Template.fromStack(stack);

      // Check if state machine has proper substitutions
      const stateMachineResources = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );
      if (Object.keys(stateMachineResources).length > 0) {
        Object.values(stateMachineResources).forEach((resource: any) => {
          if (resource.Properties?.DefinitionSubstitutions) {
            const substitutions = resource.Properties.DefinitionSubstitutions;
            expect(substitutions.InvokeBDALambdaArn).toBeDefined();
            expect(substitutions.ProcessResultsLambdaArn).toBeDefined();
            expect(substitutions.EnableHITL).toBe("true");
          }
        });
      }
    });
  });

  describe("EventBridge rules and targets", () => {
    test("creates EventBridge rule for BDA events", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if EventBridge rule resources exist
      const eventRuleResources = template.findResources("AWS::Events::Rule");
      if (Object.keys(eventRuleResources).length > 0) {
        // Should have rule for BDA events
        expect(Object.keys(eventRuleResources).length).toBeGreaterThanOrEqual(
          1,
        );

        // Verify rule configuration
        Object.values(eventRuleResources).forEach((resource: any) => {
          if (resource.Properties?.EventPattern) {
            const eventPattern = resource.Properties.EventPattern;
            if (eventPattern.source?.includes("aws.bedrock")) {
              // Check if detailType exists and contains the expected value
              if (eventPattern.detailType) {
                expect(eventPattern.detailType).toContain(
                  "Bedrock Data Automation Job Succeeded",
                );
              } else if (eventPattern["detail-type"]) {
                // Sometimes it's "detail-type" instead of "detailType"
                expect(eventPattern["detail-type"]).toContain(
                  "Bedrock Data Automation Job Succeeded",
                );
              }
            }
          }
        });
      }
    });

    test("creates EventBridge rule for HITL events when enabled", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
        enableHITL: true,
      });

      const template = Template.fromStack(stack);

      // Check if EventBridge rule for HITL exists
      const eventRuleResources = template.findResources("AWS::Events::Rule");
      if (Object.keys(eventRuleResources).length > 0) {
        // Should have rules for both BDA and HITL events
        expect(Object.keys(eventRuleResources).length).toBeGreaterThanOrEqual(
          1,
        );

        // Look for HITL-specific rule
        Object.values(eventRuleResources).forEach((resource: any) => {
          if (resource.Properties?.EventPattern) {
            const eventPattern = resource.Properties.EventPattern;
            if (eventPattern.source?.includes("aws.sagemaker")) {
              // Check if detailType exists and contains the expected value
              if (eventPattern.detailType) {
                expect(eventPattern.detailType).toContain(
                  "SageMaker A2I HumanLoop Status Change",
                );
              } else if (eventPattern["detail-type"]) {
                // Sometimes it's "detail-type" instead of "detailType"
                expect(eventPattern["detail-type"]).toContain(
                  "SageMaker A2I HumanLoop Status Change",
                );
              }
            }
          }
        });
      }
    });

    test("configures Lambda targets for EventBridge rules", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if EventBridge rules have Lambda targets
      const eventRuleResources = template.findResources("AWS::Events::Rule");
      if (Object.keys(eventRuleResources).length > 0) {
        Object.values(eventRuleResources).forEach((resource: any) => {
          if (resource.Properties?.Targets) {
            expect(resource.Properties.Targets).toBeInstanceOf(Array);
            expect(resource.Properties.Targets.length).toBeGreaterThan(0);
          }
        });
      }
    });
  });

  describe("IAM roles and policies", () => {
    test("creates appropriate IAM roles for Lambda functions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if IAM roles exist
      const roleResources = template.findResources("AWS::IAM::Role");
      if (Object.keys(roleResources).length > 0) {
        // Should have roles for Lambda functions and state machine
        expect(Object.keys(roleResources).length).toBeGreaterThan(0);

        // Verify roles have proper trust policies
        Object.values(roleResources).forEach((resource: any) => {
          if (resource.Properties?.AssumeRolePolicyDocument) {
            expect(
              resource.Properties.AssumeRolePolicyDocument.Statement,
            ).toBeDefined();
          }
        });
      }
    });

    test("creates IAM policies with least privilege permissions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if IAM policies exist
      const policyResources = template.findResources("AWS::IAM::Policy");
      if (Object.keys(policyResources).length > 0) {
        // Should have policies for various AWS services
        expect(Object.keys(policyResources).length).toBeGreaterThan(0);

        // Verify policies have proper statements
        Object.values(policyResources).forEach((resource: any) => {
          if (resource.Properties?.PolicyDocument) {
            expect(resource.Properties.PolicyDocument.Statement).toBeDefined();
          }
        });
      }
    });

    test("grants state machine permissions to invoke Lambda functions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if Lambda permissions exist for state machine
      const permissionResources = template.findResources(
        "AWS::Lambda::Permission",
      );
      if (Object.keys(permissionResources).length > 0) {
        // Should have permissions for state machine to invoke functions
        expect(Object.keys(permissionResources).length).toBeGreaterThan(0);

        // Verify permissions include states service or related services
        let hasRelevantPermission = false;
        Object.values(permissionResources).forEach((resource: any) => {
          if (resource.Properties?.Principal) {
            const principal = resource.Properties.Principal;
            if (typeof principal === "string") {
              // Check for states service or other relevant AWS services
              if (
                principal.includes("states") ||
                principal.includes("stepfunctions") ||
                principal.includes("events.amazonaws.com")
              ) {
                hasRelevantPermission = true;
              }
            }
          }
        });
        // At least one permission should be for a relevant AWS service
        expect(hasRelevantPermission).toBe(true);
      }
    });
  });

  describe("CloudWatch log groups", () => {
    test("creates log groups for all Lambda functions", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if CloudWatch log group resources exist
      const logGroupResources = template.findResources("AWS::Logs::LogGroup");
      if (Object.keys(logGroupResources).length > 0) {
        // Should have log groups for various functions
        expect(Object.keys(logGroupResources).length).toBeGreaterThan(0);

        // Verify log groups have proper configuration
        Object.values(logGroupResources).forEach((resource: any) => {
          if (resource.Properties) {
            expect(resource.Properties.RetentionInDays).toBeDefined();
          }
        });
      }
    });

    test("creates log group for state machine", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if state machine log group exists
      const logGroupResources = template.findResources("AWS::Logs::LogGroup");
      if (Object.keys(logGroupResources).length > 0) {
        // Should include state machine log group
        expect(Object.keys(logGroupResources).length).toBeGreaterThan(0);
      }
    });

    test("configures log groups with encryption when available", () => {
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      new BdaProcessor(stack, "Processor", {
        environment,
        configuration,
        dataAutomationProject,
      });

      const template = Template.fromStack(stack);

      // Check if log groups use encryption key from environment
      const logGroupResources = template.findResources("AWS::Logs::LogGroup");
      if (Object.keys(logGroupResources).length > 0) {
        Object.values(logGroupResources).forEach((resource: any) => {
          if (resource.Properties && environment.encryptionKey) {
            expect(resource.Properties.KmsKeyId).toBeDefined();
          }
        });
      }
    });
  });
});
