# Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
# SPDX-License-Identifier: MIT-0
import json
import boto3
import os
import uuid
import urllib.request
import urllib.error
import time

sagemaker = boto3.client('sagemaker')
sts = boto3.client('sts')

def get_remaining_time_in_millis(context):
    """
    Get remaining execution time for the Lambda function.
    
    Args:
        context: Lambda context object
        
    Returns:
        int: Remaining time in milliseconds
    """
    if context and hasattr(context, 'get_remaining_time_in_millis'):
        return context.get_remaining_time_in_millis()
    return 300000  # Default to 5 minutes if context is not available

def calculate_safe_wait_time(context, default_wait_time, buffer_time=30):
    """
    Calculate a safe wait time that doesn't exceed Lambda timeout.
    
    Args:
        context: Lambda context object
        default_wait_time (int): Default wait time in seconds
        buffer_time (int): Buffer time in seconds to leave for cleanup
        
    Returns:
        int: Safe wait time in seconds
    """
    remaining_ms = get_remaining_time_in_millis(context)
    remaining_seconds = remaining_ms // 1000
    safe_wait_time = max(30, remaining_seconds - buffer_time)  # Minimum 30 seconds
    
    return min(default_wait_time, safe_wait_time)

def sanitize_name(name, max_length=63):
    """
    Convert a name to AWS-compliant format for HumanTaskUI
    Requirements:
    - Must be lowercase alphanumeric
    - Can contain hyphens only between alphanumeric characters
    - Maximum length of 63 characters
    """
    # Convert to lowercase
    name = name.lower()
    
    # Convert underscores to hyphens
    name = name.replace('_', '-')
    
    # Process the string character by character to ensure hyphens are only between alphanumeric
    result = []
    for i, char in enumerate(name):
        if char.isalnum():
            result.append(char)
        elif char == '-' and i > 0 and i < len(name) - 1:
            # Only add hyphen if it's between alphanumeric characters
            if name[i-1].isalnum() and name[i+1].isalnum():
                result.append(char)
    
    name = ''.join(result)
    
    # Ensure it's not empty
    if not name:
        name = 'default'
    
    # Ensure it starts with alphanumeric
    if not name[0].isalnum():
        name = 'a' + name
    
    # Truncate to max length while preserving word boundaries
    if len(name) > max_length:
        # Try to truncate at last hyphen before max_length
        last_hyphen = name.rfind('-', 0, max_length)
        if last_hyphen > 0:
            name = name[:last_hyphen]
        else:
            name = name[:max_length]
    
    return name

def generate_resource_names(stack_name):
    """
    Generate AWS-compliant names for A2I resources
    """
    base_name = sanitize_name(stack_name)
    return {
        'human_task_ui': f'{base_name}-hitl-ui',  # Keep hyphens for readability
        'flow_definition': f'{base_name}-hitl-fd'  # Keep hyphens for readability
    }

def get_account_id():
    """Get the current AWS account ID"""
    try:
        return sts.get_caller_identity()['Account']
    except Exception as e:
        print(f"Warning: Could not get account ID: {e}")
        return ""

def get_region():
    """Get the current AWS region"""
    return os.environ.get('AWS_REGION', os.environ.get('AWS_DEFAULT_REGION', 'us-west-2'))

def send_cfn_response(event, context, response_status, response_data, physical_resource_id=None, no_echo=False):
    """Send a response to CloudFormation to indicate success or failure"""
    response_url = event['ResponseURL']
    
    print(f"CFN response URL: {response_url}")
    
    response_body = {
        'Status': response_status,
        'Reason': f"See details in CloudWatch Log Stream: {context.log_stream_name}",
        'PhysicalResourceId': physical_resource_id or context.log_stream_name,
        'StackId': event['StackId'],
        'RequestId': event['RequestId'],
        'LogicalResourceId': event['LogicalResourceId'],
        'NoEcho': no_echo,
        'Data': response_data
    }
    
    json_response_body = json.dumps(response_body)
    
    print(f"Response body: {json_response_body}")
    
    headers = {
        'content-type': '',
        'content-length': str(len(json_response_body))
    }
    
    try:
        response = urllib.request.Request(response_url, 
                                        data=json_response_body.encode('utf-8'),
                                        headers=headers,
                                        method='PUT')
        
        with urllib.request.urlopen(response) as response:
            print(f"Status code: {response.getcode()}")
            print(f"Status message: {response.msg}")
            
        return True
    except Exception as e:
        print(f"Error sending response to CloudFormation: {str(e)}")
        return False

