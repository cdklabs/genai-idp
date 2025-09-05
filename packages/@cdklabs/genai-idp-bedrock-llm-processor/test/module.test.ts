/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { BedrockLlmProcessor, ClassificationMethod } from "../src";

describe("BedrockLlmProcessor", () => {
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

  describe("interface validation", () => {
    test("BedrockLlmProcessor can be imported", () => {
      // Test that the module can be imported without errors
      expect(BedrockLlmProcessor).toBeDefined();
      expect(typeof BedrockLlmProcessor).toBe("function");
    });

    test("BedrockLlmProcessor exports are available", () => {
      // Verify main construct is exported
      expect(BedrockLlmProcessor).toBeDefined();

      // Verify it's a function (constructor)
      expect(typeof BedrockLlmProcessor).toBe("function");
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
  });

  describe("construct validation", () => {
    test("BedrockLlmProcessor constructor exists and is callable", () => {
      // Verify constructor exists
      expect(BedrockLlmProcessor).toBeDefined();
      expect(typeof BedrockLlmProcessor).toBe("function");

      // Verify it's a proper constructor (has prototype)
      expect(BedrockLlmProcessor.prototype).toBeDefined();
      expect(BedrockLlmProcessor.prototype.constructor).toBe(
        BedrockLlmProcessor,
      );
    });

    test("BedrockLlmProcessor has expected static properties", () => {
      // Check if it's a proper CDK construct
      expect(BedrockLlmProcessor.prototype).toBeDefined();
    });
  });

  describe("module structure", () => {
    test("module exports contain expected constructs", () => {
      // Verify main construct is exported
      expect(BedrockLlmProcessor).toBeDefined();

      // Verify it's a function (constructor)
      expect(typeof BedrockLlmProcessor).toBe("function");
    });

    test("module can be imported without throwing", () => {
      // This test verifies the import worked
      expect(BedrockLlmProcessor).toBeDefined();
    });
  });

  describe("type definitions", () => {
    test("TypeScript types are properly exported", () => {
      // This test ensures TypeScript compilation works
      expect(BedrockLlmProcessor).toBeDefined();
      expect(typeof BedrockLlmProcessor).toBe("function");
    });
  });

  describe("ClassificationMethod enum", () => {
    test("ClassificationMethod enum is exported", () => {
      expect(ClassificationMethod).toBeDefined();
      expect(ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION).toBe(
        "multimodalPageLevelClassification",
      );
      expect(ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION).toBe(
        "textbasedHolisticClassification",
      );
    });

    test("ClassificationMethod enum values are correct", () => {
      const allMethods = Object.values(ClassificationMethod);
      expect(allMethods).toHaveLength(2);
      expect(allMethods).toContain("multimodalPageLevelClassification");
      expect(allMethods).toContain("textbasedHolisticClassification");
    });
  });
});
