/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct, IConstruct } from "constructs";
import {
  CalculateCapacityFunction,
  CalculateCapacityResolverFunction,
} from "./functions";
import { IProcessingEnvironment } from "../../processing-environment";
import { VpcConfiguration } from "../../vpc-configuration";
import {
  IProcessingEnvironmentApi,
  IApiFeature,
} from "../processing-environment-api";

/**
 * Interface for Capacity Planning construct.
 *
 * Provides capacity planning and optimization capabilities for Pattern 2 workflows.
 * Analyzes document processing metrics to provide resource allocation recommendations.
 *
 */
export interface ICapacityPlanning extends IConstruct {
  /**
   * Lambda function that performs capacity planning calculations.
   * Analyzes processing metrics to optimize resource allocation.
   */
  readonly calculationFunction: lambda.IFunction;

  /**
   * Lambda function that serves as GraphQL resolver for capacity planning operations.
   * Handles API requests and invokes the calculation function.
   */
  readonly resolverFunction: lambda.IFunction;
}

/**
 * Properties for CapacityPlanning construct.
 *
 */
export interface CapacityPlanningProps {
  /**
   * The ProcessingEnvironment that this capacity planning construct will analyze.
   * Provides access to tracking and configuration tables for metrics analysis.
   */
  readonly environment: IProcessingEnvironment;

  /**
   * Optional encryption key for encrypting capacity planning data.
   * When provided, ensures that capacity metrics and calculations are encrypted at rest.
   *
   * @default - Uses environment's encryption key if available
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Optional VPC configuration for Lambda functions.
   * When provided, deploys capacity planning functions within a VPC.
   *
   * @default - No VPC configuration
   */
  readonly vpcConfiguration?: VpcConfiguration;
}

/**
 * Capacity Planning construct for Pattern 2 optimization.
 *
 * Provides capacity planning and resource optimization capabilities specifically
 * designed for Pattern 2 (Bedrock LLM) workflows. Analyzes document processing
 * metrics from the tracking table to provide insights on:
 *
 * - Optimal concurrency settings
 * - Resource allocation recommendations
 * - Cost optimization opportunities
 * - Processing throughput analysis
 *
 * **Important**: This feature is designed exclusively for Pattern 2 workflows.
 * Pattern 1 and Pattern 3 have different resource characteristics and should
 * use pattern-specific optimization approaches.
 *
 */
export class CapacityPlanning
  extends Construct
  implements ICapacityPlanning, IApiFeature
{
  /**
   * Lambda function that performs capacity planning calculations.
   */
  public readonly calculationFunction: lambda.IFunction;

  /**
   * Lambda function that serves as GraphQL resolver for capacity planning operations.
   */
  public readonly resolverFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props: CapacityPlanningProps) {
    super(scope, id);

    // Validate required dependencies
    if (!props.environment) {
      throw new Error("CapacityPlanning requires a ProcessingEnvironment");
    }

    // Use environment's encryption key if not explicitly provided
    const encryptionKey =
      props.encryptionKey ?? props.environment.encryptionKey;

    // Create calculation function
    this.calculationFunction = new CalculateCapacityFunction(
      this,
      "CalculationFunction",
      {
        trackingTable: props.environment.trackingTable,
        configurationTable: props.environment.configurationTable,
        encryptionKey,
        ...props.vpcConfiguration,
      },
    );

    // Create resolver function
    this.resolverFunction = new CalculateCapacityResolverFunction(
      this,
      "ResolverFunction",
      {
        calculationFunction: this.calculationFunction,
        encryptionKey,
        ...props.vpcConfiguration,
      },
    );
  }

  /**
   * Enable this Capacity Planning feature in the ProcessingEnvironmentApi.
   *
   * This method integrates the capacity planning functionality with the GraphQL API
   * by creating the necessary data sources and resolvers. It should be called after
   * both the API and this construct have been created.
   *
   * Example:
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const capacityPlanning = new CapacityPlanning(this, 'CapacityPlanning', { ... });
   * api.enable(capacityPlanning);
   *
   * @param api The ProcessingEnvironmentApi to enable in
   *    */
  public enableInApi(api: IProcessingEnvironmentApi): void {
    // Create data source for capacity planning resolver
    const capacityPlanningDataSource = api.addLambdaDataSource(
      "CapacityPlanningDataSource",
      this.resolverFunction,
      {
        name: "CapacityPlanningResolver",
        description: "Lambda function for capacity planning operations",
      },
    );

    // Create resolver for calculateCapacity query (upstream schema defines this as Query, not Mutation)
    capacityPlanningDataSource.createResolver("CalculateCapacityResolver", {
      typeName: "Query",
      fieldName: "calculateCapacity",
    });
  }
}
