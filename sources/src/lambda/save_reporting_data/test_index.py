# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
"""
Unit tests for the save_reporting_data Lambda function.
"""

import pytest
import json
import os
from unittest.mock import patch, MagicMock

from index import handler

@pytest.mark.unit
@patch.dict(os.environ, {'CONFIGURATION_TABLE_NAME': 'test-config-table', 'STACK_NAME': 'test-stack'})
@patch('index.SaveReportingData')
@patch('index.Document.from_dict')
def test_handler_success(mock_document_from_dict, mock_save_reporting_data):
    """Test successful handler execution."""
    # Mock document
    mock_document = MagicMock()
    mock_document_from_dict.return_value = mock_document
    
    # Mock SaveReportingData
    mock_reporter = MagicMock()
    mock_reporter.save.return_value = ['result1', 'result2']
    mock_save_reporting_data.return_value = mock_reporter
    
    # Create test event
    event = {
        "document": {
            "id": "test-doc",
            "input_key": "test.pdf"
        },
        "reporting_bucket": "test-reporting-bucket",
        "data_to_save": ["evaluation_results"]
    }
    
    # Call handler
    response = handler(event, {})
    
    # Verify response
    assert response["statusCode"] == 200
    assert "Successfully saved data to reporting bucket" in response["body"]
    
    # Verify SaveReportingData was called with correct parameters
    mock_save_reporting_data.assert_called_once_with(
        "test-reporting-bucket", 
        "test-stack-reporting-db", 
        "test-config-table"
    )
    mock_reporter.save.assert_called_once_with(mock_document, ["evaluation_results"])

@pytest.mark.unit
def test_handler_missing_document():
    """Test handler with missing document."""
    event = {
        "reporting_bucket": "test-reporting-bucket",
        "data_to_save": ["evaluation_results"]
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 400
    assert "No document data provided in the event" in response["body"]

@pytest.mark.unit
def test_handler_missing_reporting_bucket():
    """Test handler with missing reporting bucket."""
    event = {
        "document": {
            "id": "test-doc"
        },
        "data_to_save": ["evaluation_results"]
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 400
    assert "No reporting bucket specified in the event" in response["body"]

@pytest.mark.unit
@patch.dict(os.environ, {'CONFIGURATION_TABLE_NAME': 'test-config-table', 'STACK_NAME': 'test-stack'})
def test_handler_no_data_to_save():
    """Test handler with no data_to_save."""
    event = {
        "document": {
            "id": "test-doc",
            "input_key": "test.pdf"
        },
        "reporting_bucket": "test-reporting-bucket"
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 200
    assert "No data_to_save specified in the event, nothing to do" in response["body"]

@pytest.mark.unit
@patch.dict(os.environ, {'CONFIGURATION_TABLE_NAME': 'test-config-table', 'STACK_NAME': 'test-stack'})
@patch('index.SaveReportingData')
@patch('index.Document.from_dict')
def test_handler_no_results_processed(mock_document_from_dict, mock_save_reporting_data):
    """Test handler when no data is processed."""
    # Mock document
    mock_document = MagicMock()
    mock_document_from_dict.return_value = mock_document
    
    # Mock SaveReportingData to return empty results
    mock_reporter = MagicMock()
    mock_reporter.save.return_value = []
    mock_save_reporting_data.return_value = mock_reporter
    
    event = {
        "document": {
            "id": "test-doc",
            "input_key": "test.pdf"
        },
        "reporting_bucket": "test-reporting-bucket",
        "data_to_save": ["evaluation_results"]
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 200
    assert "No data was processed - check data_to_save parameter" in response["body"]

@pytest.mark.unit
@patch.dict(os.environ, {})  # No environment variables set
@patch('index.SaveReportingData')
@patch('index.Document.from_dict')
def test_handler_no_config_table(mock_document_from_dict, mock_save_reporting_data, caplog):
    """Test handler with no configuration table name."""
    # Mock document
    mock_document = MagicMock()
    mock_document_from_dict.return_value = mock_document
    
    # Mock SaveReportingData
    mock_reporter = MagicMock()
    mock_reporter.save.return_value = ['result1']
    mock_save_reporting_data.return_value = mock_reporter
    
    event = {
        "document": {
            "id": "test-doc",
            "input_key": "test.pdf"
        },
        "reporting_bucket": "test-reporting-bucket",
        "data_to_save": ["evaluation_results"]
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 200
    assert "Successfully saved data to reporting bucket" in response["body"]
    
    # Verify warning was logged
    assert "No configuration table name provided, will use hardcoded pricing values" in caplog.text
    
    # Verify SaveReportingData was called with None for config_table_name
    mock_save_reporting_data.assert_called_once_with(
        "test-reporting-bucket", 
        None,  # No database name since no STACK_NAME
        None   # No config table name
    )

@pytest.mark.unit
@patch.dict(os.environ, {'CONFIGURATION_TABLE_NAME': 'test-config-table', 'STACK_NAME': 'test-stack'})
@patch('index.SaveReportingData')
@patch('index.Document.from_dict')
def test_handler_with_database_name_in_event(mock_document_from_dict, mock_save_reporting_data):
    """Test handler with database_name provided in event."""
    # Mock document
    mock_document = MagicMock()
    mock_document_from_dict.return_value = mock_document
    
    # Mock SaveReportingData
    mock_reporter = MagicMock()
    mock_reporter.save.return_value = ['result1']
    mock_save_reporting_data.return_value = mock_reporter
    
    event = {
        "document": {
            "id": "test-doc",
            "input_key": "test.pdf"
        },
        "reporting_bucket": "test-reporting-bucket",
        "data_to_save": ["evaluation_results"],
        "database_name": "custom-database-name"
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 200
    assert "Successfully saved data to reporting bucket" in response["body"]
    
    # Verify SaveReportingData was called with custom database name
    mock_save_reporting_data.assert_called_once_with(
        "test-reporting-bucket", 
        "custom-database-name", 
        "test-config-table"
    )

@pytest.mark.unit
@patch.dict(os.environ, {'CONFIGURATION_TABLE_NAME': 'test-config-table', 'STACK_NAME': 'test-stack'})
@patch('index.SaveReportingData')
@patch('index.Document.from_dict')
def test_handler_exception(mock_document_from_dict, mock_save_reporting_data):
    """Test handler with exception."""
    # Mock document
    mock_document = MagicMock()
    mock_document_from_dict.return_value = mock_document
    
    # Mock SaveReportingData to raise exception
    mock_save_reporting_data.side_effect = Exception("Test exception")
    
    event = {
        "document": {
            "id": "test-doc",
            "input_key": "test.pdf"
        },
        "reporting_bucket": "test-reporting-bucket",
        "data_to_save": ["evaluation_results"]
    }
    
    response = handler(event, {})
    
    assert response["statusCode"] == 500
    assert "Error saving data to reporting bucket: Test exception" in response["body"]
