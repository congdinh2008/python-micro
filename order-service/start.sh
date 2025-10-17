#!/bin/bash
set -e

echo "Waiting for database..."
sleep 5

# Create versions directory if not exists
mkdir -p /app/alembic/versions

# Check if migrations exist
if [ ! "$(ls -A /app/alembic/versions)" ]; then
    echo "No migrations found, creating initial migration..."
    alembic revision --autogenerate -m "Create orders table"
fi

echo "Running database migrations..."
alembic upgrade head

echo "Starting application..."
uvicorn app.main:app --host 0.0.0.0 --port 8003
