# Reporting Database

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0

The GenAI IDP Accelerator includes a comprehensive reporting database that captures detailed metrics about document processing. This database is implemented as AWS Glue tables over Amazon S3 data in Parquet format, making it queryable through Amazon Athena for analytics and reporting purposes.

## Table of Contents

- [Evaluation Tables](#evaluation-tables)
  - [Document Evaluations](#document-evaluations)
  - [Section Evaluations](#section-evaluations)
  - [Attribute Evaluations](#attribute-evaluations)
- [Metering Table](#metering-table)
- [Document Sections Tables](#document-sections-tables)
  - [Dynamic Section Tables](#dynamic-section-tables)
  - [Crawler Configuration](#crawler-configuration)
- [Using the Reporting Database with Athena](#using-the-reporting-database-with-athena)
  - [Sample Queries](#sample-queries)
  - [Creating Dashboards](#creating-dashboards)

## Evaluation Tables

The evaluation tables store metrics and results from comparing extracted document data against baseline (ground truth) data. These tables provide insights into the accuracy and performance of the document processing system.

### Document Evaluations

The `document_evaluations` table contains document-level evaluation metrics:

| Column | Type | Description |
|--------|------|-------------|
| document_id | string | Unique identifier for the document |
| input_key | string | S3 key of the input document |
| evaluation_date | timestamp | When the evaluation was performed |
| accuracy | double | Overall accuracy score (0-1) |
| precision | double | Precision score (0-1) |
| recall | double | Recall score (0-1) |
| f1_score | double | F1 score (0-1) |
| false_alarm_rate | double | False alarm rate (0-1) |
| false_discovery_rate | double | False discovery rate (0-1) |
| execution_time | double | Time taken to evaluate (seconds) |

This table is partitioned by date (YYYY-MM-DD format).

### Section Evaluations

The `section_evaluations` table contains section-level evaluation metrics:

| Column | Type | Description |
|--------|------|-------------|
| document_id | string | Unique identifier for the document |
| section_id | string | Identifier for the section |
| section_type | string | Type/class of the section |
| accuracy | double | Section accuracy score (0-1) |
| precision | double | Section precision score (0-1) |
| recall | double | Section recall score (0-1) |
| f1_score | double | Section F1 score (0-1) |
| false_alarm_rate | double | Section false alarm rate (0-1) |
| false_discovery_rate | double | Section false discovery rate (0-1) |
| evaluation_date | timestamp | When the evaluation was performed |

This table is partitioned by date (YYYY-MM-DD format).

### Attribute Evaluations

The `attribute_evaluations` table contains attribute-level evaluation metrics:

| Column | Type | Description |
|--------|------|-------------|
| document_id | string | Unique identifier for the document |
| section_id | string | Identifier for the section |
| section_type | string | Type/class of the section |
| attribute_name | string | Name of the attribute |
| expected | string | Expected (ground truth) value |
| actual | string | Actual extracted value |
| matched | boolean | Whether the values matched |
| score | double | Match score (0-1) |
| reason | string | Explanation for the match result |
| evaluation_method | string | Method used for comparison |
| confidence | string | Confidence score from extraction |
| confidence_threshold | string | Confidence threshold used |
| evaluation_date | timestamp | When the evaluation was performed |

This table is partitioned by date (YYYY-MM-DD format).

## Metering Table

The `metering` table captures detailed usage metrics and cost information for each document processing operation:

| Column | Type | Description |
|--------|------|-------------|
| document_id | string | Unique identifier for the document |
| context | string | Processing context (OCR, Classification, Extraction, etc.) |
| service_api | string | Specific API or model used (e.g., textract/analyze_document, bedrock/claude-3) |
| unit | string | Unit of measurement (pages, inputTokens, outputTokens, etc.) |
| value | double | Quantity of the unit consumed |
| number_of_pages | int | Number of pages in the document |
| unit_cost | double | Cost per unit in USD (e.g., cost per token, cost per page) |
| estimated_cost | double | Calculated total cost in USD (value × unit_cost) |
| timestamp | timestamp | When the operation was performed |

This table is partitioned by date (YYYY-MM-DD format).

### Cost Calculation and Pricing

The metering table now includes automated cost calculation capabilities:

- **unit_cost**: Retrieved from pricing configuration for each service_api/unit combination
- **estimated_cost**: Automatically calculated as value × unit_cost for each record
- **Dynamic Pricing**: Costs are loaded from configuration and cached for performance
- **Fallback Handling**: When pricing data is not available, unit_cost defaults to $0.0

#### Pricing Configuration Format

Pricing data is loaded from the system configuration in the following format:

```yaml
pricing:
  - name: "bedrock/us.anthropic.claude-3-sonnet-20240229-v1:0"
    units:
      - name: "inputTokens"
        price: "3.0e-6"    # $0.000003 per input token
      - name: "outputTokens"
        price: "1.5e-5"    # $0.000015 per output token
  - name: "textract/analyze_document"
    units:
      - name: "pages"
        price: "0.0015"    # $0.0015 per page
```

#### Cost Calculation Process

1. **Service/Unit Matching**: System attempts exact match for service_api/unit combination
2. **Partial Matching**: If exact match fails, uses fuzzy matching for common patterns
3. **Cost Calculation**: estimated_cost = value × unit_cost
4. **Caching**: Pricing data is cached to avoid repeated configuration lookups

The metering table is particularly valuable for:
- **Cost analysis and allocation** - Track spending by document type, service, or time period
- **Usage pattern identification** - Analyze consumption patterns across different models
- **Resource optimization** - Identify cost-effective processing approaches
- **Performance benchmarking** - Compare cost efficiency across different document types and sizes
- **Budget monitoring** - Track actual costs against budgets and forecasts

## Document Sections Tables

The document sections tables store the actual extracted data from document sections in a structured format suitable for analytics. These tables are automatically created when new section types are encountered during document processing, eliminating the need for manual table creation.

### Automatic Table Creation

When a document is processed and a new section type (classification) is detected, the system automatically:
1. Creates a new Glue table for that section type (e.g., `document_sections_invoice`, `document_sections_receipt`, `document_sections_w2`)
2. Configures the table with appropriate schema based on the extracted data
3. Sets up partition projection for efficient date-based queries
4. Updates the table schema if new fields are detected in subsequent documents

**Important:** Section type names are normalized to lowercase for consistency with case-sensitive S3 paths. For example, a section classified as "W2" will create a table named `document_sections_w2` with data stored in `document_sections/w2/`.

### Dynamic Section Tables

Document sections are stored in dynamically created tables based on the section classification. Each section type gets its own table with the following characteristics:

**Common Metadata Columns:**
| Column | Type | Description |
|--------|------|-------------|
| section_id | string | Unique identifier for the section |
| document_id | string | Unique identifier for the document |
| section_classification | string | Type/class of the section |
| section_confidence | double | Confidence score for the section classification |
| timestamp | timestamp | When the document was processed |

**Dynamic Data Columns:**
The remaining columns are dynamically inferred from the JSON extraction results and vary by section type. Common patterns include:
- Nested JSON objects are flattened using dot notation (e.g., `customer.name`, `customer.address.street`)
- Arrays are converted to JSON strings
- Primitive values (strings, numbers, booleans) are preserved as their native types

**Partitioning:**
Each section type table is partitioned by date (YYYY-MM-DD format) for efficient querying.

**File Organization:**
```
document_sections/
├── invoice/
│   └── date=2024-01-15/
│       ├── doc-123_section_1.parquet
│       └── doc-456_section_3.parquet
├── receipt/
│   └── date=2024-01-15/
│       └── doc-789_section_2.parquet
└── bank_statement/
    └── date=2024-01-15/
        └── doc-abc_section_1.parquet
```

### Crawler Configuration

The AWS Glue Crawler automatically discovers new section types and creates corresponding tables. The crawler can be configured to run:
- Manually (on-demand)
- Every 15 minutes
- Every hour 
- Daily (default)

This ensures that new section types are automatically available for querying without manual intervention.

## Using the Reporting Database with Athena

Amazon Athena provides a serverless query service to analyze data directly in Amazon S3. The reporting database tables are automatically registered in the AWS Glue Data Catalog, making them immediately available for querying in Athena.

To use the reporting database with Athena:

1. Open the [Amazon Athena console](https://console.aws.amazon.com/athena/)
2. Select the database named after your stack (e.g., `idp_reporting`)
3. Start querying the tables using standard SQL

### Sample Queries

Here are some example queries to get you started:

**Overall accuracy by document type:**
```sql
SELECT 
  section_type, 
  AVG(accuracy) as avg_accuracy, 
  COUNT(*) as document_count
FROM 
  section_evaluations
GROUP BY 
  section_type
ORDER BY 
  avg_accuracy DESC;
```

**Token usage by model:**
```sql
SELECT 
  service_api, 
  SUM(CASE WHEN unit = 'inputTokens' THEN value ELSE 0 END) as total_input_tokens,
  SUM(CASE WHEN unit = 'outputTokens' THEN value ELSE 0 END) as total_output_tokens,
  SUM(CASE WHEN unit = 'totalTokens' THEN value ELSE 0 END) as total_tokens,
  COUNT(DISTINCT document_id) as document_count
FROM 
  metering
WHERE 
  context = 'Extraction'
GROUP BY 
  service_api
ORDER BY 
  total_tokens DESC;
```

**Extraction confidence vs. accuracy:**
```sql
SELECT 
  CASE 
    WHEN CAST(confidence AS double) < 0.7 THEN 'Low (<0.7)'
    WHEN CAST(confidence AS double) < 0.9 THEN 'Medium (0.7-0.9)'
    ELSE 'High (>0.9)'
  END as confidence_band,
  AVG(CASE WHEN matched THEN 1.0 ELSE 0.0 END) as accuracy,
  COUNT(*) as attribute_count
FROM 
  attribute_evaluations
WHERE 
  confidence IS NOT NULL
GROUP BY 
  CASE 
    WHEN CAST(confidence AS double) < 0.7 THEN 'Low (<0.7)'
    WHEN CAST(confidence AS double) < 0.9 THEN 'Medium (0.7-0.9)'
    ELSE 'High (>0.9)'
  END
ORDER BY 
  confidence_band;
```

**Token usage per page by document type:**
```sql
SELECT 
  se.section_type,
  AVG(m.value / m.number_of_pages) as avg_tokens_per_page
FROM 
  metering m
JOIN 
  section_evaluations se ON m.document_id = se.document_id
WHERE 
  m.unit = 'totalTokens'
  AND m.number_of_pages > 0
GROUP BY 
  se.section_type
ORDER BY 
  avg_tokens_per_page DESC;
```

**Document sections analysis by type:**
```sql
-- Query invoice sections for customer analysis
SELECT 
  document_id,
  section_id,
  "customer.name" as customer_name,
  "customer.address.city" as customer_city,
  "total_amount" as invoice_total,
  date
FROM 
  invoice
WHERE 
  date BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY 
  date DESC;
```

**Section processing volume by date:**
```sql
-- Count sections processed by type and date
SELECT 
  date,
  section_classification,
  COUNT(*) as section_count,
  COUNT(DISTINCT document_id) as document_count
FROM (
  SELECT date, section_classification, document_id FROM invoice
  UNION ALL
  SELECT date, section_classification, document_id FROM receipt
  UNION ALL
  SELECT date, section_classification, document_id FROM bank_statement
)
GROUP BY 
  date, section_classification
ORDER BY 
  date DESC, section_count DESC;
```

**Date range queries with new partition structure:**
```sql
-- Efficient date range query using single date partition
SELECT 
  COUNT(*) as total_documents,
  AVG(accuracy) as avg_accuracy
FROM 
  document_evaluations
WHERE 
  date BETWEEN '2024-01-01' AND '2024-01-31';

-- Monthly aggregation
SELECT 
  SUBSTR(date, 1, 7) as month,
  COUNT(*) as document_count,
  AVG(accuracy) as avg_accuracy
FROM 
  document_evaluations
WHERE 
  date >= '2024-01-01'
GROUP BY 
  SUBSTR(date, 1, 7)
ORDER BY 
  month;
```

**Cost analysis queries:**
```sql
-- Total estimated costs by service API
SELECT 
  service_api,
  SUM(estimated_cost) as total_cost,
  AVG(estimated_cost) as avg_cost_per_operation,
  COUNT(*) as operation_count,
  COUNT(DISTINCT document_id) as document_count
FROM 
  metering
WHERE 
  date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 
  service_api
ORDER BY 
  total_cost DESC;

-- Cost per page analysis by document type
SELECT 
  se.section_type,
  SUM(m.estimated_cost) / SUM(m.number_of_pages) as cost_per_page,
  SUM(m.estimated_cost) as total_cost,
  SUM(m.number_of_pages) as total_pages,
  COUNT(DISTINCT m.document_id) as document_count
FROM 
  metering m
JOIN 
  section_evaluations se ON m.document_id = se.document_id
WHERE 
  m.number_of_pages > 0
  AND m.date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 
  se.section_type
ORDER BY 
  cost_per_page DESC;

-- Daily cost trends
SELECT 
  date,
  SUM(estimated_cost) as daily_cost,
  COUNT(DISTINCT document_id) as documents_processed,
  SUM(estimated_cost) / COUNT(DISTINCT document_id) as avg_cost_per_document
FROM 
  metering
WHERE 
  date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 
  date
ORDER BY 
  date;

-- Most expensive documents
SELECT 
  document_id,
  SUM(estimated_cost) as total_document_cost,
  SUM(value) as total_units_consumed,
  COUNT(*) as operations_count,
  MAX(number_of_pages) as page_count
FROM 
  metering
WHERE 
  date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 
  document_id
ORDER BY 
  total_document_cost DESC
LIMIT 10;

-- Cost efficiency by model (cost per token)
SELECT 
  service_api,
  SUM(estimated_cost) / SUM(value) as cost_per_token,
  SUM(estimated_cost) as total_cost,
  SUM(value) as total_tokens,
  COUNT(DISTINCT document_id) as document_count
FROM 
  metering
WHERE 
  unit IN ('inputTokens', 'outputTokens', 'totalTokens')
  AND date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 
  service_api
ORDER BY 
  cost_per_token ASC;

-- Cost breakdown by processing context
SELECT 
  context,
  SUM(estimated_cost) as total_cost,
  COUNT(DISTINCT document_id) as document_count,
  SUM(estimated_cost) / COUNT(DISTINCT document_id) as avg_cost_per_document
FROM 
  metering
WHERE 
  date BETWEEN '2024-01-01' AND '2024-01-31'
GROUP BY 
  context
ORDER BY 
  total_cost DESC;
```

### Creating Dashboards

For more advanced visualization and dashboarding:

1. Use [Amazon QuickSight](https://aws.amazon.com/quicksight/) to connect to your Athena queries
2. Create interactive dashboards to monitor:
   - Extraction accuracy over time
   - Cost trends by document type
   - Performance metrics by model
   - Resource utilization patterns

You can also export query results to CSV or other formats for use with external business intelligence tools.
