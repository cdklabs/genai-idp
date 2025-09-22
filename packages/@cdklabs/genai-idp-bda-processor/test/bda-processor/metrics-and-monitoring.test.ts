/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
*/

import * as cxapi from "@aws-cdk/cx-api";
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import { App, Stack, Duration } from "aws-cdk-lib";
import { Unit } from "aws-cdk-lib/aws-cloudwatch";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { BdaProcessor, BdaProcessorConfiguration } from "../../src";
import { MockDataAutomationProject } from "../test-helpers";

describe("BdaProcessor - Metrics and Monitoring", () => {
  let app: App;
  let stack: Stack;
  let inputBucket: Bucket;
  let outputBucket: Bucket;
  let workingBucket: Bucket;
  let environment: ProcessingEnvironment;
  let processor: BdaProcessor;

  beforeEach(() => {
    app = new App({
      context: {
        [cxapi.BUNDLING_STACKS]: [],
        "@aws-cdk/aws-lambda:recognizeLayerVersion": true,
        "@aws-cdk/aws-lambda:recognizeVersionProps": true,
      },
    });
    stack = new Stack(app, "TestStack");
    expect(stack.bundlingRequired).toBe(false);

    inputBucket = new Bucket(stack, "InputBucket");
    outputBucket = new Bucket(stack, "OutputBucket");
    workingBucket = new Bucket(stack, "WorkingBucket");

    environment = new ProcessingEnvironment(stack, "Environment", {
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace: "TestNamespace",
    });

    const configuration = BdaProcessorConfiguration.lendingPackageSample();
    const dataAutomationProject = new MockDataAutomationProject(
      "arn:aws:bedrock:us-east-1:123456789012:data-automation-project/test-project",
    );

    processor = new BdaProcessor(stack, "Processor", {
      environment,
      configuration,
      dataAutomationProject,
    });
  });

  describe("BDA request metrics", () => {
    test("provides total BDA requests metric", () => {
      const metric = processor.metricBdaRequestsTotal();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsTotal");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides successful BDA requests metric", () => {
      const metric = processor.metricBdaRequestsSucceeded();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsSucceeded");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides failed BDA requests metric", () => {
      const metric = processor.metricBdaRequestsFailed();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsFailed");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides BDA request latency metric", () => {
      const metric = processor.metricBdaRequestLatency();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsLatency");
      expect(metric.unit).toBe(Unit.MILLISECONDS);
    });

    test("provides total BDA request latency metric", () => {
      const metric = processor.metricBdaRequestsTotalLatency();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsTotalLatency");
      expect(metric.unit).toBe(Unit.MILLISECONDS);
    });

    test("provides BDA request throttles metric", () => {
      const metric = processor.metricBdaRequestsThrottles();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsThrottles");
      expect(metric.unit).toBe(Unit.COUNT);
    });
  });

  describe("BDA retry and error metrics", () => {
    test("provides retry success metric", () => {
      const metric = processor.metricBdaRequestsRetrySuccess();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsRetrySuccess");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides max retries exceeded metric", () => {
      const metric = processor.metricBdaRequestsMaxRetriesExceeded();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsMaxRetriesExceeded");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides non-retryable errors metric", () => {
      const metric = processor.metricBdaRequestsNonRetryableErrors();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsNonRetryableErrors");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides unexpected errors metric", () => {
      const metric = processor.metricBdaRequestsUnexpectedErrors();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsUnexpectedErrors");
      expect(metric.unit).toBe(Unit.COUNT);
    });
  });

  describe("BDA job metrics", () => {
    test("provides total BDA jobs metric", () => {
      const metric = processor.metricBdaJobsTotal();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDAJobsTotal");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides successful BDA jobs metric", () => {
      const metric = processor.metricBdaJobsSucceeded();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDAJobsSucceeded");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides failed BDA jobs metric", () => {
      const metric = processor.metricBdaJobsFailed();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDAJobsFailed");
      expect(metric.unit).toBe(Unit.COUNT);
    });
  });

  describe("document processing metrics", () => {
    test("provides processed documents metric", () => {
      const metric = processor.metricProcessedDocuments();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("ProcessedDocuments");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides processed pages metric", () => {
      const metric = processor.metricProcessedPages();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("ProcessedPages");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides processed custom pages metric", () => {
      const metric = processor.metricProcessedCustomPages();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("ProcessedCustomPages");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("provides processed standard pages metric", () => {
      const metric = processor.metricProcessedStandardPages();

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("ProcessedStandardPages");
      expect(metric.unit).toBe(Unit.COUNT);
    });
  });

  describe("metric customization", () => {
    test("accepts custom metric properties for BDA requests", () => {
      const customProps = {
        statistic: "Average",
        period: Duration.minutes(5),
        label: "Custom BDA Requests",
      };

      const metric = processor.metricBdaRequestsTotal(customProps);

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsTotal");
      expect(metric.unit).toBe(Unit.COUNT);
    });

    test("accepts custom metric properties for latency metrics", () => {
      const customProps = {
        statistic: "Maximum",
        period: Duration.minutes(1),
        label: "Peak Latency",
      };

      const metric = processor.metricBdaRequestLatency(customProps);

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsLatency");
      expect(metric.unit).toBe(Unit.MILLISECONDS);
    });

    test("accepts custom metric properties for error metrics", () => {
      const customProps = {
        statistic: "Sum",
        period: Duration.minutes(15),
        label: "Total Errors",
      };

      const metric = processor.metricBdaRequestsFailed(customProps);

      expect(metric).toBeDefined();
      expect(metric.namespace).toBe("TestNamespace");
      expect(metric.metricName).toBe("BDARequestsFailed");
      expect(metric.unit).toBe(Unit.COUNT);
    });
  });

  describe("metric namespace consistency", () => {
    test("all metrics use the same namespace from environment", () => {
      const metrics = [
        processor.metricBdaRequestsTotal(),
        processor.metricBdaRequestsSucceeded(),
        processor.metricBdaRequestsFailed(),
        processor.metricBdaRequestLatency(),
        processor.metricBdaJobsTotal(),
        processor.metricProcessedDocuments(),
      ];

      metrics.forEach((metric) => {
        expect(metric.namespace).toBe("TestNamespace");
      });
    });

    test("metrics maintain consistent naming convention", () => {
      const requestMetrics = [
        processor.metricBdaRequestsTotal(),
        processor.metricBdaRequestsSucceeded(),
        processor.metricBdaRequestsFailed(),
        processor.metricBdaRequestsThrottles(),
      ];

      requestMetrics.forEach((metric) => {
        expect(metric.metricName).toMatch(/^BDARequests/);
      });

      const jobMetrics = [
        processor.metricBdaJobsTotal(),
        processor.metricBdaJobsSucceeded(),
        processor.metricBdaJobsFailed(),
      ];

      jobMetrics.forEach((metric) => {
        expect(metric.metricName).toMatch(/^BDAJobs/);
      });
    });

    test("latency metrics use correct unit", () => {
      const latencyMetrics = [
        processor.metricBdaRequestLatency(),
        processor.metricBdaRequestsTotalLatency(),
      ];

      latencyMetrics.forEach((metric) => {
        expect(metric.unit).toBe(Unit.MILLISECONDS);
      });
    });

    test("count metrics use correct unit", () => {
      const countMetrics = [
        processor.metricBdaRequestsTotal(),
        processor.metricBdaRequestsSucceeded(),
        processor.metricBdaRequestsFailed(),
        processor.metricBdaJobsTotal(),
        processor.metricProcessedDocuments(),
        processor.metricProcessedPages(),
      ];

      countMetrics.forEach((metric) => {
        expect(metric.unit).toBe(Unit.COUNT);
      });
    });
  });

  describe("comprehensive metric coverage", () => {
    test("provides metrics for all major BDA operations", () => {
      // Request-level metrics
      expect(processor.metricBdaRequestsTotal).toBeDefined();
      expect(processor.metricBdaRequestsSucceeded).toBeDefined();
      expect(processor.metricBdaRequestsFailed).toBeDefined();
      expect(processor.metricBdaRequestLatency).toBeDefined();

      // Job-level metrics
      expect(processor.metricBdaJobsTotal).toBeDefined();
      expect(processor.metricBdaJobsSucceeded).toBeDefined();
      expect(processor.metricBdaJobsFailed).toBeDefined();

      // Document processing metrics
      expect(processor.metricProcessedDocuments).toBeDefined();
      expect(processor.metricProcessedPages).toBeDefined();
    });

    test("provides comprehensive error and retry metrics", () => {
      expect(processor.metricBdaRequestsThrottles).toBeDefined();
      expect(processor.metricBdaRequestsRetrySuccess).toBeDefined();
      expect(processor.metricBdaRequestsMaxRetriesExceeded).toBeDefined();
      expect(processor.metricBdaRequestsNonRetryableErrors).toBeDefined();
      expect(processor.metricBdaRequestsUnexpectedErrors).toBeDefined();
    });

    test("provides detailed page processing metrics", () => {
      expect(processor.metricProcessedPages).toBeDefined();
      expect(processor.metricProcessedCustomPages).toBeDefined();
      expect(processor.metricProcessedStandardPages).toBeDefined();
    });
  });
});
