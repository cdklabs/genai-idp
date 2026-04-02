// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * LambdaHook handler that proxies Converse API-compatible requests to Bedrock.
 * Resolves S3 image references back to bytes since Bedrock Converse expects inline bytes.
 */

import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

const bedrockClient = new BedrockRuntimeClient();
const s3Client = new S3Client();
const TARGET_MODEL_ID = process.env.TARGET_MODEL_ID || "us.amazon.nova-lite-v1:0";

/** Convert S3 image references to inline bytes for Bedrock Converse. */
async function resolveS3Images(content) {
  const resolved = [];
  for (const item of content) {
    if (item.image?.source?.s3Location) {
      const { uri } = item.image.source.s3Location;
      // Parse s3://bucket/key
      const match = uri.match(/^s3:\/\/([^/]+)\/(.+)$/);
      if (match) {
        const resp = await s3Client.send(new GetObjectCommand({ Bucket: match[1], Key: match[2] }));
        const bytes = await resp.Body.transformToByteArray();
        resolved.push({ image: { format: item.image.format, source: { bytes } } });
        continue;
      }
    }
    resolved.push(item);
  }
  return resolved;
}

export const handler = async (event) => {
  const { messages, system, inferenceConfig } = event;

  // Resolve S3 references in user message content
  const resolvedMessages = [];
  for (const msg of messages) {
    if (msg.content) {
      resolvedMessages.push({ ...msg, content: await resolveS3Images(msg.content) });
    } else {
      resolvedMessages.push(msg);
    }
  }

  const response = await bedrockClient.send(new ConverseCommand({
    modelId: TARGET_MODEL_ID,
    messages: resolvedMessages,
    system,
    inferenceConfig: {
      maxTokens: inferenceConfig?.maxTokens || 4096,
      ...(inferenceConfig?.topP > 0
        ? { topP: inferenceConfig.topP }
        : { temperature: inferenceConfig?.temperature ?? 0.0 }),
    },
  }));

  return { output: response.output, usage: response.usage };
};
