/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  SagemakerUdopProcessor,
  BasicSagemakerClassifier,
  SagemakerClassifier, // Backward compatibility alias
  SagemakerUdopProcessorConfiguration,
} from "../src";

describe("SagemakerUdopProcessor", () => {
  let app: App;
  let stack: Stack;
  let environment: ProcessingEnvironment;
  let outputBucket: s3.Bucket;
  let inputBucket: s3.Bucket;
  let workingBucket: s3.Bucket;
  let mockEndpoint: sagemaker.IEndpoint;
  let configuration: SagemakerUdopProcessorConfiguration;

  beforeEach(() => {
    // Create app with bundling disabled for unit tests
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");

    // Create test resources
    inputBucket = new s3.Bucket(stack, "InputBucket");
    outputBucket = new s3.Bucket(stack, "OutputBucket");
    workingBucket = new s3.Bucket(stack, "WorkingBucket");

    environment = new ProcessingEnvironment(stack, "ProcessingEnv", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });

    // Create mock SageMaker endpoint
    mockEndpoint = {
      endpointArn:
        "arn:aws:sagemaker:us-east-1:123456789012:endpoint/test-endpoint",
      endpointName: "test-endpoint",
      grantInvoke: jest.fn().mockReturnValue(undefined),
    } as any;

    // Create test configuration using static method
    configuration = SagemakerUdopProcessorConfiguration.rvlCdipPackageSample();
  });

  describe("constructor", () => {
    test("creates processor with minimal required props", () => {
      const processor = new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      expect(processor).toBeDefined();
      expect(processor.node.id).toBe("TestProcessor");
    });

    test("creates processor with all optional props", () => {
      const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");
      const guardrail = new bedrock.Guardrail(stack, "TestGuardrail", {
        name: "test-guardrail",
        blockedInputMessaging: "Blocked input",
        blockedOutputsMessaging: "Blocked output",
      });

      const processor = new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
        ocrMaxWorkers: 10,
        evaluationEnabled: true,
        evaluationBaselineBucket: evaluationBucket,
        extractionGuardrail: guardrail,
        classificationGuardrail: guardrail,
        summarizationGuardrail: guardrail,
        assessmentGuardrail: guardrail,
      });

      expect(processor).toBeDefined();
      expect(processor.node.id).toBe("TestProcessor");
    });
  });

  describe("template synthesis", () => {
    test("synthesizes correct resources with minimal configuration", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);

      // Check for Step Function state machine
      template.hasResourceProperties(
        "AWS::StepFunctions::StateMachine",
        Match.objectLike({
          RoleArn: Match.anyValue(),
        }),
      );

      // Check for Lambda functions
      template.hasResourceProperties(
        "AWS::Lambda::Function",
        Match.objectLike({
          Runtime: Match.anyValue(),
          Handler: Match.anyValue(),
        }),
      );

      // Check for IAM roles
      template.hasResourceProperties(
        "AWS::IAM::Role",
        Match.objectLike({
          AssumeRolePolicyDocument: Match.anyValue(),
        }),
      );

      // Resource count assertions
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
      template.resourceCountIs("AWS::Lambda::Function", 12); // Includes ProcessingEnvironment functions
      template.resourceCountIs("AWS::IAM::Role", 13); // Roles for all Lambda functions and Step Functions
      template.resourceCountIs("AWS::IAM::Policy", 13); // Policies for all functions
      template.resourceCountIs("AWS::SQS::Queue", 4); // DLQ and main queues from environment
      template.resourceCountIs("AWS::S3::Bucket", 3); // Input, output, working buckets from environment
      template.resourceCountIs("AWS::DynamoDB::Table", 3); // Tables from ProcessingEnvironment
    });

    test("synthesizes with evaluation enabled", () => {
      const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");

      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
        evaluationEnabled: true,
        evaluationBaselineBucket: evaluationBucket,
      });

      const template = Template.fromStack(stack);

      // Should have additional resources for evaluation
      template.hasResourceProperties(
        "AWS::StepFunctions::StateMachine",
        Match.objectLike({
          RoleArn: Match.anyValue(),
        }),
      );

      // Resource count assertions with evaluation enabled
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
      template.resourceCountIs("AWS::Lambda::Function", 12); // Same as base - evaluation doesn't add functions
      template.resourceCountIs("AWS::IAM::Role", 13); // Same as base
      template.resourceCountIs("AWS::S3::Bucket", 4); // Including evaluation bucket
    });

    test("synthesizes with assessment enabled", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      const template = Template.fromStack(stack);

      // Should have resources for assessment
      template.hasResourceProperties(
        "AWS::StepFunctions::StateMachine",
        Match.objectLike({
          RoleArn: Match.anyValue(),
        }),
      );

      // Resource count assertions with assessment enabled
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
      template.resourceCountIs("AWS::Lambda::Function", 12); // Same as base - assessment doesn't add functions
      template.resourceCountIs("AWS::IAM::Role", 13); // Same as base
      template.resourceCountIs("AWS::S3::Bucket", 3); // Base buckets from environment
    });

    test("validates complete resource counts with all features enabled", () => {
      const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");
      const guardrail = new bedrock.Guardrail(stack, "TestGuardrail", {
        name: "test-guardrail",
        blockedInputMessaging: "Blocked input",
        blockedOutputsMessaging: "Blocked output",
      });

      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
        ocrMaxWorkers: 10,
        evaluationEnabled: true,
        evaluationBaselineBucket: evaluationBucket,
        extractionGuardrail: guardrail,
        classificationGuardrail: guardrail,
        summarizationGuardrail: guardrail,
        assessmentGuardrail: guardrail,
      });

      const template = Template.fromStack(stack);

      // Comprehensive resource count validation
      template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
      template.resourceCountIs("AWS::Lambda::Function", 12); // All functions from processor and environment
      template.resourceCountIs("AWS::IAM::Role", 13); // All roles including additional features
      template.resourceCountIs("AWS::IAM::Policy", 13); // Policies for all Lambda functions
      template.resourceCountIs("AWS::SQS::Queue", 4); // DLQ and main queues from environment
      template.resourceCountIs("AWS::S3::Bucket", 4); // Input, output, working, evaluation buckets
      template.resourceCountIs("AWS::Bedrock::Guardrail", 1); // Shared guardrail
      template.resourceCountIs("AWS::DynamoDB::Table", 3); // Tables from ProcessingEnvironment
    });
  });

  describe("properties", () => {
    test("exposes correct properties", () => {
      const processor = new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      expect(processor.stateMachine).toBeDefined();
      expect(processor.stateMachine.stateMachineArn).toBeDefined();
    });
  });

  describe("permissions", () => {
    test("grants correct permissions to SageMaker endpoint", () => {
      new SagemakerUdopProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classifierEndpoint: mockEndpoint,
      });

      // Verify that grantInvoke was called on the endpoint
      expect(mockEndpoint.grantInvoke).toHaveBeenCalled();
    });
  });

  describe("configuration validation", () => {
    test("accepts valid configuration", () => {
      const validConfig =
        SagemakerUdopProcessorConfiguration.rvlCdipPackageSample();

      expect(() => {
        new SagemakerUdopProcessor(stack, "TestProcessor", {
          environment,
          configuration: validConfig,
          classifierEndpoint: mockEndpoint,
        });
      }).not.toThrow();
    });
  });

  describe("backward compatibility", () => {
    test("SagemakerClassifier alias exists", () => {
      expect(SagemakerClassifier).toBeDefined();
      expect(SagemakerClassifier).toBe(BasicSagemakerClassifier);
    });
  });
});

