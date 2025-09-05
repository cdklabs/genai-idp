# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
Configuration management for analytics agents.
"""

import logging
from typing import Any, Dict

from ..common.config import configure_logging, get_environment_config

logger = logging.getLogger(__name__)


def get_analytics_config() -> Dict[str, Any]:
    """
    Get analytics-specific configuration from environment variables.

    Returns:
        Dict containing analytics configuration values

    Raises:
        ValueError: If required environment variables are missing
    """
    # Define required environment variables for analytics
    required_keys = [
        "ATHENA_DATABASE",
        "ATHENA_OUTPUT_LOCATION",
    ]

    # Get base configuration
    config = get_environment_config(required_keys)

    # Add analytics-specific defaults
    config.setdefault(
        "max_polling_attempts", 30
    )  # 2 seconds per attempt, Athena queries can take a while
    config.setdefault("query_timeout_seconds", 300)  # 5 minutes

    # Configure logging based on the configuration
    configure_logging(
        log_level=config.get("log_level"),
        strands_log_level=config.get("strands_log_level"),
    )

    logger.info("Analytics configuration loaded successfully")
    return config


def load_db_description() -> str:
    """
    Load the database description from the assets directory.
    TODO: this is hard coded for now because the assets directory was hard to find in the lambda environment.

    Returns:
        String containing the database description
    """

    return """
# Athena Table Information

## Overview 

### Metering table

Metering Table (metering)
   * Captures detailed usage metrics for document processing operations
   * Useful for monitoring IDP application usage (document processing throughput, costs, token usage, etc)
   * Populated every time a document is processed (even if no evaluations are run)

The metering table is particularly valuable for:
- Cost analysis and allocation
- Usage pattern identification
- Resource optimization
- Performance benchmarking across different document types and sizes

### Dynamic Document Section Tables

The solution also creates dynamic tables for document sections. The document sections tables store the actual extracted data from document sections in a structured format suitable for analytics. These tables are automatically discovered by AWS Glue Crawler and are organized by section type (classification).

    * Tables are automatically created based on the section classification
    * Each section type gets its own table (e.g., document_sections_invoice, document_sections_receipt)
    * Common columns include: section_id, document_id, section_classification, section_confidence, timestamp
    * Additional columns are dynamically inferred from the JSON extraction results
    * Tables are partitioned by date (YYYY-MM-DD format)
    * When querying columns with a period in their name (e.g. inference_result.currentnetpay) the column name must be included in quotation marks to be compatible with Athena querying, for example `SELECT "inference_result.currentnetpay" FROM document_sections_payslip`.

Many columns in dynamic document section tables are dynamically inferred from the JSON extraction results and vary by section type. Common patterns include:
- Nested JSON objects are flattened using dot notation (e.g., `customer.name`, `customer.address.street`)
- Arrays are converted to JSON strings
- Primitive values (strings, numbers, booleans) are preserved as their native types

Each section type table is also partitioned by date (YYYY-MM-DD format) for efficient querying.

Since the columns and data types in the document section tables are dynamic, you may want to run a query to learn more about them before writing any other queries. Consider e.g. executing `SHOW TABLES` to see what dynamic tables exist, or `describe document_sections_payslip` to learn more about that table (if it exists).

### Evaluation tables

The evaluation tables store metrics and results from comparing extracted document data against baseline (ground truth) data. These tables provide insights into the accuracy and performance of the document processing system. These tables are usually empty unless the user has run separate evaluation jobs. These tables are useful if the user wants to know about the "accuracy" of their solution for example.

1. Document Evaluations Table (document_evaluations)
   * Only useful if users have run "evaluation" jobs, which are not run by default. Contains information like accuracy compared to ground truth datasets.
   * Contains document-level evaluation metrics
   * Columns include: document_id, input_key, evaluation_date, accuracy, precision, recall, f1_score, false_alarm_rate, false_discovery_rate, execution_time
   * Partitioned by date (YYYY-MM-DD format)

2. Section Evaluations Table (section_evaluations)
   * Only useful if users have run "evaluation" jobs, which are not run by default. Contains information like accuracy compared to ground truth datasets.
   * Contains section-level evaluation metrics
   * Columns include: document_id, section_id, section_type, accuracy, precision, recall, f1_score, false_alarm_rate, false_discovery_rate, evaluation_date
   * Partitioned by date (YYYY-MM-DD format)

3. Attribute Evaluations Table (attribute_evaluations)
   * Only useful if users have run "evaluation" jobs, which are not run by default. Contains information like accuracy compared to ground truth datasets.
   * Contains attribute-level evaluation metrics
   * Columns include: document_id, section_id, section_type, attribute_name, expected, actual, matched, score, reason, evaluation_method, confidence, confidence_threshold, evaluation_date
   * Partitioned by date (YYYY-MM-DD format)

## Additional notes

