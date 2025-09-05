Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0

# Bedrock Integration

The GenAIIC IDP Accelerator includes a robust client for Amazon Bedrock that provides resilient model invocation with built-in retry handling, metrics collection, and helpful utilities. This integration supports all document processing patterns that utilize Bedrock models.

## Using the Bedrock Client

### Simple Function Approach

For quick, straightforward use cases, you can use the function-style interface:

```python
from idp_common.bedrock import invoke_model

# Basic model invocation
response = invoke_model(
    model_id="anthropic.claude-3-haiku-20240307-v1:0",
    system_prompt="You are a helpful assistant.",
    content=[{"text": "What are the main features of AWS Bedrock?"}],
    temperature=0.0,
    top_k=5
)

# Process the response
output_text = response["response"]["output"]["message"]["content"][0]["text"]
print(output_text)
```

### Class-Based Interface

For more control and advanced features, use the BedrockClient class directly:

```python
from idp_common.bedrock.client import BedrockClient

# Create a custom client
client = BedrockClient(
    region="us-east-1",
    max_retries=5,
    initial_backoff=1.5,
    max_backoff=300,
    metrics_enabled=True
)

# Invoke a model
response = client.invoke_model(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    system_prompt="You are a helpful assistant.",
    content=[{"text": "How does document processing work?"}],
    temperature=0.0
)

# Extract text using the helper method
output_text = client.extract_text_from_response(response)
print(output_text)
```

## Working with Embeddings

Generate text embeddings for semantic search or document comparison:

```python
from idp_common.bedrock.client import BedrockClient

client = BedrockClient()
embedding = client.generate_embedding(
    text="This document contains information about loan applications.",
    model_id="amazon.titan-embed-text-v1"
)

# Use embedding for vector search, clustering, etc.
```

## Prompt Caching with CachePoint

Prompt caching is a powerful feature in Amazon Bedrock that significantly reduces response latency for workloads with repetitive contexts. The Bedrock client provides built-in support for this via the `<<CACHEPOINT>>` tag.

### Supported Models

CachePoint functionality is only available for specific Bedrock model IDs:

- `us.anthropic.claude-3-5-haiku-20241022-v1:0`
- `us.anthropic.claude-3-7-sonnet-20250219-v1:0`
- `us.amazon.nova-lite-v1:0`
- `us.amazon.nova-pro-v1:0`

When using unsupported models, the client will automatically remove `<<CACHEPOINT>>` tags from the content while preserving all text, and log a warning.

### Using CachePoint in Your Prompts

To implement prompt caching, insert the `<<CACHEPOINT>>` tag in your text content to indicate where caching boundaries should occur:

```python
from idp_common.bedrock.client import BedrockClient

client = BedrockClient()

# Content with cachepoint tags
content = [
    {
        "text": """This is static context that doesn't change between requests. 
        It could include model instructions, few shot examples, etc.
        <<CACHEPOINT>>
        This is dynamic content that changes with each request.
        """
    }
]

response = client.invoke_model(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    system_prompt="You are a helpful assistant.",
    content=content,
    temperature=0.0
)
```

### How CachePoint Works

When the `invoke_model` method processes your content:

1. It detects any text elements containing the `<<CACHEPOINT>>` tag
2. The text is split at each tag location
3. The client inserts a `{"cachePoint": {"type": "default"}}` element between the split text parts
4. The resulting message structure enables Bedrock to cache the preceding content

### Multiple CachePoints and Mixed Content

You can use multiple cachepoints in a single prompt and combine them with other content types:

```python
content = [
    {"text": "Static instructions for document processing<<CACHEPOINT>>"},
    {"image": {"url": "s3://bucket/document.png"}},
    {"text": "Static analysis guidelines<<CACHEPOINT>>Dynamic query about the document"}
]
```

### Benefits of Prompt Caching

- **Faster Response Times**: Avoid reprocessing the same context repeatedly
- **Reduced TTFT**: Time-To-First-Token is significantly lower for subsequent requests
- **Cost Efficiency**: Potentially lower token usage by avoiding redundant processing

