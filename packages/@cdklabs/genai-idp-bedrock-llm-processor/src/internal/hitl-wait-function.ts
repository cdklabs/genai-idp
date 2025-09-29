/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import {
  IdpPythonFunctionOptions,
  IdpPythonLayerVersion,
  IProcessingEnvironmentApi,
  ITrackingTable,
  LogLevel,
} from "@cdklabs/genai-idp";
import { Duration, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface HitlWaitFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The log level for the HITL wait function.
   * Controls the verbosity of logs generated during HITL processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Used to store HITL task tokens and update document status during human review workflows.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Serves as a temporary storage location during document processing
   * for files generated during the extraction workflow.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status
   * and notify clients about processing progress.
   */
  readonly api?: IProcessingEnvironmentApi;

  /**
   * SageMaker A2I Review Portal URL for HITL workflows.
   */
  readonly sageMakerA2IReviewPortalUrl?: string;
}

export class HitlWaitFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: HitlWaitFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "hitl-wait-function",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            `mkdir -p /tmp/builddir`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            `rsync -rL /tmp/builddir/ /asset-output`,
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      layers: [
        IdpPythonLayerVersion.getOrCreate(Stack.of(scope), "docs_service"),
      ],
      timeout: Duration.seconds(300),
      memorySize: 512,
      environment: {
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        WORKING_BUCKET: props.workingBucket.bucketName,
        SAGEMAKER_A2I_REVIEW_PORTAL_URL: props.sageMakerA2IReviewPortalUrl ?? "",
        ...(props.api && {
          APPSYNC_API_URL: props.api.graphqlUrl,
          DOCUMENT_TRACKING_MODE: "appsync",
        }),
      },
    });

    // Grant permissions
    props.trackingTable.grantReadWriteData(this);
    props.workingBucket.grantReadWrite(this);

    // CloudWatch metrics permissions
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["cloudwatch:PutMetricData"],
        resources: ["*"],
      }),
    );

    if (props.api) {
      props.api.grantMutation(this, "updateDocumentStatus");
    }
  }
}
