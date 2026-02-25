/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Aws, Lazy, Names, Resource } from "aws-cdk-lib";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { IGrantable, Grant } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { IDataAutomationProject } from "../../src";

export interface SimpleDataAutomationProjectProps {
  readonly projectName?: string;
  readonly projectDescription?: string;
}

export class SimpleDataAutomationProject
  extends Resource
  implements IDataAutomationProject
{
  public readonly projectName: string;
  public readonly arn: string;

  constructor(
    scope: Construct,
    id: string,
    props?: SimpleDataAutomationProjectProps,
  ) {
    super(scope, id, {
      physicalName:
        props?.projectName ||
        Lazy.string({
          produce: () =>
            Names.uniqueResourceName(this, {
              maxLength: 128,
              allowedSpecialCharacters: "-_",
            }),
        }),
    });

    // Create the Bedrock Data Automation Project
    const project = new bedrock.CfnDataAutomationProject(this, "Resource", {
      projectName: this.physicalName,
      projectDescription: props?.projectDescription,
      standardOutputConfiguration: {
        document: {
          extraction: {
            granularity: {
              types: ["PAGE", "ELEMENT"],
            },
            boundingBox: {
              state: "DISABLED",
            },
          },
          generativeField: {
            state: "DISABLED",
          },
          outputFormat: {
            textFormat: {
              types: ["MARKDOWN"],
            },
            additionalFileFormat: {
              state: "DISABLED",
            },
          },
        },
        image: {
          extraction: {
            category: {
              state: "ENABLED",
              types: ["TEXT_DETECTION"],
            },
            boundingBox: {
              state: "ENABLED",
            },
          },
          generativeField: {
            state: "ENABLED",
            types: ["IMAGE_SUMMARY"],
          },
        },
        video: {
          extraction: {
            category: {
              state: "ENABLED",
              types: ["TEXT_DETECTION"],
            },
            boundingBox: {
              state: "ENABLED",
            },
          },
          generativeField: {
            state: "ENABLED",
            types: ["VIDEO_SUMMARY"],
          },
        },
        audio: {
          extraction: {
            category: {
              state: "ENABLED",
              types: ["TRANSCRIPT"],
            },
          },
          generativeField: {
            state: "DISABLED",
          },
        },
      },
      overrideConfiguration: {
        document: {
          splitter: {
            state: "ENABLED",
          },
        },
      },
    });

    this.arn = project.attrProjectArn;
    this.projectName = this.physicalName;
  }

  grantInvokeAsync(grantee: IGrantable): Grant {
    return Grant.addToPrincipal({
      grantee,
      actions: ["bedrock:InvokeDataAutomationAsync"],
      resourceArns: [
        this.arn,
        // US regions
        `arn:${Aws.PARTITION}:bedrock:us-east-1:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:us-east-2:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:us-west-1:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:us-west-2:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        // EU regions
        `arn:${Aws.PARTITION}:bedrock:eu-central-1:${Aws.ACCOUNT_ID}:data-automation-profile/eu.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:eu-west-1:${Aws.ACCOUNT_ID}:data-automation-profile/eu.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:eu-west-2:${Aws.ACCOUNT_ID}:data-automation-profile/eu.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:eu-west-3:${Aws.ACCOUNT_ID}:data-automation-profile/eu.data-automation-v1`,
      ],
    });
  }
}
