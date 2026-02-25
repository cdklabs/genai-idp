/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Section splitting strategy for document processing.
 *
 * Controls how multi-page documents are divided into sections during classification.
 * This affects how documents of the same type are grouped together and processed.
 */
export enum SectionSplittingStrategy {
  /**
   * Entire document treated as single section with first detected class.
   *
   * All pages in the document will be assigned the same classification
   * as the first page, regardless of content differences.
   *
   * Use this when:
   * - Documents are homogeneous (all pages same type)
   * - Classification accuracy is less critical
   * - Processing speed is prioritized
   */
  DISABLED = "disabled",

  /**
   * One section per page preventing automatic joining of same-type documents.
   *
   * Each page is treated as a separate section, even if consecutive pages
   * have the same classification. This prevents automatic merging.
   *
   * Use this when:
   * - Each page represents a distinct document
   * - Page boundaries are important
   * - Documents should not be merged
   */
  PAGE = "page",

  /**
   * Uses LLM boundary detection with "Start"/"Continue" indicators.
   *
   * The LLM analyzes each page to determine if it starts a new document
   * or continues the previous one. Pages with the same classification
   * are automatically grouped into sections.
   *
   * Use this when:
   * - Documents may span multiple pages
   * - Accurate document boundaries are critical
   * - Mixed document types in single files
   *
   * @default
   */
  LLM_DETERMINED = "llm_determined",
}
