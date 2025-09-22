/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Defines the methods available for document classification in Pattern 2 processing.
 *
 * Document classification is a critical step in the IDP workflow that determines
 * how documents are categorized and processed. Different classification methods
 * offer varying levels of accuracy, performance, and capabilities.
 */
export enum ClassificationMethod {
  /**
   * Uses multimodal models to classify documents at the page level.
   * Analyzes both text and visual elements on each page for classification.
   *
   * This method is effective for documents where each page may belong to a different
   * document type or category. It provides high accuracy for complex layouts by
   * considering both textual content and visual structure of each page individually.
   */
  MULTIMODAL_PAGE_LEVEL_CLASSIFICATION = "multimodalPageLevelClassification",

  /**
   * Uses text-based analysis to classify the entire document holistically.
   * Considers the full document text content for classification decisions.
   *
   * This method is more efficient and cost-effective as it only processes the
   * extracted text. It works well for text-heavy documents where the document type
   * is consistent across all pages and visual elements are less important for classification.
   */
  TEXTBASED_HOLISTIC_CLASSIFICATION = "textbasedHolisticClassification",
}
