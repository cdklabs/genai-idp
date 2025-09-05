/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

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
      resourceArns: [this.arn],
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
