/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { IConfigurationTable } from "../configuration-table";
import { LogLevel } from "../log-level";
import { IProcessingEnvironmentApi } from "../processing-environment-api";
import { VpcConfiguration } from "../vpc-configuration";
import { DiscoveryQueue, IDiscoveryQueue } from "./discovery-queue";
import { DiscoveryTable, IDiscoveryTable } from "./discovery-table";
import {
  DiscoveryProcessorFunction,
  DiscoveryUploadResolverFunction,
} from "./functions";

/**
 * Result of initializing DocumentDiscovery functions.
 */
export interface DocumentDiscoveryFunctions {
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
 * Interface for the document discovery system.
 * Provides document analysis capabilities for automated configuration generation.
 */
export interface IDocumentDiscovery {
  /**
   * The S3 bucket for document discovery uploads.
   */
  readonly discoveryBucket: IBucket;

  /**
   * The DynamoDB table that tracks discovery job status and metadata.
   */
  readonly discoveryTable: IDiscoveryTable;

  /**
   * The SQS queue for processing discovery jobs asynchronously.
   */
  readonly discoveryQueue: IDiscoveryQueue;

  /**
   * Initialize Lambda functions with API dependencies.
   * Called by ProcessingEnvironmentApi when adding document discovery.
   */
  initializeFunctions(
    api: IProcessingEnvironmentApi,
    configurationTable: IConfigurationTable,
    encryptionKey?: kms.IKey,
    logLevel?: LogLevel,
    logRetention?: logs.RetentionDays,
    vpcConfiguration?: VpcConfiguration,
  ): DocumentDiscoveryFunctions;
}

/**
 * Properties for configuring the DocumentDiscovery construct.
 */
export interface DocumentDiscoveryProps {
  /**
   * The S3 bucket for document discovery uploads.
   */
  readonly discoveryBucket: IBucket;

  /**
   * Optional properties for the discovery table.
   */
  readonly discoveryTable?: IDiscoveryTable;

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
  readonly discoveryBucket: IBucket;
  readonly discoveryTable: IDiscoveryTable;
  readonly discoveryQueue: IDiscoveryQueue;

  private readonly props: DocumentDiscoveryProps;

  constructor(scope: Construct, id: string, props: DocumentDiscoveryProps) {
    super(scope, id);

    this.props = props;
    this.discoveryBucket = props.discoveryBucket;
    this.discoveryTable =
      props.discoveryTable ?? new DiscoveryTable(this, "Table");
    this.discoveryQueue = new DiscoveryQueue(this, "Queue");
  }

  /**
   * Initialize the Lambda functions with API URL.
   * Called by ProcessingEnvironmentApi when adding document discovery.
   */
  public initializeFunctions(
    api: IProcessingEnvironmentApi,
    configurationTable: IConfigurationTable,
    encryptionKey?: kms.IKey,
    logLevel?: LogLevel,
    logRetention?: logs.RetentionDays,
    vpcConfiguration?: VpcConfiguration,
  ): DocumentDiscoveryFunctions {
    const uploadResolverFunction = new DiscoveryUploadResolverFunction(
      this,
      "UploadResolver",
      {
        discoveryBucket: this.discoveryBucket,
        discoveryTable: this.discoveryTable,
        discoveryQueue: this.discoveryQueue,
        encryptionKey: encryptionKey ?? this.props.encryptionKey,
        logLevel: logLevel ?? this.props.logLevel,
        logRetention: logRetention ?? this.props.logRetention,
        vpc: vpcConfiguration?.vpc ?? this.props.vpcConfiguration?.vpc,
        vpcSubnets:
          vpcConfiguration?.vpcSubnets ??
          this.props.vpcConfiguration?.vpcSubnets,
      },
    );

    const processorFunction = new DiscoveryProcessorFunction(
      this,
      "Processor",
      {
        discoveryBucket: this.discoveryBucket,
        discoveryTable: this.discoveryTable,
        discoveryQueue: this.discoveryQueue,
        configurationTable: configurationTable,
        api: api,
        encryptionKey: encryptionKey ?? this.props.encryptionKey,
        logLevel: logLevel ?? this.props.logLevel,
        logRetention: logRetention ?? this.props.logRetention,
        vpc: vpcConfiguration?.vpc ?? this.props.vpcConfiguration?.vpc,
        vpcSubnets:
          vpcConfiguration?.vpcSubnets ??
          this.props.vpcConfiguration?.vpcSubnets,
      },
    );

    return { uploadResolverFunction, processorFunction };
  }
}
