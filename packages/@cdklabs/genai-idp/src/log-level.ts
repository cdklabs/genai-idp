/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

/**
 * Defines the logging verbosity levels for the document processing components.
 * Controls the amount of detail included in logs for troubleshooting and monitoring.
 *
 * The log level affects all Lambda functions and other components in the IDP solution,
 * allowing administrators to adjust logging detail based on operational needs.
 */
export enum LogLevel {
  /**
   * Most verbose logging level, includes detailed debugging information.
   * Useful during development and troubleshooting but generates large log volumes.
   *
   * Includes detailed information about internal operations, variable values,
   * and processing steps that are useful for diagnosing issues.
   */
  DEBUG = "DEBUG",

  /**
   * Standard logging level for operational information.
   * Provides general information about the system's operation without excessive detail.
   *
   * Includes information about document processing events, workflow transitions,
   * and important operational milestones.
   */
  INFO = "INFO",

  /**
   * Logs potentially harmful situations that don't prevent the system from working.
   * Indicates issues that should be addressed but aren't critical failures.
   *
   * Includes warnings about potential problems, performance issues,
   * or situations that might lead to errors if not addressed.
   */
  WARN = "WARN",

  /**
   * Logs error events that might still allow the application to continue running.
   * Indicates failures that should be investigated.
   *
   * Includes information about processing failures, service errors,
   * and other issues that affect system functionality.
   */
  ERROR = "ERROR",
}
