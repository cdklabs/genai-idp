# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Integration tests for Discovery module configuration.
Tests the complete configuration flow from loading to usage.
"""

import json
import unittest
from unittest.mock import Mock, patch

import yaml
from idp_common.discovery.classes_discovery import ClassesDiscovery


class TestDiscoveryConfigIntegration(unittest.TestCase):
    """Integration tests for Discovery configuration functionality."""

    def setUp(self):
        """Set up test fixtures."""
        self.test_bucket = "test-bucket"
        self.test_prefix = "test-document.pdf"
        self.test_region = "us-west-2"

        # Load sample configuration from YAML (simulating real config file)
        self.yaml_config = """
discovery:
  without_ground_truth:
    model_id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
    temperature: 0.8
    top_p: 0.15
    max_tokens: 8000
    system_prompt: "You are an expert document analyzer for form discovery."
    user_prompt: "Analyze this form and extract field structure without values."
  with_ground_truth:
    model_id: "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
    temperature: 0.6
    top_p: 0.12
    max_tokens: 9000
    system_prompt: "You are an expert document analyzer using ground truth reference."
    user_prompt: "Use ground truth: {ground_truth_json} to analyze this form."
  output_format:
    sample_json: |
      {
        "document_class": "TestForm",
        "document_description": "Test form description",
        "groups": []
      }
