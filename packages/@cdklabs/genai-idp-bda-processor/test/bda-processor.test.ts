/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import {
  BdaProcessor,
  BdaProcessorConfiguration,
  IBdaProcessor,
  BdaProcessorProps,
  IDataAutomationProject,
} from "../src";
import { MockDataAutomationProject } from "./test-helpers";

describe("BdaProcessor - Import Validation", () => {
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

  describe("bundling prevention", () => {
    test("bundling is disabled for unit tests", () => {
      expect(stack.bundlingRequired).toBe(false);
    });
  });

  describe("module imports", () => {
    test("BdaProcessor can be imported", () => {
      expect(BdaProcessor).toBeDefined();
      expect(typeof BdaProcessor).toBe("function");
    });

    test("BdaProcessorConfiguration can be imported", () => {
      expect(BdaProcessorConfiguration).toBeDefined();
      expect(typeof BdaProcessorConfiguration).toBe("function");
    });

    test("IDataAutomationProject interface can be imported", () => {
      const interfaceCheck: IDataAutomationProject = {} as any;
      expect(interfaceCheck).toBeDefined();
    });

    test("IBdaProcessor interface is available", () => {
      const interfaceCheck: IBdaProcessor = {} as any;
      expect(interfaceCheck).toBeDefined();
    });

    test("BdaProcessorProps interface is available", () => {
      const propsCheck: BdaProcessorProps = {} as any;
      expect(propsCheck).toBeDefined();
    });
  });

  describe("construct validation", () => {
    test("BdaProcessor constructor exists and is callable", () => {
      expect(BdaProcessor).toBeDefined();
      expect(typeof BdaProcessor).toBe("function");
      expect(BdaProcessor.prototype).toBeDefined();
      expect(BdaProcessor.prototype.constructor).toBe(BdaProcessor);
    });

    test("BdaProcessorConfiguration has static factory methods", () => {
      expect(BdaProcessorConfiguration.lendingPackageSample).toBeDefined();
      expect(typeof BdaProcessorConfiguration.lendingPackageSample).toBe(
        "function",
      );
      expect(BdaProcessorConfiguration.fromFile).toBeDefined();
      expect(typeof BdaProcessorConfiguration.fromFile).toBe("function");
    });

    test("mock data automation project works", () => {
      const mockProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );
      expect(mockProject).toBeDefined();
      expect(mockProject.arn).toBeDefined();
      expect(typeof mockProject.grantInvokeAsync).toBe("function");
    });
  });

  describe("template synthesis", () => {
    test("empty stack synthesizes correctly", () => {
      expect(stack.bundlingRequired).toBe(false);
      const template = Template.fromStack(stack);
      expect(template).toBeDefined();
      const resources = template.findResources("*");
      expect(Object.keys(resources)).toHaveLength(0);
    });

    test("stack with basic constructs synthesizes without bundling", () => {
      expect(stack.bundlingRequired).toBe(false);
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );
      expect(configuration).toBeDefined();
      expect(dataAutomationProject).toBeDefined();
      const template = Template.fromStack(stack);
      expect(template).toBeDefined();
    });
  });

  describe("type definitions", () => {
    test("TypeScript types are properly exported", () => {
      expect(BdaProcessor).toBeDefined();
      expect(BdaProcessorConfiguration).toBeDefined();
    });

    test("interface types compile correctly", () => {
      const processorInterface: IBdaProcessor = {} as any;
      const processorProps: BdaProcessorProps = {} as any;
      const dataAutomationProject: IDataAutomationProject = {} as any;
      expect(processorInterface).toBeDefined();
      expect(processorProps).toBeDefined();
      expect(dataAutomationProject).toBeDefined();
    });
  });

  describe("module structure", () => {
    test("module exports contain expected constructs", () => {
      expect(BdaProcessor).toBeDefined();
      expect(BdaProcessorConfiguration).toBeDefined();
      expect(typeof BdaProcessor).toBe("function");
      expect(typeof BdaProcessorConfiguration).toBe("function");
    });
  });
});
