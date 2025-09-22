/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { Key } from "aws-cdk-lib/aws-kms";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  StateMachine,
  Pass,
  DefinitionBody,
} from "aws-cdk-lib/aws-stepfunctions";
import {
  ProcessingEnvironmentApi,
  ConfigurationTable,
  TrackingTable,
  VpcConfiguration,
} from "../../src";

describe("ProcessingEnvironmentApi - Optional Features", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let trackingTable: TrackingTable;
  let configurationTable: ConfigurationTable;

  beforeEach(() => {
    app = new App();
    stack = new Stack(app, "TestStack");

    // Set bundling context directly on the stack node
    stack.node.setContext(cxapi.BUNDLING_STACKS, []);
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    trackingTable = new TrackingTable(stack, "TrackingTable");
    configurationTable = new ConfigurationTable(stack, "ConfigurationTable");
  });

  describe("KMS encryption support", () => {
    test("works without encryption key", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
    });

    test("integrates with KMS encryption key", () => {
      const encryptionKey = new Key(stack, "EncryptionKey", {
        description: "Test encryption key for API",
      });

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        encryptionKey,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify KMS permissions are granted to Lambda functions
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith(["kms:Decrypt"]),
            }),
          ]),
        },
      });
    });
  });

  describe("log retention configuration", () => {
    test("accepts custom log retention", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        logRetention: RetentionDays.ONE_WEEK,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify log retention is set
      template.hasResourceProperties("AWS::Logs::LogGroup", {
        RetentionInDays: 7,
      });
    });
  });

  describe("evaluation baseline bucket", () => {
    test("works without evaluation baseline bucket", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
    });

    test("integrates with evaluation baseline bucket", () => {
      const evaluationBaselineBucket = new Bucket(
        stack,
        "EvaluationBaselineBucket",
      );

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        evaluationBaselineBucket,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify additional Lambda functions and permissions for evaluation
      template.hasResourceProperties("AWS::Lambda::Function", {
        Runtime: "python3.12",
      });
    });

    test("addEvaluation method works independently", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const evaluationBaselineBucket = new Bucket(
        stack,
        "EvaluationBaselineBucket",
      );

      // Test the public method
      expect(() => {
        api.addEvaluation(evaluationBaselineBucket);
      }).not.toThrow();
    });
  });

  describe("Step Functions integration", () => {
    test("works without state machine", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
    });

    test("integrates with Step Functions state machine", () => {
      const stateMachine = new StateMachine(stack, "TestStateMachine", {
        definitionBody: DefinitionBody.fromChainable(
          new Pass(stack, "PassState"),
        ),
      });

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        stateMachine,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify Step Functions permissions
      template.hasResourceProperties("AWS::IAM::Policy", {
        PolicyDocument: {
          Statement: Match.arrayWith([
            Match.objectLike({
              Effect: "Allow",
              Action: Match.arrayWith(["states:DescribeExecution"]),
            }),
          ]),
        },
      });
    });

    test("addStateMachine method works independently", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const stateMachine = new StateMachine(stack, "TestStateMachine", {
        definitionBody: DefinitionBody.fromChainable(
          new Pass(stack, "PassState"),
        ),
      });

      // Test the public method
      expect(() => {
        api.addStateMachine(stateMachine);
      }).not.toThrow();
    });
  });

  describe("VPC configuration", () => {
    test("works without VPC configuration", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      expect(api).toBeDefined();
    });

    test("accepts VPC configuration", () => {
      const vpcConfiguration: VpcConfiguration = {
        // VPC configuration would be defined here in real usage
        // For testing, we just verify it doesn't throw
      };

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        vpcConfiguration,
      });

      expect(api).toBeDefined();
    });
  });

  describe("combined optional features", () => {
    test("handles multiple optional features together", () => {
      const encryptionKey = new Key(stack, "EncryptionKey");
      const evaluationBaselineBucket = new Bucket(
        stack,
        "EvaluationBaselineBucket",
      );
      const stateMachine = new StateMachine(stack, "TestStateMachine", {
        definitionBody: DefinitionBody.fromChainable(
          new Pass(stack, "PassState"),
        ),
      });

      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        encryptionKey,
        evaluationBaselineBucket,
        stateMachine,
        logRetention: RetentionDays.ONE_MONTH,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify multiple features are integrated
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        Name: Match.anyValue(),
      });

      // Verify Lambda functions are created for all features
      template.resourceCountIs("AWS::Lambda::Function", 9);
    });

    test("public methods can be called after construction", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
      });

      const evaluationBaselineBucket = new Bucket(
        stack,
        "EvaluationBaselineBucket",
      );
      const stateMachine = new StateMachine(stack, "TestStateMachine", {
        definitionBody: DefinitionBody.fromChainable(
          new Pass(stack, "PassState"),
        ),
      });

      // Test that public methods work after construction
      expect(() => {
        api.addEvaluation(evaluationBaselineBucket);
        api.addStateMachine(stateMachine);
      }).not.toThrow();
    });
  });

  describe("resource limits and configuration", () => {
    test("accepts query depth and resolver count limits", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        queryDepthLimit: 10,
        resolverCountLimit: 100,
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify API configuration
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        QueryDepthLimit: 10,
        ResolverCountLimit: 100,
      });
    });

    test("accepts owner contact information", () => {
      const api = new ProcessingEnvironmentApi(stack, "TestApi", {
        inputBucket,
        outputBucket,
        trackingTable,
        configurationTable,
        ownerContact: "team@example.com",
      });

      expect(api).toBeDefined();

      const template = Template.fromStack(stack);

      // Verify owner contact is set
      template.hasResourceProperties("AWS::AppSync::GraphQLApi", {
        OwnerContact: "team@example.com",
      });
    });
  });
});
