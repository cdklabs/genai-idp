/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { IBedrockInvokable } from "@aws-cdk/aws-bedrock-alpha/bedrock";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";

/**
 * Unified interface for any resource that can serve as an inference backend.
 *
 * Abstracts over Bedrock models and Lambda functions so that processing stage
 * constructs can grant invoke permissions without knowing the underlying type.
 */
export interface IInvokable {
  /**
   * Grant the given identity permissions to invoke this resource.
   *
   * @param grantee The principal to grant invoke permissions to
   * @returns The IAM Grant
   */
  grantInvoke(grantee: iam.IGrantable): iam.Grant;
}

/**
 * Factory for creating IInvokable instances from Bedrock models or Lambda functions.
 *
 * @example
 * // From a Bedrock model
 * const provider = Invokable.fromModel(model);
 *
 * // From a Lambda function (LambdaHook)
 * const provider = Invokable.fromFunction(fn);
 */
export class Invokable {
  /**
   * Create an IInvokable from a Bedrock model or inference profile.
   *
   * @param model The Bedrock invokable model
   * @returns An IInvokable that grants bedrock:InvokeModel permissions
   */
  static fromModel(model: IBedrockInvokable): IInvokable {
    return model;
  }

  /**
   * Create an IInvokable from a Lambda function (LambdaHook pattern).
   *
   * @param fn The Lambda function that implements the Converse API-compatible contract
   * @returns An IInvokable that grants lambda:InvokeFunction permissions
   */
  static fromFunction(fn: lambda.IFunction): IInvokable {
    return fn;
  }

  private constructor() {}
}
