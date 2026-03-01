/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as kms from "aws-cdk-lib/aws-kms";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct, IConstruct } from "constructs";
import { FccDatasetDeployer } from "./fcc-dataset-deployer";
import {
  TestRunnerFunction,
  TestSetResolverFunction,
  TestResultsResolverFunction,
  DocSplitTestSetDeployerFunction,
  OcrBenchmarkDeployerFunction,
} from "./functions";
import { ITestTable, TestTable } from "./test-table";
import { ITrackingTable } from "../../tracking-table";
import * as functions from "../functions";
import {
  IProcessingEnvironmentApi,
  IProcessingEnvironmentApiFeature,
} from "../processing-environment-api";

/**
 * Interface for Test Studio construct.
 *
 * Provides test management and analysis capabilities for document processing.
 * Enables test set creation, execution, and results comparison.
 *
 * @since v0.4.8
 */
export interface ITestStudio extends IConstruct {
  /**
   * DynamoDB table for storing test sets and execution results.
   * Optional - can be provided by user or created by construct.
   */
  readonly testTable?: ITestTable;

  /**
   * S3 bucket for storing test documents and baselines.
   * Optional - can be provided by user or created by construct.
   */
  readonly testBucket?: s3.IBucket;

  /**
   * SQS queue for test set file copying operations.
   */
  readonly testSetCopyQueue: sqs.IQueue;

  /**
   * SQS queue for test result cache updates.
   */
  readonly testResultCacheUpdateQueue: sqs.IQueue;

  /**
   * Lambda function for test execution.
   */
  readonly testRunnerFunction: lambda.IFunction;

  /**
   * Lambda function for test set management operations.
   */
  readonly testSetResolverFunction: lambda.IFunction;

  /**
   * Lambda function for test results retrieval and analysis.
   */
  readonly testResultsResolverFunction: lambda.IFunction;

  /**
   * Integrate Test Studio with ProcessingEnvironmentApi.
   * Adds test management capabilities to the GraphQL API.
   *
   * @param api The ProcessingEnvironmentApi to integrate with
   * @param trackingTable The tracking table for test execution data
   */
  integrateWithApi(
    api: IProcessingEnvironmentApi,
    trackingTable: ITrackingTable,
  ): void;
}

/**
 * Properties for TestStudio construct.
 *
 * @since v0.4.8
 */
export interface TestStudioProps {
  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Required for test execution and results tracking.
   */
  readonly trackingTable: ITrackingTable;

  /**
   * Optional DynamoDB table for storing test sets and execution results.
   * When not provided, a new table will be created.
   *
   * @default - A new table is created
   */
  readonly testTable?: ITestTable;

  /**
   * Optional S3 bucket for storing test documents and baselines.
   * When not provided, a new bucket will be created.
   *
   * @default - A new bucket is created
   */
  readonly testBucket?: s3.IBucket;

  /**
   * Optional KMS key for encrypting test data.
   * When provided, ensures test documents and metadata are encrypted at rest.
   *
   * @default - Server-side encryption with Amazon S3 managed keys (SSE-S3)
   */
  readonly encryptionKey?: kms.IKey;

  /**
   * Enable RealKIE-FCC dataset deployment.
   * When enabled, automatically downloads and extracts the RealKIE-FCC dataset
   * to the test bucket for evaluation purposes.
   *
   * @default false
   */
  readonly enableRealKieDataset?: boolean;

  /**
   * Enable DocSplit test set deployment.
   * When enabled, automatically deploys the DocSplit dataset
   * to the test bucket for document splitting evaluation.
   *
   * @default false
   * @since v0.4.16
   */
  readonly enableDocSplitDataset?: boolean;

  /**
   * Enable OCR benchmark dataset deployment.
   * When enabled, automatically deploys the OCR benchmark dataset
   * to the test bucket for OCR quality evaluation.
   *
   * @default false
   * @since v0.4.16
   */
  readonly enableOcrBenchmark?: boolean;

  /**
   * Optional S3 bucket for input documents.
   * Used when creating test sets from existing input files.
   * When not provided, test sets can only be created via direct upload.
   *
   * @default - No input bucket integration
   */
  readonly inputBucket?: s3.IBucket;

