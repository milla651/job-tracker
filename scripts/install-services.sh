#!/bin/bash

# Install and Configure Systemd Services

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CURRENT_USER=$(whoami)
HOME_DIR="/home/$CURRENT_USER"

echo "Installing systemd services..."

# Array of services to install
services=(
    "careeros-ollama"
    "careeros-flask"
    "careeros-celery"
    "careeros-nextjs"
)

for service in "${services[@]}"; do
    # Copy template and replace placeholders
    sudo cp "$PROJECT_DIR/systemd/${service}.service" "/etc/systemd/system/${service}.service"
    
    # Replace placeholders with actual values
    sudo sed -i "s|YOUR_USERNAME|$CURRENT_USER|g" "/etc/systemd/system/${service}.service"
    sudo sed -i "s|/home/YOUR_USERNAME|$HOME_DIR|g" "/etc/systemd/system/${service}.service"
    
    echo "✓ $service.service installed"
done

# Reload systemd
sudo systemctl daemon-reload

echo "✓ All systemd services installed and configured"
