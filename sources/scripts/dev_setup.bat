@echo off
setlocal enabledelayedexpansion

REM ========================================
REM    GenAI IDP Development Setup Script
REM ========================================
REM
REM This script sets up a complete development environment for the
REM GenAI Intelligent Document Processing (IDP) accelerator.
REM
REM Updated for:
REM - Python 3.12 compatibility (minimum required version)
REM - Enhanced validation and error handling
REM - Verbose mode support for publish.py
REM - Comprehensive installation verification
REM
REM Requirements:
REM - Windows 10/11 with PowerShell
REM - Administrator privileges
REM - Internet connectivity
REM
REM Last updated: 2025-08-26
REM ========================================

echo ========================================
echo    Development Environment Setup
echo ========================================
echo.
echo This script will install:
echo - AWS CLI
echo - Python 3.12 (required for compatibility)
echo - Node.js (for React development)
echo - Git
echo - Docker
echo - AWS SAM CLI
echo - Python dependencies (boto3, numpy 2.3.2, typer, rich)
echo - Configure AWS credentials [requires aws cli role secrets]
echo - Clone GitLab project and install dependencies
echo.

pause

:: Check if running as administrator
 net session >nul 2>&1
 if %errorLevel% neq 0 (
   echo ERROR: This script must be run as Administrator!
   echo Please right-click and select "Run as administrator"
   pause
    exit /b 1
 )

echo ========================================
echo    Step 1: Installing Chocolatey
echo ========================================
echo.

REM Check if Chocolatey is installed
choco --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Chocolatey package manager...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    
    if !errorLevel! neq 0 (
        echo ERROR: Failed to install Chocolatey
        pause
        exit /b 1
    )
    
    REM Refresh environment variables
    call refreshenv
    echo Chocolatey installed successfully!
) else (
    echo Chocolatey is already installed.
)

echo.

echo Checking Python installation...
 
:: Check if python command exists
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python is not installed. Installing Python 3.12...
    goto :install_python
) 
:: Get Python version
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i 
  :: Extract major and minor version numbers
  for /f "tokens=1,2 delims=." %%a in ("%PYTHON_VERSION%") do (
     set MAJOR=%%a
     set MINOR=%%b
  ) 
echo Found Python %PYTHON_VERSION%
:: Check if version is 3.12 or later
if %MAJOR% lss 3 (
    echo Python version is too old. Need Python 3.12 or later.
    goto :install_python
)
if %MAJOR% equ 3 (
   if %MINOR% lss 12 (
       echo Python version is too old. Need Python 3.12 or later.
       goto :install_python
    )
) 
echo Python %PYTHON_VERSION% meets requirements (3.12+)

:install_python
echo ========================================
echo    Step 2: Installing Python 3.12
echo ========================================
echo.

echo Installing Python 3.12...
choco install python312 -y
    
if !errorLevel! neq 0 (
	echo ERROR: Failed to install Python 3.12
	pause
	exit /b 1
)
    
call refreshenv
echo Python 3.12 installed successfully!

:end
echo.

echo ========================================
echo    Step 3: Installing Node.js
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Node.js...
    choco install nodejs -y
    
    if !errorLevel! neq 0 (
        echo ERROR: Failed to install Node.js
        pause
        exit /b 1
    )
    
    call refreshenv
    echo Node.js installed successfully!
) else (
    echo Node.js is already installed.
)

echo.

echo ========================================
echo    Step 4: Installing AWS CLI
echo ========================================
echo.

REM Check if AWS CLI is installed
aws --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing AWS CLI...
    choco install awscli -y
    
    if !errorLevel! neq 0 (
        echo ERROR: Failed to install AWS CLI
        pause
        exit /b 1
    )
    
    call refreshenv
    echo AWS CLI installed successfully!
) else (
    echo AWS CLI is already installed.
)

echo.

echo ========================================
echo    Step 4.1: Configuring AWS CLI
echo ========================================
echo.

echo Please provide your AWS credentials:
echo.

