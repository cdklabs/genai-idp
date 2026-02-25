/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
import { FixedKeyTableProps as MessagesTableProps } from "../../fixed-key-table-props";

/**
 * Interface for the chat messages table.
 * This table stores individual chat messages and conversation history for Agent Companion Chat.
 */
export interface IMessagesTable extends ITable {}

/**
 * A DynamoDB table for storing chat messages and conversation history.
 *
 * This table uses a composite key (PK, SK) to efficiently store and query
 * chat message data including message content, metadata, and conversation turns.
 * The table design supports message history management with automatic cleanup
 * through TTL attributes.
 *
 * Message data stored in this table includes:
 * - Individual message content and metadata
 * - Conversation turn information
 * - Agent responses and tool usage
 * - Message timestamps and processing status
 */
export class MessagesTable extends Table implements IMessagesTable {
  /**
   * Creates a new MessagesTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: MessagesTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: {
        name: "PK",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "SK",
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: "ExpiresAfter",
    });
  }
}

export { MessagesTableProps };
