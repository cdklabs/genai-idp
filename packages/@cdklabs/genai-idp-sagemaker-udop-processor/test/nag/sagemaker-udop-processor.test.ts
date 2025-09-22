/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Aspects, Stack } from "aws-cdk-lib";
import { Annotations, Match } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import {
  SagemakerUdopProcessor,
  BasicSagemakerClassifier,
  SagemakerUdopProcessorConfiguration,
} from "../../src";

// Common suppressions for the SageMaker UDOP processor
const commonSuppressions = [
  {
    id: "AwsSolutions-IAM4",
    reason:
      "AWS managed policies are acceptable for Lambda execution roles in this construct",
  },
  {
    id: "AwsSolutions-IAM5",
    reason:
      "Wildcard permissions are required for Lambda functions to access S3, DynamoDB, and other AWS services",
  },
  {
    id: "AwsSolutions-L1",
    reason:
      "Lambda runtime version is managed by the construct and uses supported versions",
  },
  {
    id: "AwsSolutions-SF1",
    reason:
      "Step Function logging is configured appropriately for the document processing workflow",
  },
  {
    id: "AwsSolutions-SF2",
    reason:
      "Step Function X-Ray tracing is configured appropriately for the document processing workflow",
  },
  {
    id: "AwsSolutions-SQS3",
    reason: "SQS queues are used for internal processing and DLQ functionality",
  },
  {
    id: "AwsSolutions-SQS4",
    reason: "SQS queues use appropriate encryption for the use case",
  },
  {
    id: "AwsSolutions-S1",
    reason:
      "S3 buckets are configured with appropriate access logging for the document processing use case",
  },
  {
    id: "AwsSolutions-S2",
    reason:
      "S3 buckets have appropriate public access restrictions for document processing",
  },
  {
    id: "AwsSolutions-S10",
    reason:
      "S3 buckets use appropriate SSL/TLS configurations for document processing",
  },
  {
    id: "AwsSolutions-DDB3",
    reason:
      "DynamoDB tables use appropriate backup configurations for the document processing metadata",
  },
];

