#!/bin/bash
# Script để chạy Product Manager CLI Application

echo "🚀 Starting Product Manager CLI..."
echo ""

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "📍 Python version: $python_version"

# Navigate to script directory
cd "$(dirname "$0")"

# Run the application
python3 main.py
