# ProcessingEnvironmentApi Construct

This construct implements the AppSync GraphQL API for the GenAI IDP Accelerator, providing document tracking and management capabilities.

## Overview

The ProcessingEnvironmentApi construct creates:

1. An AppSync GraphQL API with appropriate schema and resolvers
2. A DynamoDB table for tracking document processing status
3. Lambda functions for various document operations
4. All necessary IAM permissions and data sources

## Resolvers

The ProcessingEnvironmentApi includes the following resolvers:

### Core Document Tracking

- **CreateDocumentResolver**: Create document tracking records
- **UpdateDocumentResolver**: Update document tracking information
- **GetDocumentResolver**: Retrieve document tracking information
- **ListDocumentResolver**: List documents with optional filtering
- **ListDocumentDateHourResolver**: List documents by date and hour
- **ListDocumentDateShardResolver**: List documents by date and shard
- **GetFileContentsResolver**: Retrieve file contents from S3

### Document Management

- **DeleteDocumentResolver**: Delete documents and their tracking information
- **ReprocessDocumentResolver**: Trigger reprocessing of documents
- **UploadDocumentResolver**: Generate presigned URLs for document uploads
- **CopyToBaselineResolver**: Copy documents to baseline bucket for evaluation

### Configuration Management

- **GetConfigurationResolver**: Retrieve configuration settings
- **UpdateConfigurationResolver**: Update configuration settings

### Knowledge Base

- **QueryKnowledgeBaseResolver**: Query the document knowledge base using natural language

## Usage

```typescript
import { ProcessingEnvironmentApi } from '@cdklabs/genai-idp';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';

// Assuming you have a processing environment instance
const environment = new ProcessingEnvironment(this, 'ProcessingEnvironment', {
  // ... environment configuration
});

// Create the ProcessingEnvironmentApi
const api = new ProcessingEnvironmentApi(this, 'ProcessingEnvironmentApi', {
  // Required properties from the processing environment
  inputBucket: environment.inputBucket,
  outputBucket: environment.outputBucket,
  configurationBucket: environment.configurationBucket,
  trackingTable: environment.trackingTable,
  configurationTable: environment.configurationTable,
  
  // Optional properties from the processing environment
  encryptionKey: environment.encryptionKey,
  logRetention: environment.logRetention,
  logLevel: environment.logLevel,
  networkEnvironment: environment.networkEnvironment,
  
  // API-specific configuration
  authorizationConfig: {
    defaultAuthorization: {
      authorizationType: appsync.AuthorizationType.USER_POOL,
      userPoolConfig: {
        userPool: userPool,
      },
    },
    additionalAuthorizationModes: [
      {
        authorizationType: appsync.AuthorizationType.IAM,
      },
    ],
  },
  
  // Optional features
  knowledgeBase: knowledgeBase,
  evaluationBaselineBucket: evaluationBucket,
});
```

## Properties

- **api**: The AppSync GraphQL API
- **graphqlUrl**: The URL endpoint for the GraphQL API

## Implementation Notes

1. The CreateDocumentResolver uses direct DynamoDB mapping templates for performance
2. All other resolvers that require complex logic use Lambda functions
3. The construct automatically handles IAM permissions for all resources
4. Knowledge base querying is only enabled if a knowledgeBaseId is provided
5. Configuration management is only enabled if a configurationTable is provided
