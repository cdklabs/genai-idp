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
import { Construct, IConstruct } from "constructs";
import { LogLevel } from "../../log-level";
import { VpcConfiguration } from "../../vpc-configuration";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Interface for the Knowledge Base Query feature.
 *
 * Provides natural language querying capabilities for processed documents
 * using Amazon Bedrock knowledge base.
 *
 * @since v0.4.16
 */
export interface IKnowledgeBaseQuery extends IConstruct {
  /**
   * The Amazon Bedrock knowledge base for document querying.
   */
  readonly knowledgeBase: IKnowledgeBase;
}

/**
 * Properties for configuring the KnowledgeBaseQuery feature.
 *
 * @since v0.4.16
 */
export interface KnowledgeBaseQueryProps {
  /**
   * The Amazon Bedrock knowledge base for document querying.
   * Enables natural language querying of processed documents.
   */
  readonly knowledgeBase: IKnowledgeBase;

  /**
   * The invokable model to use for knowledge base queries.
   * Can be a Bedrock foundation model, inference profile, or custom model.
   */
  readonly knowledgeBaseModel: IBedrockInvokable;

  /**
   * Optional Bedrock guardrail to apply to model interactions.
   * Helps ensure model outputs adhere to content policies and guidelines.
   */
  readonly guardrail?: IGuardrail;

  /**
   * The log level for the query function.
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
 * Knowledge Base Query feature for natural language document querying.
 *
 * Provides the ability to query processed documents using natural language
 * through Amazon Bedrock knowledge base. This enables users to search and
 * retrieve information from the entire processed document dataset.
 *
 * Integrates with the ProcessingEnvironmentApi as a feature using the
 * `api.addFeature(knowledgeBaseQuery)` pattern.
 *
 * @example
 * const knowledgeBaseQuery = new KnowledgeBaseQuery(this, 'KnowledgeBaseQuery', {
 *   knowledgeBase,
 *   knowledgeBaseModel: chatModel,
 *   guardrail,
 * });
 * api.addFeature(knowledgeBaseQuery);
 *
 * @since v0.4.16
 */
export class KnowledgeBaseQuery
  extends Construct
  implements IKnowledgeBaseQuery, IProcessingEnvironmentApiFeature
{
  /**
   * The Amazon Bedrock knowledge base for document querying.
   */
  public readonly knowledgeBase: IKnowledgeBase;

  private readonly knowledgeBaseModel: IBedrockInvokable;
  private readonly guardrail?: IGuardrail;
  private readonly logLevel?: LogLevel;
  private readonly encryptionKey?: kms.IKey;
  private readonly logRetention?: logs.RetentionDays;
  private readonly vpcConfiguration?: VpcConfiguration;

  constructor(scope: Construct, id: string, props: KnowledgeBaseQueryProps) {
    super(scope, id);

    this.knowledgeBase = props.knowledgeBase;
    this.knowledgeBaseModel = props.knowledgeBaseModel;
    this.guardrail = props.guardrail;
    this.logLevel = props.logLevel;
    this.encryptionKey = props.encryptionKey;
    this.logRetention = props.logRetention;
    this.vpcConfiguration = props.vpcConfiguration;
  }

  /**
   * Attach this Knowledge Base Query feature to the ProcessingEnvironmentApi.
   *
   * Creates the query knowledge base data source and resolver.
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    const queryKnowledgeBaseResolverFunction =
      new functions.QueryKnowledgeBaseResolverFunction(
        api as Construct,
        "QueryKnowledgeBaseResolverFunction",
        {
          knowledgeBase: this.knowledgeBase,
          knowledgeBaseModel: this.knowledgeBaseModel,
          guardrail: this.guardrail,
          logLevel: this.logLevel ?? LogLevel.INFO,
          encryptionKey: this.encryptionKey,
          logGroup: new logs.LogGroup(
            api as Construct,
            "QueryKnowledgeBaseResolverFunctionLogGroup",
            {
              encryptionKey: this.encryptionKey,
              retention: this.logRetention || logs.RetentionDays.ONE_WEEK,
            },
          ),
          ...this.vpcConfiguration,
        },
      );

    const dataSource = api.addLambdaDataSource(
      "QueryKnowledgeBaseDataSource",
      queryKnowledgeBaseResolverFunction,
      {
        name: "QueryKnowledgeBase",
        description: "Lambda function to query Bedrock Knowledge Base",
      },
    );

    dataSource.createResolver("QueryKnowledgeBaseResolver", {
      typeName: "Query",
      fieldName: "queryKnowledgeBase",
    });
  }
}
