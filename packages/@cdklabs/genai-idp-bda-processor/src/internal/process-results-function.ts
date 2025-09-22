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
import { Metric } from "aws-cdk-lib/aws-cloudwatch";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement } from "aws-cdk-lib/aws-iam";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IDataAutomationProject } from "../data-automation-project";

/**
 * Properties for the process results function.
 *
 * This function processes the extraction results from completed BDA jobs,
 * formats the data according to the application schema, and stores the
 * structured results for downstream consumption.
 */
export interface ProcessResultsFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The namespace for CloudWatch metrics emitted by the function.
   * Used to organize and identify metrics related to results processing,
   * including processing times, success rates, and error counts.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during results processing.
   * Higher log levels provide more detailed information for troubleshooting.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * The function updates this table with BDA job IDs and initial status
   * when jobs are submitted for processing.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for storing configuration data.
   * Used to store and retrieve configuration parameters such as confidence thresholds
   * and other processing settings.
   */
  readonly configurationTable: ITable;

  /**
   * The DynamoDB table for storing BDA process records metadata.
   * Used to track individual document processing records within BDA jobs,
   * enabling detailed monitoring and HITL workflow coordination.
   */
  readonly bdaMetadataTable: ITable;

  /**
   * The S3 bucket containing input documents that were processed.
   * The function may reference original documents to correlate with
   * extraction results during post-processing.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The function reads BDA job results from this bucket and writes
   * the formatted, structured data back to it.
   */
  readonly outputBucket: IBucket;

  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Used for temporary storage of files during the post-processing workflow,
   * such as intermediate JSON transformations or validation results.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function, including
   * extraction results, structured data, and any sensitive information.
   */
  readonly encryptionKey?: IKey;

  /**
   * The Bedrock Data Automation Project used for document processing.
   * This project defines the document processing workflow in Amazon Bedrock,
   * including document types, extraction schemas, and processing rules.
   */
  readonly dataAutomationProject: IDataAutomationProject;

  /**
   * Optional ProcessingEnvironmentApi for progress notifications.
   * When provided, the function will use GraphQL mutations to update document status
   * and notify clients about processing progress.
   */
  readonly api?: IProcessingEnvironmentApi;

  /**
   * Enable Human In The Loop (HITL) review for documents with low confidence scores.
   * When enabled, documents that fall below the confidence threshold will be
   * sent for human review before proceeding with the workflow.
   *
   * @default false
   */
  readonly enableHITL?: boolean;

  /**
   * URL for the SageMaker A2I review portal used for HITL tasks.
   * This URL is provided to human reviewers to access documents that require
   * manual review and correction.
   *
   * @default - No review portal URL is provided
   */
  readonly sageMakerA2IReviewPortalURL?: string;
}

export class ProcessResultsFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: ProcessResultsFunctionProps,
  ) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "processresults_function",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            // Create temporary directory for dependencies
            `mkdir -p /tmp/builddir`,
            // Copy source files directly to output
            `mkdir -p /asset-output`,
            // `rsync -rLv /asset-input/${indexPath}/ /asset-output/${indexPath}`,
            `rsync -rL /asset-input/ /tmp/builddir`,
            // Install dependencies to temporary directory
            `cd /tmp/builddir`,
            `sed -i '/\\.\\/lib/d' requirements.txt || true`,
            `python -m pip install -r requirements.txt -t /tmp/builddir || true`,
            // Clean up unnecessary files in the temp directory
            `find /tmp/builddir -type d -name "*.egg-info" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "__pycache__" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "build" -exec rm -rf {} +`,
            `find /tmp/builddir -type d -name "tests" -exec rm -rf {} +`,
            // Copy only necessary dependencies to the output
            `rsync -rL /tmp/builddir/ /asset-output`,
            // Clean up temporary directory
            `rm -rf /tmp/builddir`,
            `cd /asset-output`,
          ].join(" && "),
        ],
      },
      layers: [
        IdpPythonLayerVersion.getOrCreate(Stack.of(scope), "docs_service"),
      ],
      timeout: Duration.seconds(900),
      memorySize: 4096,
      environment: {
        METRIC_NAMESPACE: props.metricNamespace,
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
        TRACKING_TABLE: props.trackingTable.tableName,
        DB_NAME: props.bdaMetadataTable.tableName,
        CONFIGURATION_TABLE_NAME: props.configurationTable.tableName,
        DOCUMENT_TRACKING_MODE: props.api ? "appsync" : "dynamodb",
        WORKING_BUCKET: props.workingBucket.bucketName,
        BDA_PROJECT_ARN: props.dataAutomationProject.arn,
        ENABLE_HITL: props.enableHITL === true ? "true" : "false",
        SAGEMAKER_A2I_REVIEW_PORTAL_URL:
          props.sageMakerA2IReviewPortalURL || "",
        ...(props.api && { APPSYNC_API_URL: props.api.graphqlUrl }),
      },
    });

    props.trackingTable.grantReadWriteData(this);
    props.configurationTable.grantReadWriteData(this);
    props.bdaMetadataTable.grantReadWriteData(this);
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);
    props.workingBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);
    Metric.grantPutMetricData(this);

    // Grant AppSync permissions if API is provided
    props.api?.grantMutation(this);

    // Grant SageMaker A2I permissions for HITL
    this.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sagemaker:StartHumanLoop"],
        resources: ["arn:aws:sagemaker:*:*:flow-definition/*"],
      }),
    );

    // Grant SSM permissions for parameter access
    this.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "ssm:GetParameter",
          "ssm:PutParameter",
          "ssm:GetParametersByPath",
        ],
        resources: ["*"],
      }),
    );

    // Grant Bedrock Data Automation permissions
    this.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "bedrock:GetDataAutomationProject",
          "bedrock:ListDataAutomationProjects",
          "bedrock:GetBlueprint",
          "bedrock:GetBlueprintRecommendation",
        ],
        resources: ["*"],
      }),
    );
  }
}
