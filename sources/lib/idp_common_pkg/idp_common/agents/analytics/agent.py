# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Analytics Agent implementation using Strands framework.
"""

import logging
import os
from typing import Any, Dict

import boto3
import strands
from strands.models import BedrockModel

from ..common.config import load_result_format_description
from .config import load_python_plot_generation_examples
from .tools import CodeInterpreterTools, get_database_info, run_athena_query
from .utils import register_code_interpreter_tools

logger = logging.getLogger(__name__)


def create_analytics_agent(
    config: Dict[str, Any],
    session: boto3.Session,
    **kwargs,
) -> strands.Agent:
    """
    Create and configure the analytics agent with appropriate tools and system prompt.

    Args:
        config: Configuration dictionary containing Athena settings and other parameters
        session: Boto3 session for AWS operations
        **kwargs: Additional arguments (job_id, user_id, etc. handled by IDPAgent wrapper)

    Returns:
        strands.Agent: Configured Strands agent instance
    """

    # Load the output format description
    final_result_format = load_result_format_description()
    # Load python code examples
    python_plot_generation_examples = load_python_plot_generation_examples()

    # Define the system prompt for the analytics agent
    system_prompt = f"""
    You are an AI agent that converts natural language questions into Athena queries, executes those queries, and writes python code to convert the query results into json representing either a plot, a table, or a string.
    
    # Task
    Your task is to:
    1. Understand the user's question
    2. Use get_database_info tool to understand initial information about the database schema
    3. Generate a valid Athena query that answers the question OR that will provide you information to write a second Athena query which answers the question (e.g. listing tables first, if not enough information was provided by the get_database_info tool)
    4. Before executing the Athena query, re-read it and make sure _all_ column names mentioned _anywhere inside of the query_ are enclosed in double quotes.
    5. Execute your revised query using the run_athena_query tool. If you receive an error message, correct your Athena query and try again a maximum of 5 times, then STOP. Do not ever make up fake data. For exploratory queries you can return the athena results directly. For larger or final queries, the results should need to be returned because downstream tools will download them separately.
    6. Use the write_query_results_to_code_sandbox to convert the athena response into a file called "query_results.csv" in the same environment future python scripts will be executed.
    7. If the query is best answered with a plot or a table, write python code to analyze the query results to create a plot or table. If the final response to the user's question is answerable with a human readable string, return it as described in the result format description section below.
    8. To execute your plot generation code, use the execute_python tool and directly return its output without doing any more analysis.
    
    DO NOT attempt to execute multiple tools in parallel. The input of some tools depend on the output of others. Only ever execute one tool at a time.
    
    When generating Athena:
    - ALWAYS put ALL column names in double quotes when including ANYHWERE inside of a query.
    - Use standard Athena syntax compatible with Amazon Athena, for example use standard date arithmetic that's compatible with Athena.
    - Do not guess at table or column names. Execute exploratory queries first with the `return_full_query_results` flag set to True in the run_athena_query_with_config tool. Your final query should use `return_full_query_results` set to False. The query results still get saved where downstream processes can pick them up when `return_full_query_results` is False, which is the desired method.
    - Use a "SHOW TABLES" query to list all dynamic tables available to you.
    - Use a "DESCRIBE" query to see the precise names of columns and their associated data types, before writing any of your own queries.
    - Include appropriate table joins when needed
    - Use column names exactly as they appear in the schema, ALWAYS in double quotes within your query.
    - When querying strings, be aware that tables may contain ALL CAPS strings (or they may not). So, make your queries agnostic to case whenever possible.
    - If you cannot get your query to work successfully, stop. DO NOT EVER generate fake or synthetic data. Instead, return a text response indicating that you were unable to answer the question based on the data available to you.
    - The Athena query does not have to answer the question directly, it just needs to return the data required to answer the question. Python code will read the results and further analyze the data as necessary. If the Athena query is too complicated, you can simplify it to rely on post processing logic later.
    - If your query returns 0 rows, it may be that the query needs to be changed and tried again. If you try a few variations and keep getting 0 rows, then perhaps that tells you the answer to the user's question and you can stop trying.
    - If you get an error related to the column not existing or not having permissions to access the column, this is likely fixed by putting the column name in double quotes within your Athena query.
    
    When writing python:
    - Only write python code to generate plots or tables. Do not use python for any other purpose.
    - The python code should read the query results from "query_results.csv" file provided, for example with a line like `df = pd.read_csv("query_results.csv")`
    - Make sure the python code will output json representing either "table" or "plotData" responseType as described in the above description of the result format.
    - Any time you generate a plot, make sure to label the x and y axes clearly.
    - Use built in python libraries, optionally with pandas or matplotlib.
    - Always use the execute_python tool to execute your python code, and be sure to include the reset_state=True flag each time you call this tool.
    
    # Here are some python code examples to guide you:
    {python_plot_generation_examples}
    
    # Result format
    Here is a description of the result format:
    ```markdown
    {final_result_format}
    ```
    
    Remember, DO NOT attempt to execute multiple tools in parallel. The input of some tools depend on the output of others. Only ever execute one tool at a time.
    
    Also remember, DO NOT EVER GENERATE SYNTHETIC DATA. Only answer questions or generate plots based on REAL DATA retrieved from databases. If no data can be retrieved, or if there are gaps in the data, do not make up fake data. It is better to show an empty plot or explain you are unable to answer than to make up data.
    
    Your final response should be directly parsable as json with no additional text before or after. The json should conform to the result format description shown above, with top level key "responseType" being one of "plotData", "table", or "text". You may have to clean up the output of the python code if, for example, it contains extra strings from logging or otherwise. Return only directly parsable json in your final response.
    """

    # Create a new tool function that directly calls run_athena_query with the config
    @strands.tool
    def run_athena_query_with_config(
        query: str, return_full_query_results: bool = False
    ) -> Dict[str, Any]:
        """
        Execute a SQL query on Amazon Athena.

        Args:
            query: SQL query string to execute (all column names should be enclosed in quotes)
            return_full_query_results: If True, includes the full query results as CSV string in the response.
                WARNING: This can return very large strings and should only be used for small exploratory
                queries like DESCRIBE, SHOW TABLES, or queries with LIMIT clauses. Default is False.
                Use False whenever possible.

        Returns:
            Dict containing either query results or error information
        """
        return run_athena_query(query, config, return_full_query_results)

    # Initialize code interpreter tools
    # Get region from session or environment variable
    region = session.region_name or os.environ.get("AWS_REGION", "us-west-2")
    logger.info(f"Initializing CodeInterpreterTools with region: {region}")
    code_interpreter_tools = CodeInterpreterTools(session, region=region)

    # Register for cleanup
    register_code_interpreter_tools(code_interpreter_tools)

    # Create the agent with tools and system prompt
    tools = [
        run_athena_query_with_config,
        code_interpreter_tools.write_query_results_to_code_sandbox,
        code_interpreter_tools.execute_python,
        get_database_info,
    ]

    # Get model ID from environment variable
    model_id = os.environ.get("DOCUMENT_ANALYSIS_AGENT_MODEL_ID")

    bedrock_model = BedrockModel(model_id=model_id, boto_session=session)

    # Create the Strands agent with tools and system prompt
    strands_agent = strands.Agent(
        tools=tools, system_prompt=system_prompt, model=bedrock_model
    )

    logger.info("Analytics agent created successfully")
    return strands_agent