def create_human_task_ui(human_task_ui_name):
    # human_task_ui_name = f'{stack_name}-bda-hitl-template'
    ui_template_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Document Review - Professional Interface</title>
        <script src="https://assets.crowd.aws/crowd-html-elements.js"></script>
        <style>
            :root {
                --primary-blue: #0073e6;
                --secondary-blue: #e6f3ff;
                --dark-blue: #004d99;
                --light-gray: #f8f9fa;
                --border-gray: #dee2e6;
                --success-green: #28a745;
                --warning-red: #dc3545;
                --text-dark: #212529;
                --shadow: 0 2px 10px rgba(0,0,0,0.1);
            }

            * { box-sizing: border-box; }
            
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                margin: 0; padding: 0;
                height: 100vh; overflow: hidden;
                background: var(--light-gray);
            }
            
            .container { 
                display: flex; height: 100vh;
                box-shadow: var(--shadow);
            }
            
            .image-pane { 
                width: 65%; padding: 15px;
                background: white; position: relative;
                border-right: 2px solid var(--border-gray);
            }
            
            .review-pane { 
                width: 35%; padding: 15px;
                display: flex; flex-direction: column;
                background: var(--light-gray);
            }
            
            .controls-bar {
                display: flex; justify-content: space-between;
                align-items: center; margin-bottom: 15px;
                padding: 10px; background: var(--secondary-blue);
                border-radius: 6px; box-shadow: var(--shadow);
            }
            
            .zoom-controls { 
                display: flex; gap: 8px;
            }
            
            .zoom-controls button {
                background: var(--primary-blue);
                color: white; border: none;
                padding: 6px 12px; border-radius: 4px;
                cursor: pointer; font-size: 12px;
                transition: all 0.2s ease;
            }
            
            .zoom-controls button:hover {
                background: var(--dark-blue);
                transform: translateY(-1px);
            }
            
            .image-container {
                position: relative; overflow: auto;
                height: calc(100vh - 80px);
                border: 1px solid var(--border-gray);
                border-radius: 6px; background: white;
            }
            
            #documentImage { 
                display: block; margin: 0 auto;
                cursor: crosshair; border-radius: 4px;
                transition: transform 0.3s ease;
            }
            
            .highlight-box {
                position: absolute; z-index: 10;
                border: 3px solid var(--primary-blue);
                background: rgba(0,115,230,0.15);
                pointer-events: none; border-radius: 2px;
                box-shadow: 0 0 10px rgba(0,115,230,0.3);
            }
            
            .document-info { 
                background: white; padding: 15px;
                border-radius: 8px; margin-bottom: 15px;
                box-shadow: var(--shadow); border-left: 4px solid var(--primary-blue);
            }
            
            .info-toggle {
                cursor: pointer; display: flex;
                justify-content: space-between; align-items: center;
                color: var(--primary-blue); font-weight: 600;
            }
            
            .info-content {
                margin-top: 10px; display: none;
                font-size: 13px; color: var(--text-dark);
            }
            
            .info-content.expanded { display: block; }
            
            .info-content p {
                margin: 5px 0; padding: 3px 0;
                border-bottom: 1px solid #f0f0f0;
            }
            
            .scroll-container {
                flex: 1; overflow-y: auto;
                padding-right: 8px; max-height: calc(100vh - 300px);
            }
            
            .key-value-pair { 
                margin-bottom: 15px; padding: 15px;
                border: 1px solid var(--border-gray);
                border-radius: 8px; background: white;
                transition: all 0.2s ease; cursor: pointer;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .key-value-pair:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                border-color: var(--primary-blue);
            }
            
            .key-value-pair label {
                display: block; font-weight: 600;
                color: var(--primary-blue); margin-bottom: 8px;
                font-size: 14px;
            }
            
            .key-value-pair crowd-input {
                width: 100%; margin-bottom: 8px;
            }
            
            .confidence-display {
                display: flex; justify-content: space-between;
                align-items: center; font-size: 12px;
                margin-top: 5px;
            }
            
            .confidence-score {
                font-weight: 600; padding: 2px 6px;
                border-radius: 3px;
            }
            
            .confidence-low { 
                color: var(--warning-red);
                background: rgba(220,53,69,0.1);
            }
            
            .confidence-high { 
                color: var(--success-green);
                background: rgba(40,167,69,0.1);
            }
            
            .threshold-info {
                color: #6c757d; font-size: 11px;
            }
            
            .missing-value {
                color: var(--warning-red);
                font-size: 12px; margin-top: 5px;
                padding: 5px; background: rgba(220,53,69,0.1);
                border-radius: 3px; border-left: 3px solid var(--warning-red);
            }
            
            .tab-container {
                background: white; border-radius: 8px;
                box-shadow: var(--shadow); margin-bottom: 15px;
            }
            
            .tab-buttons {
                display: flex; border-bottom: 1px solid var(--border-gray);
            }
            
            .tab-button {
                flex: 1; padding: 12px; text-align: center;
                background: var(--light-gray); border: none;
                cursor: pointer; font-weight: 600;
                color: var(--text-dark); transition: all 0.2s ease;
                border-radius: 8px 8px 0 0;
            }
            
            .tab-button.active {
                background: white; color: var(--primary-blue);
                border-bottom: 2px solid var(--primary-blue);
            }
            
            .tab-button:hover:not(.active) {
                background: var(--secondary-blue);
            }
            
            .tab-content {
                padding: 15px; display: none;
            }
            
            .tab-content.active {
                display: block;
            }
            
            .instructions-list {
                list-style: none; padding: 0; margin: 0;
            }
            
            .instructions-list li {
                padding: 10px 0; border-bottom: 1px solid #f0f0f0;
                display: flex; align-items: flex-start; gap: 10px;
            }
            
            .instructions-list li:last-child {
                border-bottom: none;
            }
            
            .step-number {
                background: var(--primary-blue); color: white;
                width: 24px; height: 24px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 12px; font-weight: 600; flex-shrink: 0;
            }
            
            .step-text {
                flex: 1; font-size: 14px; line-height: 1.4;
            }
            
            .verification-section {
                background: white; padding: 15px;
                border-radius: 8px; margin-top: 15px;
                box-shadow: var(--shadow); border-left: 4px solid var(--success-green);
            }
            
            .verification-checkbox {
                display: flex; align-items: center;
                gap: 10px; margin-bottom: 15px;
            }
            
            .verification-checkbox input[type="checkbox"] {
                width: 18px; height: 18px;
                accent-color: var(--success-green);
            }
            
            .verification-checkbox label {
                font-weight: 600; color: var(--text-dark);
                cursor: pointer;
            }
            
            .submit-button {
                background: var(--success-green);
                color: white; border: none;
                padding: 12px 24px; border-radius: 6px;
                cursor: pointer; font-weight: 600;
                transition: all 0.2s ease; width: 100%;
                opacity: 0.5; pointer-events: none;
            }
            
            .submit-button.enabled {
                opacity: 1; pointer-events: auto;
            }
            
            .submit-button.enabled:hover {
                background: #218838;
                transform: translateY(-1px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            }
            
            h3 { 
                color: var(--primary-blue); margin: 0 0 15px 0;
                font-size: 18px; font-weight: 600;
            }
            
            select {
                width: 100%; padding: 8px;
                border: 1px solid var(--border-gray);
                border-radius: 4px; background: white;
                color: var(--text-dark);
            }
        </style>
    </head>
    <body>
        <crowd-form>
            <div class="container">
                <!-- Image Pane -->
                <div class="image-pane">
                    <div class="controls-bar">
                        <div class="zoom-controls">
                            <button type="button" onclick="zoom(1.2)">Zoom In (+)</button>
                            <button type="button" onclick="zoom(0.8)">Zoom Out (-)</button>
                            <button type="button" onclick="resetZoom()">Reset</button>
                        </div>
                        <div style="color: var(--primary-blue); font-weight: 600;">
                            Document Viewer
                        </div>
                    </div>
                    <div class="image-container" id="imageContainer">
                        <img id="documentImage" 
                            src="{{ task.input.sourceDocument | grant_read_access }}" 
                            onload="initImage()">
                    </div>
                </div>

                <!-- Review Pane -->
                <div class="review-pane">
                    <div class="document-info">
                        <div class="info-toggle" onclick="toggleInfo()">
                            <span>📄 Document Information</span>
                            <span id="toggleIcon">▼</span>
                        </div>
                        <div class="info-content" id="infoContent">
                            <p><strong>Blueprint:</strong> {{ task.input.blueprintName | escape }}</p>
                            <p><strong>Blueprint Confidence:</strong> {{ task.input.bp_confidence | round: 2 }}</p>
                            <p><strong>Threshold:</strong> {{ task.input.confidenceThreshold | round: 2 }}</p>
                            <p><strong>Page:</strong> {{ task.input.page_number }}</p>
                            <p><strong>Execution ID:</strong> {{ task.input.execution_id }}</p>
                            
                            <label for="blueprintSelection" style="margin-top: 10px; display: block;"><strong>Select Blueprint:</strong></label>
                            <select name="blueprintSelection" id="blueprintSelection" required disabled onchange="handleBlueprintChange()">
                                {% for option in task.input.blueprintOptions %}
                                    <option value="{{ option.value | escape }}" {% if option.value == task.input.blueprintName %}selected{% endif %}>
                                        {{ option.label | escape }}
                                    </option>
                                {% endfor %}
                            </select>
                        </div>
                    </div>

                    <!-- Tab Container -->
                    <div class="tab-container">
                        <div class="tab-buttons">
                            <button type="button" class="tab-button active" onclick="switchTab('review')">📋 Review</button>
                            <button type="button" class="tab-button" onclick="switchTab('instructions')">📖 Instructions</button>
                        </div>
                        
                        <!-- Review Tab Content -->
                        <div id="reviewTab" class="tab-content active">
                            <!-- Scrollable Key Value Section -->
                            <div class="scroll-container">
                                <h3>🔍 Field Review</h3>
                                {% for pair in task.input.keyValuePairs %}
                                    {% assign bbox_index = forloop.index0 %}
                                    <div class="key-value-pair" 
                                        data-key="{{ pair.key | escape }}" 
                                        data-bbox="{{ task.input.boundingBoxes[bbox_index].bounding_box | to_json | escape }}"
                                        onclick="highlightBBox(this)">
                                        <label>{{ pair.key | escape }}</label>
                                        <crowd-input 
                                            name="{{ pair.key | escape }}" 
                                            value="{{ pair.value | escape }}">
                                        </crowd-input>
                                        <div class="confidence-display">
                                            <span class="confidence-score confidence-{% if pair.confidence < task.input.confidenceThreshold %}low{% else %}high{% endif %}">
                                                {{ pair.confidence | round: 2 }}
                                            </span>
                                            <span class="threshold-info">
                                                Threshold: {{ task.input.confidenceThreshold | round: 2 }}
                                            </span>
                                        </div>
                                        {% if pair.value == "" %}
                                            <div class="missing-value">
                                                ⚠️ Value missing - please verify and complete
                                            </div>
                                        {% endif %}
                                    </div>
                                {% endfor %}
                            </div>
                        </div>
                        
                        <!-- Instructions Tab Content -->
                        <div id="instructionsTab" class="tab-content">
                            <div class="scroll-container">
                                <h3>📖 How to Review Documents</h3>
                                <ul class="instructions-list">
                                    <li>
                                        <div class="step-number">1</div>
                                        <div class="step-text">
                                            <strong>View the Document:</strong> Use zoom controls to examine the document clearly. The document viewer supports zoom in/out and reset functions.
                                        </div>
                                    </li>
                                    <li>
                                        <div class="step-number">2</div>
                                        <div class="step-text">
                                            <strong>Click on Fields:</strong> Click any field in the Review tab to highlight its location on the document. This helps you verify the extracted information.
                                        </div>
                                    </li>
                                    <li>
                                        <div class="step-number">3</div>
                                        <div class="step-text">
                                            <strong>Check Confidence Scores:</strong> Each field shows a confidence score. Red scores are below the threshold and need extra attention.
                                        </div>
                                    </li>
                                    <li>
                                        <div class="step-number">4</div>
                                        <div class="step-text">
                                            <strong>Verify and Edit:</strong> Compare extracted values with the document. Edit any incorrect values directly in the input fields.
                                        </div>
                                    </li>
                                    <li>
                                        <div class="step-number">5</div>
                                        <div class="step-text">
                                            <strong>Complete Missing Values:</strong> Fields marked with ⚠️ are missing values. Fill them in based on the document content.
                                        </div>
                                    </li>
                                    <li>
                                        <div class="step-number">6</div>
                                        <div class="step-text">
                                            <strong>Final Review:</strong> Once satisfied with all fields, check "I have reviewed all fields" and submit your review.
                                        </div>
                                    </li>
                                </ul>
                                
                                <div style="margin-top: 20px; padding: 15px; background: var(--secondary-blue); border-radius: 6px;">
                                    <strong>💡 Tips:</strong>
                                    <ul style="margin: 10px 0 0 20px; font-size: 13px;">
                                        <li>Use Ctrl/Cmd + Plus/Minus for keyboard zoom shortcuts</li>
                                        <li>Focus on fields with low confidence scores first</li>
                                        <li>Click outside fields to clear highlighting</li>
                                        <li>Expand Document Information for more context</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Verification Section -->
                    <div class="verification-section">
                        <div class="verification-checkbox">
                            <input type="checkbox" id="reviewComplete" onchange="toggleSubmit()">
                            <label for="reviewComplete">I have reviewed all fields and verified their accuracy</label>
                        </div>
                        <crowd-button 
                            id="submitButton"
                            class="submit-button"
                            form-action="submit" 
                            variant="primary">
                            ✓ Submit Review
                        </crowd-button>
                    </div>
                </div>
            </div>
        </crowd-form>

        <script>
            let currentZoom = 1;
            let currentHighlight = null;
            const imgElement = document.getElementById('documentImage');
            const imageContainer = document.getElementById('imageContainer');
            let imgRect = null;

            function initImage() {
                imgRect = imgElement.getBoundingClientRect();
                // Fit image to container initially
                const containerRect = imageContainer.getBoundingClientRect();
                const imgAspect = imgElement.naturalWidth / imgElement.naturalHeight;
                const containerAspect = containerRect.width / containerRect.height;
                
                if (imgAspect > containerAspect) {
                    imgElement.style.width = '100%';
                    imgElement.style.height = 'auto';
                } else {
                    imgElement.style.width = 'auto';
                    imgElement.style.height = '100%';
                }
                updateImageRect();
            }

            function updateImageRect() {
                imgRect = imgElement.getBoundingClientRect();
            }

            function zoom(factor) {
                currentZoom *= factor;
                currentZoom = Math.max(0.1, Math.min(5, currentZoom)); // Limit zoom range
                imgElement.style.transform = `scale(${currentZoom})`;
                imgElement.style.transformOrigin = 'center center';
                setTimeout(updateImageRect, 100);
                updateHighlight();
            }

            function resetZoom() {
                currentZoom = 1;
                imgElement.style.transform = 'scale(1)';
                setTimeout(updateImageRect, 100);
                updateHighlight();
            }

            function updateHighlight() {
                if (currentHighlight && currentHighlight.dataset.bbox) {
                    const element = document.querySelector(`[data-bbox="${currentHighlight.dataset.bbox}"]`);
                    if (element) {
                        highlightBBox(element);
                    }
                }
            }

            function highlightBBox(element) {
                if(currentHighlight) currentHighlight.remove();
                
                const bbox = JSON.parse(element.dataset.bbox || '{}');
                if(bbox?.width > 0 && bbox?.height > 0) {
                    currentHighlight = document.createElement('div');
                    currentHighlight.className = 'highlight-box';
                    currentHighlight.dataset.bbox = element.dataset.bbox;

                    const containerRect = imageContainer.getBoundingClientRect();
                    const imgRect = imgElement.getBoundingClientRect();
                    
                    // Calculate position relative to the scaled image
                    const left = imgRect.left - containerRect.left + (bbox.left * imgRect.width);
                    const top = imgRect.top - containerRect.top + (bbox.top * imgRect.height);
                    const width = bbox.width * imgRect.width;
                    const height = bbox.height * imgRect.height;

                    currentHighlight.style.left = `${left}px`;
                    currentHighlight.style.top = `${top}px`;
                    currentHighlight.style.width = `${width}px`;
                    currentHighlight.style.height = `${height}px`;

                    imageContainer.appendChild(currentHighlight);
                }
            }

            function switchTab(tabName) {
                // Remove active class from all tabs and buttons
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                
                // Add active class to selected tab and button
                document.querySelector(`[onclick="switchTab('${tabName}')"]`).classList.add('active');
                document.getElementById(`${tabName}Tab`).classList.add('active');
            }

            function toggleInfo() {
                const content = document.getElementById('infoContent');
                const icon = document.getElementById('toggleIcon');
                
                if (content.classList.contains('expanded')) {
                    content.classList.remove('expanded');
                    icon.textContent = '▼';
                } else {
                    content.classList.add('expanded');
                    icon.textContent = '▲';
                }
            }

            function toggleSubmit() {
                const checkbox = document.getElementById('reviewComplete');
                const submitButton = document.getElementById('submitButton');
                
                if (checkbox.checked) {
                    submitButton.classList.add('enabled');
                } else {
                    submitButton.classList.remove('enabled');
                }
            }

            function handleBlueprintChange() {
                const dropdown = document.getElementById("blueprintSelection");
                const selectedBlueprint = dropdown.value;
                const initialBlueprint = "{{ task.input.blueprintName }}";

                const keyValuePairs = document.querySelectorAll(".key-value-pair");
                if (selectedBlueprint !== initialBlueprint) {
                    keyValuePairs.forEach(pair => {
                        pair.style.opacity = '0.5';
                        const input = pair.querySelector("crowd-input");
                        input.setAttribute("disabled", "true");
                    });
                } else {
                    keyValuePairs.forEach(pair => {
                        pair.style.opacity = '1';
                        const input = pair.querySelector("crowd-input");
                        input.removeAttribute("disabled");
                    });
                }
            }

            // Event listeners
            document.addEventListener('click', (e) => {
                if(!e.target.closest('.key-value-pair') && currentHighlight) {
                    currentHighlight.remove();
                    currentHighlight = null;
                }
            });

            window.addEventListener('resize', updateImageRect);
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === '=' || e.key === '+') {
                        e.preventDefault();
                        zoom(1.2);
                    } else if (e.key === '-') {
                        e.preventDefault();
                        zoom(0.8);
                    } else if (e.key === '0') {
                        e.preventDefault();
                        resetZoom();
                    }
                }
            });

            // Initialize with minimized document info
            document.addEventListener('DOMContentLoaded', () => {
                // Document info starts minimized by default
            });
        </script>
    </body>
    </html>
    """

    try:
        response = sagemaker.create_human_task_ui(
            HumanTaskUiName=human_task_ui_name,
            UiTemplate={
                'Content': ui_template_content
            }
        )
        return response['HumanTaskUiArn']
    except Exception as e:
        print(f"Error creating HumanTaskUI: {e}")
        return None


def create_flow_definition(stack_name, human_task_ui_arn, a2i_workteam_arn, flow_definition_name):
    role_arn = os.environ.get('A2I_FLOW_DEFINITION_ROLE_ARN')  # Use dedicated Flow Definition role
    try:
        response = sagemaker.create_flow_definition(
            FlowDefinitionName=flow_definition_name,
            HumanLoopConfig={
                'WorkteamArn': a2i_workteam_arn,
                'HumanTaskUiArn': human_task_ui_arn,
                'TaskTitle': 'Review Extracted Key Values',
                'TaskDescription': 'Review the key values extracted from the document.',
                'TaskCount': 1 
            },
            OutputConfig={
                'S3OutputPath': f's3://{os.environ["BDA_OUTPUT_BUCKET"]}/a2i-output' #Output to BDA Bucket
            },
            RoleArn=role_arn
        )
        return response['FlowDefinitionArn']
    except Exception as e:
        print(f"Error creating FlowDefinition: {e}")
        return None


def comprehensive_workforce_cleanup(workteam_name, stack_name):
    """
    Comprehensive cleanup of SageMaker workforce resources to prevent orphaned resources
    Handles all scenarios including orphaned workforces when workteam is already deleted
    """
    cleanup_results = []
    
    try:
        print(f"Starting comprehensive workforce cleanup for workteam: {workteam_name}")
        
        # Step 1: Clean up any remaining human loops
        try:
            # Use the sanitized flow definition name
            resource_names = generate_resource_names(stack_name)
            flow_definition_name = resource_names['flow_definition']
            
            # Try to list human loops (this might fail if flow definition is already deleted)
            try:
                response = sagemaker.list_human_loops(
                    FlowDefinitionArn=f'arn:aws:sagemaker:{get_region()}:{get_account_id()}:flow-definition/{flow_definition_name}',
                    MaxResults=100
                )
                
                for human_loop in response.get('HumanLoops', []):
                    if human_loop['HumanLoopStatus'] in ['InProgress', 'Waiting']:
                        try:
                            sagemaker.stop_human_loop(HumanLoopName=human_loop['HumanLoopName'])
                            cleanup_results.append(f"Stopped human loop: {human_loop['HumanLoopName']}")
                        except Exception as e:
                            cleanup_results.append(f"Warning: Could not stop human loop {human_loop['HumanLoopName']}: {e}")
                            
            except Exception as e:
                cleanup_results.append(f"Could not list human loops (flow definition may be deleted): {e}")
                
        except Exception as e:
            cleanup_results.append(f"Human loop cleanup failed: {e}")
        
        # Step 2: Wait for operations to settle
        print("Waiting for SageMaker operations to settle...")
        time.sleep(10)
        
        # Step 3: Check if workteam exists and try direct deletion
        workteam_exists = False
        try:
            sagemaker.describe_workteam(WorkteamName=workteam_name)
            workteam_exists = True
            print(f"Workteam {workteam_name} exists, attempting deletion")
            
            try:
                sagemaker.delete_workteam(WorkteamName=workteam_name)
                cleanup_results.append(f"Successfully deleted workteam: {workteam_name}")
                time.sleep(5)  # Wait for deletion to propagate
                
            except Exception as delete_error:
                cleanup_results.append(f"Direct workteam deletion failed: {delete_error}")
                
        except Exception as describe_error:
            if 'ValidationException' in str(describe_error):
                cleanup_results.append(f"Workteam {workteam_name} already deleted or doesn't exist")
                workteam_exists = False
            else:
                cleanup_results.append(f"Error describing workteam: {describe_error}")
                workteam_exists = False
        
        # Step 4: ALWAYS check for and clean up orphaned workforces
        # This is critical - we must check regardless of workteam status
        print("Checking for orphaned workforce resources...")
        try:
            workforces = sagemaker.list_workforces()
            
            for workforce in workforces.get('Workforces', []):
                workforce_name = workforce['WorkforceName']
                
                # Check if this is a private workforce
                if 'private' in workforce_name.lower():
                    try:
                        # Get workforce details to check if it's associated with our stack
                        workforce_details = sagemaker.describe_workforce(WorkforceName=workforce_name)
                        
                        # Multiple ways to identify if this workforce belongs to our stack:
                        # 1. Check if workteam name appears in workforce details
                        # 2. Check if stack name appears in workforce details  
                        # 3. Check workforce creation patterns
                        
                        workforce_str = str(workforce_details).lower()
                        stack_name_lower = stack_name.lower()
                        workteam_name_lower = workteam_name.lower()
                        
                        is_our_workforce = (
                            workteam_name_lower in workforce_str or
                            stack_name_lower in workforce_str or
                            # Check for common naming patterns
                            f"{stack_name_lower}-private" in workforce_name.lower() or
                            # Check if workforce was created around the same time as our stack
                            # (This is a heuristic but helps identify orphaned resources)
                            workforce_name.lower().startswith('private-crowd')
                        )
                        
                        if is_our_workforce:
                            print(f"Found associated workforce: {workforce_name}")
                            cleanup_results.append(f"Found workforce associated with our stack: {workforce_name}")
                            
                            # Check if workforce has any remaining workteams
                            try:
                                # If workteam still exists, we already tried to delete it above
                                # If workteam doesn't exist, we can safely delete the workforce
                                if not workteam_exists:
                                    print(f"Workteam already deleted, cleaning up orphaned workforce: {workforce_name}")
                                    sagemaker.delete_workforce(WorkforceName=workforce_name)
                                    cleanup_results.append(f"Deleted orphaned workforce: {workforce_name}")
                                    time.sleep(5)
                                    break
                                else:
                                    # Workteam exists but deletion might have failed, try workforce deletion as fallback
                                    print(f"Attempting workforce-level cleanup for: {workforce_name}")
                                    sagemaker.delete_workforce(WorkforceName=workforce_name)
                                    cleanup_results.append(f"Deleted workforce (workteam deletion fallback): {workforce_name}")
                                    time.sleep(5)
                                    break
                                    
                            except Exception as workforce_delete_error:
                                cleanup_results.append(f"Could not delete workforce {workforce_name}: {workforce_delete_error}")
                                continue
                        else:
                            cleanup_results.append(f"Skipped unrelated workforce: {workforce_name}")
                            
                    except Exception as workforce_describe_error:
                        cleanup_results.append(f"Could not describe workforce {workforce_name}: {workforce_describe_error}")
                        
                        # If we can't describe it, but it's a private workforce, try to delete it anyway
                        # This handles cases where the workforce is in a bad state
                        if 'private-crowd' in workforce_name.lower():
                            try:
                                print(f"Attempting cleanup of potentially orphaned workforce: {workforce_name}")
                                sagemaker.delete_workforce(WorkforceName=workforce_name)
                                cleanup_results.append(f"Deleted potentially orphaned workforce: {workforce_name}")
                                time.sleep(5)
                                break
                            except Exception as fallback_delete_error:
                                cleanup_results.append(f"Could not delete potentially orphaned workforce {workforce_name}: {fallback_delete_error}")
                        continue
                        
        except Exception as workforce_list_error:
            cleanup_results.append(f"Workforce listing/cleanup failed: {workforce_list_error}")
        
        # Step 5: Clean up default workforce if it exists
        print("Checking for default workforce...")
        try:
            sagemaker.describe_workforce(WorkforceName='default')
            print("Default workforce found, attempting cleanup...")
            try:
                sagemaker.delete_workforce(WorkforceName='default')
                cleanup_results.append("Successfully deleted default workforce")
                time.sleep(5)  # Wait for deletion to propagate
            except Exception as default_workforce_error:
                cleanup_results.append(f"Could not delete default workforce: {default_workforce_error}")
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                cleanup_results.append("Default workforce does not exist or already deleted")
            else:
                cleanup_results.append(f"Error checking default workforce: {e}")
        
        # Step 6: Final verification - check both workteam and workforce status
        print("Performing final verification...")
        try:
            time.sleep(5)
            sagemaker.describe_workteam(WorkteamName=workteam_name)
            cleanup_results.append(f"Warning: Workteam {workteam_name} still exists after cleanup attempts")
        except Exception:
            cleanup_results.append(f"Verification: Workteam {workteam_name} successfully removed")
        
        # Also verify no orphaned workforces remain
        try:
            remaining_workforces = sagemaker.list_workforces()
            private_workforces = [w for w in remaining_workforces.get('Workforces', []) 
                                if 'private' in w['WorkforceName'].lower()]
            
            if private_workforces:
                cleanup_results.append(f"Note: {len(private_workforces)} private workforce(s) still exist in account")
                for wf in private_workforces:
                    cleanup_results.append(f"  - Remaining workforce: {wf['WorkforceName']}")
            else:
                cleanup_results.append("Verification: No private workforces remain in account")
                
        except Exception as verification_error:
            cleanup_results.append(f"Could not verify workforce cleanup: {verification_error}")
        
        print("Workforce cleanup completed")
        print("Cleanup results:", cleanup_results)
        return cleanup_results
        
    except Exception as e:
        error_msg = f"Comprehensive workforce cleanup failed: {e}"
        cleanup_results.append(error_msg)
        print(error_msg)
        return cleanup_results


def wait_for_flow_definition_deletion(flow_definition_name, max_wait_time=180, check_interval=10, context=None):
    """
    Wait for flow definition to be completely deleted before proceeding.
    
    Args:
        flow_definition_name (str): Name of the flow definition
        max_wait_time (int): Maximum time to wait in seconds (default: 3 minutes)
        check_interval (int): Time between checks in seconds (default: 10 seconds)
        context: Lambda context for timeout management
    
    Returns:
        bool: True if deletion is confirmed, False if timeout or error
    """
    # Adjust wait time based on remaining Lambda execution time
    if context:
        safe_wait_time = calculate_safe_wait_time(context, max_wait_time, buffer_time=60)
        if safe_wait_time < max_wait_time:
            print(f"Adjusting flow definition wait time from {max_wait_time}s to {safe_wait_time}s due to Lambda timeout constraints")
            max_wait_time = safe_wait_time
    
    print(f"Waiting for flow definition '{flow_definition_name}' to be completely deleted (max {max_wait_time}s)...")
    start_time = time.time()
    
    while time.time() - start_time < max_wait_time:
        try:
            # Try to describe the flow definition
            sagemaker.describe_flow_definition(FlowDefinitionName=flow_definition_name)
            elapsed = int(time.time() - start_time)
            print(f"Flow definition still exists, waiting... ({elapsed}s elapsed)")
            time.sleep(check_interval)
        except sagemaker.exceptions.ResourceNotFound:
            elapsed = int(time.time() - start_time)
            print(f"Flow definition '{flow_definition_name}' successfully deleted after {elapsed}s")
            return True
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                elapsed = int(time.time() - start_time)
                print(f"Flow definition '{flow_definition_name}' successfully deleted after {elapsed}s")
                return True
            else:
                print(f"Error checking flow definition status: {e}")
                time.sleep(check_interval)
    
    print(f"Timeout waiting for flow definition deletion after {max_wait_time}s")
    return False


def wait_for_human_task_ui_deletion(human_task_ui_name, max_wait_time=120, check_interval=5, context=None):
    """
    Wait for human task UI to be completely deleted before proceeding.
    
    Args:
        human_task_ui_name (str): Name of the human task UI
        max_wait_time (int): Maximum time to wait in seconds (default: 2 minutes)
        check_interval (int): Time between checks in seconds (default: 5 seconds)
        context: Lambda context for timeout management
    
    Returns:
        bool: True if deletion is confirmed, False if timeout or error
    """
    # Adjust wait time based on remaining Lambda execution time
    if context:
        safe_wait_time = calculate_safe_wait_time(context, max_wait_time, buffer_time=30)
        if safe_wait_time < max_wait_time:
            print(f"Adjusting human task UI wait time from {max_wait_time}s to {safe_wait_time}s due to Lambda timeout constraints")
            max_wait_time = safe_wait_time
    
    print(f"Waiting for human task UI '{human_task_ui_name}' to be completely deleted (max {max_wait_time}s)...")
    start_time = time.time()
    
    while time.time() - start_time < max_wait_time:
        try:
            # Try to describe the human task UI
            sagemaker.describe_human_task_ui(HumanTaskUiName=human_task_ui_name)
            elapsed = int(time.time() - start_time)
            print(f"Human task UI still exists, waiting... ({elapsed}s elapsed)")
            time.sleep(check_interval)
        except sagemaker.exceptions.ResourceNotFound:
            elapsed = int(time.time() - start_time)
            print(f"Human task UI '{human_task_ui_name}' successfully deleted after {elapsed}s")
            return True
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                elapsed = int(time.time() - start_time)
                print(f"Human task UI '{human_task_ui_name}' successfully deleted after {elapsed}s")
                return True
            else:
                print(f"Error checking human task UI status: {e}")
                time.sleep(check_interval)
    
    print(f"Timeout waiting for human task UI deletion after {max_wait_time}s")
    return False


def delete_flow_definition(flow_definition_name, context=None):
    """
    Delete flow definition and wait for completion.
    
    Args:
        flow_definition_name (str): Name of the flow definition to delete
        context: Lambda context for timeout management
        
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    try:
        # First check if the flow definition exists
        try:
            sagemaker.describe_flow_definition(FlowDefinitionName=flow_definition_name)
        except sagemaker.exceptions.ResourceNotFound:
            print(f"Flow Definition '{flow_definition_name}' does not exist, skipping deletion.")
            return True
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                print(f"Flow Definition '{flow_definition_name}' does not exist, skipping deletion.")
                return True
        
        # Attempt deletion
        sagemaker.delete_flow_definition(FlowDefinitionName=flow_definition_name)
        print(f"Flow Definition '{flow_definition_name}' deletion initiated.")
        
        # Wait for deletion to complete
        return wait_for_flow_definition_deletion(flow_definition_name, context=context)
        
    except Exception as e:
        print(f"Error deleting Flow Definition '{flow_definition_name}': {e}")
        return False


