/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import {
  BedrockLlmProcessor,
  BedrockLlmProcessorConfiguration,
  IBedrockLlmProcessor,
  BedrockLlmProcessorProps,
  ClassificationMethod,
  Invokable,
  InvokableType,
} from "../src";

describe("BedrockLlmProcessor - Module Exports", () => {
  test("BedrockLlmProcessor can be imported", () => {
    expect(BedrockLlmProcessor).toBeDefined();
    expect(typeof BedrockLlmProcessor).toBe("function");
  });

  test("BedrockLlmProcessorConfiguration can be imported", () => {
    expect(BedrockLlmProcessorConfiguration).toBeDefined();
    expect(typeof BedrockLlmProcessorConfiguration).toBe("function");
  });

  test("ClassificationMethod enum is available", () => {
    expect(
      ClassificationMethod.MULTIMODAL_PAGE_LEVEL_CLASSIFICATION,
    ).toBeDefined();
    expect(
      ClassificationMethod.TEXTBASED_HOLISTIC_CLASSIFICATION,
    ).toBeDefined();
  });

  test("Invokable re-exports are available", () => {
    expect(Invokable).toBeDefined();
    expect(InvokableType).toBeDefined();
  });

  test("interface types compile correctly", () => {
    const processorInterface: IBedrockLlmProcessor = {} as any;
    const processorProps: BedrockLlmProcessorProps = {} as any;
    expect(processorInterface).toBeDefined();
    expect(processorProps).toBeDefined();
  });

  test("configuration has factory methods", () => {
    expect(BedrockLlmProcessorConfiguration.lendingPackageSample).toBeDefined();
    expect(BedrockLlmProcessorConfiguration.bankStatementSample).toBeDefined();
    expect(BedrockLlmProcessorConfiguration.docSplit).toBeDefined();
    expect(BedrockLlmProcessorConfiguration.rvlCdip).toBeDefined();
    expect(BedrockLlmProcessorConfiguration.fromFile).toBeDefined();
  });
});
