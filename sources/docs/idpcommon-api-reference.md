---
title: "idp_common API Reference"
---

# idp_common API Reference

The `idp_common` library (`lib/idp_common_pkg/`) is the core shared Python package that powers all document processing in the IDP Accelerator. It provides modular services for each step of the pipeline, a central `Document` data model, and utility functions for S3, Bedrock, DynamoDB, and more.

## Installation

```bash
# Minimal installation
pip install "idp_common[core]"

# Install specific modules
pip install "idp_common[ocr]"
pip install "idp_common[classification]"
pip install "idp_common[extraction]"
pip install "idp_common[evaluation]"

# Install everything
pip install "idp_common[all]"
```

## Quick Start

```python
from idp_common import get_config, Document, Page, Section, Status

# Load configuration from DynamoDB
config = get_config()

# Create a document
document = Document(
    id="doc-123",
    input_bucket="my-bucket",
    input_key="documents/sample.pdf",
    output_bucket="output-bucket"
)
```

## Core Data Model

### Document

The `Document` dataclass is the central data structure passed through the entire processing pipeline. Each processing step enriches it with additional data.

**Key fields:**

| Field | Type | Description |
|-------|------|-------------|
| `id` | `str` | Document identifier (typically the S3 key) |
| `input_bucket` / `input_key` | `str` | Source document location in S3 |
| `output_bucket` | `str` | S3 bucket for processing outputs |
| `status` | `Status` | Current processing stage (see Status enum below) |
| `num_pages` | `int` | Number of pages in the document |
| `pages` | `Dict[str, Page]` | Page data keyed by page ID |
| `sections` | `List[Section]` | Logical document sections (grouped by classification) |
| `summary_report_uri` | `str` | S3 URI to the summarization output |
| `config_version` | `str` | Configuration version used for processing |
| `metering` | `Dict` | Token usage and cost tracking data |
| `evaluation_results_uri` | `str` | S3 URI to evaluation results |
| `rule_validation_result` | `RuleValidationResult` | Rule validation output |
| `hitl_status` | `str` | Human-in-the-loop review status |
| `confidence_alert_count` | `int` | Number of low-confidence fields |
| `errors` | `List[str]` | Processing error messages |

**Key methods:**

| Method | Description |
|--------|-------------|
| `Document.from_dict(data)` | Create from a dictionary |
| `Document.from_json(json_str)` | Create from a JSON string |
| `Document.from_s3(bucket, key)` | Create from baseline files in S3 |
| `Document.from_s3_event(event, bucket)` | Create from an S3 EventBridge event |
| `Document.load_document(event_data, bucket)` | Handle compressed or uncompressed Lambda input |
| `document.serialize_document(bucket, step)` | Prepare output with automatic compression |
| `document.to_dict()` / `document.to_json()` | Serialize to dict or JSON |

### Page

Represents a single page in a document.

| Field | Type | Description |
|-------|------|-------------|
| `page_id` | `str` | Page identifier |
| `image_uri` | `str` | S3 URI to page image (JPG) |
| `raw_text_uri` | `str` | S3 URI to raw Textract JSON response |
| `parsed_text_uri` | `str` | S3 URI to parsed text (markdown) |
| `text_confidence_uri` | `str` | S3 URI to confidence data for assessment |
| `classification` | `str` | Classified document type for this page |
| `confidence` | `float` | Classification confidence score |

### Section

Represents a logical group of pages with the same document class.

| Field | Type | Description |
|-------|------|-------------|
| `section_id` | `str` | Section identifier |
| `classification` | `str` | Document type for this section |
| `page_ids` | `List[str]` | List of page IDs in this section |
| `extraction_result_uri` | `str` | S3 URI to extraction results |
| `attributes` | `Dict` | Extracted attribute values |
| `confidence_threshold_alerts` | `List[Dict]` | Low-confidence field alerts |

### Status Enum

```
QUEUED → RUNNING → OCR → CLASSIFYING → EXTRACTING → ASSESSING →
HITL_IN_PROGRESS → SUMMARIZING → RULE_VALIDATION →
RULE_VALIDATION_ORCHESTRATOR → EVALUATING → COMPLETED
```

Also: `POSTPROCESSING`, `FAILED`, `ABORTED`

## Processing Modules

### OCR (`idp_common.ocr`)

Converts PDF documents to machine-readable text using Amazon Textract.

```python
from idp_common.ocr.service import OcrService

service = OcrService(region="us-east-1", config=config)
document = service.process_document(document)
```

**Features:** Layout analysis, table extraction, signature detection, configurable DPI.

### Classification (`idp_common.classification`)

Identifies document types and creates logical section boundaries.

```python
from idp_common.classification import ClassificationService

service = ClassificationService(region="us-east-1", config=config)
document = service.classify_document(document)
```

**Features:** Multimodal page-level classification, text-based holistic classification, BIO-like sequence segmentation, regex-based classification, DynamoDB caching, few-shot examples, section splitting strategies (`disabled`, `page`, `llm_determined`).

### Extraction (`idp_common.extraction`)

Extracts structured data fields from document sections using LLMs.

```python
from idp_common.extraction.service import ExtractionService

service = ExtractionService(region="us-east-1", config=config)
document = service.process_document_section(document, section_id="1")
```

**Features:** Simple/group/list attribute types, multimodal extraction (text + images), few-shot examples, class-specific filtering, JSON Schema validation.

### Assessment (`idp_common.assessment`)

Evaluates confidence of extraction results with optional bounding box localization.

```python
from idp_common.assessment.service import AssessmentService

service = AssessmentService(region="us-east-1", config=config)
document = service.process_document_section(document, section_id="1")
```

