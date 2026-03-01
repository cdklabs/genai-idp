/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as logs from "aws-cdk-lib/aws-logs";
import * as stepfunctions from "aws-cdk-lib/aws-stepfunctions";
import { Construct, IConstruct } from "constructs";
import { VpcConfiguration } from "../../vpc-configuration";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Interface for Processing Progress Monitor construct.
 *
 * Provides Step Functions execution monitoring capabilities for tracking
 * document processing workflow progress through the GraphQL API.
 *
 * @since v0.4.16
 */
export interface IProcessingProgressMonitor extends IConstruct {
  /**
   * The Step Functions state machine being monitored.
   */
  readonly stateMachine: stepfunctions.IStateMachine;
}

/**
 * Properties for ProcessingProgressMonitor construct.
 *
 * @since v0.4.16
 */
export interface ProcessingProgressMonitorProps {
  /**
   * The Step Functions state machine to monitor for processing progress.
   * This state machine orchestrates the document processing workflow.
   */
  readonly stateMachine: stepfunctions.IStateMachine;

  /**
   * Optional KMS key for encrypting monitoring data.
   * When provided, ensures execution details are encrypted at rest.
   *
   * @default - AWS managed encryption
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * The retention period for CloudWatch logs.
   * Controls how long monitoring logs are kept.
   *
   * @default logs.RetentionDays.ONE_WEEK
   */
  readonly logRetention?: logs.RetentionDays;

  /**
   * Optional VPC configuration for Lambda functions.
   * When provided, deploys monitoring functions within a VPC.
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Processing Progress Monitor construct for Step Functions execution tracking.
 *
 * Provides comprehensive execution monitoring capabilities including:
 * - Real-time execution status tracking
 * - Step-by-step execution history
 * - Error details and failure diagnosis
 * - Execution timeline visualization
 *
 * This feature integrates with the ProcessingEnvironmentApi to expose
 * Step Functions execution details through GraphQL queries, enabling
 * the UI to display processing progress and workflow status.
 *
 * @since v0.4.16
 */
export class ProcessingProgressMonitor
  extends Construct
  implements IProcessingProgressMonitor, IProcessingEnvironmentApiFeature
{
  /**
   * The Step Functions state machine being monitored.
   */
  public readonly stateMachine: stepfunctions.IStateMachine;

  private readonly encryptionKey?: kms.IKey;
  private readonly logRetention?: logs.RetentionDays;
  private readonly vpcConfiguration?: VpcConfiguration;

  constructor(
    scope: Construct,
    id: string,
    props: ProcessingProgressMonitorProps,
  ) {
    super(scope, id);

    // Validate required props
    if (!props.stateMachine) {
      throw new Error("ProcessingProgressMonitor requires a stateMachine");
    }

    this.stateMachine = props.stateMachine;
    this.encryptionKey = props.encryptionKey;
    this.logRetention = props.logRetention;
    this.vpcConfiguration = props.vpcConfiguration;
  }

  /**
   * Attach this Processing Progress Monitor feature to the ProcessingEnvironmentApi.
   *
   * This method integrates the execution monitoring functionality with the GraphQL API
   * by creating the necessary data sources and resolvers. It should be called after
   * both the API and this construct have been created.
   *
   * Example:
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const progressMonitor = new ProcessingProgressMonitor(this, 'ProgressMonitor', {
   *   stateMachine: processor.stateMachine,
   * });
   * api.addFeature(progressMonitor);
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    // Import the resolver functions
    const { GetStepFunctionExecutionResolverFunction } = functions;

    // Create Step Function execution resolver function
    const getStepFunctionExecutionResolverFunction =
      new GetStepFunctionExecutionResolverFunction(
        api as any,
        "GetStepFunctionExecutionResolverFunction",
        {
          stateMachine: this.stateMachine,
          encryptionKey: this.encryptionKey,
          logGroup: new logs.LogGroup(
            api as any,
            "GetStepFunctionExecutionResolverLogGroup",
            {
              encryptionKey: this.encryptionKey,
              retention: this.logRetention || logs.RetentionDays.ONE_WEEK,
            },
          ),
          ...this.vpcConfiguration,
        },
      );

    // Create data source
    const stepFunctionExecutionDataSource = api.addLambdaDataSource(
      "GetStepFunctionExecutionDataSource",
      getStepFunctionExecutionResolverFunction,
      {
        name: "GetStepFunctionExecutionResolver",
        description: "Get Step Functions execution details with step history",
      },
    );

    // Create resolver for getStepFunctionExecution query
    stepFunctionExecutionDataSource.createResolver(
      "GetStepFunctionExecutionResolver",
      {
        typeName: "Query",
        fieldName: "getStepFunctionExecution",
      },
    );
  }
}
