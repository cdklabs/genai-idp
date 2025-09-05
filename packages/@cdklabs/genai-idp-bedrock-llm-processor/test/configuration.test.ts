/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { App, Stack } from "aws-cdk-lib";
import {
  BedrockLlmProcessorConfigurationSchema,
  ClassificationMethod,
} from "../src";

describe("Configuration Tests", () => {
  let app: App;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    new Stack(app, "TestStack");
  });

  describe("BedrockLlmProcessorConfigurationSchema", () => {
    test("can create schema instance", () => {
      const schema = new BedrockLlmProcessorConfigurationSchema();
      expect(schema).toBeDefined();
    });

    test("schema bind method exists", () => {
      const schema = new BedrockLlmProcessorConfigurationSchema();

      // Just verify the method exists without calling it
      expect(typeof schema.bind).toBe("function");
    });
  });

  describe("ClassificationMethod enum", () => {
    test("enum values are accessible", () => {
      expect(ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION).toBe(
        "multimodalPageLevelClassification",
      );
      expect(ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION).toBe(
        "textbasedHolisticClassification",
      );
    });

    test("enum can be used in object keys", () => {
      const config = {
        [ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION]:
          "multimodal",
        [ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION]: "textbased",
      };

      expect(
        config[ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION],
      ).toBe("multimodal");
      expect(
        config[ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION],
      ).toBe("textbased");
    });

    test("enum can be used in switch statements", () => {
      function getDescription(method: ClassificationMethod): string {
        switch (method) {
          case ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION:
            return "Uses multimodal models";
          case ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION:
            return "Uses text-based analysis";
          default:
            return "Unknown method";
        }
      }

      expect(
        getDescription(
          ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
        ),
      ).toBe("Uses multimodal models");
      expect(
        getDescription(ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION),
      ).toBe("Uses text-based analysis");
    });

    test("enum values can be compared", () => {
      expect(
        ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
      ).not.toBe(ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION);
    });

    test("enum can be used in arrays", () => {
      const methods = [
        ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
        ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
      ];

      expect(methods).toHaveLength(2);
      expect(methods).toContain(
        ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
      );
      expect(methods).toContain(
        ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
      );
    });

    test("enum can be converted to string", () => {
      const method1 = ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION;
      const method2 = ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION;

      expect(String(method1)).toBe("multimodalPageLevelClassification");
      expect(String(method2)).toBe("textbasedHolisticClassification");
    });

    test("enum can be JSON serialized", () => {
      const config = {
        method: ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
      };

      const json = JSON.stringify(config);
      const parsed = JSON.parse(json);

      expect(parsed.method).toBe("multimodalPageLevelClassification");
    });

    test("enum validation function", () => {
      function isValidClassificationMethod(
        value: string,
      ): value is ClassificationMethod {
        return Object.values(ClassificationMethod).includes(
          value as ClassificationMethod,
        );
      }

      expect(
        isValidClassificationMethod("multimodalPageLevelClassification"),
      ).toBe(true);
      expect(
        isValidClassificationMethod("textbasedHolisticClassification"),
      ).toBe(true);
      expect(isValidClassificationMethod("invalidMethod")).toBe(false);
      expect(isValidClassificationMethod("")).toBe(false);
    });

    test("enum completeness", () => {
      const allMethods = Object.values(ClassificationMethod);
      const allKeys = Object.keys(ClassificationMethod);

      expect(allMethods).toHaveLength(2);
      expect(allKeys).toHaveLength(2);

      expect(allMethods).toContain("multimodalPageLevelClassification");
      expect(allMethods).toContain("textbasedHolisticClassification");

      expect(allKeys).toContain("MULTIMODAL_PAGE_LEVEL_CLASSIFICATION");
      expect(allKeys).toContain("TEXTBASED_HOLISTIC_CLASSIFICATION");
    });
  });

  describe("Module structure validation", () => {
    test("configuration exports are available", () => {
      expect(BedrockLlmProcessorConfigurationSchema).toBeDefined();
      expect(typeof BedrockLlmProcessorConfigurationSchema).toBe("function");
    });

    test("classification method export is available", () => {
      expect(ClassificationMethod).toBeDefined();
      expect(typeof ClassificationMethod).toBe("object");
    });
  });

  describe("Type safety validation", () => {
    test("ClassificationMethod is properly typed", () => {
      const method: ClassificationMethod =
        ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION;
      expect(typeof method).toBe("string");
    });

    test("ClassificationMethod can be used in function parameters", () => {
      function processWithMethod(method: ClassificationMethod): string {
        return `Processing with ${method}`;
      }

      const result1 = processWithMethod(
        ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
      );
      const result2 = processWithMethod(
        ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
      );

      expect(result1).toBe("Processing with multimodalPageLevelClassification");
      expect(result2).toBe("Processing with textbasedHolisticClassification");
    });

    test("ClassificationMethod can be used in return types", () => {
      function getDefaultMethod(): ClassificationMethod {
        return ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION;
      }

      const method = getDefaultMethod();
      expect(method).toBe(
        ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
      );
    });
  });
});
