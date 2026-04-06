#!/usr/bin/env python3
"""DSR setup script to extract and configure DSR tool."""

import sys
import shutil
import subprocess
import platform
from pathlib import Path


def run_command(cmd, cwd=None):
    """Run shell command and return result."""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)  # nosec B602 nosemgrep: python.lang.security.audit.subprocess-shell-true.subprocess-shell-true - hardcoded commands, no user input
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {cmd}: {e}")
        return False


def get_platform_pattern():
    """Get DSR file pattern based on platform."""
    system = platform.system().lower()
    arch = platform.machine().lower()
    
    if system == "linux":
        if "x86_64" in arch or "amd64" in arch:
            return "dsr-cli*linux-x64.tar.gz"
        elif "arm" in arch or "aarch64" in arch:
            return "dsr-cli*linux-arm64.tar.gz"
    elif system == "darwin":  # macOS
        if "arm" in arch or "aarch64" in arch:
            return "dsr-cli*macos-arm64.tar.gz"
        else:
            return "dsr-cli*macos-x64.tar.gz"
    elif system == "windows":
        return "dsr-cli*windows-x64.zip"
    
    raise ValueError(f"Unsupported platform: {system} {arch}")


def find_dsr_archive(dsr_dir):
    """Find DSR archive file in directory."""
    pattern = get_platform_pattern()
    matches = list(dsr_dir.glob(pattern))
    
    if matches:
        return max(matches, key=lambda p: p.stat().st_mtime)
    return None


def extract_dsr(archive_path, dsr_dir):
    """Extract DSR archive."""
    filename = archive_path.name
    
    print(f"Extracting: {filename}")
    
    success = False
    if filename.endswith(".tar.gz"):
        success = run_command(f"tar -xzf {filename}", cwd=dsr_dir)
    elif filename.endswith(".zip"):
        success = run_command(f"unzip -o {filename}", cwd=dsr_dir)
    else:
        print(f"Unsupported archive format: {filename}")
        return False
    
    # Remove macOS quarantine attribute if on macOS
    if success and platform.system().lower() == "darwin":
        dsr_executable = dsr_dir / "dsr"
        if dsr_executable.exists():
            print("Removing macOS quarantine attribute...")
            run_command(f"xattr -d com.apple.quarantine ./dsr", cwd=dsr_dir)
    
    return success


def get_installed_version(dsr_dir):
    """Get the currently installed DSR version, or None if not installed."""
    dsr_executable = dsr_dir / "dsr"
    if not dsr_executable.exists():
        return None
    try:
        result = subprocess.run(
            [str(dsr_executable), "--version"],
            capture_output=True, text=True, check=False,
        )
        if result.returncode == 0:
            return result.stdout.strip().lstrip("v")
        return None
    except Exception:
        return None


def main():
    """Setup DSR tool."""
    project_root = Path(__file__).parent.parent.parent
    dsr_dir = project_root / ".dsr"
    
    print("Setting up DSR tool...")
    
    # Create .dsr directory
    dsr_dir.mkdir(exist_ok=True)
    
    # Prompt user for desired version
    default_version = "1.0.5"
    version_input = input(
        f"Enter latest DSR version [{default_version}]: "
    ).strip()
    desired_version = (version_input or default_version).lstrip("v")
    
    # Check if desired version is already installed
    installed_version = get_installed_version(dsr_dir)
    if installed_version == desired_version:
        print(f"DSR v{desired_version} is already installed. Skipping installation.")
    else:
        if installed_version:
            print(f"Installed: v{installed_version}. Requested: v{desired_version}.")
        
        # Remove old archives so we don't re-extract a stale version
        for old in dsr_dir.glob("dsr-cli*"):
            old.unlink()
            print(f"Removed old archive: {old.name}")

        # Prompt user to manually download the requested version
        print("Please download DSR tool:")
        print("1. Visit: https://drive.corp.amazon.com/documents/DSR_Tool/Releases/Latest/")
        print(f"2. Download version v{desired_version} for your platform")
        print(f"3. Place the file in: {dsr_dir}")
        
        input("Press Enter after downloading the file (or Ctrl+C to quit)...")
        
        archive_path = find_dsr_archive(dsr_dir)
        if not archive_path:
            print("DSR archive not found. Please ensure the file is in the correct location.")
            sys.exit(1)
        
        # Extract DSR tool
        if not extract_dsr(archive_path, dsr_dir):
            print("Failed to extract DSR tool")
            sys.exit(1)
        
        # Verify installed version after extraction
        installed_version = get_installed_version(dsr_dir)
        if installed_version != desired_version:
            print(
                f"Warning: Expected v{desired_version}, "
                f"but got v{installed_version or 'unknown'}."
            )
    
    # Always copy latest issues.json from scripts/dsr to .dsr
    issues_source = Path(__file__).parent / "issues.json"
    issues_target = dsr_dir / "issues.json"
    
    if issues_source.exists():
        shutil.copy2(issues_source, issues_target)
        print(f"Copied latest issues.json to .dsr/")
    
    # Make dsr executable
    dsr_executable = dsr_dir / "dsr"
    if dsr_executable.exists():
        dsr_executable.chmod(0o755)
    
    # Configure DSR - this is interactive but necessary
    print("Configuring DSR...")
    print("Please follow the prompts to configure DSR with your AWS settings.")
    
    result = subprocess.run(
        ["./dsr", "config"],
        cwd=dsr_dir,
        check=False
    )
    if result.returncode != 0:
        print("DSR configuration failed")
        sys.exit(1)
    
    print("DSR setup complete!")


if __name__ == "__main__":
    main()
