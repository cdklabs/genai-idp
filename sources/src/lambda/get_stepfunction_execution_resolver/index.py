# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0

import boto3
import json
import logging
import traceback
from datetime import datetime
from typing import Dict, Any, List, Optional

# Configure detailed logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Create boto3 client with logging
stepfunctions = boto3.client('stepfunctions')

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Lambda handler to get Step Functions execution details
    
    Args:
        event: AppSync event containing executionArn
        context: Lambda context
        
    Returns:
        Step Functions execution details with step history
    """
    try:
        # Log incoming request
        logger.info(f"Received request: {json.dumps(event)}")
        
        execution_arn = event['arguments']['executionArn']
        logger.info(f"Getting execution details for: {execution_arn}")
        
        # Get execution details with detailed logging
        logger.info(f"Calling describe_execution API for {execution_arn}")
        start_time = datetime.now()
        try:
            execution_response = stepfunctions.describe_execution(executionArn=execution_arn)
            logger.info(f"describe_execution API call successful, status: {execution_response.get('status', 'UNKNOWN')}")
        except Exception as api_error:
            logger.error(f"describe_execution API call failed: {str(api_error)}")
            logger.error(f"Error details: {traceback.format_exc()}")
            raise api_error
        
        api_duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"describe_execution API call took {api_duration:.2f} seconds")
        
        # Get execution history with pagination to capture all events
        all_events = []
        next_token = None
        page_count = 0
        
        logger.info(f"Starting to fetch execution history for {execution_arn}")
        history_start_time = datetime.now()
        
        while True:
            page_count += 1
            history_params = {
                'executionArn': execution_arn,
                'maxResults': 1000,  # Increased to capture more events
                'reverseOrder': False
            }
            
            if next_token:
                history_params['nextToken'] = next_token
            
            page_start_time = datetime.now()
            logger.info(f"Fetching execution history page {page_count} with params: {history_params}")
            
            try:
                history_response = stepfunctions.get_execution_history(**history_params)
                page_events = history_response['events']
                all_events.extend(page_events)
                
                page_duration = (datetime.now() - page_start_time).total_seconds()
                logger.info(f"Retrieved page {page_count} with {len(page_events)} events in {page_duration:.2f} seconds")
                
                next_token = history_response.get('nextToken')
                if not next_token:
                    break
            except Exception as history_error:
                logger.error(f"Failed to fetch execution history page {page_count}: {str(history_error)}")
                logger.error(f"Error details: {traceback.format_exc()}")
                raise history_error
        
        history_duration = (datetime.now() - history_start_time).total_seconds()
        logger.info(f"Retrieved {len(all_events)} total events in {page_count} pages, took {history_duration:.2f} seconds")
        
        # Log event types and counts for debugging
        event_type_counts = {}
        for event in all_events:
            event_type = event['type']
            event_type_counts[event_type] = event_type_counts.get(event_type, 0) + 1
        
        logger.info(f"Event type counts: {json.dumps(event_type_counts)}")
        
        # Check for failure events specifically
        failure_events = [e for e in all_events if 'Failed' in e['type'] or 'TimedOut' in e['type'] or 'Aborted' in e['type']]
        if failure_events:
            logger.info(f"Found {len(failure_events)} failure events")
            for i, failure in enumerate(failure_events):
                logger.info(f"Failure event {i+1}: Type={failure['type']}, ID={failure['id']}")
                # Log detailed failure information
                if 'taskFailedEventDetails' in failure:
                    details = failure['taskFailedEventDetails']
                    logger.info(f"Task failure details: Error={details.get('error')}, Cause={details.get('cause')}")
        
        # Process execution details
        parse_start_time = datetime.now()
        logger.info("Starting to parse execution history")
        steps = parse_execution_history(all_events)
        parse_duration = (datetime.now() - parse_start_time).total_seconds()
        logger.info(f"Parsed execution history into {len(steps)} steps in {parse_duration:.2f} seconds")
        
        # Check for failed steps
        failed_steps = [s for s in steps if s['status'] == 'FAILED']
        if failed_steps:
            logger.info(f"Found {len(failed_steps)} failed steps")
            for i, step in enumerate(failed_steps):
                logger.info(f"Failed step {i+1}: Name={step['name']}, Error={step['error']}")
        
        # Create final response
        execution_details = {
            'executionArn': execution_response['executionArn'],
            'status': execution_response['status'],
            'startDate': execution_response['startDate'].isoformat() if execution_response.get('startDate') else None,
            'stopDate': execution_response.get('stopDate').isoformat() if execution_response.get('stopDate') else None,
            'input': execution_response.get('input'),
            'output': execution_response.get('output'),
            'steps': steps
        }
        
        # Add top-level error information if execution failed
        if execution_response['status'] == 'FAILED':
            # Extract error from output if available
            try:
                if execution_response.get('output'):
                    output_json = json.loads(execution_response['output'])
                    if 'error' in output_json:
                        execution_details['error'] = output_json['error']
                    elif 'Error' in output_json:
                        execution_details['error'] = output_json['Error']
                    elif 'errorMessage' in output_json:
                        execution_details['error'] = output_json['errorMessage']
            except Exception as parse_error:
                logger.warning(f"Failed to parse execution output for error details: {str(parse_error)}")
            
            # If we couldn't extract from output, use the first failed step's error
            if 'error' not in execution_details and failed_steps:
                execution_details['error'] = failed_steps[0]['error']
        
        total_duration = (datetime.now() - start_time).total_seconds()
        logger.info(f"Successfully retrieved and processed execution details for {execution_arn} in {total_duration:.2f} seconds")
        return execution_details
        
    except Exception as e:
        logger.error(f"Error getting Step Functions execution: {str(e)}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        # Return error in a format that can be displayed in the UI
        execution_arn = 'Unknown'
        if isinstance(event, dict):
            if 'arguments' in event:
                execution_arn = event['arguments'].get('executionArn', 'Unknown')
            elif 'executionArn' in event:
                execution_arn = event.get('executionArn', 'Unknown')
        
        return {
            'executionArn': execution_arn,
            'status': 'ERROR',
            'error': f"Failed to retrieve execution details: {str(e)}",
            'steps': []
        }

def parse_execution_history(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Parse Step Functions execution history events into step details with enhanced Map state support
    
    Args:
        events: List of execution history events
        
    Returns:
        List of step details including Map state iterations
    """
    steps = []
    step_map = {}
    event_id_to_step = {}  # Map event IDs to step names for correlation
    map_iterations = {}  # Track Map state iterations
    
    # First pass: identify all states and their basic information
    for event in events:
        event_type = event['type']
        event_id = event['id']
        timestamp = event['timestamp'].isoformat()
        
        # Handle state entered events
        if event_type in ['TaskStateEntered', 'ChoiceStateEntered', 'PassStateEntered', 'WaitStateEntered', 'ParallelStateEntered', 'MapStateEntered']:
            step_name = event['stateEnteredEventDetails']['name']
            step_type = event_type.replace('StateEntered', '')
            
            # Create unique key for this step instance
            step_key = f"{step_name}_{event_id}"
            
            step_map[step_key] = {
                'name': step_name,
                'type': step_type,
                'status': 'RUNNING',
                'startDate': timestamp,
                'stopDate': None,
                'input': event['stateEnteredEventDetails'].get('input'),
                'output': None,
                'error': None,
                'eventId': event_id,
                'isMapState': step_type == 'Map'
            }
            event_id_to_step[event_id] = step_key
            
        # Handle state exited events (successful completion)
        elif event_type in ['TaskStateExited', 'ChoiceStateExited', 'PassStateExited', 'WaitStateExited', 'ParallelStateExited', 'MapStateExited']:
            step_name = event['stateExitedEventDetails']['name']
            
            # Find the corresponding step by name and update it
            for step_key, step_data in step_map.items():
                if step_data['name'] == step_name and step_data['status'] == 'RUNNING':
                    step_data['status'] = 'SUCCEEDED'
                    step_data['stopDate'] = timestamp
                    step_data['output'] = event['stateExitedEventDetails'].get('output')
                    break
                    
        # Handle Map iteration events
        elif event_type == 'MapIterationStarted':
            iteration_details = event.get('mapIterationStartedEventDetails', {})
            map_name = iteration_details.get('name', 'Unknown')
            iteration_index = iteration_details.get('index', 0)
            
            # Create a unique key for this iteration
            iteration_key = f"{map_name}_iteration_{iteration_index}_{event_id}"
            
            step_map[iteration_key] = {
                'name': f"{map_name} (Iteration {iteration_index + 1})",
                'type': 'MapIteration',
                'status': 'RUNNING',
                'startDate': timestamp,
                'stopDate': None,
                'input': iteration_details.get('input'),
                'output': None,
                'error': None,
                'eventId': event_id,
                'isMapIteration': True,
                'iterationIndex': iteration_index,
                'parentMapName': map_name
            }
            
            # Track iterations for the parent Map state
            if map_name not in map_iterations:
                map_iterations[map_name] = []
            map_iterations[map_name].append(iteration_key)
            
        elif event_type == 'MapIterationSucceeded':
            iteration_details = event.get('mapIterationSucceededEventDetails', {})
            map_name = iteration_details.get('name', 'Unknown')
            iteration_index = iteration_details.get('index', 0)
            
            # Find and update the corresponding iteration
            for step_key, step_data in step_map.items():
                if (step_data.get('parentMapName') == map_name and 
                    step_data.get('iterationIndex') == iteration_index and 
                    step_data['status'] == 'RUNNING'):
                    step_data['status'] = 'SUCCEEDED'
                    step_data['stopDate'] = timestamp
                    step_data['output'] = iteration_details.get('output')
                    break
                    
        elif event_type == 'MapIterationFailed':
            iteration_details = event.get('mapIterationFailedEventDetails', {})
            map_name = iteration_details.get('name', 'Unknown')
            iteration_index = iteration_details.get('index', 0)
            error = iteration_details.get('error', 'Map iteration failed')
            cause = iteration_details.get('cause', '')
            
            # Format error message with cause if available
            error_message = error
            if cause:
                try:
                    # Try to parse cause as JSON for better formatting
                    cause_json = json.loads(cause)
                    if isinstance(cause_json, dict):
                        if 'errorMessage' in cause_json:
                            error_message = f"{error}: {cause_json['errorMessage']}"
                        elif 'message' in cause_json:
                            error_message = f"{error}: {cause_json['message']}"
                        else:
                            error_message = f"{error}: {json.dumps(cause_json)}"
                except (json.JSONDecodeError, TypeError):
                    # If cause is not JSON, append it as-is
                    error_message = f"{error}: {cause}"
            
            # Find and update the corresponding iteration
            for step_key, step_data in step_map.items():
                if (step_data.get('parentMapName') == map_name and 
                    step_data.get('iterationIndex') == iteration_index and 
                    step_data['status'] == 'RUNNING'):
                    step_data['status'] = 'FAILED'
                    step_data['stopDate'] = timestamp
                    step_data['error'] = error_message
                    break
                    
        # Handle task failure events
        elif event_type == 'TaskFailed':
            # Log basic failure info without full event serialization
            logger.debug(f"Processing TaskFailed event ID: {event.get('id')}")
            
            step_name = find_step_name_for_failure_event(event, events, event_id_to_step)
            step_key = None
            
            # Find the corresponding step
            if step_name:
                for key, data in step_map.items():
                    if data['name'] == step_name and data['status'] == 'RUNNING':
                        step_key = key
                        break
            
            if step_key:
                step_map[step_key]['status'] = 'FAILED'
                step_map[step_key]['stopDate'] = timestamp
                
                # Extract error details
                task_failed_details = event.get('taskFailedEventDetails', {})
                error_message = task_failed_details.get('error', 'Unknown error')
                cause = task_failed_details.get('cause', '')
                
                # Enhanced error message formatting
                if cause:
                    try:
                        # Try to parse cause as JSON for better formatting
                        cause_json = json.loads(cause)
                        if isinstance(cause_json, dict):
                            # Format Lambda errors nicely
                            if 'errorType' in cause_json and 'errorMessage' in cause_json:
                                error_message = f"{cause_json['errorType']}: {cause_json['errorMessage']}"
                                
                                # Include stack trace if available
                                if 'stackTrace' in cause_json and isinstance(cause_json['stackTrace'], list):
                                    stack_trace = '\n'.join([str(line) for line in cause_json['stackTrace']])
                                    error_message = f"{error_message}\n\nStack trace:\n{stack_trace}"
                            # Handle other error formats
                            elif 'message' in cause_json:
                                error_message = cause_json['message']
                            else:
                                # Just use the whole JSON as the message
                                error_message = json.dumps(cause_json, indent=2)
                    except (json.JSONDecodeError, TypeError):
                        # If cause is not JSON, append it as-is
                        error_message = f"{error_message}: {cause}"
                
                step_map[step_key]['error'] = error_message
                logger.info(f"Processed failure for step '{step_name}': {error_message}")
            else:
                logger.warning(f"Could not find step for TaskFailed event: {event['id']}")
                
        # Handle other failure events
        elif event_type in ['TaskTimedOut', 'TaskAborted']:
            step_name = find_step_name_for_failure_event(event, events, event_id_to_step)
            step_key = None
            
            # Find the corresponding step
            if step_name:
                for key, data in step_map.items():
                    if data['name'] == step_name and data['status'] == 'RUNNING':
                        step_key = key
                        break
            
            if step_key:
                step_map[step_key]['status'] = 'FAILED'
                step_map[step_key]['stopDate'] = timestamp
                
                if event_type == 'TaskTimedOut':
                    timeout_details = event.get('taskTimedOutEventDetails', {})
                    error_message = f"Task timed out: {timeout_details.get('error', 'Timeout occurred')}"
                    cause = timeout_details.get('cause', '')
                    if cause:
                        try:
                            cause_json = json.loads(cause)
                            error_message = f"{error_message} - {json.dumps(cause_json, indent=2)}"
                        except (json.JSONDecodeError, TypeError):
                            error_message = f"{error_message} - {cause}"
                elif event_type == 'TaskAborted':
                    error_message = "Task was aborted"
                    
                step_map[step_key]['error'] = error_message
                logger.info(f"Processed {event_type} for step '{step_name}': {error_message}")
            else:
                logger.warning(f"Could not find step for {event_type} event: {event['id']}")
                
        # Handle Lambda function failure events
        elif event_type == 'LambdaFunctionFailed':
            step_name = find_step_name_for_failure_event(event, events, event_id_to_step)
            step_key = None
            
            # Find the corresponding step
            if step_name:
                for key, data in step_map.items():
                    if data['name'] == step_name and data['status'] == 'RUNNING':
                        step_key = key
                        break
            
            if step_key:
                step_map[step_key]['status'] = 'FAILED'
                step_map[step_key]['stopDate'] = timestamp
                
                lambda_failed_details = event.get('lambdaFunctionFailedEventDetails', {})
                error_message = lambda_failed_details.get('error', 'Lambda function failed')
                cause = lambda_failed_details.get('cause', '')
                
                # Enhanced Lambda error formatting
                if cause:
                    try:
                        cause_json = json.loads(cause)
                        if isinstance(cause_json, dict):
                            if 'errorMessage' in cause_json:
                                error_type = cause_json.get('errorType', 'Error')
                                error_message = f"{error_type}: {cause_json['errorMessage']}"
                                
                                # Include stack trace if available
                                if 'stackTrace' in cause_json and isinstance(cause_json['stackTrace'], list):
                                    stack_trace = '\n'.join([str(line) for line in cause_json['stackTrace']])
                                    error_message = f"{error_message}\n\nStack trace:\n{stack_trace}"
                            else:
                                error_message = json.dumps(cause_json, indent=2)
                    except (json.JSONDecodeError, TypeError):
                        error_message = f"{error_message}: {cause}"
                    
                step_map[step_key]['error'] = error_message
                logger.info(f"Processed Lambda failure for step '{step_name}': {error_message}")
            else:
                logger.warning(f"Could not find step for LambdaFunctionFailed event: {event['id']}")
                
        # Handle execution failed event
        elif event_type == 'ExecutionFailed':
            execution_failed_details = event.get('executionFailedEventDetails', {})
            error = execution_failed_details.get('error', 'Execution failed')
            cause = execution_failed_details.get('cause', '')
            
            # Format error message
            error_message = error
            if cause:
                try:
                    cause_json = json.loads(cause)
                    if isinstance(cause_json, dict):
                        if 'errorMessage' in cause_json:
                            error_message = f"{error}: {cause_json['errorMessage']}"
                        else:
                            error_message = f"{error}: {json.dumps(cause_json, indent=2)}"
                except (json.JSONDecodeError, TypeError):
                    error_message = f"{error}: {cause}"
            
            # Store execution failure in a special step
            execution_failed_key = f"ExecutionFailed_{event_id}"
            step_map[execution_failed_key] = {
                'name': 'Execution',
                'type': 'Execution',
                'status': 'FAILED',
                'startDate': None,  # We don't have a specific start time for this synthetic step
                'stopDate': timestamp,
                'input': None,
                'output': None,
                'error': error_message,
                'eventId': event_id,
                'isExecutionFailure': True
            }
            logger.info(f"Processed ExecutionFailed event: {error_message}")
    
    # Second pass: enhance Map states with iteration information
    for step_key, step_data in step_map.items():
        if step_data.get('isMapState') and step_data['name'] in map_iterations:
            iterations = map_iterations[step_data['name']]
            step_data['mapIterations'] = len(iterations)
            step_data['mapIterationDetails'] = [step_map[iter_key] for iter_key in iterations if iter_key in step_map]
            
            # If any iteration failed, mark the Map state as failed
            if any(step_map[iter_key]['status'] == 'FAILED' for iter_key in iterations if iter_key in step_map):
                step_data['status'] = 'FAILED'
                # Collect errors from failed iterations
                failed_iterations = [step_map[iter_key] for iter_key in iterations 
                                    if iter_key in step_map and step_map[iter_key]['status'] == 'FAILED']
                if failed_iterations:
                    step_data['error'] = f"Map state failed: {len(failed_iterations)} of {len(iterations)} iterations failed"
    
    # Convert to list and sort by start time
    steps = list(step_map.values())
    steps.sort(key=lambda x: x['startDate'] if x['startDate'] else '')
    
    # Clean up internal fields that shouldn't be exposed
    for step in steps:
        step.pop('eventId', None)
        step.pop('isMapState', None)
        step.pop('isMapIteration', None)
        step.pop('iterationIndex', None)
        step.pop('parentMapName', None)
        step.pop('isExecutionFailure', None)
    
    return steps

