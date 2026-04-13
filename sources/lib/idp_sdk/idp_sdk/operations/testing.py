# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""Testing operations for IDP SDK."""

from typing import Optional

from idp_sdk.models import LoadTestResult


class TestingOperation:
    """Load testing and workflow control operations."""

    def __init__(self, client):
        self._client = client

    def load_test(
        self,
        source_file: str,
        stack_name: Optional[str] = None,
        rate: int = 100,
        duration: int = 1,
        schedule_file: Optional[str] = None,
        dest_prefix: str = "load-test",
        config_version: Optional[str] = None,
        **kwargs,
    ) -> LoadTestResult:
        """Run load test by copying files to input bucket.

        Args:
            source_file: Source file to copy
            stack_name: Optional stack name override
            rate: Files per minute for constant load
            duration: Duration in minutes
            schedule_file: Optional schedule file for variable load
            dest_prefix: Destination prefix in S3
            config_version: Configuration version to tag files with (optional).
                           If provided, files will be tagged with the specified version.
                           If not provided, the active configuration version is used.
            **kwargs: Additional parameters

        Returns:
            LoadTestResult with test statistics
        """
        from idp_sdk._core.load_test import LoadTester

        name = self._client._require_stack(stack_name)
        tester = LoadTester(stack_name=name, region=self._client._region)

        try:
            if schedule_file:
                result = tester.run_scheduled_load(
                    source_file=source_file,
                    schedule_file=schedule_file,
                    dest_prefix=dest_prefix,
                    config_version=config_version,
                )
            else:
                result = tester.run_constant_load(
                    source_file=source_file,
                    rate=rate,
                    duration=duration,
                    dest_prefix=dest_prefix,
                    config_version=config_version,
                )

            return LoadTestResult(
                success=result.get("success", False),
                total_files=result.get("total_files", 0),
                duration_minutes=duration,
                error=result.get("error"),
            )
        except Exception as e:
            return LoadTestResult(
                success=False, total_files=0, duration_minutes=duration, error=str(e)
            )
