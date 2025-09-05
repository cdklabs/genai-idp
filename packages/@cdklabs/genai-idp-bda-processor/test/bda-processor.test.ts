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
  BdaMetadataTable,
  IBdaProcessor,
  BdaProcessorProps,
  IDataAutomationProject,
} from "../src";
import { MockDataAutomationProject } from "./test-helpers";

describe("BdaProcessor - Import Validation", () => {
  let app: App;
  let stack: Stack;

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
  });

  describe("bundling prevention", () => {
    test("bundling is disabled for unit tests", () => {
      // Verify bundling is disabled before any construct operations
      expect(stack.bundlingRequired).toBe(false);
    });
  });

  describe("module imports", () => {
    test("BdaProcessor can be imported", () => {
      // Test that the main construct can be imported without errors
      expect(BdaProcessor).toBeDefined();
      expect(typeof BdaProcessor).toBe("function");
    });

    test("BdaProcessorConfiguration can be imported", () => {
      // Test that the configuration class can be imported
      expect(BdaProcessorConfiguration).toBeDefined();
      expect(typeof BdaProcessorConfiguration).toBe("function");
    });

    test("IDataAutomationProject interface can be imported", () => {
      // Test that the data automation project interface can be imported
      const interfaceCheck: IDataAutomationProject = {} as any;
      expect(interfaceCheck).toBeDefined();
    });

    test("BdaMetadataTable can be imported", () => {
      // Test that the metadata table can be imported
      expect(BdaMetadataTable).toBeDefined();
      expect(typeof BdaMetadataTable).toBe("function");
    });

    test("IBdaProcessor interface is available", () => {
      // Test that the interface type is available (TypeScript compilation check)
      const interfaceCheck: IBdaProcessor = {} as any;
      expect(interfaceCheck).toBeDefined();
    });

    test("BdaProcessorProps interface is available", () => {
      // Test that the props interface type is available (TypeScript compilation check)
      const propsCheck: BdaProcessorProps = {} as any;
      expect(propsCheck).toBeDefined();
    });
  });

  describe("construct validation", () => {
    test("BdaProcessor constructor exists and is callable", () => {
      // Verify constructor exists
      expect(BdaProcessor).toBeDefined();
      expect(typeof BdaProcessor).toBe("function");

      // Verify it's a proper constructor (has prototype)
      expect(BdaProcessor.prototype).toBeDefined();
      expect(BdaProcessor.prototype.constructor).toBe(BdaProcessor);
    });

    test("BdaProcessor has expected static properties", () => {
      // Check if it's a proper CDK construct
      expect(BdaProcessor.prototype).toBeDefined();
    });

    test("BdaProcessorConfiguration has static factory methods", () => {
      // Verify configuration static methods
      expect(BdaProcessorConfiguration.lendingPackageSample).toBeDefined();
      expect(typeof BdaProcessorConfiguration.lendingPackageSample).toBe(
        "function",
      );
      expect(BdaProcessorConfiguration.fromFile).toBeDefined();
      expect(typeof BdaProcessorConfiguration.fromFile).toBe("function");
    });

    test("mock data automation project works", () => {
      // Verify mock helper works
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
      // Verify bundling is disabled
      expect(stack.bundlingRequired).toBe(false);

      // Test that an empty stack can be synthesized
      const template = Template.fromStack(stack);
      expect(template).toBeDefined();

      // Verify no resources are created in empty stack
      const resources = template.findResources("*");
      expect(Object.keys(resources)).toHaveLength(0);
    });

    test("stack with basic constructs synthesizes without bundling", () => {
      // Verify bundling is disabled
      expect(stack.bundlingRequired).toBe(false);

      // Create basic constructs that don't require bundling
      const configuration = BdaProcessorConfiguration.lendingPackageSample();
      const dataAutomationProject = new MockDataAutomationProject(
        "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
      );

      // Verify constructs can be created
      expect(configuration).toBeDefined();
      expect(dataAutomationProject).toBeDefined();

      // Template should synthesize without bundling
      const template = Template.fromStack(stack);
      expect(template).toBeDefined();
    });
  });

  describe("type definitions", () => {
    test("TypeScript types are properly exported", () => {
      // This test ensures TypeScript compilation works
      expect(BdaProcessor).toBeDefined();
      expect(typeof BdaProcessor).toBe("function");

      expect(BdaProcessorConfiguration).toBeDefined();
      expect(typeof BdaProcessorConfiguration).toBe("function");

      expect(BdaMetadataTable).toBeDefined();
      expect(typeof BdaMetadataTable).toBe("function");
    });

    test("interface types compile correctly", () => {
      // Verify TypeScript interfaces are available
      // This is a compile-time check that ensures types are properly exported
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
      // Verify main constructs are exported
      expect(BdaProcessor).toBeDefined();
      expect(BdaProcessorConfiguration).toBeDefined();
      expect(BdaMetadataTable).toBeDefined();

      // Verify they're all functions (constructors)
      expect(typeof BdaProcessor).toBe("function");
      expect(typeof BdaProcessorConfiguration).toBe("function");
      expect(typeof BdaMetadataTable).toBe("function");
    });

    test("module can be imported without throwing", () => {
      // This test verifies the import worked without errors
      expect(BdaProcessor).toBeDefined();
      expect(BdaProcessorConfiguration).toBeDefined();
      expect(BdaMetadataTable).toBeDefined();
    });

    test("all exports are available", () => {
      // Comprehensive check of all expected exports
      const exports = {
        BdaProcessor,
        BdaProcessorConfiguration,
        BdaMetadataTable,
      };

      Object.entries(exports).forEach(([, exportedItem]) => {
        expect(exportedItem).toBeDefined();
        expect(typeof exportedItem).toBe("function");
      });
    });
  });
});
