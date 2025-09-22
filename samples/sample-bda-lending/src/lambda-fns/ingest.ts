import {
  BedrockAgentClient,
  StartIngestionJobCommand,
} from "@aws-sdk/client-bedrock-agent";
import { Context, EventBridgeEvent } from "aws-lambda";

const client = new BedrockAgentClient({ region: process.env.AWS_REGION });

export const handler = async (
  event: EventBridgeEvent<string, string>,
  context: Context,
) => {
  const input = {
    knowledgeBaseId: process.env.KNOWLEDGE_BASE_ID,
    dataSourceId: process.env.DATA_SOURCE_ID,
    clientToken: context.awsRequestId,
  };
  const command = new StartIngestionJobCommand(input);

  const response = await client.send(command);

  return JSON.stringify({
    ingestionJob: response.ingestionJob,
  });
};
