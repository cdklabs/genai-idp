/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { Grant, IGrantable } from "aws-cdk-lib/aws-iam";

/**
 * Interface representing an Amazon Bedrock Data Automation Project.
 *
 * Data Automation Projects in Amazon Bedrock provide a managed way to extract
 * structured data from documents using foundation models. This interface allows
 * the IDP solution to work with existing Bedrock Data Automation Projects.
 */
export interface IDataAutomationProject {
  /**
   * The Amazon Resource Name (ARN) of the Bedrock Data Automation Project.
   *
   * This ARN is used to invoke the project for document processing and is
   * referenced in IAM policies to grant appropriate permissions.
   *
   * Format: arn:aws:bedrock:{region}:{account}:data-automation-project/{project-id}
   */
  readonly arn: string;

  grantInvokeAsync(grantee: IGrantable): Grant;
}
