# Reporting Environment Example

This example demonstrates how to enable the reporting functionality in the GenAI IDP CDK constructs.

## Basic Usage

```typescript
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';
import { ProcessingEnvironment, ReportingEnvironment } from '@cdklabs/genai-idp';

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyIdpStack');

// Create S3 buckets
const inputBucket = new s3.Bucket(stack, 'InputBucket');
const outputBucket = new s3.Bucket(stack, 'OutputBucket');

// Create reporting bucket with lifecycle policies
const reportingBucket = new s3.Bucket(stack, 'ReportingBucket', {
  encryption: s3.BucketEncryption.S3_MANAGED,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  versioned: true,
  lifecycleRules: [
    {
      id: 'DeleteAfterOneYear',
      enabled: true,
      expiration: cdk.Duration.days(365),
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
    },
  ],
});

// Create Glue database for reporting
const reportingDatabase = new glue.CfnDatabase(stack, 'ReportingDatabase', {
  catalogId: stack.account,
  databaseInput: {
    name: `${stack.stackName.toLowerCase()}-reporting-db`,
    description: 'Database for IDP evaluation results',
  },
});

// Create reporting environment with table structure
const reportingEnvironment = new ReportingEnvironment(stack, 'ReportingEnvironment', {
  reportingBucket,
  reportingDatabase,
});

// Create processing environment with reporting
const processingEnvironment = new ProcessingEnvironment(stack, 'ProcessingEnvironment', {
  inputBucket,
  outputBucket,
  metricNamespace: 'MyIDP',
  
  // Provide the reporting environment
  reportingEnvironment,
});

// Access reporting environment components
console.log('Reporting bucket:', reportingEnvironment.reportingBucket.bucketName);
console.log('Reporting database:', reportingEnvironment.reportingDatabase.ref);
```

## Using Existing S3 Bucket and Database

```typescript
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as glue from 'aws-cdk-lib/aws-glue';

// Use existing bucket and database
const existingReportingBucket = s3.Bucket.fromBucketName(
  stack, 
  'ExistingReportingBucket', 
  'my-existing-reporting-bucket'
);

const existingReportingDatabase = glue.CfnDatabase.fromCfnDatabaseName(
  stack,
  'ExistingReportingDatabase',
  'my-existing-reporting-db'
);

// Create reporting environment with existing resources
const reportingEnvironment = new ReportingEnvironment(stack, 'ReportingEnvironment', {
  reportingBucket: existingReportingBucket,
  reportingDatabase: existingReportingDatabase,
});

const processingEnvironment = new ProcessingEnvironment(stack, 'ProcessingEnvironment', {
  inputBucket,
  outputBucket,
  metricNamespace: 'MyIDP',
  reportingEnvironment,
});
```

## Custom Bucket Configuration

