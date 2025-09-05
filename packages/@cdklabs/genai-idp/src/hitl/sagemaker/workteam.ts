/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as sagemaker from "aws-cdk-lib/aws-sagemaker";
import { Construct } from "constructs";

/**
 * Properties for configuring the SageMaker workteam for HITL.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface WorkteamProps {
  readonly workTeamName?: string;
  /**
   * The Cognito User Pool for authentication.
   */
  readonly userPool: cognito.IUserPool;

  /**
   * The Cognito User Pool Client for A2I integration.
   */
  readonly userPoolClient: cognito.IUserPoolClient;

  /**
   * The Cognito User Group that contains the human reviewers.
   */
  readonly userGroup: cognito.CfnUserPoolGroup;

  /**
   * Optional existing private workforce ARN to use instead of creating a new workteam.
   * When provided, the construct will use the existing workforce instead of creating a new one.
   */
  readonly existingPrivateWorkforceArn?: string;

  /**
   * Description for the workteam.
   * @default "Private workteam for working on A2I tasks"
   */
  readonly description?: string;
}

/**
 * Interface for SageMaker workteam used in HITL workflows.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface IWorkteam extends cdk.IResource {
  /**
   * The ARN of the SageMaker workteam.
   */
  readonly workteamArn: string;

  /**
   * The name of the SageMaker workteam.
   */
  readonly workteamName: string;
}

/**
 * A construct that creates a SageMaker workteam for Human-in-the-Loop (HITL) workflows.
 *
 * This construct sets up a private workteam that can be used with Amazon A2I (Augmented AI)
 * for human review tasks. The workteam is integrated with Cognito for authentication
 * and user management.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class Workteam extends cdk.Resource implements IWorkteam {
  /**
   * The ARN of the SageMaker workteam.
   */
  public readonly workteamArn: string;

  /**
   * The name of the SageMaker workteam.
   */
  public readonly workteamName: string;

  /**
   * Creates a new Workteam.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the workteam
   */
  constructor(scope: Construct, id: string, props: WorkteamProps) {
    super(scope, id);

    const resource = new sagemaker.CfnWorkteam(this, "Resource", {
      workteamName: props.workTeamName,
      description:
        props.description || "Private workteam for working on A2I tasks",
      memberDefinitions: [
        {
          cognitoMemberDefinition: {
            cognitoUserPool: props.userPool.userPoolId,
            cognitoUserGroup: props.userGroup.groupName!,
            cognitoClientId: props.userPoolClient.userPoolClientId,
          },
        },
      ],
    });

    this.workteamName = resource.attrWorkteamName;
    this.workteamArn = `arn:${cdk.Aws.PARTITION}:sagemaker:${cdk.Stack.of(this).region}:${cdk.Stack.of(this).account}:workteam/private-crowd/${this.workteamName}`;
  }
}
