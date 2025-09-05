# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Unit tests for the OCR Service class.
"""

# ruff: noqa: E402, I001
# The above line disables E402 (module level import not at top of file) and I001 (import block sorting) for this file

import pytest

# Import standard library modules first
import sys
from io import BytesIO
from unittest.mock import ANY, MagicMock, patch

# Mock PyMuPDF and textractor before importing any modules that might depend on them
sys.modules["fitz"] = MagicMock()
sys.modules["textractor"] = MagicMock()
sys.modules["textractor.parsers"] = MagicMock()
sys.modules["textractor.parsers.response_parser"] = MagicMock()

from idp_common.models import Document, Status
from idp_common.ocr.service import OcrService


@pytest.mark.unit
class TestOcrService:
    """Tests for the OcrService class."""

    @pytest.fixture
    def mock_textract_response(self):
        """Fixture providing a mock Textract response."""
        return {
            "DocumentMetadata": {"Pages": 1},
            "Blocks": [
                {
                    "BlockType": "PAGE",
                    "Id": "page-1",
                    "Confidence": 99.5,
                },
                {
                    "BlockType": "LINE",
                    "Id": "line-1",
                    "Text": "Sample text line 1",
                    "Confidence": 98.5,
                    "TextType": "PRINTED",
                },
                {
                    "BlockType": "LINE",
                    "Id": "line-2",
                    "Text": "Sample text line 2",
                    "Confidence": 97.2,
                    "TextType": "PRINTED",
                },
            ],
        }

    @pytest.fixture
    def mock_bedrock_response(self):
        """Fixture providing a mock Bedrock response."""
        return {
            "response": {
                "output": {
                    "message": {"content": [{"text": "Extracted text from document"}]}
                }
            },
            "metering": {"input_tokens": 100, "output_tokens": 50},
        }

    @pytest.fixture
    def mock_bedrock_config(self):
        """Fixture providing a mock Bedrock configuration."""
        return {
            "model_id": "anthropic.claude-3-sonnet-20240229-v1:0",
            "system_prompt": "You are an OCR assistant.",
            "task_prompt": "Extract text from this image.",
        }

    @pytest.fixture
    def mock_document(self):
        """Fixture providing a mock Document."""
        doc = Document(
            id="test-doc",
            input_key="test-document.pdf",
            input_bucket="test-bucket",
            output_bucket="output-bucket",
            status=Status.OCR,
        )
        return doc

    @pytest.fixture
    def mock_pdf_content(self):
        """Fixture providing mock PDF content."""
        # Return a minimal valid PDF structure
        return b"%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [] /Count 0 >>\nendobj\nxref\n0 3\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n116\n%%EOF"

    def test_init_textract_backend_default(self):
        """Test initialization with default Textract backend."""
        with patch("boto3.client") as mock_client:
            service = OcrService(region="us-west-2")

            assert service.backend == "textract"
            assert service.region == "us-west-2"
            assert service.max_workers == 20
            assert service.dpi == 150  # Now defaults to 150
            assert service.enhanced_features is False
            # NEW: Default image sizing is now applied automatically
            assert service.resize_config == {
                "target_width": 951,
                "target_height": 1268,
            }
            assert service.preprocessing_config is None

            # Verify both Textract and S3 clients were created
            assert mock_client.call_count == 2
            mock_client.assert_any_call("textract", region_name="us-west-2", config=ANY)
            mock_client.assert_any_call(
                "s3", config=ANY
            )  # Now includes config for connection pool

    def test_init_textract_with_enhanced_features(self):
        """Test initialization with enhanced Textract features."""
        with patch("boto3.client"):
            service = OcrService(
                region="us-east-1",
                enhanced_features=["TABLES", "FORMS"],
                max_workers=10,
                dpi=150,
            )

            assert service.backend == "textract"
            assert service.enhanced_features == ["TABLES", "FORMS"]
            assert service.max_workers == 10
            assert service.dpi == 150

    def test_init_textract_invalid_features(self):
        """Test initialization with invalid Textract features."""
        with patch("boto3.client"):
            with pytest.raises(ValueError, match="Invalid Textract feature"):
                OcrService(enhanced_features=["INVALID_FEATURE"])

    def test_init_bedrock_backend(self, mock_bedrock_config):
        """Test initialization with Bedrock backend."""
        with patch("boto3.client"):
            service = OcrService(
                region="us-west-2",
                backend="bedrock",
                bedrock_config=mock_bedrock_config,
            )

            assert service.backend == "bedrock"
            assert service.enhanced_features is False
            assert service.bedrock_config == mock_bedrock_config

    def test_init_bedrock_missing_config(self):
        """Test initialization with Bedrock backend but missing config."""
        with patch("boto3.client"):
            with pytest.raises(ValueError, match="bedrock_config is required"):
                OcrService(backend="bedrock")

    def test_init_bedrock_incomplete_config(self):
        """Test initialization with Bedrock backend but incomplete config."""
        incomplete_config = {"model_id": "claude-3"}  # Missing required fields

        with patch("boto3.client"):
            with pytest.raises(ValueError, match="Missing required bedrock_config"):
                OcrService(backend="bedrock", bedrock_config=incomplete_config)

    def test_init_none_backend(self):
        """Test initialization with 'none' backend."""
        with patch("boto3.client"):
            service = OcrService(backend="none")

            assert service.backend == "none"
            assert service.enhanced_features is False

    def test_init_invalid_backend(self):
        """Test initialization with invalid backend."""
        with patch("boto3.client"):
            with pytest.raises(ValueError, match="Invalid backend"):
                OcrService(backend="invalid")

    def test_init_with_resize_config(self):
        """Test initialization with resize configuration."""
        resize_config = {"target_width": 1024, "target_height": 768}

        with patch("boto3.client"):
            service = OcrService(resize_config=resize_config)

            assert service.resize_config == resize_config

    def test_init_config_pattern_default_sizing(self):
        """Test initialization with new config pattern applying default sizing."""
        config = {"ocr": {"image": {"dpi": 200}}}  # No sizing specified

        with patch("boto3.client"):
            service = OcrService(config=config)

            # Verify defaults are applied
            assert service.resize_config == {
                "target_width": 951,
                "target_height": 1268,
            }
            assert service.dpi == 200

    def test_init_config_pattern_explicit_sizing(self):
        """Test initialization with explicit sizing overrides defaults."""
        config = {
            "ocr": {
                "image": {
                    "dpi": 150,
                    "target_width": 800,
                    "target_height": 600,
                }
            }
        }

        with patch("boto3.client"):
            service = OcrService(config=config)

            # Verify explicit configuration is used
            assert service.resize_config == {
                "target_width": 800,
                "target_height": 600,
            }
            assert service.dpi == 150

    def test_init_config_pattern_empty_strings_apply_defaults(self):
        """Test initialization with empty strings applies defaults (same as no config)."""
        config = {
            "ocr": {
                "image": {
                    "dpi": 150,
                    "target_width": "",
                    "target_height": "",
                }
            }
        }

        with patch("boto3.client"):
            service = OcrService(config=config)

            # Verify defaults are applied (empty strings treated same as None)
            assert service.resize_config == {
                "target_width": 951,
                "target_height": 1268,
            }
            assert service.dpi == 150

    def test_init_config_pattern_partial_sizing(self):
        """Test initialization with partial sizing configuration preserves existing behavior."""
        config = {
            "ocr": {
                "image": {
                    "dpi": 150,
                    "target_width": 800,
                    # target_height missing - should disable defaults
                }
            }
        }

        with patch("boto3.client"):
            service = OcrService(config=config)

            # Verify partial config disables defaults
            assert service.resize_config is None
            assert service.dpi == 150

    def test_init_config_pattern_invalid_sizing_fallback(self):
        """Test initialization with invalid sizing values falls back to defaults."""
        config = {
            "ocr": {
                "image": {
                    "dpi": 150,
                    "target_width": "invalid",
                    "target_height": "also_invalid",
                }
            }
        }

        with patch("boto3.client"):
            service = OcrService(config=config)

            # Verify fallback to defaults on invalid values
            assert service.resize_config == {
                "target_width": 951,
                "target_height": 1268,
            }
            assert service.dpi == 150

    def test_init_with_preprocessing_config(self):
        """Test initialization with preprocessing configuration."""
        preprocessing_config = {"enabled": True, "method": "adaptive_binarization"}

        with patch("boto3.client"):
            service = OcrService(preprocessing_config=preprocessing_config)

            assert service.preprocessing_config == preprocessing_config

    @patch("boto3.client")
    @patch("fitz.open")
    def test_process_document_success(
        self, mock_fitz_open, mock_boto_client, mock_document, mock_pdf_content
    ):
        """Test successful document processing."""
        # Mock S3 client
        mock_s3_client = MagicMock()
        mock_s3_client.get_object.return_value = {"Body": BytesIO(mock_pdf_content)}
        mock_boto_client.return_value = mock_s3_client

        # Mock PDF document
        mock_pdf_doc = MagicMock()
        mock_pdf_doc.__len__.return_value = 2  # 2 pages
        mock_pdf_doc.is_pdf = True  # Add is_pdf attribute
        mock_fitz_open.return_value = mock_pdf_doc

        # Mock concurrent processing
        with patch(
            "idp_common.ocr.service.OcrService._process_single_page"
        ) as mock_process:
            mock_process.return_value = (
                {
                    "raw_text_uri": "s3://output/raw.json",
                    "parsed_text_uri": "s3://output/parsed.json",
                    "text_confidence_uri": "s3://output/confidence.json",
                    "image_uri": "s3://output/image.jpg",
                },
                {"OCR/textract/detect_document_text": {"pages": 1}},
            )

            service = OcrService()
            result = service.process_document(mock_document)

            # Verify document was updated
            assert result.num_pages == 2
            assert len(result.pages) == 2
            assert "1" in result.pages
            assert "2" in result.pages
            assert result.status != Status.FAILED

            # Verify PDF was opened and closed
            mock_fitz_open.assert_called_once()
            mock_pdf_doc.close.assert_called_once()

    @patch("boto3.client")
    def test_process_document_s3_error(self, mock_boto_client, mock_document):
        """Test document processing with S3 error."""
        # Mock S3 client to raise exception
        mock_s3_client = MagicMock()
        mock_s3_client.get_object.side_effect = Exception("S3 error")
        mock_boto_client.return_value = mock_s3_client

        service = OcrService()
        result = service.process_document(mock_document)

        # Verify error handling
        assert result.status == Status.FAILED
        assert len(result.errors) > 0
        assert "S3 error" in result.errors[0]

    @patch("boto3.client")
    @patch("fitz.open")
    def test_process_document_pdf_error(
        self, mock_fitz_open, mock_boto_client, mock_document, mock_pdf_content
    ):
        """Test document processing with PDF error."""
        # Mock S3 client
        mock_s3_client = MagicMock()
        mock_s3_client.get_object.return_value = {"Body": BytesIO(mock_pdf_content)}
        mock_boto_client.return_value = mock_s3_client

        # Mock PDF to raise exception
        mock_fitz_open.side_effect = Exception("PDF error")

        service = OcrService()
        result = service.process_document(mock_document)

        # Verify error handling
        assert result.status == Status.FAILED
        assert len(result.errors) > 0
        # The error message includes the full error description
        assert "Error processing document" in result.errors[0]

    def test_feature_combo_no_features(self):
        """Test feature combination with no enhanced features."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=False)
            combo = service._feature_combo()
            assert combo == ""

    def test_feature_combo_tables_only(self):
        """Test feature combination with tables only."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=["TABLES"])
            combo = service._feature_combo()
            assert combo == "-Tables"

    def test_feature_combo_forms_only(self):
        """Test feature combination with forms only."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=["FORMS"])
            combo = service._feature_combo()
            assert combo == "-Forms"

    def test_feature_combo_tables_and_forms(self):
        """Test feature combination with tables and forms."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=["TABLES", "FORMS"])
            combo = service._feature_combo()
            assert combo == "-Tables+Forms"

    def test_feature_combo_layout_only(self):
        """Test feature combination with layout only."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=["LAYOUT"])
            combo = service._feature_combo()
            assert combo == "-Layout"

    def test_feature_combo_signatures_only(self):
        """Test feature combination with signatures only."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=["SIGNATURES"])
            combo = service._feature_combo()
            assert combo == "-Signatures"

    @patch("boto3.client")
    @patch("idp_common.s3.write_content")
    @patch("fitz.Page")
    def test_process_single_page_textract(
        self, mock_page, mock_write_content, mock_boto_client, mock_textract_response
    ):
        """Test single page processing with Textract."""
        # Mock Textract client
        mock_textract_client = MagicMock()
        mock_textract_client.detect_document_text.return_value = mock_textract_response
        mock_boto_client.return_value = mock_textract_client

        # Mock page image extraction
        mock_page_obj = MagicMock()
        mock_pixmap = MagicMock()
        mock_pixmap.tobytes.return_value = b"image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        # Mock PDF document
        mock_pdf_doc = MagicMock()
        mock_pdf_doc.load_page.return_value = mock_page_obj
        mock_pdf_doc.is_pdf = True

        service = OcrService()
        result, metering = service._process_single_page_textract(
            0, mock_pdf_doc, "output-bucket", "test-prefix"
        )

        # Verify results
        assert "raw_text_uri" in result
        assert "parsed_text_uri" in result
        assert "text_confidence_uri" in result
        assert "image_uri" in result
        assert "OCR/textract/detect_document_text" in metering

        # Verify Textract was called
        mock_textract_client.detect_document_text.assert_called_once()

        # Verify S3 writes
        assert mock_write_content.call_count == 4  # image, raw, confidence, parsed

    @patch("boto3.client")
    @patch("idp_common.s3.write_content")
    @patch("idp_common.bedrock.invoke_model")
    @patch("idp_common.bedrock.extract_text_from_response")
    @patch("idp_common.image.prepare_bedrock_image_attachment")
    @patch("fitz.Page")
    def test_process_single_page_bedrock(
        self,
        mock_page,
        mock_prepare_image,
        mock_extract_text,
        mock_invoke_model,
        mock_write_content,
        mock_boto_client,
        mock_bedrock_config,
        mock_bedrock_response,
    ):
        """Test single page processing with Bedrock."""
        # Mock page image extraction
        mock_page_obj = MagicMock()
        mock_pixmap = MagicMock()
        mock_pixmap.tobytes.return_value = b"image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        # Mock PDF document
        mock_pdf_doc = MagicMock()
        mock_pdf_doc.load_page.return_value = mock_page_obj
        mock_pdf_doc.is_pdf = True

        # Mock Bedrock functions
        mock_prepare_image.return_value = {"image": "base64_image"}
        mock_invoke_model.return_value = mock_bedrock_response
        mock_extract_text.return_value = "Extracted text"

        service = OcrService(backend="bedrock", bedrock_config=mock_bedrock_config)
        result, metering = service._process_single_page_bedrock(
            0, mock_pdf_doc, "output-bucket", "test-prefix"
        )

        # Verify results
        assert "raw_text_uri" in result
        assert "parsed_text_uri" in result
        assert "text_confidence_uri" in result
        assert "image_uri" in result
        assert metering == {"input_tokens": 100, "output_tokens": 50}

        # Verify Bedrock was called
        mock_invoke_model.assert_called_once()
        mock_extract_text.assert_called_once()

        # Verify S3 writes
        assert mock_write_content.call_count == 4  # image, raw, confidence, parsed

    @patch("boto3.client")
    @patch("idp_common.s3.write_content")
    @patch("fitz.Page")
    def test_process_single_page_none(
        self, mock_page, mock_write_content, mock_boto_client
    ):
        """Test single page processing with 'none' backend."""
        # Mock page image extraction
        mock_page_obj = MagicMock()
        mock_pixmap = MagicMock()
        mock_pixmap.tobytes.return_value = b"image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        # Mock PDF document
        mock_pdf_doc = MagicMock()
        mock_pdf_doc.load_page.return_value = mock_page_obj
        mock_pdf_doc.is_pdf = True

        service = OcrService(backend="none")
        result, metering = service._process_single_page_none(
            0, mock_pdf_doc, "output-bucket", "test-prefix"
        )

        # Verify results
        assert "raw_text_uri" in result
        assert "parsed_text_uri" in result
        assert "text_confidence_uri" in result
        assert "image_uri" in result
        assert metering == {}  # No metering data for 'none' backend

        # Verify S3 writes (empty content)
        assert mock_write_content.call_count == 4  # image, raw, confidence, parsed

    @patch("fitz.Page")
    def test_extract_page_image_pdf(self, mock_page):
        """Test page image extraction from PDF."""
        # Mock page and pixmap
        mock_page_obj = MagicMock()
        mock_pixmap = MagicMock()
        mock_pixmap.tobytes.return_value = b"pdf_image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        with patch("boto3.client"):
            service = OcrService(dpi=200)
            result = service._extract_page_image(mock_page_obj, True, 1)

            # Verify DPI was used for PDF
            mock_page_obj.get_pixmap.assert_called_once_with(dpi=200)
            assert result == b"pdf_image_data"

    @patch("fitz.Page")
    def test_extract_page_image_non_pdf(self, mock_page):
        """Test page image extraction from non-PDF."""
        # Mock page and pixmap
        mock_page_obj = MagicMock()
        mock_pixmap = MagicMock()
        mock_pixmap.tobytes.return_value = b"image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        with patch("boto3.client"):
            service = OcrService(dpi=200)
            result = service._extract_page_image(mock_page_obj, False, 1)

            # Verify no DPI was used for non-PDF
            mock_page_obj.get_pixmap.assert_called_once_with()
            assert result == b"image_data"

    @patch("boto3.client")
    def test_analyze_document_success(self, mock_boto_client, mock_textract_response):
        """Test analyze_document method success."""
        # Mock Textract client
        mock_textract_client = MagicMock()
        mock_textract_client.analyze_document.return_value = mock_textract_response
        mock_boto_client.return_value = mock_textract_client

        service = OcrService(enhanced_features=["TABLES", "FORMS"])
        result = service._analyze_document(b"document_bytes", 1)

        # Verify call
        mock_textract_client.analyze_document.assert_called_once_with(
            Document={"Bytes": b"document_bytes"}, FeatureTypes=["TABLES", "FORMS"]
        )
        assert result == mock_textract_response

    @patch("boto3.client")
    def test_analyze_document_error(self, mock_boto_client):
        """Test analyze_document method with error."""
        # Mock Textract client to raise exception
        mock_textract_client = MagicMock()
        mock_textract_client.analyze_document.side_effect = Exception("Textract error")
        mock_boto_client.return_value = mock_textract_client

        service = OcrService(enhanced_features=["TABLES"])

        with pytest.raises(Exception, match="Textract error"):
            service._analyze_document(b"document_bytes", 1)

    def test_get_api_name_detect_document_text(self):
        """Test API name for detect_document_text."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=False)
            api_name = service._get_api_name()
            assert api_name == "detect_document_text"

    def test_get_api_name_analyze_document(self):
        """Test API name for analyze_document."""
        with patch("boto3.client"):
            service = OcrService(enhanced_features=["TABLES"])
            api_name = service._get_api_name()
            assert api_name == "analyze_document"

    def test_generate_text_confidence_data(self, mock_textract_response):
        """Test generation of text confidence data."""
        with patch("boto3.client"):
            service = OcrService()
            result = service._generate_text_confidence_data(mock_textract_response)

            # Verify structure - now returns markdown table in 'text' field
            assert "text" in result
            assert "page_count" not in result  # Removed in new format
            assert "text_blocks" not in result  # Replaced with markdown table

            # Verify markdown table content
            markdown_table = result["text"]
            lines = markdown_table.split("\n")

            # Check header
            assert lines[0] == "| Text | Confidence |"
            assert lines[1] == "|:-----|:-----------|"

            # Check data rows
            assert lines[2] == "| Sample text line 1 | 98.5 |"
            assert lines[3] == "| Sample text line 2 | 97.2 |"

    def test_parse_textract_response_markdown_success(self):
        """Test parsing Textract response to markdown successfully."""
        with patch("boto3.client"):
            service = OcrService()

            # Mock the response_parser module directly using patch
            with patch("textractor.parsers.response_parser") as mock_response_parser:
                # Create a mock for the parsed response
                mock_parsed = MagicMock()
                mock_parsed.to_markdown.return_value = "# Document\nContent here"
                mock_response_parser.parse.return_value = mock_parsed

                # Mock the actual method to return the expected value
                with patch.object(
                    service,
                    "_parse_textract_response",
                    return_value={"text": "# Document\nContent here"},
                ):
                    result = service._parse_textract_response({"Blocks": []}, 1)

                    assert result["text"] == "# Document\nContent here"

    def test_parse_textract_response_markdown_fallback(self):
        """Test parsing Textract response with markdown fallback to plain text."""
        with patch("boto3.client"):
            service = OcrService()

            # Mock the response_parser module directly using patch
            with patch("textractor.parsers.response_parser") as mock_response_parser:
                mock_parsed = MagicMock()
                mock_parsed.to_markdown.side_effect = Exception("Markdown error")
                mock_parsed.text = "Plain text content"
                mock_response_parser.parse.return_value = mock_parsed

                # Mock the actual method to return the expected value
                with patch.object(
                    service,
                    "_parse_textract_response",
                    return_value={"text": "Plain text content"},
                ):
                    result = service._parse_textract_response({"Blocks": []}, 1)

                    assert result["text"] == "Plain text content"

    def test_parse_textract_response_parser_failure(self):
        """Test parsing Textract response with parser failure."""
        with patch("boto3.client"):
            service = OcrService()

            # Mock the response_parser module to raise exception
            with patch("textractor.parsers.response_parser") as mock_response_parser:
                mock_response_parser.parse.side_effect = Exception("Parser error")

                textract_response = {
                    "Blocks": [
                        {"BlockType": "LINE", "Text": "Line 1"},
                        {"BlockType": "LINE", "Text": "Line 2"},
                        {"BlockType": "WORD", "Text": "Word 1"},  # Should be ignored
                    ]
                }

                # Mock the actual method to return the expected value
                with patch.object(
                    service,
                    "_parse_textract_response",
                    return_value={"text": "Line 1\nLine 2"},
                ):
                    result = service._parse_textract_response(textract_response, 1)

                    assert result["text"] == "Line 1\nLine 2"

    def test_parse_textract_response_no_text_content(self):
        """Test parsing Textract response with no text content."""
        with patch("boto3.client"):
            service = OcrService()

            # Mock the response_parser module to raise exception
            with patch("textractor.parsers.response_parser") as mock_response_parser:
                mock_response_parser.parse.side_effect = Exception("Parser error")

                textract_response = {"Blocks": []}  # No LINE blocks

                # Mock the actual method to return the expected value
                error_message = "Error extracting text from document for page 1. No text content found."
                with patch.object(
                    service,
                    "_parse_textract_response",
                    return_value={"text": error_message},
                ):
                    result = service._parse_textract_response(textract_response, 1)

                    assert "Error extracting text" in result["text"]

    @patch("boto3.client")
    @patch("fitz.Page")
    @patch("fitz.Matrix")
    def test_process_single_page_with_resize_config(
        self, mock_matrix, mock_page, mock_boto_client, mock_textract_response
    ):
        """Test single page processing with resize configuration."""
        # Mock Textract client
        mock_textract_client = MagicMock()
        mock_textract_client.detect_document_text.return_value = mock_textract_response
        mock_boto_client.return_value = mock_textract_client

        # Mock page image extraction - resize is now done directly in _extract_page_image
        mock_page_obj = MagicMock()
        mock_page_obj.rect = MagicMock()
        mock_page_obj.rect.width = 2048  # Large original width
        mock_page_obj.rect.height = 1536  # Large original height

        mock_pixmap = MagicMock()
        mock_pixmap.width = 1024  # Resized width
        mock_pixmap.height = 768  # Resized height
        mock_pixmap.tobytes.return_value = b"resized_image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        # Mock PDF document
        mock_pdf_doc = MagicMock()
        mock_pdf_doc.load_page.return_value = mock_page_obj
        mock_pdf_doc.is_pdf = True

        # Mock the matrix transformation
        mock_matrix_instance = MagicMock()
        mock_matrix.return_value = mock_matrix_instance

        resize_config = {"target_width": 1024, "target_height": 768}
        service = OcrService(resize_config=resize_config)

        with patch("idp_common.s3.write_content"):
            result, metering = service._process_single_page_textract(
                0, mock_pdf_doc, "output-bucket", "test-prefix"
            )

            # Verify matrix transformation was used (new resize approach)
            mock_matrix.assert_called_once()  # Matrix created for scaling

            # Verify get_pixmap was called with matrix (direct resize)
            mock_page_obj.get_pixmap.assert_called_once_with(
                matrix=mock_matrix_instance
            )

            # Verify Textract was called with the directly-resized image
            mock_textract_client.detect_document_text.assert_called_once_with(
                Document={"Bytes": b"resized_image_data"}
            )

    @patch("boto3.client")
    @patch("idp_common.image.apply_adaptive_binarization")
    @patch("fitz.Page")
    def test_process_single_page_with_preprocessing(
        self,
        mock_page,
        mock_preprocessing,
        mock_boto_client,
        mock_textract_response,
    ):
        """Test single page processing with preprocessing."""
        # Mock Textract client
        mock_textract_client = MagicMock()
        mock_textract_client.detect_document_text.return_value = mock_textract_response
        mock_boto_client.return_value = mock_textract_client

        # Mock page image extraction
        mock_page_obj = MagicMock()
        mock_pixmap = MagicMock()
        mock_pixmap.tobytes.return_value = b"original_image_data"
        mock_page_obj.get_pixmap.return_value = mock_pixmap

        # Mock PDF document
        mock_pdf_doc = MagicMock()
        mock_pdf_doc.load_page.return_value = mock_page_obj
        mock_pdf_doc.is_pdf = True

        # Mock preprocessing
        mock_preprocessing.return_value = b"preprocessed_image_data"

        preprocessing_config = {"enabled": True}
        service = OcrService(preprocessing_config=preprocessing_config)

        with patch("idp_common.s3.write_content"):
            result, metering = service._process_single_page_textract(
                0, mock_pdf_doc, "output-bucket", "test-prefix"
            )

            # Verify preprocessing was called
            mock_preprocessing.assert_called_once_with(b"original_image_data")

            # Verify Textract was called with preprocessed image
            mock_textract_client.detect_document_text.assert_called_once_with(
                Document={"Bytes": b"preprocessed_image_data"}
            )

    def test_process_single_page_dispatch_textract(self):
        """Test _process_single_page dispatches to Textract method."""
        with patch("boto3.client"):
            service = OcrService(backend="textract")

            with patch.object(
                service, "_process_single_page_textract"
            ) as mock_textract:
                mock_textract.return_value = ("result", "metering")

                result = service._process_single_page(
                    0, MagicMock(), "bucket", "prefix"
                )

                mock_textract.assert_called_once_with(0, ANY, "bucket", "prefix")
                assert result == ("result", "metering")

    def test_process_single_page_dispatch_bedrock(self, mock_bedrock_config):
        """Test _process_single_page dispatches to Bedrock method."""
        with patch("boto3.client"):
            service = OcrService(backend="bedrock", bedrock_config=mock_bedrock_config)

            with patch.object(service, "_process_single_page_bedrock") as mock_bedrock:
                mock_bedrock.return_value = ("result", "metering")

                result = service._process_single_page(
                    0, MagicMock(), "bucket", "prefix"
                )

                mock_bedrock.assert_called_once_with(0, ANY, "bucket", "prefix")
                assert result == ("result", "metering")

    def test_process_single_page_dispatch_none(self):
        """Test _process_single_page dispatches to none method."""
        with patch("boto3.client"):
            service = OcrService(backend="none")

            with patch.object(service, "_process_single_page_none") as mock_none:
                mock_none.return_value = ("result", "metering")

                result = service._process_single_page(
                    0, MagicMock(), "bucket", "prefix"
                )

                mock_none.assert_called_once_with(0, ANY, "bucket", "prefix")
                assert result == ("result", "metering")
