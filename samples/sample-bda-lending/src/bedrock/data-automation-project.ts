import { Aws, Lazy, Names, Resource } from "aws-cdk-lib";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";
import { IBlueprint } from "./blueprint";

export interface IDataAutomationProject {
  readonly arn: string;
  grantInvokeAsync(grantee: IGrantable): Grant;
}

export interface DataAutomationProjectProps {
  readonly projectName?: string;
  readonly projectDescription?: string;
  readonly standardOutputConfiguration?: bedrock.CfnDataAutomationProject.StandardOutputConfigurationProperty;
  readonly blueprints?: IBlueprint[];
  readonly overrideConfiguration?: bedrock.CfnDataAutomationProject.OverrideConfigurationProperty;
}

export class DataAutomationProject extends Resource {
  public readonly arn: string;
  constructor(scope: Construct, id: string, props: DataAutomationProjectProps) {
    super(scope, id, {
      physicalName:
        props.projectName ||
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
        blueprints: props.blueprints?.map((b) => ({ blueprintArn: b.arn })),
      },
      overrideConfiguration: props.overrideConfiguration,
    });

    this.arn = resource.attrProjectArn;
  }

  grantInvokeAsync(grantee: IGrantable) {
    return Grant.addToPrincipal({
      grantee,
      actions: ["bedrock:InvokeDataAutomationAsync"],
      resourceArns: [
        this.arn,
        // TODO: for now it is only US. Make sure this is resolved once other geos support BDA
        `arn:${Aws.PARTITION}:bedrock:us-east-1:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:us-east-2:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:us-west-1:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
        `arn:${Aws.PARTITION}:bedrock:us-west-2:${Aws.ACCOUNT_ID}:data-automation-profile/us.data-automation-v1`,
      ],
    });
  }
}
