# Test Studio

The Test Studio provides a comprehensive interface for managing test sets, running tests, and analyzing results directly from the web UI.

## Overview

The Test Studio consists of two main tabs:
1. **Test Sets**: Create and manage reusable collections of test documents
2. **Test Executions**: Execute tests, view results, and compare test runs

## Pre-Deployed Test Set: RealKIE-FCC-Verified

The accelerator automatically deploys the **RealKIE-FCC-Verified** dataset from HuggingFace (https://huggingface.co/datasets/amazon-agi/RealKIE-FCC-Verified) as a ready-to-use test set during stack deployment. This public dataset contains 75 invoice documents sourced from the Federal Communications Commission (FCC).

### Fully Automatic Deployment

During stack deployment, the system automatically:

1. **Downloads Dataset** from HuggingFace (75 documents)
2. **Reconstructs PDFs** from PNG page images using lossless img2pdf conversion
3. **Uploads PDFs** to `s3://TestSetBucket/realkie-fcc-verified/input/`
4. **Extracts Ground Truth** from `json_response` field (already in accelerator format!)
5. **Uploads Baselines** to `s3://TestSetBucket/realkie-fcc-verified/baseline/`
6. **Registers Test Set** in DynamoDB with metadata

**Zero Manual Steps Required** - Everything is sourced from the public HuggingFace dataset and deployed automatically.

### Key Features

- **Fully Automatic**: Complete deployment during stack creation with zero user effort
- **PDF Reconstruction**: Converts PNG page images to PDF documents using img2pdf for lossless quality
- **Complete Ground Truth**: Structured invoice attributes (Agency, Advertiser, GrossTotal, PaymentTerms, AgencyCommission, NetAmountDue, LineItems)
- **Version Control**: Dataset version pinned in CloudFormation (DatasetVersion: "1.0"), updateable via parameter
- **Smart Updates**: Skips re-download on stack updates unless version changes
- **Single Public Source**: Everything from HuggingFace - fully reproducible anywhere
- **Benchmark Ready**: 75 FCC invoice documents ideal for extraction evaluation

### Deployment Time

- **First Deployment**: Adds ~5-10 minutes to stack deployment (downloads dataset + converts images)
- **Stack Updates**: Near-instant (skips if version unchanged)
- **Version Updates**: Re-downloads and re-processes when DatasetVersion changes

### Usage

The RealKIE-FCC-Verified test set is immediately available after stack deployment:

1. Navigate to **Test Executions** tab
2. Select "RealKIE-FCC-Verified" from the **Select Test Set** dropdown
3. Enter a description in the **Context** field
4. Click **Run Test** to start processing
5. Monitor progress and view results when complete

This dataset provides an excellent benchmark for:
- Evaluating extraction accuracy on invoice documents
- Comparing different model configurations
- Testing prompt engineering improvements
- Training and demonstration purposes


https://github.com/user-attachments/assets/7c5adf30-8d5c-4292-93b0-0149506322c7


## Architecture

### Backend Components

#### TestSetResolver Lambda
- **Location**: `src/lambda/test_set_resolver/index.py`
- **Purpose**: Handles GraphQL operations for test set management
- **Features**: Creates test sets, scans TestSetBucket for direct uploads, validates file matching, manages test set status

#### TestSetZipExtractor Lambda
- **Location**: `src/lambda/test_set_zip_extractor/index.py`
- **Purpose**: Extracts and validates uploaded zip files
- **Features**: S3 event triggered extraction, file validation, status updates

#### TestRunner Lambda
- **Location**: `src/lambda/test_runner/index.py`
- **Purpose**: Initiates test runs and queues file processing jobs
- **Features**: Test validation, SQS message queuing, fast response optimization

#### TestFileCopier Lambda
- **Location**: `src/lambda/test_file_copier/index.py`
- **Purpose**: Handles asynchronous file copying and processing initiation
- **Features**: SQS message processing, file copying, status management

#### TestResultsResolver Lambda
- **Location**: `src/lambda/test_results_resolver/index.py`
- **Purpose**: Handles GraphQL queries for test results and comparisons, plus asynchronous cache updates
- **Features**: 
  - Result retrieval with cached metrics
  - Comparison logic and metrics aggregation
  - Dual event handling (GraphQL + SQS)
  - Asynchronous cache update processing
  - Progress-aware status updates

#### TestResultCacheUpdateQueue
- **Type**: AWS SQS Queue
- **Purpose**: Decouples heavy metric calculations from synchronous API calls
- **Features**: 
  - Encrypted message storage
  - 15-minute visibility timeout for long-running calculations
  - Automatic retry handling

### GraphQL Schema
- **Location**: `src/api/schema.graphql`
- **Operations**: `getTestSets`, `addTestSet`, `addTestSetFromUpload`, `deleteTestSets`, `getTestRuns`, `startTestRun`, `compareTestRuns`

### Frontend Components

#### TestStudioLayout
- **Location**: `src/ui/src/components/test-studio/TestStudioLayout.jsx`
- **Purpose**: Main container with two-tab navigation and global state management

#### TestSets
- **Location**: `src/ui/src/components/test-studio/TestSets.jsx`
- **Purpose**: Manage test set collections
- **Features**: Pattern-based creation, zip upload, direct upload detection, dual polling (3s active, 30s discovery)

#### TestExecutions
- **Location**: `src/ui/src/components/test-studio/TestExecutions.jsx`
- **Purpose**: Unified interface combining TestRunner and TestResultsList
- **Features**: Test execution, results viewing, comparison, export, delete operations

## Component Structure

```
components/
└── test-studio/
    ├── TestStudioLayout.jsx
    ├── TestSets.jsx
    ├── TestExecutions.jsx
    ├── TestRunner.jsx
    ├── TestResultsList.jsx
    ├── TestResults.jsx
    ├── TestComparison.jsx
    ├── TestRunnerStatus.jsx
    ├── DeleteTestModal.jsx
    └── index.js
```

## Test Sets

### Creating Test Sets
1. **Pattern-based**: Define file patterns (e.g., `*.pdf`) with bucket type selection
   - **Input Bucket**: Scan main processing bucket for matching files
   - **Test Set Bucket**: Scan dedicated test set bucket for matching files
2. **Zip Upload**: Upload zip containing `input/` and `baseline/` folders
3. **Direct Upload**: Files uploaded directly to TestSetBucket are auto-detected

### File Structure Requirements
```
my-test-set/
├── input/
│   ├── document1.pdf
│   └── document2.pdf
└── baseline/
    ├── document1.pdf/
    │   └── [ground truth files]
    └── document2.pdf/
        └── [ground truth files]
```

### Validation Rules
- Each input file must have corresponding baseline folder
- Baseline folder name must match input filename exactly
- Status: COMPLETED (valid), FAILED (validation errors), PROCESSING (uploading)

### Upload Methods
1. **UI Zip Upload**: S3 event → Lambda extraction → Validation → Status update
2. **Direct S3 Upload**: Detected via refresh button or automatic polling

## Test Executions

### Running Tests
1. Select test set from dropdown
2. Click "Run Test" (single test execution only)
3. Monitor progress via TestRunnerStatus
4. View results in integrated listing

### Test States
- **QUEUED**: File copying jobs queued in SQS
- **RUNNING**: Files being copied and processed
- **COMPLETED**: Test finished successfully
- **FAILED**: Errors during processing

### Results Management
- Filter and paginate test runs
- Multi-select for comparison
- Navigate to detailed results view
- Delete and export functionality

## Key Features

### Test Set Management
- Reusable collections with file patterns across multiple buckets
- Dual bucket support (Input Bucket and Test Set Bucket)
- Zip upload with automatic extraction
- Direct upload detection via dual polling
- File structure validation with error reporting

### Test Execution
- Single test concurrency prevention
- Real-time status monitoring
- Global state persistence across navigation
- SQS-based asynchronous processing

### Results Analysis
- Comprehensive metrics display
- Side-by-side test comparison
- Export capabilities
- Integrated delete operations
