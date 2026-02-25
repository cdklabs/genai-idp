/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Aws } from "aws-cdk-lib";
import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";
import { IDataAutomationProject } from "../src";

/**
 * Mock implementation of IDataAutomationProject for testing
 */
export class MockDataAutomationProject implements IDataAutomationProject {
  public readonly arn: string;

  constructor(arn: string) {
    this.arn = arn;
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

/**
 * Helper function to create a mock data automation project for tests
 */
export function createMockDataAutomationProject(
  _scope: any, // Unused but kept for API consistency
  id: string,
  arn?: string,
): IDataAutomationProject {
  const projectArn =
    arn ||
    `arn:aws:bedrock:us-east-1:123456789012:data-automation-project/${id}`;
  return new MockDataAutomationProject(projectArn);
}
