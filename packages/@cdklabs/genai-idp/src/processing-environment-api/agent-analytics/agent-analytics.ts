/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as bedrock from "@aws-cdk/aws-bedrock-alpha/bedrock";
import * as cdk from "aws-cdk-lib";
import * as appsync from "aws-cdk-lib/aws-appsync";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct, IConstruct } from "constructs";
import {
  AgentRequestHandlerFunction,
  AgentProcessorFunction,
  ListAvailableAgentsFunction,
} from "./functions";
import { IConfigurationTable } from "../../configuration-table";
import { FixedKeyTableProps } from "../../fixed-key-table-props";
import { LogLevel } from "../../log-level";
import { IReportingEnvironment } from "../../reporting/reporting-environment";
import { ITrackingTable } from "../../tracking-table";
import {
  IApiFeature,
  IProcessingEnvironmentApi,
} from "../processing-environment-api";

/**
 * Interface for Agent Table implementations.
 */
export interface IAgentTable extends dynamodb.ITable {}

/**
 * DynamoDB table for agent job tracking.
 * Uses fixed keys: PK (partition key) and SK (sort key).
 */
export class AgentTable extends dynamodb.Table implements IAgentTable {
  constructor(scope: Construct, id: string, props?: FixedKeyTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: {
        name: "PK",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}

/**
 * Interface for Agent Analytics implementations.
 * Provides AI-powered analytics capabilities for natural language querying of processed document data.
 */
export interface IAgentAnalytics extends IConstruct {
  /**
   * The DynamoDB table for tracking agent jobs and analytics queries.
   */
  readonly agentTable: IAgentTable;

  /**
   * Lambda function that handles agent query requests from the UI.
   */
  readonly agentRequestHandler: lambda.IFunction;

  /**
   * Lambda function that processes agent queries using Bedrock AgentCore.
   */
  readonly agentProcessor: lambda.IFunction;

  /**
   * Lambda function that lists available analytics agents.
   */
  readonly listAvailableAgents: lambda.IFunction;

  /**
   * Enable this Agent Analytics feature in a ProcessingEnvironmentApi.
   *
   * @param api The ProcessingEnvironmentApi to enable in
   */
  enableInApi(api: IProcessingEnvironmentApi): void;
}

/**
 * Properties for configuring Agent Analytics.
 */
export interface AgentAnalyticsProps {
  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Used by analytics agents to query processed document data.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table that stores configuration settings.
   * Used by analytics agents to access document schemas and processing parameters.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The foundation model or inference profile to use for document analysis agent.
   * @default - No model specified, must be provided
   */
  readonly model: bedrock.IBedrockInvokable;

  /**
   * Log level for agent analytics functions.
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

  /**
   * The namespace for CloudWatch metrics.
   */
  readonly metricNamespace: string;

  /**
   * The KMS key for encryption.
   */
  readonly encryptionKey?: cdk.aws_kms.IKey;

  /**
   * Log retention period.
   * @default logs.RetentionDays.ONE_WEEK
   */
  readonly logRetention?: logs.RetentionDays;

  /**
   * Athena database for analytics queries.
   */
  readonly reportingEnvironment: IReportingEnvironment;

  /**
   * Optional Bedrock guardrail for content filtering.
   * When provided, enables guardrail permissions for analytics agents.
   */
  readonly guardrail?: bedrock.IGuardrail;

  /**
   * Optional Secrets Manager secret for external MCP agents.
   * @default - No external MCP agents configured
   */
  readonly externalMcpAgentsSecret?: secretsmanager.ISecret;

  /**
   * Data retention period in days.
   * @default 365
   */
  readonly dataRetentionDays?: number;
}

/**
 * Agent Analytics construct for natural language document analytics.
 *
 * This construct provides AI-powered analytics capabilities that enable natural language
 * querying of processed document data. Key features include:
 *
 * - Convert natural language questions to SQL queries
 * - Generate interactive visualizations and tables
 * - Explore database schema automatically
 * - Secure code execution in AWS Bedrock AgentCore sandboxes
 * - Multi-tool agent system for comprehensive analytics
 *
 * The analytics system uses a multi-tool approach:
 * - Database discovery tool for schema exploration
 * - Athena query tool for SQL execution
 * - Secure code sandbox for data transfer
 * - Python visualization tool for charts and tables
 *
 */
export class AgentAnalytics
  extends Construct
  implements IAgentAnalytics, IApiFeature
{
  /**
   * The DynamoDB table for tracking agent jobs and analytics queries.
   */
  public readonly agentTable: IAgentTable;

  /**
   * Lambda function that handles agent query requests from the UI.
   */
  public readonly agentRequestHandler: lambda.IFunction;

  /**
   * Lambda function that processes agent queries using Bedrock AgentCore.
   */
  public readonly agentProcessor: lambda.IFunction;

  /**
   * Lambda function that lists available analytics agents.
   */
  public readonly listAvailableAgents: lambda.IFunction;

  /**
   * Private storage for AppSync API URL, set during attachTo().
   */
  private _appSyncApiUrl?: string;

  constructor(scope: Construct, id: string, props: AgentAnalyticsProps) {
    super(scope, id);

    // Create DynamoDB table for agent job tracking
    this.agentTable = new AgentTable(this, "AgentTable", {
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      encryption: props.encryptionKey
        ? dynamodb.TableEncryption.CUSTOMER_MANAGED
        : dynamodb.TableEncryption.AWS_MANAGED,
      encryptionKey: props.encryptionKey,
      pointInTimeRecoverySpecification: {
        pointInTimeRecoveryEnabled: true,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create agent processor function first (required by agent request handler)
    // Use Lazy.string() to defer API URL resolution until attachTo() is called
    this.agentProcessor = new AgentProcessorFunction(this, "AgentProcessor", {
      metricNamespace: props.metricNamespace,
      logLevel: props.logLevel ?? LogLevel.INFO,
      agentTable: this.agentTable,
      configurationTable: props.configurationTable,
      appSyncApiUrl: cdk.Lazy.string({
        produce: () => this._appSyncApiUrl || "",
      }),
      athenaDatabase: props.reportingEnvironment.reportingDatabase,
      athenaBucket: props.reportingEnvironment.reportingBucket,
      model: props.model,
      encryptionKey: props.encryptionKey,
      guardrail: props.guardrail,
      externalMcpAgentsSecret: props.externalMcpAgentsSecret,
      logGroup: new logs.LogGroup(this, "AgentProcessorLogGroup", {
        encryptionKey: props.encryptionKey,
        retention: props.logRetention ?? logs.RetentionDays.ONE_WEEK,
      }),
    });

    // Create agent request handler function
    this.agentRequestHandler = new AgentRequestHandlerFunction(
      this,
      "AgentRequestHandler",
      {
        metricNamespace: props.metricNamespace,
        logLevel: props.logLevel ?? LogLevel.INFO,
        agentTable: this.agentTable,
        agentProcessorFunction: this.agentProcessor,
        dataRetentionDays: props.dataRetentionDays ?? 365,
        encryptionKey: props.encryptionKey,
        logGroup: new logs.LogGroup(this, "AgentRequestHandlerLogGroup", {
          encryptionKey: props.encryptionKey,
          retention: props.logRetention ?? logs.RetentionDays.ONE_WEEK,
        }),
      },
    );

    // Create list available agents function
    this.listAvailableAgents = new ListAvailableAgentsFunction(
      this,
      "ListAvailableAgents",
      {
        metricNamespace: props.metricNamespace,
        logLevel: props.logLevel ?? LogLevel.INFO,
        externalMcpAgentsSecret: props.externalMcpAgentsSecret,
        encryptionKey: props.encryptionKey,
        logGroup: new logs.LogGroup(this, "ListAvailableAgentsLogGroup", {
          encryptionKey: props.encryptionKey,
          retention: props.logRetention ?? logs.RetentionDays.ONE_WEEK,
        }),
      },
    );

    // Grant agent request handler permission to invoke agent processor
    this.agentProcessor.grantInvoke(this.agentRequestHandler);
  }

  /**
   * Enable this Agent Analytics feature in a ProcessingEnvironmentApi.
   *
   * This method integrates the agent analytics functionality with the GraphQL API by:
   * - Creating Lambda data sources for agent request handling and listing agents
   * - Creating DynamoDB data source for agent job tracking
   * - Wiring GraphQL resolvers for agent operations
   *
   * @param api The ProcessingEnvironmentApi to enable in
   */
  public enableInApi(api: IProcessingEnvironmentApi): void {
    // Store the API URL for lazy resolution in the agent processor function
    this._appSyncApiUrl = api.graphqlUrl;

    // Add Agent Request Handler data source
    const agentRequestHandlerDataSource = api.addLambdaDataSource(
      "AgentRequestHandlerDataSource",
      this.agentRequestHandler,
      {
        name: "AgentRequestHandler",
        description: "Lambda function to handle agent query requests",
      },
    );

    // Add List Available Agents data source
    const listAvailableAgentsDataSource = api.addLambdaDataSource(
      "ListAvailableAgentsDataSource",
      this.listAvailableAgents,
      {
        name: "ListAvailableAgents",
        description: "Lambda function to list available analytics agents",
      },
    );

    // Add Agent Table data source for job status queries
    const agentTableDataSource = api.addDynamoDbDataSource(
      "AgentTableDataSource",
      this.agentTable,
    );

    // Create resolvers
    agentRequestHandlerDataSource.createResolver("SubmitAgentQueryResolver", {
      typeName: "Query",
      fieldName: "submitAgentQuery",
    });

    listAvailableAgentsDataSource.createResolver(
      "ListAvailableAgentsResolver",
      {
        typeName: "Query",
        fieldName: "listAvailableAgents",
      },
    );

    // Create getAgentJobStatus resolver using DynamoDB data source
    agentTableDataSource.createResolver("GetAgentJobStatusResolver", {
      typeName: "Query",
      fieldName: "getAgentJobStatus",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $context.identity.username)
        #if(!$userId)
          #set($userId = $context.identity.sub)
        #end
        #if(!$userId)
          #set($userId = "anonymous")
        #end
        {
          "version": "2018-05-29",
          "operation": "GetItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("agent#\${userId}"),
            "SK": $util.dynamodb.toDynamoDBJson($ctx.args.jobId)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if(!$ctx.result)
          null
        #else
          {
            "jobId": $util.toJson($ctx.result.SK),
            "status": $util.toJson($ctx.result.status),
            "query": $util.toJson($ctx.result.query),
            "agentIds": $util.toJson($ctx.result.agentIds),
            "createdAt": $util.toJson($ctx.result.createdAt),
            "completedAt": $util.toJson($ctx.result.completedAt),
            "result": $util.toJson($ctx.result.result),
            "error": $util.toJson($ctx.result.error),
            "agent_messages": $util.toJson($ctx.result.agent_messages)
          }
        #end
      `),
    });

    // Create updateAgentJobStatus resolver using DynamoDB data source
    agentTableDataSource.createResolver("UpdateAgentJobStatusResolver", {
      typeName: "Mutation",
      fieldName: "updateAgentJobStatus",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $ctx.args.userId)
        #set($expNames = {})
        #set($expValues = {})
        
        ## Set status (required)
        $util.qr($expNames.put("#status", "status"))
        $util.qr($expValues.put(":status", $util.dynamodb.toDynamoDB($ctx.args.status)))
        
        ## Set result if provided
        #if($ctx.args.result)
          $util.qr($expNames.put("#result", "result"))
          $util.qr($expValues.put(":result", $util.dynamodb.toDynamoDB($ctx.args.result)))
        #end
        
        ## Set completedAt timestamp
        $util.qr($expNames.put("#completedAt", "completedAt"))
        $util.qr($expValues.put(":completedAt", $util.dynamodb.toDynamoDB($util.time.nowISO8601())))
        
        {
          "version": "2018-05-29",
          "operation": "UpdateItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("agent#\${userId}"),
            "SK": $util.dynamodb.toDynamoDBJson($ctx.args.jobId)
          },
          "update": {
            "expression": "SET #status = :status, #completedAt = :completedAt#if($ctx.args.result), #result = :result#end",
            "expressionNames": $util.toJson($expNames),
            "expressionValues": $util.toJson($expValues)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if($ctx.error)
          $util.error($ctx.error.message, $ctx.error.type)
        #end
        
        ## Return false if no item was updated (item not found)
        #if(!$ctx.result)
          false
        #else
          true
        #end
      `),
    });

    // Create listAgentJobs resolver using DynamoDB data source
    agentTableDataSource.createResolver("ListAgentJobsResolver", {
      typeName: "Query",
      fieldName: "listAgentJobs",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $context.identity.username)
        #if(!$userId)
          #set($userId = $context.identity.sub)
        #end
        #if(!$userId)
          #set($userId = "anonymous")
        #end
        {
          "version": "2018-05-29",
          "operation": "Query",
          "query": {
            "expression": "PK = :pk",
            "expressionValues": {
              ":pk": $util.dynamodb.toDynamoDBJson("agent#\${userId}")
            }
          },
          #if($ctx.args.limit)
            "limit": $ctx.args.limit,
          #end
          #if($ctx.args.nextToken)
            "nextToken": "$ctx.args.nextToken",
          #end
          "scanIndexForward": false
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        {
          "items": [
            #foreach($item in $ctx.result.items)
              {
                "jobId": $util.toJson($item.SK),
                "status": $util.toJson($item.status),
                "query": $util.toJson($item.query),
                "agentIds": $util.toJson($item.agentIds),
                "createdAt": $util.toJson($item.createdAt),
                "completedAt": $util.toJson($item.completedAt),
                "result": $util.toJson($item.result),
                "error": $util.toJson($item.error)
              }#if($foreach.hasNext),#end
            #end
          ],
          "nextToken": $util.toJson($ctx.result.nextToken)
        }
      `),
    });

    // Create deleteAgentJob resolver using DynamoDB data source
    agentTableDataSource.createResolver("DeleteAgentJobResolver", {
      typeName: "Mutation",
      fieldName: "deleteAgentJob",
      requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($userId = $context.identity.username)
        #if(!$userId)
          #set($userId = $context.identity.sub)
        #end
        #if(!$userId)
          #set($userId = "anonymous")
        #end
        {
          "version": "2018-05-29",
          "operation": "DeleteItem",
          "key": {
            "PK": $util.dynamodb.toDynamoDBJson("agent#\${userId}"),
            "SK": $util.dynamodb.toDynamoDBJson($ctx.args.jobId)
          }
        }
      `),
      responseMappingTemplate: appsync.MappingTemplate.fromString(`
        #if($ctx.error)
          $util.error($ctx.error.message, $ctx.error.type)
        #else
          true
        #end
      `),
    });
  }
}
