/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import {
  IProcessingEnvironment,
  LogLevel,
  DocumentProcessorAttachmentResult,
  IDocumentProcessor,
  DocumentProcessorAttachmentOptions,
} from "@cdklabs/genai-idp";
import { Stack } from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as s3 from "aws-cdk-lib/aws-s3";

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
  public readonly lookupFunction: lambda.IFunction;
  public readonly api: any;

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
    this.lookupFunction = new lambda.Function(stack, "MockLookupFunction", {
      runtime: lambda.Runtime.PYTHON_3_12,
      handler: "index.handler",
      code: lambda.Code.fromInline("def handler(event, context): return {}"),
    });
  }

  public attach(
    _processor: IDocumentProcessor,
    _options?: DocumentProcessorAttachmentOptions,
  ): DocumentProcessorAttachmentResult {
    return {};
  }
}
