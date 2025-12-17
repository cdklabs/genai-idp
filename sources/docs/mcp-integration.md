Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: MIT-0

# MCP Integration

The GenAI IDP solution provides MCP (Model Context Protocol) integration that enables external applications like Amazon Quick Suite to access IDP functionality through AWS Bedrock AgentCore Gateway. This allows third-party applications to query processed document data and perform analytics operations through natural language interfaces.

## Overview

The MCP integration exposes IDP capabilities to external applications by:

- **Analytics Gateway**: Provides natural language access to processed document analytics data
- **Secure Authentication**: Uses AWS Cognito OAuth 2.0 for secure external application access
- **MCP Protocol**: Implements Model Context Protocol for standardized tool integration
- **Real-time Queries**: Enables external applications to query document processing results in real-time
- **Extensible Architecture**: Designed to support additional IDP functionality in future releases

## External Application Integration

External applications can integrate with the IDP system through the AgentCore Gateway by:

1. **Authentication**: Obtaining OAuth tokens from the IDP's Cognito User Pool
2. **Gateway Connection**: Connecting to the AgentCore Gateway endpoint
3. **Tool Discovery**: Discovering available analytics tools via MCP protocol
4. **Query Execution**: Executing natural language queries against processed document data

### Integration Flow

```
External App → Cognito Auth → AgentCore Gateway → Analytics Lambda → IDP Data
```

## Enabling and Disabling the Feature

### During Stack Deployment

The MCP integration is controlled by the `EnableMCP` parameter:

**Enable MCP Integration:**
```yaml
EnableMCP: 'true'  # Default value
```

**Disable MCP Integration:**
```yaml
EnableMCP: 'false'
```

When enabled, the stack automatically creates:
- AgentCore Gateway Manager Lambda function
- AgentCore Analytics Lambda function
- External App Client in Cognito User Pool
- Required IAM roles and policies
- AgentCore Gateway resource

When disabled, these resources are not created, reducing deployment complexity and costs.

## Current Capabilities

### Analytics Agent

The current implementation provides an Analytics Agent that processes natural language queries about processed document data. The agent follows the AgentCore schema and provides a single tool interface:

#### search_genaiidp
Provides information from the GenAI Intelligent Document Processing System and answers user questions using natural language queries.

**Input Schema:**
- `query` (string, required): Natural language question about processed documents or analytics data

**Capabilities:**
- Query processed document statistics and metadata
- Analyze document processing trends and patterns
- Retrieve information about document types, processing status, and results
- Generate analytics reports based on natural language requests

**Example Queries:**
- "How many documents were processed last month?"
- "What are the most common document types?"
- "Show me the processing success rate by document type"
- "Which documents had the lowest confidence scores?"
- "Generate a report of processing errors from the last week"

## Implementation Details

### Architecture Components

1. **AgentCore Gateway Manager Lambda**
   - Creates and manages the AgentCore Gateway
   - Handles CloudFormation custom resource lifecycle
   - Configures JWT authorization using Cognito

2. **AgentCore Analytics Lambda**
   - Implements MCP protocol following AgentCore schema
   - Processes natural language queries via search_genaiidp tool
   - Translates queries to appropriate backend operations
   - Returns structured responses in natural language

3. **AgentCore Gateway**
   - AWS Bedrock AgentCore Gateway resource
   - Routes requests between external applications and analytics Lambda
   - Handles authentication and authorization

### Authentication Flow

1. **External Application** requests access token from Cognito
2. **Cognito User Pool** validates credentials and returns JWT token
3. **External Application** calls AgentCore Gateway with Bearer token
4. **AgentCore Gateway** validates JWT token against Cognito
5. **Analytics Lambda** processes the request and returns results

### Data Access

The Analytics Lambda has read-only access to:
- **Analytics Database**: Glue catalog with processed document metadata
- **Reporting Bucket**: S3 bucket containing analytics data and query results
- **Configuration Tables**: DynamoDB tables with system configuration
- **Tracking Tables**: DynamoDB tables with processing status

## Cognito User Pool Utilization

### User Pool Configuration

The IDP solution creates a Cognito User Pool with:
- **Domain**: Auto-generated unique domain (e.g., `stack-name-timestamp.auth.region.amazoncognito.com`)
- **Password Policy**: Configurable security requirements
- **User Management**: Admin-managed user creation
- **OAuth Flows**: Authorization code flow for external applications

