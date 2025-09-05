/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as ec2 from "aws-cdk-lib/aws-ec2";
/**
 * Configuration for VPC settings of document processing components.
 * Controls VPC placement, subnet selection, and security group assignments
 * for Lambda functions and other resources in the processing environment.
 */
export interface VpcConfiguration {
  /**
   * Optional VPC where document processing components will be deployed.
   * When provided, Lambda functions and other resources will be deployed within this VPC.
   */
  readonly vpc?: ec2.IVpc;

  /**
   * Optional subnet selection for VPC-deployed resources.
   * Determines which subnets within the VPC will host document processing components.
   */
  readonly vpcSubnets?: ec2.SubnetSelection;

  /**
   * Optional security groups to apply to document processing components.
   * Controls network access and security rules for VPC-deployed resources.
   */
  readonly securityGroups?: ec2.ISecurityGroup[];

  /**
   * Controls whether outbound traffic is allowed to all destinations.
   * When true, allows document processing components to access external resources.
   */
  readonly allowAllOutbound?: boolean;

  /**
   * Controls whether IPv6 outbound traffic is allowed to all destinations.
   * When true, allows document processing components to access external resources via IPv6.
   */
  readonly allowAllIpv6Outbound?: boolean;
}
