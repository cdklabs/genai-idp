/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import {
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
} from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import {
  App,
  Aspects,
  CfnResource,
  Duration,
  RemovalPolicy,
  Stack,
} from "aws-cdk-lib";
import { FoundationModelIdentifier } from "aws-cdk-lib/aws-bedrock";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  BedrockLlmProcessor,
  BedrockLlmProcessorConfiguration,
  Invokable,
} from "../../src";

const app = new App();

const stack = new Stack(app, "LambdaHookTestStack");

const inputBucket = new Bucket(stack, "InputBucket", {
  eventBridgeEnabled: true,
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const workingBucket = new Bucket(stack, "WorkingBucket", {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const outputBucket = new Bucket(stack, "OutputBucket", {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const configurationBucket = new Bucket(stack, "ConfigurationBucket", {
  removalPolicy: RemovalPolicy.DESTROY,
  autoDeleteObjects: true,
});

const environment = new ProcessingEnvironment(stack, "Environment", {
  metricNamespace: stack.stackName,
  inputBucket,
  outputBucket,
  workingBucket,
});

const hookInvokable = CrossRegionInferenceProfile.fromConfig({
  model: BedrockFoundationModel.fromCdkFoundationModelId(
    new FoundationModelIdentifier("anthropic.claude-sonnet-4-5-20250929-v1:0"),
    {
      supportsAgents: true,
      supportsCrossRegion: true,
      optimizedForAgents: true,
    },
  ),
  geoRegion: CrossRegionInferenceProfileRegion.US,
});

// Custom Lambda that proxies OCR requests to Bedrock via the LambdaHook contract.
// Function name must start with GENAIIDP- (enforced by the Python runtime).
const hook = new NodejsFunction(stack, "OcrHookFunction", {
  functionName: `GENAIIDP-${stack.stackName}-ocr-hook`,
  entry: path.join(__dirname, "lambda-hook-handler", "index.mjs"),
  runtime: Runtime.NODEJS_22_X,
  timeout: Duration.minutes(5),
  memorySize: 256,
  environment: {
    TARGET_MODEL_ID: hookInvokable.invokableArn,
  },
});

hookInvokable.grantInvoke(hook);

// Grant read access to working bucket — the Python BedrockClient converts
// inline images to S3 references (s3Location) before invoking the hook Lambda
workingBucket.grantRead(hook);

new BedrockLlmProcessor(stack, "Processor", {
  environment,
  configurationBucket,
  configuration: BedrockLlmProcessorConfiguration.fromFile(
    path.join(__dirname, "bedrock-config.yaml"),
    {
      ocrInvokable: Invokable.fromFunction(hook),
      classificationInvokable: Invokable.fromFunction(hook),
      extractionInvokable: Invokable.fromFunction(hook),
      assessmentInvokable: Invokable.fromFunction(hook),
      summarizationInvokable: Invokable.fromFunction(hook),
    },
  ),
});

// Clean up all resources after deletion
Aspects.of(app).add({
  visit(node) {
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  },
});

app.synth();
