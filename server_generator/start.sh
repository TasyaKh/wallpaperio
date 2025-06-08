#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Image Generator Service...${NC}"

# Check Python version
python_version=$(python3 -c 'import sys; print(".".join(map(str, sys.version_info[:2])))')
required_version="3.12"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}Python 3.12 is required. Current version: $python_version${NC}"
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git is not installed. Please install git first.${NC}"
    exit 1
fi

# Remove existing virtual environment if it exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}Removing existing virtual environment...${NC}"
    rm -rf venv
fi

# Create fresh virtual environment
echo -e "${YELLOW}Creating virtual environment...${NC}"
python3 -m venv venv

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Install or upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
pip install --upgrade pip

# Install requirements with no cache
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install --no-cache-dir -r requirements.txt

# Verify installation
echo -e "${YELLOW}Verifying installation...${NC}"
python3 -c "import fastapi; import uvicorn; import g4f; print('All dependencies installed successfully!')"

# Set default port if not set
export PORT=${PORT:-5001}

# Start the service
echo -e "${GREEN}Starting service on port $PORT...${NC}"
python main.py 