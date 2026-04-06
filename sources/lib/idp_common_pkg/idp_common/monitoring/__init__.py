# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

"""
``idp_common.monitoring`` — Shared monitoring foundation library.

Provides reusable building blocks for all monitoring features across the IDP
system.  All public classes and functions are exported from this package so
consumers only need a single import path:

    from idp_common.monitoring import SettingsCache, TimeRange, DocumentRecord

Modules
-------
models
    Shared dataclasses: :class:`TimeRange`, :class:`LogEvent`,
    :class:`LogSearchResult`, :class:`TraceSegment`, :class:`DocumentRecord`,
    :class:`MonitoringKPIs`.

settings_cache
    :class:`SettingsCache` — TTL-based SSM/DynamoDB configuration cache.
    Module-level helpers: :func:`get_setting`, :func:`get_cloudwatch_log_groups`.

stack_utils
    Stack name resolution and AWS resource discovery utilities:
    :func:`get_stack_name`, :func:`extract_stack_name_from_arn`,
    :func:`get_stack_resources`, :func:`get_lambda_function_names`,
    :func:`get_state_machine_arn`.

stepfunctions_service
    Step Functions execution analysis:
    :func:`get_execution_arn_from_document`, :func:`get_execution_data`,
    :func:`analyze_execution_timeline`, :func:`extract_failure_details`.

xray_service
    X-Ray base trace service:
    :func:`get_trace_for_document`, :func:`analyze_trace`,
    :func:`get_subsegment_details`, :func:`extract_lambda_request_ids`.
"""

# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
from idp_common.monitoring.models import (
    DocumentRecord,
    LogEvent,
    LogSearchResult,
    MonitoringKPIs,
    TimeRange,
    TraceSegment,
)

# ---------------------------------------------------------------------------
# Settings cache
# ---------------------------------------------------------------------------
from idp_common.monitoring.settings_cache import (
    SettingsCache,
    get_cloudwatch_log_groups,
    get_setting,
)

# ---------------------------------------------------------------------------
# Stack utilities
# ---------------------------------------------------------------------------
from idp_common.monitoring.stack_utils import (
    extract_stack_name_from_arn,
    get_lambda_function_names,
    get_stack_name,
    get_stack_resources,
    get_state_machine_arn,
)

# ---------------------------------------------------------------------------
# Step Functions service
# ---------------------------------------------------------------------------
from idp_common.monitoring.stepfunctions_service import (
    analyze_execution_timeline,
    extract_failure_details,
    get_execution_arn_from_document,
    get_execution_data,
)

# ---------------------------------------------------------------------------
# X-Ray service
# ---------------------------------------------------------------------------
from idp_common.monitoring.xray_service import (
    analyze_trace,
    extract_lambda_request_ids,
    get_subsegment_details,
    get_trace_for_document,
)

__all__ = [
    # models
    "TimeRange",
    "LogEvent",
    "LogSearchResult",
    "TraceSegment",
    "DocumentRecord",
    "MonitoringKPIs",
    # settings_cache
    "SettingsCache",
    "get_setting",
    "get_cloudwatch_log_groups",
    # stack_utils
    "get_stack_name",
    "extract_stack_name_from_arn",
    "get_stack_resources",
    "get_lambda_function_names",
    "get_state_machine_arn",
    # stepfunctions_service
    "get_execution_arn_from_document",
    "get_execution_data",
    "analyze_execution_timeline",
    "extract_failure_details",
    # xray_service
    "get_trace_for_document",
    "analyze_trace",
    "get_subsegment_details",
    "extract_lambda_request_ids",
]
