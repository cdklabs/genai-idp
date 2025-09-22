import {
  SageMakerClient,
  DescribeTrainingJobCommand,
} from "@aws-sdk/client-sagemaker";
import { CloudFormationCustomResourceEvent } from "aws-lambda";

const client = new SageMakerClient({});

export const handler = async (event: CloudFormationCustomResourceEvent) => {
  console.log("Event 👉", event);
  const requestType = event.RequestType;
  console.log("Request Type is 👉", requestType);
  let isReady = true;

  if (requestType !== "Delete") {
    const jobNamePrefix = event.ResourceProperties.JobNamePrefix as string;
    const requestId = event.RequestId;
    const jobName = `${jobNamePrefix}-${requestId.slice(-10)}`;
    console.log("jobName", jobName);
    const jobResponse = await client.send(
      new DescribeTrainingJobCommand({
        TrainingJobName: jobName,
      }),
    );

    if (jobResponse) {
      isReady = jobResponse.TrainingJobStatus === "Completed";
    }
  }

  const response = {
    IsComplete: isReady,
  };

  console.log("Return value:", JSON.stringify(response));
  return response;
};
