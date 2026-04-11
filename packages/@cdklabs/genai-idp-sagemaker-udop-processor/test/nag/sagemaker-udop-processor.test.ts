/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Aspects, Stack } from "aws-cdk-lib";
import { Annotations, Match } from "aws-cdk-lib/assertions";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { AwsSolutionsChecks } from "cdk-nag";
import {
  SagemakerUdopProcessor,
  SagemakerUdopProcessorConfiguration,
} from "../../src";

describe("SagemakerUdopProcessor CDK Nag Compliance", () => {
  test("detects violations without suppressions", () => {
    const app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    const stack = new Stack(app, "TestStack");
    Aspects.of(stack).add(new AwsSolutionsChecks());

    const environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket: new Bucket(stack, "InputBucket"),
      outputBucket: new Bucket(stack, "OutputBucket"),
      workingBucket: new Bucket(stack, "WorkingBucket"),
      metricNamespace: "TestNamespace",
    });

    new SagemakerUdopProcessor(stack, "Processor", {
      environment,
      configurationBucket: new Bucket(stack, "ConfigurationBucket"),
      classifierEndpoint: sagemaker.Endpoint.fromEndpointName(
        stack,
        "Ep",
        "test-ep",
      ),
      configuration: SagemakerUdopProcessorConfiguration.rvlCdipPackageSample(),
    });

    app.synth();

    const warnings = Annotations.fromStack(stack).findWarning(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );
    const errors = Annotations.fromStack(stack).findError(
      "*",
      Match.stringLikeRegexp("AwsSolutions-.*"),
    );

    expect(warnings.length + errors.length).toBeGreaterThan(0);
  });
});
