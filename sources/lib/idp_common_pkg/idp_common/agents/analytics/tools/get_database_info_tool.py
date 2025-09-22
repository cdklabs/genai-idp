# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Tool for retrieving database schema information for the analytics agent.
"""

import logging

from strands import tool

from ..config import load_db_description

logger = logging.getLogger(__name__)


@tool
def get_database_info() -> str:
    """
    Retrieves information about the database schema, tables, and columns.

    This tool returns a detailed description of the database structure,
    including table names, column definitions, and example queries.

    Returns:
        str: A markdown-formatted description of the database schema
    """
    logger.info("Retrieving database schema information")
    db_description = load_db_description()
    logger.debug(f"Retrieved database description of length: {len(db_description)}")
    return db_description
