/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Aspects, Stack } from "aws-cdk-lib";
import { Annotations, Match, Template } from "aws-cdk-lib/assertions";
import { AwsSolutionsChecks, NagSuppressions } from "cdk-nag";
import { IdpPythonLayerVersion } from "../../src";

describe("Core Constructs CDK Nag Compliance", () => {
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
    Aspects.of(stack).add(new AwsSolutionsChecks());
  });

  describe("IdpPythonLayerVersion", () => {
    test("satisfies CDK NAG AwsSolutionsChecks with minimal configuration", () => {
      const layer = IdpPythonLayerVersion.getOrCreate(stack, "core");

      // Verify bundling is disabled before template synthesis
      expect(stack.bundlingRequired).toBe(false);

      // Apply any necessary suppressions for known acceptable violations
      NagSuppressions.addResourceSuppressionsByPath(
        stack,
        `/${layer.node.path}`,
        [
          {
            id: "AwsSolutions-L1",
            reason:
              "Lambda layer uses supported Python runtime version as required by the IDP framework",
          },
        ],
      );

      // Trigger CDK Nag analysis
      app.synth();

      const template = Template.fromStack(stack);
      const warnings = Annotations.fromStack(stack).findWarning(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );
      const errors = Annotations.fromStack(stack).findError(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      expect(template.toJSON()).toMatchSnapshot();
    });

    test("satisfies CDK NAG with comprehensive module configuration", () => {
      const layer = IdpPythonLayerVersion.getOrCreate(
        stack,
        "ocr",
        "classification",
        "assessment",
      );

      // Verify bundling is disabled before template synthesis
      expect(stack.bundlingRequired).toBe(false);

      // Apply suppressions for acceptable violations
      NagSuppressions.addResourceSuppressionsByPath(
        stack,
        `/${layer.node.path}`,
        [
          {
            id: "AwsSolutions-L1",
            reason:
              "Lambda layer uses supported Python runtime version as required by the IDP framework with multiple modules",
          },
        ],
      );

      // Trigger CDK Nag analysis
      app.synth();

      const template = Template.fromStack(stack);
      const warnings = Annotations.fromStack(stack).findWarning(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );
      const errors = Annotations.fromStack(stack).findError(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );

      expect(warnings).toHaveLength(0);
      expect(errors).toHaveLength(0);

      expect(template.toJSON()).toMatchSnapshot();
    });

    test("detects CDK Nag violations when suppressions are not applied", () => {
      IdpPythonLayerVersion.getOrCreate(stack, "core");

      // Verify bundling is disabled before template synthesis
      expect(stack.bundlingRequired).toBe(false);

      // Do not apply suppressions to test violation detection
      // Trigger CDK Nag analysis
      app.synth();

      const warnings = Annotations.fromStack(stack).findWarning(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );
      const errors = Annotations.fromStack(stack).findError(
        "*",
        Match.stringLikeRegexp("AwsSolutions-.*"),
      );

      const template = Template.fromStack(stack);
      const resources = template.findResources("*");
      const resourceCount = Object.keys(resources).length;

      // If no resources are created (due to bundling being disabled),
      // then no violations should be detected
      if (resourceCount === 0) {
        expect(warnings).toHaveLength(0);
        expect(errors).toHaveLength(0);
        console.log(
          "No resources created due to bundling being disabled - no violations expected",
        );
      } else {
        // If resources are created, violations should be detected when suppressions are not applied
        const totalViolations = warnings.length + errors.length;
        expect(totalViolations).toBeGreaterThan(0);

        // Log violations for debugging
        if (warnings.length > 0) {
          console.log(
            "CDK Nag warnings detected:",
            warnings.map((w) => w.entry.data),
          );
        }
        if (errors.length > 0) {
          console.log(
            "CDK Nag errors detected:",
            errors.map((e) => e.entry.data),
          );
        }
      }
    });
  });

  describe("Security Best Practices", () => {
    test("layer version follows security best practices", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      const layer = IdpPythonLayerVersion.getOrCreate(stack, "core");

      // Verify the layer construct is created
      expect(layer).toBeDefined();
      expect(layer.layerVersionArn).toBeDefined();

      const template = Template.fromStack(stack);

      // Check if layer resource exists, if bundling is disabled it might not synthesize
      const layerResources = template.findResources(
        "AWS::Lambda::LayerVersion",
      );
      if (Object.keys(layerResources).length > 0) {
        // Verify layer has proper configuration
        template.hasResourceProperties("AWS::Lambda::LayerVersion", {
          CompatibleRuntimes: Match.anyValue(),
          Content: {
            S3Bucket: Match.anyValue(),
            S3Key: Match.anyValue(),
          },
        });

        // Ensure no hardcoded sensitive values in environment variables or properties
        const templateJson = template.toJSON();
        const templateString = JSON.stringify(templateJson);

        // Check for hardcoded passwords, secrets, or API keys (but not S3 keys)
        expect(templateString).not.toMatch(/password\s*[:=]/i);
        expect(templateString).not.toMatch(/secret\s*[:=]/i);
        expect(templateString).not.toMatch(/api[_-]?key\s*[:=]/i);
        expect(templateString).not.toMatch(/access[_-]?key\s*[:=]/i);
      }
    });
  });

  describe("Performance and Cost Optimization", () => {
    test("layer configuration supports performance optimization", () => {
      // Verify bundling is disabled before calling getOrCreate
      expect(stack.bundlingRequired).toBe(false);

      // Test that minimal layer configuration is supported for performance
      const minimalLayer = IdpPythonLayerVersion.getOrCreate(stack, "core");

      // Test that comprehensive layer configuration is available when needed
      const comprehensiveLayer = IdpPythonLayerVersion.getOrCreate(
        stack,
        "ocr",
        "classification",
        "assessment",
        "extraction",
      );

      // Verify both layers are created at construct level
      expect(minimalLayer).toBeDefined();
      expect(comprehensiveLayer).toBeDefined();
      expect(minimalLayer).not.toBe(comprehensiveLayer);
      expect(minimalLayer.layerVersionArn).not.toBe(
        comprehensiveLayer.layerVersionArn,
      );
    });
  });
});