def delete_default_workforce():
    """
    Delete the default SageMaker workforce.
    
    Returns:
        bool: True if deletion was successful or workforce doesn't exist, False otherwise
    """
    try:
        # First check if the default workforce exists
        try:
            workforce_response = sagemaker.describe_workforce(WorkforceName='default')
            print("Default workforce found, attempting deletion...")
        except sagemaker.exceptions.ResourceNotFound:
            print("Default workforce does not exist, skipping deletion.")
            return True
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                print("Default workforce does not exist, skipping deletion.")
                return True
            else:
                print(f"Error checking default workforce existence: {e}")
                return False
        
        # Attempt to delete the default workforce
        sagemaker.delete_workforce(WorkforceName='default')
        print("Default workforce deletion initiated successfully.")
        
        # Wait a bit for the deletion to propagate
        time.sleep(5)
        
        # Verify deletion
        try:
            sagemaker.describe_workforce(WorkforceName='default')
            print("Warning: Default workforce still exists after deletion attempt")
            return False
        except sagemaker.exceptions.ResourceNotFound:
            print("Default workforce successfully deleted.")
            return True
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                print("Default workforce successfully deleted.")
                return True
            else:
                print(f"Error verifying default workforce deletion: {e}")
                return False
                
    except Exception as e:
        print(f"Error deleting default workforce: {e}")
        return False


