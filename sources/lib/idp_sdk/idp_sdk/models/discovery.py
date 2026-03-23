# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""Discovery-related models."""

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class DiscoveryResult(BaseModel):
    """Result of a single discovery operation."""

    status: str = Field(description="Discovery status ('SUCCESS' or 'FAILED')")
    document_class: Optional[str] = Field(
        default=None, description="Discovered document class name (from $id)"
    )
    json_schema: Optional[Dict[str, Any]] = Field(
        default=None, description="Generated JSON Schema for the document class"
    )
    config_version: Optional[str] = Field(
        default=None,
        description="Configuration version the schema was saved to",
    )
    document_path: Optional[str] = Field(
        default=None, description="Path to the source document"
    )
    page_range: Optional[str] = Field(
        default=None, description="Page range that was discovered (e.g., '1-3')"
    )
    error: Optional[str] = Field(
        default=None, description="Error message if discovery failed"
    )


class DiscoveryBatchResult(BaseModel):
    """Result of a batch discovery operation."""

    total: int = Field(description="Total number of documents processed")
    succeeded: int = Field(description="Number of successful discoveries")
    failed: int = Field(description="Number of failed discoveries")
    results: List[DiscoveryResult] = Field(
        default_factory=list, description="Individual discovery results"
    )


class AutoDetectSection(BaseModel):
    """A detected document section boundary."""

    start: int = Field(description="Start page number (1-based)")
    end: int = Field(description="End page number (1-based)")
    type: Optional[str] = Field(
        default=None, description="Detected document type label"
    )


class AutoDetectResult(BaseModel):
    """Result of auto-detecting document sections."""

    status: str = Field(description="Detection status ('SUCCESS' or 'FAILED')")
    sections: List[AutoDetectSection] = Field(
        default_factory=list, description="Detected section boundaries"
    )
    document_path: Optional[str] = Field(
        default=None, description="Path to the source document"
    )
    error: Optional[str] = Field(
        default=None, description="Error message if detection failed"
    )
