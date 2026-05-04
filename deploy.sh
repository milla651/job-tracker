#!/bin/bash

# CareerOS - Master Deployment Script for Contabo Server
# Optimized for 8GB RAM, 4 CPU cores
# One-command deployment

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CURRENT_USER=$(whoami)
SERVER_IP="173.212.209.92"

echo -e "${BLUE}╔════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CareerOS Production Deployment          ║${NC}"
echo -e "${BLUE}║   Contabo Server - 8GB RAM / 4 CPUs       ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}"
echo ""

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}Error: Do not run this script as root${NC}"
   echo "Run as regular user with sudo privileges"
   exit 1
fi

# [1/12] System Requirements
echo -e "\n${YELLOW}[1/12] Checking system requirements...${NC}"
if [ -f /etc/os-release ]; then
    . /etc/os-release
    echo "✓ OS: $PRETTY_NAME"
else
    echo -e "${RED}Error: Cannot detect OS${NC}"
    exit 1
fi

# Check sudo access
if sudo -n true 2>/dev/null; then
    echo "✓ Sudo access confirmed"
else
    echo "Testing sudo access..."
    sudo -v
fi

# Check disk space (need at least 20GB)
available_space=$(df -BG "$PROJECT_DIR" | tail -1 | awk '{print $4}' | sed 's/G//')
if [ "$available_space" -lt 20 ]; then
    echo -e "${RED}Error: Insufficient disk space. Need at least 20GB, have ${available_space}GB${NC}"
    exit 1
fi
echo "✓ Disk space: ${available_space}GB available"

# [2/12] Install System Dependencies
echo -e "\n${YELLOW}[2/12] Installing system dependencies...${NC}"
chmod +x "$PROJECT_DIR/scripts/install-system-deps.sh"
"$PROJECT_DIR/scripts/install-system-deps.sh"

# [3/12] Configure Environment
echo -e "\n${YELLOW}[3/12] Configuring environment...${NC}"
if [ ! -f "$PROJECT_DIR/.env" ]; then
    cp "$PROJECT_DIR/.env.production" "$PROJECT_DIR/.env"
    echo "✓ Root .env created"
else
    echo "✓ Root .env exists"
fi

if [ ! -f "$PROJECT_DIR/services/ai-backend/.env" ]; then
    cp "$PROJECT_DIR/services/ai-backend/.env.production" "$PROJECT_DIR/services/ai-backend/.env"
    echo "✓ Backend .env created"
else
    echo "✓ Backend .env exists"
fi

# Generate secrets if needed
if ! grep -q "NEXTAUTH_SECRET=generated-" "$PROJECT_DIR/.env" 2>/dev/null; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    BACKEND_SECRET=$(openssl rand -base64 32)
    
    # Update secrets in .env
    sed -i "s|NEXTAUTH_SECRET=.*|NEXTAUTH_SECRET=$NEXTAUTH_SECRET|g" "$PROJECT_DIR/.env"
    sed -i "s|BACKEND_SECRET=.*|BACKEND_SECRET=$BACKEND_SECRET|g" "$PROJECT_DIR/.env"
    sed -i "s|BACKEND_SECRET=.*|BACKEND_SECRET=$BACKEND_SECRET|g" "$PROJECT_DIR/services/ai-backend/.env"
    
    echo "✓ Secrets generated"
else
    echo "✓ Secrets already configured"
fi

# Set file permissions
chmod 600 "$PROJECT_DIR/.env"
chmod 600 "$PROJECT_DIR/services/ai-backend/.env"
echo "✓ Environment files secured"

# [4/12] Setup Python Backend
echo -e "\n${YELLOW}[4/12] Setting up Python backend...${NC}"
chmod +x "$PROJECT_DIR/scripts/setup-python-backend.sh"
"$PROJECT_DIR/scripts/setup-python-backend.sh"

# [5/12] Test Database Connection
echo -e "\n${YELLOW}[5/12] Testing database connection...${NC}"
source "$PROJECT_DIR/services/ai-backend/venv/bin/activate"
python3 << 'EOF'
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv('/home/'"$CURRENT_USER"'/job-tracker/services/ai-backend/.env')
db_url = os.getenv('DATABASE_URL')

