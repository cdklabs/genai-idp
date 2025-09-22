# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Assessment module for document extraction confidence evaluation.

This module provides services for assessing the confidence and accuracy of
extraction results by analyzing them against source documents using LLMs.

The module supports both:
1. Original approach: Single inference for all attributes in a section
2. Granular approach: Multiple focused inferences with caching and parallelization
"""

import logging
from typing import Any, Dict

from idp_common.utils import normalize_boolean_value

from .granular_service import GranularAssessmentService
from .models import AssessmentResult, AttributeAssessment
from .service import AssessmentService as OriginalAssessmentService

logger = logging.getLogger(__name__)


class AssessmentService:
    """
    Backward-compatible AssessmentService that automatically selects the appropriate implementation.

    This class maintains the same interface as the original AssessmentService but automatically
    chooses between the original and granular implementations based on configuration.
    """

    def __init__(self, region: str = None, config: Dict[str, Any] = None):
        """
        Initialize the assessment service with automatic implementation selection.

        Args:
            region: AWS region for Bedrock
            config: Configuration dictionary
        """
        self._service = create_assessment_service(region=region, config=config)

    def process_document_section(self, document, section_id: str):
        """Process a single section from a Document object to assess extraction confidence."""
        return self._service.process_document_section(document, section_id)

    def assess_document(self, document):
        """Assess extraction confidence for all sections in a document."""
        return self._service.assess_document(document)

    # Expose internal methods for compatibility
    def _get_class_attributes(self, class_label: str):
        """Get attributes for a specific document class from configuration."""
        return self._service._get_class_attributes(class_label)

    def _format_attribute_descriptions(self, attributes):
        """Format attribute descriptions for the prompt."""
        return self._service._format_attribute_descriptions(attributes)


def create_assessment_service(region: str = None, config: Dict[str, Any] = None):
    """
    Factory function to create the appropriate assessment service based on configuration.

    Args:
        region: AWS region for Bedrock
        config: Configuration dictionary

    Returns:
        OriginalAssessmentService or GranularAssessmentService based on configuration
    """
    if not config:
        logger.info("No config provided, using original AssessmentService")
        return OriginalAssessmentService(region=region, config=config)

    # Check if granular assessment is enabled (default: False for backward compatibility)
    assessment_config = config.get("assessment", {})
    granular_config = assessment_config.get("granular", {})
    granular_enabled_raw = granular_config.get("enabled", False)

    # Normalize the enabled value to handle both boolean and string values
    granular_enabled = normalize_boolean_value(granular_enabled_raw)

    logger.info(
        f"Granular assessment enabled check: raw_value={granular_enabled_raw} (type: {type(granular_enabled_raw)}), normalized={granular_enabled}"
    )

    if granular_enabled:
        logger.info("Granular assessment enabled, using GranularAssessmentService")
        return GranularAssessmentService(region=region, config=config)
    else:
        logger.info("Using original AssessmentService")
        return OriginalAssessmentService(region=region, config=config)


__all__ = [
    "AssessmentService",
    "GranularAssessmentService",
    "OriginalAssessmentService",
    "AssessmentResult",
    "AttributeAssessment",
    "create_assessment_service",
]