"""

        self.config_dict = yaml.safe_load(self.yaml_config)

        # Sample ground truth
        self.ground_truth_data = {
            "document_class": "W4Form",
            "groups": [
                {
                    "name": "EmployeeInfo",
                    "attributes": [
                        {"name": "FirstName", "type": "string"},
                        {"name": "LastName", "type": "string"},
                    ],
                }
            ],
        }

    @patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-config-table"})
    @patch("idp_common.discovery.classes_discovery.ConfigurationManager")
    @patch("idp_common.discovery.classes_discovery.bedrock.BedrockClient")
    @patch("idp_common.discovery.classes_discovery.bedrock.extract_text_from_response")
    @patch("idp_common.discovery.classes_discovery.S3Util.get_bytes")
    def test_end_to_end_config_flow_without_ground_truth(
        self,
        mock_s3_get_bytes,
        mock_extract_text,
        mock_bedrock_client,
        mock_config_manager,
    ):
        """Test complete configuration flow for discovery without ground truth."""
        # Setup mocks
        mock_config_manager_instance = Mock()
        mock_config_manager.return_value = mock_config_manager_instance

        # Mock the configuration manager to return empty config
        mock_config_manager_instance.get_configuration.return_value = None

        mock_bedrock_instance = Mock()
        mock_bedrock_client.return_value = mock_bedrock_instance

        # Mock successful Bedrock response
        mock_response = {"response": "success"}
        mock_bedrock_instance.invoke_model.return_value = mock_response

        expected_result = {
            "document_class": "TestForm",
            "document_description": "A test form for validation",
            "groups": [
                {
                    "name": "PersonalInfo",
                    "attributeType": "group",
                    "groupType": "normal",
                    "groupAttributes": [
                        {
                            "name": "FirstName",
                            "dataType": "string",
                            "description": "First name field",
                        }
                    ],
                }
            ],
        }

        mock_extract_text.return_value = json.dumps(expected_result)
        mock_s3_get_bytes.return_value = b"mock document content"

        # Mock ConfigurationReader to return config_dict
        with patch(
            "idp_common.discovery.classes_discovery.ConfigurationReader"
        ) as mock_config_reader:
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = (
                self.config_dict
            )

            with patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-table"}):
                # Initialize ClassesDiscovery with YAML config
                discovery = ClassesDiscovery(
                    input_bucket=self.test_bucket,
                    input_prefix=self.test_prefix,
                    region=self.test_region,
                )

        # Execute discovery without ground truth
        result = discovery.discovery_classes_with_document(
            input_bucket=self.test_bucket, input_prefix=self.test_prefix
        )

        # Verify Bedrock was called with correct configuration
        mock_bedrock_instance.invoke_model.assert_called_once()
        call_args = mock_bedrock_instance.invoke_model.call_args[1]

        # Verify configuration parameters were used
        self.assertEqual(
            call_args["model_id"], "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
        )
        self.assertEqual(
            call_args["system_prompt"],
            "You are an expert document analyzer for form discovery.",
        )
        self.assertEqual(call_args["temperature"], 0.8)
        self.assertEqual(call_args["top_p"], 0.15)
        self.assertEqual(call_args["max_tokens"], 8000)

        # Verify user prompt contains configured text
        content = call_args["content"]
        self.assertIsInstance(content, list)
        # The prompt should be in the text content
        prompt_found = False
        for item in content:
            if isinstance(item, dict) and "text" in item:
                if "Analyze this form and extract field structure" in item["text"]:
                    prompt_found = True
                    break
        self.assertTrue(prompt_found, "Configured user prompt not found in content")

        # Verify result
        self.assertEqual(result["status"], "SUCCESS")

    @patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-config-table"})
    @patch("idp_common.discovery.classes_discovery.ConfigurationManager")
    @patch("idp_common.discovery.classes_discovery.bedrock.BedrockClient")
    @patch("idp_common.discovery.classes_discovery.bedrock.extract_text_from_response")
    @patch("idp_common.discovery.classes_discovery.S3Util.get_bytes")
    def test_end_to_end_config_flow_with_ground_truth(
        self,
        mock_s3_get_bytes,
        mock_extract_text,
        mock_bedrock_client,
        mock_config_manager,
    ):
        """Test complete configuration flow for discovery with ground truth."""
        # Setup mocks
        mock_config_manager_instance = Mock()
        mock_config_manager.return_value = mock_config_manager_instance

        # Mock the configuration manager to return empty config
        mock_config_manager_instance.get_configuration.return_value = None

        mock_bedrock_instance = Mock()
        mock_bedrock_client.return_value = mock_bedrock_instance

        # Mock successful Bedrock response
        mock_response = {"response": "success"}
        mock_bedrock_instance.invoke_model.return_value = mock_response

        expected_result = {
            "document_class": "W4Form",
            "document_description": "Employee withholding form",
            "groups": [
                {
                    "name": "EmployeeInfo",
                    "attributeType": "group",
                    "groupType": "normal",
                    "groupAttributes": [
                        {
                            "name": "FirstName",
                            "dataType": "string",
                            "description": "Employee first name",
                        },
                        {
                            "name": "LastName",
                            "dataType": "string",
                            "description": "Employee last name",
                        },
                    ],
                }
            ],
        }

        mock_extract_text.return_value = json.dumps(expected_result)

        # Mock S3 calls for both document and ground truth
        def mock_s3_side_effect(bucket, key):
            if "ground-truth" in key:
                return json.dumps(self.ground_truth_data).encode("utf-8")
            else:
                return b"mock document content"

        mock_s3_get_bytes.side_effect = mock_s3_side_effect

        # Mock ConfigurationReader to return config_dict
        with patch(
            "idp_common.discovery.classes_discovery.ConfigurationReader"
        ) as mock_config_reader:
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = (
                self.config_dict
            )

            with patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-table"}):
                # Initialize ClassesDiscovery with YAML config
                discovery = ClassesDiscovery(
                    input_bucket=self.test_bucket,
                    input_prefix=self.test_prefix,
                    region=self.test_region,
                )

        # Execute discovery with ground truth
        result = discovery.discovery_classes_with_document_and_ground_truth(
            input_bucket=self.test_bucket,
            input_prefix=self.test_prefix,
            ground_truth_key="ground-truth.json",
        )

        # Verify Bedrock was called with correct configuration
        mock_bedrock_instance.invoke_model.assert_called_once()
        call_args = mock_bedrock_instance.invoke_model.call_args[1]

        # Verify configuration parameters were used (with_ground_truth config)
        self.assertEqual(
            call_args["model_id"], "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
        )
        self.assertEqual(
            call_args["system_prompt"],
            "You are an expert document analyzer using ground truth reference.",
        )
        self.assertEqual(call_args["temperature"], 0.6)
        self.assertEqual(call_args["top_p"], 0.12)
        self.assertEqual(call_args["max_tokens"], 9000)

        # Verify ground truth was injected into prompt
        content = call_args["content"]
        self.assertIsInstance(content, list)

        # Check that ground truth JSON is in the prompt
        prompt_found = False
        ground_truth_found = False
        for item in content:
            if isinstance(item, dict) and "text" in item:
                text_content = item["text"]
                if "Use ground truth:" in text_content:
                    prompt_found = True
                if "W4Form" in text_content:  # From ground truth data
                    ground_truth_found = True

        self.assertTrue(prompt_found, "Configured user prompt not found in content")
        self.assertTrue(ground_truth_found, "Ground truth data not found in prompt")

        # Verify result
        self.assertEqual(result["status"], "SUCCESS")

    @patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-config-table"})
    @patch("idp_common.discovery.classes_discovery.ConfigurationManager")
    @patch("idp_common.discovery.classes_discovery.bedrock.BedrockClient")
    def test_config_validation_and_defaults(
        self, mock_bedrock_client, mock_config_manager
    ):
        """Test configuration validation and default fallbacks."""
        # Setup mocks
        mock_config_manager_instance = Mock()
        mock_config_manager.return_value = mock_config_manager_instance

        # Test with incomplete configuration
        incomplete_config = {
            "discovery": {
                "without_ground_truth": {
                    "model_id": "test-model"
                    # Missing other required fields
                }
            }
        }

        # Mock ConfigurationReader to return incomplete config
        with patch(
            "idp_common.discovery.classes_discovery.ConfigurationReader"
        ) as mock_config_reader:
            mock_reader_instance = mock_config_reader.return_value
            mock_reader_instance.get_merged_configuration.return_value = (
                incomplete_config
            )

            with patch.dict("os.environ", {"CONFIGURATION_TABLE_NAME": "test-table"}):
                # Initialize with incomplete config
                discovery = ClassesDiscovery(
                    input_bucket=self.test_bucket,
                    input_prefix=self.test_prefix,
                    region=self.test_region,
                )

        # Verify that missing fields get default values
        without_gt_config = discovery.without_gt_config

        # Model ID should be from config
        self.assertEqual(without_gt_config.get("model_id"), "test-model")

        # Missing fields should get defaults when accessed
        temperature = without_gt_config.get("temperature", 1.0)
        top_p = without_gt_config.get("top_p", 0.1)
        max_tokens = without_gt_config.get("max_tokens", 10000)

        self.assertEqual(temperature, 1.0)
        self.assertEqual(top_p, 0.1)
        self.assertEqual(max_tokens, 10000)

    # Note: bedrock_model_id parameter was removed from ClassesDiscovery constructor
    # Model configuration is now handled through the config parameter only

    def test_yaml_config_parsing(self):
        """Test that YAML configuration is parsed correctly."""
        # Parse the YAML config
        parsed_config = yaml.safe_load(self.yaml_config)

        # Verify structure
        self.assertIn("discovery", parsed_config)
        discovery_config = parsed_config["discovery"]

        # Verify without_ground_truth section
        without_gt = discovery_config["without_ground_truth"]
        self.assertEqual(
            without_gt["model_id"], "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
        )
        self.assertEqual(without_gt["temperature"], 0.8)
        self.assertEqual(without_gt["top_p"], 0.15)
        self.assertEqual(without_gt["max_tokens"], 8000)

        # Verify with_ground_truth section
        with_gt = discovery_config["with_ground_truth"]
        self.assertEqual(
            with_gt["model_id"], "us.anthropic.claude-3-7-sonnet-20250219-v1:0"
        )
        self.assertEqual(with_gt["temperature"], 0.6)
        self.assertEqual(with_gt["top_p"], 0.12)
        self.assertEqual(with_gt["max_tokens"], 9000)

        # Verify prompts
        self.assertIn("expert document analyzer", without_gt["system_prompt"])
        self.assertIn("{ground_truth_json}", with_gt["user_prompt"])

        # Verify output format
        self.assertIn("output_format", discovery_config)
        self.assertIn("sample_json", discovery_config["output_format"])


if __name__ == "__main__":
    unittest.main()
