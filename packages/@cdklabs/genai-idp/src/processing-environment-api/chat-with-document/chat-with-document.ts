/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import {
  IGuardrail,
  IBedrockInvokable,
} from "@aws-cdk/aws-bedrock-alpha/bedrock";
import { IKnowledgeBase } from "@cdklabs/generative-ai-cdk-constructs/lib/cdk-lib/bedrock";
import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct, IConstruct } from "constructs";
import { IConfigurationTable } from "../../configuration-table";
import { LogLevel } from "../../log-level";
import { ITrackingTable } from "../../tracking-table";
import { VpcConfiguration } from "../../vpc-configuration";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Interface for the Chat with Document feature.
 *
 * Provides natural language conversation capabilities about a specific
 * processed document by combining document context from the knowledge base
 * with conversational AI.
 *
 * @since v0.4.16
 */
export interface IChatWithDocument extends IConstruct {}

/**
 * Properties for configuring the ChatWithDocument feature.
 *
 * @since v0.4.16
 */
export interface ChatWithDocumentProps {
  /**
   * The Bedrock knowledge base for document context retrieval.
   */
  readonly knowledgeBase: IKnowledgeBase;

  /**
   * The invokable model for chat functionality.
   */
  readonly chatModel: IBedrockInvokable;

  /**
   * The DynamoDB table that tracks document processing status and metadata.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * The DynamoDB table that stores configuration settings.
   */
  readonly configurationTable: IConfigurationTable;

  /**
   * The S3 bucket where processed documents and extraction results are stored.
   */
  readonly outputBucket: IBucket;

  /**
   * Optional Bedrock guardrail for content filtering.
   */
  readonly guardrail?: IGuardrail;

  /**
   * The log level for the chat function.
   *
   * @default LogLevel.INFO
   */
  readonly logLevel?: LogLevel;

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
 * Chat with Document feature for conversational document interaction.
 *
 * Provides natural language conversation capabilities about a specific
 * processed document. It combines document context from the knowledge base
 * with conversational AI, maintaining conversation history and providing
 * contextual responses about individual documents.
 *
 * Integrates with the ProcessingEnvironmentApi as a feature using the
 * `api.addFeature(chatWithDocument)` pattern.
 *
 * @example
 * const chatWithDocument = new ChatWithDocument(this, 'ChatWithDocument', {
 *   knowledgeBase,
 *   chatModel,
 *   trackingTable,
 *   configurationTable,
 *   outputBucket,
 * });
 * api.addFeature(chatWithDocument);
 *
 * @since v0.4.16
 */
export class ChatWithDocument
  extends Construct
  implements IChatWithDocument, IProcessingEnvironmentApiFeature
{
  private readonly knowledgeBase: IKnowledgeBase;
  private readonly chatModel: IBedrockInvokable;
  private readonly trackingTable: ITrackingTable;
  private readonly configurationTable: IConfigurationTable;
  private readonly outputBucket: IBucket;
  private readonly guardrail?: IGuardrail;
  private readonly logLevel?: LogLevel;
  private readonly encryptionKey?: kms.IKey;
  private readonly logRetention?: logs.RetentionDays;
  private readonly vpcConfiguration?: VpcConfiguration;

  constructor(scope: Construct, id: string, props: ChatWithDocumentProps) {
    super(scope, id);

    this.knowledgeBase = props.knowledgeBase;
    this.chatModel = props.chatModel;
    this.trackingTable = props.trackingTable;
    this.configurationTable = props.configurationTable;
    this.outputBucket = props.outputBucket;
    this.guardrail = props.guardrail;
    this.logLevel = props.logLevel;
    this.encryptionKey = props.encryptionKey;
    this.logRetention = props.logRetention;
    this.vpcConfiguration = props.vpcConfiguration;
  }

  /**
   * Attach this Chat with Document feature to the ProcessingEnvironmentApi.
   *
   * Creates the chat with document data source and resolver.
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    const chatWithDocumentResolverFunction =
      new functions.ChatWithDocumentResolverFunction(
        api as Construct,
        "ChatWithDocumentResolverFunction",
        {
          knowledgeBase: this.knowledgeBase,
          chatModel: this.chatModel,
          trackingTable: this.trackingTable,
          configurationTable: this.configurationTable,
          outputBucket: this.outputBucket,
          guardrail: this.guardrail,
          logLevel: this.logLevel ?? LogLevel.INFO,
          encryptionKey: this.encryptionKey,
          logGroup: new logs.LogGroup(
            api as Construct,
            "ChatWithDocumentResolverFunctionLogGroup",
            {
              encryptionKey: this.encryptionKey,
              retention: this.logRetention || logs.RetentionDays.ONE_WEEK,
            },
          ),
          ...this.vpcConfiguration,
        },
      );

    const dataSource = api.addLambdaDataSource(
      "ChatWithDocumentDataSource",
      chatWithDocumentResolverFunction,
      {
        name: "ChatWithDocument",
        description: "Lambda function for chat with document functionality",
      },
    );

    dataSource.createResolver("ChatWithDocumentResolver", {
      typeName: "Query",
      fieldName: "chatWithDocument",
    });
  }
}
