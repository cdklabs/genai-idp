/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { FixedKeyTableProps } from "../fixed-key-table-props";
import { LogLevel } from "../log-level";
import { VpcConfiguration } from "../vpc-configuration";
import {
  DiscoveryQueue,
  DiscoveryQueueProps,
  IDiscoveryQueue,
} from "./discovery-queue";
import { DiscoveryTable, IDiscoveryTable } from "./discovery-table";
import {
  DiscoveryProcessorFunction,
  DiscoveryUploadResolverFunction,
} from "./functions";

/**
 * Interface for the document discovery system.
 * Provides document analysis capabilities for automated configuration generation.
 */
export interface IDocumentDiscovery {
  /**
   * The DynamoDB table that tracks discovery job status and metadata.
   */
  readonly discoveryTable: IDiscoveryTable;

  /**
   * The SQS queue for processing discovery jobs asynchronously.
   */
  readonly discoveryQueue: IDiscoveryQueue;

  /**
   * The Lambda function that handles discovery document uploads.
   */
  readonly uploadResolverFunction: DiscoveryUploadResolverFunction;

  /**
   * The Lambda function that processes discovery jobs.
   */
  readonly processorFunction: DiscoveryProcessorFunction;
}

/**
 * Properties for configuring the DocumentDiscovery construct.
 */
export interface DocumentDiscoveryProps {
  /**
   * The S3 bucket for input documents.
   */
  readonly inputBucket: IBucket;

  /**
   * The AppSync API URL for status updates.
   */
  readonly appSyncApiUrl: string;

  /**
   * Optional properties for the discovery table.
   */
  readonly tableProps?: FixedKeyTableProps;

  /**
   * Optional properties for the discovery queue.
   */
  readonly queueProps?: DiscoveryQueueProps;

  /**
   * Optional KMS key for encrypting resources.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The retention period for CloudWatch logs.
   */
  readonly logRetention?: logs.RetentionDays;

  /**
   * The log level for Lambda functions.
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional VPC configuration for Lambda functions.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * A construct that provides document discovery capabilities.
 *
 * This construct creates the infrastructure needed for automated document
 * analysis and configuration generation, including DynamoDB table, SQS queue,
 * and Lambda functions for processing discovery jobs.
 */
export class DocumentDiscovery extends Construct implements IDocumentDiscovery {
  readonly discoveryTable: IDiscoveryTable;
  readonly discoveryQueue: IDiscoveryQueue;
  readonly uploadResolverFunction: DiscoveryUploadResolverFunction;
  readonly processorFunction: DiscoveryProcessorFunction;

  constructor(scope: Construct, id: string, props: DocumentDiscoveryProps) {
    super(scope, id);

    // Create table and queue
    this.discoveryTable = new DiscoveryTable(this, "Table", props.tableProps);
    this.discoveryQueue = new DiscoveryQueue(this, "Queue", props.queueProps);

    // Create Lambda functions
    this.uploadResolverFunction = new DiscoveryUploadResolverFunction(
      this,
      "UploadResolver",
      {
        inputBucket: props.inputBucket,
        discoveryTable: this.discoveryTable,
        discoveryQueue: this.discoveryQueue,
        encryptionKey: props.encryptionKey,
        logRetention: props.logRetention,
        vpc: props.vpcConfiguration?.vpc,
        vpcSubnets: props.vpcConfiguration?.vpcSubnets,
      },
    );

    this.processorFunction = new DiscoveryProcessorFunction(this, "Processor", {
      inputBucket: props.inputBucket,
      discoveryTable: this.discoveryTable,
      discoveryQueue: this.discoveryQueue,
      appSyncApiUrl: props.appSyncApiUrl,
      encryptionKey: props.encryptionKey,
      logRetention: props.logRetention,
      vpc: props.vpcConfiguration?.vpc,
      vpcSubnets: props.vpcConfiguration?.vpcSubnets,
    });
  }
}
