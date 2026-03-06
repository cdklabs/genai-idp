/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct, IConstruct } from "constructs";
import { ITrackingTable } from "../../tracking-table";
import { VpcConfiguration } from "../../vpc-configuration";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Interface for the Document Editing feature.
 *
 * Provides document section editing and change processing capabilities,
 * allowing users to modify document sections and trigger reprocessing.
 *
 * @since v0.4.16
 */
export interface IDocumentEditing extends IConstruct {}

/**
 * Properties for configuring the DocumentEditing feature.
 *
 * @since v0.4.16
 */
export interface DocumentEditingProps {
  /**
   * The DynamoDB table that tracks document processing status.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The SQS queue for document processing requests.
   */
  readonly documentQueue: IQueue;

  /**
   * The S3 bucket for working files during document processing.
   */
  readonly workingBucket: IBucket;

  /**
   * The S3 bucket where source documents are stored.
   */
  readonly inputBucket: IBucket;

  /**
   * The S3 bucket where processed documents are stored.
   */
  readonly outputBucket: IBucket;

  /**
   * Data retention period in days for processed documents.
   */
  readonly dataRetentionInDays: number;

  /**
   * Optional KMS key for encrypting function resources.
   *
   * @default - AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The retention period for CloudWatch logs.
   *
   * @default logs.RetentionDays.ONE_WEEK
   */
  readonly logRetention?: logs.RetentionDays;

  /**
   * Optional VPC configuration for Lambda functions.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Document Editing feature for section-level document modifications.
 *
 * Provides the ability to modify document sections and trigger reprocessing.
 * This enables users to make corrections or adjustments to processed documents
 * and have those changes reflected in the processing results.
 *
 * Integrates with the ProcessingEnvironmentApi as a feature using the
 * `api.addFeature(documentEditing)` pattern.
 *
 * @example
 * const documentEditing = new DocumentEditing(this, 'DocumentEditing', {
 *   trackingTable,
 *   documentQueue,
 *   workingBucket,
 *   inputBucket,
 *   outputBucket,
 *   dataRetentionInDays: 30,
 * });
 * api.addFeature(documentEditing);
 *
 * @since v0.4.16
 */
export class DocumentEditing
  extends Construct
  implements IDocumentEditing, IProcessingEnvironmentApiFeature
{
  private readonly trackingTable: ITrackingTable;
  private readonly documentQueue: IQueue;
  private readonly workingBucket: IBucket;
  private readonly inputBucket: IBucket;
  private readonly outputBucket: IBucket;
  private readonly dataRetentionInDays: number;
  private readonly encryptionKey?: kms.IKey;
  private readonly logRetention?: logs.RetentionDays;
  private readonly vpcConfiguration?: VpcConfiguration;

  constructor(scope: Construct, id: string, props: DocumentEditingProps) {
    super(scope, id);

    this.trackingTable = props.trackingTable;
    this.documentQueue = props.documentQueue;
    this.workingBucket = props.workingBucket;
    this.inputBucket = props.inputBucket;
    this.outputBucket = props.outputBucket;
    this.dataRetentionInDays = props.dataRetentionInDays;
    this.encryptionKey = props.encryptionKey;
    this.logRetention = props.logRetention;
    this.vpcConfiguration = props.vpcConfiguration;
  }

  /**
   * Attach this Document Editing feature to the ProcessingEnvironmentApi.
   *
   * Creates the process changes data source and resolver.
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    const processChangesResolverFunction =
      new functions.ProcessChangesResolverFunction(
        api as Construct,
        "ProcessChangesResolverFunction",
        {
          trackingTable: this.trackingTable,
          documentQueue: this.documentQueue,
          workingBucket: this.workingBucket,
          inputBucket: this.inputBucket,
          outputBucket: this.outputBucket,
          api,
          dataRetentionInDays: this.dataRetentionInDays,
          encryptionKey: this.encryptionKey,
          logGroup: new logs.LogGroup(
            api as Construct,
            "ProcessChangesResolverFunctionLogGroup",
            {
              encryptionKey: this.encryptionKey,
              retention: this.logRetention || logs.RetentionDays.ONE_WEEK,
            },
          ),
          ...this.vpcConfiguration,
        },
      );

    const dataSource = api.addLambdaDataSource(
      "ProcessChangesDataSource",
      processChangesResolverFunction,
      {
        name: "ProcessChangesDataSource",
        description: "Lambda function for processing section changes",
      },
    );

    dataSource.createResolver("ProcessChangesResolver", {
      typeName: "Mutation",
      fieldName: "processChanges",
    });
  }
}
