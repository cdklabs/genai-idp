<!--
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
SPDX-License-Identifier: Apache-2.0
-->

# Contributing to GenAIIC IDP Accelerator

Thank you for your interest in contributing to the GenAIIC IDP Accelerator! This document provides guidelines and instructions for contributing to this project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Issue Reporting](#issue-reporting)
- [Security Issues](#security-issues)
- [License](#license)

## Code of Conduct

This project adheres to the [Amazon Open Source Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)
- [yarn](https://yarnpkg.com/) for node package management
- Docker CLI (can be [Docker Desktop](https://docs.docker.com/desktop/) or [Rancher Desktop](https://rancherdesktop.io/))
- rsync for copying assets to packages
- [Python](https://www.python.org/) for building Python GenAI IDP distributable packages
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) (`npm install -g aws-cdk`)

### Environment Setup

1. Fork the repository and clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/genaiic-idp-accelerator-cdk.git
   cd genaiic-idp-accelerator-cdk
   ```

2. Set up the correct Node.js version using NVM:
   ```bash
   # Install the required Node.js version specified in .nvmrc
   nvm install
   
   # Use the project's Node.js version
   nvm use
   ```

3. Install Yarn globally (if not already installed):
   ```bash
   npm i -g yarn
   ```

4. Install project dependencies:
   ```bash
   yarn install
   ```

5. Ensure Docker is running and rsync is available

6. (Re)scaffold the project:
   ```bash
   yarn projen
   ```

7. Build the packages:
   ```bash
   yarn build:packages
   ```

## Development Workflow

This project uses [projen](https://projen.io/) for project configuration and management. The project structure follows AWS CDK best practices with a monorepo approach.

### Project Structure

- `./packages/` - Core CDK constructs and patterns
- `./samples/` - Working examples demonstrating implementation patterns
- `./crossgen/` - CloudFormation template generation

### Making Changes

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes to the codebase.

3. Run the build process to ensure everything compiles:
   ```bash
   yarn build
   ```

4. Run tests to ensure your changes don't break existing functionality:
   ```bash
   yarn test
   ```

5. If you've added new functionality, add appropriate tests.

6. Update documentation as needed.

## Pull Request Process

1. Ensure your code follows the project's coding standards.
2. Update the README.md and other documentation with details of changes if appropriate.
3. Add or update tests as needed.
4. Ensure all tests pass.
5. Submit a pull request to the main repository.
6. The PR description should clearly describe the problem and solution.
7. Include the relevant issue number if applicable.

### PR Review Process

1. At least one project maintainer will review your PR.
2. Feedback may be provided, requiring changes before merging.
3. Once approved, a maintainer will merge your PR.

## Coding Standards

This project follows AWS CDK best practices and conventions:

### TypeScript

- Use TypeScript for all new code.
- Follow the [AWS CDK coding style](https://github.com/aws/aws-cdk/blob/main/CONTRIBUTING.md#code-style).
- Use strong typing and avoid `any` types when possible.
- Use async/await for asynchronous code.
- Use meaningful variable and function names.

### CDK Constructs

- Follow the [AWS Construct Library Guidelines](https://github.com/aws/aws-cdk/blob/main/docs/DESIGN.md).
- Use L2 constructs when available.
- Provide sensible defaults but allow for customization.
- Include comprehensive JSDoc comments for all public APIs.
- Follow the principle of least privilege for IAM permissions.

### Python Lambda Functions

- Follow [PEP 8](https://www.python.org/dev/peps/pep-0008/) style guide.
- Use type hints.
- Include docstrings for all functions and classes.

## Testing

All new code should include appropriate tests:

- **Unit tests**: Test individual components in isolation.
- **Integration tests**: Test interactions between components.
- **CDK tests**: Use CDK's testing framework to verify infrastructure.

Run tests with:
```bash
yarn test
```

## Documentation

Good documentation is crucial for the project's usability:

- Update API.md files when adding or modifying constructs.
- Include JSDoc comments for all public APIs.
- Update README.md files when adding new features.
- Provide examples for new functionality.

## Issue Reporting

- Use the GitHub issue tracker to report bugs or request features.
- Check existing issues before creating a new one.
- Provide detailed steps to reproduce bugs.
- Include relevant logs and error messages.
- Specify the versions of the project, AWS CDK, and Node.js you're using.

## Security Issues

If you discover a security vulnerability, please do NOT open an issue. Email the project maintainers directly or follow the [AWS vulnerability reporting guidelines](https://aws.amazon.com/security/vulnerability-reporting/).

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [Apache License 2.0](LICENSE).

---

Thank you for contributing to the GenAIIC IDP Accelerator! Your efforts help improve the project for everyone.
