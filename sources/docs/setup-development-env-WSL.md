# Development Environment Setup Guide on Windows using WSL

## Introduction  
This guide establishes a WSL-based development environment on Windows, specifically designed for the GenAI IDP accelerator.

**Purpose**: Provides a Linux development environment directly on Windows without virtualization overhead, combining native Windows tools with a complete Linux development stack.

**When to use this guide**:
- You're developing on Windows and need Linux compatibility
- You want to avoid Docker Desktop or VM overhead
- You need consistent behavior with the project's Linux-based AWS infrastructure
- You prefer integrated Windows/Linux development workflows

**What you'll achieve**: A seamless development setup where you can use Windows tools (VS Code, browsers, file explorers) while running the GenAI IDP accelerator in a native Linux environment.

## Prerequisites

**Official Microsoft WSL Installation Guide**: https://docs.microsoft.com/en-us/windows/wsl/install

## Step 1: Enable WSL on Windows

### 1.1 Install WSL with Ubuntu
1. Open PowerShell as Administrator
2. Run the installation command:
```bash
wsl --install -d Ubuntu 
```  
3. Complete Ubuntu setup with username/password 
4. You will enter into linux shell directly, then go to your WSL home directory using ``` cd ~ ```

## Step 2: Clone Repository and Run Setup Script

### 2.1  Clone Repository
```
git clone https://github.com/aws-solutions-library-samples/accelerated-intelligent-document-processing-on-aws
```
```
cd accelerated-intelligent-document-processing-on-aws
```

### 2.2 Run Automated Setup Script
```
./scripts/wsl_setup.sh
```
This script automatically installs:
- Git, Python 3, pip, and build tools
- Node.js 18
- AWS CLI v2
- AWS SAM CLI
- Python dependencies

After running the setup script, go to your WSL home directory using ```cd ~```

## Step 3: Complete Manual Setup

### 3.1 Create Python Virtual Environment
```
python3 -m venv venv
source venv/bin/activate
```

### 3.2 Install Python Dependencies
```bash
pip install setuptools wheel boto3 rich PyYAML botocore ruff pytest typer
```
### 3.3 Configure AWS CLI
```bash
aws configure
```
Enter your AWS credentials when prompted. Refer to: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-quickstart.html

## Step 4: Test the Setup

### 4.1 Verify All Tools
```bash
# Check versions
python3 --version (Example: Python 3.12.3)
aws --version (Example: aws-cli/2.28.26)
sam --version (Example: SAM CLI, version 1.143.0)
node --version (Example: v18.20.8)
npm --version (Example: 10.8.2)
```
### 4.2 Test Build Process
```
cd accelerated-intelligent-document-processing-on-aws
```
```
# Test publish script help
python3 publish.py --help

# Test build (replace with your S3 bucket name)
python3 publish.py your-bucket-name build-test us-east-1
```

### 4.3 Troubleshooting Build Issues
If the build fails, use the `--verbose` flag:
```bash
python3 publish.py your-bucket-name build-test us-east-1 --verbose
```

The verbose flag shows:
- Exact SAM build commands being executed
- Complete error output from failed builds
- Python version compatibility issues
- Missing dependencies or configuration problems

## Step 5: Install Visual Studio Code on Local Machine for using WSL as a terminal
### Visit the official website: Go to [https://code.visualstudio.com/](https://code.visualstudio.com/)
Download: Click the "Download for Windows" button 
- This will download the User Installer (recommended for most users) 
- File name will be something like VSCodeUserSetup-x64-1.x.x.exe  

Install:   
   - Run the downloaded installer  
   - Choose installation location (default is recommended)  

Launch: Click "Launch Visual Studio Code" when installation completes

### Install VSCode Extensions
Install **WSL** extension

### Open Project in WSL
From WSL terminal, navigate to project and open in VSCode
```
cd accelerated-intelligent-document-processing-on-aws
```