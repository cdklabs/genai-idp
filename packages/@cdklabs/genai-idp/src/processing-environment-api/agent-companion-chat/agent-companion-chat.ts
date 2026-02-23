/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";
import { AgentChatProcessorFunction } from "./functions";
import { ISessionTable, SessionTable } from "./session-table";
import { IProcessingEnvironmentApi } from "../processing-environment-api";

/**
 * Interface for Agent Companion Chat construct.
 *
 * Provides interactive AI assistant with multi-agent orchestration.
 * Enables session-based chat with real-time streaming through AppSync.
 *
 * @since v0.4.8
 */
export interface IAgentCompanionChat extends IConstruct {
  /**
   * DynamoDB table for chat session storage.
   * Optional - can be provided by user or created by construct.
   */
  readonly sessionTable?: ISessionTable;

  /**
   * Lambda function for agent orchestration.
   */
  readonly orchestratorFunction: lambda.IFunction;

  /**
   * Optional data sources for chat context.
   */
  readonly chatDataSources?: string[];

  /**
   * Integrate Agent Companion Chat with ProcessingEnvironmentApi.
   * Adds chat capabilities to the GraphQL API.
   *
   * @param api The ProcessingEnvironmentApi to integrate with
   */
  integrateWithApi(api: IProcessingEnvironmentApi): void;
}

/**
 * Properties for AgentCompanionChat construct.
 *
 * @since v0.4.8
 */
export interface AgentCompanionChatProps {
  /**
   * Optional DynamoDB table for chat session storage.
   * When not provided, a new table will be created.
   *
   * @default - A new table is created
   */
  readonly sessionTable?: ISessionTable;

  /**
   * Optional KMS key for encrypting chat data.
   * When provided, ensures chat sessions and messages are encrypted at rest.
   *
   * @default - AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Enable Code Intelligence agent for code-related queries.
   * When enabled, adds specialized agent for code analysis and generation.
   *
   * @default false
   */
  readonly enableCodeIntelligence?: boolean;

  /**
   * Optional data sources for chat context.
   * Provides additional context for agent responses.
   *
   * @default - No additional data sources
   */
  readonly chatDataSources?: string[];
}

/**
 * Agent Companion Chat construct for AI assistant capabilities.
 *
 * Provides comprehensive AI assistant capabilities including:
 * - Multi-agent orchestration (Analytics, Error Analyzer, General)
 * - Session-based conversation management
 * - Real-time streaming through AppSync
 * - Conversation history with sliding window (last 20 turns)
 * - Optional Code Intelligence agent
 *
 * Agent Companion Chat integrates with the ProcessingEnvironment to provide
 * intelligent assistance for document processing workflows, error diagnosis,
 * and system analytics.
 *
 * @since v0.4.8
 */
export class AgentCompanionChat
  extends Construct
  implements IAgentCompanionChat
{
  /**
   * DynamoDB table for chat session storage.
   */
  public readonly sessionTable?: ISessionTable;

  /**
   * Lambda function for agent orchestration.
   */
  public readonly orchestratorFunction: lambda.IFunction;

  /**
   * Optional data sources for chat context.
   */
  public readonly chatDataSources?: string[];

  constructor(
    scope: Construct,
    id: string,
    props: AgentCompanionChatProps = {},
  ) {
    super(scope, id);

    this.chatDataSources = props.chatDataSources;

    // Create or use provided session table
    this.sessionTable =
      props.sessionTable ??
      new SessionTable(this, "SessionTable", {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        encryption: props.encryptionKey
          ? dynamodb.TableEncryption.CUSTOMER_MANAGED
          : dynamodb.TableEncryption.AWS_MANAGED,
        encryptionKey: props.encryptionKey,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        pointInTimeRecovery: true,
      });

    // Create orchestrator function using AgentChatProcessorFunction
    this.orchestratorFunction = new AgentChatProcessorFunction(
      this,
      "OrchestratorFunction",
      {
        sessionTable: this.sessionTable!,
        encryptionKey: props.encryptionKey,
        enableCodeIntelligence: props.enableCodeIntelligence,
      },
    );

    // Grant permissions
    this.sessionTable?.grantReadWriteData(this.orchestratorFunction);
  }

  /**
   * Integrate Agent Companion Chat with ProcessingEnvironmentApi.
   *
   * This method adds agent chat capabilities to an existing ProcessingEnvironmentApi
   * to enable GraphQL operations for AI assistant interactions, session management,
   * and real-time streaming.
   *
   * @param api The ProcessingEnvironmentApi to integrate with
   */
  public integrateWithApi(api: IProcessingEnvironmentApi): void {
    // Add agent companion chat capabilities to the API
    api.addAgentCompanionChat(this);
  }
}