set /p AWS_ACCESS_KEY_ID="Enter AWS Access Key ID: "
set /p AWS_SECRET_ACCESS_KEY="Enter AWS Secret Access Key: "
set /p AWS_DEFAULT_REGION="Enter AWS Default Region (e.g., us-east-1): "

if "!AWS_ACCESS_KEY_ID!"=="" (
    echo ERROR: AWS Access Key ID cannot be empty
    pause
    exit /b 1
)

if "!AWS_SECRET_ACCESS_KEY!"=="" (
    echo ERROR: AWS Secret Access Key cannot be empty
    pause
    exit /b 1
)

if "!AWS_DEFAULT_REGION!"=="" (
    set AWS_DEFAULT_REGION=us-east-1
    echo Using default region: us-east-1
)

echo.
echo Configuring AWS CLI...

REM Configure AWS CLI
aws configure set aws_access_key_id "!AWS_ACCESS_KEY_ID!"
aws configure set aws_secret_access_key "!AWS_SECRET_ACCESS_KEY!"
aws configure set default.region "!AWS_DEFAULT_REGION!"
aws configure set default.output json

if !errorLevel! neq 0 (
    echo ERROR: Failed to configure AWS CLI
    pause
    exit /b 1
)

echo AWS CLI configured successfully!

REM Test AWS configuration
echo Testing AWS configuration...
aws sts get-caller-identity >nul 2>&1
if !errorLevel! neq 0 (
    echo WARNING: AWS configuration test failed. Please verify your credentials.
) else (
    echo AWS configuration test passed!
)

echo ========================================
echo    Step 5: Installing Docker Desktop
echo ========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Docker Desktop...
    choco install docker-desktop -y
    
    if !errorLevel! neq 0 (
        echo ERROR: Failed to install Docker Desktop
        echo Please install Docker Desktop manually from https://www.docker.com/products/docker-desktop
        pause
    ) else (
        echo Docker Desktop installed successfully!
        echo NOTE: You may need to restart your computer and enable WSL2 for Docker to work properly.
    )
    
    call refreshenv
) else (
    echo Docker is already installed.
)

echo.

echo ========================================
echo    Step 6: Installing AWS SAM CLI
echo ========================================
echo.

REM Check if AWS SAM CLI is installed
sam --version >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing AWS SAM CLI via Chocolatey...
    choco install aws-sam-cli -y
    
    if !errorLevel! neq 0 (
        echo WARNING: Chocolatey installation failed. Trying pip installation...
        python -m pip install aws-sam-cli
        
        if !errorLevel! neq 0 (
            echo ERROR: Failed to install AWS SAM CLI
            echo Please install manually from: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
            pause
            exit /b 1
        )
    )
    
    call refreshenv
    
    REM Verify installation and check version
    sam --version >nul 2>&1
    if !errorLevel! equ 0 (
        echo AWS SAM CLI installed successfully!
        echo Checking SAM CLI version...
        for /f "tokens=4" %%i in ('sam --version 2^>^&1') do set SAM_VERSION=%%i
        echo Found SAM CLI version: !SAM_VERSION!
        echo Note: publish.py requires SAM CLI version >= 1.129.0
    ) else (
        echo ERROR: AWS SAM CLI installation verification failed
        pause
        exit /b 1
    )
) else (
    echo AWS SAM CLI is already installed.
    echo Checking SAM CLI version...
    for /f "tokens=4" %%i in ('sam --version 2^>^&1') do set SAM_VERSION=%%i
    echo Found SAM CLI version: !SAM_VERSION!
    echo Note: publish.py requires SAM CLI version >= 1.129.0
)

echo.
:: Install Git using Chocolatey
echo Installing Git ..
:: check if git is installed
git --version > nul 2>&1

if %errorLevel% equ 0 (
	echo Git is already installed
) else (
	echo Installing Git...
	choco install git -y
	git --version > nul 2>&1
	call refreshenv
	if %errorLevel% equ 0 (
		echo Git installation completed
	) else (
		echo Git installation failed
	)
)

