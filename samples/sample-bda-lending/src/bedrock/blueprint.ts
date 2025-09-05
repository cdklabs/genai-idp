import { Lazy, Names, Resource } from "aws-cdk-lib";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { Construct } from "constructs";

export interface IBlueprint {
  readonly arn: string;
}

export enum BlueprintType {
  DOCUMENT = "DOCUMENT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

export interface BlueprintProps {
  readonly blueprintName?: string;
  readonly type: BlueprintType;
  readonly schema: { [key: string]: any };
}

export class Blueprint extends Resource implements IBlueprint {
  readonly arn: string;

  constructor(scope: Construct, id: string, props: BlueprintProps) {
    super(scope, id, {
      physicalName:
        props.blueprintName ||
        Lazy.string({
          produce: () =>
            Names.uniqueResourceName(this, {
              maxLength: 128,
              allowedSpecialCharacters: "-_",
            }),
        }),
    });

    const resource = new bedrock.CfnBlueprint(this, "Resource", {
      blueprintName: this.physicalName,
      type: props.type,
      schema: props.schema,
    });

    this.arn = resource.attrBlueprintArn;
  }
}
