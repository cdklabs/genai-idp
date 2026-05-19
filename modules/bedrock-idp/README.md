# Bedrock IDP Module

GenAI IDP Accelerator Pattern 2 — custom document extraction using Amazon Bedrock foundation models, wrapped as a SeedFarmer module for GenAI Enterprise Hub.

## What It Deploys

- VPC with isolated subnets and VPC endpoints (fully private)
- KMS encryption key for all data at rest
- S3 buckets (input, working, output)
- Cognito user pool and identity pool
- AppSync GraphQL API
- Bedrock LLM processing pipeline (Step Functions + Lambda)
- CloudFront web application
- Optional admin user (via `ADMIN_EMAIL` parameter)

## Parameters

| Name | Required | Default | Description |
|------|----------|---------|-------------|
| `ADMIN_EMAIL` | No | `""` | Email for initial admin user |

## Local Development

```bash
npm install
npm run build
npx cdk synth
npx cdk deploy
```
