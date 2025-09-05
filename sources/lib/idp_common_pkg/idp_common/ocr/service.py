# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
OCR Service for document processing with AWS Textract or Amazon Bedrock.

This module provides a service for extracting text from PDF documents
using either AWS Textract or Amazon Bedrock LLMs, with support for concurrent
processing of multiple pages.
"""

import concurrent.futures
import logging
import os
import time
from typing import Any, Dict, List, Optional, Tuple, Union

import boto3
import fitz  # PyMuPDF
from botocore.config import Config

from idp_common import bedrock, image, s3, utils
from idp_common.models import Document, Page, Status
from idp_common.ocr.document_converter import DocumentConverter

logger = logging.getLogger(__name__)


class OcrService:
    """Service for OCR processing of documents using AWS Textract or Amazon Bedrock."""

    def __init__(
        self,
        region: Optional[str] = None,
        config: Optional[Dict[str, Any]] = None,
        backend: Optional[str] = None,
        max_workers: Optional[int] = None,
        # Deprecated parameters for backward compatibility
        enhanced_features: Optional[Union[bool, List[str]]] = None,
        dpi: Optional[int] = None,
        resize_config: Optional[Dict[str, Any]] = None,
        bedrock_config: Optional[Dict[str, Any]] = None,
        preprocessing_config: Optional[Dict[str, Any]] = None,
    ):
        """
        Initialize the OCR service.

        Args:
            region: AWS region for services
            config: Configuration dictionary containing all OCR settings
            backend: OCR backend to use ("textract", "bedrock", or "none")
            max_workers: Maximum number of concurrent workers for page processing

            Deprecated parameters (use config instead):
            enhanced_features: Controls Textract FeatureTypes for analyze_document API
            dpi: DPI (dots per inch) for image generation from PDF pages
            resize_config: Image resizing configuration
            bedrock_config: Bedrock configuration if backend is "bedrock"
            preprocessing_config: Preprocessing configuration

        Raises:
            ValueError: If invalid features are specified or if an invalid backend is specified
        """
        # Handle backward compatibility
        if config is None and any(
            [
                enhanced_features is not None,
                dpi is not None,
                resize_config is not None,
                bedrock_config is not None,
                preprocessing_config is not None,
            ]
        ):
            logger.warning(
                "Using deprecated parameter pattern. Please migrate to using 'config' parameter. "
                "See OCR README for migration guide."
            )
            # Use old parameters
            self.region = region or os.environ.get("AWS_REGION", "us-east-1")
            self.max_workers = max_workers or 20
            self.dpi = dpi
            self.resize_config = resize_config
            self.backend = (backend or "textract").lower()
            self.bedrock_config = bedrock_config
            self.preprocessing_config = preprocessing_config
            self.enhanced_features = enhanced_features
        else:
            # New pattern - extract from config
            self.region = region or os.environ.get("AWS_REGION", "us-east-1")
            self.config = config or {}
            ocr_config = self.config.get("ocr", {})

            # Extract backend
            self.backend = (backend or ocr_config.get("backend", "textract")).lower()

            # Extract max_workers
            self.max_workers = max_workers or ocr_config.get("max_workers", 20)

            # Extract DPI from image configuration
            image_config = ocr_config.get("image", {})
            dpi_value = image_config.get("dpi", 150)

            # Convert DPI to integer if it's a string
            if isinstance(dpi_value, str):
                try:
                    self.dpi = int(dpi_value) if dpi_value.strip() else 150
                except (ValueError, AttributeError):
                    logger.warning(
                        f"Invalid DPI value '{dpi_value}', using default 150"
                    )
                    self.dpi = 150
            else:
                self.dpi = int(dpi_value) if dpi_value is not None else 150

            # Extract enhanced features
            features_config = ocr_config.get("features", [])
            if features_config:
                self.enhanced_features = [
                    feature["name"] for feature in features_config
                ]
            else:
                self.enhanced_features = False

            # Extract image configuration with sensible defaults
            image_config = ocr_config.get("image", {})

            # Apply sensible defaults for image sizing when not specified
            DEFAULT_TARGET_WIDTH = 951
            DEFAULT_TARGET_HEIGHT = 1268

            # Extract resize configuration
            target_width = image_config.get("target_width")
            target_height = image_config.get("target_height")

            # Normalize None and empty strings to None for consistent handling
            if isinstance(target_width, str) and not target_width.strip():
                target_width = None
            if isinstance(target_height, str) and not target_height.strip():
                target_height = None

            # Apply sizing configuration logic
            if target_width is None and target_height is None:
                # No sizing configuration provided (None or empty strings) - apply sensible defaults
                self.resize_config = {
                    "target_width": DEFAULT_TARGET_WIDTH,
                    "target_height": DEFAULT_TARGET_HEIGHT,
                }
                logger.info(
                    f"No image sizing configured, applying default limits: "
                    f"{DEFAULT_TARGET_WIDTH}x{DEFAULT_TARGET_HEIGHT} to optimize resource usage and token consumption"
                )
            elif target_width is not None and target_height is not None:
                # Handle empty strings by converting to None for validation
                if isinstance(target_width, str) and not target_width.strip():
                    target_width = None
                if isinstance(target_height, str) and not target_height.strip():
                    target_height = None

                # If after handling empty strings we still have values, use them
                if target_width is not None and target_height is not None:
                    # Explicit configuration provided - validate and use it
                    try:
                        self.resize_config = {
                            "target_width": int(target_width),
                            "target_height": int(target_height),
                        }
                        logger.info(
                            f"Using configured image sizing: {target_width}x{target_height}"
                        )
                    except (ValueError, TypeError):
                        logger.warning(
                            f"Invalid resize configuration values: width={target_width}, height={target_height}. "
                            f"Falling back to defaults: {DEFAULT_TARGET_WIDTH}x{DEFAULT_TARGET_HEIGHT}"
                        )
                        self.resize_config = {
                            "target_width": DEFAULT_TARGET_WIDTH,
                            "target_height": DEFAULT_TARGET_HEIGHT,
                        }
                else:
                    # After handling empty strings, we have None values - apply defaults
                    self.resize_config = {
                        "target_width": DEFAULT_TARGET_WIDTH,
                        "target_height": DEFAULT_TARGET_HEIGHT,
                    }
                    logger.info(
                        f"Invalid image sizing configuration provided, applying default limits: "
                        f"{DEFAULT_TARGET_WIDTH}x{DEFAULT_TARGET_HEIGHT} to optimize resource usage and token consumption"
                    )
            else:
                # Partial configuration (only width or height) - no defaults applied
                # This preserves the existing behavior for partial configs
                self.resize_config = None
                logger.info(
                    "Partial image sizing configuration detected, no defaults applied"
                )

            # Extract preprocessing configuration
            preprocessing_value = image_config.get("preprocessing")
            if preprocessing_value is True or (
                isinstance(preprocessing_value, str)
                and preprocessing_value.lower() == "true"
            ):
                self.preprocessing_config = {"enabled": True}
            else:
                self.preprocessing_config = None

            # Extract Bedrock configuration
            if self.backend == "bedrock":
                if all(
                    key in ocr_config
                    for key in ["model_id", "system_prompt", "task_prompt"]
                ):
                    self.bedrock_config = {
                        "model_id": ocr_config["model_id"],
                        "system_prompt": ocr_config["system_prompt"],
                        "task_prompt": ocr_config["task_prompt"],
                    }
                else:
                    self.bedrock_config = None
            else:
                self.bedrock_config = None

        # Log DPI and sizing configuration together for clarity
        if self.resize_config:
            logger.info(
                f"OCR Service initialized - DPI: {self.dpi}, "
                f"Image sizing: {self.resize_config['target_width']}x{self.resize_config['target_height']}"
            )
        else:
            logger.info(
                f"OCR Service initialized - DPI: {self.dpi}, No image sizing limits"
            )

        # Validate backend
        if self.backend not in ["textract", "bedrock", "none"]:
            raise ValueError(
                f"Invalid backend: {backend}. Must be 'textract', 'bedrock', or 'none'"
            )

        # Initialize clients based on backend
        if self.backend == "textract":
            # Define valid Textract feature types
            VALID_FEATURES = ["TABLES", "FORMS", "SIGNATURES", "LAYOUT"]

            # Validate features if provided as a list
            if isinstance(self.enhanced_features, list):
                # Check for invalid features
                invalid_features = [
                    feature
                    for feature in self.enhanced_features
                    if feature not in VALID_FEATURES
                ]
                if invalid_features:
                    error_msg = f"Invalid Textract feature(s) specified: {invalid_features}. Valid features are: {VALID_FEATURES}"
                    logger.error(error_msg)
                    raise ValueError(error_msg)

                # Log the validated features
                logger.info(
                    f"OCR Service initialized with features: {self.enhanced_features}"
                )

            # Initialize Textract client with adaptive retries
            adaptive_config = Config(
                retries={"max_attempts": 100, "mode": "adaptive"},
                max_pool_connections=self.max_workers * 3,
            )
            self.textract_client = boto3.client(
                "textract", region_name=self.region, config=adaptive_config
            )

            logger.info("OCR Service initialized with Textract backend")
        elif self.backend == "bedrock":
            # Enhanced features not used with Bedrock
            self.enhanced_features = False

            # Validate bedrock_config is provided
            if not self.bedrock_config:
                raise ValueError(
                    "bedrock_config is required when using 'bedrock' backend"
                )

            # Validate required bedrock_config fields
            required_fields = ["model_id", "system_prompt", "task_prompt"]
            missing_fields = [
                field for field in required_fields if not self.bedrock_config.get(field)
            ]
            if missing_fields:
                raise ValueError(
                    f"Missing required bedrock_config fields: {missing_fields}"
                )

            logger.info(
                f"OCR Service initialized with Bedrock backend, config: {self.bedrock_config}"
            )
        elif self.backend == "none":
            # No OCR processing - image-only mode
            self.enhanced_features = False
            logger.info(
                "OCR Service initialized with 'none' backend - image-only processing"
            )

        # Initialize S3 client with connection pool matching max_workers
        s3_config = Config(
            retries={"max_attempts": 10, "mode": "adaptive"},
            max_pool_connections=max(self.max_workers, 10),
        )
        self.s3_client = boto3.client("s3", config=s3_config)
        logger.info(
            f"S3 client initialized with {max(self.max_workers, 10)} connection pool size"
        )

        # Initialize document converter for non-PDF formats
        self.document_converter = DocumentConverter(dpi=self.dpi or 150)

    def process_document(self, document: Document) -> Document:
        """
        Process a document with OCR and update the Document model.
        Supports PDF, images, text, CSV, Excel, and Word documents.

        Args:
            document: Document model object to update with OCR results

        Returns:
            Updated Document object with OCR results
        """
        t0 = time.time()

        # Get the document from S3
        try:
            response = self.s3_client.get_object(
                Bucket=document.input_bucket, Key=document.input_key
            )
            file_content = response["Body"].read()
            t1 = time.time()
            logger.debug(f"Time taken for S3 GetObject: {t1 - t0:.6f} seconds")
        except Exception as e:
            import traceback

            error_msg = f"Error retrieving document from S3: {str(e)}"
            stack_trace = traceback.format_exc()
            logger.error(f"{error_msg}\nStack trace:\n{stack_trace}")
            document.errors.append(f"{error_msg} (see logs for full trace)")
            document.status = Status.FAILED
            return document

        # Detect file type and process accordingly
        try:
            file_type = self._detect_file_type(document.input_key, file_content)
            logger.info(f"Detected file type: {file_type}")

            if file_type in ["txt", "csv", "xlsx", "docx"]:
                # Process non-PDF documents
                pages_data = self._process_non_pdf_document(file_type, file_content)
                document.num_pages = len(pages_data)

                # Process each page
                for page_index, (image_bytes, page_text) in enumerate(pages_data):
                    page_id = str(page_index + 1)
                    try:
                        ocr_result, page_metering = self._process_converted_page(
                            page_index,
                            image_bytes,
                            page_text,
                            document.output_bucket,
                            document.input_key,
                        )

                        # Create Page object and add to document
                        document.pages[page_id] = Page(
                            page_id=page_id,
                            image_uri=ocr_result["image_uri"],
                            raw_text_uri=ocr_result["raw_text_uri"],
                            parsed_text_uri=ocr_result["parsed_text_uri"],
                            text_confidence_uri=ocr_result["text_confidence_uri"],
                        )

                        # Merge metering data
                        document.metering = utils.merge_metering_data(
                            document.metering, page_metering
                        )

                    except Exception as e:
                        import traceback

                        error_msg = f"Error processing page {page_index + 1}: {str(e)}"
                        stack_trace = traceback.format_exc()
                        logger.error(f"{error_msg}\nStack trace:\n{stack_trace}")
                        document.errors.append(f"{error_msg} (see logs for full trace)")
            else:
                # Process PDF/image documents using existing logic
                pdf_document = fitz.open(stream=file_content, filetype=file_type)
                num_pages = len(pdf_document)
                document.num_pages = num_pages

                with concurrent.futures.ThreadPoolExecutor(
                    max_workers=self.max_workers
                ) as executor:
                    # Pass original file content for image files
                    original_content = file_content if not pdf_document.is_pdf else None

                    future_to_page = {
                        executor.submit(
                            self._process_single_page,
                            i,
                            pdf_document,
                            document.output_bucket,
                            document.input_key,
                            original_content,
                        ): i
                        for i in range(num_pages)
                    }

                    # Start memory monitoring in background thread
                    memory_monitor_shutdown = self._start_memory_monitoring()
                    completed_pages = 0

                    try:
                        for future in concurrent.futures.as_completed(future_to_page):
                            page_index = future_to_page[future]
                            page_id = str(page_index + 1)
                            try:
                                ocr_result, page_metering = future.result()

                                # Create Page object and add to document
                                document.pages[page_id] = Page(
                                    page_id=page_id,
                                    image_uri=ocr_result["image_uri"],
                                    raw_text_uri=ocr_result["raw_text_uri"],
                                    parsed_text_uri=ocr_result["parsed_text_uri"],
                                    text_confidence_uri=ocr_result[
                                        "text_confidence_uri"
                                    ],
                                )

                                # Merge metering data
                                document.metering = utils.merge_metering_data(
                                    document.metering, page_metering
                                )

                                completed_pages += 1

                            except Exception as e:
                                import traceback

                                error_msg = (
                                    f"Error processing page {page_index + 1}: {str(e)}"
                                )
                                stack_trace = traceback.format_exc()
                                logger.error(
                                    f"{error_msg}\nStack trace:\n{stack_trace}"
                                )
                                document.errors.append(
                                    f"{error_msg} (see logs for full trace)"
                                )
                    finally:
                        # Stop memory monitoring
                        memory_monitor_shutdown.set()

                pdf_document.close()

            # Sort the pages dictionary by ascending page number
            logger.info(f"Sorting {len(document.pages)} pages by page number")

            # Create a new ordered dictionary with sorted pages
            sorted_pages = {}
            # Convert page_id to int for sorting, then back to string for the keys
            for page_id in sorted(document.pages.keys(), key=lambda x: int(x)):
                sorted_pages[page_id] = document.pages[page_id]

            # Replace the original pages dictionary with the sorted one
            document.pages = sorted_pages

            if document.errors:
                document.status = Status.FAILED

        except Exception as e:
            import traceback

            error_msg = f"Error processing document: {str(e)}"
            stack_trace = traceback.format_exc()
            logger.error(f"{error_msg}\nStack trace:\n{stack_trace}")
            document.errors.append(f"{error_msg} (see logs for full trace)")
            document.status = Status.FAILED

        t2 = time.time()
        logger.info(f"OCR processing completed in {t2 - t0:.2f} seconds")
        logger.info(
            f"Processed {len(document.pages)} pages, with {len(document.errors)} errors"
        )
        return document

    def _feature_combo(self):
        """Return the pricing feature combination string based on enhanced_features.

        Returns one of: "Tables", "Forms", "Tables+Forms", "Signatures", "Layout", or ""

        Note:
        - Layout feature is included free with any combination of Forms, Tables
        - Signatures feature is included free with Forms, Tables, and Layout
        """
        # TODO: Uncomment this when needed
        # Define valid Textract feature types
        # VALID_FEATURES = ["TABLES", "FORMS", "SIGNATURES", "LAYOUT"]

        # We assume features have already been validated in _analyze_document
        # This is just a safety check
        if not isinstance(self.enhanced_features, list) or not self.enhanced_features:
            return ""

        # All features should be valid at this point
        features = set(self.enhanced_features)

        # Check for feature combinations
        has_tables = "TABLES" in features
        has_forms = "FORMS" in features
        has_layout = "LAYOUT" in features
        has_signatures = "SIGNATURES" in features

        # Tables + Forms
        if has_tables and has_forms:
            return "-Tables+Forms"
        # Tables only
        elif has_tables:
            return "-Tables"
        # Forms only
        elif has_forms:
            return "-Forms"
        # Layout (only charged if not with Forms/Tables)
        elif has_layout:
            return "-Layout"
        # Signatures (only charged if used alone)
        elif has_signatures:
            return "-Signatures"
        return ""

    def _process_single_page(
        self,
        page_index: int,
        pdf_document: fitz.Document,
        output_bucket: str,
        prefix: str,
        original_file_content: Optional[bytes] = None,
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Process a single page of a document (PDF or image).

        Args:
            page_index: Zero-based index of the page
            pdf_document: PyMuPDF document object
            output_bucket: S3 bucket to store results
            prefix: S3 prefix for storing results
            original_file_content: Original file content for image files

        Returns:
            Tuple of (page_result_dict, metering_data)
        """
        # Check if this is an image file (not a PDF)
        # PyMuPDF loads images as single-page documents
        if not pdf_document.is_pdf and page_index == 0:
            # This is an image file - process it directly
            return self._process_image_file_direct(
                pdf_document, output_bucket, prefix, original_file_content
            )

        # Use the appropriate backend for PDFs
        if self.backend == "none":
            return self._process_single_page_none(
                page_index, pdf_document, output_bucket, prefix
            )
        elif self.backend == "bedrock":
            return self._process_single_page_bedrock(
                page_index, pdf_document, output_bucket, prefix
            )
        else:
            # Textract backend (default)
            return self._process_single_page_textract(
                page_index, pdf_document, output_bucket, prefix
            )

    def _process_image_file_direct(
        self,
        pdf_document: fitz.Document,
        output_bucket: str,
        prefix: str,
        original_file_content: Optional[bytes] = None,
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Process an image file directly without PyMuPDF conversion.

        Args:
            pdf_document: PyMuPDF document object (contains the image)
            output_bucket: S3 bucket to store results
            prefix: S3 prefix for storing results
            original_file_content: Original file content to avoid PyMuPDF processing

        Returns:
            Tuple of (page_result_dict, metering_data)
        """
        t0 = time.time()
        page_id = 1

        # If we have the original file content, use it directly to avoid PyMuPDF processing
        if original_file_content:
            import io

            from PIL import Image as PILImage

            # Use the original file content directly
            img_data = original_file_content

            # Detect format from the original content
            pil_img = PILImage.open(io.BytesIO(img_data))
            img_format = pil_img.format.lower() if pil_img.format else "jpeg"
            img_ext = img_format if img_format != "jpeg" else "jpg"

            # Get dimensions for logging
            original_width, original_height = pil_img.size
            logger.debug(
                f"Using original file content: {original_width}x{original_height} {img_format}"
            )

            # Determine content type
            content_type_map = {
                "png": "image/png",
                "jpg": "image/jpeg",
                "jpeg": "image/jpeg",
                "gif": "image/gif",
                "bmp": "image/bmp",
                "tiff": "image/tiff",
                "tif": "image/tiff",
                "webp": "image/webp",
            }
            original_content_type = content_type_map.get(img_ext, "image/jpeg")

            # Check if we need to resize
            needs_resize = False
            if self.resize_config and (
                self.resize_config.get("target_width")
                or self.resize_config.get("target_height")
            ):
                target_width = self.resize_config.get("target_width")
                target_height = self.resize_config.get("target_height")

                if target_width or target_height:
                    # Check if image already fits within target dimensions
                    if (
                        original_width <= target_width
                        and original_height <= target_height
                    ):
                        logger.debug(
                            f"Image {original_width}x{original_height} already fits within "
                            f"{target_width}x{target_height}, using original"
                        )
                        needs_resize = False
                    else:
                        logger.debug(
                            f"Image {original_width}x{original_height} needs resizing to fit "
                            f"{target_width}x{target_height}"
                        )
                        needs_resize = True

            # Apply resize only if needed
            if needs_resize:
                img_data = image.resize_image(img_data, target_width, target_height)

                # Check if format changed after resize
                resized_img = PILImage.open(io.BytesIO(img_data))
                if resized_img.format and resized_img.format.lower() != img_ext:
                    new_format = resized_img.format.lower()
                    img_ext = new_format if new_format != "jpeg" else "jpg"
                    content_type = content_type_map.get(img_ext, "image/jpeg")
                    logger.debug(f"Image format changed during resize to {img_ext}")
                else:
                    content_type = original_content_type
            else:
                content_type = original_content_type
                logger.debug("No resize needed, using original image")

        else:
            # Fallback to PyMuPDF processing if no original content provided
            # Get the page (images are loaded as single-page documents)
            page = pdf_document.load_page(0)

            # Get the original image data from the page
            # PyMuPDF stores the original image in the page's image list
            img_list = page.get_images()

            if img_list:
                # Extract the original image
                xref = img_list[0][0]  # Get the xref of the first image
                pix = fitz.Pixmap(pdf_document, xref)

                # Get original format info
                img_data = pix.tobytes()
                img_ext = pix.extension  # Get original extension (png, jpg, etc.)

                # Determine content type
                content_type_map = {
                    "png": "image/png",
                    "jpg": "image/jpeg",
                    "jpeg": "image/jpeg",
                    "gif": "image/gif",
                    "bmp": "image/bmp",
                    "tiff": "image/tiff",
                    "tif": "image/tiff",
                    "webp": "image/webp",
                }
                original_content_type = content_type_map.get(img_ext, "image/jpeg")

                # Apply resize if configured
                if self.resize_config and (
                    self.resize_config.get("target_width")
                    or self.resize_config.get("target_height")
                ):
                    target_width = self.resize_config.get("target_width")
                    target_height = self.resize_config.get("target_height")

                    # Only resize if dimensions are provided
                    if target_width or target_height:
                        # The resize_image function now preserves format
                        img_data = image.resize_image(
                            img_data, target_width, target_height
                        )

                        # Check if format changed after resize
                        import io

                        from PIL import Image as PILImage

                        resized_img = PILImage.open(io.BytesIO(img_data))
                        if resized_img.format and resized_img.format != img_ext.upper():
                            # Format changed during resize
                            new_format = resized_img.format.lower()
                            img_ext = new_format if new_format != "jpeg" else "jpg"
                            content_type = content_type_map.get(img_ext, "image/jpeg")
                            logger.debug(
                                f"Image format changed during resize to {img_ext}"
                            )
                        else:
                            content_type = original_content_type

                        logger.debug(f"Resized image to {target_width}x{target_height}")
                else:
                    content_type = original_content_type

                # Clean up pixmap
                pix = None
            else:
                # Fallback: extract as rendered image
                # This path should rarely be used since we pass original_file_content for images
                pix = page.get_pixmap()
                logger.debug(
                    f"Using PyMuPDF fallback for image extraction: {pix.width}x{pix.height}"
                )

                img_data = pix.tobytes("png")
                img_ext = "png"
                content_type = "image/png"

                # Apply resize if configured
                if self.resize_config and (
                    self.resize_config.get("target_width")
                    or self.resize_config.get("target_height")
                ):
                    target_width = self.resize_config.get("target_width")
                    target_height = self.resize_config.get("target_height")

                    if target_width or target_height:
                        # The resize_image function now preserves format
                        img_data = image.resize_image(
                            img_data, target_width, target_height
                        )

                        # Check if format changed after resize
                        import io

                        from PIL import Image as PILImage

                        resized_img = PILImage.open(io.BytesIO(img_data))
                        if resized_img.format and resized_img.format.lower() != img_ext:
                            # Format changed during resize
                            new_format = resized_img.format.lower()
                            img_ext = new_format if new_format != "jpeg" else "jpg"
                            content_type_map = {
                                "png": "image/png",
                                "jpg": "image/jpeg",
                                "jpeg": "image/jpeg",
                                "gif": "image/gif",
                                "bmp": "image/bmp",
                                "tiff": "image/tiff",
                                "tif": "image/tiff",
                                "webp": "image/webp",
                            }
                            content_type = content_type_map.get(img_ext, "image/png")
                            logger.debug(
                                f"Image format changed during resize to {img_ext}"
                            )

                        logger.debug(f"Resized image to {target_width}x{target_height}")

        # Store image with appropriate format
        image_key = f"{prefix}/pages/{page_id}/image.{img_ext}"
        s3.write_content(img_data, output_bucket, image_key, content_type=content_type)

        t1 = time.time()
        logger.debug(
            f"Time for image processing (page {page_id}): {t1 - t0:.6f} seconds"
        )

        # Process with OCR based on backend
        if self.backend == "none":
            # No OCR processing
            metering = {}

            # Create empty OCR response structure for compatibility
            empty_ocr_response = {"DocumentMetadata": {"Pages": 1}, "Blocks": []}

            # Store empty raw OCR response
            raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
            s3.write_content(
                empty_ocr_response,
                output_bucket,
                raw_text_key,
                content_type="application/json",
            )

            # Generate minimal text confidence data
            text_confidence_data = {
                "text": "| Text | Confidence |\n|:-----|:------------|\n| *No OCR performed* | N/A |"
            }

            text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
            s3.write_content(
                text_confidence_data,
                output_bucket,
                text_confidence_key,
                content_type="application/json",
            )

            # Store empty parsed text result
            parsed_result = {"text": ""}
            parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
            s3.write_content(
                parsed_result,
                output_bucket,
                parsed_text_key,
                content_type="application/json",
            )

        elif self.backend == "bedrock":
            # Process with Bedrock
            # Apply preprocessing if enabled
            ocr_img_data = img_data
            if self.preprocessing_config and self.preprocessing_config.get("enabled"):
                from idp_common.image import apply_adaptive_binarization

                ocr_img_data = apply_adaptive_binarization(ocr_img_data)
                logger.debug(
                    "Applied adaptive binarization preprocessing for Bedrock OCR"
                )

            # Prepare image for Bedrock
            image_content = image.prepare_bedrock_image_attachment(ocr_img_data)

            # Prepare content for Bedrock
            content = [{"text": self.bedrock_config["task_prompt"]}, image_content]

            # Invoke Bedrock
            response_with_metering = bedrock.invoke_model(
                model_id=self.bedrock_config["model_id"],
                system_prompt=self.bedrock_config["system_prompt"],
                content=content,
                temperature=0.0,
                top_p=0.1,
                top_k=5,
                max_tokens=4096,
                context="OCR",
            )

            # Extract text from response
            extracted_text = bedrock.extract_text_from_response(response_with_metering)
            metering = response_with_metering.get("metering", {})

            # Store raw Bedrock response
            raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
            s3.write_content(
                response_with_metering["response"],
                output_bucket,
                raw_text_key,
                content_type="application/json",
            )

            # Generate text confidence data
            text_confidence_data = {
                "text": "| Text | Confidence |\n|:-----|:------------|\n| *No confidence data available from LLM OCR* | N/A |"
            }

            text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
            s3.write_content(
                text_confidence_data,
                output_bucket,
                text_confidence_key,
                content_type="application/json",
            )

            # Store parsed text result
            parsed_result = {"text": extracted_text}
            parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
            s3.write_content(
                parsed_result,
                output_bucket,
                parsed_text_key,
                content_type="application/json",
            )

        else:
            # Process with Textract (default)
            # Apply preprocessing if enabled
            ocr_img_data = img_data
            if self.preprocessing_config and self.preprocessing_config.get("enabled"):
                from idp_common.image import apply_adaptive_binarization

                ocr_img_data = apply_adaptive_binarization(ocr_img_data)
                logger.debug("Applied adaptive binarization preprocessing for OCR")

            # Process with OCR
            if isinstance(self.enhanced_features, list) and self.enhanced_features:
                textract_result = self._analyze_document(ocr_img_data, page_id)
            else:
                textract_result = self.textract_client.detect_document_text(
                    Document={"Bytes": ocr_img_data}
                )

            # Extract metering data
            feature_combo = self._feature_combo()
            metering = {
                f"OCR/textract/{self._get_api_name()}{feature_combo}": {
                    "pages": textract_result["DocumentMetadata"]["Pages"]
                }
            }

            # Store raw Textract response
            raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
            s3.write_content(
                textract_result,
                output_bucket,
                raw_text_key,
                content_type="application/json",
            )

            # Generate and store text confidence data
            text_confidence_data = self._generate_text_confidence_data(textract_result)
            text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
            s3.write_content(
                text_confidence_data,
                output_bucket,
                text_confidence_key,
                content_type="application/json",
            )

            # Parse and store text content
            parsed_result = self._parse_textract_response(textract_result, page_id)
            parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
            s3.write_content(
                parsed_result,
                output_bucket,
                parsed_text_key,
                content_type="application/json",
            )

        t2 = time.time()
        logger.debug(f"Total processing time for image file: {t2 - t0:.6f} seconds")

        # Create and return page result
        result = {
            "raw_text_uri": f"s3://{output_bucket}/{raw_text_key}",
            "parsed_text_uri": f"s3://{output_bucket}/{parsed_text_key}",
            "text_confidence_uri": f"s3://{output_bucket}/{text_confidence_key}",
            "image_uri": f"s3://{output_bucket}/{image_key}",
        }

        return result, metering

    def _start_memory_monitoring(self):
        """
        Start background memory monitoring that logs usage every 5 seconds.

        Returns:
            Event object that can be set to stop monitoring
        """
        import threading

        shutdown_event = threading.Event()

        def monitor_memory():
            while not shutdown_event.is_set():
                try:
                    import os

                    import psutil

                    process = psutil.Process(os.getpid())
                    memory_info = process.memory_info()
                    memory_mb = memory_info.rss / (1024 * 1024)  # Convert to MB

                    logger.info(f"Memory usage: {memory_mb:.1f} MB")

                    # Warning if memory usage is getting high
                    if memory_mb > 3500:
                        logger.warning(
                            f"HIGH memory usage detected: {memory_mb:.1f} MB"
                        )

                except ImportError:
                    logger.debug("psutil not available, skipping memory monitoring")
                    break
                except Exception as e:
                    logger.debug(f"Error monitoring memory: {str(e)}")

                # Wait 5 seconds or until shutdown
                shutdown_event.wait(5.0)

        # Start monitoring thread
        monitor_thread = threading.Thread(target=monitor_memory, daemon=True)
        monitor_thread.start()

        return shutdown_event

    def _process_single_page_textract(
        self,
        page_index: int,
        pdf_document: fitz.Document,
        output_bucket: str,
        prefix: str,
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Process a single page using AWS Textract.

        Args:
            page_index: Zero-based index of the page
            pdf_document: PyMuPDF document object
            output_bucket: S3 bucket to store results
            prefix: S3 prefix for storing results

        Returns:
            Tuple of (page_result_dict, metering_data)
        """
        t0 = time.time()
        page_id = page_index + 1

        # Extract page image - now returns image at optimal size directly
        page = pdf_document.load_page(page_index)
        img_bytes = self._extract_page_image(page, pdf_document.is_pdf, page_id)

        # Upload processed image to S3 (already at target size if resize config exists)
        image_key = f"{prefix}/pages/{page_id}/image.jpg"
        s3.write_content(img_bytes, output_bucket, image_key, content_type="image/jpeg")

        t1 = time.time()
        logger.debug(
            f"Time for image processing (page {page_id}): {t1 - t0:.6f} seconds"
        )

        # Use the extracted image directly for OCR (no additional resize needed)
        ocr_img_bytes = img_bytes

        # Apply preprocessing if enabled (only for OCR processing, not saved image)
        if self.preprocessing_config and self.preprocessing_config.get("enabled"):
            from idp_common.image import apply_adaptive_binarization

            ocr_img_bytes = apply_adaptive_binarization(ocr_img_bytes)
            logger.debug(
                f"Applied adaptive binarization preprocessing for OCR processing (page {page_id})"
            )

        # Process with OCR using potentially resized image
        if isinstance(self.enhanced_features, list) and self.enhanced_features:
            textract_result = self._analyze_document(ocr_img_bytes, page_id)
        else:
            textract_result = self.textract_client.detect_document_text(
                Document={"Bytes": ocr_img_bytes}
            )

        # Aggressive memory cleanup - clear large image variables immediately after OCR
        img_bytes = None
        ocr_img_bytes = None

        # Force garbage collection after processing large images
        import gc

        gc.collect()

        # Extract metering data
        feature_combo = self._feature_combo()
        metering = {
            f"OCR/textract/{self._get_api_name()}{feature_combo}": {
                "pages": textract_result["DocumentMetadata"]["Pages"]
            }
        }

        # Store raw Textract response
        raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
        s3.write_content(
            textract_result,
            output_bucket,
            raw_text_key,
            content_type="application/json",
        )

        # Generate and store text confidence data for efficient assessment
        text_confidence_data = self._generate_text_confidence_data(textract_result)
        text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
        s3.write_content(
            text_confidence_data,
            output_bucket,
            text_confidence_key,
            content_type="application/json",
        )

        # Parse and store text content with markdown
        parsed_result = self._parse_textract_response(textract_result, page_id)
        parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
        s3.write_content(
            parsed_result,
            output_bucket,
            parsed_text_key,
            content_type="application/json",
        )

        t2 = time.time()
        logger.debug(f"Time for Textract (page {page_id}): {t2 - t1:.6f} seconds")

        # Create and return page result
        result = {
            "raw_text_uri": f"s3://{output_bucket}/{raw_text_key}",
            "parsed_text_uri": f"s3://{output_bucket}/{parsed_text_key}",
            "text_confidence_uri": f"s3://{output_bucket}/{text_confidence_key}",
            "image_uri": f"s3://{output_bucket}/{image_key}",
        }

        return result, metering

    def _extract_page_image(self, page: fitz.Page, is_pdf: bool, page_id: int) -> bytes:
        """
        Extract image bytes from a page at optimal size to prevent memory issues.

        If resize config is provided, images are extracted directly at target dimensions
        to avoid creating oversized images that cause OutOfMemory errors.

        Args:
            page: PyMuPDF page object
            is_pdf: Whether the document is a PDF file
            page_id: Page number for logging

        Returns:
            Image bytes in JPEG format (at target size if resize config exists)
        """
        pix = None
        try:
            # Check if we should extract at target size to avoid memory issues
            if self.resize_config:
                target_width = self.resize_config.get("target_width")
                target_height = self.resize_config.get("target_height")

                if target_width and target_height:
                    # Get page dimensions to calculate scaling
                    page_rect = page.rect

                    if is_pdf:
                        # For PDF files, calculate dimensions at specified DPI (default to 150 if None)
                        dpi = self.dpi or 150
                        original_width = int(page_rect.width * (dpi / 72))
                        original_height = int(page_rect.height * (dpi / 72))
                    else:
                        # For image files, use actual dimensions
                        original_width = int(page_rect.width)
                        original_height = int(page_rect.height)

                    # Apply same logic as image.resize_image - preserve aspect ratio, never upscale
                    width_ratio = target_width / original_width
                    height_ratio = target_height / original_height
                    scale_factor = min(
                        width_ratio, height_ratio
                    )  # Preserve aspect ratio

                    # Only resize if scale_factor < 1.0 (never upscale)
                    if scale_factor < 1.0:
                        # Extract at reduced size using matrix transformation
                        if is_pdf:
                            # For PDF, combine DPI scaling with size reduction
                            dpi = self.dpi or 150
                            base_scale = dpi / 72  # Convert PDF points to pixels
                            final_scale = base_scale * scale_factor
                            matrix = fitz.Matrix(final_scale, final_scale)
                        else:
                            # For images, just apply the scale factor
                            matrix = fitz.Matrix(scale_factor, scale_factor)

                        pix = page.get_pixmap(matrix=matrix)

                        actual_width, actual_height = pix.width, pix.height
                        logger.info(
                            f"Extracted page {page_id} at target size: {actual_width}x{actual_height} (scale: {scale_factor:.3f})"
                        )

                    else:
                        # No resize needed - image is already smaller than targets
                        if is_pdf:
                            dpi = self.dpi or 150
                            pix = page.get_pixmap(dpi=dpi)
                        else:
                            pix = page.get_pixmap()

                        # Log actual extracted dimensions
                        actual_width, actual_height = pix.width, pix.height
                        logger.info(
                            f"Page {page_id} already fits target size, extracted at: {actual_width}x{actual_height}"
                        )
                else:
                    # No valid target dimensions - use original extraction
                    if is_pdf:
                        dpi = self.dpi or 150
                        pix = page.get_pixmap(dpi=dpi)
                    else:
                        pix = page.get_pixmap()

                    # Log actual extracted dimensions
                    actual_width, actual_height = pix.width, pix.height
                    logger.info(
                        f"Page {page_id} extracted at original size: {actual_width}x{actual_height}"
                    )
            else:
                # No resize config - extract at original size
                if is_pdf:
                    dpi = self.dpi or 150
                    pix = page.get_pixmap(dpi=dpi)
                else:
                    pix = page.get_pixmap()

                # Log actual extracted dimensions
                actual_width, actual_height = pix.width, pix.height
                logger.info(
                    f"Page {page_id} extracted at original size: {actual_width}x{actual_height}"
                )

            image_bytes = pix.tobytes("jpeg")
            return image_bytes
        finally:
            # Aggressive cleanup of PyMuPDF pixmap to prevent memory leaks
            if pix is not None:
                pix = None

    def _process_single_page_bedrock(
        self,
        page_index: int,
        pdf_document: fitz.Document,
        output_bucket: str,
        prefix: str,
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Process a single page using Amazon Bedrock LLM.

        Args:
            page_index: Zero-based index of the page
            pdf_document: PyMuPDF document object
            output_bucket: S3 bucket to store results
            prefix: S3 prefix for storing results

        Returns:
            Tuple of (page_result_dict, metering_data)
        """
        t0 = time.time()
        page_id = page_index + 1

        # Extract page image - now returns image at optimal size directly
        page = pdf_document.load_page(page_index)
        img_bytes = self._extract_page_image(page, pdf_document.is_pdf, page_id)

        # Upload processed image to S3 (already at target size if resize config exists)
        image_key = f"{prefix}/pages/{page_id}/image.jpg"
        s3.write_content(img_bytes, output_bucket, image_key, content_type="image/jpeg")

        t1 = time.time()
        logger.debug(
            f"Time for image processing (page {page_id}): {t1 - t0:.6f} seconds"
        )

        # Use the extracted image directly for OCR (no additional resize needed)
        ocr_img_bytes = img_bytes

        # Apply preprocessing if enabled (only for OCR processing, not saved image)
        if self.preprocessing_config and self.preprocessing_config.get("enabled"):
            from idp_common.image import apply_adaptive_binarization

            ocr_img_bytes = apply_adaptive_binarization(ocr_img_bytes)
            logger.debug(
                f"Applied adaptive binarization preprocessing for Bedrock OCR processing (page {page_id})"
            )

        # Prepare image for Bedrock
        image_content = image.prepare_bedrock_image_attachment(ocr_img_bytes)

        # Prepare content for Bedrock
        content = [{"text": self.bedrock_config["task_prompt"]}, image_content]

        # Invoke Bedrock
        response_with_metering = bedrock.invoke_model(
            model_id=self.bedrock_config["model_id"],
            system_prompt=self.bedrock_config["system_prompt"],
            content=content,
            temperature=0.0,  # Use lowest temperature for OCR accuracy
            top_p=0.1,
            top_k=5,
            max_tokens=4096,
            context="OCR",
        )

        # Extract text from response
        extracted_text = bedrock.extract_text_from_response(response_with_metering)
        metering = response_with_metering.get("metering", {})

        t2 = time.time()
        logger.debug(f"Time for Bedrock OCR (page {page_id}): {t2 - t1:.6f} seconds")

        # Store raw Bedrock response
        raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
        s3.write_content(
            response_with_metering["response"],
            output_bucket,
            raw_text_key,
            content_type="application/json",
        )

        # Generate and store text confidence data
        # For Bedrock, we use empty markdown table since LLM OCR doesn't provide real confidence scores
        text_confidence_data = {
            "text": "| Text | Confidence |\n|:-----|:------------|\n| *No confidence data available from LLM OCR* | N/A |"
        }

        text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
        s3.write_content(
            text_confidence_data,
            output_bucket,
            text_confidence_key,
            content_type="application/json",
        )

        # Store parsed text result
        parsed_result = {"text": extracted_text}
        parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
        s3.write_content(
            parsed_result,
            output_bucket,
            parsed_text_key,
            content_type="application/json",
        )

        # Create and return page result
        result = {
            "raw_text_uri": f"s3://{output_bucket}/{raw_text_key}",
            "parsed_text_uri": f"s3://{output_bucket}/{parsed_text_key}",
            "text_confidence_uri": f"s3://{output_bucket}/{text_confidence_key}",
            "image_uri": f"s3://{output_bucket}/{image_key}",
        }

        return result, metering

    def _process_single_page_none(
        self,
        page_index: int,
        pdf_document: fitz.Document,
        output_bucket: str,
        prefix: str,
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Process a single page with no OCR (image-only processing).

        Args:
            page_index: Zero-based index of the page
            pdf_document: PyMuPDF document object
            output_bucket: S3 bucket to store results
            prefix: S3 prefix for storing results

        Returns:
            Tuple of (page_result_dict, metering_data)
        """
        t0 = time.time()
        page_id = page_index + 1

        # Extract page image at specified DPI (consistent with other backends)
        page = pdf_document.load_page(page_index)
        img_bytes = self._extract_page_image(page, pdf_document.is_pdf, page_id)

        # Upload image to S3
        image_key = f"{prefix}/pages/{page_id}/image.jpg"
        s3.write_content(img_bytes, output_bucket, image_key, content_type="image/jpeg")

        t1 = time.time()
        logger.debug(
            f"Time for image conversion (page {page_id}): {t1 - t0:.6f} seconds"
        )

        # Create empty OCR response structure for compatibility
        empty_ocr_response = {"DocumentMetadata": {"Pages": 1}, "Blocks": []}

        # Store empty raw OCR response
        raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
        s3.write_content(
            empty_ocr_response,
            output_bucket,
            raw_text_key,
            content_type="application/json",
        )

        # Generate minimal text confidence data (empty markdown table)
        text_confidence_data = {
            "text": "| Text | Confidence |\n|:-----|:------------|\n| *No OCR performed* | N/A |"
        }

        text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
        s3.write_content(
            text_confidence_data,
            output_bucket,
            text_confidence_key,
            content_type="application/json",
        )

        # Store empty parsed text result
        parsed_result = {"text": ""}
        parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
        s3.write_content(
            parsed_result,
            output_bucket,
            parsed_text_key,
            content_type="application/json",
        )

        t2 = time.time()
        logger.debug(
            f"Time for image-only processing (page {page_id}): {t2 - t1:.6f} seconds"
        )

        # No metering data for image-only processing
        metering = {}

        # Create and return page result
        result = {
            "raw_text_uri": f"s3://{output_bucket}/{raw_text_key}",
            "parsed_text_uri": f"s3://{output_bucket}/{parsed_text_key}",
            "text_confidence_uri": f"s3://{output_bucket}/{text_confidence_key}",
            "image_uri": f"s3://{output_bucket}/{image_key}",
        }

        return result, metering

    def _analyze_document(
        self, document_bytes: bytes, page_id: int = None
    ) -> Dict[str, Any]:
        """
        Analyze document using enhanced Textract features.

        Args:
            document_bytes: Binary content of the document image
            page_id: Optional page number for logging purposes

        Returns:
            Textract API response
        """
        # Use specified feature types
        # Valid types are TABLES, FORMS, SIGNATURES, and LAYOUT
        # Note: QUERIES is not supported as it requires additional parameters

        # Features are already validated in __init__, so we can use them directly
        page_info = f" for page {page_id}" if page_id else ""
        logger.debug(
            f"Analyzing document{page_info} with features: {self.enhanced_features}"
        )

        try:
            response = self.textract_client.analyze_document(
                Document={"Bytes": document_bytes}, FeatureTypes=self.enhanced_features
            )

            # Log the types of response blocks received
            if logger.isEnabledFor(logging.DEBUG):
                block_types = {}
                for block in response.get("Blocks", []):
                    block_type = block.get("BlockType")
                    if block_type not in block_types:
                        block_types[block_type] = 0
                    block_types[block_type] += 1
                logger.debug(f"Received response with block types: {block_types}")

            return response

        except Exception as e:
            import traceback

            page_info = f" for page {page_id}" if page_id else ""
            logger.error(
                f"Error in _analyze_document{page_info} with features {self.enhanced_features}: {str(e)}\nStack trace:\n{traceback.format_exc()}"
            )
            raise

    def _get_api_name(self) -> str:
        """Get the name of the Textract API being used."""
        # If enhanced_features is a non-empty list, we're using analyze_document
        # Otherwise, we're using detect_document_text
        return (
            "analyze_document"
            if isinstance(self.enhanced_features, list) and self.enhanced_features
            else "detect_document_text"
        )

    def _generate_text_confidence_data(
        self, raw_ocr_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate text confidence data from raw OCR to reduce token usage while preserving essential information.

        This method transforms verbose Textract output into a markdown table format containing:
        - Essential text content (LINE blocks only)
        - OCR confidence scores (rounded to 1 decimal point)

        Removes geometric data, relationships, block IDs, and other verbose metadata
        that aren't needed for assessment purposes.

        Args:
            raw_ocr_data: Raw Textract API response

        Returns:
            Text confidence data as markdown table with ~80-90% token reduction
        """
        # Start building the markdown table with explicit left alignment
        markdown_lines = ["| Text | Confidence |", "|:-----|:-----------|"]

        blocks = raw_ocr_data.get("Blocks", [])

        for block in blocks:
            if block.get("BlockType") == "LINE" and block.get("Text"):
                text = block.get("Text", "").replace(
                    "|", "\\|"
                )  # Escape pipe characters
                confidence = round(block.get("Confidence", 0.0), 1)

                # Add text type indicator if it's handwriting
                if block.get("TextType") == "HANDWRITING":
                    markdown_lines.append(f"| {text} (HANDWRITING) | {confidence} |")
                else:
                    markdown_lines.append(f"| {text} | {confidence} |")

        # Join all lines into a single markdown string
        markdown_table = "\n".join(markdown_lines)

        return {"text": markdown_table}

    def _parse_textract_response(
        self, response: Dict[str, Any], page_id: int = None
    ) -> Dict[str, str]:
        """
        Parse Textract response into text.

        Args:
            response: Raw Textract API response
            page_id: Optional page number for logging purposes

        Returns:
            Dictionary with 'text' key containing extracted text
        """
        from textractor.parsers import response_parser

        # Create page identifier for logging
        page_info = f" for page {page_id}" if page_id else ""

        # Log enhanced features at debug level
        logger.debug(f"Enhanced features{page_info}: {self.enhanced_features}")

        try:
            # Parse the response with textractor - debug level
            logger.debug(f"Parsing Textract response{page_info} with textractor")
            parsed_response = response_parser.parse(response)

            try:
                # First try to convert to markdown
                text = parsed_response.to_markdown()
                logger.info(f"Successfully extracted markdown text{page_info}")
            except Exception as e:
                # If markdown conversion fails, use plain text instead
                logger.warning(f"Markdown conversion failed{page_info}: {str(e)}")

                # Identify if it's a known issue - keep these as warnings
                if "reading_order" in str(e):
                    if "Signature" in str(e):
                        logger.warning(
                            f"Detected Signature object error{page_info} with SIGNATURES feature"
                        )
                    elif "KeyValue" in str(e):
                        logger.warning(
                            f"Detected KeyValue object error{page_info} with FORMS feature"
                        )

                # Use plain text instead
                logger.warning(f"Falling back to plain text extraction{page_info}")
                text = parsed_response.text
                logger.info(f"Successfully extracted plain text{page_info}")

        except Exception as e:
            # If parsing completely fails, extract text directly from blocks
            logger.warning(f"Textractor parsing failed{page_info}: {str(e)}")

            # Simple extraction from LINE blocks as final fallback
            logger.warning(
                f"Falling back to basic text extraction from blocks{page_info}"
            )
            blocks = response.get("Blocks", [])

            text_lines = []
            for block in blocks:
                if block.get("BlockType") == "LINE" and "Text" in block:
                    text_lines.append(block["Text"])

            text = "\n".join(text_lines)
            if not text:
                text = f"Error extracting text from document{page_info}. No text content found."
                logger.error(f"No text content found in document{page_info}")
            else:
                logger.info(f"Successfully extracted basic text{page_info}")

        return {"text": text}

    def _detect_file_type(self, filename: str, content: bytes) -> str:
        """
        Detect file type based on filename extension and content.

        Args:
            filename: Name of the file
            content: File content bytes

        Returns:
            File type string
        """
        # Get file extension
        ext = filename.lower().split(".")[-1] if "." in filename else ""

        # Check for specific document types
        if ext == "txt":
            return "txt"
        elif ext == "csv":
            return "csv"
        elif ext in ["xlsx", "xls"]:
            return "xlsx"
        elif ext in ["docx", "doc"]:
            return "docx"
        elif ext in ["pdf"]:
            return "pdf"
        elif ext in ["jpg", "jpeg", "png", "gif", "bmp", "tiff", "tif", "webp"]:
            return ext
        else:
            # Try to detect based on content
            if content.startswith(b"%PDF"):
                return "pdf"
            elif content.startswith(b"PK"):
                # Could be Excel or Word (both are ZIP-based)
                if b"xl/" in content[:1000]:
                    return "xlsx"
                elif b"word/" in content[:1000]:
                    return "docx"

            # Default to treating as text if we can decode it
            try:
                content.decode("utf-8")
                return "txt"
            except UnicodeDecodeError:
                pass

            # Default to PDF for unknown binary files
            return "pdf"

    def _process_non_pdf_document(
        self, file_type: str, content: bytes
    ) -> List[Tuple[bytes, str]]:
        """
        Process non-PDF documents and convert to pages.

        Args:
            file_type: Type of the file
            content: File content bytes

        Returns:
            List of tuples (image_bytes, page_text)
        """
        try:
            if file_type == "txt":
                text_content = content.decode("utf-8")
                return self.document_converter.convert_text_to_pages(text_content)

            elif file_type == "csv":
                text_content = content.decode("utf-8")
                return self.document_converter.convert_csv_to_pages(text_content)

            elif file_type == "xlsx":
                return self.document_converter.convert_excel_to_pages(content)

            elif file_type == "docx":
                return self.document_converter.convert_word_to_pages(content)

            else:
                # Fallback to text
                try:
                    text_content = content.decode("utf-8")
                    return self.document_converter.convert_text_to_pages(text_content)
                except UnicodeDecodeError:
                    return [
                        (
                            self.document_converter._create_empty_page(),
                            "Error: Unable to process file",
                        )
                    ]

        except Exception as e:
            logger.error(f"Error processing {file_type} document: {str(e)}")
            return [
                (
                    self.document_converter._create_empty_page(),
                    f"Error processing {file_type} document",
                )
            ]

    def _process_converted_page(
        self,
        page_index: int,
        image_bytes: bytes,
        page_text: str,
        output_bucket: str,
        prefix: str,
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Process a converted page (from non-PDF document).

        Args:
            page_index: Zero-based index of the page
            image_bytes: Page image bytes
            page_text: Extracted text for the page
            output_bucket: S3 bucket to store results
            prefix: S3 prefix for storing results

        Returns:
            Tuple of (page_result_dict, metering_data)
        """
        t0 = time.time()
        page_id = page_index + 1

        # Upload image to S3
        image_key = f"{prefix}/pages/{page_id}/image.jpg"
        s3.write_content(
            image_bytes, output_bucket, image_key, content_type="image/jpeg"
        )

        # Create OCR response structure for compatibility
        ocr_response = {
            "DocumentMetadata": {"Pages": 1},
            "Blocks": [
                {
                    "BlockType": "LINE",
                    "Text": line,
                    "Confidence": 99.0,
                    "TextType": "PRINTED",
                }
                for line in page_text.split("\n")
                if line.strip()
            ],
        }

        # Store raw OCR response
        raw_text_key = f"{prefix}/pages/{page_id}/rawText.json"
        s3.write_content(
            ocr_response,
            output_bucket,
            raw_text_key,
            content_type="application/json",
        )

        # Generate text confidence data as markdown table with explicit left alignment
        markdown_lines = ["| Text | Confidence |", "|:-----|:-----------|"]
        for line in page_text.split("\n"):
            if line.strip():
                # Escape pipe characters in text
                escaped_line = line.replace("|", "\\|")
                markdown_lines.append(f"| {escaped_line} | 99.0 |")

        markdown_table = "\n".join(markdown_lines)
        text_confidence_data = {"text": markdown_table}

        text_confidence_key = f"{prefix}/pages/{page_id}/textConfidence.json"
        s3.write_content(
            text_confidence_data,
            output_bucket,
            text_confidence_key,
            content_type="application/json",
        )

        # Store parsed text result
        parsed_result = {"text": page_text}
        parsed_text_key = f"{prefix}/pages/{page_id}/result.json"
        s3.write_content(
            parsed_result,
            output_bucket,
            parsed_text_key,
            content_type="application/json",
        )

        t1 = time.time()
        logger.debug(
            f"Time for converted page processing (page {page_id}): {t1 - t0:.6f} seconds"
        )

        # Minimal metering for converted documents
        metering = {"OCR/converted/document_conversion": {"pages": 1}}

        # Create and return page result
        result = {
            "raw_text_uri": f"s3://{output_bucket}/{raw_text_key}",
            "parsed_text_uri": f"s3://{output_bucket}/{parsed_text_key}",
            "text_confidence_uri": f"s3://{output_bucket}/{text_confidence_key}",
            "image_uri": f"s3://{output_bucket}/{image_key}",
        }

        return result, metering
