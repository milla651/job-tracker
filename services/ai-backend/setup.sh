#!/bin/bash

# CareerOS AI Backend Setup Script

set -e

echo "🚀 CareerOS AI Backend Setup"
echo "=============================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Error: Do not run this script as root${NC}"
   exit 1
fi

# 1. Install Ollama
echo -e "\n${YELLOW}[1/6] Installing Ollama...${NC}"
if ! command -v ollama &> /dev/null; then
    echo "Ollama not found. Installing..."
    curl -fsSL https://ollama.com/install.sh | sh
else
    echo "✓ Ollama already installed"
fi

# 2. Pull Models
echo -e "\n${YELLOW}[2/6] Pulling Ollama models (this may take 10-15 minutes)...${NC}"
echo "Pulling llama3.1:8b-instruct-q8_0 (~4.7GB)..."
ollama pull llama3.1:8b-instruct-q8_0

echo "Pulling llama3.1:8b-instruct-q4_K_M (~4.4GB)..."
ollama pull llama3.1:8b-instruct-q4_K_M

echo "✓ Models pulled successfully"

# 3. Install Redis
echo -e "\n${YELLOW}[3/6] Installing Redis...${NC}"
if ! command -v redis-server &> /dev/null; then
    sudo apt update
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
else
    echo "✓ Redis already installed"
fi

# Test Redis
if redis-cli ping | grep -q PONG; then
    echo "✓ Redis is running"
else
    echo -e "${RED}Error: Redis not responding${NC}"
    exit 1
fi

# 4. Create Python Virtual Environment
echo -e "\n${YELLOW}[4/6] Setting up Python virtual environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate

# 5. Install Python Dependencies
echo -e "\n${YELLOW}[5/6] Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

echo "✓ Dependencies installed"

# 6. Setup Environment File
echo -e "\n${YELLOW}[6/6] Setting up environment...${NC}"
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Please edit .env with your database credentials"
else
    echo "✓ .env file already exists"
fi

# Success
echo -e "\n${GREEN}=============================="
echo "✅ Setup Complete!"
echo "==============================${NC}"

echo -e "\n📝 Next Steps:"
echo "1. Edit .env file with your database URL:"
echo "   nano .env"
echo ""
echo "2. Start Flask backend:"
echo "   python app/main.py"
echo ""
echo "3. In another terminal, start Celery worker:"
echo "   celery -A tasks.celery_config.celery_app worker --loglevel=info --concurrency=2"
echo ""
echo "4. Check health:"
echo "   curl http://localhost:5000/health"
echo ""
echo "For production deployment, see README.md for systemd setup."