echo Your development environment has been set up with:
echo - Python 3.12
echo - Node.js and npm
echo - AWS CLI (configured)
echo - Git
echo - Python dependencies (boto3, numpy 2.3.2, typer, rich)


echo ========================================
echo    Step 7: GitLab Project Setup
echo ========================================
echo.
mwinit -k C:\Users\tanimath\.ssh\id_ecdsa.pub
echo NOTE: This GitLab instance requires SSH authentication.
echo.
set /p GITLAB_PROJECT_URL="Enter GitLab project SSH URL (default: git@ssh.gitlab.aws.dev:genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator.git): "
if "!GITLAB_PROJECT_URL!"=="" (
    set GITLAB_PROJECT_URL=git@ssh.gitlab.aws.dev:genaiic-reusable-assets/engagement-artifacts/genaiic-idp-accelerator.git
    echo Using default SSH URL: !GITLAB_PROJECT_URL!
)
echo Using SSH URL: !GITLAB_PROJECT_URL!
set /p PROJECT_DIR="Enter local directory name for the project (default: idp): "
if "!PROJECT_DIR!"=="" set PROJECT_DIR=idp

if "!GITLAB_PROJECT_URL!"=="" (
    echo Skipping GitLab project clone...
    goto :skip_gitlab
)

if "!PROJECT_DIR!"=="" (
    echo ERROR: Project directory name cannot be empty
    pause
    exit /b 1
)

echo.
echo Cloning GitLab project...

REM Create projects directory if it doesn't exist
if not exist "C:\Projects" (
    mkdir "C:\Projects"
)

cd /d "C:\Projects"

REM Create the parent directory if it doesn't exist
if not exist "!PROJECT_DIR!" (
    mkdir "!PROJECT_DIR!"
)

cd "!PROJECT_DIR!"

REM Check if project directory already exists
if exist "genaiic-idp-accelerator" (
    echo Project directory C:\Projects\!PROJECT_DIR!\genaiic-idp-accelerator already exists
    cd "genaiic-idp-accelerator"
    
    REM Check if it's a git repository
    git status >nul 2>&1
    if !errorLevel! equ 0 (
        echo Found existing git repository, skipping clone...
        echo Checking current branch and pulling latest changes...
        
        REM Get current branch
        for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
        echo Current branch: !CURRENT_BRANCH!
        
        REM Pull latest changes
        git pull origin !CURRENT_BRANCH!
        if !errorLevel! neq 0 (
            echo WARNING: Failed to pull latest changes
        )
        
        REM Ask user which branch to checkout
        echo.
        set /p TARGET_BRANCH="Enter branch to checkout (default: develop): "
        
        if "!TARGET_BRANCH!"=="" (
            set TARGET_BRANCH=develop
            echo Using default branch: develop
        )
        
        REM Checkout target branch if not already on it
        if not "!CURRENT_BRANCH!"=="!TARGET_BRANCH!" (
            echo Checking out branch: !TARGET_BRANCH!
            
            REM First try to checkout existing local branch
            git checkout !TARGET_BRANCH! >nul 2>&1
            
            if !errorLevel! neq 0 (
                echo Local branch !TARGET_BRANCH! not found, checking for remote branch...
                
                REM Fetch latest remote branches
                git fetch origin
                
                REM Try to checkout remote branch and create local tracking branch
                git checkout -b !TARGET_BRANCH! origin/!TARGET_BRANCH!
                
                if !errorLevel! neq 0 (
                    echo ERROR: Failed to checkout branch !TARGET_BRANCH!
                    echo The branch may not exist remotely or there may be network issues
                    echo Available remote branches:
                    git branch -r
                    pause
                ) else (
                    echo Successfully created and checked out branch !TARGET_BRANCH! from origin/!TARGET_BRANCH!
                )
            ) else (
                echo Successfully checked out existing local branch !TARGET_BRANCH!
            )
        ) else (
            echo Already on !TARGET_BRANCH! branch
        )
        
        goto :build_project
    ) else (
        echo Directory exists but is not a git repository
        echo Please remove C:\Projects\!PROJECT_DIR!\genaiic-idp-accelerator or choose a different directory name
        pause
        goto :skip_gitlab
    )
)

