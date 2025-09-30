/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import path from "path";
import { PythonFunction } from "@aws-cdk/aws-lambda-python-alpha";
import {
  IdpPythonFunctionOptions,
  IdpPythonLayerVersion,
} from "@cdklabs/genai-idp";
import { Duration, Stack } from "aws-cdk-lib";
import { IKey } from "aws-cdk-lib/aws-kms";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface HitlStatusUpdateFunctionProps
  extends IdpPythonFunctionOptions {
  /**
   * The S3 bucket used for storing intermediate processing artifacts.
   * Serves as a temporary storage location during document processing
   * for files generated during the extraction workflow.
   */
  readonly workingBucket: IBucket;

  /**
   * Optional encryption key for the function.
   * Used to encrypt/decrypt data processed by the function.
   */
  readonly encryptionKey?: IKey;
}

export class HitlStatusUpdateFunction extends PythonFunction {
  constructor(
    scope: Construct,
    id: string,
    props: HitlStatusUpdateFunctionProps,
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
        "hitl-status-update-function",
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
      timeout: Duration.seconds(60),
      memorySize: 512,
    });

    // Grant permissions
    props.workingBucket.grantReadWrite(this);

    if (props.encryptionKey) {
      props.encryptionKey.grantEncryptDecrypt(this);
    }
  }
}
