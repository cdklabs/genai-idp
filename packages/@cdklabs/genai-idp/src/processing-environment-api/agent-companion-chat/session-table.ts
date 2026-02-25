/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import { AttributeType, ITable, Table } from "aws-cdk-lib/aws-dynamodb";

import { Construct } from "constructs";
import { FixedKeyTableProps as SessionTableProps } from "../../fixed-key-table-props";

/**
 * Interface for the chat session table.
 * This table stores chat sessions and conversation history for Agent Companion Chat,
 * enabling persistent conversation management and context retention across interactions.
 */
export interface ISessionTable extends ITable {}

/**
 * A DynamoDB table for storing chat sessions and metadata.
 *
 * This table uses a composite key (userId, sessionId) to efficiently store and query
 * chat session metadata including session configuration, titles, and timestamps.
 * The table design supports session management with automatic cleanup through TTL attributes.
 *
 * Session data stored in this table includes:
 * - Chat session metadata and configuration
 * - Session titles and descriptions
 * - User associations and permissions
 * - Session creation and update timestamps
 */
export class SessionTable extends Table implements ISessionTable {
  /**
   * Creates a new SessionTable.
   *
   * @param scope The construct scope
   * @param id The construct ID
   * @param props Configuration properties for the DynamoDB table
   */
  constructor(scope: Construct, id: string, props?: SessionTableProps) {
    super(scope, id, {
      ...props,
      partitionKey: {
        name: "userId",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sessionId",
        type: AttributeType.STRING,
      },
      timeToLiveAttribute: "ExpiresAfter",
    });
  }
}

export { SessionTableProps };
