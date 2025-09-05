/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as glue from "@aws-cdk/aws-glue-alpha";
import * as cdk from "aws-cdk-lib";
import { CfnCrawler } from "aws-cdk-lib/aws-glue";
import * as iam from "aws-cdk-lib/aws-iam";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

/**
 * Interface for the reporting environment that provides analytics and evaluation capabilities.
 * This environment stores evaluation metrics, document processing analytics, and metering data
 * in a structured format suitable for querying with Amazon Athena.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export interface IReportingEnvironment {
  /**
   * The S3 bucket where evaluation metrics and reporting data are stored in Parquet format.
   * Contains document-level, section-level, and attribute-level evaluation metrics.
   */
  readonly reportingBucket: s3.IBucket;

  /**
   * The AWS Glue database containing tables for evaluation metrics.
   * Provides a structured catalog for querying evaluation data with Amazon Athena.
   */
  readonly reportingDatabase: glue.Database;

  /**
   * The Glue table for document-level evaluation metrics.
   * Contains accuracy, precision, recall, F1 score, and other document-level metrics.
   */
  readonly documentEvaluationsTable: glue.S3Table;

  /**
   * The Glue table for section-level evaluation metrics.
   * Contains evaluation metrics for individual sections within documents.
   */
  readonly sectionEvaluationsTable: glue.S3Table;

  /**
   * The Glue table for attribute-level evaluation metrics.
   * Contains detailed evaluation metrics for individual extracted attributes.
   */
  readonly attributeEvaluationsTable: glue.S3Table;

  /**
   * The Glue table for metering data.
   * Contains cost and usage metrics for document processing operations.
   */
  readonly meteringTable: glue.S3Table;
}

/**
 * Properties for configuring the ReportingEnvironment construct.
 *
 * @experimental This API is experimental and may change in future versions.
 */
/**
 * Enumeration of supported crawler schedules.
 */
export enum CrawlerSchedule {
  /**
   * Manual execution only - no automatic schedule.
   */
  MANUAL = "Manual",

  /**
   * Run every 15 minutes.
   */
  EVERY_15_MINUTES = "Every15m",

  /**
   * Run every hour.
   */
  HOURLY = "EveryHour",

  /**
   * Run daily.
   */
  DAILY = "EveryDay",
}

export interface ReportingEnvironmentProps {
  /**
   * The S3 bucket where evaluation metrics and reporting data will be stored.
   * The construct will create Glue tables that reference this bucket location.
   */
  readonly reportingBucket: s3.IBucket;

  /**
   * The AWS Glue database where reporting tables will be created.
   * The construct will create tables for document, section, attribute, and metering data.
   */
  readonly reportingDatabase: glue.Database;

  /**
   * Optional KMS key for encrypting Glue crawler resources.
   * @default - Uses AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The frequency for the document sections crawler to run.
   * @default CrawlerSchedule.DAILY
   */
  readonly crawlerSchedule?: CrawlerSchedule;
}

/**
 * A construct that creates the reporting table structure for document processing analytics.
 *
 * This construct focuses on creating the Glue table schema for evaluation metrics,
 * using provided S3 bucket and Glue database resources. It creates:
 * - Document-level evaluation metrics table
 * - Section-level evaluation metrics table
 * - Attribute-level evaluation metrics table
 * - Metering data table
 *
 * All tables are properly partitioned for efficient querying with Amazon Athena.
 *
 * @experimental This API is experimental and may change in future versions.
 */
