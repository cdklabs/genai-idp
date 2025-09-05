# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Global agent factory registry.

This module provides a pre-configured global instance of IDPAgentFactory with all
available agents registered. Import `agent_factory` to access registered agents.

Example:
    from idp_common.agents.factory import agent_factory

    # List available agents
    agents = agent_factory.list_available_agents()

    # Create an agent
    agent = agent_factory.create_agent("analytics-20250813-v0", config=config)
"""

import logging

from ..analytics.agent import create_analytics_agent

# from ..sample_calculator.agent import create_sample_calculator_agent  # Commented out - kept as reference for developers
from .agent_factory import IDPAgentFactory

logger = logging.getLogger(__name__)

# Create global factory instance
agent_factory = IDPAgentFactory()

# Register analytics agent
agent_factory.register_agent(
    agent_id="Analytics-Agent-v1",
    agent_name="Analytics Agent",
    agent_description="""
    Converts natural language questions into SQL queries and generates visualizations from document data.
    This agent has access to many databases within the IDP system, including metering databases which track
    the document processing volume and statistics, document-specific tables for different classes of documents,
    entity-specific information like names of people, numbers, and other entities extracted from documents,
    as well as evaluation tables which include confidence scores for extracted entities as well as
    accuracy metrics for evaluation jobs computed against provided ground truth data.
    """,
    creator_func=create_analytics_agent,
    sample_queries=[
        "How many input and output tokens have I processed in each of the last 10 days?",
        "What are the most common document types processed?",
        "In extracted W2 forms, what is the average state tax paid?",
    ],
)

# Register sample_calculator agent - COMMENTED OUT for production use
# Kept as reference pattern for developers
# agent_factory.register_agent(
#     agent_id="sample-calculator-dev-v1",
#     agent_name="Sample Calculator Agent",
#     agent_description="Simple development agent with calculator tool",
#     creator_func=create_sample_calculator_agent,
#     sample_queries=[
#         "Calculate 25 * 4 + 10",
#         "What is the square root of 144?",
#         "Help me solve 15% of 200",
#     ],
# )

# Conditionally register External MCP Agents if credentials are available
try:
    import json

    import boto3

    from ..external_mcp.agent import create_external_mcp_agent
    from ..external_mcp.config import get_external_mcp_config

    # Test if External MCP Agent credentials are available
    test_session = boto3.Session()
    test_config = get_external_mcp_config()

    secret_name = test_config["secret_name"]
    region = test_config.get("region", test_session.region_name or "us-east-1")

    secrets_client = test_session.client("secretsmanager", region_name=region)
    response = secrets_client.get_secret_value(SecretId=secret_name)
    secret_value = response["SecretString"]
    mcp_configs = json.loads(secret_value)

    # Validate it's an array
    if not isinstance(mcp_configs, list):
        raise ValueError("MCP credentials secret must contain a JSON array")

    # Register one agent per MCP server configuration
    for i, mcp_config in enumerate(mcp_configs, 1):
        # Validate required fields exist
        required_fields = [
            "mcp_url",
            "cognito_user_pool_id",
            "cognito_client_id",
            "cognito_username",
            "cognito_password",
        ]
        for field in required_fields:
            if field not in mcp_config:
                logger.warning(
                    f"Skipping MCP config {i}: missing required field '{field}'"
                )
                continue

        # Create wrapper function for this specific MCP config
        def create_mcp_agent_wrapper(mcp_server_config=mcp_config):
            def wrapper(config=None, session=None, model_id=None, **kwargs):
                return create_external_mcp_agent(
                    config=config,
                    session=session,
                    model_id=model_id,
                    mcp_server_config=mcp_server_config,
                    **kwargs,
                )

            return wrapper

        # Try to discover available tools for dynamic description
        try:
            test_result = create_external_mcp_agent(
                session=test_session,
                model_id="dummy-model-for-tool-discovery",
                mcp_server_config=mcp_config,
            )
            test_strands_agent, test_mcp_client = test_result

            # Extract available tools for dynamic description
            tools_description = ""
            if (
                hasattr(test_strands_agent, "tool_names")
                and test_strands_agent.tool_names
            ):
                tool_names = list(test_strands_agent.tool_names)
                if tool_names:
                    tools_list = ", ".join(tool_names)
                    tools_description = f" The tools available are: {tools_list}."

            # Clean up the test MCP client
            if test_mcp_client:
                try:
                    with test_mcp_client:
                        pass  # Just enter and exit to clean up
                except Exception:
                    pass  # Ignore cleanup errors

        except Exception as e:
            logger.warning(f"Could not discover MCP tools for agent {i}: {e}")
            tools_description = ""

        # Determine agent name and ID
        if "agent_name" in mcp_config and mcp_config["agent_name"]:
            agent_name = mcp_config["agent_name"]
            # Create ID from name with no spaces - assume users provide unique names
            agent_id = agent_name.replace(" ", "_").lower()
        else:
            agent_name = f"External MCP Agent {i}"
            agent_id = f"external-mcp-agent-{i}"

        # Determine agent description
        if "agent_description" in mcp_config and mcp_config["agent_description"]:
            agent_description = mcp_config["agent_description"] + tools_description
        else:
            agent_description = f"Agent which connects to external MCP servers to provide additional tools and capabilities.{tools_description}"

        # Register the agent
        agent_factory.register_agent(
            agent_id=agent_id,
            agent_name=agent_name,
            agent_description=agent_description,
            creator_func=create_mcp_agent_wrapper(),
            sample_queries=[
                "What tools are available from the external MCP server?",
                "Help me use the external tools to solve my problem",
                "Show me what capabilities the MCP server provides",
            ],
        )
        logger.info(
            f"External MCP Agent '{agent_name}' registered successfully with ID '{agent_id}'"
        )

except Exception as e:
    logger.warning(
        f"External MCP Agents not registered - credentials not available or invalid: {str(e)}"
    )
    # Don't register any agents if they can't be created
