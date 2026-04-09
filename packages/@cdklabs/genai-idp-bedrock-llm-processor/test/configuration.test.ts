/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import {
  BedrockLlmProcessorConfiguration,
  BedrockLlmProcessorConfigurationDefinition,
} from "../src";

describe("BedrockLlmProcessorConfiguration", () => {
  test("lendingPackageSample creates valid configuration", () => {
    const config = BedrockLlmProcessorConfiguration.lendingPackageSample();
    expect(config).toBeDefined();
    expect(config.definition).toBeDefined();
    expect(config.definition.raw()).toBeDefined();
  });

  test("bankStatementSample creates valid configuration", () => {
    const config = BedrockLlmProcessorConfiguration.bankStatementSample();
    expect(config).toBeDefined();
    expect(config.definition.raw()).toBeDefined();
  });

  test("definition has classificationMethod", () => {
    const config = BedrockLlmProcessorConfiguration.lendingPackageSample();
    expect(config.definition.classificationMethod).toBeDefined();
  });

  test("definition has ocrBackend", () => {
    const config = BedrockLlmProcessorConfiguration.lendingPackageSample();
    expect(config.definition.ocrBackend).toBeDefined();
  });
});

describe("BedrockLlmProcessorConfigurationDefinition", () => {
  test("all factory methods return valid definitions", () => {
    const factories = [
      () => BedrockLlmProcessorConfigurationDefinition.lendingPackageSample(),
      () =>
        BedrockLlmProcessorConfigurationDefinition.lendingPackageSampleGovCloud(),
      () => BedrockLlmProcessorConfigurationDefinition.bankStatementSample(),
      () => BedrockLlmProcessorConfigurationDefinition.docSplit(),
      () => BedrockLlmProcessorConfigurationDefinition.ocrBenchmark(),
      () => BedrockLlmProcessorConfigurationDefinition.realkieFccVerified(),
      () => BedrockLlmProcessorConfigurationDefinition.rvlCdip(),
      () =>
        BedrockLlmProcessorConfigurationDefinition.rvlCdipWithFewShotExamples(),
      () => BedrockLlmProcessorConfigurationDefinition.ruleExtraction(),
      () => BedrockLlmProcessorConfigurationDefinition.ruleValidation(),
    ];

    for (const factory of factories) {
      const def = factory();
      expect(def).toBeDefined();
      expect(def.raw()).toBeDefined();
      expect(def.classificationMethod).toBeDefined();
      expect(def.ocrBackend).toBeDefined();
    }
  });
});
