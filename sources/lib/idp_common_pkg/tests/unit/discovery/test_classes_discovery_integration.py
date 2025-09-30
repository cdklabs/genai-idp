# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Integration tests for the ClassesDiscovery class.
These tests demonstrate the full workflow and integration between components.
"""

# ruff: noqa: E402, I001
# The above line disables E402 (module level import not at top of file) and I001 (import block sorting) for this file

import pytest

# Import standard library modules first
import json
from unittest.mock import MagicMock, patch

# Import application modules
from idp_common.discovery.classes_discovery import ClassesDiscovery


@pytest.mark.unit
class TestClassesDiscoveryIntegration:
    """Integration tests for the ClassesDiscovery class."""

    @pytest.fixture
    def mock_w4_bedrock_response(self):
        """Fixture providing a realistic W-4 form Bedrock response."""
        return {
            "response": {
                "output": {
                    "message": {
                        "content": [
                            {
                                "text": json.dumps(
                                    {
                                        "document_class": "W-4",
                                        "document_description": "Employee's Withholding Certificate form for federal tax withholding",
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
                                                        "description": "First Name of Employee from line 1",
                                                    },
                                                    {
                                                        "name": "LastName",
                                                        "dataType": "string",
                                                        "description": "Last Name of Employee from line 1",
                                                    },
                                                    {
                                                        "name": "SSN",
                                                        "dataType": "string",
                                                        "description": "Social Security Number from line 1",
                                                    },
                                                ],
                                            },
                                            {
                                                "name": "AddressInformation",
                                                "description": "Address information of employee",
                                                "attributeType": "group",
                                                "groupType": "normal",
                                                "groupAttributes": [
                                                    {
                                                        "name": "Address",
                                                        "dataType": "string",
                                                        "description": "Home address from line 2",
                                                    },
                                                    {
                                                        "name": "City",
                                                        "dataType": "string",
                                                        "description": "City from line 2",
                                                    },
                                                    {
                                                        "name": "State",
                                                        "dataType": "string",
                                                        "description": "State from line 2",
                                                    },
                                                    {
                                                        "name": "ZipCode",
                                                        "dataType": "string",
                                                        "description": "ZIP code from line 2",
                                                    },
                                                ],
                                            },
                                            {
                                                "name": "WithholdingInformation",
                                                "description": "Tax withholding preferences",
                                                "attributeType": "group",
                                                "groupType": "normal",
                                                "groupAttributes": [
                                                    {
                                                        "name": "FilingStatus",
                                                        "dataType": "string",
                                                        "description": "Filing status from step 1",
                                                    },
                                                    {
                                                        "name": "MultipleJobs",
                                                        "dataType": "boolean",
                                                        "description": "Multiple jobs checkbox from step 2",
                                                    },
                                                    {
                                                        "name": "Dependents",
                                                        "dataType": "number",
                                                        "description": "Number of dependents from step 3",
                                                    },
                                                    {
                                                        "name": "ExtraWithholding",
                                                        "dataType": "number",
                                                        "description": "Extra withholding amount from step 4",
                                                    },
                                                ],
                                            },
                                        ],
                                    }
                                )
                            }
                        ]
                    }
                }
            },
            "metering": {"tokens": 1200},
        }

    @pytest.fixture
    def mock_w4_ground_truth(self):
        """Fixture providing realistic W-4 ground truth data."""
        return {
            "employee_name": "John Smith",
            "ssn": "123-45-6789",
            "address": "123 Main Street",
            "city": "Anytown",
            "state": "CA",
            "zip": "12345",
            "filing_status": "Single",
            "multiple_jobs": False,
            "dependents": 0,
            "extra_withholding": 50.00,
        }

    @pytest.fixture
    def service_with_mocks(self):
        """Fixture providing a ClassesDiscovery instance with all dependencies mocked."""
        with (
            patch("boto3.resource") as mock_dynamodb,
            patch("idp_common.bedrock.BedrockClient") as mock_bedrock_client,
            patch(
                "idp_common.discovery.classes_discovery.ConfigurationReader"
            ) as mock_config_reader,
            patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-config-table"}),
        ):
            # Mock DynamoDB table
            mock_table = MagicMock()
            mock_dynamodb.return_value.Table.return_value = mock_table

            # Mock BedrockClient
            mock_client = MagicMock()
            mock_bedrock_client.return_value = mock_client

            # Mock ConfigurationReader to return a default config
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = {
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

            service = ClassesDiscovery(
                input_bucket="test-discovery-bucket",
                input_prefix="forms/w4-sample.pdf",
                region="us-west-2",
            )

            # Store mocks for access in tests
            service._mock_table = mock_table
            service._mock_bedrock_client = mock_client

            return service

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_complete_w4_discovery_workflow(
        self,
        mock_extract_text,
        mock_get_bytes,
        service_with_mocks,
        mock_w4_bedrock_response,
    ):
        """Test the complete workflow for discovering W-4 form structure."""
        # Mock S3 file content (simulating a W-4 PDF)
        mock_pdf_content = b"%PDF-1.4 fake W-4 form content..."
        mock_get_bytes.return_value = mock_pdf_content

        # Mock Bedrock response extraction
        mock_extract_text.return_value = mock_w4_bedrock_response["response"]["output"][
            "message"
        ]["content"][0]["text"]
        service_with_mocks._mock_bedrock_client.invoke_model.return_value = (
            mock_w4_bedrock_response
        )

        # Mock existing configuration (empty initially)
        service_with_mocks._mock_table.get_item.return_value = {}

        # Execute the discovery workflow
        result = service_with_mocks.discovery_classes_with_document(
            "test-discovery-bucket", "forms/w4-sample.pdf"
        )

        # Verify successful completion
        assert result["status"] == "SUCCESS"

        # Verify S3 was accessed
        mock_get_bytes.assert_called_once_with(
            bucket="test-discovery-bucket", key="forms/w4-sample.pdf"
        )

        # Verify Bedrock was called with correct parameters
        service_with_mocks._mock_bedrock_client.invoke_model.assert_called_once()
        bedrock_call_args = (
            service_with_mocks._mock_bedrock_client.invoke_model.call_args[1]
        )

        assert (
            bedrock_call_args["model_id"] == "anthropic.claude-3-sonnet-20240229-v1:0"
        )
        assert bedrock_call_args["temperature"] == 1.0
        assert bedrock_call_args["top_p"] == 0.1
        assert bedrock_call_args["max_tokens"] == 10000
        assert bedrock_call_args["context"] == "ClassesDiscovery"

        # Verify content structure for PDF
        content = bedrock_call_args["content"]
        assert len(content) == 2
        assert "document" in content[0]
        assert content[0]["document"]["format"] == "pdf"
        assert "text" in content[1]
        assert "forms data" in content[1]["text"]

        # Verify configuration was updated
        service_with_mocks._mock_table.put_item.assert_called_once()
        put_item_args = service_with_mocks._mock_table.put_item.call_args[1]

        assert put_item_args["Item"]["Configuration"] == "Custom"
        classes = put_item_args["Item"]["classes"]
        assert len(classes) == 1

        w4_class = classes[0]
        assert w4_class["name"] == "W-4"
        assert (
            w4_class["description"]
            == "Employee's Withholding Certificate form for federal tax withholding"
        )
        assert (
            len(w4_class["attributes"]) == 3
        )  # PersonalInformation, AddressInformation, WithholdingInformation

        # Verify group structure
        personal_info = next(
            g for g in w4_class["attributes"] if g["name"] == "PersonalInformation"
        )
        assert personal_info["attributeType"] == "group"
        assert len(personal_info["groupAttributes"]) == 3  # FirstName, LastName, SSN

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_complete_w4_discovery_with_ground_truth_workflow(
        self,
        mock_extract_text,
        mock_get_bytes,
        service_with_mocks,
        mock_w4_bedrock_response,
        mock_w4_ground_truth,
    ):
        """Test the complete workflow for discovering W-4 form structure with ground truth."""
        # Mock S3 file content
        mock_pdf_content = b"%PDF-1.4 fake W-4 form content..."
        mock_ground_truth_content = json.dumps(mock_w4_ground_truth).encode()
        mock_get_bytes.side_effect = [mock_ground_truth_content, mock_pdf_content]

        # Mock Bedrock response extraction
        mock_extract_text.return_value = mock_w4_bedrock_response["response"]["output"][
            "message"
        ]["content"][0]["text"]
        service_with_mocks._mock_bedrock_client.return_value = mock_w4_bedrock_response

        # Mock existing configuration
        service_with_mocks._mock_table.get_item.return_value = {}

        # Execute the discovery workflow with ground truth
        result = service_with_mocks.discovery_classes_with_document_and_ground_truth(
            "test-discovery-bucket", "forms/w4-sample.pdf", "ground-truth/w4-gt.json"
        )

        # Verify successful completion
        assert result["status"] == "SUCCESS"

        # Verify S3 was accessed for both files
        assert mock_get_bytes.call_count == 2
        mock_get_bytes.assert_any_call(
            bucket="test-discovery-bucket", key="ground-truth/w4-gt.json"
        )
        mock_get_bytes.assert_any_call(
            bucket="test-discovery-bucket", key="forms/w4-sample.pdf"
        )

        # Verify Bedrock was called with ground truth context
        service_with_mocks._mock_bedrock_client.invoke_model.assert_called_once()
        bedrock_call_args = (
            service_with_mocks._mock_bedrock_client.invoke_model.call_args[1]
        )
        assert bedrock_call_args["context"] == "ClassesDiscoveryWithGroundTruth"

        # Verify ground truth was included in the prompt
        prompt_text = bedrock_call_args["content"][1]["text"]
        assert "GROUND_TRUTH_REFERENCE" in prompt_text
        assert "John Smith" in prompt_text  # From ground truth data
        assert "123-45-6789" in prompt_text  # From ground truth data

    @patch("idp_common.utils.s3util.S3Util.get_bytes")
    @patch("idp_common.bedrock.extract_text_from_response")
    def test_discovery_updates_existing_configuration(
        self,
        mock_extract_text,
        mock_get_bytes,
        service_with_mocks,
        mock_w4_bedrock_response,
    ):
        """Test that discovery properly updates existing configuration."""
        # Mock S3 file content
        mock_get_bytes.return_value = b"fake content"

        # Mock Bedrock response
        mock_extract_text.return_value = mock_w4_bedrock_response["response"]["output"][
            "message"
        ]["content"][0]["text"]
        service_with_mocks._mock_bedrock_client.return_value = mock_w4_bedrock_response

        # Mock existing configuration with different forms
        existing_config = {
            "Configuration": "Custom",
            "classes": [
                {
                    "name": "I-9",
                    "description": "Employment Eligibility Verification",
                    "attributes": [],
                },
                {"name": "W-4", "description": "Old W-4 description", "attributes": []},
            ],
        }
        service_with_mocks._mock_table.get_item.return_value = {"Item": existing_config}

        # Execute discovery
        result = service_with_mocks.discovery_classes_with_document(
            "test-discovery-bucket", "forms/w4-sample.pdf"
        )

        # Verify successful completion
        assert result["status"] == "SUCCESS"

        # Verify configuration was updated
        put_item_args = service_with_mocks._mock_table.put_item.call_args[1]
        updated_classes = put_item_args["Item"]["classes"]

        # Should have 2 classes: I-9 (unchanged) + W-4 (updated)
        assert len(updated_classes) == 2

        # Find and verify the updated W-4 class
        w4_class = next(cls for cls in updated_classes if cls["name"] == "W-4")
        assert (
            w4_class["description"]
            == "Employee's Withholding Certificate form for federal tax withholding"
        )
        assert len(w4_class["attributes"]) == 3

        # Verify I-9 class is still present
        i9_class = next(cls for cls in updated_classes if cls["name"] == "I-9")
        assert i9_class["description"] == "Employment Eligibility Verification"

    def test_error_handling_and_recovery(self, service_with_mocks):
        """Test error handling and recovery mechanisms."""
        with patch("idp_common.utils.s3util.S3Util.get_bytes") as mock_get_bytes:
            # Test S3 access error
            mock_get_bytes.side_effect = Exception("S3 access denied")

            with pytest.raises(Exception, match="Failed to process document"):
                service_with_mocks.discovery_classes_with_document(
                    "test-discovery-bucket", "forms/invalid-file.pdf"
                )

            # Test Bedrock error
            mock_get_bytes.side_effect = None
            mock_get_bytes.return_value = b"fake content"
            service_with_mocks._mock_bedrock_client.side_effect = Exception(
                "Bedrock throttling"
            )

            with pytest.raises(Exception, match="Failed to process document"):
                service_with_mocks.discovery_classes_with_document(
                    "test-discovery-bucket", "forms/throttled-file.pdf"
                )

    def test_different_file_formats(self, service_with_mocks):
        """Test handling of different file formats (PDF vs images)."""
        with (
            patch("idp_common.utils.s3util.S3Util.get_bytes") as mock_get_bytes,
            patch("idp_common.bedrock.extract_text_from_response") as mock_extract_text,
            patch(
                "idp_common.image.prepare_bedrock_image_attachment"
            ) as mock_prepare_image,
        ):
            mock_get_bytes.return_value = b"fake image content"
            expected_response = {
                "document_class": "Receipt",
                "document_description": "Purchase receipt",
                "groups": [],
            }
            mock_extract_text.return_value = json.dumps(expected_response)
            service_with_mocks._mock_bedrock_client.invoke_model.return_value = {
                "response": {
                    "output": {
                        "message": {
                            "content": [{"text": json.dumps(expected_response)}]
                        }
                    }
                },
                "metering": {"tokens": 300},
            }
            service_with_mocks._mock_table.get_item.return_value = {}

            # Mock the image preparation
            mock_prepare_image.return_value = {
                "image": {
                    "format": "jpeg",
                    "source": {"bytes": "base64_encoded_image_data"},
                }
            }

            # Test with JPG file
            result = service_with_mocks.discovery_classes_with_document(
                "test-discovery-bucket", "receipts/receipt.jpg"
            )

            assert result["status"] == "SUCCESS"

            # Verify content structure for image
            bedrock_call_args = (
                service_with_mocks._mock_bedrock_client.invoke_model.call_args[1]
            )
            content = bedrock_call_args["content"]
            assert len(content) == 2
            assert "image" in content[0]
            assert content[0]["image"]["format"] == "jpeg"
            assert "source" in content[0]["image"]
            assert "bytes" in content[0]["image"]["source"]
