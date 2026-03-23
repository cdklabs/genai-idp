# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Unit tests for Discovery operations (mocked).
"""

import json
from unittest.mock import patch

import pytest
from idp_sdk import IDPClient
from idp_sdk.exceptions import IDPConfigurationError, IDPResourceNotFoundError
from idp_sdk.models import (
    AutoDetectResult,
    AutoDetectSection,
    ConfigSyncBdaResult,
    DiscoveryBatchResult,
    DiscoveryResult,
)

SAMPLE_SCHEMA = {
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "Invoice",
    "x-aws-idp-document-type": "Invoice",
    "type": "object",
    "description": "Standard commercial invoice",
    "properties": {
        "InvoiceNumber": {"type": "string", "description": "Invoice number"},
        "TotalAmount": {"type": "number", "description": "Total amount due"},
    },
}


@pytest.mark.unit
class TestDiscoveryOperations:
    """Test discovery operations with mocked dependencies."""

    def test_discovery_namespace_exists(self):
        """Test that discovery namespace is registered on IDPClient."""
        client = IDPClient(stack_name="test-stack")
        assert hasattr(client, "discovery")
        assert client.discovery is not None

    def test_discovery_no_stack_runs_local_mode(self):
        """Test that discovery without stack_name doesn't raise — runs in local mode."""
        client = IDPClient()  # No stack name
        # Should not raise IDPConfigurationError — it will try local mode
        # but fail on file not found (which is correct)
        with pytest.raises(FileNotFoundError, match="Document not found"):
            client.discovery.run("/nonexistent/doc.pdf")

    def test_discovery_file_not_found(self):
        """Test that discovery.run raises FileNotFoundError for missing file."""
        client = IDPClient(stack_name="test-stack")
        with pytest.raises(FileNotFoundError, match="Document not found"):
            client.discovery.run("/nonexistent/path/doc.pdf")

    def test_discovery_ground_truth_not_found(self, tmp_path):
        """Test that discovery.run raises FileNotFoundError for missing ground truth."""
        doc_file = tmp_path / "test.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient(stack_name="test-stack")
        with pytest.raises(FileNotFoundError, match="Ground truth file not found"):
            client.discovery.run(
                str(doc_file),
                ground_truth_path="/nonexistent/gt.json",
            )

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_with_stack")
    def test_discovery_run_success_stack_mode(self, mock_run_stack, tmp_path):
        """Test successful discovery in stack-connected mode."""
        mock_run_stack.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="Invoice",
            json_schema=SAMPLE_SCHEMA,
            document_path="invoice.pdf",
        )

        doc_file = tmp_path / "invoice.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run(str(doc_file))

        assert isinstance(result, DiscoveryResult)
        assert result.status == "SUCCESS"
        assert result.document_class == "Invoice"
        assert result.json_schema == SAMPLE_SCHEMA
        mock_run_stack.assert_called_once()

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_local")
    def test_discovery_run_success_local_mode(self, mock_run_local, tmp_path):
        """Test successful discovery in local mode (no stack)."""
        mock_run_local.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="Invoice",
            json_schema=SAMPLE_SCHEMA,
            document_path="invoice.pdf",
        )

        doc_file = tmp_path / "invoice.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient()  # No stack name = local mode
        result = client.discovery.run(str(doc_file))

        assert result.status == "SUCCESS"
        assert result.document_class == "Invoice"
        mock_run_local.assert_called_once()

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_with_stack")
    def test_discovery_run_with_ground_truth(self, mock_run_stack, tmp_path):
        """Test discovery with ground truth passes gt_data to stack mode."""
        mock_run_stack.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="Invoice",
            json_schema=SAMPLE_SCHEMA,
        )

        doc_file = tmp_path / "invoice.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")
        gt_file = tmp_path / "invoice-gt.json"
        gt_file.write_text(json.dumps({"InvoiceNumber": "INV-001"}))

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run(str(doc_file), ground_truth_path=str(gt_file))

        assert result.status == "SUCCESS"
        # Verify gt_data was parsed and passed
        call_args = mock_run_stack.call_args
        assert call_args[0][3] == {"InvoiceNumber": "INV-001"}  # gt_data arg

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_with_stack")
    def test_discovery_run_with_config_version(self, mock_run_stack, tmp_path):
        """Test discovery passes config_version to stack mode."""
        mock_run_stack.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="Form",
            json_schema=SAMPLE_SCHEMA,
            config_version="v2",
        )

        doc_file = tmp_path / "form.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run(str(doc_file), config_version="v2")

        assert result.config_version == "v2"
        call_args = mock_run_stack.call_args
        assert call_args[0][4] == "v2"  # config_version arg

    @patch("boto3.client")
    def test_get_config_table(self, mock_boto3):
        """Test _get_config_table finds ConfigurationTable from stack."""
        mock_cfn = mock_boto3.return_value
        mock_paginator = mock_cfn.get_paginator.return_value
        mock_paginator.paginate.return_value = [
            {
                "StackResourceSummaries": [
                    {
                        "LogicalResourceId": "ConfigurationTable",
                        "PhysicalResourceId": "test-config-table",
                    },
                ]
            }
        ]

        client = IDPClient(stack_name="test-stack")
        table = client.discovery._get_config_table("test-stack")
        assert table == "test-config-table"

    @patch("boto3.client")
    def test_get_config_table_not_found(self, mock_boto3):
        """Test _get_config_table raises when not found."""
        mock_cfn = mock_boto3.return_value
        mock_paginator = mock_cfn.get_paginator.return_value
        mock_paginator.paginate.return_value = [{"StackResourceSummaries": []}]

        client = IDPClient(stack_name="test-stack")
        with pytest.raises(
            IDPResourceNotFoundError, match="ConfigurationTable not found"
        ):
            client.discovery._get_config_table("test-stack")

    def test_no_s3_upload_in_run(self, tmp_path):
        """Test that run() reads file bytes locally, not via S3."""
        doc_file = tmp_path / "test.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient(stack_name="test-stack")

        # Mock _run_with_stack to capture args
        with patch.object(
            client.discovery,
            "_run_with_stack",
            return_value=DiscoveryResult(status="SUCCESS"),
        ) as mock_run:
            client.discovery.run(str(doc_file))

            # Verify file_bytes were passed (2nd positional arg after stack_name and doc_path)
            call_args = mock_run.call_args[0]
            file_bytes = call_args[2]  # file_bytes
            assert file_bytes == b"%PDF-1.4 test content"


