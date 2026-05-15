/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { App, Aspects, CfnResource, RemovalPolicy, Stack } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import {
  ProcessingEnvironment,
  UnifiedDocumentProcessor,
  UnifiedDocumentProcessorConfiguration,
} from "../../src";

const app = new App();

const stack = new Stack(app, "UnifiedProcessorTestStack");

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

new UnifiedDocumentProcessor(stack, "UnifiedProcessor", {
  environment,
  configurationBucket,
  configuration: UnifiedDocumentProcessorConfiguration.lendingPackageSample(),
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