### External App Client

When MCP is enabled, an additional Cognito User Pool Client is created:

**Client Configuration:**
- **Client Name**: "External-App-Client"
- **Client Secret**: Generated automatically
- **Auth Flows**: USER_PASSWORD_AUTH, ADMIN_USER_PASSWORD_AUTH, REFRESH_TOKEN_AUTH
- **OAuth Flows**: Authorization code flow
- **OAuth Scopes**: openid, email, profile
- **Callback URLs**: 
  - CloudFront distribution URL
  - Quick Suite OAuth callback
  - Cognito User Pool domain

### Token Management

External applications can obtain tokens using:

**Client Credentials Flow:**
```bash
curl -X POST <MCPTokenURL> \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=client_credentials&client_id=<MCPClientId>&client_secret=<MCPClientSecret>"
```

**User Authentication Flow:**
```bash
# Step 1: Get authorization code
<MCPAuthorizationURL>?
  response_type=code&
  client_id=<MCPClientId>&
  redirect_uri=CALLBACK_URL&
  scope=openid+email+profile

# Step 2: Exchange code for tokens
curl -X POST <MCPTokenURL> \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code&client_id=<MCPClientId>&client_secret=<MCPClientSecret>&code=AUTH_CODE&redirect_uri=CALLBACK_URL"
```

## Output Parameters

When MCP integration is enabled, the CloudFormation stack provides the following outputs required for external application integration:

### MCP Server Endpoint

- **`MCPServerEndpoint`**: The HTTPS endpoint for the MCP Server
  - The AgentCore Gateway URL for MCP protocol communication
  - Required for external applications to connect to the gateway via MCP protocol

### Authentication Outputs

- **`MCPClientId`**: Cognito User Pool Client ID for MCP authentication
  - Required for OAuth authentication flows
  - Used in token requests and API calls

- **`MCPClientSecret`**: Cognito User Pool Client Secret for MCP authentication
  - Required for client authentication in OAuth flows
  - Should be securely stored and rotated regularly

- **`MCPUserPool`**: Cognito User Pool ID for MCP authentication
  - Required for token validation and user management
  - Used by external applications for authentication setup

- **`MCPTokenURL`**: OAuth token endpoint URL
  - Format: `https://domain-name.auth.region.amazoncognito.com/oauth2/token`
  - Used for obtaining access tokens via OAuth flows

- **`MCPAuthorizationURL`**: OAuth authorization endpoint URL
  - Format: `https://domain-name.auth.region.amazoncognito.com/oauth2/authorize`
  - Used for initiating OAuth authorization code flows

## Usage Examples

### External Application Setup

```python
import requests
import json

# Configuration from CloudFormation outputs
GATEWAY_URL = "<MCPServerEndpoint>"  # From stack outputs
CLIENT_ID = "<MCPClientId>"  # From stack outputs
CLIENT_SECRET = "<MCPClientSecret>"  # From stack outputs
TOKEN_URL = "<MCPTokenURL>"  # From stack outputs

# Get access token
token_response = requests.post(
    TOKEN_URL,
    headers={"Content-Type": "application/x-www-form-urlencoded"},
    data={
        "grant_type": "client_credentials",
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET
    }
)
access_token = token_response.json()["access_token"]

# Query analytics data using natural language
query_request = {
    "method": "tools/call",
    "params": {
        "name": "search_genaiidp",
        "arguments": {
            "query": "How many documents were processed this week?"
        }
    }
}

response = requests.post(
    GATEWAY_URL,
    headers={
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    },
    json=query_request
)

result = response.json()
print(f"Query result: {result}")
```

### Amazon Quick Suite Integration

For Amazon Quick Suite integration, configure the MCP connection using the CloudFormation stack outputs detailed in the [Output Parameters](#output-parameters) section.

- **MCP Server**: Use `MCPServerEndpoint` output value
- **Client ID**: Use `MCPClientId` output value
- **Client Secret**: Use `MCPClientSecret` output value
- **Token URL**: Use `MCPTokenURL` output value
- **Authorization URL**: Use `MCPAuthorizationURL` output value