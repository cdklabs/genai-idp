# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""Discovery operations for IDP SDK."""

import json
import logging
import os
import re
from pathlib import Path
from typing import Any, Dict, List, Optional

from idp_sdk.exceptions import IDPConfigurationError, IDPResourceNotFoundError
from idp_sdk.models.discovery import (
    AutoDetectResult,
    AutoDetectSection,
    DiscoveryBatchResult,
    DiscoveryResult,
)

logger = logging.getLogger(__name__)


class DiscoveryOperation:
    """Document class discovery operations.

    Provides programmatic access to IDP Discovery, which analyzes documents
    using Amazon Bedrock to automatically generate JSON Schema definitions
    for document classes.

    Two operating modes:

    **Stack-connected mode** (with ``stack_name``):
        Uses the stack's discovery configuration (model, prompts) from DynamoDB
        and saves the discovered schema to the stack's configuration.

    **Local mode** (without ``stack_name``):
        Uses system default discovery settings, calls Bedrock directly with
        local file bytes, and returns the schema without saving anywhere.
        The schema is printed to stdout and/or written to a file via CLI.

    Example:
        Stack-connected:
        >>> client = IDPClient(stack_name="my-idp-stack")
        >>> result = client.discovery.run("./samples/w2/w2-sample.pdf")

        Local (no stack needed):
        >>> client = IDPClient()
        >>> result = client.discovery.run("./invoice.pdf")
        >>> print(json.dumps(result.json_schema, indent=2))
    """

    def __init__(self, client):
        self._client = client

    def run(
        self,
        document_path: str,
        ground_truth_path: Optional[str] = None,
        config_version: Optional[str] = None,
        stack_name: Optional[str] = None,
        page_range: Optional[str] = None,
        class_name_hint: Optional[str] = None,
        auto_detect: bool = False,
        **kwargs,
    ) -> "DiscoveryResult | DiscoveryBatchResult":
        """Run discovery on a single document to generate a document class schema.

        If a stack_name is available (via client or parameter), operates in
        stack-connected mode: uses the stack's discovery config and saves the
        schema to DynamoDB. If no stack_name, operates in local mode: uses
        system defaults and returns the schema without saving.

        Args:
            document_path: Local path to the document file (PDF, PNG, JPG, TIFF)
            ground_truth_path: Optional local path to a JSON ground truth file.
            config_version: Configuration version to save to (stack mode only).
            stack_name: Optional stack name override.
            page_range: Optional page range string (e.g., "1-3") to extract
                specific pages from a PDF before discovery.
            class_name_hint: Optional hint for the document class name. When
                provided, the LLM will use this as the $id value.
            auto_detect: If True, auto-detect section boundaries first, then
                discover each section. Returns DiscoveryBatchResult.
            **kwargs: Additional parameters.

        Returns:
            DiscoveryResult for single document discovery, or
            DiscoveryBatchResult when auto_detect=True.

        Raises:
            FileNotFoundError: If the document or ground truth file doesn't exist.
        """
        doc_path = Path(document_path)
        if not doc_path.exists():
            raise FileNotFoundError(f"Document not found: {document_path}")

        # If auto_detect is True, detect sections first then discover each
        if auto_detect:
            return self._run_auto_detect_and_discover(
                doc_path, config_version, stack_name
            )

        gt_data = None
        if ground_truth_path:
            gt_path = Path(ground_truth_path)
            if not gt_path.exists():
                raise FileNotFoundError(
                    f"Ground truth file not found: {ground_truth_path}"
                )
            gt_data = json.loads(gt_path.read_text(encoding="utf-8"))

        # Read file bytes locally — never upload to S3
        file_bytes = doc_path.read_bytes()

        # Determine mode: stack-connected or local
        resolved_stack = stack_name or self._client._stack_name
        if resolved_stack:
            return self._run_with_stack(
                resolved_stack,
                doc_path,
                file_bytes,
                gt_data,
                config_version,
                page_range=page_range,
                class_name_hint=class_name_hint,
            )
        else:
            return self._run_local(
                doc_path,
                file_bytes,
                gt_data,
                page_range=page_range,
                class_name_hint=class_name_hint,
            )

    def auto_detect_sections(
        self,
        document_path: str,
        stack_name: Optional[str] = None,
    ) -> AutoDetectResult:
        """Detect document section boundaries using LLM analysis.

        Sends the full PDF to Amazon Bedrock and asks it to identify where
        different document types begin and end within a multi-page package.

        Requires a stack connection (uses the stack's auto_split discovery config).

        Args:
            document_path: Local path to a PDF document.
            stack_name: Optional stack name override.

        Returns:
            AutoDetectResult with detected section boundaries.

        Raises:
            FileNotFoundError: If the document doesn't exist.
        """
        doc_path = Path(document_path)
        if not doc_path.exists():
            raise FileNotFoundError(f"Document not found: {document_path}")

        file_bytes = doc_path.read_bytes()
        resolved_stack = stack_name or self._client._stack_name

        if resolved_stack:
            return self._auto_detect_with_stack(resolved_stack, doc_path, file_bytes)
        else:
            return self._auto_detect_local(doc_path, file_bytes)

    def run_multi_section(
        self,
        document_path: str,
        page_ranges: List[Dict[str, Any]],
        config_version: Optional[str] = None,
        stack_name: Optional[str] = None,
    ) -> DiscoveryBatchResult:
        """Discover multiple document classes from page ranges in a single PDF.

        Each page range produces an independent discovery job. Page extraction
        uses pypdfium2 to create sub-PDFs before sending to Bedrock.

        Args:
            document_path: Local path to a multi-page PDF.
            page_ranges: List of dicts with keys: 'start' (int), 'end' (int),
                and optional 'label' (str) for class name hint.
                Example: [{"start": 1, "end": 2, "label": "W2 Form"},
                          {"start": 3, "end": 5, "label": "Invoice"}]
            config_version: Configuration version to save to (stack mode only).
            stack_name: Optional stack name override.

        Returns:
            DiscoveryBatchResult with one result per page range.
        """
        doc_path = Path(document_path)
        if not doc_path.exists():
            raise FileNotFoundError(f"Document not found: {document_path}")

        results: List[DiscoveryResult] = []
        for pr in page_ranges:
            start = pr.get("start", 1)
            end = pr.get("end", start)
            label = pr.get("label")
            range_str = f"{start}-{end}"

            result = self.run(
                document_path=document_path,
                config_version=config_version,
                stack_name=stack_name,
                page_range=range_str,
                class_name_hint=label,
            )
            # Annotate result with page range info
            result.page_range = range_str
            results.append(result)

        succeeded = sum(1 for r in results if r.status == "SUCCESS")
        failed = sum(1 for r in results if r.status != "SUCCESS")

        return DiscoveryBatchResult(
            total=len(results),
            succeeded=succeeded,
            failed=failed,
            results=results,
        )

    def _run_auto_detect_and_discover(
        self,
        doc_path: Path,
        config_version: Optional[str],
        stack_name: Optional[str],
    ) -> DiscoveryBatchResult:
        """Auto-detect sections then discover each one."""
        detect_result = self.auto_detect_sections(
            document_path=str(doc_path), stack_name=stack_name
        )

        if detect_result.status != "SUCCESS" or not detect_result.sections:
            return DiscoveryBatchResult(total=0, succeeded=0, failed=0, results=[])

        page_ranges = [
            {
                "start": s.start,
                "end": s.end,
                "label": s.type,
            }
            for s in detect_result.sections
        ]

        return self.run_multi_section(
            document_path=str(doc_path),
            page_ranges=page_ranges,
            config_version=config_version,
            stack_name=stack_name,
        )

    def _auto_detect_with_stack(
        self,
        stack_name: str,
        doc_path: Path,
        file_bytes: bytes,
    ) -> AutoDetectResult:
        """Auto-detect sections using stack config."""
        try:
            config_table = self._get_config_table(stack_name)
            os.environ["CONFIGURATION_TABLE_NAME"] = config_table

            from idp_common.discovery.classes_discovery import ClassesDiscovery

            discovery = ClassesDiscovery(
                input_bucket="local",
                input_prefix=doc_path.name,
                region=self._client._region,
            )

            sections = discovery.auto_detect_sections(
                input_bucket="local",
                input_prefix=doc_path.name,
                file_bytes=file_bytes,
            )

            return AutoDetectResult(
                status="SUCCESS",
                sections=[
                    AutoDetectSection(
                        start=s.get("start", 1),
                        end=s.get("end", 1),
                        type=s.get("type"),
                    )
                    for s in sections
                ],
                document_path=str(doc_path),
            )

        except Exception as e:
            logger.error(f"Auto-detect failed for {doc_path}: {e}")
            return AutoDetectResult(
                status="FAILED",
                document_path=str(doc_path),
                error=str(e),
            )

    def _auto_detect_local(
        self,
        doc_path: Path,
        file_bytes: bytes,
    ) -> AutoDetectResult:
        """Auto-detect sections using system defaults (no stack needed)."""
        try:
            from idp_common import bedrock
            from idp_common.config.merge_utils import load_system_defaults

            defaults = load_system_defaults("pattern-2")
            discovery_cfg = defaults.get("discovery", {})
            auto_cfg = discovery_cfg.get("auto_split", {})

            model_id = auto_cfg.get("model_id", "us.amazon.nova-pro-v1:0")
            system_prompt = auto_cfg.get(
                "system_prompt",
                "You are an expert document analyst. Your task is to identify "
                "distinct document sections within a multi-page document package.",
            )
            user_prompt = auto_cfg.get(
                "user_prompt",
                "Analyze this multi-page document package. Identify the page boundaries "
                "where different document types or sections begin and end.\n\n"
                "For each distinct document section, provide:\n"
                '- "start": the first page number (1-based)\n'
                '- "end": the last page number (1-based)\n'
                '- "type": a short label for the document type\n\n'
                "Return ONLY a JSON array:\n"
                '[{"start": 1, "end": 2, "type": "Letter"}, {"start": 3, "end": 3, "type": "Invoice"}]',
            )
            top_p = auto_cfg.get("top_p", 0.1)
            max_tokens = auto_cfg.get("max_tokens", 4096)

            content = [
                {
                    "document": {
                        "format": "pdf",
                        "name": "document_messages",
                        "source": {"bytes": file_bytes},
                    }
                },
                {"text": user_prompt},
            ]

            region = self._client._region or os.environ.get("AWS_REGION", "us-west-2")
            bedrock_client = bedrock.BedrockClient(region=region)

            response = bedrock_client.invoke_model(
                model_id=model_id,
                system_prompt=system_prompt,
                content=content,
                temperature=0.0,
                top_p=top_p,
                max_tokens=max_tokens,
                context="AutoDetectSectionsLocal",
            )

            content_text = bedrock.extract_text_from_response(response)
            sections_raw = json.loads(_extract_json(content_text))

            if not isinstance(sections_raw, list):
                raise ValueError(
                    f"Expected JSON array, got {type(sections_raw).__name__}"
                )

            return AutoDetectResult(
                status="SUCCESS",
                sections=[
                    AutoDetectSection(
                        start=s.get("start", 1),
                        end=s.get("end", 1),
                        type=s.get("type"),
                    )
                    for s in sections_raw
                ],
                document_path=str(doc_path),
            )

        except Exception as e:
            logger.error(f"Local auto-detect failed for {doc_path}: {e}")
            return AutoDetectResult(
                status="FAILED",
                document_path=str(doc_path),
                error=str(e),
            )

    def _run_with_stack(
        self,
        stack_name: str,
        doc_path: Path,
        file_bytes: bytes,
        gt_data: Optional[dict],
        config_version: Optional[str],
        page_range: Optional[str] = None,
        class_name_hint: Optional[str] = None,
    ) -> DiscoveryResult:
        """Stack-connected mode: uses stack config, saves schema to DynamoDB."""
        try:
            # Get config table from stack resources
            config_table = self._get_config_table(stack_name)
            os.environ["CONFIGURATION_TABLE_NAME"] = config_table

            from idp_common.discovery.classes_discovery import ClassesDiscovery

            # Try loading the requested config version; fall back to active
            # config if the version doesn't exist yet (user wants to create it).
            try:
                discovery = ClassesDiscovery(
                    input_bucket="local",
                    input_prefix=doc_path.name,
                    region=self._client._region,
                    version=config_version,
                )
            except Exception:
                if config_version is None:
                    raise
                logger.warning(
                    f"Config version '{config_version}' not found, "
                    f"reading from active config and saving to '{config_version}'"
                )
                discovery = ClassesDiscovery(
                    input_bucket="local",
                    input_prefix=doc_path.name,
                    region=self._client._region,
                    version=None,
                )
                discovery.version = config_version

            # Only save to config if a version was explicitly specified
            save = config_version is not None

            if gt_data:
                result = discovery.discovery_classes_with_document_and_ground_truth(
                    input_bucket="local",
                    input_prefix=doc_path.name,
                    file_bytes=file_bytes,
                    ground_truth_data=gt_data,
                    save_to_config=save,
                    page_range=page_range,
                )
            else:
                result = discovery.discovery_classes_with_document(
                    input_bucket="local",
                    input_prefix=doc_path.name,
                    file_bytes=file_bytes,
                    save_to_config=save,
                    page_range=page_range,
                    class_name_hint=class_name_hint,
                )

            schema = result.get("schema")
            doc_class = None
            if schema:
                doc_class = schema.get("$id") or schema.get("x-aws-idp-document-type")

            return DiscoveryResult(
                status="SUCCESS",
                document_class=doc_class,
                json_schema=schema,
                config_version=config_version,
                document_path=str(doc_path),
                page_range=page_range,
            )

        except Exception as e:
            logger.error(f"Discovery failed for {doc_path}: {e}")
            return DiscoveryResult(
                status="FAILED",
                document_path=str(doc_path),
                error=str(e),
            )

    def _run_local(
        self,
        doc_path: Path,
        file_bytes: bytes,
        gt_data: Optional[dict],
        max_retries: int = 3,
        page_range: Optional[str] = None,
        class_name_hint: Optional[str] = None,
    ) -> DiscoveryResult:
        """Local mode: uses system defaults, no stack needed, no config save."""
        try:
            from idp_common import bedrock, image
            from idp_common.config.merge_utils import load_system_defaults

            # If a page range is specified and the file is a PDF, extract only those pages
            file_extension = doc_path.suffix.lower().lstrip(".")
            if page_range and file_extension == "pdf":
                from idp_common.discovery.classes_discovery import ClassesDiscovery

                start_page, end_page = ClassesDiscovery.parse_page_range(page_range)
                file_bytes = ClassesDiscovery.extract_pdf_pages(
                    file_bytes, start_page, end_page
                )

            # Load system defaults to get discovery prompts and model settings
            defaults = load_system_defaults("pattern-2")
            discovery_cfg = defaults.get("discovery", {})
            mode_cfg = (
                discovery_cfg.get("with_ground_truth", {})
                if gt_data
                else discovery_cfg.get("without_ground_truth", {})
            )

            model_id = mode_cfg.get("model_id", "us.amazon.nova-pro-v1:0")
            system_prompt = mode_cfg.get(
                "system_prompt",
                "You are an expert in processing forms. Extracting data from images and documents",
            )
            temperature = mode_cfg.get("temperature", 0.0)
            top_p = mode_cfg.get("top_p", 0.0)
            max_tokens = mode_cfg.get("max_tokens", 10000)

            # Build prompt
            sample_format = _sample_output_format()
            if gt_data:
                user_prompt = mode_cfg.get("user_prompt") or _prompt_with_gt(gt_data)
                if "{ground_truth_json}" in user_prompt:
                    user_prompt = user_prompt.replace(
                        "{ground_truth_json}", json.dumps(gt_data, indent=2)
                    )
            else:
                user_prompt = mode_cfg.get("user_prompt") or _prompt_without_gt()

            # Add class name hint to prompt if provided
            if class_name_hint:
                user_prompt += (
                    f'\nIMPORTANT: Use "{class_name_hint}" as the document class name. '
                    f'Set "$id" and "x-aws-idp-document-type" to "{class_name_hint}".'
                )

            # Create content with file bytes
            if file_extension == "pdf":
                content = [
                    {
                        "document": {
                            "format": "pdf",
                            "name": "document_messages",
                            "source": {"bytes": file_bytes},
                        }
                    },
                ]
            else:
                content = [image.prepare_bedrock_image_attachment(file_bytes)]

            # Call Bedrock with retry/validation loop
            region = self._client._region or os.environ.get("AWS_REGION", "us-west-2")
            bedrock_client = bedrock.BedrockClient(region=region)

            validation_feedback = ""
            for attempt in range(max_retries):
                try:
                    retry_prompt = ""
                    if attempt > 0 and validation_feedback:
                        retry_prompt = (
                            f"\n\nPREVIOUS ATTEMPT FAILED: {validation_feedback}\n"
                            f"Please fix the issue and generate a valid JSON Schema.\n\n"
                        )

                    full_prompt = (
                        f"{retry_prompt}{user_prompt}\n"
                        f"Format the extracted data using the below JSON format:\n{sample_format}"
                    )

                    response = bedrock_client.invoke_model(
                        model_id=model_id,
                        system_prompt=system_prompt,
                        content=content + [{"text": full_prompt}],
                        temperature=temperature,
                        top_p=top_p,
                        max_tokens=max_tokens,
                        context="ClassesDiscoveryLocal",
                    )

                    content_text = bedrock.extract_text_from_response(response)
                    schema = json.loads(_extract_json(content_text))

                    is_valid, error_msg = _validate_json_schema(schema)
                    if is_valid:
                        logger.info(
                            f"Successfully generated valid JSON Schema on attempt {attempt + 1}"
                        )
                        doc_class = schema.get("$id") or schema.get(
                            "x-aws-idp-document-type"
                        )
                        return DiscoveryResult(
                            status="SUCCESS",
                            document_class=doc_class,
                            json_schema=schema,
                            document_path=str(doc_path),
                        )
                    else:
                        validation_feedback = error_msg
                        logger.warning(
                            f"Invalid schema on attempt {attempt + 1}: {error_msg}"
                        )

                except json.JSONDecodeError as e:
                    validation_feedback = f"Invalid JSON format: {str(e)}"
                    logger.warning(f"JSON parse error on attempt {attempt + 1}: {e}")
                except Exception as e:
                    logger.error(f"Error on attempt {attempt + 1}: {e}")
                    if attempt == max_retries - 1:
                        raise

            return DiscoveryResult(
                status="FAILED",
                document_path=str(doc_path),
                error=f"Failed to generate valid schema after {max_retries} attempts",
            )

        except Exception as e:
            logger.error(f"Local discovery failed for {doc_path}: {e}")
            return DiscoveryResult(
                status="FAILED",
                document_path=str(doc_path),
                error=str(e),
            )

    def run_batch(
        self,
        document_paths: List[str],
        ground_truth_paths: Optional[List[Optional[str]]] = None,
        config_version: Optional[str] = None,
        stack_name: Optional[str] = None,
        **kwargs,
    ) -> DiscoveryBatchResult:
        """Run discovery on multiple documents sequentially.

        Args:
            document_paths: List of local paths to document files.
            ground_truth_paths: Optional list of ground truth file paths.
            config_version: Configuration version to save to.
            stack_name: Optional stack name override.

        Returns:
            DiscoveryBatchResult with overall stats and per-document results.
        """
        if ground_truth_paths and len(ground_truth_paths) != len(document_paths):
            raise IDPConfigurationError(
                f"ground_truth_paths length ({len(ground_truth_paths)}) "
                f"must match document_paths length ({len(document_paths)})"
            )

        results: List[DiscoveryResult] = []
        for i, doc_path in enumerate(document_paths):
            gt_path = (
                ground_truth_paths[i]
                if ground_truth_paths and ground_truth_paths[i]
                else None
            )
            result = self.run(
                document_path=doc_path,
                ground_truth_path=gt_path,
                config_version=config_version,
                stack_name=stack_name,
            )
            results.append(result)

        succeeded = sum(1 for r in results if r.status == "SUCCESS")
        failed = sum(1 for r in results if r.status != "SUCCESS")

        return DiscoveryBatchResult(
            total=len(results),
            succeeded=succeeded,
            failed=failed,
            results=results,
        )

    def _get_config_table(self, stack_name: str) -> str:
        """Get ConfigurationTable from stack resources."""
        import boto3

        cfn = boto3.client("cloudformation", region_name=self._client._region)
        paginator = cfn.get_paginator("list_stack_resources")

        for page in paginator.paginate(StackName=stack_name):
            for resource in page.get("StackResourceSummaries", []):
                if resource.get("LogicalResourceId") == "ConfigurationTable":
                    return resource.get("PhysicalResourceId", "")

        raise IDPResourceNotFoundError("ConfigurationTable not found in stack.")