REM Clone the project
git clone "!GITLAB_PROJECT_URL!" "genaiic-idp-accelerator"

if !errorLevel! neq 0 (
    echo ERROR: Failed to clone GitLab project
    echo Please ensure you have access to the repository and try again manually
    pause
    goto :skip_gitlab
)

cd "genaiic-idp-accelerator"

echo.
echo Repository cloned successfully!

echo Fetching all remote branches...
git fetch

if !errorLevel! neq 0 (
    echo WARNING: Failed to fetch remote branches
) else (
    echo Remote branches fetched successfully!
)
echo.
set /p TARGET_BRANCH="Enter branch to checkout (default: develop): "

if "!TARGET_BRANCH!"=="" (
    set TARGET_BRANCH=develop
    echo Using default branch: develop
)

echo Checking out branch: !TARGET_BRANCH!

REM First try to checkout existing local branch
git checkout !TARGET_BRANCH! >nul 2>&1

if !errorLevel! neq 0 (
    echo Local branch !TARGET_BRANCH! not found, checking for remote branch...
    
    REM Try to checkout remote branch and create local tracking branch
    git checkout -b !TARGET_BRANCH! origin/!TARGET_BRANCH!
    
    if !errorLevel! neq 0 (
        echo ERROR: Failed to checkout branch !TARGET_BRANCH!
        echo The branch may not exist remotely or there may be network issues
        echo Available remote branches:
        git branch -r
        pause
    ) else (
        echo Successfully created and checked out branch !TARGET_BRANCH! from origin/!TARGET_BRANCH!
    )
) else (
    echo Successfully checked out existing local branch !TARGET_BRANCH!
)

echo GitLab project cloned successfully to C:\Projects\!PROJECT_DIR!\genaiic-idp-accelerator

:skip_gitlab
:build_project

echo.
echo ========================================
echo    Step 8: Building Project
echo ========================================
echo.

echo Please provide the required arguments for publish.py:
echo.
set /p BUCKET_NAME="Enter S3 bucket name for artifacts: "
set /p PREFIX="Enter S3 prefix for artifacts (default: idp): "
set /p REGION="Enter AWS region (default: us-east-1): "

if "!BUCKET_NAME!"=="" (
    echo ERROR: S3 bucket name cannot be empty
    pause
    exit /b 1
)

if "!PREFIX!"=="" (
    set PREFIX=idp
    echo Using default prefix: idp
)

if "!REGION!"=="" (
    set REGION=us-east-1
    echo Using default region: us-east-1
)

echo.
echo ========================================
echo    Step 8a: Installing Python Dependencies
echo ========================================
echo.

echo Installing required Python packages for publish.py...
echo Installing boto3 and numpy...

REM Validate Python installation before installing packages
python --version >nul 2>&1
if !errorLevel! neq 0 (
    echo ERROR: Python is not available in PATH
    echo Please restart your command prompt or check Python installation
    pause
    exit /b 1
)

REM Check Python version compatibility
for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo Using Python version: !PYTHON_VERSION!

REM Extract major and minor version numbers for validation
for /f "tokens=1,2 delims=." %%a in ("!PYTHON_VERSION!") do (
    set MAJOR=%%a
    set MINOR=%%b
)

if !MAJOR! lss 3 (
    echo ERROR: Python version !PYTHON_VERSION! is not supported
    echo This project requires Python 3.12 or later
    pause
    exit /b 1
)

if !MAJOR! equ 3 (
    if !MINOR! lss 12 (
        echo ERROR: Python version !PYTHON_VERSION! is not supported
        echo This project requires Python 3.12 or later
        pause
        exit /b 1
    )
)

echo Python version !PYTHON_VERSION! is compatible (3.12+ required)
echo.

python -m pip install --upgrade pip
if !errorLevel! neq 0 (
    echo WARNING: Failed to upgrade pip, continuing anyway...
)