export class ReportingEnvironment
  extends Construct
  implements IReportingEnvironment
{
  public readonly reportingBucket: s3.IBucket;
  public readonly reportingDatabase: glue.Database;
  public readonly documentEvaluationsTable: glue.S3Table;
  public readonly sectionEvaluationsTable: glue.S3Table;
  public readonly attributeEvaluationsTable: glue.S3Table;
  public readonly meteringTable: glue.S3Table;

  constructor(scope: Construct, id: string, props: ReportingEnvironmentProps) {
    super(scope, id);

    // Use provided resources
    this.reportingBucket = props.reportingBucket;
    this.reportingDatabase = props.reportingDatabase;

    // Create document evaluations table
    this.documentEvaluationsTable = new glue.S3Table(
      this,
      "DocumentEvaluationsTable",
      {
        tableName: "document_evaluations",
        database: props.reportingDatabase,
        dataFormat: glue.DataFormat.PARQUET,
        bucket: props.reportingBucket,
        s3Prefix: "evaluation_metrics/document_metrics",
        description: "Table for document-level evaluation metrics",
        columns: [
          { name: "document_id", type: glue.Schema.STRING },
          { name: "input_key", type: glue.Schema.STRING },
          { name: "evaluation_date", type: glue.Schema.TIMESTAMP },
          { name: "accuracy", type: glue.Schema.DOUBLE },
          { name: "precision", type: glue.Schema.DOUBLE },
          { name: "recall", type: glue.Schema.DOUBLE },
          { name: "f1_score", type: glue.Schema.DOUBLE },
          { name: "false_alarm_rate", type: glue.Schema.DOUBLE },
          { name: "false_discovery_rate", type: glue.Schema.DOUBLE },
          { name: "execution_time", type: glue.Schema.DOUBLE },
        ],
        partitionKeys: [
          { name: "year", type: glue.Schema.STRING },
          { name: "month", type: glue.Schema.STRING },
          { name: "day", type: glue.Schema.STRING },
          { name: "document", type: glue.Schema.STRING },
        ],
      },
    );

    // Create section evaluations table
    this.sectionEvaluationsTable = new glue.S3Table(
      this,
      "SectionEvaluationsTable",
      {
        tableName: "section_evaluations",
        database: props.reportingDatabase,
        dataFormat: glue.DataFormat.PARQUET,
        bucket: props.reportingBucket,
        s3Prefix: "evaluation_metrics/section_metrics",
        description: "Table for section-level evaluation metrics",
        columns: [
          { name: "document_id", type: glue.Schema.STRING },
          { name: "section_id", type: glue.Schema.STRING },
          { name: "section_type", type: glue.Schema.STRING },
          { name: "accuracy", type: glue.Schema.DOUBLE },
          { name: "precision", type: glue.Schema.DOUBLE },
          { name: "recall", type: glue.Schema.DOUBLE },
          { name: "f1_score", type: glue.Schema.DOUBLE },
          { name: "false_alarm_rate", type: glue.Schema.DOUBLE },
          { name: "false_discovery_rate", type: glue.Schema.DOUBLE },
          { name: "evaluation_date", type: glue.Schema.TIMESTAMP },
        ],
        partitionKeys: [
          { name: "year", type: glue.Schema.STRING },
          { name: "month", type: glue.Schema.STRING },
          { name: "day", type: glue.Schema.STRING },
          { name: "document", type: glue.Schema.STRING },
        ],
      },
    );

    // Create attribute evaluations table
    this.attributeEvaluationsTable = new glue.S3Table(
      this,
      "AttributeEvaluationsTable",
      {
        tableName: "attribute_evaluations",
        database: props.reportingDatabase,
        dataFormat: glue.DataFormat.PARQUET,
        bucket: props.reportingBucket,
        s3Prefix: "evaluation_metrics/attribute_metrics",
        description: "Table for attribute-level evaluation metrics",
        columns: [
          { name: "document_id", type: glue.Schema.STRING },
          { name: "section_id", type: glue.Schema.STRING },
          { name: "section_type", type: glue.Schema.STRING },
          { name: "attribute_name", type: glue.Schema.STRING },
          { name: "expected", type: glue.Schema.STRING },
          { name: "actual", type: glue.Schema.STRING },
          { name: "matched", type: glue.Schema.BOOLEAN },
          { name: "score", type: glue.Schema.DOUBLE },
          { name: "reason", type: glue.Schema.STRING },
          { name: "evaluation_method", type: glue.Schema.STRING },
          { name: "confidence", type: glue.Schema.STRING },
          { name: "confidence_threshold", type: glue.Schema.STRING },
          { name: "evaluation_date", type: glue.Schema.TIMESTAMP },
        ],
        partitionKeys: [
          { name: "year", type: glue.Schema.STRING },
          { name: "month", type: glue.Schema.STRING },
          { name: "day", type: glue.Schema.STRING },
          { name: "document", type: glue.Schema.STRING },
        ],
      },
    );

    // Create metering table
    this.meteringTable = new glue.S3Table(this, "MeteringTable", {
      tableName: "metering",
      database: props.reportingDatabase,
      dataFormat: glue.DataFormat.PARQUET,
      bucket: props.reportingBucket,
      s3Prefix: "metering",
      description: "Table for document metering data with cost calculation",
      columns: [
        { name: "document_id", type: glue.Schema.STRING },
        { name: "context", type: glue.Schema.STRING },
        { name: "service_api", type: glue.Schema.STRING },
        { name: "unit", type: glue.Schema.STRING },
        { name: "value", type: glue.Schema.DOUBLE },
        { name: "unit_cost", type: glue.Schema.DOUBLE },
        { name: "estimated_cost", type: glue.Schema.DOUBLE },
        { name: "number_of_pages", type: glue.Schema.INTEGER },
        { name: "timestamp", type: glue.Schema.TIMESTAMP },
      ],
      partitionKeys: [
        { name: "year", type: glue.Schema.STRING },
        { name: "month", type: glue.Schema.STRING },
        { name: "day", type: glue.Schema.STRING },
        { name: "document", type: glue.Schema.STRING },
      ],
    });

    // Create document sections crawler components
    this.createDocumentSectionsCrawler(props);
  }

  /**
   * Create the document sections crawler and related components.
   *
   * This crawler automatically discovers document section tables and partitions
   * in the reporting bucket, enabling Athena queries on document sections data.
   */
  private createDocumentSectionsCrawler(
    props: ReportingEnvironmentProps,
  ): void {
    const stackName = cdk.Stack.of(this).stackName;

    // Create security configuration for crawler encryption
    const crawlerSecurityConfig = new glue.SecurityConfiguration(
      this,
      "DocumentSectionsCrawlerSecurityConfig",
      {
        securityConfigurationName: `${stackName}-document-sections-crawler-security-config`,
        s3Encryption: props.encryptionKey
          ? {
              mode: glue.S3EncryptionMode.KMS,
              kmsKey: props.encryptionKey,
            }
          : {
              mode: glue.S3EncryptionMode.S3_MANAGED,
            },
      },
    );

    // Create IAM role for the crawler
    const crawlerRole = new iam.Role(this, "DocumentSectionsCrawlerRole", {
      assumedBy: new iam.ServicePrincipal("glue.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "service-role/AWSGlueServiceRole",
        ),
      ],
      inlinePolicies: {
        DocumentSectionsCrawlerS3Access: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ["s3:GetObject", "s3:ListBucket"],
              resources: [
                props.reportingBucket.bucketArn,
                `${props.reportingBucket.bucketArn}/document_sections/*`,
              ],
            }),
          ],
        }),
      },
    });

    // Grant KMS permissions if encryption key is provided
    if (props.encryptionKey) {
      props.encryptionKey.grantDecrypt(crawlerRole);
    }

    // Determine schedule expression based on crawler schedule
    const scheduleExpression = this.getCrawlerScheduleExpression(
      props.crawlerSchedule,
    );

    // Create the Glue crawler
    new CfnCrawler(this, "DocumentSectionsCrawler", {
      name: `${stackName}-document-sections-crawler`,
      description:
        "Crawler to discover document section tables in the reporting bucket with conservative schema handling",
      role: crawlerRole.roleArn,
      databaseName: props.reportingDatabase.databaseName,
      crawlerSecurityConfiguration:
        crawlerSecurityConfig.securityConfigurationName,
      targets: {
        s3Targets: [
          {
            path: `s3://${props.reportingBucket.bucketName}/document_sections/`,
          },
        ],
      },
      schemaChangePolicy: {
        updateBehavior: "UPDATE_IN_DATABASE",
        deleteBehavior: "LOG",
      },
      tablePrefix: "document_sections_",
      configuration: JSON.stringify({
        Version: 1.0,
        CrawlerOutput: {
          Partitions: { AddOrUpdateBehavior: "InheritFromTable" },
          Tables: { AddOrUpdateBehavior: "MergeNewColumns" },
        },
        Grouping: { TableLevelConfiguration: 3 },
        CreatePartitionIndex: true,
      }),
      schedule: scheduleExpression ? { scheduleExpression } : undefined,
    });
  }

  /**
   * Get the cron expression for the crawler schedule.
   */
  private getCrawlerScheduleExpression(
    schedule?: CrawlerSchedule,
  ): string | undefined {
    if (!schedule || schedule === CrawlerSchedule.MANUAL) {
      return undefined;
    }

    const scheduleMap: Record<CrawlerSchedule, string> = {
      [CrawlerSchedule.MANUAL]: "",
      [CrawlerSchedule.EVERY_15_MINUTES]: "cron(0/15 * * * ? *)",
      [CrawlerSchedule.HOURLY]: "cron(0 * * * ? *)",
      [CrawlerSchedule.DAILY]: "cron(0 1 * * ? *)",
    };

    return scheduleMap[schedule];
  }
}