**Features:** Per-attribute confidence scores (0.0-1.0), confidence reasoning, optional bounding box coordinates, configurable confidence thresholds.

### Summarization (`idp_common.summarization`)

Creates human-readable document summaries with citations.

```python
from idp_common.summarization.service import SummarizationService

service = SummarizationService(region="us-east-1", config=config)
document = service.process_document(document)
```

**Features:** Markdown formatting, page citations, structured references section.

### Evaluation (`idp_common.evaluation`)

Compares processing results against ground truth for accuracy assessment.

```python
from idp_common.evaluation.service import EvaluationService

service = EvaluationService(region="us-east-1", config=config)
document = service.evaluate_document(actual_document, expected_document)
```

**Features:** Multiple comparison methods (EXACT, FUZZY, SEMANTIC, NUMERIC_EXACT, LLM), per-attribute and per-document metrics, visual evaluation reports.

### Rule Validation (`idp_common.rule_validation`)

Validates extracted data against business rules using a two-step LLM approach.

```python
from idp_common.rule_validation import RuleValidationService, RuleValidationOrchestratorService

# Step 1: Fact extraction per section
service = RuleValidationService(region="us-east-1", config=config)
document = service.validate_document(document)

# Step 2: Orchestrated consolidation
orchestrator = RuleValidationOrchestratorService(config=config)
document = orchestrator.consolidate_and_save(document, config=config, multiple_sections=True)
```

**Features:** Concurrent rule processing, page-aware chunking, customizable recommendation options, JSON and Markdown output.

## Infrastructure Modules

### BDA (`idp_common.bda`)

Integration with Amazon Bedrock Data Automation for end-to-end document processing.

**Key classes:** `BdaInvocationService` (invoke BDA projects), `BdaBlueprintService` (manage BDA blueprints and schema conversion).

### Discovery (`idp_common.discovery`)

Automatic document class and schema discovery using LLMs.

```python
from idp_common.discovery.classes_discovery import ClassesDiscovery

discovery = ClassesDiscovery(input_bucket="bucket", input_prefix="doc.pdf", region="us-east-1")
result = discovery.discovery_classes_with_document(
    input_bucket="bucket", input_prefix="doc.pdf", save_to_config=False
)
```

**Features:** JSON Schema generation, auto-detect section boundaries, page range selection, ground truth comparison.

### Schema (`idp_common.schema`)

Dynamic Pydantic v2 model generation from JSON Schema definitions.

```python
from idp_common.schema import create_pydantic_model_from_json_schema

Model = create_pydantic_model_from_json_schema(schema=schema_dict, class_label="Invoice")
validated = Model(**extracted_data)
```

### Configuration (`idp_common.config`)

Configuration management with system defaults and user overrides.

```python
from idp_common import get_config, IDPConfig

config = get_config()  # Load from DynamoDB or system defaults
```

**Key functions:** `get_config()`, `load_system_defaults(pattern)`, `merge_config_with_defaults()`, `create_config_template()`.

### Agents (`idp_common.agents`)

Conversational AI agent framework with specialized agents for analytics, error analysis, and code intelligence.

**Key components:** Agent factory/registry, Analytics agent, Error Analyzer agent, Code Intelligence agent, External MCP agent, Conversational orchestrator.

## Utility Modules

### Bedrock (`idp_common.bedrock`)

Utilities for invoking Amazon Bedrock LLMs with retry logic, prompt caching, and token tracking.

### AppSync (`idp_common.appsync`)

Document state persistence through the AppSync GraphQL API.

### DynamoDB (`idp_common.dynamodb`)

Document tracking, HITL state management, and configuration storage.

### Reporting (`idp_common.reporting`)

Analytics data storage for AWS Glue/Athena reporting pipelines.

### S3 (`idp_common.s3`)

S3 read/write utilities: `get_text_content()`, `get_json_content()`, `write_content()`, `find_matching_files()`.

### Image (`idp_common.image`)

Image resizing, format conversion, and Bedrock attachment preparation: `resize_image()`, `prepare_image()`, `prepare_bedrock_image_attachment()`.

### Utils (`idp_common.utils`)

Common helpers: `build_s3_uri()`, `parse_s3_uri()`, `merge_metering_data()`, `extract_structured_data_from_text()`.

### Metrics (`idp_common.metrics`)

CloudWatch metrics publishing: `publish_metric()`, `record_duration()`.

## Detailed Module Documentation

Each module has its own detailed README with comprehensive usage examples:

| Module | Location |
|--------|----------|
| Core Models | [`lib/idp_common_pkg/idp_common/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/README.md) |
| Classification | [`lib/idp_common_pkg/idp_common/classification/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/classification/README.md) |
| Extraction | [`lib/idp_common_pkg/idp_common/extraction/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/extraction/README.md) |
| Assessment | [`lib/idp_common_pkg/idp_common/assessment/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/assessment/README.md) |
| Rule Validation | [`lib/idp_common_pkg/idp_common/rule_validation/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/rule_validation/README.md) |
| Discovery | [`lib/idp_common_pkg/idp_common/discovery/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/discovery/README.md) |
| Agents | [`lib/idp_common_pkg/idp_common/agents/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/agents/README.md) |
| BDA | [`lib/idp_common_pkg/idp_common/bda/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/bda/README.md) |
| OCR | [`lib/idp_common_pkg/idp_common/ocr/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/ocr/README.md) |
| Schema | [`lib/idp_common_pkg/idp_common/schema/README.md`](https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws/blob/main/lib/idp_common_pkg/idp_common/schema/README.md) |