echo Installing boto3...
python -m pip install boto3
if !errorLevel! neq 0 (
    echo ERROR: Failed to install boto3
    echo Please install boto3 manually: pip install boto3
    pause
    exit /b 1
)

echo Installing numpy 2.3.2...
python -m pip install numpy==2.3.2
if !errorLevel! neq 0 (
    echo ERROR: Failed to install numpy 2.3.2
    echo Please install numpy manually: pip install numpy==2.3.2
    pause
    exit /b 1
)

echo Installing editdistance==0.8.1...
python -m pip install editdistance==0.8.1
if !errorLevel! neq 0 (
    echo ERROR: Failed to install editdistance==0.8.1
    echo Please install editdistance manually: pip install editdistance==0.8.1
    pause
    exit /b 1
)

echo Installing python-docx==1.2.0...
python -m pip install python-docx==1.2.0
if !errorLevel! neq 0 (
    echo ERROR: Failed to install python-docx==1.2.0
    echo Please install python-docx manually: pip install python-docx==1.2.0
    pause
    exit /b 1
)

echo Installing typer...
python -m pip install typer
if !errorLevel! neq 0 (
    echo ERROR: Failed to install typer
    echo Please install typer manually: pip install typer
    pause
    exit /b 1
)

echo Installing rich...
python -m pip install rich
if !errorLevel! neq 0 (
    echo ERROR: Failed to install rich
    echo Please install rich manually: pip install rich
    pause
    exit /b 1
)

call refreshenv

echo Python dependencies installed successfully!

echo.
echo ========================================
echo    Step 8b: Building Project
echo ========================================
echo.

echo Build Options:
echo 1. Standard build (recommended)
echo 2. Verbose build (detailed output for debugging)
echo 3. Skip build (just setup environment)
echo.
set /p BUILD_OPTION="Select build option (1-3, default: 1): "

if "!BUILD_OPTION!"=="" set BUILD_OPTION=1
if "!BUILD_OPTION!"=="3" (
    echo Skipping project build as requested.
    goto :setup_complete
)

set VERBOSE_FLAG=
if "!BUILD_OPTION!"=="2" (
    set VERBOSE_FLAG=--verbose
    echo Using verbose mode for detailed output...
)

echo Running publish.py to build the project...
if "!VERBOSE_FLAG!"=="" (
    echo Command: python publish.py !BUCKET_NAME! !PREFIX! !REGION!
) else (
    echo Command: python publish.py !BUCKET_NAME! !PREFIX! !REGION! !VERBOSE_FLAG!
)
echo.

REM Validate that we're in the correct directory
if not exist "publish.py" (
    echo ERROR: publish.py not found in current directory
    echo Current directory: %CD%
    echo Please ensure you're in the project root directory
    pause
    exit /b 1
)

REM Validate that required files exist
if not exist "template.yaml" (
    echo ERROR: template.yaml not found. This doesn't appear to be the IDP project root.
    echo Current directory: %CD%
    pause
    exit /b 1
)

if not exist "lib\idp_common_pkg" (
    echo ERROR: lib\idp_common_pkg directory not found. Project structure appears incomplete.
    echo Current directory: %CD%
    pause
    exit /b 1
)

echo Validation passed. Starting build...
echo.

if "!VERBOSE_FLAG!"=="" (
    python publish.py !BUCKET_NAME! !PREFIX! !REGION!
) else (
    python publish.py !BUCKET_NAME! !PREFIX! !REGION! !VERBOSE_FLAG!
)

if !errorLevel! equ 0 (
    echo.
    echo ========================================
    echo    Build Successful!
    echo ========================================
    echo.
    echo Project built successfully!
    echo.
    echo Next steps:
    echo 1. Check the CloudFormation template URL provided above
    echo 2. Use the 1-Click Launch URL to deploy the stack
    echo 3. Monitor the deployment in AWS CloudFormation console
    echo.
) else (
    echo.
    echo ========================================
    echo    Build Failed!
    echo ========================================
    echo.
    echo ERROR: Project build failed
    echo Please check the output above for details
    echo.
    echo Common issues:
    echo - AWS credentials not configured correctly
    echo - S3 bucket permissions
    echo - SAM CLI version requirements
    echo - Python dependencies missing
    echo.
    echo Try running with verbose mode for more details:
    echo python publish.py !BUCKET_NAME! !PREFIX! !REGION! --verbose
    echo.
    pause
    exit /b 1
)

