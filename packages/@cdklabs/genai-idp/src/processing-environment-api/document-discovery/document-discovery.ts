/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as appsync from "aws-cdk-lib/aws-appsync";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { DiscoveryQueue, IDiscoveryQueue } from "./discovery-queue";
import { DiscoveryTable, IDiscoveryTable } from "./discovery-table";
import {
  DiscoveryProcessorFunction,
  DiscoveryUploadResolverFunction,
} from "./functions";
import { IConfigurationTable } from "../../configuration-table";
import { LogLevel } from "../../log-level";
import { VpcConfiguration } from "../../vpc-configuration";
import { IWebApplication, IWebAppFeature } from "../../web-application";
import {
  IProcessingEnvironmentApi,
  IApiFeature,
} from "../processing-environment-api";

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
   * The configuration table for storing discovery results.
   * Used by the discovery processor to write generated configurations.
   */
  readonly configurationTable: IConfigurationTable;

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
export class DocumentDiscovery
  extends Construct
  implements IDocumentDiscovery, IApiFeature, IWebAppFeature
{
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
   * Enable this Document Discovery feature in the WebApplication.
   *
   * Contributes the DiscoveryBucket setting and configures CORS
   * on the discovery bucket for CloudFront access.
   *
   * @param webApp The WebApplication to enable in
   * @since v0.4.16
   */
  public enableInWebApp(webApp: IWebApplication): void {
    webApp.addSetting("DiscoveryBucket", this.discoveryBucket.bucketName);
    webApp.addCorsBucket(this.discoveryBucket);
  }

  /**
   * Initialize the Lambda functions with API dependencies.
   * Called internally by enableInApi().
   */
  private initializeFunctions(
    api: IProcessingEnvironmentApi,
  ): DocumentDiscoveryFunctions {
    const uploadResolverFunction = new DiscoveryUploadResolverFunction(
      this,
      "UploadResolver",
      {
        discoveryBucket: this.discoveryBucket,
        discoveryTable: this.discoveryTable,
        discoveryQueue: this.discoveryQueue,
        encryptionKey: this.props.encryptionKey,
        logLevel: this.props.logLevel,
        logRetention: this.props.logRetention,
        vpc: this.props.vpcConfiguration?.vpc,
        vpcSubnets: this.props.vpcConfiguration?.vpcSubnets,
      },
    );

    const processorFunction = new DiscoveryProcessorFunction(
      this,
      "Processor",
      {
        discoveryBucket: this.discoveryBucket,
        discoveryTable: this.discoveryTable,
        discoveryQueue: this.discoveryQueue,
        configurationTable: this.props.configurationTable,
        api: api,
        encryptionKey: this.props.encryptionKey,
        logLevel: this.props.logLevel,
        logRetention: this.props.logRetention,
        vpc: this.props.vpcConfiguration?.vpc,
        vpcSubnets: this.props.vpcConfiguration?.vpcSubnets,
      },
    );

    return { uploadResolverFunction, processorFunction };
  }

  /**
   * Enable this Document Discovery feature in the ProcessingEnvironmentApi.
   *
   * Creates the discovery upload resolver, discovery table data source,
   * and all associated resolvers for discovery job management.
   *
   * @param api The ProcessingEnvironmentApi to enable in
   * @since v0.4.16
   */
  public enableInApi(api: IProcessingEnvironmentApi): void {
    // Initialize functions with API URL and environment settings
    // Optional params (encryptionKey, logLevel, etc.) fall back to this.props values
    const { uploadResolverFunction } = this.initializeFunctions(api);

    // Add upload discovery document resolver
    const discoveryUploadDataSource = api.addLambdaDataSource(
      "DiscoveryUploadDataSource",
      uploadResolverFunction,
      {
        name: "DiscoveryUploadResolver",
        description: "Lambda function for discovery document uploads",
      },
    );

    discoveryUploadDataSource.createResolver(
      "UploadDiscoveryDocumentResolver",
      {
        typeName: "Mutation",
        fieldName: "uploadDiscoveryDocument",
      },
    );

    // Add discovery table data source for queries
    const discoveryTableDataSource = api.addDynamoDbDataSource(
      "DiscoveryTableDataSource",
      this.discoveryTable,
    );

    // Create list discovery jobs resolver
    discoveryTableDataSource.createResolver("ListDiscoveryJobsResolver", {
      typeName: "Query",
      fieldName: "listDiscoveryJobs",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "version": "2017-02-28",
          "operation": "Scan",
          "limit": $util.defaultIfNull($ctx.args.limit, 20),
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.args.nextToken, null))
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "DiscoveryJobs": $util.toJson($ctx.result.items),
          "nextToken": $util.toJson($util.defaultIfNullOrBlank($ctx.result.nextToken, null))
        }
      `),
    });

    // Create update discovery job status resolver (for internal use)
    discoveryTableDataSource.createResolver(
      "UpdateDiscoveryJobStatusResolver",
      {
        typeName: "Mutation",
        fieldName: "updateDiscoveryJobStatus",
        requestMappingTemplate: appsync.MappingTemplate.fromString(`
          ## Validate status is one of the allowed values
          #set($validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"])
          #if(!$validStatuses.contains($ctx.args.status))
            $util.error("Invalid status value. Status must be one of: PENDING, IN_PROGRESS, COMPLETED, FAILED", "ValidationException")
          #end
          
          #set($expNames = {})
          #set($expValues = {})
          
          ## Set status (required)
          $util.qr($expNames.put("#status", "status"))
          $util.qr($expValues.put(":status", $util.dynamodb.toDynamoDB($ctx.args.status)))
          #set($updateExpression = "SET #status = :status")
          
          ## Set errorMessage (optional)
          #if($ctx.args.errorMessage)
            $util.qr($expNames.put("#errorMessage", "errorMessage"))
            $util.qr($expValues.put(":errorMessage", $util.dynamodb.toDynamoDB($ctx.args.errorMessage)))
            #set($updateExpression = "\${updateExpression}, #errorMessage = :errorMessage")
          #end
          
          ## Set updatedAt to current timestamp
          $util.qr($expNames.put("#updatedAt", "updatedAt"))
          $util.qr($expValues.put(":updatedAt", $util.dynamodb.toDynamoDB($util.time.nowISO8601())))
          #set($updateExpression = "\${updateExpression}, #updatedAt = :updatedAt")
          
          ## Set completedAt when status is COMPLETED or FAILED
          #if($ctx.args.status == "COMPLETED" || $ctx.args.status == "FAILED")
            $util.qr($expNames.put("#completedAt", "completedAt"))
            $util.qr($expValues.put(":completedAt", $util.dynamodb.toDynamoDB($util.time.nowISO8601())))
            #set($updateExpression = "\${updateExpression}, #completedAt = :completedAt")
          #end
          
          {
            "version": "2018-05-29",
            "operation": "UpdateItem",
            "key": {
              "jobId": $util.dynamodb.toDynamoDBJson($ctx.args.jobId)
            },
            "update": {
              "expression": "$updateExpression",
              "expressionNames": $util.toJson($expNames),
              "expressionValues": $util.toJson($expValues)
            }
          }
        `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
          $util.toJson($ctx.result)
        `),
      },
    );
  }
}
