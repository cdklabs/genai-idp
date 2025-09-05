/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { InstanceType, ModelData } from "@aws-cdk/aws-sagemaker-alpha";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import {
  BedrockFoundationModel,
  CrossRegionInferenceProfile,
  CrossRegionInferenceProfileRegion,
} from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import { App, Aspects, CfnResource, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";

import { StringParameter } from "aws-cdk-lib/aws-ssm";
import {
  SagemakerUdopProcessor,
  BasicSagemakerClassifier,
  SagemakerUdopProcessorConfiguration,
} from "../../src";

const app = new App();

const stack = new Stack(app, "Pattern3TestStack");

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

const environment = new ProcessingEnvironment(stack, "Environment", {
  metricNamespace: stack.stackName,
  inputBucket,
  outputBucket,
  workingBucket,
});

const bucketNameParam = StringParameter.fromStringParameterName(
  stack,
  "ModelBucketName",
  "/idp/pattern3/model/bucketname",
);

const objectKeyParam = StringParameter.fromStringParameterName(
  stack,
  "ModelObjectKey",
  "/idp/pattern3/model/objectkey",
);

const classifier = new BasicSagemakerClassifier(stack, "Classifier", {
  outputBucket,
  modelData: ModelData.fromBucket(
    Bucket.fromBucketName(stack, "ModelBucket", bucketNameParam.stringValue),
    objectKeyParam.stringValue,
  ),
  instanceType: InstanceType.G5_2XLARGE,
});

new SagemakerUdopProcessor(stack, "Processor", {
  environment,
  classifierEndpoint: classifier.endpoint, // Pass the endpoint directly
  configuration: SagemakerUdopProcessorConfiguration.rvlCdipPackageSample({
    extractionModel: CrossRegionInferenceProfile.fromConfig({
      geoRegion: CrossRegionInferenceProfileRegion.US,
      model: BedrockFoundationModel.AMAZON_NOVA_PRO_V1,
    }),
  }),
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
