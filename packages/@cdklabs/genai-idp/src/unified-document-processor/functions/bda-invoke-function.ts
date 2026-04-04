/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as path from "path";
import * as lambda_python from "@aws-cdk/aws-lambda-python-alpha";
import * as cdk from "aws-cdk-lib";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { IdpPythonFunctionOptions } from "../../functions/idp-python-function-options";
import { IdpPythonLayerVersion } from "../../idp-python-layer-version";
import { ITrackingTable } from "../../tracking-table";
import { LogLevel } from "../../log-level";
import { VpcConfiguration } from "../../vpc-configuration";

/**
 * Properties for the BDA Invoke function.
 *
 * This function invokes Amazon Bedrock Data Automation (BDA) for document processing.
 * It has minimal environment variables — no AppSync URL, no working bucket.
 *
 * @since 0.5.2
 */
export interface BdaInvokeFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The DynamoDB table for tracking document processing status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table for configuration storage.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The CloudWatch metric namespace for emitting processing metrics.
   */
  readonly metricNamespace: string;

  /**
   * The log level for the function.
   * Controls the verbosity of logs generated during processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The S3 bucket for input documents.
   */
  readonly inputBucket: s3.IBucket;

  /**
   * The S3 bucket for processed output.
   */
  readonly outputBucket: s3.IBucket;

  /**
   * The S3 bucket for intermediate working files.
   */
  readonly workingBucket: s3.IBucket;

  /**
   * Optional KMS encryption key.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional VPC configuration for the Lambda function.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Lambda function that invokes Amazon Bedrock Data Automation (BDA) for document processing.
 *
 * This function is BDA-specific and handles the invocation of BDA data automation projects.
 * It uses a Step Functions waitForTaskToken pattern — the state machine pauses until
 * the BDA completion function calls SendTaskSuccess/SendTaskFailure.
 *
 * Environment variables:
 * - TRACKING_TABLE: Document tracking table name
 * - METRIC_NAMESPACE: CloudWatch metric namespace (stack name)
 * - MAX_WORKERS: Maximum concurrent workers (hardcoded to 20)
 * - LOG_LEVEL: Logging level
 *
 * @since 0.5.2
 */
export class BdaInvokeFunction extends lambda_python.PythonFunction {
  constructor(scope: Construct, id: string, props: BdaInvokeFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: lambda.Runtime.PYTHON_3_12,
      architecture: lambda.Architecture.ARM_64,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "..",
        "assets",
        "lambdas",
        "unified",
        "bda_invoke_function",
      ),
      bundling: {
        command: [
          "bash",
          "-c",
          [
            `mkdir -p /tmp/builddir`,
            `mkdir -p /asset-output`,
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
      layers: [IdpPythonLayerVersion.getOrCreateForArchitecture(scope, lambda.Architecture.ARM_64)],
      timeout: cdk.Duration.minutes(15),
      memorySize: 4096,
      environment: {
        TRACKING_TABLE: props.trackingTable.tableName,
        METRIC_NAMESPACE: props.metricNamespace,
        MAX_WORKERS: "20",
        LOG_LEVEL: props.logLevel ?? LogLevel.INFO,
      },
      ...(props.vpcConfiguration && {
        vpc: props.vpcConfiguration.vpc,
        vpcSubnets: props.vpcConfiguration.vpcSubnets,
        securityGroups: props.vpcConfiguration.securityGroups,
        allowAllOutbound: props.vpcConfiguration.allowAllOutbound,
        allowAllIpv6Outbound: props.vpcConfiguration.allowAllIpv6Outbound,
      }),
      deadLetterQueue: new sqs.Queue(scope, `${id}DLQ`, {
        encryption: props.encryptionKey
          ? sqs.QueueEncryption.KMS
          : sqs.QueueEncryption.SQS_MANAGED,
        encryptionMasterKey: props.encryptionKey,
        retentionPeriod: cdk.Duration.days(14),
      }),
      retryAttempts: 2,
    });

    // Grant permissions
    cloudwatch.Metric.grantPutMetricData(this);
    props.trackingTable.grantReadWriteData(this);
    props.inputBucket.grantRead(this);
    props.workingBucket.grantReadWrite(this);
    props.outputBucket.grantReadWrite(this);
    props.encryptionKey?.grantEncryptDecrypt(this);

    // BDA API permissions
    this.addToRolePolicy(new iam.PolicyStatement({
      actions: [
        "bedrock:InvokeDataAutomationAsync",
        "bedrock:GetDataAutomationStatus",
        "bedrock:GetDataAutomationProject",
        "bedrock:ListDataAutomationProjects",
        "bedrock:GetBlueprint",
        "bedrock:GetBlueprintRecommendation",
      ],
      resources: ["*"],
    }));
  }
}
