# Benchmark Utilities

This directory contains utility scripts for working with benchmark and evaluation datasets.

## prep_baseline_data.py

Convert ground truth data from JSONL format to IDP Accelerator evaluation baseline format.

### Purpose

This script processes JSONL files containing document ground truth labels and converts them into the directory structure required by the IDP Accelerator's evaluation framework.

### Input Format

JSONL file where each line contains:
```json
{
  "document_path": "path/to/document.pdf",
  "labels": "{\"field1\": \"value1\", \"field2\": \"value2\", ...}"
}
```

### Output Format

Creates the following directory structure:
```
<output_base_path>/
├── document1.pdf/
│   └── sections/
│       └── 1/
│           └── result.json
├── document2.pdf/
│   └── sections/
│       └── 1/
│           └── result.json
...
```

Where each `result.json` contains:
```json
{
  "inference_result": {
    "field1": "value1",
    "field2": "value2",
    ...
  }
}
```

### Usage

#### Basic Usage (Default Paths)
```bash
python prep_baseline_data.py
```

Default paths:
- **Input**: `scratch/fcc_invoices_reann_standardized_val_fixed_v0.jsonl`
- **Output**: `scratch/accelerator/fcc_invoices/evaluation_baseline/`

#### Dry Run (Preview Only)
```bash
python prep_baseline_data.py --dry-run
```

#### Custom Paths
```bash
python prep_baseline_data.py \
  --input path/to/your/ground_truth.jsonl \
  --output path/to/output/baseline/
```

#### Overwrite Existing Files
```bash
python prep_baseline_data.py --overwrite
```

#### Skip Validation
```bash
python prep_baseline_data.py --no-validate
```

### Command-Line Options

| Option | Description | Default |
|--------|-------------|---------|
| `--input PATH` | Path to input JSONL file | `scratch/fcc_invoices_reann_standardized_val_fixed_v0.jsonl` |
| `--output PATH` | Base path for output baseline files | `scratch/accelerator/fcc_invoices/evaluation_baseline` |
| `--dry-run` | Simulate processing without creating files | False |
| `--overwrite` | Overwrite existing baseline files | False |
| `--validate` | Validate created files after processing | True |
| `--no-validate` | Skip validation of created files | - |

### Features

- **Error Handling**: Gracefully handles malformed JSON, missing fields, and file system errors
- **Duplicate Detection**: Warns about duplicate document IDs in the input file
- **Progress Tracking**: Shows progress every 100 documents processed
- **Validation**: Automatically validates a sample of created files
- **Statistics**: Provides detailed summary of processing results
- **Dry Run Mode**: Preview what would be created without writing files

### Output Summary

After processing, the script displays a summary including:
- Total documents processed
- Successfully created files
- Skipped files (if not overwriting)
- Failed operations
- Duplicate document IDs
- Error details
- Success rate

Example output:
```
================================================================================
PROCESSING SUMMARY
================================================================================
Total documents in file:     150
Successfully processed:      148
Skipped (already exist):     0
Failed:                      2
Unique doc_ids:              148

Success rate: 98.7%
================================================================================
```

### Error Handling

The script handles various error scenarios:
- **Missing input file**: Exits with clear error message
- **Malformed JSON**: Logs line number and continues processing
- **Missing required fields**: Logs error and skips document
- **File system errors**: Logs error and continues with remaining documents
- **Duplicate document IDs**: Warns but continues processing

### Exit Codes

- `0`: Success (all documents processed without errors)
- `1`: Failure (fatal error or some documents failed)

### Examples

#### Process with default paths and see detailed output
```bash
python prep_baseline_data.py
```

#### Test the script without creating files
```bash
python prep_baseline_data.py --dry-run
```

#### Process a different dataset
```bash
python prep_baseline_data.py \
  --input data/invoice_labels.jsonl \
  --output baseline/invoices/
```

#### Force overwrite of existing baseline files
```bash
python prep_baseline_data.py --overwrite
```

### Integration with IDP Accelerator

Once baseline files are created, use them with the IDP Accelerator evaluation framework:

1. Upload the baseline directory to your evaluation S3 bucket
2. Configure the evaluation framework to use this baseline
3. Process documents through the IDP pipeline
4. View evaluation reports comparing results to baseline

See `docs/evaluation.md` for more details on the evaluation framework.

### Troubleshooting

**Problem**: Script fails with "Input file not found"
- **Solution**: Verify the input file path is correct

**Problem**: Permission denied when creating files
- **Solution**: Ensure you have write permissions to the output directory

**Problem**: Out of memory errors
- **Solution**: The script processes line-by-line and should handle large files. If issues persist, split the input file into smaller chunks.

**Problem**: Validation fails
- **Solution**: Check the error messages for specific files, then inspect the result.json files manually

### License

Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0
