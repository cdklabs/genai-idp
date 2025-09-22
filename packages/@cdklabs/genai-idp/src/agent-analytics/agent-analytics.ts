/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as bedrock from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { Construct, IConstruct } from "constructs";
import { FixedKeyTableProps } from "../fixed-key-table-props";
import { LogLevel } from "../log-level";
import { ITrackingTable } from "../tracking-table";
import {
  AgentRequestHandlerFunction,
  AgentProcessorFunction,
  ListAvailableAgentsFunction,
} from "./functions";
import { IReportingEnvironment } from "../reporting/reporting-environment";

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
   * The foundation model or inference profile to use for document analysis agent.
   * @default - No model specified, must be provided
   */
  readonly model: bedrock.IInvokable;

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
   * AppSync GraphQL API URL for publishing updates.
   */
  readonly appSyncApiUrl: string;

  /**
   * Athena database for analytics queries.
   */
  readonly reportingEnvironment: IReportingEnvironment;

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
 */
export class AgentAnalytics extends Construct implements IAgentAnalytics {
  public readonly agentTable: IAgentTable;
  public readonly agentRequestHandler: lambda.IFunction;
  public readonly agentProcessor: lambda.IFunction;
  public readonly listAvailableAgents: lambda.IFunction;

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
    this.agentProcessor = new AgentProcessorFunction(this, "AgentProcessor", {
      metricNamespace: props.metricNamespace,
      logLevel: props.logLevel ?? LogLevel.INFO,
      agentTable: this.agentTable,
      appSyncApiUrl: props.appSyncApiUrl,
      athenaDatabase: props.reportingEnvironment.reportingDatabase,
      athenaBucket: props.reportingEnvironment.reportingBucket,
      model: props.model,
      encryptionKey: props.encryptionKey,
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
}
