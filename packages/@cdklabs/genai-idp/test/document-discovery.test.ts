/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import * as cdk from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import * as s3 from "aws-cdk-lib/aws-s3";
import { DocumentDiscovery } from "../src/document-discovery";

describe("DocumentDiscovery", () => {
  let app: cdk.App;
  let stack: cdk.Stack;
  let inputBucket: s3.IBucket;

  beforeEach(() => {
    app = new cdk.App();
    stack = new cdk.Stack(app, "TestStack");

    // Set bundling context to disable asset creation during tests
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);

    inputBucket = new s3.Bucket(stack, "InputBucket");
  });

  test("creates discovery environment with required resources", () => {
    // WHEN
    new DocumentDiscovery(stack, "Discovery", {
      inputBucket,
      appSyncApiUrl:
        "https://example.appsync-api.us-east-1.amazonaws.com/graphql",
    });

    // THEN
    const template = Template.fromStack(stack);

    // Should create DynamoDB table
    template.hasResourceProperties("AWS::DynamoDB::Table", {
      AttributeDefinitions: [
        {
          AttributeName: "jobId",
          AttributeType: "S",
        },
      ],
      KeySchema: [
        {
          AttributeName: "jobId",
          KeyType: "HASH",
        },
      ],
    });

    // Should create SQS queue
    template.hasResourceProperties("AWS::SQS::Queue", {
      VisibilityTimeout: 300,
    });

    // Should create Lambda functions
    template.resourceCountIs("AWS::Lambda::Function", 2);
  });
});
