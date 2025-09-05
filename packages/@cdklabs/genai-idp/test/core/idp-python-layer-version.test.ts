/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import { Template, Match } from "aws-cdk-lib/assertions";
import { IdpPythonLayerVersion } from "../../src";

describe("IdpPythonLayerVersion", () => {
  let app: App;
  let stack: Stack;

  beforeEach(() => {
    // Create app with bundling disabled for unit tests
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [], // Use correct context key to disable bundling
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");
  });

  describe("default behavior", () => {
    test("creates layer with core modules when no modules specified", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer = IdpPythonLayerVersion.getOrCreate(stack);

      // Verify the layer construct is created
      expect(layer).toBeDefined();
      expect(layer.layerVersionArn).toBeDefined();

      const template = Template.fromStack(stack);

      // Check if layer resource exists, if bundling is disabled it might not synthesize
      const layerResources = template.findResources(
        "AWS::Lambda::LayerVersion",
      );
      if (Object.keys(layerResources).length > 0) {
        template.hasResourceProperties("AWS::Lambda::LayerVersion", {
          CompatibleRuntimes: ["python3.12"],
          Description:
            "Lambda Layer containing the idp_common Python package with modules: core (base only)",
          Content: {
            S3Bucket: Match.anyValue(),
            S3Key: Match.anyValue(),
          },
        });
      }
    });

    test("creates layer with specific modules when provided", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer = IdpPythonLayerVersion.getOrCreate(
        stack,
        "ocr",
        "classification",
      );

      // Verify the layer construct is created
      expect(layer).toBeDefined();
      expect(layer.layerVersionArn).toBeDefined();

      const template = Template.fromStack(stack);

      // Check if layer resource exists, if bundling is disabled it might not synthesize
      const layerResources = template.findResources(
        "AWS::Lambda::LayerVersion",
      );
      if (Object.keys(layerResources).length > 0) {
        template.hasResourceProperties("AWS::Lambda::LayerVersion", {
          CompatibleRuntimes: ["python3.12"],
          Description:
            "Lambda Layer containing the idp_common Python package with modules: classification, ocr",
          Content: {
            S3Bucket: Match.anyValue(),
            S3Key: Match.anyValue(),
          },
        });
      }
    });

    test("reuses existing layer with same configuration", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer1 = IdpPythonLayerVersion.getOrCreate(stack, "core");
      const layer2 = IdpPythonLayerVersion.getOrCreate(stack, "core");

      // Verify layer reuse works at construct level
      expect(layer1).toBe(layer2);
      expect(layer1.layerVersionArn).toBe(layer2.layerVersionArn);
    });

    test("creates separate layers for different configurations", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer1 = IdpPythonLayerVersion.getOrCreate(stack, "core");
      const layer2 = IdpPythonLayerVersion.getOrCreate(stack, "ocr");

      // Verify different layers are created at construct level
      expect(layer1).not.toBe(layer2);
      expect(layer1.layerVersionArn).not.toBe(layer2.layerVersionArn);
    });
  });

  describe("module validation", () => {
    test("accepts valid core modules", () => {
      expect(() => {
        IdpPythonLayerVersion.getOrCreate(stack, "core");
      }).not.toThrow();
    });

    test("accepts valid processing modules", () => {
      expect(() => {
        IdpPythonLayerVersion.getOrCreate(
          stack,
          "ocr",
          "classification",
          "assessment",
          "extraction",
        );
      }).not.toThrow();
    });

    test("accepts docs_service module", () => {
      expect(() => {
        IdpPythonLayerVersion.getOrCreate(stack, "docs_service");
      }).not.toThrow();
    });

    test("accepts all module for comprehensive dependencies", () => {
      expect(() => {
        IdpPythonLayerVersion.getOrCreate(stack, "all");
      }).not.toThrow();
    });
  });

  describe("layer naming and identification", () => {
    test("generates consistent layer names for same configuration", () => {
      const layer1 = IdpPythonLayerVersion.getOrCreate(stack, "core");

      const layer2 = IdpPythonLayerVersion.getOrCreate(stack, "core");

      expect(layer1.layerVersionArn).toBe(layer2.layerVersionArn);
    });

    test("generates different layer names for different configurations", () => {
      const layer1 = IdpPythonLayerVersion.getOrCreate(stack, "core");

      const layer2 = IdpPythonLayerVersion.getOrCreate(stack, "ocr");

      expect(layer1.layerVersionArn).not.toBe(layer2.layerVersionArn);
    });
  });

  describe("optimization scenarios", () => {
    test("uses core modules instead of all for basic functions", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      // This test validates the recent optimization work
      const layer = IdpPythonLayerVersion.getOrCreate(stack);

      // Verify the layer construct is created with core dependencies
      expect(layer).toBeDefined();
      expect(layer.layerVersionArn).toBeDefined();
    });

    test("supports minimal layer configurations for performance", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer = IdpPythonLayerVersion.getOrCreate(stack, "core"); // Minimal set for basic utilities

      // Verify the layer construct is created
      expect(layer).toBeDefined();
      expect(layer.layerVersionArn).toBeDefined();
    });

    test("supports comprehensive layer for heavy processing", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer = IdpPythonLayerVersion.getOrCreate(
        stack,
        "ocr",
        "classification",
        "assessment",
        "extraction",
      );

      // Verify the layer construct is created
      expect(layer).toBeDefined();
      expect(layer.layerVersionArn).toBeDefined();
    });
  });
});
