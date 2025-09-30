/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import {
  IdpPythonFunctionOptions,
  IdpPythonLayerVersion,
  ITrackingTable,
  LogLevel,
} from "@cdklabs/genai-idp";
import { Duration, Stack } from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { IStateMachine } from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

export interface HitlProcessFunctionProps extends IdpPythonFunctionOptions {
  /**
   * The log level for the HITL process function.
   * Controls the verbosity of logs generated during HITL event processing.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Used to retrieve task tokens and update document status when HITL events are received.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The S3 bucket containing input documents to be processed.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents are stored.
   */
  readonly outputBucket: IBucket;

  /**
   * The Step Functions state machine for document processing.
   * Used to send task success/failure notifications when HITL completes.
   */
  readonly stateMachine: IStateMachine;
}

export class HitlProcessFunction extends PythonFunction {
  constructor(scope: Construct, id: string, props: HitlProcessFunctionProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.PYTHON_3_12,
      entry: path.join(
        __dirname,
        "..",
        "..",
        "assets",
        "lambdas",
        "hitl-process-function",
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
      },
    });

    // Grant permissions
    props.trackingTable.grantReadWriteData(this);
    props.inputBucket.grantRead(this);
    props.outputBucket.grantReadWrite(this);

    // Step Functions permissions for sending task success/failure
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["states:SendTaskSuccess", "states:SendTaskFailure"],
        resources: ["*"],
      }),
    );

    // CloudWatch metrics permissions
    this.addToRolePolicy(
      new PolicyStatement({
        actions: ["cloudwatch:PutMetricData"],
        resources: ["*"],
      }),
    );
  }
}
