# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Unit tests for the ClassesDiscovery class.
"""

# ruff: noqa: E402, I001
# The above line disables E402 (module level import not at top of file) and I001 (import block sorting) for this file

import pytest

# Import standard library modules first
import json
from unittest.mock import MagicMock, patch, call

# Import third-party modules

# Import application modules
from idp_common.discovery.classes_discovery import ClassesDiscovery


@pytest.mark.unit
class TestClassesDiscovery:
    """Tests for the ClassesDiscovery class."""

    @pytest.fixture
    def mock_config(self):
        """Fixture providing a mock configuration."""
        return {
            "discovery": {
                "without_ground_truth": {
                    "model_id": "anthropic.claude-3-sonnet-20240229-v1:0",
                    "temperature": 1.0,
                    "top_p": 0.1,
                    "max_tokens": 10000,
                },
                "with_ground_truth": {
                    "model_id": "anthropic.claude-3-sonnet-20240229-v1:0",
                    "temperature": 1.0,
                    "top_p": 0.1,
                    "max_tokens": 10000,
                },
            }
        }

    @pytest.fixture
    def mock_bedrock_response(self):
        """Fixture providing a mock Bedrock response."""
        return {
            "response": {
                "output": {
                    "message": {
                        "content": [
                            {
                                "text": json.dumps(
                                    {
                                        "document_class": "W-4",
                                        "document_description": "Employee's Withholding Certificate form",
                                        "groups": [
                                            {
                                                "name": "PersonalInformation",
                                                "description": "Personal information of employee",
                                                "attributeType": "group",
                                                "groupType": "normal",
                                                "groupAttributes": [
                                                    {
                                                        "name": "FirstName",
                                                        "dataType": "string",
                                                        "description": "First Name of Employee",
                                                    },
                                                    {
                                                        "name": "LastName",
                                                        "dataType": "string",
                                                        "description": "Last Name of Employee",
                                                    },
                                                ],
                                            }
                                        ],
                                    }
                                )
                            }
                        ]
                    }
                }
            },
            "metering": {"tokens": 500},
        }

    @pytest.fixture
    def mock_ground_truth_data(self):
        """Fixture providing mock ground truth data."""
        return {
            "employee_name": "John Doe",
            "ssn": "123-45-6789",
            "address": {
                "street": "123 Main St",
                "city": "Anytown",
                "state": "CA",
                "zip": "12345",
            },
            "filing_status": "Single",
        }

    @pytest.fixture
    def mock_configuration_item(self):
        """Fixture providing a mock configuration item."""
        return {
            "Configuration": "Custom",
            "classes": [
                {
                    "name": "W-4",
                    "description": "Employee's Withholding Certificate form",
                    "attributes": [
                        {
                            "name": "PersonalInformation",
                            "description": "Personal information of employee",
                            "attributeType": "group",
                        }
                    ],
                }
            ],
        }

    @pytest.fixture
    def service(self, mock_config):
        """Fixture providing a ClassesDiscovery instance."""
        with (
            patch("boto3.resource") as mock_dynamodb,
            patch("idp_common.bedrock.BedrockClient") as mock_bedrock_client,
            patch(
                "idp_common.discovery.classes_discovery.ConfigurationReader"
            ) as mock_config_reader,
            patch(
                "idp_common.discovery.classes_discovery.ConfigurationManager"
            ) as mock_config_manager,
            patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-config-table"}),
        ):
            # Mock DynamoDB table
            mock_table = MagicMock()
            mock_dynamodb.return_value.Table.return_value = mock_table

            # Mock BedrockClient
            mock_client = MagicMock()
            mock_bedrock_client.return_value = mock_client

            # Mock the ConfigurationReader to return the mock config
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = mock_config

            # Mock the ConfigurationManager
            mock_manager_instance = mock_config_manager.return_value
            mock_manager_instance.get_configuration.return_value = None
            mock_manager_instance.update_configuration.return_value = None

            service = ClassesDiscovery(
                input_bucket="test-bucket",
                input_prefix="test-document.pdf",
                region="us-west-2",
            )

            # Store mocks for access in tests
            service._mock_table = mock_table
            service._mock_bedrock_client = mock_client
            service.config_manager = mock_manager_instance

            return service

    def test_init(self, mock_config):
        """Test initialization of ClassesDiscovery."""
        with (
            patch("boto3.resource"),
            patch("idp_common.bedrock.BedrockClient") as mock_bedrock_client,
            patch(
                "idp_common.discovery.classes_discovery.ConfigurationReader"
            ) as mock_config_reader,
            patch("idp_common.discovery.classes_discovery.ConfigurationManager"),
            patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-config-table"}),
        ):
            # Mock the ConfigurationReader to return the mock config
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = mock_config

            service = ClassesDiscovery(
                input_bucket="test-bucket",
                input_prefix="test-document.pdf",
                region="us-west-2",
            )

            assert service.input_bucket == "test-bucket"
            assert service.input_prefix == "test-document.pdf"
            # Verify config is loaded correctly
            assert (
                service.without_gt_config["model_id"]
                == "anthropic.claude-3-sonnet-20240229-v1:0"
            )
            assert (
                service.with_gt_config["model_id"]
                == "anthropic.claude-3-sonnet-20240229-v1:0"
            )
            assert service.region == "us-west-2"

            # Verify BedrockClient was initialized with correct region
            mock_bedrock_client.assert_called_once_with(region="us-west-2")

    def test_init_with_default_region(self, mock_config):
        """Test initialization with default region from environment."""
        with (
            patch("boto3.resource"),
            patch("idp_common.bedrock.BedrockClient"),
            patch(
                "idp_common.discovery.classes_discovery.ConfigurationReader"
            ) as mock_config_reader,
            patch.dict(
                "os.environ",
                {"AWS_REGION": "us-east-1", "CONFIGURATION_TABLE_NAME": "test-table"},
            ),
        ):
            # Mock the ConfigurationReader to return the mock config
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = mock_config

            service = ClassesDiscovery(
                input_bucket="test-bucket",
                input_prefix="test-document.pdf",
                region=None,  # Explicitly pass None to trigger environment lookup
            )

            assert service.region == "us-east-1"

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_discovery_classes_with_document_success(
        self,
        mock_extract_text,
        mock_get_bytes,
        service,
        mock_bedrock_response,
        mock_configuration_item,
    ):
        """Test successful document class discovery."""
        # Mock S3 file content
        mock_file_content = b"fake_pdf_content"
        mock_get_bytes.return_value = mock_file_content

        # Mock Bedrock response
        service._mock_bedrock_client.return_value = mock_bedrock_response
        mock_extract_text.return_value = json.dumps(
            {
                "document_class": "W-4",
                "document_description": "Employee's Withholding Certificate form",
                "groups": [
                    {
                        "name": "PersonalInformation",
                        "description": "Personal information of employee",
                        "attributeType": "group",
                        "groupAttributes": [
                            {
                                "name": "FirstName",
                                "dataType": "string",
                                "description": "First Name of Employee",
                            },
                            {
                                "name": "LastName",
                                "dataType": "string",
                                "description": "Last Name of Employee",
                            },
                        ],
                    }
                ],
            }
        )

        # Mock configuration retrieval
        service.config_manager.get_configuration.return_value = mock_configuration_item

        # Call the method
        result = service.discovery_classes_with_document(
            "test-bucket", "test-document.pdf"
        )

        # Verify result
        assert result["status"] == "SUCCESS"

        # Verify S3 was called
        mock_get_bytes.assert_called_once_with(
            bucket="test-bucket", key="test-document.pdf"
        )

        # Verify Bedrock was called
        service._mock_bedrock_client.invoke_model.assert_called_once()

        # Verify configuration was updated via configuration manager
        service.config_manager.update_configuration.assert_called_once()

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    def test_discovery_classes_with_document_s3_error(self, mock_get_bytes, service):
        """Test handling of S3 error during document discovery."""
        mock_get_bytes.side_effect = Exception("S3 access denied")

        with pytest.raises(
            Exception, match="Failed to process document test-document.pdf"
        ):
            service.discovery_classes_with_document("test-bucket", "test-document.pdf")

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_discovery_classes_with_document_bedrock_error(
        self, mock_extract_text, mock_get_bytes, service
    ):
        """Test handling of Bedrock error during document discovery."""
        mock_get_bytes.return_value = b"fake_content"
        service._mock_bedrock_client.side_effect = Exception("Bedrock error")

        with pytest.raises(
            Exception, match="Failed to process document test-document.pdf"
        ):
            service.discovery_classes_with_document("test-bucket", "test-document.pdf")

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_discovery_classes_with_document_invalid_json(
        self, mock_extract_text, mock_get_bytes, service
    ):
        """Test handling of invalid JSON response from Bedrock."""
        mock_get_bytes.return_value = b"fake_content"
        service._mock_bedrock_client.return_value = {"response": {}, "metering": {}}
        mock_extract_text.return_value = "Invalid JSON response"

        with pytest.raises(
            Exception, match="Failed to process document test-document.pdf"
        ):
            service.discovery_classes_with_document("test-bucket", "test-document.pdf")

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_discovery_classes_with_document_and_ground_truth_success(
        self,
        mock_extract_text,
        mock_get_bytes,
        service,
        mock_ground_truth_data,
        mock_configuration_item,
    ):
        """Test successful document class discovery with ground truth."""
        # Mock S3 file content
        mock_file_content = b"fake_pdf_content"
        mock_ground_truth_content = json.dumps(mock_ground_truth_data).encode()
        mock_get_bytes.side_effect = [mock_ground_truth_content, mock_file_content]

        # Mock Bedrock response
        service._mock_bedrock_client.return_value = {
            "response": {"output": {"message": {"content": [{"text": "{}"}]}}},
            "metering": {"tokens": 500},
        }
        mock_extract_text.return_value = json.dumps(
            {
                "document_class": "W-4",
                "document_description": "Employee's Withholding Certificate form",
                "groups": [],
            }
        )

        # Mock configuration retrieval
        service.config_manager.get_configuration.return_value = mock_configuration_item

        # Call the method
        result = service.discovery_classes_with_document_and_ground_truth(
            "test-bucket", "test-document.pdf", "ground-truth.json"
        )

        # Verify result
        assert result["status"] == "SUCCESS"

        # Verify S3 was called twice (ground truth + document)
        assert mock_get_bytes.call_count == 2
        mock_get_bytes.assert_has_calls(
            [
                call(bucket="test-bucket", key="ground-truth.json"),
                call(bucket="test-bucket", key="test-document.pdf"),
            ]
        )

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    def test_load_ground_truth_success(
        self, mock_get_bytes, service, mock_ground_truth_data
    ):
        """Test successful loading of ground truth data."""
        mock_get_bytes.return_value = json.dumps(mock_ground_truth_data).encode()

        result = service._load_ground_truth("test-bucket", "ground-truth.json")

        assert result == mock_ground_truth_data
        mock_get_bytes.assert_called_once_with(
            bucket="test-bucket", key="ground-truth.json"
        )

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    def test_load_ground_truth_invalid_json(self, mock_get_bytes, service):
        """Test loading invalid JSON ground truth data."""
        mock_get_bytes.return_value = b"Invalid JSON content"

        with pytest.raises(Exception):
            service._load_ground_truth("test-bucket", "ground-truth.json")

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    def test_load_ground_truth_s3_error(self, mock_get_bytes, service):
        """Test handling S3 error when loading ground truth."""
        mock_get_bytes.side_effect = Exception("S3 error")

        with pytest.raises(Exception):
            service._load_ground_truth("test-bucket", "ground-truth.json")

    @patch("idp_common.image.prepare_bedrock_image_attachment")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_extract_data_from_document_success(
        self, mock_extract_text, mock_prepare_image, service
    ):
        """Test successful data extraction from document."""
        mock_document_content = b"fake_image_content"
        mock_extract_text.return_value = json.dumps(
            {
                "document_class": "W-4",
                "document_description": "Test document",
                "groups": [],
            }
        )
        service._mock_bedrock_client.return_value = {
            "response": {"output": {"message": {"content": [{"text": "{}"}]}}},
            "metering": {"tokens": 500},
        }

        # Mock the image preparation
        mock_prepare_image.return_value = {
            "image": {
                "format": "jpeg",
                "source": {"bytes": "base64_encoded_image_data"},
            }
        }

        result = service._extract_data_from_document(mock_document_content, "jpg")

        assert result["document_class"] == "W-4"
        assert result["document_description"] == "Test document"
        assert result["groups"] == []

        # Verify Bedrock was called with correct parameters
        service._mock_bedrock_client.invoke_model.assert_called_once()
        call_args = service._mock_bedrock_client.invoke_model.call_args[1]
        assert call_args["model_id"] == "anthropic.claude-3-sonnet-20240229-v1:0"
        assert call_args["temperature"] == 1.0
        assert call_args["top_p"] == 0.1
        assert call_args["max_tokens"] == 10000
        assert call_args["context"] == "ClassesDiscovery"

    @patch("idp_common.bedrock.extract_text_from_response")
    def test_extract_data_from_document_pdf(self, mock_extract_text, service):
        """Test data extraction from PDF document."""
        mock_document_content = b"fake_pdf_content"
        mock_extract_text.return_value = json.dumps(
            {"document_class": "Form", "groups": []}
        )
        service._mock_bedrock_client.return_value = {
            "response": {"output": {"message": {"content": [{"text": "{}"}]}}},
            "metering": {"tokens": 500},
        }

        result = service._extract_data_from_document(mock_document_content, "pdf")

        assert result is not None

        # Verify the content structure for PDF
        call_args = service._mock_bedrock_client.invoke_model.call_args[1]
        content = call_args["content"]
        assert len(content) == 2
        assert "document" in content[0]
        assert content[0]["document"]["format"] == "pdf"
        assert "text" in content[1]

    def test_extract_data_from_document_bedrock_error(self, service):
        """Test handling of Bedrock error during data extraction."""
        service._mock_bedrock_client.side_effect = Exception("Bedrock error")

        result = service._extract_data_from_document(b"fake_content", "jpg")

        assert result is None

    @patch("idp_common.image.prepare_bedrock_image_attachment")
    def test_create_content_list_image(self, mock_prepare_image, service):
        """Test creating content list for image document."""
        mock_content = b"fake_image_content"
        prompt = "Test prompt"

        # Mock the image preparation
        mock_prepare_image.return_value = {
            "image": {"format": "jpg", "source": {"bytes": "base64_encoded_image_data"}}
        }

        result = service._create_content_list(prompt, mock_content, "jpg")

        assert len(result) == 2
        assert "image" in result[0]
        mock_prepare_image.assert_called_once_with(mock_content)
        assert result[0]["image"]["format"] == "jpg"
        assert "source" in result[0]["image"]
        assert "bytes" in result[0]["image"]["source"]
        assert result[1]["text"] == prompt

    def test_create_content_list_pdf(self, service):
        """Test creating content list for PDF document."""
        mock_content = b"fake_pdf_content"
        prompt = "Test prompt"

        result = service._create_content_list(prompt, mock_content, "pdf")

        assert len(result) == 2
        assert "document" in result[0]
        assert result[0]["document"]["format"] == "pdf"
        assert result[0]["document"]["name"] == "document_messages"
        assert result[0]["document"]["source"]["bytes"] == mock_content
        assert result[1]["text"] == prompt

    @patch("idp_common.image.prepare_bedrock_image_attachment")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_extract_data_from_document_with_ground_truth_success(
        self, mock_extract_text, mock_prepare_image, service, mock_ground_truth_data
    ):
        """Test successful data extraction with ground truth."""
        mock_document_content = b"fake_image_content"
        mock_extract_text.return_value = json.dumps(
            {
                "document_class": "W-4",
                "document_description": "Test document",
                "groups": [],
            }
        )
        service._mock_bedrock_client.return_value = {
            "response": {"output": {"message": {"content": [{"text": "{}"}]}}},
            "metering": {"tokens": 500},
        }

        # Mock the image preparation
        mock_prepare_image.return_value = {
            "format": "jpeg",
            "source": {"bytes": "base64_encoded_image_data"},
        }

        result = service._extract_data_from_document_with_ground_truth(
            mock_document_content, "jpg", mock_ground_truth_data
        )

        assert result["document_class"] == "W-4"
        assert result["document_description"] == "Test document"

        # Verify Bedrock was called with ground truth context
        service._mock_bedrock_client.invoke_model.assert_called_once()
        call_args = service._mock_bedrock_client.invoke_model.call_args[1]
        assert call_args["context"] == "ClassesDiscoveryWithGroundTruth"

    def test_extract_data_from_document_with_ground_truth_error(
        self, service, mock_ground_truth_data
    ):
        """Test handling of error during ground truth extraction."""
        service._mock_bedrock_client.side_effect = Exception("Bedrock error")

        result = service._extract_data_from_document_with_ground_truth(
            b"fake_content", "jpg", mock_ground_truth_data
        )

        assert result is None

    def test_prompt_classes_discovery_with_ground_truth(
        self, service, mock_ground_truth_data
    ):
        """Test prompt generation with ground truth data."""
        result = service._prompt_classes_discovery_with_ground_truth(
            mock_ground_truth_data
        )

        assert "GROUND_TRUTH_REFERENCE" in result
        assert json.dumps(mock_ground_truth_data, indent=2) in result
        assert "document_class" in result
        assert "document_description" in result
        assert "groups" in result

    def test_prompt_classes_discovery(self, service):
        """Test basic prompt generation for classes discovery."""
        result = service._prompt_classes_discovery()

        assert "forms data" in result
        assert "document_class" in result
        assert "document_description" in result
        assert "groups" in result
        assert "JSON format" in result

    def test_sample_output_format(self, service):
        """Test sample output format generation."""
        result = service._sample_output_format()

        assert "document_class" in result
        assert "document_description" in result
        assert "groups" in result
        assert "PersonalInformation" in result
        assert "FirstName" in result
        assert "Age" in result

    def test_discovery_classes_with_document_updates_existing_class(
        self, service, mock_configuration_item
    ):
        """Test that discovery updates existing class configuration."""
        # Mock existing configuration with the same class name
        existing_config = {
            "Configuration": "Custom",
            "classes": [
                {"name": "W-4", "description": "Old description", "attributes": []},
                {"name": "Other-Form", "description": "Other form", "attributes": []},
            ],
        }

        with (
            patch("idp_common.utils.s3util.S3Util.get_bytes") as mock_get_bytes,
            patch("idp_common.bedrock.extract_text_from_response") as mock_extract_text,
        ):
            mock_get_bytes.return_value = b"fake_content"
            mock_extract_text.return_value = json.dumps(
                {
                    "document_class": "W-4",
                    "document_description": "Updated description",
                    "groups": [],
                }
            )
            service._mock_bedrock_client.return_value = {
                "response": {"output": {"message": {"content": [{"text": "{}"}]}}},
                "metering": {"tokens": 500},
            }
            service.config_manager.get_configuration.return_value = existing_config

            result = service.discovery_classes_with_document(
                "test-bucket", "test-document.pdf"
            )

            assert result["status"] == "SUCCESS"

            # Verify that configuration manager was called to update configuration
            service.config_manager.update_configuration.assert_called_once()
            call_args = service.config_manager.update_configuration.call_args[0]
            updated_classes = call_args[1]["classes"]

            # Should have 2 classes (Other-Form + updated W-4)
            assert len(updated_classes) == 2

            # Find the W-4 class and verify it was updated
            w4_class = next(
                (cls for cls in updated_classes if cls["name"] == "W-4"), None
            )
            assert w4_class is not None
            assert w4_class["description"] == "Updated description"

    def test_discovery_classes_with_document_no_existing_config(self, service):
        """Test discovery when no existing configuration exists."""
        with (
            patch("idp_common.utils.s3util.S3Util.get_bytes") as mock_get_bytes,
            patch("idp_common.bedrock.extract_text_from_response") as mock_extract_text,
        ):
            mock_get_bytes.return_value = b"fake_content"
            mock_extract_text.return_value = json.dumps(
                {
                    "document_class": "W-4",
                    "document_description": "New form",
                    "groups": [],
                }
            )
            service._mock_bedrock_client.return_value = {
                "response": {"output": {"message": {"content": [{"text": "{}"}]}}},
                "metering": {"tokens": 500},
            }
            service.config_manager.get_configuration.return_value = (
                None  # No existing config
            )

            result = service.discovery_classes_with_document(
                "test-bucket", "test-document.pdf"
            )

            assert result["status"] == "SUCCESS"

            # Verify configuration was created via configuration manager
            service.config_manager.update_configuration.assert_called_once()
            call_args = service.config_manager.update_configuration.call_args[0]
            updated_classes = call_args[1]["classes"]

            # Should have 1 class
            assert len(updated_classes) == 1
            assert updated_classes[0]["name"] == "W-4"
            assert updated_classes[0]["description"] == "New form"