> **NOTE**: To effectively use Prompt Caching, there is a [minimum number of tokens](https://docs.aws.amazon.com/bedrock/latest/userguide/prompt-caching.html#prompt-caching-models) for the cache.

### Debugging CachePoint Processing

The Bedrock client includes detailed debug logging for cachepoint processing:

```python
import logging
logging.getLogger('idp_common.bedrock.client').setLevel(logging.DEBUG)

# Now invoke_model calls will log detailed cachepoint processing information
# including word counts and split points in the content
```

### Example CachePoint Processing
See notebook [Bedrock Client Prompt Cache Testing Notebook](../../../../notebooks/bedrock_client_cachepoint_test.ipynb)

## Helper Methods

The BedrockClient provides useful utilities for common tasks:

### Prompt Formatting

```python
from idp_common.bedrock.client import BedrockClient

client = BedrockClient()

template = """
Please analyze this {DOCUMENT_TYPE}:

<document>
{CONTENT}
</document>

Extract the following fields: {FIELDS}
"""

substitutions = {
    "DOCUMENT_TYPE": "invoice",
    "CONTENT": "Invoice #12345\nDate: 2023-05-15\nAmount: $1,250.00",
    "FIELDS": "invoice_number, date, amount"
}

formatted_prompt = client.format_prompt(template, substitutions)
```

### Response Text Extraction

```python
# Extract text from a complex response structure
text = client.extract_text_from_response(response)
```

## Guardrail Support

This module includes built-in support for Amazon Bedrock Guardrails, which help enforce content safety, security, and policy compliance across all Bedrock model interactions.

### Configuring Guardrails

Guardrails are configured via environment variables:

- `GUARDRAIL_ID_AND_VERSION`: Contains the Guardrail ID and Version in format `id:version`

When properly configured, the `get_guardrail_config()` function will automatically include guardrail parameters in Bedrock API calls.

### How Guardrail Integration Works

1. The `invoke_model` function checks if `GUARDRAIL_ID_AND_VERSION` is set
2. If configured, guardrail parameters are parsed from the environment variable
3. Appropriate guardrail parameters are added to Bedrock API calls:
   - For `converse` API: Uses `guardrailIdentifier`, `guardrailVersion`, and `trace`
4. Debug logs show when guardrails are being applied

### Example with Guardrails

```python
import os
from idp_common.bedrock import invoke_model

# Set the environment variable (typically configured in Lambda environment)
os.environ["GUARDRAIL_ID_AND_VERSION"] = "your-guardrail-id:Draft"

# Call invoke_model normally - guardrails are applied automatically
response = invoke_model(
    model_id="anthropic.claude-3-sonnet-20240229-v1:0",
    system_prompt="You are a helpful assistant.",
    content=[{"text": "Tell me about security best practices."}],
    temperature=0.0
)
```

## Generation Parameter Configuration

The Bedrock client supports key generation parameters that control the output behavior of foundation models. Understanding these parameters is crucial for optimizing model performance for different document processing tasks.

### Understanding Generation Parameters

#### Temperature

Temperature controls the randomness of model outputs by scaling the probability distribution of next tokens:

- **Low temperature (0.0-0.3)**: More deterministic, focused outputs ideal for factual extraction
- **Medium temperature (0.4-0.7)**: Balanced outputs with some creativity
- **High temperature (0.8-1.0)**: More diverse and creative outputs

#### Top-p (Nucleus Sampling)

Top-p (nucleus sampling) computes the cumulative distribution over all token options in decreasing probability order and cuts it off once it reaches the specified probability threshold:

- Lower values (0.1-0.5): More focused on high-probability tokens
- Higher values (0.6-1.0): Includes more diversity in possible tokens

**Important**: Anthropic recommends adjusting either temperature OR top-p, but not both simultaneously, as this can lead to unpredictable generation behavior.

#### Top-k

Top-k limits the selection to only the k highest probability tokens before temperature/top-p logic runs:

- Lower values (5-20): Narrows token selection for more predictable outputs
- Higher values (50-200): Allows for more diverse language

### Parameter Implementation by Model Family

Different Bedrock models implement these parameters with varying defaults, naming conventions, and parameter placements:

- **Claude models**:
  - Default values: temperature=1.0, top_p=0.999, top_k=250 (wide open)
  - Parameters use snake_case: `temperature`, `top_p`, `top_k`
  - Implementation: `top_k` is placed in `additionalModelRequestFields`

- **Nova models**:
  - Default values: temperature=0.7, topP=0.9, topK≈50 (moderately constrained)
  - Parameters use camelCase: `temperature`, `topP`, `topK`
  - Implementation: `topK` is placed in `additionalModelRequestFields.inferenceConfig`

**Common implementation details**:
- Temperature is always included in the main `inferenceConfig`
- top_p is added to `inferenceConfig` as "topP"

### Task-Specific Best Practices

For document understanding tasks, we recommend the following parameter settings:

1. **Key Information Extraction**:
   - Temperature: 0.0 (deterministic)
   - Top-p: 0.1 (focused on highest probability tokens)
   - Top-k: 5 (restrict to most likely tokens)
   - Rationale: Maximizes precision and consistency for structured data extraction

2. **Classification**:
   - Temperature: 0.0 (deterministic)
   - Top-p: 0.1 (focused)
   - Top-k: 5 (restricted)
   - Rationale: Ensures consistent classification decisions with minimum variance

3. **Summarization**:
   - Temperature: 0.0 (deterministic)
   - Top-p: 0.1 (focused but allows some flexibility)
   - Top-k: 5 (moderately restricted)
   - Rationale: Balances factual accuracy with coherent narrative flow

Remember: As Anthropic recommends, adjust either temperature OR top-p, but not both simultaneously. For document processing tasks that require high accuracy and consistency, we've found that using a temperature of 0.0 with a low top-p value (0.1) provides the most reliable results.

## Resilience Features

The BedrockClient automatically handles common failure scenarios:

- Exponential backoff with jitter for rate limits and transient errors
- Intelligent classification of retryable vs. non-retryable errors
- Detailed logging with appropriate content sanitization
- Metrics collection for request counts, latencies, and token usage

## Configuration Options

When creating a BedrockClient instance, you can customize:

- `region`: AWS region for Bedrock (default: AWS_REGION env var or us-west-2)
- `max_retries`: Maximum retry attempts for throttled requests (default: 8)
- `initial_backoff`: Starting backoff time in seconds (default: 2)
- `max_backoff`: Maximum backoff time in seconds (default: 300)
- `metrics_enabled`: Whether to publish CloudWatch metrics (default: True)

This integration provides the foundation for reliable, scalable document processing with Amazon Bedrock models throughout the accelerator.