# --- Helpers for local mode ---


def _extract_json(text: str) -> str:
    """Strip markdown code fences from LLM response before JSON parsing."""
    match = re.search(r"```(?:json)?\s*\n?(.*?)\n?\s*```", text, re.DOTALL)
    if match:
        return match.group(1)
    return text


def _validate_json_schema(schema: Dict[str, Any]) -> tuple:
    """Validate that the response is a valid JSON Schema."""
    required_fields = ["$schema", "$id", "type", "properties"]
    for field in required_fields:
        if field not in schema:
            return False, f"Missing required field: {field}"
    if "x-aws-idp-document-type" not in schema:
        return False, "Missing x-aws-idp-document-type field"
    if schema.get("type") != "object":
        return False, "Root type must be 'object'"
    if not isinstance(schema.get("properties"), dict):
        return False, "Properties must be an object"
    return True, ""


# --- Standalone prompt helpers for local mode ---


def _sample_output_format() -> str:
    return """{
    "$schema": "https://json-schema.org/draft/2020-12/schema",
    "$id": "Form-1040",
    "x-aws-idp-document-type": "Form-1040",
    "type": "object",
    "description": "Brief summary of the document",
    "properties": {
        "PersonalInformation": {
            "type": "object",
            "description": "Personal information of Tax payer",
            "properties": {
                "FirstName": {"type": "string", "description": "First Name of Taxpayer"},
                "Age": {"type": "number", "description": "Age of Taxpayer"}
            }
        },
        "Dependents": {
            "type": "array",
            "description": "Dependents of taxpayer",
            "items": {
                "type": "object",
                "properties": {
                    "FirstName": {"type": "string", "description": "Dependent first name"},
                    "Age": {"type": "number", "description": "Dependent Age"}
                }
            }
        }
    }
}"""


