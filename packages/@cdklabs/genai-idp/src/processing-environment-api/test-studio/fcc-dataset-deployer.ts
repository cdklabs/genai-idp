/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cr from "aws-cdk-lib/custom-resources";
import { Construct } from "constructs";
import { FccDatasetDeployerFunction } from "./functions";
import { ITrackingTable } from "../../tracking-table";

/**
 * Properties for the FCC Dataset Deployer construct.
 */
export interface FccDatasetDeployerProps {
  /**
   * The S3 bucket for storing test documents and baselines.
   * The dataset will be deployed to this bucket.
   */
  readonly testSetBucket: s3.IBucket;

  /**
   * The DynamoDB table for tracking test sets.
   * A test set record will be created for the deployed dataset.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional encryption key for the deployment function.
   * Used to encrypt/decrypt data during deployment.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Version of the dataset to deploy.
   * Used to track dataset versions and avoid re-deployment.
   *
   * @default "1.0"
   */
  readonly datasetVersion?: string;

  /**
   * Description of the dataset deployment.
   * Stored in the test set metadata for reference.
   *
   * @default "RealKIE-FCC-Verified dataset from HuggingFace"
   */
  readonly datasetDescription?: string;
}

/**
 * Custom resource construct for deploying the RealKIE-FCC-Verified dataset.
 *
 * This construct creates a CloudFormation custom resource that downloads
 * the RealKIE-FCC-Verified dataset from HuggingFace and deploys it to
 * the test bucket with proper baseline files for evaluation purposes.
 *
 * The deployment is idempotent - it will only download and deploy the dataset
 * if it doesn't already exist with the specified version.
 *
 */
export class FccDatasetDeployer extends Construct {
  /**
   * The Lambda function that performs the dataset deployment.
   */
  public readonly deployerFunction: lambda.IFunction;

  /**
   * The custom resource that triggers the deployment.
   */
  public readonly customResource: cdk.CustomResource;

  constructor(scope: Construct, id: string, props: FccDatasetDeployerProps) {
    super(scope, id);

    // Create the dataset deployer function
    this.deployerFunction = new FccDatasetDeployerFunction(
      this,
      "DeployerFunction",
      {
        testSetBucket: props.testSetBucket,
        trackingTable: props.trackingTable,
        encryptionKey: props.encryptionKey,
      },
    );

    // Create the custom resource provider
    const provider = new cr.Provider(this, "Provider", {
      onEventHandler: this.deployerFunction,
      logRetention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });

    // Create the custom resource
    this.customResource = new cdk.CustomResource(this, "Resource", {
      serviceToken: provider.serviceToken,
      properties: {
        DatasetVersion: props.datasetVersion || "1.0",
        DatasetDescription:
          props.datasetDescription ||
          "RealKIE-FCC-Verified dataset from HuggingFace",
        // Add a timestamp to force updates when needed
        Timestamp: new Date().toISOString(),
      },
    });

    // Add dependency to ensure the custom resource runs after the function is ready
    this.customResource.node.addDependency(this.deployerFunction);
  }

  /**
   * Get the dataset version that was deployed.
   */
  public get datasetVersion(): string {
    return this.customResource.getAttString("DatasetVersion");
  }

  /**
   * Get the number of files that were deployed.
   */
  public get fileCount(): number {
    return Number(this.customResource.getAtt("FileCount"));
  }

  /**
   * Get the deployment message.
   */
  public get deploymentMessage(): string {
    return this.customResource.getAttString("Message");
  }
}