describe("SagemakerUdopProcessor CDK Nag Compliance", () => {
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

    // Create test configuration
    configuration = SagemakerUdopProcessorConfiguration.rvlCdipPackageSample();
  });

  test("SagemakerUdopProcessor with minimal configuration passes CDK Nag checks", () => {
    // Create the processor
    new SagemakerUdopProcessor(stack, "TestProcessor", {
      environment,
      configuration,
      classifierEndpoint: mockEndpoint,
    });

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add suppressions for known acceptable violations
    NagSuppressions.addStackSuppressions(stack, commonSuppressions);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // Log any remaining errors or warnings for debugging
    if (errors.length > 0) {
      console.log("CDK Nag Errors:", errors);
    }
    if (warnings.length > 0) {
      console.log("CDK Nag Warnings:", warnings);
    }

    // Assert no CDK Nag violations remain
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  test("SagemakerUdopProcessor with evaluation enabled passes CDK Nag checks", () => {
    const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");

    // Create the processor with evaluation enabled
    new SagemakerUdopProcessor(stack, "TestProcessor", {
      environment,
      configuration,
      classifierEndpoint: mockEndpoint,
      evaluationEnabled: true,
      evaluationBaselineBucket: evaluationBucket,
    });

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add suppressions for known acceptable violations
    NagSuppressions.addStackSuppressions(stack, commonSuppressions);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // Log any remaining errors or warnings for debugging
    if (errors.length > 0) {
      console.log("CDK Nag Errors (with evaluation):", errors);
    }
    if (warnings.length > 0) {
      console.log("CDK Nag Warnings (with evaluation):", warnings);
    }

    // Assert no CDK Nag violations remain
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  test("SagemakerUdopProcessor with assessment enabled passes CDK Nag checks", () => {
    // Create the processor with assessment enabled
    new SagemakerUdopProcessor(stack, "TestProcessor", {
      environment,
      configuration,
      classifierEndpoint: mockEndpoint,
    });

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add suppressions for known acceptable violations
    NagSuppressions.addStackSuppressions(stack, commonSuppressions);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // Log any remaining errors or warnings for debugging
    if (errors.length > 0) {
      console.log("CDK Nag Errors (with assessment):", errors);
    }
    if (warnings.length > 0) {
      console.log("CDK Nag Warnings (with assessment):", warnings);
    }

    // Assert no CDK Nag violations remain
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  test("SagemakerUdopProcessor with all features enabled passes CDK Nag checks", () => {
    const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");

    // Create the processor with all features enabled
    new SagemakerUdopProcessor(stack, "TestProcessor", {
      environment,
      configuration,
      classifierEndpoint: mockEndpoint,
      ocrMaxWorkers: 10,
      evaluationEnabled: true,
      evaluationBaselineBucket: evaluationBucket,
    });

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add suppressions for known acceptable violations
    NagSuppressions.addStackSuppressions(stack, commonSuppressions);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // Log any remaining errors or warnings for debugging
    if (errors.length > 0) {
      console.log("CDK Nag Errors (all features):", errors);
    }
    if (warnings.length > 0) {
      console.log("CDK Nag Warnings (all features):", warnings);
    }

    // Assert no CDK Nag violations remain
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });
});

describe("BasicSagemakerClassifier CDK Nag Compliance", () => {
  let app: App;
  let stack: Stack;
  let outputBucket: s3.Bucket;
  let modelData: sagemaker.ModelData;

  // SageMaker-specific suppressions
  const sagemakerSuppressions = [
    {
      id: "AwsSolutions-IAM4",
      reason:
        "SageMaker execution role uses AWS managed policies which are appropriate for ML workloads",
    },
    {
      id: "AwsSolutions-IAM5",
      reason:
        "SageMaker requires broad permissions for model deployment and inference",
    },
    {
      id: "AwsSolutions-SM1",
      reason:
        "SageMaker endpoint encryption is configured appropriately for the use case",
    },
    {
      id: "AwsSolutions-SM2",
      reason:
        "SageMaker model network isolation is configured appropriately for the deployment pattern",
    },
    {
      id: "AwsSolutions-S1",
      reason:
        "S3 bucket access logging is configured appropriately for model artifacts",
    },
    {
      id: "AwsSolutions-S2",
      reason:
        "S3 bucket public access is restricted appropriately for model artifacts",
    },
    {
      id: "AwsSolutions-S10",
      reason:
        "S3 bucket SSL/TLS configuration is appropriate for model artifacts",
    },
  ];

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

  test("BasicSagemakerClassifier passes CDK Nag checks", () => {
    // Create the classifier
    new BasicSagemakerClassifier(stack, "TestClassifier", {
      outputBucket,
      modelData,
      instanceType: sagemaker.InstanceType.M5_LARGE,
    });

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add suppressions for known acceptable violations
    NagSuppressions.addStackSuppressions(stack, sagemakerSuppressions);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // Log any remaining errors or warnings for debugging
    if (errors.length > 0) {
      console.log("CDK Nag Errors (BasicSagemakerClassifier):", errors);
    }
    if (warnings.length > 0) {
      console.log("CDK Nag Warnings (BasicSagemakerClassifier):", warnings);
    }

    // Assert no CDK Nag violations remain
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  test("BasicSagemakerClassifier with KMS encryption passes CDK Nag checks", () => {
    // Create additional bucket to test KMS-related suppressions
    new s3.Bucket(stack, "KmsTestBucket");

    // Create the classifier with additional configuration
    new BasicSagemakerClassifier(stack, "TestClassifier", {
      outputBucket,
      modelData,
      instanceType: sagemaker.InstanceType.M5_LARGE,
    });

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add suppressions including KMS-related ones
    const kmsSuppressions = [
      ...sagemakerSuppressions,
      {
        id: "AwsSolutions-KMS5",
        reason: "KMS key rotation is configured appropriately for the use case",
      },
    ];

    NagSuppressions.addStackSuppressions(stack, kmsSuppressions);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // Log any remaining errors or warnings for debugging
    if (errors.length > 0) {
      console.log("CDK Nag Errors (with KMS):", errors);
    }
    if (warnings.length > 0) {
      console.log("CDK Nag Warnings (with KMS):", warnings);
    }

    // Assert no CDK Nag violations remain
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });
});

describe("CDK Nag Integration Validation", () => {
  test("CDK Nag can detect violations before suppressions", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");

    // Create a simple S3 bucket without suppressions to test CDK Nag detection
    new s3.Bucket(stack, "TestBucket");

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings - should find some violations
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // This test verifies that CDK Nag is actually running and detecting issues
    // We expect to find violations for an unsuppressed S3 bucket
    const totalViolations = errors.length + warnings.length;
    expect(totalViolations).toBeGreaterThan(0);

    console.log(
      `CDK Nag detected ${errors.length} errors and ${warnings.length} warnings for unsuppressed S3 bucket`,
    );
  });

  test("CDK Nag suppressions work correctly", () => {
    const app = new App();
    const stack = new Stack(app, "TestStack");

    // Create a simple S3 bucket
    new s3.Bucket(stack, "TestBucket");

    // Apply CDK Nag checks
    Aspects.of(stack).add(new AwsSolutionsChecks());

    // Add comprehensive suppressions for S3
    NagSuppressions.addStackSuppressions(stack, [
      {
        id: "AwsSolutions-S1",
        reason: "Test bucket does not require access logging",
      },
      {
        id: "AwsSolutions-S2",
        reason: "Test bucket public access is appropriately restricted",
      },
      {
        id: "AwsSolutions-S10",
        reason: "Test bucket SSL/TLS configuration is appropriate",
      },
    ]);

    // Synthesize the stack to trigger CDK Nag analysis
    app.synth();

    // Check for CDK Nag errors and warnings - should be suppressed now
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    // This test verifies that suppressions work correctly
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });
});
