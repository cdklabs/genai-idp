/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as lambda from "aws-cdk-lib/aws-lambda";
import * as logs from "aws-cdk-lib/aws-logs";
import { Construct, IConstruct } from "constructs";
import { IProcessingEnvironment } from "../processing-environment";
import { CustomPromptGeneratorFunction } from "./functions";

/**
 * Interface for custom prompt generator implementations.
 * Custom prompt generators allow injection of business logic into document processing workflows
 * for Patterns 2 and 3, enabling dynamic prompt customization based on document content,
 * customer configurations, or external system integrations.
 */
export interface ICustomPromptGenerator extends IConstruct {
  /**
   * The Lambda function that implements the custom prompt generation logic.
   * This function receives template placeholders and returns customized prompts.
   */
  readonly generatorFunction: lambda.IFunction;
}

/**
 * Properties for configuring a custom prompt generator.
 */
export interface CustomPromptGeneratorProps {
  /**
   * The processing environment that provides shared infrastructure and services.
   */
  readonly environment: IProcessingEnvironment;
}

/**
 * Custom prompt generator construct for injecting business logic into document processing.
 *
 * This construct creates a Lambda function that can be used by Pattern 2 and Pattern 3 processors
 * to customize prompts based on document content, business rules, or external system integrations.
 *
 * The Lambda function receives template placeholders including:
 * - DOCUMENT_TEXT: Extracted text from the document
 * - DOCUMENT_CLASS: Classification result
 * - ATTRIBUTE_NAMES_AND_DESCRIPTIONS: Schema information
 * - DOCUMENT_IMAGE: URI-based image reference for JSON serialization
 *
 * Key features:
 * - Scoped IAM permissions requiring GENAIIDP-* function naming convention
 * - Comprehensive error handling with fail-fast behavior
 * - JSON serialization support for all object types
 * - Complete observability with detailed logging
 */
export class CustomPromptGenerator
  extends Construct
  implements ICustomPromptGenerator
{
  public readonly generatorFunction: lambda.IFunction;

  constructor(scope: Construct, id: string, props: CustomPromptGeneratorProps) {
    super(scope, id);

    this.generatorFunction = new CustomPromptGeneratorFunction(
      this,
      "Function",
      {
        metricNamespace: props.environment.metricNamespace,
        logLevel: props.environment.logLevel,
        configurationTable: props.environment.configurationTable,
        trackingTable: props.environment.trackingTable,
        inputBucket: props.environment.inputBucket,
        outputBucket: props.environment.outputBucket,
        workingBucket: props.environment.workingBucket,
        encryptionKey: props.environment.encryptionKey,
        logGroup: new logs.LogGroup(this, "LogGroup", {
          encryptionKey: props.environment.encryptionKey,
          retention: props.environment.logRetention,
        }),
        ...props.environment.vpcConfiguration,
      },
    );
  }
}