@pytest.mark.unit
class TestDiscoveryBatchOperations:
    """Test batch discovery operations."""

    @patch("idp_sdk.operations.discovery.DiscoveryOperation.run")
    def test_batch_discovery_success(self, mock_run, tmp_path):
        """Test successful batch discovery."""
        doc1 = tmp_path / "doc1.pdf"
        doc1.write_bytes(b"%PDF test")
        doc2 = tmp_path / "doc2.pdf"
        doc2.write_bytes(b"%PDF test")

        mock_run.side_effect = [
            DiscoveryResult(
                status="SUCCESS",
                document_class="Invoice",
                json_schema=SAMPLE_SCHEMA,
                document_path=str(doc1),
            ),
            DiscoveryResult(
                status="SUCCESS",
                document_class="W2",
                json_schema=SAMPLE_SCHEMA,
                document_path=str(doc2),
            ),
        ]

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run_batch([str(doc1), str(doc2)])

        assert isinstance(result, DiscoveryBatchResult)
        assert result.total == 2
        assert result.succeeded == 2
        assert result.failed == 0

    @patch("idp_sdk.operations.discovery.DiscoveryOperation.run")
    def test_batch_discovery_partial_failure(self, mock_run, tmp_path):
        """Test batch discovery with partial failures."""
        doc1 = tmp_path / "doc1.pdf"
        doc1.write_bytes(b"%PDF test")
        doc2 = tmp_path / "doc2.pdf"
        doc2.write_bytes(b"%PDF test")

        mock_run.side_effect = [
            DiscoveryResult(status="SUCCESS", document_class="Invoice"),
            DiscoveryResult(status="FAILED", error="Bedrock error"),
        ]

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run_batch([str(doc1), str(doc2)])

        assert result.total == 2
        assert result.succeeded == 1
        assert result.failed == 1

    def test_batch_discovery_mismatched_ground_truth(self, tmp_path):
        """Test batch discovery raises on mismatched ground truth count."""
        doc1 = tmp_path / "doc1.pdf"
        doc1.write_bytes(b"%PDF test")

        client = IDPClient(stack_name="test-stack")
        with pytest.raises(IDPConfigurationError, match="must match"):
            client.discovery.run_batch(
                [str(doc1)],
                ground_truth_paths=["gt1.json", "gt2.json"],
            )