try:
    conn = psycopg2.connect(db_url)
    cursor = conn.cursor()
    cursor.execute("SELECT version();")
    version = cursor.fetchone()[0]
    print(f"✓ PostgreSQL connected: {version[:50]}...")
    
    # Check/create schema
    cursor.execute("CREATE SCHEMA IF NOT EXISTS job_tracker;")
    cursor.execute("SET search_path TO job_tracker;")
    conn.commit()
    print("✓ Schema 'job_tracker' ready")
    
    conn.close()
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    exit(1)
EOF
deactivate

# [6/12] Build Next.js
echo -e "\n${YELLOW}[6/12] Building Next.js for production...${NC}"
chmod +x "$PROJECT_DIR/scripts/setup-nextjs.sh"
"$PROJECT_DIR/scripts/setup-nextjs.sh"

# [7/12] Create Storage Directories
echo -e "\n${YELLOW}[7/12] Creating storage directories...${NC}"
sudo mkdir -p /var/careeros/cvs
sudo mkdir -p /var/log/careeros
sudo chown -R "$CURRENT_USER:$CURRENT_USER" /var/careeros
sudo chown -R "$CURRENT_USER:$CURRENT_USER" /var/log/careeros
echo "✓ Storage directories created"

# [8/12] Install Systemd Services
echo -e "\n${YELLOW}[8/12] Installing systemd services...${NC}"
chmod +x "$PROJECT_DIR/scripts/install-services.sh"
"$PROJECT_DIR/scripts/install-services.sh"

# [9/12] Configure Nginx
echo -e "\n${YELLOW}[9/12] Configuring Nginx reverse proxy...${NC}"
sudo cp "$PROJECT_DIR/deploy/nginx-ip.conf" /etc/nginx/sites-available/careeros
sudo ln -sf /etc/nginx/sites-available/careeros /etc/nginx/sites-enabled/careeros
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx config
if sudo nginx -t 2>/dev/null; then
    sudo systemctl reload nginx
    echo "✓ Nginx configured and reloaded"
else
    echo -e "${RED}Error: Nginx configuration invalid${NC}"
    exit 1
fi

# [10/12] Configure Firewall
echo -e "\n${YELLOW}[10/12] Configuring firewall...${NC}"
if command -v ufw &> /dev/null; then
    sudo ufw --force enable
    sudo ufw allow 22/tcp comment 'SSH'
    sudo ufw allow 80/tcp comment 'HTTP'
    sudo ufw allow 443/tcp comment 'HTTPS'
    echo "✓ Firewall configured"
else
    echo "⚠ UFW not installed, skipping firewall setup"
fi

# [11/12] Start All Services
echo -e "\n${YELLOW}[11/12] Starting all services...${NC}"
sudo systemctl daemon-reload

services=("careeros-ollama" "careeros-flask" "careeros-celery" "careeros-nextjs")
for service in "${services[@]}"; do
    sudo systemctl enable "$service"
    sudo systemctl restart "$service"
    sleep 2
    
    if sudo systemctl is-active --quiet "$service"; then
        echo -e "✓ $service: ${GREEN}active${NC}"
    else
        echo -e "✗ $service: ${RED}failed${NC}"
        echo "Check logs: sudo journalctl -u $service -n 50"
    fi
done

# [12/12] Health Checks
echo -e "\n${YELLOW}[12/12] Running health checks...${NC}"
sleep 5  # Give services time to fully start

# Check Flask backend
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    echo "✓ Flask backend: healthy"
else
    echo "⚠ Flask backend: not responding yet (may still be starting)"
fi

# Check Next.js
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✓ Next.js: healthy"
else
    echo "⚠ Next.js: not responding yet (may still be starting)"
fi

# Check Ollama
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✓ Ollama: healthy"
else
    echo "⚠ Ollama: not responding yet (may still be loading models)"
fi

# Success Message
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Deployment Complete! 🚀           ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Your application is running at:${NC}"
echo -e "  → Frontend:  http://$SERVER_IP"
echo -e "  → API:       http://$SERVER_IP/api/python/health"
echo ""
echo -e "${BLUE}Useful Commands:${NC}"
echo -e "  Check status:  ./scripts/health-check.sh"
echo -e "  View logs:     sudo journalctl -u careeros-flask -f"
echo -e "  Restart:       sudo systemctl restart careeros-flask"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Test the application: curl http://$SERVER_IP/api/python/health"
echo "2. When domain is ready: ./deploy/domain-migrate.sh yourdomain.com"
echo "3. Monitor services: watch 'systemctl status careeros-*'"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
