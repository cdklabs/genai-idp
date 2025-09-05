import { Aws, CustomResource } from "aws-cdk-lib";
import { Effect, PolicyStatement, IRole } from "aws-cdk-lib/aws-iam";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { SagemakerTrainProvider } from "./sagemaker-train-provider";

export interface SagemakerTrainResourceProps {
  /**
   * The SageMaker execution role
   */
  sagemakerRole: IRole;

  /**
   * The S3 bucket for storing model artifacts
   */
  bucket: IBucket;

  /**
   * The prefix for S3 paths in the bucket
   * @default "sagemaker"
   */
  bucketPrefix?: string;

  /**
   * The prefix for the training job name
   */
  jobNamePrefix: string;

  /**
   * The maximum number of epochs for training
   * @default 3
   */
  maxEpochs?: number;

  /**
   * The base model to use for training
   * @default "microsoft/udop-large"
   */
  baseModel?: string;

  /**
   * The S3 bucket containing the training data
   * @default - Same as bucket
   */
  dataBucket?: IBucket;

  /**
   * The prefix for the training data in the data bucket
   * @default - Same as bucketPrefix
   */
  dataBucketPrefix?: string;
}

/**
 * A custom resource that creates a SageMaker training job
 */
export class SagemakerTrainResource extends Construct {
  /**
   * The name of the SageMaker training job
   */
  public readonly jobName: string;

  /**
   * The S3 path to the trained model artifact
   */
  public readonly modelPath: string;

  constructor(
    scope: Construct,
    id: string,
    props: SagemakerTrainResourceProps,
  ) {
    super(scope, id);

    // Create the provider
    const provider = new SagemakerTrainProvider(this, "Provider");

    // Allow Lambda to pass the SageMaker role to SageMaker
    provider.function.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["iam:PassRole"],
        resources: [props.sagemakerRole.roleArn],
      }),
    );

    provider.function.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["logs:DescribeLogStreams", "logs:GetLogEvents"],
        resources: [
          `arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/sagemaker/TrainingJobs:log-stream:*`,
        ],
      }),
    );

    // Grant the provider's function access to the buckets
    props.bucket.grantReadWrite(provider.function);
    if (props.dataBucket && props.dataBucket !== props.bucket) {
      props.dataBucket.grantReadWrite(provider.function);
    }

    // Create the custom resource
    const resource = new CustomResource(this, "Resource", {
      serviceToken: provider.provider.serviceToken,
      pascalCaseProperties: true,
      properties: {
        sagemakerRoleArn: props.sagemakerRole.roleArn,
        bucket: props.bucket.bucketName,
        bucketPrefix: props.bucketPrefix || "sagemaker",
        jobNamePrefix: props.jobNamePrefix,
        maxEpochs: props.maxEpochs || 3,
        baseModel: props.baseModel || "microsoft/udop-large",
        dataBucket: props.dataBucket?.bucketName,
        dataBucketPrefix: props.dataBucketPrefix,
      },
    });

    // Extract the outputs
    this.jobName = resource.getAttString("job_name");
    this.modelPath = resource.getAttString("model_path");
  }
}