@pytest.mark.unit
class TestDiscoveryModels:
    """Test discovery result models."""

    def test_discovery_result_success(self):
        """Test creating a successful DiscoveryResult."""
        result = DiscoveryResult(
            status="SUCCESS",
            document_class="Invoice",
            json_schema=SAMPLE_SCHEMA,
            config_version="v1",
            document_path="./invoice.pdf",
        )
        assert result.status == "SUCCESS"
        assert result.document_class == "Invoice"
        assert result.json_schema["$id"] == "Invoice"
        assert result.error is None

    def test_discovery_result_failure(self):
        """Test creating a failed DiscoveryResult."""
        result = DiscoveryResult(
            status="FAILED",
            error="Model invocation failed",
            document_path="./bad.pdf",
        )
        assert result.status == "FAILED"
        assert result.error == "Model invocation failed"
        assert result.json_schema is None

    def test_discovery_batch_result(self):
        """Test creating a DiscoveryBatchResult."""
        results = [
            DiscoveryResult(status="SUCCESS", document_class="A"),
            DiscoveryResult(status="FAILED", error="err"),
            DiscoveryResult(status="SUCCESS", document_class="B"),
        ]
        batch = DiscoveryBatchResult(total=3, succeeded=2, failed=1, results=results)
        assert batch.total == 3
        assert batch.succeeded == 2
        assert batch.failed == 1
        assert len(batch.results) == 3

    def test_discovery_result_with_page_range(self):
        """Test DiscoveryResult includes page_range field."""
        result = DiscoveryResult(
            status="SUCCESS",
            document_class="W2",
            json_schema=SAMPLE_SCHEMA,
            document_path="./package.pdf",
            page_range="3-5",
        )
        assert result.page_range == "3-5"
        assert result.status == "SUCCESS"

    def test_discovery_result_page_range_defaults_none(self):
        """Test page_range defaults to None when not provided."""
        result = DiscoveryResult(status="SUCCESS", document_class="W2")
        assert result.page_range is None


@pytest.mark.unit
class TestAutoDetectModels:
    """Test auto-detect section models."""

    def test_auto_detect_section_creation(self):
        """Test creating an AutoDetectSection."""
        section = AutoDetectSection(start=1, end=3, type="W2 Form")
        assert section.start == 1
        assert section.end == 3
        assert section.type == "W2 Form"

    def test_auto_detect_section_no_type(self):
        """Test AutoDetectSection with no type label."""
        section = AutoDetectSection(start=4, end=6)
        assert section.start == 4
        assert section.end == 6
        assert section.type is None

    def test_auto_detect_result_success(self):
        """Test creating a successful AutoDetectResult."""
        sections = [
            AutoDetectSection(start=1, end=2, type="Letter"),
            AutoDetectSection(start=3, end=5, type="W2 Form"),
            AutoDetectSection(start=6, end=8, type="Bank Statement"),
        ]
        result = AutoDetectResult(
            status="SUCCESS",
            sections=sections,
            document_path="./lending_package.pdf",
        )
        assert result.status == "SUCCESS"
        assert len(result.sections) == 3
        assert result.sections[0].type == "Letter"
        assert result.sections[1].start == 3
        assert result.error is None

    def test_auto_detect_result_failure(self):
        """Test creating a failed AutoDetectResult."""
        result = AutoDetectResult(
            status="FAILED",
            document_path="./bad.pdf",
            error="Bedrock invocation failed",
        )
        assert result.status == "FAILED"
        assert result.error == "Bedrock invocation failed"
        assert len(result.sections) == 0

    def test_auto_detect_result_empty_sections(self):
        """Test AutoDetectResult with empty sections list."""
        result = AutoDetectResult(
            status="SUCCESS",
            sections=[],
            document_path="./single-page.pdf",
        )
        assert result.status == "SUCCESS"
        assert len(result.sections) == 0


@pytest.mark.unit
class TestClassNameHint:
    """Test class name hint parameter pass-through."""

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_with_stack")
    def test_class_hint_passed_to_stack_mode(self, mock_run_stack, tmp_path):
        """Test that class_name_hint is forwarded to _run_with_stack."""
        mock_run_stack.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="W2 Tax Form",
            json_schema=SAMPLE_SCHEMA,
        )

        doc_file = tmp_path / "form.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run(str(doc_file), class_name_hint="W2 Tax Form")

        assert result.status == "SUCCESS"
        # Verify class_name_hint was passed as keyword arg
        call_kwargs = mock_run_stack.call_args[1]
        assert call_kwargs["class_name_hint"] == "W2 Tax Form"

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_local")
    def test_class_hint_passed_to_local_mode(self, mock_run_local, tmp_path):
        """Test that class_name_hint is forwarded to _run_local."""
        mock_run_local.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="Invoice",
            json_schema=SAMPLE_SCHEMA,
        )

        doc_file = tmp_path / "invoice.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient()  # No stack = local mode
        result = client.discovery.run(str(doc_file), class_name_hint="Invoice")

        assert result.status == "SUCCESS"
        call_kwargs = mock_run_local.call_args[1]
        assert call_kwargs["class_name_hint"] == "Invoice"