* The "timestamp" and "date" columns pertain to when the document was uploaded to the system for processing, NOT any dates on the document itself.

## Sample Athena Queries

Here are some example queries to get you started:

**List tables available, including dynamic ones**
```athena
SHOW TABLES
```

**List tables available starting with "document_sections" with wildcard notation**
```athena
SHOW TABLES LIKE 'document_sections*'
```

**List tables available starting with "document_sections" with an SQL LIKE pattern**
```athena
SHOW TABLES WHERE table_name LIKE 'document_sections%'  -- Uses SQL LIKE pattern
```

(note that `SHOW TABLES LIKE 'document_sections%'` does NOT WORK here because in Athena, the pattern is treated as a regular expression rather than the SQL LIKE pattern matching. In regular expressions, '%' doesn't serve as a wildcard - it denotes "zero or more occurrences of the preceding element.")


**View the dynamic columns of a table named "document_sections_payslip"**
```athena
DESCRIBE document_sections_payslip
```

**Token usage by model:**
```athena
SELECT 
  "service_api", 
  SUM(CASE WHEN "unit" = "inputTokens" THEN value ELSE 0 END) as total_input_tokens,
  SUM(CASE WHEN "unit" = "outputTokens" THEN value ELSE 0 END) as total_output_tokens,
  SUM(CASE WHEN "unit" = "totalTokens" THEN value ELSE 0 END) as total_tokens,
  COUNT(DISTINCT "document_id") as document_count
FROM 
  metering
GROUP BY 
  "service_api"
ORDER BY 
  total_tokens DESC;
```
(note all columns are included within double quotes)

**Total net pay added across all paystub type documents**
```athena
SELECT SUM(CAST(REPLACE(REPLACE("inference_result.currentnetpay", '$', ''), ',', '') AS DECIMAL(10,2))) as total_net_pay
FROM document_sections_payslip;
```
(note the double quotation marks around the column name)

**All payslip information for an employee named David Calico***
```athena
SELECT * FROM document_sections_payslip WHERE LOWER("inference_result.employeename.firstname") = 'david' AND LOWER("inference_result.employeename.lastname") = 'calico'
```
(note the use of LOWER because case of strings in the database is unknown, and note the double quotation marks around the column name)

**Overall accuracy by document type:**
```athena
SELECT 
  "section_type", 
  AVG("accuracy") as avg_accuracy, 
  COUNT(*) as document_count
FROM 
  section_evaluations
GROUP BY 
  "section_type"
ORDER BY 
  "avg_accuracy" DESC;
```
"""


def load_python_plot_generation_examples() -> str:
    """
    Load sample python plot generation examples.
    TODO: this is hard coded for now because the assets directory was hard to find in the lambda environment.


    Returns:
        String containing sample python code generation examples
    """

    return """
## Python Libraries and Code Examples

When generating Python code for visualization, you can use the following libraries:
- `json`: For JSON serialization
- `pandas`: For data manipulation
- Standard Python libraries (math, datetime, etc.)

### Example Python Code for Table Generation

```python
import json
import pandas as pd

# Read query results from local "query_results.csv" file into a dataframe
df = pd.read_csv("query_results.csv")

# Create table data
table_data = {
    "responseType": "table",
    "headers": [
        {"id": col, "label": col.replace('_', ' ').title(), "sortable": True}
        for col in df.columns
    ],
    "rows": [
        {
            "id": row.get('document_id', f"row-{i}"),
            "data": row
        }
        for i, row in enumerate(df.to_dict('records'))
    ]
}

# Output as JSON
print(json.dumps(table_data))
```

### Example Python Code for Plot Generation

```python
import json
import pandas as pd
import random

# Read query results from local "query_results.csv" file into a dataframe
df = pd.read_csv("query_results.csv")

# Generate colors
def generate_colors(n):
    colors = []
    for i in range(n):
        r = random.randint(0, 255)
        g = random.randint(0, 255)
        b = random.randint(0, 255)
        colors.append(f"rgba({r}, {g}, {b}, 0.2)")
    return colors

bg_colors = generate_colors(len(df))
border_colors = [color.replace("0.2", "1") for color in bg_colors]

# Create plot data
plot_data = {
    "responseType": "plotData",
    "data": {
        "datasets": [
            {
                "backgroundColor": bg_colors,
                "borderColor": border_colors,
                "data": df['count'].tolist(),
                "borderWidth": 1,
                "label": "Document Count"
            }
        ],
        "labels": df['document_type'].tolist()
    },
    "options": {
        "scales": {
            "y": {
                "beginAtZero": True
            }
        },
        "responsive": True,
        "title": {
            "display": True,
            "text": "Document Distribution by Type"
        },
        "maintainAspectRatio": False
    },
    "type": "bar"
}

# Output as JSON
print(json.dumps(plot_data))
```
"""
