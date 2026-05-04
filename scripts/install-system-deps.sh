#!/bin/bash

# Install System Dependencies for Contabo Server

set -e

echo "Installing system packages..."

# Update package lists
sudo apt update

# Install Node.js 20.x
if ! command -v node &> /dev/null; then
    echo "Installing Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi
node_version=$(node --version)
echo "✓ Node.js: $node_version"

# Install Python 3 and pip
sudo apt install -y python3 python3-pip python3-venv python3-dev
python_version=$(python3 --version)
echo "✓ Python: $python_version"

# Install build tools
sudo apt install -y build-essential git curl wget

# Install Redis
if ! command -v redis-server &> /dev/null; then
    echo "Installing Redis..."
    sudo apt install -y redis-server
    sudo systemctl enable redis-server
    sudo systemctl start redis-server
fi
echo "✓ Redis installed"

# Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "Installing Nginx..."
    sudo apt install -y nginx
    sudo systemctl enable nginx
    sudo systemctl start nginx
fi
echo "✓ Nginx installed"

# Install UFW (firewall)
sudo apt install -y ufw

# Install Certbot (for SSL)
sudo apt install -y certbot python3-certbot-nginx

# Install PostgreSQL client (for testing connection)
sudo apt install -y postgresql-client

# Install system utilities
sudo apt install -y htop iotop ncdu fail2ban

echo "✓ All system dependencies installed"