describe("BasicSagemakerClassifier", () => {
  let app: App;
  let stack: Stack;
  let outputBucket: s3.Bucket;
  let modelData: sagemaker.ModelData;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");
    outputBucket = new s3.Bucket(stack, "OutputBucket");
    modelData = sagemaker.ModelData.fromBucket(outputBucket, "model.tar.gz");
  });

  describe("constructor", () => {
    test("creates classifier with minimal props", () => {
      const classifier = new BasicSagemakerClassifier(stack, "TestClassifier", {
        outputBucket,
        modelData,
        instanceType: sagemaker.InstanceType.M5_LARGE,
      });

      expect(classifier).toBeDefined();
      expect(classifier.endpoint).toBeDefined();
    });

    test("creates classifier with all props", () => {
      const key = new kms.Key(stack, "TestKey");

      const classifier = new BasicSagemakerClassifier(stack, "TestClassifier", {
        key,
        outputBucket,
        modelData,
        instanceType: sagemaker.InstanceType.M5_LARGE,
      });

      expect(classifier).toBeDefined();
      expect(classifier.endpoint).toBeDefined();
    });
  });

  describe("template synthesis", () => {
    test("synthesizes correct SageMaker resources", () => {
      new BasicSagemakerClassifier(stack, "TestClassifier", {
        outputBucket,
        modelData,
        instanceType: sagemaker.InstanceType.M5_LARGE,
      });

      const template = Template.fromStack(stack);

      // Check for SageMaker model
      template.hasResourceProperties(
        "AWS::SageMaker::Model",
        Match.objectLike({
          ExecutionRoleArn: Match.anyValue(),
        }),
      );

      // Check for SageMaker endpoint configuration
      template.hasResourceProperties(
        "AWS::SageMaker::EndpointConfig",
        Match.objectLike({
          ProductionVariants: Match.arrayWith([
            Match.objectLike({
              InstanceType: "ml.m5.large",
            }),
          ]),
        }),
      );

      // Check for SageMaker endpoint
      template.hasResourceProperties(
        "AWS::SageMaker::Endpoint",
        Match.objectLike({
          EndpointConfigName: Match.anyValue(),
        }),
      );

      // Resource count assertions for SageMaker classifier
      template.resourceCountIs("AWS::SageMaker::Model", 1);
      template.resourceCountIs("AWS::SageMaker::EndpointConfig", 1);
      template.resourceCountIs("AWS::SageMaker::Endpoint", 1);
      template.resourceCountIs("AWS::IAM::Role", 1); // Execution role for SageMaker
      template.resourceCountIs("AWS::S3::Bucket", 1); // Output bucket
    });

    test("synthesizes with KMS encryption", () => {
      const key = new kms.Key(stack, "TestKey");

      new BasicSagemakerClassifier(stack, "TestClassifier", {
        key,
        outputBucket,
        modelData,
        instanceType: sagemaker.InstanceType.M5_LARGE,
      });

      const template = Template.fromStack(stack);

      // Should have KMS key in the stack
      template.hasResourceProperties(
        "AWS::KMS::Key",
        Match.objectLike({
          KeyPolicy: Match.anyValue(),
        }),
      );

      // Resource count assertions with KMS encryption
      template.resourceCountIs("AWS::SageMaker::Model", 1);
      template.resourceCountIs("AWS::SageMaker::EndpointConfig", 1);
      template.resourceCountIs("AWS::SageMaker::Endpoint", 1);
      template.resourceCountIs("AWS::IAM::Role", 1);
      template.resourceCountIs("AWS::KMS::Key", 1);
      template.resourceCountIs("AWS::S3::Bucket", 1);
    });
  });

  describe("properties", () => {
    test("exposes endpoint property", () => {
      const classifier = new BasicSagemakerClassifier(stack, "TestClassifier", {
        outputBucket,
        modelData,
        instanceType: sagemaker.InstanceType.M5_LARGE,
      });

      expect(classifier.endpoint).toBeDefined();
      expect(classifier.endpoint.endpointName).toBeDefined();
    });
  });
});

describe("module exports", () => {
  test("exports all expected constructs and interfaces", () => {
    expect(SagemakerUdopProcessor).toBeDefined();
    expect(BasicSagemakerClassifier).toBeDefined();
    expect(SagemakerClassifier).toBeDefined();
    expect(SagemakerUdopProcessorConfiguration).toBeDefined();
  });

  test("constructs are proper CDK constructs", () => {
    expect(typeof SagemakerUdopProcessor).toBe("function");
    expect(typeof BasicSagemakerClassifier).toBe("function");
    expect(SagemakerUdopProcessor.prototype).toBeDefined();
    expect(BasicSagemakerClassifier.prototype).toBeDefined();
  });
});
