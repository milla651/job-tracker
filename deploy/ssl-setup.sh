#!/bin/bash

# Setup SSL Certificate with Let's Encrypt

set -e

if [ -z "$1" ]; then
    echo "Usage: ./ssl-setup.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1

echo "🔒 Setting up SSL for: $DOMAIN"

# Check if domain points to this server
echo "Checking DNS resolution..."
DOMAIN_IP=$(dig +short "$DOMAIN" | tail -n1)
SERVER_IP="173.212.209.92"

if [ "$DOMAIN_IP" != "$SERVER_IP" ]; then
    echo "⚠ Warning: Domain $DOMAIN resolves to $DOMAIN_IP"
    echo "⚠ This server IP is: $SERVER_IP"
    echo "⚠ Make sure your DNS A record points to $SERVER_IP"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create webroot for certbot
sudo mkdir -p /var/www/certbot

# Temporarily configure Nginx for HTTP challenge
echo "Configuring Nginx for HTTP challenge..."
sudo tee /etc/nginx/sites-available/certbot-temp > /dev/null <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 200 'OK';
        add_header Content-Type text/plain;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/certbot-temp /etc/nginx/sites-enabled/certbot-temp
sudo nginx -t && sudo systemctl reload nginx

# Request certificate
echo "Requesting SSL certificate from Let's Encrypt..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    -d "$DOMAIN" \
    --email admin@"$DOMAIN" \
    --agree-tos \
    --non-interactive \
    --staging  # Remove this line for production certificate

if [ $? -eq 0 ]; then
    echo "✓ SSL certificate obtained"
    
    # Setup auto-renewal
    echo "Setting up auto-renewal..."
    (crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    echo "✓ Auto-renewal configured"
    
    # Clean up temp config
    sudo rm -f /etc/nginx/sites-enabled/certbot-temp
    
    echo ""
    echo "✅ SSL setup complete!"
    echo ""
    echo "Certificate installed for: $DOMAIN"
    echo "Auto-renewal: Enabled (daily at 3 AM)"
    echo ""
    echo "Note: This is a staging certificate (for testing)."
    echo "For production, remove --staging flag and run again."
else
    echo "❌ Failed to obtain SSL certificate"
    exit 1
fi
