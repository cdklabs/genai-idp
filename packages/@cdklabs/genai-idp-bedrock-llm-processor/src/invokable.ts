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
 * The type of inference backend wrapped by an Invokable.
 * @internal
 */
export enum InvokableType {
  /** A Bedrock foundation model or inference profile. */
  MODEL = "model",
  /** A Lambda function implementing the LambdaHook contract. */
  FUNCTION = "function",
}

/**
 * Unified wrapper for Bedrock models and Lambda functions that implements IInvokable.
 *
 * Use the static factory methods to create instances:
 *
 * @example
 * // From a Bedrock model
 * const provider = Invokable.fromModel(model);
 *
 * // From a Lambda function (LambdaHook)
 * const provider = Invokable.fromFunction(fn);
 *
 */
export class Invokable implements IInvokable {
  /**
   * Create an Invokable from a Bedrock model or inference profile.
   *
   * @param model The Bedrock invokable model
   * @returns An Invokable that grants bedrock:InvokeModel permissions
   */
  static fromModel(model: IBedrockInvokable): Invokable {
    return new Invokable(model, InvokableType.MODEL);
  }

  /**
   * Create an Invokable from a Lambda function (LambdaHook pattern).
   *
   * @param fn The Lambda function that implements the Converse API-compatible contract
   * @returns An Invokable that grants lambda:InvokeFunction permissions
   */
  static fromFunction(fn: lambda.IFunction): Invokable {
    return new Invokable(fn, InvokableType.FUNCTION);
  }

  /**
   * The type of inference backend.
   * @internal
   */
  public readonly _type: InvokableType;

  private readonly _inner: IBedrockInvokable | lambda.IFunction;

  private constructor(
    inner: IBedrockInvokable | lambda.IFunction,
    type: InvokableType,
  ) {
    this._inner = inner;
    this._type = type;
  }

  /**
   * Grant the given identity permissions to invoke this resource.
   */
  public grantInvoke(grantee: iam.IGrantable): iam.Grant {
    return this._inner.grantInvoke(grantee);
  }

  /**
   * Get the underlying Bedrock model. Only valid when type is MODEL.
   * @internal
   */
  public get _model(): IBedrockInvokable {
    if (this._type !== InvokableType.MODEL) {
      throw new Error("Cannot access model on a function-type Invokable");
    }
    return this._inner as IBedrockInvokable;
  }

  /**
   * Get the underlying Lambda function. Only valid when type is FUNCTION.
   * @internal
   */
  public get _fn(): lambda.IFunction {
    if (this._type !== InvokableType.FUNCTION) {
      throw new Error("Cannot access fn on a model-type Invokable");
    }
    return this._inner as lambda.IFunction;
  }
}
