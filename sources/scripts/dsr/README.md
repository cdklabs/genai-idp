# DSR (Deliverable Security Review) Integration

This directory contains the DSR integration for the GenAI IDP Accelerator, providing automated security scanning and issue remediation.

## Quick Start

```bash
make dsr
```

This single command handles everything: setup, scanning, and optional interactive fixes.

## Available Commands

| Command | Description |
|---------|-------------|
| `make dsr` | Complete DSR workflow (setup → scan → fix prompt) |
| `make dsr-setup` | Setup DSR tool only |
| `make dsr-scan` | Run security scan only |
| `make dsr-fix` | Interactive issue fixing only |

## First Time Setup

1. **Run DSR**: `make dsr`
2. **Download DSR Tool**: When prompted, visit the corporate drive link and download the latest DSR archive
3. **Place Archive**: Put the downloaded file in `.dsr/` directory
4. **Press Enter**: Continue setup process
5. **Configure DSR**: Follow interactive prompts to configure AWS settings
6. **Scan Complete**: DSR will scan the project and show results
7. **Fix Issues**: Choose whether to run interactive fixes

## Workflow Details

### 1. Setup (`make dsr-setup`)
- Creates `.dsr/` directory
- Prompts for manual DSR tool download
- Extracts DSR archive
- Copies existing issues.json (if available)
- Makes DSR executable
- Runs interactive DSR configuration

### 2. Scan (`make dsr-scan`)
- Always runs fresh security scan
- DSR handles incremental scanning for performance
- Updates `.dsr/issues.json` with results

### 3. Fix (`make dsr-fix`)
- Runs interactive issue remediation
- Copies updated results back to version control
- Updates `scripts/dsr/issues.json`

## File Structure

```
scripts/dsr/
├── README.md          # This documentation
├── setup.py           # DSR installation and configuration
├── run.py             # DSR scanning execution
├── fix.py             # DSR issue fixing
└── issues.json        # Security issues (version controlled)

.dsr/                  # Working directory (not version controlled)
├── dsr                # DSR executable
├── config.json        # DSR configuration
├── issues.json        # Current scan results
└── ...                # Other DSR artifacts
```

## Manual DSR Download

DSR must be manually downloaded from the internal Amazon corporate drive:

1. **Visit**: https://drive.corp.amazon.com/documents/DSR_Tool/Releases/Latest/
2. **Download**: Latest version for your platform (e.g., `dsr-cli-v0.0.12-linux-x64.tar.gz`)
3. **Place**: In `.dsr/` directory
4. **Continue**: Setup will automatically extract and configure

## Configuration

DSR configuration is interactive and includes:
- **AWS Profile**: Select from available profiles
- **AWS Region**: Automatically detected
- **Bedrock Model**: Default Claude Sonnet 4
- **PATH Integration**: Optional (recommended: No for project-specific use)

## Issues Management

- **Version Control**: `scripts/dsr/issues.json` is tracked in git
- **Working Copy**: `.dsr/issues.json` is the live working copy
- **Synchronization**: 
  - Setup copies `scripts/dsr/issues.json` → `.dsr/issues.json`
  - Fix copies `.dsr/issues.json` → `scripts/dsr/issues.json`

## Security Scan Results

DSR performs comprehensive security analysis:
- **CloudFormation Templates**: 33+ templates scanned
- **Python Code**: Bandit security scanning
- **Jupyter Notebooks**: Notebook-specific security checks
- **Infrastructure**: Checkov policy validation
- **Dependencies**: Software composition analysis
- **Threat Models**: Automated threat modeling
- **Diagrams**: Architecture diagram generation

## Troubleshooting

### Setup Issues
- **Archive not found**: Ensure DSR archive is in `.dsr/` directory with correct filename pattern
- **Configuration hangs**: DSR config is interactive - follow the prompts
- **Permission denied**: Setup automatically makes DSR executable

### Scan Issues
- **Configuration not found**: Run `make dsr-setup` first
- **Scan fails**: Check AWS credentials and Bedrock model access
- **Large output**: Some Checkov scans may hit buffer limits (non-fatal)

### Fix Issues
- **No issues to fix**: DSR may show 0 high-priority issues needing attention
- **Fix fails**: Ensure proper AWS permissions for remediation actions

## Integration with CI/CD

The DSR integration can be used in CI/CD pipelines:

```bash
# Setup DSR (requires manual download step)
make dsr-setup

# Run scan only (for CI)
make dsr-scan

# Check results
cat .dsr/issues.json
```

## AWS Requirements

DSR requires:
- **AWS CLI**: Configured with appropriate credentials
- **Bedrock Access**: Claude Sonnet 4 model access
- **IAM Permissions**: Read access to AWS resources for analysis

## Version Management

- DSR version is determined by the manually downloaded archive
- No hardcoded version numbers in scripts
- Supports any DSR version that follows the standard CLI interface
- Update by downloading newer DSR archive and re-running setup
