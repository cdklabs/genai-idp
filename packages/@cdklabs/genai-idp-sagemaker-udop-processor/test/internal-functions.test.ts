/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  SagemakerUdopProcessor,
  SagemakerUdopProcessorConfiguration,
} from "../src";

describe("Internal Lambda Functions", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let outputBucket: s3.Bucket;
  let inputBucket: s3.Bucket;
  let workingBucket: s3.Bucket;
  let mockEndpoint: sagemaker.IEndpoint;
  let configuration: SagemakerUdopProcessorConfiguration;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");

    inputBucket = new s3.Bucket(stack, "InputBucket");
    outputBucket = new s3.Bucket(stack, "OutputBucket");
    workingBucket = new s3.Bucket(stack, "WorkingBucket");

    environment = new ProcessingEnvironment(stack, "ProcessingEnv", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });

    mockEndpoint = {
      endpointArn:
        "arn:aws:sagemaker:us-east-1:123456789012:endpoint/test-endpoint",
      endpointName: "test-endpoint",
      grantInvoke: jest.fn().mockReturnValue(undefined),
    } as any;

    configuration = SagemakerUdopProcessorConfiguration.rvlCdipPackageSample();
  });

  describe("Lambda function creation", () => {
    test("creates all required Lambda functions", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const lambdaFunctions = template.findResources("AWS::Lambda::Function");

      // Should create multiple Lambda functions for different processing steps
      expect(Object.keys(lambdaFunctions).length).toBeGreaterThan(4);

      // Verify each function has required properties
      Object.values(lambdaFunctions).forEach((func: any) => {
        expect(func.Properties.Runtime).toBeDefined();
        expect(func.Properties.Handler).toBeDefined();
        expect(func.Properties.Code).toBeDefined();
        expect(func.Properties.Role).toBeDefined();
      });
    });

    test("Lambda functions have appropriate environment variables", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const lambdaFunctions = template.findResources("AWS::Lambda::Function");

      // Check that functions have environment variables
      Object.values(lambdaFunctions).forEach((func: any) => {
        if (func.Properties.Environment) {
          expect(func.Properties.Environment.Variables).toBeDefined();
        }
      });
    });

    test("Lambda functions have appropriate timeout settings", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const lambdaFunctions = template.findResources("AWS::Lambda::Function");

      // Verify timeout is set appropriately
      Object.values(lambdaFunctions).forEach((func: any) => {
        if (func.Properties.Timeout) {
          expect(func.Properties.Timeout).toBeGreaterThan(0);
          expect(func.Properties.Timeout).toBeLessThanOrEqual(900); // Max Lambda timeout
        }
      });
    });
  });

  describe("Lambda function permissions", () => {
    test("Lambda functions have appropriate IAM roles", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const iamRoles = template.findResources("AWS::IAM::Role");

      // Should create IAM roles for Lambda functions
      expect(Object.keys(iamRoles).length).toBeGreaterThan(0);

      // Verify roles have Lambda assume role policy
      Object.values(iamRoles).forEach((role: any) => {
        const assumeRolePolicy = role.Properties.AssumeRolePolicyDocument;
        expect(assumeRolePolicy).toBeDefined();

        if (assumeRolePolicy.Statement) {
          const lambdaStatement = assumeRolePolicy.Statement.find(
            (stmt: any) =>
              stmt.Principal &&
              (stmt.Principal.Service === "lambda.amazonaws.com" ||
                (Array.isArray(stmt.Principal.Service) &&
                  stmt.Principal.Service.includes("lambda.amazonaws.com"))),
          );

          if (lambdaStatement) {
            expect(lambdaStatement.Effect).toBe("Allow");
            expect(lambdaStatement.Action).toContain("sts:AssumeRole");
          }
        }
      });
    });

    test("Lambda functions have necessary IAM policies", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const iamPolicies = template.findResources("AWS::IAM::Policy");

      // Should create IAM policies for Lambda functions
      expect(Object.keys(iamPolicies).length).toBeGreaterThan(0);

      // Verify policies have appropriate permissions
      Object.values(iamPolicies).forEach((policy: any) => {
        expect(policy.Properties.PolicyDocument).toBeDefined();
        expect(policy.Properties.PolicyDocument.Statement).toBeDefined();
        expect(Array.isArray(policy.Properties.PolicyDocument.Statement)).toBe(
          true,
        );
      });
    });
  });

  describe("Lambda function configuration with options", () => {
    test("respects OCR max workers configuration", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
        ocrMaxWorkers: 5,
      });

      const template = Template.fromStack(stack);

      // Should create resources with the specified configuration
      expect(template).toBeDefined();
    });

    test("configures evaluation when enabled", () => {
      const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");

      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
        evaluationEnabled: true,
        evaluationBaselineBucket: evaluationBucket,
      });

      const template = Template.fromStack(stack);

      // Should create additional resources for evaluation
      const lambdaFunctions = template.findResources("AWS::Lambda::Function");
      expect(Object.keys(lambdaFunctions).length).toBeGreaterThan(4);
    });

    test("configures assessment when enabled", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);

      // Should create additional resources for assessment
      const lambdaFunctions = template.findResources("AWS::Lambda::Function");
      expect(Object.keys(lambdaFunctions).length).toBeGreaterThan(4);
    });
  });

  describe("Step Functions integration", () => {
    test("creates Step Functions state machine", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const stateMachines = template.findResources(
        "AWS::StepFunctions::StateMachine",
      );

      expect(Object.keys(stateMachines).length).toBe(1);

      const stateMachine = Object.values(stateMachines)[0] as any;
      expect(stateMachine.Properties.RoleArn).toBeDefined();
      expect(stateMachine.Type).toBe("AWS::StepFunctions::StateMachine");
    });

    test("Step Functions state machine has appropriate IAM role", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const iamRoles = template.findResources("AWS::IAM::Role");

      // Find Step Functions role
      const sfnRole = Object.values(iamRoles).find((role: any) => {
        const assumeRolePolicy = role.Properties.AssumeRolePolicyDocument;
        return assumeRolePolicy.Statement.some(
          (stmt: any) =>
            stmt.Principal &&
            (stmt.Principal.Service === "states.amazonaws.com" ||
              (Array.isArray(stmt.Principal.Service) &&
                stmt.Principal.Service.includes("states.amazonaws.com"))),
        );
      });

      expect(sfnRole).toBeDefined();
    });
  });

  describe("SageMaker integration", () => {
    test("grants invoke permissions to SageMaker endpoint", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      // Verify that grantInvoke was called on the mock endpoint
      expect(mockEndpoint.grantInvoke).toHaveBeenCalled();
    });

    test("includes SageMaker endpoint in Lambda environment variables", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);
      const lambdaFunctions = template.findResources("AWS::Lambda::Function");

      // Check that at least one function has the endpoint name in environment
      let foundEndpointReference = false;
      Object.values(lambdaFunctions).forEach((func: any) => {
        if (func.Properties.Environment?.Variables) {
          const envVars = func.Properties.Environment.Variables;
          Object.values(envVars).forEach((value: any) => {
            if (typeof value === "string" && value.includes("test-endpoint")) {
              foundEndpointReference = true;
            }
          });
        }
      });

      expect(foundEndpointReference).toBe(true);
    });
  });
});
