/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IProcessingEnvironment, LogLevel } from "@cdklabs/genai-idp";
import { Stack } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";
import {
  IBedrockLlmProcessorConfiguration,
  ClassificationMethod,
} from "../src";

/**
 * Mock implementation of IInvokable for Bedrock models
 */
export class MockInvokable {
  public readonly invokableArn: string;

  constructor(modelId: string, region: string) {
    this.invokableArn = `arn:aws:bedrock:${region}::foundation-model/${modelId}`;
  }

  grantInvoke(grantee: IGrantable): Grant {
    return Grant.addToPrincipal({
      grantee,
      actions: ["bedrock:InvokeModel"],
      resourceArns: [this.invokableArn],
    });
  }
}

/**
 * Mock implementation of IProcessingEnvironment for testing
 */
export class MockProcessingEnvironment implements IProcessingEnvironment {
  public readonly metricNamespace = "TestNamespace";
  public readonly logLevel = LogLevel.INFO;
  public readonly logRetention = logs.RetentionDays.ONE_WEEK;
  public readonly encryptionKey: kms.IKey;
  public readonly configurationTable: dynamodb.ITable;
  public readonly trackingTable: dynamodb.ITable;
  public readonly inputBucket: s3.IBucket;
  public readonly outputBucket: s3.IBucket;
  public readonly workingBucket: s3.IBucket;
  public readonly configurationFunction: lambda.IFunction;
  public readonly api: any;
  public readonly vpcConfiguration = {};

  constructor(stack: Stack) {
    this.encryptionKey = new kms.Key(stack, "MockKey");
    this.configurationTable = new dynamodb.Table(stack, "MockConfigTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });
    this.trackingTable = new dynamodb.Table(stack, "MockTrackingTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
    });
    this.inputBucket = new s3.Bucket(stack, "MockInputBucket");
    this.outputBucket = new s3.Bucket(stack, "MockOutputBucket");
    this.workingBucket = new s3.Bucket(stack, "MockWorkingBucket");
    this.configurationFunction = new lambda.Function(
      stack,
      "MockConfigFunction",
      {
        runtime: lambda.Runtime.PYTHON_3_12,
        handler: "index.handler",
        code: lambda.Code.fromInline("def handler(event, context): return {}"),
      },
    );
    this.api = {
      graphqlUrl: "https://example.com/graphql",
      apiId: "test-api-id",
      arn: "arn:aws:appsync:us-east-1:123456789012:apis/test-api-id",
      graphQLEndpointArn:
        "arn:aws:appsync:us-east-1:123456789012:apis/test-api-id/graphql",
      grantMutation: (grantee: any) => {
        return Grant.addToPrincipal({
          grantee,
          actions: ["appsync:GraphQL"],
          resourceArns: [
            "arn:aws:appsync:us-east-1:123456789012:apis/test-api-id/graphql",
          ],
        });
      },
    };
  }

  public attach(_construct: any): void {
    // Mock implementation
  }
}

/**
 * Mock implementation of IBedrockLlmProcessorConfiguration for testing
 */
export class MockBedrockLlmProcessorConfiguration
  implements IBedrockLlmProcessorConfiguration
{
  private includeOptionalModels: boolean;

  constructor(includeOptionalModels: boolean = false) {
    this.includeOptionalModels = includeOptionalModels;
  }

  public bind(_processor: any) {
    const classificationModel = new MockInvokable(
      "anthropic.claude-3-sonnet-20240229-v1:0",
      "us-east-1",
    );
    const extractionModel = new MockInvokable(
      "anthropic.claude-3-sonnet-20240229-v1:0",
      "us-east-1",
    );

    return {
      classificationMethod:
        ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
      classificationModel,
      extractionModel,
      ocrBackend: "textract" as const,
      assessmentModel: this.includeOptionalModels
        ? new MockInvokable(
            "anthropic.claude-3-sonnet-20240229-v1:0",
            "us-east-1",
          )
        : undefined,
      summarizationModel: this.includeOptionalModels
        ? new MockInvokable(
            "anthropic.claude-3-sonnet-20240229-v1:0",
            "us-east-1",
          )
        : undefined,
      raw: () => ({
        classificationMethod:
          ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
        classificationModel: {
          modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
          region: "us-east-1",
        },
        extractionModel: {
          modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
          region: "us-east-1",
        },
        documentTypes: [
          {
            name: "TestDocument",
            description: "Test document type",
            extractionSchema: {
              type: "object",
              properties: {
                field1: { type: "string" },
              },
            },
          },
        ],
      }),
    };
  }
}

/**
 * Helper function to create a mock processing environment for tests
 */
export function createMockProcessingEnvironment(
  stack: Stack,
): IProcessingEnvironment {
  return new MockProcessingEnvironment(stack);
}

/**
 * Helper function to create a mock configuration for tests
 */
export function createMockConfiguration(
  includeOptionalModels: boolean = false,
): IBedrockLlmProcessorConfiguration {
  return new MockBedrockLlmProcessorConfiguration(includeOptionalModels);
}
