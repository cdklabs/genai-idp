/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Maximum pages for classification configuration.
 *
 * Controls how many pages are sent to the classification model.
 * This can be used to optimize costs and performance for large documents.
 */
export enum MaxPagesForClassification {
  /**
   * Use all pages for classification.
   *
   * Every page in the document will be sent to the classification model.
   * This provides the most accurate classification but may increase costs
   * and processing time for large documents.
   *
   * @default
   */
  ALL = "ALL",
}
