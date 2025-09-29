/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack, Duration } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as s3 from "aws-cdk-lib/aws-s3";
import { BedrockLlmProcessor } from "../src";
import {
  createMockProcessingEnvironment,
  createMockConfiguration,
} from "./test-helpers";

describe("BedrockLlmProcessor Tests", () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");
  });

  describe("Constructor and Basic Properties", () => {
    test("creates processor with minimal configuration", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      const processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      expect(processor).toBeDefined();
      expect(processor.environment).toBe(environment);
      expect(processor.maxProcessingConcurrency).toBe(100);
      expect(processor.stateMachine).toBeDefined();
    });

    test("creates processor with custom max processing concurrency", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      const processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        maxProcessingConcurrency: 50,
      });

      expect(processor.maxProcessingConcurrency).toBe(50);
    });

    test("creates processor with custom worker limits", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      const processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        classificationMaxWorkers: 10,
        ocrMaxWorkers: 15,
      });

      expect(processor).toBeDefined();

      const template = Template.fromStack(stack);
      template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: {
          Variables: Match.objectLike({
            MAX_WORKERS: "10",
          }),
        },
      });
    });

    test("creates processor with all optional features", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration(true); // Include optional models
      const evaluationBucket = new s3.Bucket(stack, "EvaluationBucket");

      const processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
        evaluationBaselineBucket: evaluationBucket,
      });

      expect(processor).toBeDefined();
      expect(processor.stateMachine).toBeDefined();
    });
  });

  describe("CloudWatch Metrics - Document Processing", () => {
    let processor: BedrockLlmProcessor;

    beforeEach(() => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();
      processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });
    });

    test("metricInputDocuments creates correct metric", () => {
      const metric = processor.metricInputDocuments();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("InputDocuments");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricInputDocuments accepts custom properties", () => {
      const metric = processor.metricInputDocuments({
        statistic: "Sum",
        period: Duration.minutes(5),
      });

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("InputDocuments");
    });

    test("metricInputDocumentPages creates correct metric", () => {
      const metric = processor.metricInputDocumentPages();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("InputDocumentPages");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricInputDocumentPages accepts custom properties", () => {
      const metric = processor.metricInputDocumentPages({
        statistic: "Average",
        period: Duration.minutes(10),
      });

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("InputDocumentPages");
    });
  });

  describe("CloudWatch Metrics - Bedrock Requests", () => {
    let processor: BedrockLlmProcessor;

    beforeEach(() => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();
      processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });
    });

    test("metricBedrockRequestsTotal creates correct metric", () => {
      const metric = processor.metricBedrockRequestsTotal();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockRequestsTotal");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockRequestsSucceeded creates correct metric", () => {
      const metric = processor.metricBedrockRequestsSucceeded();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockRequestsSucceeded");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockRequestsFailed creates correct metric", () => {
      const metric = processor.metricBedrockRequestsFailed();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockRequestsFailed");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockRequestLatency creates correct metric", () => {
      const metric = processor.metricBedrockRequestLatency();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockRequestLatency");
      expect(metric.unit).toBe(cloudwatch.Unit.MILLISECONDS);
    });

    test("metricBedrockTotalLatency creates correct metric", () => {
      const metric = processor.metricBedrockTotalLatency();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockTotalLatency");
      expect(metric.unit).toBe(cloudwatch.Unit.MILLISECONDS);
    });
  });

  describe("CloudWatch Metrics - Error and Retry", () => {
    let processor: BedrockLlmProcessor;

    beforeEach(() => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();
      processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });
    });

    test("metricBedrockRetrySuccess creates correct metric", () => {
      const metric = processor.metricBedrockRetrySuccess();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockRetrySuccess");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockThrottles creates correct metric", () => {
      const metric = processor.metricBedrockThrottles();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockThrottles");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockMaxRetriesExceeded creates correct metric", () => {
      const metric = processor.metricBedrockMaxRetriesExceeded();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockMaxRetriesExceeded");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockNonRetryableErrors creates correct metric", () => {
      const metric = processor.metricBedrockNonRetryableErrors();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockNonRetryableErrors");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockUnexpectedErrors creates correct metric", () => {
      const metric = processor.metricBedrockUnexpectedErrors();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockUnexpectedErrors");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });
  });

  describe("CloudWatch Metrics - Token Usage", () => {
    let processor: BedrockLlmProcessor;

    beforeEach(() => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();
      processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });
    });

    test("metricInputTokens creates correct metric", () => {
      const metric = processor.metricInputTokens();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("InputTokens");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricOutputTokens creates correct metric", () => {
      const metric = processor.metricOutputTokens();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("OutputTokens");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricTotalTokens creates correct metric", () => {
      const metric = processor.metricTotalTokens();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("TotalTokens");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricCacheReadInputTokens creates correct metric", () => {
      const metric = processor.metricCacheReadInputTokens();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("CacheReadInputTokens");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricCacheWriteInputTokens creates correct metric", () => {
      const metric = processor.metricCacheWriteInputTokens();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("CacheWriteInputTokens");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });
  });

  describe("CloudWatch Metrics - Bedrock Embedding", () => {
    let processor: BedrockLlmProcessor;

    beforeEach(() => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();
      processor = new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });
    });

    test("metricBedrockEmbeddingRequestsTotal creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingRequestsTotal();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingRequestsTotal");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockEmbeddingRequestsSucceeded creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingRequestsSucceeded();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingRequestsSucceeded");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockEmbeddingRequestsFailed creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingRequestsFailed();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingRequestsFailed");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockEmbeddingRequestLatency creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingRequestLatency();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingRequestLatency");
      expect(metric.unit).toBe(cloudwatch.Unit.MILLISECONDS);
    });

    test("metricBedrockEmbeddingThrottles creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingThrottles();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingThrottles");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockEmbeddingMaxRetriesExceeded creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingMaxRetriesExceeded();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingMaxRetriesExceeded");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockEmbeddingNonRetryableErrors creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingNonRetryableErrors();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingNonRetryableErrors");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });

    test("metricBedrockEmbeddingUnexpectedErrors creates correct metric", () => {
      const metric = processor.metricBedrockEmbeddingUnexpectedErrors();

      expect(metric).toBeInstanceOf(cloudwatch.Metric);
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BedrockEmbeddingUnexpectedErrors");
      expect(metric.unit).toBe(cloudwatch.Unit.COUNT);
    });
  });

  describe("CloudFormation Template Generation", () => {
    test("generates expected Lambda functions", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      const template = Template.fromStack(stack);

      // Should create Lambda functions (checking by runtime instead of handler pattern)
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
      });
    });

    test("generates Step Functions state machine", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      const template = Template.fromStack(stack);

      template.hasResourceProperties("AWS::StepFunctions::StateMachine", {
        RoleArn: Match.anyValue(),
        LoggingConfiguration: {
          Level: "ALL",
          IncludeExecutionData: true,
          Destinations: Match.anyValue(),
        },
      });
    });

    test("generates IAM roles and policies", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      const template = Template.fromStack(stack);

      // Should create State Machine role
      template.hasResourceProperties("AWS::IAM::Role", {
        AssumeRolePolicyDocument: {
          Statement: [
            {
              Effect: "Allow",
              Principal: {
                Service: "states.amazonaws.com",
              },
              Action: "sts:AssumeRole",
            },
          ],
        },
      });

      // Should have CloudWatch Logs policies
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith([
                "logs:CreateLogDelivery",
                "logs:GetLogDelivery",
                "logs:UpdateLogDelivery",
              ]),
            }),
          ]),
        },
      });
    });

    test("creates log groups for all functions", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration();

      new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      const template = Template.fromStack(stack);

      // Should create multiple log groups
      template.resourceCountIs("AWS::Logs::LogGroup", 10); // Updated: Added 3 HITL function log groups
    });
  });

  describe("Optional Features", () => {
    test("creates assessment function when assessment model is provided", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration(true); // Include optional models

      new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      const template = Template.fromStack(stack);

      // Should create assessment function (check by counting functions)
      template.resourceCountIs("AWS::Lambda::Function", 10); // Updated: Added 3 HITL functions
    });

    test("creates summarization function when summarization model is provided", () => {
      const environment = createMockProcessingEnvironment(stack);
      const configuration = createMockConfiguration(true); // Include optional models

      new BedrockLlmProcessor(stack, "TestProcessor", {
        environment,
        configuration,
      });

      const template = Template.fromStack(stack);

      // Should create summarization function (check by counting functions)
      template.resourceCountIs("AWS::Lambda::Function", 10); // Updated: Added 3 HITL functions
    });
  });
});
