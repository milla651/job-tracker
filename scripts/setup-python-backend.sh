#!/bin/bash

# Setup Python Backend + Ollama

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$PROJECT_DIR/services/ai-backend"

cd "$BACKEND_DIR"

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip setuptools wheel

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Install production server (Gunicorn)
pip install gunicorn python-dotenv psycopg2-binary

echo "✓ Python dependencies installed"

# Install Ollama
if ! command -v ollama &> /dev/null; then
    echo "Installing Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✓ Ollama installed"
else
    echo "✓ Ollama already installed"
fi

# Pull AI models (this takes ~15 minutes)
echo "Pulling Ollama models (this may take 10-15 minutes)..."
echo "Downloading llama3.1:8b-instruct-q8_0 (~4.7GB)..."
ollama pull llama3.1:8b-instruct-q8_0

echo "Downloading llama3.1:8b-instruct-q4_K_M (~4.4GB)..."
ollama pull llama3.1:8b-instruct-q4_K_M

echo "✓ AI models downloaded"

deactivate

echo "✓ Python backend setup complete"
