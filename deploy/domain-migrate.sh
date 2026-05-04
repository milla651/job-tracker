#!/bin/bash

# Migrate from IP to Domain Name with SSL

set -e

if [ -z "$1" ]; then
    echo "Usage: ./domain-migrate.sh yourdomain.com"
    exit 1
fi

DOMAIN=$1
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "🌐 Migrating to domain: $DOMAIN"

# Step 1: Update environment files
echo "[1/5] Updating environment variables..."
sed -i "s|http://173.212.209.92|https://$DOMAIN|g" "$PROJECT_DIR/.env"
sed -i "s|http://173.212.209.92|https://$DOMAIN|g" "$PROJECT_DIR/.env.production"
echo "✓ Environment updated"

# Step 2: Setup SSL certificate
echo "[2/5] Setting up SSL certificate..."
chmod +x "$PROJECT_DIR/deploy/ssl-setup.sh"
"$PROJECT_DIR/deploy/ssl-setup.sh" "$DOMAIN"

# Step 3: Update Nginx configuration
echo "[3/5] Updating Nginx configuration..."
sudo cp "$PROJECT_DIR/deploy/nginx-domain.conf" /etc/nginx/sites-available/careeros
sudo sed -i "s|DOMAIN_NAME|$DOMAIN|g" /etc/nginx/sites-available/careeros

# Test Nginx config
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo "✓ Nginx reconfigured"
else
    echo "Error: Nginx configuration invalid"
    exit 1
fi

# Step 4: Restart Next.js (to pick up new env)
echo "[4/5] Restarting services..."
sudo systemctl restart careeros-nextjs
sleep 3
echo "✓ Services restarted"

# Step 5: Verify
echo "[5/5] Verifying setup..."
if curl -s "https://$DOMAIN/health" | grep -q "healthy"; then
    echo "✓ HTTPS working"
else
    echo "⚠ HTTPS not responding yet (DNS may still be propagating)"
fi

echo ""
echo "✅ Migration complete!"
echo ""
echo "Your application is now available at:"
echo "  → https://$DOMAIN"
echo ""
echo "Old IP address (http://173.212.209.92) will redirect to HTTPS"