  /**
   * Optional S3 bucket for reporting data.
   * Used for detailed cost analysis and metrics aggregation.
   *
   * @default - No reporting integration
   */
  readonly reportingBucket?: s3.IBucket;
}

/**
 * Test Studio construct for test management and analysis.
 *
 * Provides comprehensive test management capabilities including:
 * - Test set creation and management
 * - Test execution and tracking
 * - Results comparison and analysis
 * - RealKIE-FCC dataset deployment (optional)
 *
 * Test Studio integrates with the ProcessingEnvironment to enable
 * systematic testing and evaluation of document processing workflows.
 *
 * @since v0.4.8
 */
export class TestStudio
  extends Construct
  implements ITestStudio, IProcessingEnvironmentApiFeature
{
  /**
   * The DynamoDB table that tracks document processing status and metadata.
   * Used for test execution and results tracking.
   */
  public readonly trackingTable: ITrackingTable;

  /**
   * DynamoDB table for storing test sets and execution results.
   */
  public readonly testTable?: ITestTable;

  /**
   * S3 bucket for storing test documents and baselines.
   */
  public readonly testBucket?: s3.IBucket;

  /**
   * Lambda function for test execution.
   */
  public readonly testRunnerFunction: lambda.IFunction;

  /**
   * Lambda function for test set management operations.
   */
  public readonly testSetResolverFunction: lambda.IFunction;

  /**
   * Lambda function for test results retrieval and analysis.
   */
  public readonly testResultsResolverFunction: lambda.IFunction;

  /**
   * SQS queue for test set file copying operations.
   */
  public readonly testSetCopyQueue: sqs.IQueue;

  /**
   * SQS queue for test result cache updates.
   */
  public readonly testResultCacheUpdateQueue: sqs.IQueue;

  /**
   * Optional FCC dataset deployer for RealKIE-FCC dataset deployment.
   */
  public readonly fccDatasetDeployer?: FccDatasetDeployer;

  /**
   * Optional DocSplit test set deployer for document splitting evaluation.
   * @since v0.4.16
   */
  public readonly docSplitTestSetDeployer?: lambda.IFunction;

  /**
   * Optional OCR benchmark deployer for OCR quality evaluation.
   * @since v0.4.16
   */
  public readonly ocrBenchmarkDeployer?: lambda.IFunction;

  constructor(scope: Construct, id: string, props: TestStudioProps) {
    super(scope, id);

    // Store tracking table for use in attachTo()
    this.trackingTable = props.trackingTable;

    // Create or use provided test table
    this.testTable =
      props.testTable ??
      new TestTable(this, "TestTable", {
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        encryption: props.encryptionKey
          ? dynamodb.TableEncryption.CUSTOMER_MANAGED
          : dynamodb.TableEncryption.AWS_MANAGED,
        encryptionKey: props.encryptionKey,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
        pointInTimeRecovery: true,
      });

    // Create or use provided test bucket
    this.testBucket =
      props.testBucket ??
      new s3.Bucket(this, "TestBucket", {
        encryption: props.encryptionKey
          ? s3.BucketEncryption.KMS
          : s3.BucketEncryption.S3_MANAGED,
        encryptionKey: props.encryptionKey,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        enforceSSL: true,
        versioned: true,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });

    // Create SQS queues for test operations
    this.testSetCopyQueue = new sqs.Queue(this, "TestSetCopyQueue", {
      encryption: props.encryptionKey
        ? sqs.QueueEncryption.KMS
        : sqs.QueueEncryption.SQS_MANAGED,
      encryptionMasterKey: props.encryptionKey,
      deadLetterQueue: {
        queue: new sqs.Queue(this, "TestSetCopyDLQ", {
          encryption: props.encryptionKey
            ? sqs.QueueEncryption.KMS
            : sqs.QueueEncryption.SQS_MANAGED,
          encryptionMasterKey: props.encryptionKey,
          retentionPeriod: cdk.Duration.days(14),
        }),
        maxReceiveCount: 3,
      },
      visibilityTimeout: cdk.Duration.minutes(15),
    });

    this.testResultCacheUpdateQueue = new sqs.Queue(
      this,
      "TestResultCacheUpdateQueue",
      {
        encryption: props.encryptionKey
          ? sqs.QueueEncryption.KMS
          : sqs.QueueEncryption.SQS_MANAGED,
        encryptionMasterKey: props.encryptionKey,
        deadLetterQueue: {
          queue: new sqs.Queue(this, "TestResultCacheUpdateDLQ", {
            encryption: props.encryptionKey
              ? sqs.QueueEncryption.KMS
              : sqs.QueueEncryption.SQS_MANAGED,
            encryptionMasterKey: props.encryptionKey,
            retentionPeriod: cdk.Duration.days(14),
          }),
          maxReceiveCount: 3,
        },
        visibilityTimeout: cdk.Duration.minutes(15),
      },
    );

    // Create test runner function using TestRunnerFunction
    // Note: trackingTable and configurationTable will be provided when TestStudio is used in ProcessingEnvironment
    this.testRunnerFunction = new TestRunnerFunction(
      this,
      "TestRunnerFunction",
      {
        testTable: this.testTable!,
        testBucket: this.testBucket!,
        trackingTable: this.testTable!, // Placeholder - will be overridden
        configurationTable: this.testTable!, // Placeholder - will be overridden
        encryptionKey: props.encryptionKey,
      },
    );

    // Create test set resolver function
    this.testSetResolverFunction = new TestSetResolverFunction(
      this,
      "TestSetResolverFunction",
      {
        trackingTable: this.testTable!,
        testSetBucket: this.testBucket!,
        inputBucket: props.inputBucket || this.testBucket!, // Fallback to test bucket if no input bucket
        testSetCopyQueue: this.testSetCopyQueue,
        encryptionKey: props.encryptionKey,
      },
    );

    // Create test results resolver function
    this.testResultsResolverFunction = new TestResultsResolverFunction(
      this,
      "TestResultsResolverFunction",
      {
        trackingTable: this.testTable!,
        reportingBucket: props.reportingBucket,
        testResultCacheUpdateQueue: this.testResultCacheUpdateQueue,
        encryptionKey: props.encryptionKey,
      },
    );

    // Grant permissions
    this.testTable?.grantReadWriteData(this.testRunnerFunction);
    this.testBucket?.grantReadWrite(this.testRunnerFunction);

    // Grant permissions for test set resolver
    this.testTable?.grantReadWriteData(this.testSetResolverFunction);
    this.testBucket?.grantReadWrite(this.testSetResolverFunction);
    props.inputBucket?.grantRead(this.testSetResolverFunction);

    // Grant permissions for test results resolver
    this.testTable?.grantReadWriteData(this.testResultsResolverFunction);
    props.reportingBucket?.grantRead(this.testResultsResolverFunction);

    // Deploy RealKIE-FCC dataset if enabled
    if (props.enableRealKieDataset) {
      this.fccDatasetDeployer = new FccDatasetDeployer(
        this,
        "FccDatasetDeployer",
        {
          testSetBucket: this.testBucket!,
          trackingTable: this.testTable!,
          encryptionKey: props.encryptionKey,
          datasetVersion: "1.0",
          datasetDescription:
            "RealKIE-FCC-Verified dataset for document processing evaluation",
        },
      );
    }

    // Deploy DocSplit test set if enabled
    if (props.enableDocSplitDataset) {
      this.docSplitTestSetDeployer = new DocSplitTestSetDeployerFunction(
        this,
        "DocSplitTestSetDeployer",
        {
          testBucket: this.testBucket!,
          encryptionKey: props.encryptionKey,
        },
      );

      // Grant permissions
      this.testBucket?.grantReadWrite(this.docSplitTestSetDeployer);
    }

    // Deploy OCR benchmark dataset if enabled
    if (props.enableOcrBenchmark) {
      this.ocrBenchmarkDeployer = new OcrBenchmarkDeployerFunction(
        this,
        "OcrBenchmarkDeployer",
        {
          testBucket: this.testBucket!,
          encryptionKey: props.encryptionKey,
        },
      );

      // Grant permissions
      this.testBucket?.grantReadWrite(this.ocrBenchmarkDeployer);
    }
  }

  /**
   * Integrate Test Studio with ProcessingEnvironmentApi.
   *
   * This method adds test-related resolvers to an existing ProcessingEnvironmentApi
   * to enable GraphQL operations for test management and results analysis.
   *
   * @deprecated Use the attachTo() pattern instead. Call testStudio.attachTo(api) directly.
   * The trackingTable parameter is no longer needed as it's now stored in the TestStudio construct.
   *
   * @param api The ProcessingEnvironmentApi to integrate with
   * @param _trackingTable The tracking table for test execution data (ignored, uses stored value)
   */
  public integrateWithApi(
    api: IProcessingEnvironmentApi,
    _trackingTable: ITrackingTable,
  ): void {
    // Call the new attachTo() method which uses the stored trackingTable
    this.attachTo(api);
  }

  /**
   * Attach this Test Studio feature to the ProcessingEnvironmentApi.
   *
   * This method integrates the test management functionality with the GraphQL API
   * by creating the necessary data sources and resolvers. It should be called after
   * both the API and this construct have been created.
   *
   * Example:
   * ```typescript
   * const api = new ProcessingEnvironmentApi(this, 'Api', { ... });
   * const testStudio = new TestStudio(this, 'TestStudio', {
   *   trackingTable: environment.trackingTable,
   *   ...
   * });
   * testStudio.attachTo(api);
   * ```
   *
   * @param api The ProcessingEnvironmentApi to attach to
   * @since v0.4.16
   */
  public attachTo(api: IProcessingEnvironmentApi): void {
    // Create test set resolver function using stored trackingTable
    const testSetResolverFunction = new functions.TestSetResolverFunction(
      api as any,
      "TestSetResolverFunction",
      {
        trackingTable: this.trackingTable,
        testSetBucket: this.testBucket!,
        inputBucket: this.testBucket!, // Use test bucket as fallback
        testSetCopyQueue: this.testSetCopyQueue,
        encryptionKey: undefined, // Will use API's encryption key
      },
    );

    // Create test results resolver function using stored trackingTable
    const testResultsResolverFunction =
      new functions.TestResultsResolverFunction(
        api as any,
        "TestResultsResolverFunction",
        {
          trackingTable: this.trackingTable,
          reportingBucket: undefined,
          testResultCacheUpdateQueue: this.testResultCacheUpdateQueue,
          encryptionKey: undefined, // Will use API's encryption key
        },
      );

    // Create data sources
    const testSetDataSource = api.addLambdaDataSource(
      "TestSetDataSource",
      testSetResolverFunction,
    );

    const testResultsDataSource = api.addLambdaDataSource(
      "TestResultsDataSource",
      testResultsResolverFunction,
    );

    // Create test set resolvers
    testSetDataSource.createResolver("GetTestSetsResolver", {
      typeName: "Query",
      fieldName: "getTestSets",
    });

    testSetDataSource.createResolver("AddTestSetResolver", {
      typeName: "Mutation",
      fieldName: "addTestSet",
    });

    testSetDataSource.createResolver("AddTestSetFromUploadResolver", {
      typeName: "Mutation",
      fieldName: "addTestSetFromUpload",
    });

    testSetDataSource.createResolver("DeleteTestSetsResolver", {
      typeName: "Mutation",
      fieldName: "deleteTestSets",
    });

    testSetDataSource.createResolver("ListBucketFilesResolver", {
      typeName: "Query",
      fieldName: "listBucketFiles",
    });

    testSetDataSource.createResolver("ValidateTestFileNameResolver", {
      typeName: "Query",
      fieldName: "validateTestFileName",
    });

    // Create test results resolvers
    testResultsDataSource.createResolver("GetTestRunResolver", {
      typeName: "Query",
      fieldName: "getTestRun",
    });

    testResultsDataSource.createResolver("GetTestRunsResolver", {
      typeName: "Query",
      fieldName: "getTestRuns",
    });

    testResultsDataSource.createResolver("GetTestRunStatusResolver", {
      typeName: "Query",
      fieldName: "getTestRunStatus",
    });

    testResultsDataSource.createResolver("CompareTestRunsResolver", {
      typeName: "Query",
      fieldName: "compareTestRuns",
    });

    // Create test runner resolver (uses the same test results function)
    testResultsDataSource.createResolver("StartTestRunResolver", {
      typeName: "Mutation",
      fieldName: "startTestRun",
    });

    testResultsDataSource.createResolver("DeleteTestsResolver", {
      typeName: "Mutation",
      fieldName: "deleteTests",
    });
  }
}
