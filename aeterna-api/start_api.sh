#!/bin/bash
# Aeterna API Server Startup Script

echo "🚀 Starting Aeterna API Server..."
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ -d ".venv" ]; then
    echo "📦 Activating virtual environment..."
    source .venv/bin/activate
else
    echo "⚠️  Virtual environment not found. Please run: python3 -m venv .venv"
    echo "⚠️  Then install dependencies: pip install -r requirements.txt"
fi

# Check if config.toml exists
if [ ! -f "config.toml" ]; then
    echo "⚠️  config.toml not found. Creating from example..."
    cp config.example.toml config.toml
fi

# Export environment variables from .env if it exists
if [ -f ".env" ]; then
    echo "🔐 Loading environment variables from .env..."
    export $(grep -v '^#' .env | xargs)
fi

# Set CORS to allow frontend on localhost:3000
export CORS_ALLOWED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"

# Start the API server
echo "✨ Starting API server on http://127.0.0.1:8080"
echo "📖 API Documentation: http://127.0.0.1:8080/docs"
echo "📖 Alternative Docs: http://127.0.0.1:8080/redoc"
echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Use uvicorn directly for simpler deployment
uvicorn app.asgi:app --host 127.0.0.1 --port 8080 --reload