:setup_complete

echo ========================================
echo    Setup Complete!
echo ========================================
echo.

echo ========================================
echo    Installation Validation
echo ========================================
echo.

REM Validate all installations
set VALIDATION_FAILED=0

echo Validating installations...
echo.

REM Check Python
python --version >nul 2>&1
if !errorLevel! equ 0 (
    for /f "tokens=2" %%i in ('python --version 2^>^&1') do echo ✓ Python %%i installed
) else (
    echo ✗ Python installation failed
    set VALIDATION_FAILED=1
)

REM Check Node.js
node --version >nul 2>&1
if !errorLevel! equ 0 (
    for /f "tokens=*" %%i in ('node --version 2^>^&1') do echo ✓ Node.js %%i installed
) else (
    echo ✗ Node.js installation failed
    set VALIDATION_FAILED=1
)

REM Check AWS CLI
aws --version >nul 2>&1
if !errorLevel! equ 0 (
    for /f "tokens=1" %%i in ('aws --version 2^>^&1') do echo ✓ %%i installed
) else (
    echo ✗ AWS CLI installation failed
    set VALIDATION_FAILED=1
)

REM Check Git
git --version >nul 2>&1
if !errorLevel! equ 0 (
    for /f "tokens=1,2,3" %%i in ('git --version 2^>^&1') do echo ✓ %%i %%j %%k installed
) else (
    echo ✗ Git installation failed
    set VALIDATION_FAILED=1
)

REM Check Docker
docker --version >nul 2>&1
if !errorLevel! equ 0 (
    for /f "tokens=1,2,3" %%i in ('docker --version 2^>^&1') do echo ✓ %%i %%j %%k installed
) else (
    echo ⚠ Docker installation failed or not running
    echo   Note: Docker Desktop may require manual startup
)

REM Check SAM CLI
sam --version >nul 2>&1
if !errorLevel! equ 0 (
    for /f "tokens=4" %%i in ('sam --version 2^>^&1') do echo ✓ SAM CLI %%i installed
) else (
    echo ✗ SAM CLI installation failed
    set VALIDATION_FAILED=1
)

REM Check Python packages
python -c "import boto3; print('✓ boto3 installed')" 2>nul
if !errorLevel! neq 0 (
    echo ✗ boto3 package not available
    set VALIDATION_FAILED=1
)

python -c "import numpy; print('✓ numpy installed')" 2>nul
if !errorLevel! neq 0 (
    echo ✗ numpy package not available
    set VALIDATION_FAILED=1
)

python -c "import typer; print('✓ typer installed')" 2>nul
if !errorLevel! neq 0 (
    echo ✗ typer package not available
    set VALIDATION_FAILED=1
)

python -c "import rich; print('✓ rich installed')" 2>nul
if !errorLevel! neq 0 (
    echo ✗ rich package not available
    set VALIDATION_FAILED=1
)

echo.
if !VALIDATION_FAILED! equ 0 (
    echo ========================================
    echo    ✓ All validations passed!
    echo ========================================
    echo.
    echo Your development environment has been set up with:
    echo - Python 3.12
    echo - Node.js and npm
    echo - AWS CLI (configured)
    echo - Git
    echo - Python dependencies (boto3, numpy 2.3.2, typer, rich)
    echo.
    echo You can now use the IDP accelerator!
) else (
    echo ========================================
    echo    ⚠ Some validations failed!
    echo ========================================
    echo.
    echo Please review the failed installations above and
    echo install them manually before proceeding.
    echo.
    echo Common solutions:
    echo - Restart your command prompt to refresh PATH
    echo - Run 'refreshenv' to update environment variables
    echo - Check internet connectivity for package downloads
)

echo.
echo For support, refer to the project documentation or
echo contact the development team.
echo.
pause