def _prompt_without_gt() -> str:
    return """This image contains forms data. Analyze the form line by line.
Image may contain multiple pages, process all the pages.
Form may contain multiple name value pair in one line.
Extract all the names in the form including the name value pair which doesn't have value.

Generate a JSON Schema that describes the document structure:
- Use "$schema": "https://json-schema.org/draft/2020-12/schema"
- Set "$id" to a short document class name (e.g., "W4", "I-9", "Paystub")
- Set "x-aws-idp-document-type" to the same document class name
- Set "type": "object"
- Add "description" with a brief summary of the document (less than 50 words)

For the "properties" object:
- Group related fields as objects (type: "object") with their own "properties"
- For repeating/table data, use type: "array" with "items" containing object schema
- Each field should have "type" (string, number, boolean, etc.) and "description"

Do not extract the actual values, only the schema structure."""


def _prompt_with_gt(ground_truth_data: dict) -> str:
    gt_json = json.dumps(ground_truth_data, indent=2)
    return f"""This image contains unstructured data. Analyze the data line by line using the provided ground truth as reference.
<GROUND_TRUTH_REFERENCE>
{gt_json}
</GROUND_TRUTH_REFERENCE>

Generate a JSON Schema that describes the document structure using the ground truth as reference:
- Use "$schema": "https://json-schema.org/draft/2020-12/schema"
- Set "$id" to a short document class name (e.g., "W4", "I-9", "Paystub")
- Set "x-aws-idp-document-type" to the same document class name
- Set "type": "object"
- Add "description" with a brief summary of the document (less than 50 words)

For the "properties" object:
- Preserve the exact field names and groupings from ground truth
- Use nested objects (type: "object") for grouped fields with their own "properties"
- For repeating/table data, use type: "array" with "items" containing object schema

Match field names, data types, and structure from the ground truth reference.
Do not extract the actual values, only the schema structure."""
