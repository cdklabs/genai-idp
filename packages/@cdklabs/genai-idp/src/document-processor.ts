/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { IConstruct } from "constructs";
import { IProcessingEnvironment } from "./processing-environment";

/**
 * Properties required to configure a document processor implementation.
 * Document processors are responsible for extracting structured data from unstructured documents
 * using various AI/ML services and processing patterns.
 *
 * The GenAI IDP Accelerator provides multiple processor implementations to handle different
 * document processing scenarios, from standard forms to complex specialized documents.
 */
export interface DocumentProcessorProps {
  /**
   * The maximum number of documents that can be processed concurrently.
   * Controls the throughput and resource utilization of the document processing system.
   *
   * @default 100 concurrent workflows
   */
  readonly maxProcessingConcurrency?: number;

  /**
   * The processing environment that provides shared infrastructure and services.
   * Contains input/output buckets, tracking tables, API endpoints, and other
   * resources needed for document processing operations.
   */
  readonly environment: IProcessingEnvironment;
}

/**
 * Interface for document processor implementations.
 * Document processors handle the extraction of structured data from documents
 * using different processing patterns and AI/ML services.
 *
 * The GenAI IDP Accelerator includes multiple processor implementations:
 * - Pattern 1: Uses Amazon Bedrock Data Automation for document processing with minimal custom code
 * - Pattern 2: Implements custom extraction using Amazon Bedrock foundation models for flexible processing
 * - Pattern 3: Provides specialized document processing using SageMaker endpoints for custom classification models
 *
 * Each pattern is optimized for different document types, complexity levels, and customization needs.
 */
export interface IDocumentProcessor extends IConstruct {
  /**
   * The Step Functions state machine that orchestrates the document processing workflow.
   * Manages the sequence of processing steps and handles error conditions.
   * This state machine is triggered for each document that needs processing
   * and coordinates the entire extraction pipeline.
   */
  readonly stateMachine: sfn.IStateMachine;

  /**
   * The maximum number of documents that can be processed concurrently.
   * Controls the throughput and resource utilization of the document processing system.
   */
  readonly maxProcessingConcurrency: number;

  /**
   * The processing environment that provides shared infrastructure and services.
   * Contains input/output buckets, tracking tables, API endpoints, and other
   * resources needed for document processing operations.
   */
  readonly environment: IProcessingEnvironment;
}
