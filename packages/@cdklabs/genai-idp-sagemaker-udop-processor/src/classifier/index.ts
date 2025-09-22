/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sagemaker from "@aws-cdk/aws-sagemaker-alpha";
import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

/**
 * Configuration properties for the basic SageMaker-based document classifier.
 *
 * This classifier uses a SageMaker endpoint to categorize documents based on
 * their content and structure, enabling targeted extraction strategies.
 */
export interface BasicSagemakerClassifierProps {
  /**
   * Optional KMS key for encrypting classifier resources.
   * When provided, ensures data security for the SageMaker endpoint
   * and associated resources.
   */
  readonly key?: kms.IKey;

  /**
   * The S3 bucket where classification outputs will be stored.
   * Contains intermediate results from the document classification process.
   */
  readonly outputBucket: s3.IBucket;

  /**
   * The model data for the SageMaker endpoint.
   * Contains the trained model artifacts that will be deployed to the endpoint.
   * This can be a pre-trained document classification model like RVL-CDIP or UDOP.
   */
  readonly modelData: sagemaker.ModelData;

  /**
   * The instance type to use for the SageMaker endpoint.
   * Determines the computational resources available for document classification.
   * For deep learning models, GPU instances are typically recommended.
   */
  readonly instanceType: sagemaker.InstanceType;

  /**
   * The minimum number of instances for the SageMaker endpoint.
   * Controls the baseline capacity for document classification.
   *
   * @default 1
   * @min 1
   */
  readonly minInstanceCount?: number;

  /**
   * The maximum number of instances for the SageMaker endpoint.
   * Controls the maximum capacity for document classification during high load.
   *
   * @default 4
   * @min 1
   */
  readonly maxInstanceCount?: number;

  /**
   * The target number of invocations per instance per minute.
   * Used to determine when to scale the endpoint in or out.
   *
   * @default 20
   * @min 1
   */
  readonly targetInvocationsPerInstancePerMinute?: number;

  /**
   * The cooldown period after scaling in before another scale-in action can occur.
   * Prevents rapid fluctuations in endpoint capacity.
   *
   * @default cdk.Duration.minutes(5)
   */
  readonly scaleInCooldown?: cdk.Duration;

  /**
   * The cooldown period after scaling out before another scale-out action can occur.
   * Prevents rapid fluctuations in endpoint capacity.
   *
   * @default cdk.Duration.minutes(1)
   */
  readonly scaleOutCooldown?: cdk.Duration;
}

/**
 * A basic SageMaker-based document classifier for the Pattern 3 document processor.
 *
 * This construct provides a simple way to deploy a SageMaker endpoint with a document
 * classification model that can categorize documents based on their content and structure.
 * It supports models like RVL-CDIP or UDOP for specialized document classification tasks.
 *
 * The basic classifier includes standard auto-scaling capabilities and sensible defaults
 * for common use cases. For more advanced configurations, consider creating your own
 * SageMaker endpoint and passing it directly to the SagemakerUdopProcessor.
 *
 * @example
 * const classifier = new BasicSagemakerClassifier(this, 'Classifier', {
 *   outputBucket: bucket,
 *   modelData: ModelData.fromAsset('./model'),
 *   instanceType: InstanceType.ML_G4DN_XLARGE,
 * });
 *
 * const processor = new SagemakerUdopProcessor(this, 'Processor', {
 *   environment,
 *   classifierEndpoint: classifier.endpoint,
 *   // ... other configuration
 * });
 */
export class BasicSagemakerClassifier extends Construct {
  /**
   * The SageMaker endpoint that hosts the document classification model.
   * This endpoint is invoked during document processing to determine
   * document types and categories.
   */
  public readonly endpoint: sagemaker.IEndpoint;

  constructor(
    scope: Construct,
    id: string,
    props: BasicSagemakerClassifierProps,
  ) {
    super(scope, id);

    const {
      minInstanceCount = 1,
      maxInstanceCount = 4,
      scaleInCooldown = cdk.Duration.minutes(5),
      scaleOutCooldown = cdk.Duration.minutes(1),
      targetInvocationsPerInstancePerMinute = 20,
    } = props;

    const udopModel = new sagemaker.Model(this, "UDOPModel", {
      containers: [
        {
          // INFO: see https://docs.aws.amazon.com/sagemaker/latest/dg-ecr-paths/sagemaker-algo-docker-registry-paths.html
          image: sagemaker.ContainerImage.fromDlc(
            "pytorch-inference",
            "2.1.0-gpu-py310",
          ),
          modelData: props.modelData,
          environment: {
            SAGEMAKER_PROGRAM: "inference.py",
            SAGEMAKER_SUBMIT_DIRECTORY: "/opt/ml/model/code",
            SAGEMAKER_CONTAINER_LOG_LEVEL: "20",
            SAGEMAKER_REGION: cdk.Aws.REGION,
          },
        },
      ],
    });

    props.outputBucket.grantRead(udopModel);
    props.key?.grantEncryptDecrypt(udopModel);

    const variantName = "AllTraffic";

    const udopEndpointConfig = new sagemaker.EndpointConfig(
      this,
      "UDOPEndpointConfig",
      {
        instanceProductionVariants: [
          {
            variantName,
            initialInstanceCount: 1,
            instanceType: props.instanceType,
            model: udopModel,
            initialVariantWeight: 1.0,
          },
        ],
      },
    );

    const udopEndpoint = new sagemaker.Endpoint(this, "UDOPEndpoint", {
      endpointConfig: udopEndpointConfig,
    });

    const udopInstanceCount = udopEndpoint
      .findInstanceProductionVariant(variantName)
      .autoScaleInstanceCount({
        minCapacity: minInstanceCount,
        maxCapacity: maxInstanceCount,
      });

    udopInstanceCount.scaleOnInvocations("ScalingPolicy", {
      policyName: `${cdk.Stack.of(this).stackName}-endpoint-scaling`,
      scaleInCooldown: scaleInCooldown,
      scaleOutCooldown: scaleOutCooldown,
      maxRequestsPerSecond: targetInvocationsPerInstancePerMinute / 60,
    });

    this.endpoint = udopEndpoint;
  }
}

/**
 * @deprecated Use BasicSagemakerClassifier instead. This alias will be removed in a future version.
 */
export const SagemakerClassifier = BasicSagemakerClassifier;

/**
 * @deprecated Use BasicSagemakerClassifierProps instead. This alias will be removed in a future version.
 */
export type SagemakerClassifierProps = BasicSagemakerClassifierProps;
