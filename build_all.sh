#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use node version from .nvmrc if it exists
if [ -f ".nvmrc" ]; then
  echo "Found .nvmrc, switching node version..."
  nvm use
fi

# Directories to build
PROJECTS=("FarnsworthCWTrainer" "Life" "SportTimer")

# Base directory
BASE_DIR=$(pwd)

echo "Starting build process for all projects..."

for project in "${PROJECTS[@]}"; do
  echo "--------------------------------------------------"
  echo "Building $project..."
  
  if [ -d "$BASE_DIR/$project" ]; then
    cd "$BASE_DIR/$project"
    
    if [ -f "package.json" ]; then
      echo "Installing dependencies..."
      npm install
      
      echo "Running build..."
      npm run build
      
      if [ $? -eq 0 ]; then
        echo "Successfully built $project"
      else
        echo "Error: Failed to build $project"
        exit 1
      fi
    else
      echo "Warning: No package.json found in $project"
    fi
    
    cd "$BASE_DIR"
  else
    echo "Error: Directory $project not found"
  fi
done

echo "--------------------------------------------------"
echo "All projects built successfully!"

