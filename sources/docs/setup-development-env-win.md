# Windows Development Environment Setup

This guide provides instructions for setting up a complete development environment for the GenAI IDP accelerator on Windows systems using the automated setup script.

## Prerequisites

Before running the setup script, ensure you have:

- **Windows 10 or Windows 11** with latest updates
- **Administrator privileges** on your machine
- **Internet connectivity** for downloading packages
- **PowerShell** (included with Windows)
- **At least 10GB free disk space** for all development tools

## Running the Setup Script

### Step 1: Run as Administrator

1. Right-click on **Command Prompt** or **PowerShell**
2. Select **"Run as administrator"**
3. Navigate to the project directory:
   ```cmd
   cd path\to\genaiic-idp-accelerator
   ```
4. Execute the setup script:
   ```cmd
   scripts\dev_setup.bat
   ```

### Step 2: Follow Interactive Prompts

The script will guide you through:

1. **AWS Credentials Configuration**:
   ```
   Enter AWS Access Key ID: 
   Enter AWS Secret Access Key: 
   Enter AWS Default Region (e.g., us-east-1): 
   ```

2. **GitLab Project Setup**:
   - SSH URL (uses default if not specified)
   - Local parent directory name (defaults to "idp")
   - Branch selection (defaults to "develop")
   - Project will be cloned to `C:\Projects\<parent-dir>\genaiic-idp-accelerator`

3. **Build Configuration**:
   - S3 bucket name for artifacts
   - S3 prefix (defaults to "idp")
   - AWS region (defaults to "us-east-1")
   - Build options: Standard, Verbose, or Skip build

## What Gets Installed

The script automatically installs and configures:

### Development Tools
- **Python 3.12** - Required runtime for the project
- **Node.js** - For React UI development
- **Git** - Version control
- **AWS CLI** - AWS service interaction
- **AWS SAM CLI** - Serverless application deployment
- **Docker Desktop** - Container support
- **Chocolatey** - Windows package manager

### Python Dependencies
- **boto3** - AWS SDK for Python
- **numpy 2.3.2** - Numerical computing
- **typer** - CLI framework
- **rich** - Rich text and beautiful formatting
- **editdistance** - String similarity calculations
- **python-docx** - Word document processing

## Troubleshooting

### Common Issues

#### Administrator Privileges Error
**Problem**: Script fails with "must be run as Administrator"
**Solution**: 
- Close current command prompt
- Right-click Command Prompt → "Run as administrator"
- Navigate back to project directory and retry

#### Python Version Issues
**Problem**: "Python version is too old. Need Python 3.12 or later"
**Solution**: The script will automatically install Python 3.12

#### Chocolatey Installation Fails
**Problem**: PowerShell execution policy restrictions
**Solution**: The script handles this automatically, but if issues persist:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

#### AWS CLI Configuration Test Fails
**Problem**: "AWS configuration test failed"
**Solution**:
- Verify your AWS credentials are correct
- Check internet connectivity
- Ensure your AWS account has necessary permissions

#### Docker Installation Issues
**Problem**: Docker Desktop installation fails or requires restart
**Solution**:
- Complete the script execution
- Restart your computer when prompted
- Docker Desktop may require manual startup after restart

#### Build Failures (pywin32 Error)
**Problem**: `Error: PythonPipBuilder:ResolveDependencies - {pywin32==311(wheel)}`
**Solution**: This is a known issue with Windows-specific dependencies:
```cmd
# Clean build cache and retry
rmdir /s /q .aws-sam
python publish.py <bucket> <prefix> <region>

# Or use container build (requires Docker)
sam build --use-container
```

#### SAM CLI Version Requirements
**Problem**: Build fails due to SAM CLI version
**Solution**: The script installs SAM CLI >= 1.129.0 automatically. If issues persist:
```cmd
# Check version
sam --version

# Update if needed
choco upgrade aws-sam-cli -y
```

## Validation

After successful installation, the script automatically validates:

- ✓ Python 3.12+ installation
- ✓ Node.js installation  
- ✓ AWS CLI installation and configuration
- ✓ Git installation
- ✓ Docker installation (may show warning if not running)
- ✓ SAM CLI installation
- ✓ Python package installations (boto3, numpy, typer, rich)

## Next Steps

After successful setup:

1. **Review the validation output** to ensure all components installed correctly
2. **Restart your computer** if Docker Desktop was installed
3. **Your development environment is ready** - the script has already built the project if you selected that option
4. **Use the provided CloudFormation template URL** to deploy the stack to AWS

## Build Options Explained

The script offers three build options:

1. **Standard build (recommended)**: Builds the project with normal output
2. **Verbose build**: Provides detailed output for debugging build issues  
3. **Skip build**: Only sets up the environment without building the project

## Support

If you encounter issues:

1. Check the script output for specific error messages
2. Review the validation results at the end of the script
3. Consult the project's main [Troubleshooting Guide](./troubleshooting.md)
4. Contact the development team with detailed error logs

---

**Note**: The setup process may take 30-60 minutes depending on your internet connection. A system restart may be required after Docker Desktop installation.
