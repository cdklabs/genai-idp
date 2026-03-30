# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""Testing and workflow control models."""

from typing import Optional

from pydantic import BaseModel, Field


class ExecutionsStoppedResult(BaseModel):
    """Result details for stopped Step Functions executions."""

    total_stopped: int = Field(default=0, description="Number of executions stopped")
    total_failed: int = Field(
        default=0, description="Number of executions that failed to stop"
    )
    remaining: int = Field(
        default=0, description="Number of executions still running after stop"
    )
    error: Optional[str] = Field(
        default=None, description="Error message if stopping failed"
    )


class DocumentsAbortedResult(BaseModel):
    """Result details for documents set to ABORTED state."""

    documents_aborted: int = Field(
        default=0, description="Number of queued documents set to ABORTED"
    )
    error: Optional[str] = Field(
        default=None, description="Error message if abort operation failed"
    )


class StopWorkflowsResult(BaseModel):
    """Result of stopping workflows."""

    executions_stopped: Optional[ExecutionsStoppedResult] = Field(
        default=None, description="Details of stopped Step Functions executions"
    )
    documents_aborted: Optional[DocumentsAbortedResult] = Field(
        default=None, description="Details of documents set to ABORTED state"
    )
    queue_purged: bool = Field(default=False, description="Whether queue was purged")


class LoadTestResult(BaseModel):
    """Result of a load test."""

    success: bool = Field(description="Whether load test completed")
    total_files: int = Field(description="Total files submitted")
    duration_minutes: int = Field(description="Test duration in minutes")
    error: Optional[str] = Field(default=None, description="Error if failed")
