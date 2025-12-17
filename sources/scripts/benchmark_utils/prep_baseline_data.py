#!/usr/bin/env python3
"""
Convert FCC Invoices JSONL ground truth to IDP Accelerator evaluation format.

This script reads a JSONL file containing ground truth labels for FCC invoices
and converts it to the IDP Accelerator's evaluation baseline format.

Input Format:
    - JSONL file with objects containing 'document_path' and 'labels' fields
    - 'labels' is a JSON string containing the ground truth data

Output Format:
    - Creates directory structure: <base_path>/<doc_id>/sections/1/result.json
    - Each result.json contains: {"inference_result": <parsed_labels>}

Usage:
    python prep_baseline_data.py [--input INPUT] [--output OUTPUT] [--dry-run] [--overwrite]

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
"""

import json
import os
import argparse
import shutil
from pathlib import Path
from typing import Dict, Any, Tuple, List
import sys


class BaselineProcessor:
    """Process JSONL ground truth data into IDP Accelerator baseline format."""

    def __init__(self, input_file: str, output_base_path: str, dry_run: bool = False, overwrite: bool = False):
        """
        Initialize the baseline processor.

        Args:
            input_file: Path to the input JSONL file
            output_base_path: Base directory for output baseline files
            dry_run: If True, simulate processing without creating files
            overwrite: If True, overwrite existing baseline files
        """
        self.input_file = Path(input_file)
        self.output_base_path = Path(output_base_path)
        self.dry_run = dry_run
        self.overwrite = overwrite
        
        # Statistics
        self.stats = {
            'total': 0,
            'processed': 0,
            'skipped': 0,
            'failed': 0,
            'duplicate_doc_ids': [],
            'documents_copied': 0,
            'documents_missing': 0,
            'documents_failed': 0
        }
        self.seen_doc_ids = set()
        self.errors: List[Tuple[int, str, str]] = []
        self.missing_documents: List[Tuple[int, str]] = []

    def copy_source_document(self, document_path: str) -> bool:
        """
        Copy source document from artifacts directory to accelerator directory.

        Args:
            document_path: Path like "fcc_invoices/files/filename.pdf"

        Returns:
            True if document was copied, False if skipped or failed
        """
        # Source and destination paths
        source_path = Path("scratch/fcc_input_for_reannotation/artifacts") / document_path
        dest_path = Path("scratch/accelerator") / document_path

        # Check if source exists
        if not source_path.exists():
            if not self.dry_run:
                print(f"  ⚠️  Source document not found: {source_path}")
            self.stats['documents_missing'] += 1
            self.missing_documents.append((self.stats['total'], str(source_path)))
            return False

        # Check if destination already exists
        if dest_path.exists() and not self.overwrite:
            return False

        if self.dry_run:
            print(f"  [DRY RUN] Would copy: {source_path} -> {dest_path}")
            self.stats['documents_copied'] += 1
            return True

        try:
            # Create destination directory
            dest_path.parent.mkdir(parents=True, exist_ok=True)

            # Copy the file
            shutil.copy2(source_path, dest_path)
            self.stats['documents_copied'] += 1
            return True

        except Exception as e:
            print(f"  ❌ Failed to copy document: {str(e)}")
            self.stats['documents_failed'] += 1
            return False

    def extract_doc_id(self, document_path: str) -> str:
        """
        Extract filename (doc_id) from document path.

        Args:
            document_path: Full path like "fcc_invoices/files/filename.pdf"

        Returns:
            Just the filename, e.g., "filename.pdf"
        """
        return os.path.basename(document_path)

    def parse_labels(self, labels_str: str) -> Dict[str, Any]:
        """
        Parse JSON string labels into Python dict.

        Args:
            labels_str: JSON string containing the labels

        Returns:
            Parsed labels as a dictionary

        Raises:
            json.JSONDecodeError: If labels_str is not valid JSON
        """
        return json.loads(labels_str)

    def create_baseline_file(self, doc_id: str, labels: Dict[str, Any]) -> bool:
        """
        Create the directory structure and result.json file for a document.

        Directory structure created:
            <output_base_path>/<doc_id>/sections/1/result.json

        Args:
            doc_id: Document identifier (filename)
            labels: Parsed labels dictionary

        Returns:
            True if file was created, False if skipped or failed
        """
        # Create the full path
        doc_dir = self.output_base_path / doc_id / "sections" / "1"
        result_file = doc_dir / "result.json"

        # Check if file already exists
        if result_file.exists() and not self.overwrite:
            if not self.dry_run:
                print(f"  ⚠️  Skipping {doc_id} (file already exists)")
            self.stats['skipped'] += 1
            return False

        # Prepare the output structure
        output_data = {
            "inference_result": labels
        }

        if self.dry_run:
            print(f"  [DRY RUN] Would create: {result_file}")
            self.stats['processed'] += 1
            return True

        try:
            # Create directories
            doc_dir.mkdir(parents=True, exist_ok=True)

            # Write the result.json file
            with open(result_file, 'w', encoding='utf-8') as f:
                json.dump(output_data, f, indent=2, ensure_ascii=False)

            print(f"  ✅ Created: {doc_id}")
            self.stats['processed'] += 1
            return True

        except Exception as e:
            print(f"  ❌ Failed to create {doc_id}: {str(e)}")
            self.stats['failed'] += 1
            return False

    def process_jsonl_file(self) -> bool:
        """
        Main processing function to read JSON array and create baseline files.

        Returns:
            True if processing completed successfully (even with some errors)
            False if fatal error occurred
        """
        # Validate input file exists
        if not self.input_file.exists():
            print(f"❌ Error: Input file not found: {self.input_file}")
            return False

        print(f"\n{'='*80}")
        print(f"Processing: {self.input_file}")
        print(f"Output to: {self.output_base_path}")
        print(f"Mode: {'DRY RUN' if self.dry_run else 'LIVE'}")
        print(f"Overwrite: {'Yes' if self.overwrite else 'No'}")
        print(f"{'='*80}\n")

        # Load the entire JSON array
        try:
            print("Loading JSON file...")
            with open(self.input_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not isinstance(data, list):
                print(f"❌ Error: Expected JSON array, got {type(data).__name__}")
                return False
            
            print(f"Loaded {len(data)} records\n")
            
            # Process each record in the array
            for idx, record in enumerate(data, 1):
                self.stats['total'] += 1
                
                try:

                    # Extract required fields
                    if 'document_path' not in record:
                        error_msg = "Missing 'document_path' field"
                        self.errors.append((idx, "N/A", error_msg))
                        self.stats['failed'] += 1
                        print(f"  ❌ Record {idx}: {error_msg}")
                        continue

                    if 'labels' not in record:
                        error_msg = "Missing 'labels' field"
                        doc_id = self.extract_doc_id(record['document_path'])
                        self.errors.append((idx, doc_id, error_msg))
                        self.stats['failed'] += 1
                        print(f"  ❌ Record {idx} ({doc_id}): {error_msg}")
                        continue

                    # Extract doc_id and labels
                    doc_id = self.extract_doc_id(record['document_path'])
                    document_path = record['document_path']
                    
                    # Check for duplicate doc_ids
                    if doc_id in self.seen_doc_ids:
                        self.stats['duplicate_doc_ids'].append((idx, doc_id))
                        print(f"  ⚠️  Warning: Duplicate doc_id '{doc_id}' at record {idx}")
                    self.seen_doc_ids.add(doc_id)

                    # Parse labels (it's a JSON string)
                    labels = self.parse_labels(record['labels'])

                    # Copy source document to accelerator directory
                    self.copy_source_document(document_path)

                    # Create the baseline file
                    self.create_baseline_file(doc_id, labels)

                    # Progress indicator
                    if self.stats['total'] % 100 == 0:
                        print(f"\n  Progress: {self.stats['total']} documents processed...")

                except json.JSONDecodeError as e:
                    error_msg = f"Labels JSON decode error: {str(e)}"
                    try:
                        doc_id = record.get('document_path', 'unknown')
                        if 'document_path' in record:
                            doc_id = self.extract_doc_id(doc_id)
                    except:
                        doc_id = 'unknown'
                    self.errors.append((idx, doc_id, error_msg))
                    self.stats['failed'] += 1
                    print(f"  ❌ Record {idx}: {error_msg}")

                except Exception as e:
                    error_msg = f"Unexpected error: {str(e)}"
                    try:
                        doc_id = record.get('document_path', 'unknown')
                        if 'document_path' in record:
                            doc_id = self.extract_doc_id(doc_id)
                    except:
                        doc_id = 'unknown'
                    self.errors.append((idx, doc_id, error_msg))
                    self.stats['failed'] += 1
                    print(f"  ❌ Record {idx}: {error_msg}")

        except Exception as e:
            print(f"\n❌ Fatal error reading input file: {str(e)}")
            return False

        return True

    def print_summary(self):
        """Print a summary of the processing results."""
        print(f"\n{'='*80}")
        print("PROCESSING SUMMARY")
        print(f"{'='*80}")
        print(f"Total documents in file:     {self.stats['total']}")
        print(f"Successfully processed:      {self.stats['processed']}")
        print(f"Skipped (already exist):     {self.stats['skipped']}")
        print(f"Failed:                      {self.stats['failed']}")
        print(f"Unique doc_ids:              {len(self.seen_doc_ids)}")
        print(f"\nDocument Copy Statistics:")
        print(f"Documents copied:            {self.stats['documents_copied']}")
        print(f"Source documents missing:    {self.stats['documents_missing']}")
        print(f"Document copy failed:        {self.stats['documents_failed']}")

        if self.stats['duplicate_doc_ids']:
            print(f"\n⚠️  Duplicate doc_ids found: {len(self.stats['duplicate_doc_ids'])}")
            for line_num, doc_id in self.stats['duplicate_doc_ids']:
                print(f"   - Line {line_num}: {doc_id}")

        if self.errors:
            print(f"\n❌ Errors encountered: {len(self.errors)}")
            print("\nFirst 10 errors:")
            for line_num, doc_id, error_msg in self.errors[:10]:
                print(f"   - Line {line_num} ({doc_id}): {error_msg}")
            if len(self.errors) > 10:
                print(f"   ... and {len(self.errors) - 10} more errors")

        success_rate = (self.stats['processed'] / self.stats['total'] * 100) if self.stats['total'] > 0 else 0
        print(f"\nSuccess rate: {success_rate:.1f}%")
        print(f"{'='*80}\n")

    def validate_created_files(self, sample_size: int = 5) -> bool:
        """
        Validate a sample of created files can be read back.

        Args:
            sample_size: Number of files to validate

        Returns:
            True if validation passed, False otherwise
        """
        if self.dry_run or self.stats['processed'] == 0:
            return True

        print(f"\nValidating {min(sample_size, self.stats['processed'])} sample files...")

        validated = 0
        for doc_id in list(self.seen_doc_ids)[:sample_size]:
            result_file = self.output_base_path / doc_id / "sections" / "1" / "result.json"
            
            if not result_file.exists():
                continue

            try:
                with open(result_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Check structure
                if 'inference_result' not in data:
                    print(f"  ❌ Invalid structure in {doc_id}/sections/1/result.json")
                    return False
                    
                validated += 1
                print(f"  ✅ Validated: {doc_id}")

            except Exception as e:
                print(f"  ❌ Failed to validate {doc_id}: {str(e)}")
                return False

        print(f"\n✅ Validation passed: {validated} files validated successfully")
        return True


def main():
    """Main entry point for the script."""
    parser = argparse.ArgumentParser(
        description="Convert FCC Invoices JSONL ground truth to IDP Accelerator evaluation format",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Process with default paths
  python prep_baseline_data.py

  # Dry run to preview what would be created
  python prep_baseline_data.py --dry-run

  # Custom input and output paths
  python prep_baseline_data.py --input data/ground_truth.jsonl --output baseline/

  # Overwrite existing files
  python prep_baseline_data.py --overwrite

Default paths:
  Input:  scratch/fcc_invoices_reann_standardized_val_fixed_v0.jsonl
  Output: scratch/accelerator/fcc_invoices/evaluation_baseline/
        """
    )

    parser.add_argument(
        '--input',
        type=str,
        default='scratch/fcc_invoices_reann_standardized_val_fixed_v0.jsonl',
        help='Path to input JSONL file (default: scratch/fcc_invoices_reann_standardized_val_fixed_v0.jsonl)'
    )

    parser.add_argument(
        '--output',
        type=str,
        default='scratch/accelerator/fcc_invoices/evaluation_baseline',
        help='Base path for output baseline files (default: scratch/accelerator/fcc_invoices/evaluation_baseline)'
    )

    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Simulate processing without creating files'
    )

    parser.add_argument(
        '--overwrite',
        action='store_true',
        help='Overwrite existing baseline files'
    )

    parser.add_argument(
        '--validate',
        action='store_true',
        default=True,
        help='Validate created files after processing (default: True)'
    )

    parser.add_argument(
        '--no-validate',
        dest='validate',
        action='store_false',
        help='Skip validation of created files'
    )

    args = parser.parse_args()

    # Create processor instance
    processor = BaselineProcessor(
        input_file=args.input,
        output_base_path=args.output,
        dry_run=args.dry_run,
        overwrite=args.overwrite
    )

    # Process the file
    success = processor.process_jsonl_file()

    # Print summary
    processor.print_summary()

    # Validate created files
    if args.validate and success and not args.dry_run:
        validation_passed = processor.validate_created_files()
        if not validation_passed:
            print("\n⚠️  Validation failed. Please check the output files.")
            sys.exit(1)

    # Exit with appropriate code
    if not success or processor.stats['failed'] > 0:
        print("\n⚠️  Processing completed with errors.")
        sys.exit(1)

    print("\n✅ Processing completed successfully!")
    sys.exit(0)


if __name__ == "__main__":
    main()