def find_step_name_for_failure_event(failure_event: Dict[str, Any], all_events: List[Dict[str, Any]], event_id_to_step: Dict[int, str]) -> Optional[str]:
    """
    Find the step name associated with a failure event by correlating with previous events
    
    Args:
        failure_event: The failure event
        all_events: All execution history events
        event_id_to_step: Mapping of event IDs to step names
        
    Returns:
        Step name if found, None otherwise
    """
    try:
        failure_event_id = failure_event['id']
        failure_event_type = failure_event['type']
        logger.debug(f"Finding step name for {failure_event_type} event ID {failure_event_id}")
        
        # Try to get the step name from previousEventId correlation
        previous_event_id = failure_event.get('previousEventId')
        if previous_event_id and previous_event_id in event_id_to_step:
            step_key = event_id_to_step[previous_event_id]
            logger.debug(f"Found step key {step_key} from previous event ID {previous_event_id}")
            return step_key
        
        # If we have a scheduled event ID, try to use that
        if 'taskFailedEventDetails' in failure_event and 'scheduledEventId' in failure_event['taskFailedEventDetails']:
            scheduled_event_id = failure_event['taskFailedEventDetails']['scheduledEventId']
            if scheduled_event_id in event_id_to_step:
                step_key = event_id_to_step[scheduled_event_id]
                logger.debug(f"Found step key {step_key} from scheduled event ID {scheduled_event_id}")
                return step_key
            
        # Alternative approach: look for the most recent TaskStateEntered event before this failure
        logger.debug(f"Searching for most recent TaskStateEntered event before failure event {failure_event_id}")
        for event in reversed(all_events):
            if event['id'] >= failure_event_id:
                continue
            if event['type'] == 'TaskStateEntered':
                step_name = event['stateEnteredEventDetails']['name']
                logger.debug(f"Found most recent TaskStateEntered event with step name {step_name}")
                return f"{step_name}_{event['id']}"
                
        # Fallback: try to extract from task details if available
        if 'taskFailedEventDetails' in failure_event:
            resource = failure_event['taskFailedEventDetails'].get('resource', '')
            if resource:
                # Extract step name from resource ARN if possible
                # This is a best-effort approach
                parts = resource.split(':')
                if len(parts) > 1:
                    step_name = parts[-1].split('/')[-1]
                    logger.debug(f"Extracted step name {step_name} from resource ARN")
                    # Since we don't have an event ID, create a synthetic one
                    return f"{step_name}_synthetic_{failure_event_id}"
        
        # If we still don't have a step name, look for any running step
        logger.debug("Searching for any running step that might be associated with this failure")
        for step_key, step_id in event_id_to_step.items():
            if step_key and step_id:
                logger.debug(f"Found potential step key {step_key}")
                return step_key
                    
        logger.warning(f"Could not find step name for failure event ID {failure_event_id}")
        return None
            
    except Exception as e:
        logger.warning(f"Error finding step name for failure event: {str(e)}")
        logger.warning(f"Error details: {traceback.format_exc()}")
        return None
