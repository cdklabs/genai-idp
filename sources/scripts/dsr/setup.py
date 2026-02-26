#!/usr/bin/env python3
"""DSR setup script to download, extract and configure DSR tool."""

import os
import sys
import shutil
import subprocess
import platform
import glob
from pathlib import Path


def run_command(cmd, cwd=None):
    """Run shell command and return result."""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error running command: {cmd}")
            print(f"Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Exception running command {cmd}: {e}")
        return False


def get_dsr_download_url(version="v0.0.12"):
    """Get DSR download URL based on platform and version."""
    system = platform.system().lower()
    arch = platform.machine().lower()
    
    base_url = f"https://drive.corp.amazon.com/documents/DSR_Tool/Releases/Latest/dsr-cli-{version}"
    
    if system == "linux":
        if "x86_64" in arch or "amd64" in arch:
            return f"{base_url}-linux-x64.tar.gz"
        elif "arm" in arch or "aarch64" in arch:
            return f"{base_url}-linux-arm64.tar.gz"
    elif system == "darwin":  # macOS
        if "arm" in arch or "aarch64" in arch:
            return f"{base_url}-macos-arm64.tar.gz"
        else:
            return f"{base_url}-macos-x64.tar.gz"
    elif system == "windows":
        return f"{base_url}-windows-x64.zip"
    
    raise ValueError(f"Unsupported platform: {system} {arch}")


def download_dsr(dsr_dir, version="v0.0.12"):
    """Download DSR tool."""
    try:
        doc_url = get_dsr_download_url(version)
        filename = doc_url.split("/")[-1]
        filepath = dsr_dir / filename
        
        print(f"Downloading DSR {version}...")
        
        # Use the correct download URL pattern
        download_url = f"{doc_url}?download=true"
        
        curl_cmd = f"curl -L --cookie ~/.midway/cookie -o {filename} '{download_url}'"
        if not run_command(curl_cmd, cwd=dsr_dir):
            return False
        
        # Check if download was successful
        if not filepath.exists() or filepath.stat().st_size < 10000:
            print(f"Download failed - file too small ({filepath.stat().st_size if filepath.exists() else 0} bytes)")
            if filepath.exists():
                filepath.unlink()
            return False
            
        print(f"Downloaded: {filename} ({filepath.stat().st_size} bytes)")
        return True
        
    except Exception as e:
        print(f"Error downloading DSR: {e}")
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


def main():
    """Setup DSR tool."""
    project_root = Path(__file__).parent.parent.parent
    dsr_dir = project_root / ".dsr"
    
    print("Setting up DSR tool...")
    
    # Create .dsr directory
    dsr_dir.mkdir(exist_ok=True)
    
    # Look for existing DSR archive
    archive_path = find_dsr_archive(dsr_dir)
    
    if not archive_path:
        print(f"No DSR archive found.")
        print("Please manually download DSR tool:")
        print("1. Visit: https://drive.corp.amazon.com/documents/DSR_Tool/Releases/Latest/")
        print("2. Download the latest version for your platform")
        print(f"3. Place the file in: {dsr_dir}")
        
        input("Press Enter after downloading the file (or Ctrl+C to quit)...")
        
        # Check again after user confirms download
        archive_path = find_dsr_archive(dsr_dir)
        if not archive_path:
            print("DSR archive still not found. Please ensure the file is in the correct location.")
            sys.exit(1)
    
    # Extract DSR tool
    if not extract_dsr(archive_path, dsr_dir):
        print("Failed to extract DSR tool")
        sys.exit(1)
    
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
    
    # Use os.system for interactive command
    import os
    result = os.system(f"cd {dsr_dir} && ./dsr config")
    if result != 0:
        print("DSR configuration failed")
        sys.exit(1)
    
    print("DSR setup complete!")


if __name__ == "__main__":
    main()