```typescript
import * as kms from 'aws-cdk-lib/aws-kms';

// Create custom KMS key for encryption
const encryptionKey = new kms.Key(stack, 'ReportingKey', {
  description: 'KMS key for IDP reporting data',
});

// Create logging bucket for access logs
const loggingBucket = new s3.Bucket(stack, 'LoggingBucket');

// Create reporting bucket with custom configuration
const reportingBucket = new s3.Bucket(stack, 'ReportingBucket', {
  bucketName: 'my-custom-reporting-bucket',
  encryption: s3.BucketEncryption.KMS,
  encryptionKey,
  blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
  versioned: true,
  serverAccessLogsBucket: loggingBucket,
  serverAccessLogsPrefix: 'reporting-bucket-logs/',
  lifecycleRules: [
    {
      id: 'DeleteAfterTwoYears',
      enabled: true,
      expiration: cdk.Duration.years(2),
      abortIncompleteMultipartUploadAfter: cdk.Duration.days(1),
    },
  ],
  cors: [
    {
      allowedHeaders: [
        'Content-Type',
        'x-amz-content-sha256',
        'x-amz-date',
        'Authorization',
        'x-amz-security-token',
      ],
      allowedMethods: [s3.HttpMethods.PUT, s3.HttpMethods.POST],
      allowedOrigins: ['https://my-domain.com'], // Restrict to your domain
      exposedHeaders: ['ETag', 'x-amz-server-side-encryption'],
      maxAge: 3000,
    },
  ],
});

// Add bucket policy to enforce SSL
reportingBucket.addToResourcePolicy(
  new cdk.aws_iam.PolicyStatement({
    sid: 'EnforceSSLOnly',
    effect: cdk.aws_iam.Effect.DENY,
    principals: [new cdk.aws_iam.AnyPrincipal()],
    actions: ['s3:*'],
    resources: [
      reportingBucket.bucketArn,
      `${reportingBucket.bucketArn}/*`,
    ],
    conditions: {
      Bool: {
        'aws:SecureTransport': 'false',
      },
    },
  }),
);

// Create Glue database
const reportingDatabase = new glue.CfnDatabase(stack, 'ReportingDatabase', {
  catalogId: stack.account,
  databaseInput: {
    name: `${stack.stackName.toLowerCase()}-reporting-db`,
    description: 'Database for IDP evaluation results',
  },
});

// Create reporting environment
const reportingEnvironment = new ReportingEnvironment(stack, 'ReportingEnvironment', {
  reportingBucket,
  reportingDatabase,
});

const processingEnvironment = new ProcessingEnvironment(stack, 'ProcessingEnvironment', {
  inputBucket,
  outputBucket,
  metricNamespace: 'MyIDP',
  key: encryptionKey, // Use same key for processing environment
  reportingEnvironment,
});
```

## Optional Reporting (Conditional Creation)

```typescript
// Conditionally create reporting based on environment or parameter
const enableReporting = app.node.tryGetContext('enableReporting') === 'true';

let reportingEnvironment: ReportingEnvironment | undefined;

if (enableReporting) {
  // Create reporting resources
  const reportingBucket = new s3.Bucket(stack, 'ReportingBucket', {
    encryption: s3.BucketEncryption.S3_MANAGED,
    blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
    lifecycleRules: [
      {
        id: 'DeleteAfterOneYear',
        enabled: true,
        expiration: cdk.Duration.days(365),
      },
    ],
  });

  const reportingDatabase = new glue.CfnDatabase(stack, 'ReportingDatabase', {
    catalogId: stack.account,
    databaseInput: {
      name: `${stack.stackName.toLowerCase()}-reporting-db`,
      description: 'Database for IDP evaluation results',
    },
  });

  reportingEnvironment = new ReportingEnvironment(stack, 'ReportingEnvironment', {
    reportingBucket,
    reportingDatabase,
  });
}

const processingEnvironment = new ProcessingEnvironment(stack, 'ProcessingEnvironment', {
  inputBucket,
  outputBucket,
  metricNamespace: 'MyIDP',
  reportingEnvironment, // Will be undefined if reporting is disabled
});
```

## Benefits of This Approach

### **1. Separation of Concerns**
- **ReportingEnvironment** focuses solely on creating table structure
- **S3 Bucket** configuration is handled separately with full control
- **Glue Database** can be shared across multiple reporting environments

### **2. Flexibility**
- Use existing buckets and databases
- Custom bucket configurations (encryption, lifecycle, CORS, etc.)
- Share databases across multiple stacks or environments

### **3. Composability**
```typescript
// Share database across multiple reporting environments
const sharedDatabase = new glue.CfnDatabase(stack, 'SharedReportingDB', {
  catalogId: stack.account,
  databaseInput: {
    name: 'shared-reporting-db',
    description: 'Shared database for multiple IDP environments',
  },
});

// Different buckets for different environments
const devReportingBucket = new s3.Bucket(stack, 'DevReportingBucket');
const prodReportingBucket = new s3.Bucket(stack, 'ProdReportingBucket');

// Create separate reporting environments
const devReporting = new ReportingEnvironment(stack, 'DevReporting', {
  reportingBucket: devReportingBucket,
  reportingDatabase: sharedDatabase,
});

const prodReporting = new ReportingEnvironment(stack, 'ProdReporting', {
  reportingBucket: prodReportingBucket,
  reportingDatabase: sharedDatabase,
});
```

### **4. Testability**
- Mock buckets and databases for unit testing
- Easy to test table creation logic independently
- Clear dependencies and interfaces

## Accessing Reporting Components

The reporting environment provides several components for analytics:

```typescript
const reportingEnv = processingEnvironment.reportingEnvironment;

if (reportingEnv) {
  // S3 bucket for storing evaluation metrics in Parquet format
  const reportingBucket = reportingEnv.reportingBucket;
  
  // AWS Glue database for structured querying
  const database = reportingEnv.reportingDatabase;
  
  // Glue tables for different types of metrics
  const documentMetrics = reportingEnv.documentEvaluationsTable;
  const sectionMetrics = reportingEnv.sectionEvaluationsTable;
  const attributeMetrics = reportingEnv.attributeEvaluationsTable;
  const meteringData = reportingEnv.meteringTable;
}
```

## Querying Data with Amazon Athena

Once reporting is enabled, you can query the evaluation metrics using Amazon Athena:

```sql
-- Query document-level evaluation metrics
SELECT 
  document_id,
  input_key,
  accuracy,
  precision,
  recall,
  f1_score,
  evaluation_date
FROM "my-stack-reporting-db"."document_evaluations"
WHERE year = '2024' AND month = '07'
ORDER BY evaluation_date DESC;

-- Query attribute-level metrics for specific documents
SELECT 
  document_id,
  section_type,
  attribute_name,
  expected,
  actual,
  matched,
  score,
  evaluation_date
FROM "my-stack-reporting-db"."attribute_evaluations"
WHERE document_id = 'doc-123'
ORDER BY evaluation_date DESC;

-- Query metering data for cost analysis
SELECT 
  service_api,
  unit,
  SUM(value) as total_usage,
  COUNT(*) as request_count
FROM "my-stack-reporting-db"."metering"
WHERE year = '2024' AND month = '07'
GROUP BY service_api, unit;
```

## Data Structure

The reporting infrastructure creates the following data structure:

### S3 Bucket Structure
```
reporting-bucket/
├── evaluation_metrics/
│   ├── document_metrics/
│   │   └── year=2024/month=07/day=15/document=type1/
│   ├── section_metrics/
│   │   └── year=2024/month=07/day=15/document=type1/
│   └── attribute_metrics/
│       └── year=2024/month=07/day=15/document=type1/
└── metering/
    └── year=2024/month=07/day=15/document=type1/
```

### Glue Tables
- **document_evaluations**: Document-level metrics (accuracy, precision, recall, F1 score)
- **section_evaluations**: Section-level metrics for document parts
- **attribute_evaluations**: Detailed attribute-level evaluation results
- **metering**: Cost and usage tracking data

## Integration with Document Processors

The reporting functionality integrates automatically with document processors when enabled. The processors will:

1. Generate evaluation metrics during document processing
2. Save metrics to the reporting bucket in Parquet format
3. Partition data by date and document type for efficient querying
4. Track metering data for cost analysis

## Benefits

- **Analytics**: Query evaluation metrics to understand processing accuracy
- **Cost Tracking**: Monitor usage and costs across different services
- **Performance Monitoring**: Track processing times and success rates
- **Data Retention**: Automatic cleanup based on retention policies
- **Scalable Storage**: Parquet format for efficient storage and querying
