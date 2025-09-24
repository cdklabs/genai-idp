# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

from unittest.mock import Mock, patch

import pytest
from idp_common.classification.service import ClassificationService
from idp_common.models import Document, Page


@pytest.mark.unit
class TestMaxPagesForClassification:
    @pytest.fixture
    def mock_config(self):
        return {
            "classification": {
                "maxPagesForClassification": "ALL",
                "classificationMethod": "multimodalPageLevelClassification",
                "model": "us.amazon.nova-pro-v1:0",
                "system_prompt": "Test system prompt",
                "task_prompt": "Test task prompt",
            }
        }

    @pytest.fixture
    def classification_service(self, mock_config):
        return ClassificationService(backend="bedrock", config=mock_config)

    @pytest.fixture
    def sample_document(self):
        doc = Document(id="test-doc")
        doc.pages = {
            "1": Page(page_id="1"),
            "2": Page(page_id="2"),
            "3": Page(page_id="3"),
            "4": Page(page_id="4"),
            "5": Page(page_id="5"),
        }
        return doc

    def test_limit_pages_all(self, classification_service, sample_document):
        """Test that 'ALL' returns original document unchanged"""
        classification_service.max_pages_for_classification = "ALL"
        result = classification_service._limit_pages_for_classification(sample_document)

        assert result.id == sample_document.id
        assert len(result.pages) == 5
        assert list(result.pages.keys()) == ["1", "2", "3", "4", "5"]

    def test_limit_pages_numeric(self, classification_service, sample_document):
        """Test limiting to specific number of pages"""
        classification_service.max_pages_for_classification = "3"
        result = classification_service._limit_pages_for_classification(sample_document)

        assert result.id != sample_document.id  # Should be new document
        assert len(result.pages) == 3
        assert list(result.pages.keys()) == ["1", "2", "3"]

    def test_limit_pages_exceeds_total(self, classification_service, sample_document):
        """Test limiting to more pages than available"""
        classification_service.max_pages_for_classification = "10"
        result = classification_service._limit_pages_for_classification(sample_document)

        assert result.id == sample_document.id  # Should return original
        assert len(result.pages) == 5

    def test_limit_pages_invalid_value(self, classification_service, sample_document):
        """Test invalid maxPagesForClassification value"""
        classification_service.max_pages_for_classification = "invalid"
        result = classification_service._limit_pages_for_classification(sample_document)

        assert result.id == sample_document.id  # Should return original
        assert len(result.pages) == 5

    def test_limit_pages_zero(self, classification_service, sample_document):
        """Test zero pages limit"""
        classification_service.max_pages_for_classification = "0"
        result = classification_service._limit_pages_for_classification(sample_document)

        assert result.id == sample_document.id  # Should return original
        assert len(result.pages) == 5

    def test_apply_limited_classification_single_type(self, classification_service):
        """Test applying single classification to all pages"""
        # Original document with 3 pages
        original_doc = Document(id="original")
        original_doc.pages = {
            "1": Page(page_id="1"),
            "2": Page(page_id="2"),
            "3": Page(page_id="3"),
        }

        # Classified document with 2 pages, both classified as "invoice"
        classified_doc = Document(id="classified")
        classified_doc.pages = {
            "1": Page(page_id="1"),
            "2": Page(page_id="2"),
        }
        classified_doc.pages["1"].classification = "invoice"
        classified_doc.pages["2"].classification = "invoice"

        # Mock sections
        mock_section = Mock()
        mock_section.classification = "invoice"
        mock_section.page_ids = ["1", "2"]
        classified_doc.sections = [mock_section]

        with patch.object(classification_service, "_create_section") as mock_create:
            mock_create.return_value = mock_section

            result = classification_service._apply_limited_classification_to_all_pages(
                original_doc, classified_doc
            )

        # All pages should be classified as "invoice"
        assert result.pages["1"].classification == "invoice"
        assert result.pages["2"].classification == "invoice"
        assert result.pages["3"].classification == "invoice"
        assert len(result.sections) == 1

    def test_apply_limited_classification_tie_breaker(self, classification_service):
        """Test tie-breaker logic when multiple classifications have same count"""
        # Original document with 4 pages
        original_doc = Document(id="original")
        original_doc.pages = {
            "1": Page(page_id="1"),
            "2": Page(page_id="2"),
            "3": Page(page_id="3"),
            "4": Page(page_id="4"),
        }

        # Classified document with 2 pages, different classifications
        classified_doc = Document(id="classified")
        classified_doc.pages = {
            "1": Page(page_id="1"),
            "2": Page(page_id="2"),
        }
        classified_doc.pages["1"].classification = "payslip"
        classified_doc.pages["2"].classification = "drivers_license"

        # Mock sections - payslip processed first
        mock_section1 = Mock()
        mock_section1.classification = "payslip"
        mock_section1.page_ids = ["1"]

        mock_section2 = Mock()
        mock_section2.classification = "drivers_license"
        mock_section2.page_ids = ["2"]

        classified_doc.sections = [mock_section1, mock_section2]

        with patch.object(classification_service, "_create_section") as mock_create:
            mock_create.return_value = mock_section1

            result = classification_service._apply_limited_classification_to_all_pages(
                original_doc, classified_doc
            )

        # Should pick "payslip" due to insertion order tie-breaker
        assert result.pages["1"].classification == "payslip"
        assert result.pages["2"].classification == "payslip"
        assert result.pages["3"].classification == "payslip"
        assert result.pages["4"].classification == "payslip"

    def test_apply_limited_classification_empty_sections(self, classification_service):
        """Test handling of empty sections"""
        original_doc = Document(id="original")
        original_doc.pages = {"1": Page(page_id="1")}

        classified_doc = Document(id="classified")
        classified_doc.sections = []

        result = classification_service._apply_limited_classification_to_all_pages(
            original_doc, classified_doc
        )

        # Should return original document unchanged
        assert result == original_doc

    def test_config_integration(self):
        """Test that maxPagesForClassification is read from config"""
        mock_config = {
            "classification": {
                "maxPagesForClassification": "2",
                "classificationMethod": "multimodalPageLevelClassification",
                "model": "us.amazon.nova-pro-v1:0",
                "system_prompt": "Test system prompt",
                "task_prompt": "Test task prompt",
            }
        }

        service = ClassificationService(backend="bedrock", config=mock_config)
        assert service.max_pages_for_classification == "2"

    def test_config_default_value(self):
        """Test default value when maxPagesForClassification not in config"""
        mock_config = {
            "classification": {
                "classificationMethod": "multimodalPageLevelClassification",
                "model": "us.amazon.nova-pro-v1:0",
                "system_prompt": "Test system prompt",
                "task_prompt": "Test task prompt",
            }
        }

        service = ClassificationService(backend="bedrock", config=mock_config)
        assert service.max_pages_for_classification == "ALL"
