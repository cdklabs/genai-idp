/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * LambdaHook bridge for SageMaker-based document classification.
 *
 * Uses `workLocationUri` from the LambdaHook payload to read the page's
 * image and raw Textract JSON directly from S3, then calls the SageMaker
 * endpoint with the original artifact URIs.
 */

import * as path from "path";
import {
  SageMakerRuntimeClient,
  InvokeEndpointCommand,
} from "@aws-sdk/client-sagemaker-runtime";

const smClient = new SageMakerRuntimeClient();
const ENDPOINT = process.env.SAGEMAKER_ENDPOINT_NAME!;

interface ConverseRequest {
  modelId: string;
  messages: Array<{
    role: string;
    content: Array<{ text?: string; image?: any }>;
  }>;
  system?: Array<{ text: string }>;
  inferenceConfig?: Record<string, unknown>;
  context?: string;
  workLocationUri?: string;
}

export async function handler(event: ConverseRequest) {
  console.log("Bridge Lambda received event:", JSON.stringify(event, null, 2));
  const workLocation = event.workLocationUri;

  if (!workLocation) {
    console.error("No workLocationUri in payload — cannot locate page artifacts");
    return {
      output: {
        message: { role: "assistant", content: [{ text: "unclassified" }] },
      },
      usage: { inputTokens: 0, outputTokens: 0 },
    };
  }

  // Derive artifact URIs from the working location prefix
  // OCR step stores: image.jpg, rawText.json, result.json under the page directory
  const [protocol, rest] = workLocation.split("://");
  const imageUri = `${protocol}://${path.posix.join(rest, "image.jpg")}`;
  const rawTextUri = `${protocol}://${path.posix.join(rest, "rawText.json")}`;

  console.log(`Classifying with SageMaker endpoint ${ENDPOINT}`);
  console.log(`  image: ${imageUri}`);
  console.log(`  textract: ${rawTextUri}`);

  const body = JSON.stringify({
    input_image: imageUri,
    input_textract: rawTextUri,
    prompt: "",
    debug: 0,
  });

  const resp = await smClient.send(
    new InvokeEndpointCommand({
      EndpointName: ENDPOINT,
      ContentType: "application/json",
      Body: body,
    }),
  );

  const prediction =
    JSON.parse(Buffer.from(resp.Body!).toString()).prediction ?? "unclassified";

  console.log(`SageMaker prediction: ${prediction}`);

  return {
    output: {
      message: { role: "assistant", content: [{ text: prediction }] },
    },
    usage: { inputTokens: 0, outputTokens: 0 },
  };
}
