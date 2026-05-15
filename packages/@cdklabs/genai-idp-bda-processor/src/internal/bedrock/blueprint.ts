/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Lazy, Names, Resource } from "aws-cdk-lib";
import * as bedrock from "aws-cdk-lib/aws-bedrock";
import { Construct } from "constructs";

/**
 * Interface representing a Bedrock Data Automation Blueprint.
 */
export interface IBlueprint {
  /** The ARN of the blueprint. */
  readonly arn: string;
}

/**
 * The type of content the blueprint processes.
 */
export enum BlueprintType {
  DOCUMENT = "DOCUMENT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  VIDEO = "VIDEO",
}

/**
 * Properties for creating a Blueprint.
 */
export interface BlueprintProps {
  /** Optional name for the blueprint. Auto-generated if omitted. */
  readonly blueprintName?: string;
  /** The content type this blueprint handles. */
  readonly type: BlueprintType;
  /** The blueprint schema defining extraction fields. */
  readonly schema: { [key: string]: any };
}

/**
 * L2 construct for an Amazon Bedrock Data Automation Blueprint.
 *
 * Wraps `CfnBlueprint` with sensible defaults and a clean interface.
 *
 * @internal
 */
export class Blueprint extends Resource implements IBlueprint {
  public readonly arn: string;

  constructor(scope: Construct, id: string, props: BlueprintProps) {
    super(scope, id, {
      physicalName:
        props.blueprintName ??
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
