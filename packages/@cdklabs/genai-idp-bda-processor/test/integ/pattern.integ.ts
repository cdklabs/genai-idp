/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import {
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
} from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { App, Aspects, CfnResource, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { SimpleDataAutomationProject } from "./simple-data-automation-project";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";

const app = new App();

const stack = new Stack(app, "Pattern1TestStack");

const inputBucket = new Bucket(stack, "InputBucket", {
  eventBridgeEnabled: true,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const outputBucket = new Bucket(stack, "OutputBucket", {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const workingBucket = new Bucket(stack, "WorkingBucket", {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const environment = new ProcessingEnvironment(stack, "Environment", {
  metricNamespace: stack.stackName,
  inputBucket,
  outputBucket,
  workingBucket,
});

new BdaProcessor(stack, "Pattern1", {
  environment,
  configuration: BdaProcessorConfiguration.lendingPackageSample({
    summarizationModel: CrossRegionInferenceProfile.fromConfig({
      geoRegion: CrossRegionInferenceProfileRegion.US,
      model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
    }),
  }),
  dataAutomationProject: new SimpleDataAutomationProject(
    stack,
    "BedrockProject",
  ),
});

// INFO: clean up all the resources after deletion
Aspects.of(app).add({
  visit(node) {
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  },
});

app.synth();
