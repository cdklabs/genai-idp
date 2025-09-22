import * as path from "path";
import { Duration, Size } from "aws-cdk-lib";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetentionDays } from "aws-cdk-lib/aws-logs";
import { Provider } from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
/**
 * A custom resource provider that creates a SageMaker training job
 */
export class SagemakerTrainProvider extends Construct {
  /**
   * The custom resource provider
   */
  public readonly provider: Provider;

  /**
   * The Lambda function that implements the provider
   */
  public readonly function: DockerImageFunction;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Create the Lambda function using the Docker image
    this.function = new DockerImageFunction(this, "Function", {
      code: DockerImageCode.fromImageAsset(
        path.join(__dirname, "../lambda-fns/sagemaker_train"),
        {
          platform: Platform.LINUX_AMD64,
        },
      ),
      timeout: Duration.minutes(15),
      memorySize: 2048,
      ephemeralStorageSize: Size.gibibytes(2),
      logRetention: RetentionDays.ONE_WEEK,
    });

    // Allow Lambda to create and manage SageMaker resources
    this.function.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "sagemaker:CreateTrainingJob",
          "sagemaker:DescribeTrainingJob",
          "sagemaker:StopTrainingJob",
          "sagemaker:ListTrainingJobs",
        ],
        resources: ["*"],
      }),
    );

    const isCompleteHandler = new NodejsFunction(this, "IsComplete", {
      entry: path.join(
        __dirname,
        "..",
        "lambda-fns",
        "sagemaker_train_is_complete",
        "index.ts",
      ),
    });

    isCompleteHandler.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sagemaker:DescribeTrainingJob"],
        resources: ["*"],
      }),
    );

    // Create the custom resource provider
    this.provider = new Provider(this, "Provider", {
      onEventHandler: this.function,
      isCompleteHandler: isCompleteHandler,
      queryInterval: Duration.minutes(1),
    });
  }
}
