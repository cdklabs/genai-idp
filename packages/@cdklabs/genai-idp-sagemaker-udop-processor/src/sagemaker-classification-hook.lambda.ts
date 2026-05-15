/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * LambdaHook bridge for SageMaker-based document classification.
 *
 * Uses `pageOutputUri` from the LambdaHook payload to derive the page's
 * image and raw Textract JSON URIs in S3, then calls the SageMaker
 * endpoint for classification.
 *
 * Returns the prediction in the structured JSON format expected by
 * classify_page_bedrock: {"class": "<type>", "document_boundary": "continue"}
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
  pageOutputUri?: string;
}

/**
 * Build the structured classification response expected by classify_page_bedrock.
 *
 * The upstream parser (extract_structured_data_from_text) looks for a JSON object
 * with "class" and "document_boundary" keys. SageMaker UDOP doesn't produce
 * boundary information, so we always return "continue" to match the old behavior.
 */
function buildClassificationResponse(prediction: string) {
  const result = JSON.stringify({
    class: prediction,
    document_boundary: "continue",
  });

  return {
    output: {
      message: { role: "assistant", content: [{ text: result }] },
    },
    usage: { inputTokens: 0, outputTokens: 0 },
  };
}

export async function handler(event: ConverseRequest) {
  console.log("Bridge Lambda received event:", JSON.stringify(event, null, 2));
  const pageOutputUri = event.pageOutputUri;

  if (!pageOutputUri) {
    console.error("No pageOutputUri in payload — cannot locate page artifacts");
    return buildClassificationResponse("unclassified");
  }

  // Derive artifact URIs from the page output prefix
  // OCR step stores: image.jpg, rawText.json under the page directory
  const [protocol, rest] = pageOutputUri.split("://");
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

  try {
    const resp = await smClient.send(
      new InvokeEndpointCommand({
        EndpointName: ENDPOINT,
        ContentType: "application/json",
        Body: body,
      }),
    );

    const prediction =
      JSON.parse(Buffer.from(resp.Body!).toString()).prediction ??
      "unclassified";

    console.log(`SageMaker prediction: ${prediction}`);

    return buildClassificationResponse(prediction);
  } catch (err: any) {
    console.error(`SageMaker invocation failed: ${err.message}`);
    // Return unclassified on error — matches old classify_page_sagemaker behavior
    // for non-retryable errors. Retryable errors (throttling) are handled by
    // _invoke_lambda_hook_with_retry in the caller.
    return buildClassificationResponse("unclassified");
  }
}
