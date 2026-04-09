/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Aws, Lazy, Names, Resource } from "aws-cdk-lib";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { IBlueprint } from "./blueprint";

/**
 * Interface representing an Amazon Bedrock Data Automation Project.
 */
export interface IDataAutomationProject {
  /** The ARN of the Data Automation Project. */
  readonly arn: string;

  /** Grant the given identity permissions to invoke this project asynchronously. */
  grantInvokeAsync(grantee: IGrantable): Grant;
}

/**
 * Properties for creating a DataAutomationProject.
 */
export interface DataAutomationProjectProps {
  /** Optional name for the project. Auto-generated if omitted. */
  readonly projectName?: string;
  /** Optional description for the project. */
  readonly projectDescription?: string;
  /** Standard output configuration for the project. */
  readonly standardOutputConfiguration?: bedrock.CfnDataAutomationProject.StandardOutputConfigurationProperty;
  /** Override configuration for the project. */
  readonly overrideConfiguration?: bedrock.CfnDataAutomationProject.OverrideConfigurationProperty;
  /** Blueprints to attach to the project. */
  readonly blueprints?: IBlueprint[];
}

/**
 * L2 construct for an Amazon Bedrock Data Automation Project.
 *
 * Wraps `CfnDataAutomationProject` with sensible defaults, blueprint linking,
 * and `grantInvokeAsync` for IAM permissions.
 *
 * @internal
 */
export class DataAutomationProject
  extends Resource
  implements IDataAutomationProject
{
  public readonly arn: string;

  constructor(scope: Construct, id: string, props: DataAutomationProjectProps) {
    super(scope, id, {
      physicalName:
        props.projectName ??
        Lazy.string({
          produce: () =>
            Names.uniqueResourceName(this, {
              maxLength: 128,
              allowedSpecialCharacters: "-_",
            }),
        }),
    });

    const resource = new bedrock.CfnDataAutomationProject(this, "Resource", {
      projectName: this.physicalName,
      projectDescription: props.projectDescription,
      standardOutputConfiguration: props.standardOutputConfiguration,
      customOutputConfiguration: props.blueprints && {
        blueprints: props.blueprints.map((b) => ({ blueprintArn: b.arn })),
      },
      overrideConfiguration: props.overrideConfiguration,
    });

    this.arn = resource.attrProjectArn;
  }

  public grantInvokeAsync(grantee: IGrantable): Grant {
    return Grant.addToPrincipal({
      grantee,
      actions: ["bedrock:InvokeDataAutomationAsync"],
      resourceArns: [
        this.arn,
        `arn:${Aws.PARTITION}:bedrock:${Aws.REGION}:${Aws.ACCOUNT_ID}:data-automation-profile/*.data-automation-v1`,
      ],
    });
  }
}
