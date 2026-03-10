/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

/**
 * Interface for the discovery processing queue.
 * This queue handles async processing of discovery jobs.
 */
export interface IDiscoveryQueue extends sqs.IQueue {}

/**
 * Properties for configuring the DiscoveryQueue construct.
 */
export interface DiscoveryQueueProps extends sqs.QueueProps {}

/**
 * An SQS queue for processing discovery jobs asynchronously.
 *
 * This construct creates a queue that receives discovery job messages
 * and triggers Lambda processing for document analysis.
 */
export class DiscoveryQueue extends sqs.Queue implements IDiscoveryQueue {
  /**
   * Creates a new DiscoveryQueue.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the SQS queue
   */
  constructor(scope: Construct, id: string, props?: DiscoveryQueueProps) {
    super(scope, id, {
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.days(14),
      ...props,
    });
  }
}