def delete_human_task_ui(human_task_ui_name, context=None):
    """
    Delete human task UI and wait for completion.
    
    Args:
        human_task_ui_name (str): Name of the human task UI to delete
        context: Lambda context for timeout management
        
    Returns:
        bool: True if deletion was successful, False otherwise
    """
    try:
        # First check if the human task UI exists
        try:
            sagemaker.describe_human_task_ui(HumanTaskUiName=human_task_ui_name)
        except sagemaker.exceptions.ResourceNotFound:
            print(f"HumanTaskUI '{human_task_ui_name}' does not exist, skipping deletion.")
            return True
        except Exception as e:
            if 'ValidationException' in str(e) or 'ResourceNotFound' in str(e):
                print(f"HumanTaskUI '{human_task_ui_name}' does not exist, skipping deletion.")
                return True
        
        # Attempt deletion
        sagemaker.delete_human_task_ui(HumanTaskUiName=human_task_ui_name)
        print(f"HumanTaskUI '{human_task_ui_name}' deletion initiated.")
        
        # Wait for deletion to complete
        return wait_for_human_task_ui_deletion(human_task_ui_name, context=context)
        
    except Exception as e:
        print(f"Error deleting HumanTaskUI '{human_task_ui_name}': {e}")
        return False

def handler(event, context):
    stack_name = os.environ['STACK_NAME']
    a2i_workteam_arn = os.environ['A2I_WORKTEAM_ARN']
    
    # Generate AWS-compliant resource names
    resource_names = generate_resource_names(stack_name)
    human_task_ui_name = resource_names['human_task_ui']
    flow_definition_name = resource_names['flow_definition']
    
    # Create a consistent Physical Resource ID based on stack name
    # This ensures CloudFormation recognizes this as the same resource across updates
    physical_resource_id = f"A2IResources-{stack_name}"
    
    ssm = boto3.client('ssm')
    
    # For debugging
    print(f"Event received: {json.dumps(event)}")
    print(f"Request Type: {event.get('RequestType')}")
    print(f"Physical Resource ID: {physical_resource_id}")
    print(f"Using AWS-compliant names: HumanTaskUI={human_task_ui_name}, FlowDefinition={flow_definition_name}")
    
    response_data = {}
    
    try:
        # Handle CloudFormation lifecycle events
        if event.get('RequestType') == 'Create':
            print("Creating A2I Resources...")
            # Ignore the SourceCodeHash property as it's only used to force updates
            _ = event['ResourceProperties'].get('SourceCodeHash')
            human_task_ui_arn = create_human_task_ui(human_task_ui_name)
            if human_task_ui_arn:
                flow_definition_arn = create_flow_definition(stack_name, human_task_ui_arn, a2i_workteam_arn,flow_definition_name)
                if flow_definition_arn:
                    # Store the Flow Definition ARN in SSM
                    ssm.put_parameter(
                        Name=f"/{stack_name}/FlowDefinitionArn",
                        Value=flow_definition_arn,
                        Type='String',
                        Overwrite=True
                    )
                    
                    # Create HITL confidence threshold SSM parameter with default value 80
                    try:
                        ssm.put_parameter(
                            Name=f"/{stack_name}/hitl_confidence_threshold",
                            Value="80",
                            Type='String',
                            Overwrite=True,
                            Description="HITL confidence threshold for Pattern-1 BDA processing"
                        )
                        print(f"Created SSM parameter /{stack_name}/hitl_confidence_threshold with default value 80")
                    except Exception as e:
                        print(f"Warning: Failed to create HITL confidence threshold SSM parameter: {e}")
                        # Don't fail the entire operation if SSM parameter creation fails
                    
                    response_data['HumanTaskUiArn'] = human_task_ui_arn
                    response_data['FlowDefinitionArn'] = flow_definition_arn
                    send_cfn_response(event, context, 'SUCCESS', response_data, physical_resource_id)
                else:
                    print("Failed to create flow definition")
                    send_cfn_response(event, context, 'FAILED', {'Error': 'Failed to create flow definition'}, physical_resource_id)
                    return
            else:
                print("Failed to create human task UI")
                send_cfn_response(event, context, 'FAILED', {'Error': 'Failed to create human task UI'}, physical_resource_id)
                return
        
        elif event.get('RequestType') == 'Update':
            print("Updating A2I Resources...")
            # Ignore the SourceCodeHash property as it's only used to force updates
            _ = event['ResourceProperties'].get('SourceCodeHash')
            
            # Step 1: Delete existing resources and wait for completion
            print("Deleting existing Flow Definition...")
            flow_deletion_success = delete_flow_definition(flow_definition_name, context)
            
            print("Deleting existing Human Task UI...")
            ui_deletion_success = delete_human_task_ui(human_task_ui_name, context)
            
            # Step 2: Verify deletions were successful
            if not flow_deletion_success:
                error_msg = f"Failed to delete existing Flow Definition '{flow_definition_name}' within timeout period"
                print(error_msg)
                send_cfn_response(event, context, 'FAILED', {'Error': error_msg}, physical_resource_id)
                return
                
            if not ui_deletion_success:
                error_msg = f"Failed to delete existing Human Task UI '{human_task_ui_name}' within timeout period"
                print(error_msg)
                send_cfn_response(event, context, 'FAILED', {'Error': error_msg}, physical_resource_id)
                return
            
            print("All existing resources successfully deleted. Proceeding with recreation...")
            
            # Step 3: Add additional buffer time to ensure AWS services are ready
            print("Adding buffer time for AWS service consistency...")
            time.sleep(10)
            
            # Step 4: Create new resources
            human_task_ui_arn = create_human_task_ui(human_task_ui_name)
            if human_task_ui_arn:
                flow_definition_arn = create_flow_definition(stack_name, human_task_ui_arn, a2i_workteam_arn, flow_definition_name)
                if flow_definition_arn:
                    # Store the Flow Definition ARN in SSM
                    ssm.put_parameter(
                        Name=f"/{stack_name}/FlowDefinitionArn",
                        Value=flow_definition_arn,
                        Type='String',
                        Overwrite=True
                    )
                    response_data['HumanTaskUiArn'] = human_task_ui_arn
                    response_data['FlowDefinitionArn'] = flow_definition_arn
                    print("A2I Resources updated successfully")
                    send_cfn_response(event, context, 'SUCCESS', response_data, physical_resource_id)
                else:
                    print("Failed to create new flow definition during update")
                    send_cfn_response(event, context, 'FAILED', {'Error': 'Failed to create new flow definition during update'}, physical_resource_id)
                    return
            else:
                print("Failed to create new human task UI during update")
                send_cfn_response(event, context, 'FAILED', {'Error': 'Failed to create new human task UI during update'}, physical_resource_id)
                return
                
        elif event.get('RequestType') == 'Delete':
            print("Deleting A2I Resources...")
            
            # Step 1: Delete Flow Definition and Human Task UI with proper wait
            print("Deleting Flow Definition...")
            flow_deletion_success = delete_flow_definition(flow_definition_name, context)
            
            print("Deleting Human Task UI...")
            ui_deletion_success = delete_human_task_ui(human_task_ui_name, context)
            
            # Log deletion results but don't fail the stack deletion if resources are already gone
            if not flow_deletion_success:
                print(f"Warning: Flow Definition '{flow_definition_name}' deletion may not have completed within timeout")
            if not ui_deletion_success:
                print(f"Warning: Human Task UI '{human_task_ui_name}' deletion may not have completed within timeout")
            
            # Step 2: Delete the default SageMaker workforce
            print("Deleting default SageMaker workforce...")
            default_workforce_deletion_success = delete_default_workforce()
            if not default_workforce_deletion_success:
                print("Warning: Default workforce deletion may not have completed successfully")
            
            # Step 3: Perform comprehensive workforce cleanup
            # Extract workteam name from environment or construct it
            workteam_arn = os.environ.get('A2I_WORKTEAM_ARN', '')
            if workteam_arn:
                # Extract workteam name from ARN
                workteam_name = workteam_arn.split('/')[-1] if '/' in workteam_arn else ''
                if workteam_name:
                    print(f"Performing workforce cleanup for workteam: {workteam_name}")
                    cleanup_results = comprehensive_workforce_cleanup(workteam_name, stack_name)
                    print(f"Workforce cleanup completed with results: {len(cleanup_results)} operations")
                else:
                    print("Could not extract workteam name from ARN")
            else:
                print("No workteam ARN found in environment - skipping workforce cleanup")
            
            print("Success in deleting all A2I resources (Flow Definition, Human Task UI, and Workforce)")
            send_cfn_response(event, context, 'SUCCESS', {}, physical_resource_id)
            return
            
        # In case RequestType is not provided or recognized
        else:
            print(f"Unknown RequestType: {event.get('RequestType')}")
            send_cfn_response(event, context, 'FAILED', {'Error': f"Unknown RequestType: {event.get('RequestType')}"}, physical_resource_id)
            return
    except Exception as e:
        print(f"Error: {str(e)}")
        # Use a fallback physical resource ID if the main one isn't available
        fallback_physical_resource_id = f"A2IResources-{os.environ.get('STACK_NAME', 'unknown')}"
        send_cfn_response(event, context, 'FAILED', {'Error': str(e)}, fallback_physical_resource_id)
        return