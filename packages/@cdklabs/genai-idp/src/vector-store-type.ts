/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Vector store type for Bedrock Knowledge Base.
 *
 * Determines the backend storage and retrieval mechanism for document embeddings.
 * Each option provides different performance and cost characteristics.
 */
export enum VectorStoreType {
  /**
   * S3 Vectors for cost-effective storage with sub-second latency.
   *
   * Stores vector embeddings in Amazon S3 with optimized retrieval.
   * Provides a balance of cost-effectiveness and performance.
   *
   * Characteristics:
   * - Lower cost compared to OpenSearch Serverless
   * - Sub-second query latency
   * - Automatic scaling
   * - No infrastructure management
   *
   * Use this when:
   * - Cost optimization is important
   * - Sub-second latency is acceptable
   * - Workload is variable or unpredictable
   *
   * @default
   */
  S3_VECTORS = "S3_VECTORS",

  /**
   * OpenSearch Serverless for sub-millisecond queries.
   *
   * Uses Amazon OpenSearch Serverless for vector storage and retrieval.
   * Provides the fastest query performance but at higher cost.
   *
   * Characteristics:
   * - Sub-millisecond query latency
   * - Higher cost than S3 Vectors
   * - Automatic scaling
   * - Advanced search capabilities
   *
   * Use this when:
   * - Ultra-low latency is critical
   * - High query throughput is needed
   * - Advanced search features are required
   */
  OPENSEARCH_SERVERLESS = "OPENSEARCH_SERVERLESS",
}
