# Contributing

Thank you for your interest in contributing to the GenAI IDP Accelerator CDK implementation! This section provides guidelines for contributing to the project.

## Code of Conduct

This project adheres to the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct). By participating, you are expected to uphold this code. Please report unacceptable behavior to aws-opensource@amazon.com.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following prerequisites installed:

- [NVM](https://github.com/nvm-sh/nvm) (Node Version Manager)
- [yarn](https://yarnpkg.com/) for node package management
- Docker CLI (can be [Docker Desktop](https://docs.docker.com/desktop/) or [Rancher Desktop](https://rancherdesktop.io/))
- rsync for copying assets to packages
- [Python](https://www.python.org/) for building Python GenAI IDP distributable packages
- [.NET SDK](https://dotnet.microsoft.com/en-us/download/visual-studio-sdks) for building .NET GenAI IDP distributable packages
- [AWS CLI](https://aws.amazon.com/cli/) configured with appropriate credentials
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/cli.html) (`npm install -g aws-cdk`)

### Setting Up the Development Environment

1. Fork the repository on GitLab

2. Clone your fork:

```bash
git clone https://gitlab.aws.dev/YOUR-USERNAME/genaiic-idp-accelerator-cdk.git
cd genaiic-idp-accelerator-cdk
```

3. Set up the correct Node.js version using NVM:

```bash
# Install the required Node.js version specified in .nvmrc
nvm install

# Use the project's Node.js version
nvm use
```

4. Install Yarn globally (if not already installed):

```bash
npm i -g yarn
```

5. Install project dependencies:

```bash
yarn install
```

6. (Re)scaffold the project:

```bash
yarn projen
```

7. Build the packages:

```bash
yarn build:packages
```

## Development Workflow

### Project Structure

The repository is organized into three main sections:

- **Core Packages (`./packages/`)**: Core CDK constructs and patterns
- **Samples (`./samples/`)**: Working examples demonstrating implementation patterns
- **Cross-Generation (`./crossgen/`)**: CloudFormation template generation

### Making Changes

1. Create a new branch for your changes:

```bash
git checkout -b feature/my-feature
```

2. Make your changes to the codebase

3. Run the linter to ensure code quality:

```bash
yarn lint
```

4. Run tests to ensure your changes don't break existing functionality:

```bash
yarn test
```

5. Build the packages to ensure everything compiles correctly:

```bash
yarn build:packages
```

### Submitting Changes

1. Commit your changes with a descriptive commit message:

```bash
git commit -m "feat: add new feature"
```

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification for commit messages.

2. Push your changes to your fork:

```bash
git push origin feature/my-feature
```

3. Create a merge request on GitLab

4. Wait for the CI/CD pipeline to run and ensure all checks pass

5. Address any feedback from reviewers

6. Once approved, your changes will be merged into the main branch

## Development Guidelines

### Code Style

This project uses ESLint and Prettier for code style and formatting:

- Run `yarn lint` to check for linting issues
- Run `yarn format` to automatically format code

### Testing

All new features and bug fixes should include tests:

- Run `yarn test` to run all tests
- Run `yarn test:watch` to run tests in watch mode
- Run `yarn test:coverage` to generate a coverage report

### Documentation

All new features should include documentation:

- Update relevant documentation in the `docs/` directory
- Include code comments for complex logic
- Update README files as needed

### Versioning

This project follows [Semantic Versioning](https://semver.org/):

- MAJOR version for incompatible API changes
- MINOR version for new functionality in a backward-compatible manner
- PATCH version for backward-compatible bug fixes

## Adding New Features

### Adding a New Package

To add a new package to the project:

1. Create a new directory in the `packages/` directory:

```bash
mkdir -p packages/my-new-package
```

2. Initialize the package using Projen:

```typescript
// In .projenrc.ts
const myNewPackage = new awscdk.AwsCdkConstructLibrary({
  name: '@genaiid/my-new-package',
  description: 'My new package description',
  author: 'AWS',
  authorOrganization: true,
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  jsiiVersion: '~5.0.0',
  repositoryUrl: 'https://gitlab.aws.dev/genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator-cdk.git',
  deps: [
    'aws-cdk-lib',
    'constructs',
  ],
  devDeps: [
    'aws-cdk-lib',
    'constructs',
    '@types/jest',
    '@types/node',
  ],
  peerDeps: [
    'aws-cdk-lib',
    'constructs',
  ],
  publishToPypi: {
    distName: 'genaiid.my-new-package',
    module: 'genaiid.my_new_package',
  },
  parent: project,
});
```

3. Run `yarn projen` to scaffold the new package

4. Implement your package in the generated directory

### Adding a New Sample

To add a new sample to the project:

1. Create a new directory in the `samples/` directory:

```bash
mkdir -p samples/my-new-sample
```

2. Initialize the sample using Projen:

```typescript
// In .projenrc.ts
const myNewSample = new awscdk.AwsCdkTypeScriptApp({
  name: 'my-new-sample',
  description: 'My new sample description',
  cdkVersion: '2.1.0',
  defaultReleaseBranch: 'main',
  deps: [
    'aws-cdk-lib',
    'constructs',
    '@cdklabs/genai-idp',
    '@cdklabs/genai-idp-bda-processor',
  ],
  devDeps: [
    '@types/jest',
    '@types/node',
  ],
  parent: project,
});
```

3. Run `yarn projen` to scaffold the new sample

4. Implement your sample in the generated directory

## Release Process

The release process is automated using GitLab CI/CD:

1. Changes merged to the main branch trigger the CI/CD pipeline
2. The pipeline runs tests and builds the packages
3. If all checks pass, a new version is published to the package registry

## Additional Resources

- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/v2/guide/home.html)
- [Projen Documentation](https://projen.io/)
- [GitLab CI/CD Documentation](https://docs.gitlab.com/ee/ci/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