@pytest.mark.unit
class TestPageRangeDiscovery:
    """Test page range discovery parameter pass-through."""

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_with_stack")
    def test_page_range_passed_to_stack_mode(self, mock_run_stack, tmp_path):
        """Test that page_range is forwarded to _run_with_stack."""
        mock_run_stack.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="W2",
            json_schema=SAMPLE_SCHEMA,
            page_range="3-5",
        )

        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run(str(doc_file), page_range="3-5")

        assert result.page_range == "3-5"
        call_kwargs = mock_run_stack.call_args[1]
        assert call_kwargs["page_range"] == "3-5"

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._run_local")
    def test_page_range_passed_to_local_mode(self, mock_run_local, tmp_path):
        """Test that page_range is forwarded to _run_local."""
        mock_run_local.return_value = DiscoveryResult(
            status="SUCCESS",
            document_class="W2",
            page_range="1-2",
        )

        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        client = IDPClient()
        client.discovery.run(str(doc_file), page_range="1-2")

        call_kwargs = mock_run_local.call_args[1]
        assert call_kwargs["page_range"] == "1-2"


@pytest.mark.unit
class TestMultiSectionDiscovery:
    """Test multi-section discovery operations."""

    @patch("idp_sdk.operations.discovery.DiscoveryOperation.run")
    def test_multi_section_success(self, mock_run, tmp_path):
        """Test run_multi_section calls run() for each page range."""
        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        mock_run.side_effect = [
            DiscoveryResult(
                status="SUCCESS",
                document_class="Letter",
                json_schema=SAMPLE_SCHEMA,
            ),
            DiscoveryResult(
                status="SUCCESS",
                document_class="W2",
                json_schema=SAMPLE_SCHEMA,
            ),
        ]

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run_multi_section(
            document_path=str(doc_file),
            page_ranges=[
                {"start": 1, "end": 2, "label": "Letter"},
                {"start": 3, "end": 5, "label": "W2"},
            ],
        )

        assert isinstance(result, DiscoveryBatchResult)
        assert result.total == 2
        assert result.succeeded == 2
        assert result.failed == 0
        # Verify page_range annotations
        assert result.results[0].page_range == "1-2"
        assert result.results[1].page_range == "3-5"

    @patch("idp_sdk.operations.discovery.DiscoveryOperation.run")
    def test_multi_section_passes_label_as_class_hint(self, mock_run, tmp_path):
        """Test that page range labels are passed as class_name_hint."""
        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        mock_run.return_value = DiscoveryResult(status="SUCCESS", document_class="W2")

        client = IDPClient(stack_name="test-stack")
        client.discovery.run_multi_section(
            document_path=str(doc_file),
            page_ranges=[{"start": 3, "end": 5, "label": "W2 Form"}],
        )

        # Verify the label was passed as class_name_hint
        call_kwargs = mock_run.call_args[1]
        assert call_kwargs["class_name_hint"] == "W2 Form"
        assert call_kwargs["page_range"] == "3-5"

    @patch("idp_sdk.operations.discovery.DiscoveryOperation.run")
    def test_multi_section_partial_failure(self, mock_run, tmp_path):
        """Test multi-section with some failures."""
        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test content")

        mock_run.side_effect = [
            DiscoveryResult(status="SUCCESS", document_class="Letter"),
            DiscoveryResult(status="FAILED", error="Bedrock error"),
            DiscoveryResult(status="SUCCESS", document_class="Invoice"),
        ]

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run_multi_section(
            document_path=str(doc_file),
            page_ranges=[
                {"start": 1, "end": 2},
                {"start": 3, "end": 4},
                {"start": 5, "end": 6},
            ],
        )

        assert result.total == 3
        assert result.succeeded == 2
        assert result.failed == 1

    def test_multi_section_file_not_found(self):
        """Test run_multi_section raises for missing file."""
        client = IDPClient(stack_name="test-stack")
        with pytest.raises(FileNotFoundError, match="Document not found"):
            client.discovery.run_multi_section(
                document_path="/nonexistent/package.pdf",
                page_ranges=[{"start": 1, "end": 2}],
            )


