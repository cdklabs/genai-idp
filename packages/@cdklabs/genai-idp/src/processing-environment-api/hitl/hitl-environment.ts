/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct, IConstruct } from "constructs";
import * as functions from "./functions";
import { LogLevel } from "../../log-level";
import { ITrackingTable } from "../../tracking-table";
import { VpcConfiguration } from "../../vpc-configuration";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Properties for configuring the HITL environment.
 *
 * As of v0.4.16, HITL functionality is built directly into the Web UI and no longer
 * requires SageMaker A2I infrastructure. This construct now only manages the
 * CompleteSectionReviewFunction for completing section reviews.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface HitlEnvironmentProps {
  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Required for section review completion.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The log level for HITL functions.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * Optional KMS key for encrypting HITL resources.
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The retention period for CloudWatch logs.
   * @default logs.RetentionDays.ONE_WEEK
   */
  readonly logRetention?: logs.RetentionDays;

  /**
   * Optional VPC configuration for HITL functions.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Interface for the HITL environment.
 *
 * As of v0.4.16, HITL functionality is built directly into the Web UI and no longer
 * requires SageMaker A2I infrastructure.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface IHitlEnvironment extends IConstruct {
  /**
   * The Lambda function for completing section reviews.
   */
  readonly completeSectionReviewFunction: functions.CompleteSectionReviewFunction;
}

/**
 * A construct that sets up the Human-in-the-Loop (HITL) environment for document processing.
 *
 * As of v0.4.16, HITL functionality is built directly into the Web UI and no longer
 * requires SageMaker A2I infrastructure. This construct now only manages the
 * CompleteSectionReviewFunction for completing section reviews.
 *
 * The HITL environment enables human review of documents through the Web UI,
 * with section review completion handled by the Lambda function.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class HitlEnvironment
  extends Construct
  implements IHitlEnvironment, IProcessingEnvironmentApiFeature
{
  /**
   * The Lambda function for completing section reviews.
   */
  public readonly completeSectionReviewFunction: functions.CompleteSectionReviewFunction;

  /**
   * Creates a new HitlEnvironment.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the HITL environment
   */
  constructor(scope: Construct, id: string, props: HitlEnvironmentProps) {
    super(scope, id);

    // Create log group for the function
    const logGroup = new logs.LogGroup(
      this,
      "CompleteSectionReviewFunctionLogGroup",
      {
        encryptionKey: props.encryptionKey,
        retention: props.logRetention || logs.RetentionDays.ONE_WEEK,
      },
    );

    // Create the section review completion function
    this.completeSectionReviewFunction =
      new functions.CompleteSectionReviewFunction(
        this,
        "CompleteSectionReviewFunction",
        {
          trackingTable: props.trackingTable,
          encryptionKey: props.encryptionKey,
          logGroup,
          ...props.vpcConfiguration,
        },
      );

    // Add LOG_LEVEL environment variable if specified
    if (props.logLevel) {
      this.completeSectionReviewFunction.addEnvironment(
        "LOG_LEVEL",
        props.logLevel,
      );
    }
  }

  /**
   * Attach this HITL environment to the ProcessingEnvironmentApi.
   *
   * This method integrates the HITL functionality with the GraphQL API
   * by creating the necessary data source and resolver for section review completion.
   *
   * Example:
   * ```typescript
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const hitl = new HitlEnvironment(this, 'Hitl', {
   *   trackingTable: environment.trackingTable,
   * });
   * hitl.attachTo(api);
   * ```
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    // Create data source for the complete section review function
    const completeSectionReviewDataSource = api.addLambdaDataSource(
      "CompleteSectionReviewDataSource",
      this.completeSectionReviewFunction,
    );

    // Create resolver for completeSectionReview mutation
    completeSectionReviewDataSource.createResolver(
      "CompleteSectionReviewResolver",
      {
        typeName: "Mutation",
        fieldName: "completeSectionReview",
      },
    );
  }
}
