# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""Sample Calculator Agent implementation for development purposes."""

import logging

import boto3
import strands
from strands.models import BedrockModel
from strands_tools import calculator

logger = logging.getLogger(__name__)


def create_sample_calculator_agent(
    session: boto3.Session,
    **kwargs,
) -> strands.Agent:
    """
    Create a minimal sample calculator agent with calculator tool.

    Args:
        session: Boto3 session for AWS operations
        **kwargs: Additional arguments

    Returns:
        strands.Agent: Configured Strands agent instance
    """
    # Use hardcoded model ID
    model_id = "us.anthropic.claude-3-7-sonnet-20250219-v1:0"

    # Create Bedrock model
    model = BedrockModel(model_id=model_id, session=session)

    # Create and return agent with calculator tool
    return strands.Agent(model=model, tools=[calculator])
