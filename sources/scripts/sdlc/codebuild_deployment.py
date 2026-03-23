#!/usr/bin/env python3
"""
CodeBuild Deployment Script

Handles IDP stack deployment and testing in AWS CodeBuild environment.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
import time
from datetime import datetime
from textwrap import dedent

import boto3

def run_command(cmd, check=True):
    """Run shell command and return result"""
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)  # nosec B602 nosemgrep: python.lang.security.audit.subprocess-shell-true.subprocess-shell-true - hardcoded commands, no user input
    if result.stdout:
        print(result.stdout)
    if result.stderr:
        print(result.stderr, file=sys.stderr)
    if check and result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}")
        raise Exception(f"Command failed: {cmd}")
    return result


def get_env_var(name, default=None):
    """Get environment variable with optional default"""
    value = os.environ.get(name, default)
    if value is None:
        raise Exception(f"Environment variable {name} is required")
    return value


def generate_stack_name():
    """Generate unique stack name with timestamp including seconds"""
    timestamp = datetime.now().strftime("%m%d-%H%M%S")  # Format: MMDD-HHMMSS
    return f"idp-{timestamp}"


def publish_templates():
    """Run publish.py to build and upload templates to S3"""
    print("📦 Publishing templates to S3...")

    # Get AWS account ID and region
    account_id = get_env_var("IDP_ACCOUNT_ID", "020432867916")
    region = get_env_var("AWS_DEFAULT_REGION", "us-east-1")

    # Generate bucket name and prefix
    bucket_basename = f"genaiic-sdlc-sourcecode-{account_id}"
    prefix = f"codebuild-{datetime.now().strftime('%Y%m%d-%H%M%S')}"

    # Run publish.sh
    cmd = f"./publish.sh {bucket_basename} {prefix} {region}"
    result = run_command(cmd)

    # Extract template URL from output - match S3 URLs only
    template_url_pattern = r"https://s3\..*?idp-main\.yaml"
    
    # Remove line breaks that might split the URL in terminal output
    clean_stdout = result.stdout.replace('\n', '').replace('\r', '')
    template_url_match = re.search(template_url_pattern, clean_stdout)

    if template_url_match:
        template_url = template_url_match.group(0)
        print(f"✅ Template published: {template_url}")
        return template_url
    else:
        print("❌ Failed to extract template URL from publish output")
        raise Exception("Failed to extract template URL from publish output")


def create_iam_resources(stack_name):
    """Create IAM role and permission boundary using CloudFormation template"""
    print(f"[{stack_name}] Creating IAM resources...")
    
    try:
        cf_client = boto3.client('cloudformation')
        iam_stack_name = f"{stack_name}-iam"
        
        # Deploy IAM CloudFormation stack
        with open('iam-roles/cloudformation-management/IDP-Cloudformation-Service-Role.yaml', 'r') as f:
            template_body = f.read()
        
        try:
            cf_client.create_stack(
                StackName=iam_stack_name,
                TemplateBody=template_body,
                Capabilities=['CAPABILITY_NAMED_IAM']
            )
            
            # Wait for stack creation to complete
            waiter = cf_client.get_waiter('stack_create_complete')
            waiter.wait(StackName=iam_stack_name, WaiterConfig={'MaxAttempts': 30, 'Delay': 10})
            
            print(f"[{stack_name}] ✅ Created IAM stack: {iam_stack_name}")
            
        except cf_client.exceptions.AlreadyExistsException:
            print(f"[{stack_name}] ℹ️ IAM stack already exists: {iam_stack_name}")
        
        # Get outputs from the stack
        response = cf_client.describe_stacks(StackName=iam_stack_name)
        outputs = response['Stacks'][0].get('Outputs', [])
        
        role_arn = None
        for output in outputs:
            if output['OutputKey'] == 'ServiceRoleArn':
                role_arn = output['OutputValue']
                break
        
        if not role_arn:
            raise Exception("Could not find ServiceRoleArn in stack outputs")
        
        # Create permission boundary policy
        iam_client = boto3.client('iam')
        boundary_name = f"{stack_name}-PermissionsBoundary"
        boundary_policy = {
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Action": "*",
                    "Resource": "*"
                }
            ]
        }
        
        try:
            iam_client.create_policy(
                PolicyName=boundary_name,
                PolicyDocument=json.dumps(boundary_policy),
                Description=f"Permissions boundary for {stack_name} IDP deployment"
            )
            print(f"[{stack_name}] ✅ Created permissions boundary: {boundary_name}")
        except iam_client.exceptions.EntityAlreadyExistsException:
            print(f"[{stack_name}] ℹ️ Permissions boundary already exists: {boundary_name}")
        
        # Get account ID for boundary ARN
        sts_client = boto3.client('sts')
        account_id = sts_client.get_caller_identity()['Account']
        boundary_arn = f"arn:aws:iam::{account_id}:policy/{boundary_name}"
        
        return role_arn, boundary_arn
        
    except Exception as e:
        print(f"[{stack_name}] ❌ Failed to create IAM resources: {e}")
        return None, None


def cleanup_iam_resources(stack_name):
    """Clean up IAM CloudFormation stack"""
    print(f"[{stack_name}] Cleaning up IAM stack...")
    
    try:
        # Clean up IAM CloudFormation stack
        cf_client = boto3.client('cloudformation')
        iam_stack_name = f"{stack_name}-iam"
        try:
            cf_client.delete_stack(StackName=iam_stack_name)
            
            # Wait for stack deletion to complete
            waiter = cf_client.get_waiter('stack_delete_complete')
            waiter.wait(StackName=iam_stack_name, WaiterConfig={'MaxAttempts': 30, 'Delay': 10})
            
            print(f"[{stack_name}] ✅ Deleted IAM stack: {iam_stack_name}")
        except cf_client.exceptions.ClientError as e:
            if 'does not exist' in str(e):
                print(f"[{stack_name}] ℹ️ IAM stack not found: {iam_stack_name}")
            else:
                print(f"[{stack_name}] ⚠️ Failed to delete IAM stack: {e}")
            
    except Exception as e:
        print(f"[{stack_name}] ❌ Failed to cleanup IAM stack: {e}")


def deploy_and_test_stack(stack_name, admin_email, template_url):
    """Deploy and test the unified IDP stack"""
    print(f"Starting deployment: {stack_name}")

    try:
        # Step 0: Create IAM resources
        print("Step 0: Creating IAM resources...")
        role_arn, permissions_boundary_arn = create_iam_resources(stack_name)
        if not role_arn or not permissions_boundary_arn:
            raise Exception("Failed to create required IAM resources")
        
        # Step 1: Deploy using template URL
        print("Step 1: Deploying stack...")
        cmd = f"idp-cli deploy --stack-name {stack_name} --template-url {template_url} --admin-email {admin_email} --wait"
        cmd += f" --role-arn {role_arn}"
        cmd += f" --parameters PermissionsBoundaryArn={permissions_boundary_arn}"
        
        run_command(cmd)
        print(f"✅ Deployment completed")

        # Step 2: Test stack status
        print(f"Step 2: Verifying stack status...")
        cmd = f"aws cloudformation describe-stacks --stack-name {stack_name} --query 'Stacks[0].StackStatus' --output text"
        result = run_command(cmd)

        if "COMPLETE" not in result.stdout:
            print(f"❌ Stack status: {result.stdout.strip()}")
            return {
                "stack_name": stack_name,
                "success": False,
                "error": f"Stack deployment failed with status: {result.stdout.strip()}"
            }

        print(f"✅ Stack is healthy")

        # Step 3: Test with default config
        print(f"Step 3: Testing with default config...")
        batch_id = "test-default"
        sample_file = "lending_package.pdf"
        verify_string = "ANYTOWN, USA 12345"
        result_location = "pages/1/result.json"
        content_path = "text"

        if not run_inference_test(stack_name, sample_file, batch_id, verify_string, result_location, content_path, None):
            return {
                "stack_name": stack_name,
                "success": False,
                "error": "Default config test failed"
            }

        # Step 4: Upload and test BDA config
        print(f"Step 4: Testing with BDA mode...")
        config_version = "test-bda"
        config_path = "config_library/unified/lending-package-sample/config.yaml"
        
        # Create temporary BDA config by toggling use_bda flag
        with open(config_path, 'r') as f:
            config_content = f.read()
        
        # Toggle use_bda to true
        bda_config_content = config_content.replace('use_bda: false', 'use_bda: true')
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.yaml', delete=False) as tmp:
            tmp.write(bda_config_content)
            bda_config_path = tmp.name
        
        try:
            # Upload BDA config
            print(f"Uploading BDA config (use_bda: true)")
            cmd = f"idp-cli config-upload --stack-name {stack_name} --config-file {bda_config_path} --config-version {config_version}"
            run_command(cmd)
            
            # Activate BDA config (triggers auto-sync)
            print(f"Activating BDA config version: {config_version}")
            cmd = f"idp-cli config-activate --stack-name {stack_name} --config-version {config_version}"
            run_command(cmd)
            print(f"✅ BDA config activated and synced")
            
            # Run inference with BDA config version
            # BDA writes text to parsedResult.json
            batch_id = "test-bda"
            bda_result_location = "pages/1/parsedResult.json"
            if not run_inference_test(stack_name, sample_file, batch_id, verify_string, bda_result_location, content_path, config_version):
                return {
                    "stack_name": stack_name,
                    "success": False,
                    "error": "BDA config test failed"
                }
        finally:
            # Clean up temp file
            os.unlink(bda_config_path)

        # Step 5: Test rule validation
        print(f"Step 5: Testing rule validation...")
        config_version = "rule-validation"
        config_path = "config_library/unified/rule-validation/config.yaml"
        sample_file = "Prior-Auth-12345678.pdf"
        sample_dir = "samples/rule-validation"
        batch_id = "test-rules"
        verify_string = "global_periods"
        result_location = "rule_validation/sections/section_1_responses.json"
        content_path = "responses.global_periods.0.rule_type"
        
        # Upload rule validation config
        print(f"Uploading rule validation config from: {config_path}")
        cmd = f"idp-cli config-upload --stack-name {stack_name} --config-file {config_path} --config-version {config_version}"
        run_command(cmd)
        
        # Run inference test with rule validation
        if not run_inference_test(stack_name, sample_file, batch_id, verify_string, result_location, content_path, config_version, sample_dir):
            return {
                "stack_name": stack_name,
                "success": False,
                "error": "Rule validation test failed"
            }

        print(f"✅ All tests passed")
        return {
            "stack_name": stack_name,
            "success": True,
            "verification_string": verify_string
        }

    except Exception as e:
        print(f"❌ Testing failed: {e}")
        return {
            "stack_name": stack_name,
            "success": False,
            "error": f"Deployment/testing failed: {str(e)}"
        }


def run_inference_test(stack_name, sample_file, batch_id, verify_string, result_location, content_path, config_version=None, sample_dir="samples"):
    """Run inference test and verify results"""
    try:
        # Run inference
        print(f"Running inference with batch-id: {batch_id}...")
        cmd = f"idp-cli run-inference --stack-name {stack_name} --dir {sample_dir} --file-pattern {sample_file} --batch-id {batch_id} --monitor"
        if config_version:
            cmd += f" --config-version {config_version}"
        run_command(cmd)
        print(f"✅ Inference completed")

        # Download results
        print(f"Downloading results...")
        result_dir = f"/tmp/result-{batch_id}"  # nosec B108 - isolated CodeBuild environment
        cmd = f"idp-cli download-results --stack-name {stack_name} --batch-id {batch_id} --output-dir {result_dir}"
        run_command(cmd)

        # Verify result content
        print(f"Verifying result content...")

        # Find result file
        cmd = f"find {result_dir} -path '*/{result_location}' | head -1"
        result = run_command(cmd, check=False)
        result_file = result.stdout.strip()

        if not result_file:
            cmd = f"find {result_dir} -name 'result.json' | head -10"
            debug_result = run_command(cmd, check=False)
            print(f"Found result.json files:")
            print(debug_result.stdout)
            print(f"❌ No result file found at {result_location}")
            return False

        # Verify content
        with open(result_file, "r") as f:
            result_json = json.load(f)

        text_content = result_json
        for key in content_path.split("."):
            if key.isdigit():
                text_content = text_content[int(key)]
            else:
                text_content = text_content[key]

        if verify_string not in str(text_content):
            print(f"❌ Text content does not contain expected string: '{verify_string}'")
            print(f"Actual text starts with: '{str(text_content)[:100]}...'")
            return False

        print(f"✅ Found expected verification string: '{verify_string}'")
        return True

    except Exception as e:
        print(f"❌ Inference test failed: {e}")
        return False


def get_codebuild_logs():
    """Get CodeBuild logs from CloudWatch"""
    try:
        # Get CodeBuild build ID from environment
        build_id = os.environ.get('CODEBUILD_BUILD_ID', '')
        if not build_id:
            return "CodeBuild logs not available (not running in CodeBuild)"
        
        # Wait for logs to propagate to CloudWatch
        time.sleep(10)
        
        # Extract log group and stream from build ID
        log_group = f"/aws/codebuild/{build_id.split(':')[0]}"
        log_stream = build_id.split(':')[-1]
        
        # Get logs from CloudWatch
        logs_client = boto3.client('logs')
        response = logs_client.get_log_events(
            logGroupName=log_group,
            logStreamName=log_stream,
            startFromHead=True
        )
        
        # Extract log messages
        log_messages = []
        for event in response.get('events', []):
            log_messages.append(event['message'])
        
        return '\n'.join(log_messages)
        
    except Exception as e:
        return f"Failed to retrieve CodeBuild logs: {str(e)}"


def generate_publish_failure_summary(publish_error):
    """Generate summary for publish/build failures"""
    try:
        bedrock = boto3.client('bedrock-runtime')
        
        prompt = dedent(f"""
        You are a build system analyst. Analyze this publish/build failure and provide specific technical guidance.

        Publish Error: {publish_error}
        
        Build Logs:
        {get_codebuild_logs()}

        ANALYZE THE LOGS FOR ALL ERROR TYPES:
        - Python linting/formatting errors (ruff check failed, code formatting check failed)
        - Python syntax errors (py_compile failures, SyntaxError, IndentationError)
        - UI build failures (npm ci errors, package-lock.json sync issues, missing @esbuild packages)
        - AWS/Infrastructure errors (S3 access denied, CloudFormation validation failed, SAM build/package failures)
        - Missing prerequisites (aws/sam not found, version requirements not met)
        - File system errors (missing files, permission denied, disk space issues)
        - Dependency issues (pip install failures, missing Python packages, Docker build errors)
        - Lambda validation failures (missing idp_common in builds, import test failures)

        Create a summary focused on BUILD/PUBLISH issues with bullet points:

        🔧 BUILD FAILURE ANALYSIS

        📋 Component Status:
        • UI Build: FAILED - npm dependency issues
        • Lambda Build: SUCCESS - All patterns built correctly
        • Template Publish: FAILED - S3 access denied

        🔍 Technical Root Cause:
        • Extract exact error messages from logs (ruff, npm, pip, aws, sam errors)
        • Identify specific missing packages, version conflicts, or permission issues
        • Focus on build-time errors, not deployment errors
        • Check AWS credentials, S3 bucket permissions, and file access issues

        💡 Fix Commands:
        • Provide specific commands based on actual error found
        • For linting: run ruff format . && ruff check --fix .
        • For npm: cd src/ui && rm package-lock.json && npm install
        • For AWS S3: aws s3 ls s3://bucket-name to test access
        • For permissions: chmod +x script.sh or check IAM policies

        Keep each bullet point under 75 characters. Use sub-bullets for details.
        
        IMPORTANT: Respond ONLY with the bullet format above. Do not include any text before or after.
        """)
        
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        
        response_body = json.loads(response['body'].read())
        summary = response_body['content'][0]['text']
        
        return summary
        
    except Exception as e:
        return f"⚠️ Failed to generate build failure summary: {e}"


def get_cloudformation_logs(stack_name):
    """Get CloudFormation stack events for error analysis"""
    try:
        cf_client = boto3.client('cloudformation')
        all_failed_events = []
        
        # Get events from main stack
        all_events = []
        next_token = None
        
        while True:
            if next_token:
                response = cf_client.describe_stack_events(
                    StackName=stack_name,
                    NextToken=next_token
                )
            else:
                response = cf_client.describe_stack_events(StackName=stack_name)
            
            events = response.get('StackEvents', [])
            all_events.extend(events)
            
            next_token = response.get('NextToken')
            if not next_token:
                break
        
        # Filter for failed events and extract nested stack ARNs
        nested_stack_arns = []
        for event in all_events:
            status = event.get('ResourceStatus', '')
            if 'FAILED' in status or 'ROLLBACK' in status:
                all_failed_events.append({
                    'stack_name': stack_name,
                    'timestamp': event.get('Timestamp', '').isoformat() if event.get('Timestamp') else '',
                    'resource_type': event.get('ResourceType', ''),
                    'logical_id': event.get('LogicalResourceId', ''),
                    'status': status,
                    'reason': event.get('ResourceStatusReason', 'No reason provided')
                })
                
                # Extract nested stack ARN from CREATE_FAILED events
                if (status == 'CREATE_FAILED' and 
                    event.get('ResourceType') == 'AWS::CloudFormation::Stack' and
                    'Embedded stack arn:aws:cloudformation:' in event.get('ResourceStatusReason', '')):
                    reason = event.get('ResourceStatusReason', '')
                    start = reason.find('arn:aws:cloudformation:')
                    end = reason.find(' was not successfully created')
                    if start != -1 and end != -1:
                        nested_arn = reason[start:end]
                        nested_stack_arns.append(nested_arn)
        
        # Get events from nested stacks
        for nested_arn in nested_stack_arns:
            try:
                nested_events = []
                next_token = None
                
                while True:
                    if next_token:
                        response = cf_client.describe_stack_events(
                            StackName=nested_arn,
                            NextToken=next_token
                        )
                    else:
                        response = cf_client.describe_stack_events(StackName=nested_arn)
                    
                    events = response.get('StackEvents', [])
                    nested_events.extend(events)
                    
                    next_token = response.get('NextToken')
                    if not next_token:
                        break
                
                # Add failed events from nested stack
                for event in nested_events:
                    status = event.get('ResourceStatus', '')
                    if 'FAILED' in status or 'ROLLBACK' in status:
                        all_failed_events.append({
                            'stack_name': nested_arn.split('/')[-2],  # Extract stack name from ARN
                            'timestamp': event.get('Timestamp', '').isoformat() if event.get('Timestamp') else '',
                            'resource_type': event.get('ResourceType', ''),
                            'logical_id': event.get('LogicalResourceId', ''),
                            'status': status,
                            'reason': event.get('ResourceStatusReason', 'No reason provided')
                        })
                        
            except Exception:
                # Skip nested stacks we can't access
                continue
        
        return all_failed_events
        
    except Exception as e:
        return [{'error': f"Failed to retrieve CloudFormation logs: {str(e)}"}]


def generate_deployment_summary(result, stack_name, template_url):
    """Generate deployment summary using Bedrock API with CodeBuild and CloudFormation logs"""
    try:
        # Get CodeBuild logs
        deployment_logs = get_codebuild_logs()
        
        # Initialize Bedrock client
        bedrock = boto3.client('bedrock-runtime')
        
        # Create prompt for Bedrock with structured analysis
        prompt = dedent(f"""
        You are an AWS deployment analyst. Analyze deployment result and determine appropriate response.

        Deployment Information:
        - Stack Name: {stack_name}
        - Template URL: {template_url}

        Deployment Result (ANALYZE THIS FIRST):
        {json.dumps(result, indent=2)}

        CodeBuild Logs:
        {deployment_logs}

        STEP 1: Check Deployment Result for failure classification:
        - If success: true → SUCCESS CASE
        - If error contains "No result file found" or "verification failed" or "no rule_validation directory" → SMOKE TEST FAILURE
        - If error contains "deployment failed" or "CREATE_FAILED" or "timeout" → INFRASTRUCTURE FAILURE

        STEP 2: Respond based on classification:

        FOR SUCCESS CASE:
        🚀 DEPLOYMENT RESULTS

        📋 Stack Status: {stack_name} deployed successfully
        
        ✅ All Tests Passed:
        • Test 1: Default config with text extraction
        • Test 2: BDA mode config (use_bda: true) upload and inference
        • Test 3: Rule validation config and processing

        FOR INFRASTRUCTURE FAILURE:
        Respond ONLY with: "NEED_CF_LOGS: {stack_name}"

        FOR SMOKE TEST FAILURE:
        🚀 DEPLOYMENT RESULTS

        📋 Test Status: FAILED - [extract which test failed from error message]

        🔍 Root Cause Analysis:
        • Extract specific error from result
        • Identify which test failed (default config, BDA mode, or rule validation)
        • Focus on post-deployment verification issues

        💡 Fix Commands:
        • Provide specific commands to resolve verification issues

        Keep each bullet point under 75 characters.
        
        IMPORTANT: Only use NEED_CF_LOGS for actual infrastructure/deployment failures, NOT for smoke test failures.
        """)
        
        # Call Bedrock API
        response = bedrock.invoke_model(
            modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 4000,
                "messages": [{"role": "user", "content": prompt}]
            })
        )
        
        response_body = json.loads(response['body'].read())
        initial_summary = response_body['content'][0]['text']
        
        # Check if we need CloudFormation logs
        if initial_summary.startswith("NEED_CF_LOGS"):
            print("🔍 Getting CloudFormation logs for detailed analysis...")
            # Get CloudFormation logs for failed stacks
            logs = []
            if not result["success"] and result.get("stack_name") and result["stack_name"] != "N/A":
                print(f"📋 Getting CF logs for: {result['stack_name']}")
                try:
                    logs = get_cloudformation_logs(result["stack_name"])
                    # Check if we got actual events or just error messages
                    if logs and not (len(logs) == 1 and 'error' in logs[0]):
                        print(f"✅ Retrieved {len(logs)} events for {result['stack_name']}")
                    else:
                        error_msg = logs[0].get('error', 'Unknown error') if logs else 'No logs returned'
                        print(f"⚠️ Failed to get CF logs for {result['stack_name']}: {error_msg}")
                        logs= [{"error": error_msg, "stack_name": result["stack_name"]}]
                except Exception as e:
                    print(f"⚠️ Exception getting CF logs for {result['stack_name']}: {e}")
                    logs = [{"error": f"Exception: {str(e)}", "stack_name": result["stack_name"]}]
            
            print(f"✅ Retrieved {len(logs)} CF logs for {stack_name}")
            
            # Always proceed with second Bedrock call, even with partial/error data
            print("🤖 Making second Bedrock call with available CF data...")
            cf_prompt = dedent(f"""
            Analyze CloudFormation error events to determine root cause of deployment failures.

            Pattern Results:
            {json.dumps(result, indent=2)}

            CloudFormation Error Events:
            {json.dumps(logs, indent=2)}

            IMPORTANT: Stack may have failed to retrieve logs (check for "error" fields).
            For log retrieval errors, base analysis on the result error messages.
            
            Search through the events and find CREATE_FAILED events. Determine the root cause based on ResourceStatusReason.
            If no events available due to log retrieval failures, analyze the error messages for clues.

            Provide analysis in this format:

            🚀 DEPLOYMENT RESULT

            📋 Status:
            [Determine actual status from the data provided]

            🔍 CloudFormation Root Cause:
            • Find CREATE_FAILED events and extract ResourceStatusReason
            • Identify which specific resources failed to create
            • Analyze error messages for technical root cause

            💡 Fix Commands:
            • Provide specific AWS CLI commands based on actual failures found
            • Focus on the resources that actually failed

            Keep each bullet point under 75 characters.
            """)
            
            cf_response = bedrock.invoke_model(
                modelId='anthropic.claude-3-5-sonnet-20240620-v1:0',
                body=json.dumps({
                    "anthropic_version": "bedrock-2023-05-31",
                    "max_tokens": 4000,
                    "messages": [{"role": "user", "content": cf_prompt}]
                })
            )
            
            cf_response_body = json.loads(cf_response['body'].read())
            print("✅ Second Bedrock call completed successfully")
            return cf_response_body['content'][0]['text']
        
        return initial_summary
        
    except Exception as e:
        # Manual summary when Bedrock unavailable
        return dedent(f"""
        DEPLOYMENT SUMMARY (MANUAL)
        
        Deployment result {stack_name} : {'SUCCESS' if result['success'] else 'FAILED'}
        
        Error: Failed to generate AI analysis: {e}
        """)

def cleanup_stack(result):
    """Clean up stack"""
    stack_name = result.get("stack_name")
    print(f"🧹 Starting cleanup for stack: {stack_name}")
    try:
        # Check stack status first
        cmd_result = run_command(f"aws cloudformation describe-stacks --stack-name {stack_name} --query 'Stacks[0].StackStatus' --output text", check=False)
        stack_status = cmd_result.stdout.strip() if cmd_result.returncode == 0 else "NOT_FOUND"
        
        print(f"[{stack_name}] stack status: {stack_status}")
        
        # Delete the stack and wait for completion (includes all cleanup via --force-delete-all)
        print(f"[{stack_name}] attempting stack deletion...")
        run_command(f"idp-cli delete --stack-name {stack_name} --force --empty-buckets --force-delete-all --wait", check=False)
        
        print(f"[{stack_name}] ✅ Cleanup completed")
        
        # Clean up CodeBuild-specific IAM resources
        cleanup_iam_resources(stack_name)
    except Exception as e:
        print(f"⚠️ Cleanup task failed: {e}")

def main():
    """Main execution function"""
    print("Starting CodeBuild deployment process...")

    admin_email = get_env_var("IDP_ADMIN_EMAIL", "tanimath@amazon.com")
    stack_name = generate_stack_name()

    print(f"Stack Name: {stack_name}")
    print(f"Admin Email: {admin_email}")

    #initialize AI summary
    ai_summary = ""
    publish_success = False
    stack_success = False

    # Step 1: Publish templates to S3
    try:
        template_url = publish_templates()
        print(f"Publish script ran successfully template url {template_url}")
        publish_success = True
    except Exception as e:
        print(f"❌ Publish failed: {e}")
        ai_summary = generate_publish_failure_summary(str(e))
    
    
    if publish_success:
        # Step 2: Deploy and test patterns concurrently (only if publish succeeded)
        print(f"🚀 Starting deployment for stack: {stack_name}")
        try:
            result = deploy_and_test_stack(stack_name, admin_email, template_url)
            if not result["success"]:
                print(f"[{stack_name}] ❌ Failed")
            else:
                stack_success = True
                print(f"[{stack_name}] ✅ Success")
        except Exception as e:
            print(f"[{stack_name}] ❌ Exception: {e}")
            # Add failed result for exception cases
            result = {"stack_name": stack_name, "success": False, "error": str(e)}
    
        # Step 3: Generate deployment summary using Bedrock (but don't print yet)
        try:
            ai_summary = generate_deployment_summary(result, stack_name, template_url)
        except Exception as e:
            ai_summary = f"⚠️ Failed to generate deployment summary: {e}"

        # Step 4: clean up stack
        cleanup_stack(result)

    # Step 5: Print AI analysis results at the end
    print("\n🤖 Generating deployment summary with Bedrock...")
    if ai_summary:
        print(ai_summary)

    # Check final status after all cleanups are done
    if stack_success:
        print(f"🎉 Stack: {stack_name} deployment completed successfully!")
        sys.exit(0)
    else:
        print(f"💥 Stack: {stack_name} deployment failed!")
        sys.exit(1)


if __name__ == "__main__":
    main()
