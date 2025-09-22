import path from "path";
import { ModelData } from "@aws-cdk/aws-sagemaker-alpha";
import { Aws, Duration, RemovalPolicy, Size } from "aws-cdk-lib";
import { Platform } from "aws-cdk-lib/aws-ecr-assets";
import {
  Effect,
  ManagedPolicy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { DockerImageCode, DockerImageFunction } from "aws-cdk-lib/aws-lambda";
import { Bucket, IBucket } from "aws-cdk-lib/aws-s3";
import { Trigger } from "aws-cdk-lib/triggers";
import { Construct } from "constructs";
import { SagemakerTrainResource } from "./custom-resources";

export interface RvlCdipModelProps {
  readonly dataBucket?: IBucket;
}

/**
 * This construct builds a SageMaker model using HuggingFace's rvl-cdip dataset
 */
export class RvlCdipModel extends Construct {
  public readonly modelData: ModelData;

  constructor(scope: Construct, id: string, props?: RvlCdipModelProps) {
    super(scope, id);

    const dataBucket =
      props?.dataBucket ??
      new Bucket(this, "DataBucket", {
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true,
      });

    // 1. Generate Demo Data from HuggingFace's rvl-dcip dataset
    const generateDemoDataLambda = new DockerImageFunction(
      this,
      "GenerateDemoDataLambda",
      {
        code: DockerImageCode.fromImageAsset(
          path.join(__dirname, "lambda-fns/generate_demo_data"),
          {
            platform: Platform.LINUX_AMD64,
          },
        ),
        timeout: Duration.minutes(15),
        memorySize: 2048, // Increased memory for handling larger datasets
        ephemeralStorageSize: Size.gibibytes(2),
        environment: {
          DATA_BUCKET: dataBucket.bucketName,
          DATA_BUCKET_PREFIX: "rvl-cdip",
          MAX_WORKERS: "20",
        },
      },
    );

    // Grant permissions to the Lambda
    dataBucket.grantReadWrite(generateDemoDataLambda);

    generateDemoDataLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["textract:DetectDocumentText"],
        resources: ["*"],
      }),
    );

    const generateDemoDataTrigger = new Trigger(this, "GenerateDemoData", {
      handler: generateDemoDataLambda,
      timeout: Duration.minutes(15),
    });

    // Create a dedicated role for SageMaker
    const sagemakerExecutionRole = new Role(this, "SageMakerExecutionRole", {
      assumedBy: new ServicePrincipal("sagemaker.amazonaws.com"),
      description:
        "Role for SageMaker training jobs created by the Lambda function",
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("AmazonSageMakerFullAccess"),
      ],
    });

    sagemakerExecutionRole.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["logs:DescribeLogStreams"],
        resources: [
          `arn:${Aws.PARTITION}:logs:${Aws.REGION}:${Aws.ACCOUNT_ID}:log-group:/aws/sagemaker/TrainingJobs:log-stream:*`,
        ],
      }),
    );

    // Grant SageMaker role access to the data bucket
    dataBucket.grantReadWrite(sagemakerExecutionRole);

    const bucketPrefix = "sagemaker";
    const jobNamePrefix = "rvl-cdip-classifier-2";

    // Create the SageMaker training job as a custom resource
    const sagemakerTrainResource = new SagemakerTrainResource(
      this,
      "SagemakerTrainResource",
      {
        sagemakerRole: sagemakerExecutionRole,
        bucket: dataBucket,
        bucketPrefix: bucketPrefix,
        jobNamePrefix: jobNamePrefix,
        maxEpochs: 3,
        baseModel: "microsoft/udop-large",
        dataBucket: dataBucket,
        dataBucketPrefix: "rvl-cdip",
      },
    );

    sagemakerTrainResource.node.addDependency(generateDemoDataTrigger);

    this.modelData = ModelData.fromBucket(
      dataBucket,
      sagemakerTrainResource.modelPath,
    );
  }
}