@pytest.mark.unit
class TestAutoDetectSections:
    """Test auto-detect section operations."""

    def test_auto_detect_file_not_found(self):
        """Test auto_detect_sections raises for missing file."""
        client = IDPClient(stack_name="test-stack")
        with pytest.raises(FileNotFoundError, match="Document not found"):
            client.discovery.auto_detect_sections("/nonexistent/doc.pdf")

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._auto_detect_with_stack")
    def test_auto_detect_uses_stack_mode(self, mock_detect, tmp_path):
        """Test auto_detect_sections uses stack mode when stack is set."""
        mock_detect.return_value = AutoDetectResult(
            status="SUCCESS",
            sections=[
                AutoDetectSection(start=1, end=2, type="Letter"),
                AutoDetectSection(start=3, end=5, type="W2"),
            ],
            document_path="package.pdf",
        )

        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test")

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.auto_detect_sections(str(doc_file))

        assert result.status == "SUCCESS"
        assert len(result.sections) == 2
        mock_detect.assert_called_once()

    @patch("idp_sdk.operations.discovery.DiscoveryOperation._auto_detect_local")
    def test_auto_detect_uses_local_mode(self, mock_detect, tmp_path):
        """Test auto_detect_sections uses local mode when no stack."""
        mock_detect.return_value = AutoDetectResult(
            status="SUCCESS",
            sections=[AutoDetectSection(start=1, end=3, type="Invoice")],
        )

        doc_file = tmp_path / "doc.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test")

        client = IDPClient()  # No stack
        result = client.discovery.auto_detect_sections(str(doc_file))

        assert result.status == "SUCCESS"
        mock_detect.assert_called_once()

    @patch(
        "idp_sdk.operations.discovery.DiscoveryOperation._run_auto_detect_and_discover"
    )
    def test_auto_detect_flag_in_run(self, mock_auto, tmp_path):
        """Test that auto_detect=True in run() triggers auto-detect + discover."""
        mock_auto.return_value = DiscoveryBatchResult(
            total=2, succeeded=2, failed=0, results=[]
        )

        doc_file = tmp_path / "package.pdf"
        doc_file.write_bytes(b"%PDF-1.4 test")

        client = IDPClient(stack_name="test-stack")
        result = client.discovery.run(str(doc_file), auto_detect=True)

        assert isinstance(result, DiscoveryBatchResult)
        mock_auto.assert_called_once()


@pytest.mark.unit
class TestConfigSyncBdaModel:
    """Test ConfigSyncBdaResult model."""

    def test_sync_bda_result_success(self):
        """Test creating a successful ConfigSyncBdaResult."""
        result = ConfigSyncBdaResult(
            success=True,
            direction="bidirectional",
            mode="replace",
            classes_synced=3,
            classes_failed=0,
            processed_classes=["Invoice", "W2", "Paystub"],
        )
        assert result.success is True
        assert result.direction == "bidirectional"
        assert result.mode == "replace"
        assert result.classes_synced == 3
        assert result.classes_failed == 0
        assert len(result.processed_classes) == 3
        assert result.error is None

    def test_sync_bda_result_partial_failure(self):
        """Test ConfigSyncBdaResult with partial failure."""
        result = ConfigSyncBdaResult(
            success=False,
            direction="idp_to_bda",
            mode="merge",
            classes_synced=2,
            classes_failed=1,
            processed_classes=["Invoice", "W2", "ComplexForm"],
            error="1 class(es) failed to sync",
        )
        assert result.success is False
        assert result.classes_synced == 2
        assert result.classes_failed == 1
        assert result.error is not None

    def test_sync_bda_result_total_failure(self):
        """Test ConfigSyncBdaResult with total failure."""
        result = ConfigSyncBdaResult(
            success=False,
            direction="bda_to_idp",
            error="BDA project not found",
        )
        assert result.success is False
        assert result.classes_synced == 0
        assert result.classes_failed == 0
        assert result.error == "BDA project not found"

    def test_sync_bda_result_defaults(self):
        """Test ConfigSyncBdaResult default values."""
        result = ConfigSyncBdaResult(
            success=True,
            direction="bidirectional",
        )
        assert result.mode == "replace"
        assert result.classes_synced == 0
        assert result.classes_failed == 0
        assert result.processed_classes == []
        assert result.error is None
