/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct, IConstruct } from "constructs";
import { VpcConfiguration } from "../../vpc-configuration";
import { IWebAppFeature } from "../../web-application";
import type { IWebApplication } from "../../web-application";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IApiFeature,
} from "../processing-environment-api";

/**
 * Interface for the Evaluation feature.
 *
 * Provides evaluation and baseline management capabilities for document processing.
 * Enables copying processed documents to a baseline bucket for accuracy evaluation
 * and model performance measurement.
 *
 * @since v0.4.16
 */
export interface IEvaluation extends IConstruct {
  /**
   * The S3 bucket for storing evaluation baseline documents.
   */
  readonly evaluationBaselineBucket: IBucket;
}

/**
 * Properties for configuring the Evaluation feature.
 *
 * @since v0.4.16
 */
export interface EvaluationProps {
  /**
   * The S3 bucket for storing evaluation baseline documents.
   * Used for comparing extraction results against known correct values
   * to measure accuracy and evaluate model performance.
   */
  readonly evaluationBaselineBucket: IBucket;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   * The evaluation feature reads from this bucket to copy documents to baseline.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional KMS key for encrypting evaluation data.
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
 * Evaluation feature for document processing accuracy measurement.
 *
 * Provides the ability to copy processed documents to a baseline bucket
 * for evaluation purposes. This enables comparing extraction results against
 * known correct values to measure accuracy and evaluate model performance.
 *
 * Integrates with the ProcessingEnvironmentApi as a feature using the
 * `api.enable(evaluation)` pattern.
 *
 * @example
 * const evaluation = new Evaluation(this, 'Evaluation', {
 *   evaluationBaselineBucket,
 *   outputBucket,
 *   encryptionKey: key,
 * });
 * api.enable(evaluation);
 *
 * @since v0.4.16
 */
export class Evaluation
  extends Construct
  implements IEvaluation, IApiFeature, IWebAppFeature
{
  /**
   * The S3 bucket for storing evaluation baseline documents.
   */
  public readonly evaluationBaselineBucket: IBucket;

  private readonly outputBucket: IBucket;
  private readonly encryptionKey?: kms.IKey;
  private readonly logRetention?: logs.RetentionDays;
  private readonly vpcConfiguration?: VpcConfiguration;

  constructor(scope: Construct, id: string, props: EvaluationProps) {
    super(scope, id);

    this.evaluationBaselineBucket = props.evaluationBaselineBucket;
    this.outputBucket = props.outputBucket;
    this.encryptionKey = props.encryptionKey;
    this.logRetention = props.logRetention;
    this.vpcConfiguration = props.vpcConfiguration;
  }

  /**
   * Enable this Evaluation feature in the WebApplication.
   *
   * Contributes the EvaluationBaselineBucket setting and configures CORS
   * on the baseline bucket for CloudFront access.
   *
   * @param webApp The WebApplication to enable in
   * @since v0.4.16
   */
  public enableInWebApp(webApp: IWebApplication): void {
    webApp.addSetting(
      "EvaluationBaselineBucket",
      this.evaluationBaselineBucket.bucketName,
    );
    webApp.addCorsBucket(this.evaluationBaselineBucket);
  }

  /**
   * Enable this Evaluation feature in the ProcessingEnvironmentApi.
   *
   * Creates the copy-to-baseline data source and resolver for evaluation workflows.
   *
   * @param api The ProcessingEnvironmentApi to enable in
   * @since v0.4.16
   */
  public enableInApi(api: IProcessingEnvironmentApi): void {
    // Grant the upload resolver function write access to the baseline bucket
    // so the UI can generate presigned URLs for uploading baseline documents
    this.evaluationBaselineBucket.grantWrite(api.uploadResolverFunction);
    this.encryptionKey?.grantEncryptDecrypt(api.uploadResolverFunction);

    const copyToBaselineResolverFunction =
      new functions.CopyToBaselineResolverFunction(
        api as Construct,
        "CopyToBaselineResolverFunction",
        {
          outputBucket: this.outputBucket,
          evaluationBaselineBucket: this.evaluationBaselineBucket,
          api,
          encryptionKey: this.encryptionKey,
          logGroup: new logs.LogGroup(
            api as Construct,
            "CopyToBaselineResolverFunctionLogGroup",
            {
              encryptionKey: this.encryptionKey,
              retention: this.logRetention || logs.RetentionDays.ONE_WEEK,
            },
          ),
          ...this.vpcConfiguration,
        },
      );

    const dataSource = api.addLambdaDataSource(
      "CopyToBaselineDataSource",
      copyToBaselineResolverFunction,
      {
        name: "CopyToBaselineDataSource",
        description: "Lambda function for copying files to baseline bucket",
      },
    );

    dataSource.createResolver("CopyToBaselineResolver", {
      typeName: "Mutation",
      fieldName: "copyToBaseline",
    });
  }
}
