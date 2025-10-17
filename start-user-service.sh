#!/bin/bash

# Script to start User Service

echo "🚀 Starting User Service..."

# Navigate to user-service directory
cd user-service

# Check if .env exists, if not create from .env.example
if [ ! -f .env ]; then
    echo "⚙️ Creating .env file from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration before running!"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

# Run migrations
echo "🗄️ Running database migrations..."
alembic upgrade head

# Start the service
echo "✅ Starting User Service on port 8001..."
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
