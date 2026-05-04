#!/bin/bash

# Health Check Script - Check all CareerOS services

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "🏥 CareerOS Health Check"
echo "========================"

# Function to check service status
check_service() {
    local service=$1
    if systemctl is-active --quiet "$service"; then
        echo -e "${GREEN}✓${NC} $service: running"
        return 0
    else
        echo -e "${RED}✗${NC} $service: stopped"
        return 1
    fi
}

# Function to check HTTP endpoint
check_http() {
    local url=$1
    local name=$2
    if curl -sf "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name: responding"
        return 0
    else
        echo -e "${RED}✗${NC} $name: not responding"
        return 1
    fi
}

# Check systemd services
echo -e "\n📋 System Services:"
check_service "careeros-ollama"
check_service "careeros-flask"
check_service "careeros-celery"
check_service "careeros-nextjs"
check_service "redis-server"
check_service "nginx"

# Check HTTP endpoints
echo -e "\n🌐 HTTP Endpoints:"
check_http "http://localhost:11434/api/tags" "Ollama API"
check_http "http://localhost:5000/health" "Flask Backend"
check_http "http://localhost:3000" "Next.js Frontend"
check_http "http://localhost/health" "Nginx Proxy"

# Check database connection
echo -e "\n🗄️  Database:"
if PGPASSWORD="" psql -h 173.212.209.92 -p 443 -U jobtracker -d jobtracker -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL: connected"
else
    echo -e "${YELLOW}⚠${NC} PostgreSQL: check connection (may require password)"
fi

# Check Redis
echo -e "\n💾 Cache:"
if redis-cli ping | grep -q PONG; then
    echo -e "${GREEN}✓${NC} Redis: responding"
else
    echo -e "${RED}✗${NC} Redis: not responding"
fi

# Check disk space
echo -e "\n💿 Disk Space:"
df -h / | tail -1 | awk '{
    used = substr($5, 1, length($5)-1);
    if (used >= 90)
        printf "\033[0;31m✗\033[0m /: %s used (%.1f GB free)\n", $5, $4;
    else if (used >= 75)
        printf "\033[1;33m⚠\033[0m /: %s used (%.1f GB free)\n", $5, $4;
    else
        printf "\033[0;32m✓\033[0m /: %s used (%.1f GB free)\n", $5, $4;
}'

# Check memory
echo -e "\n🧠 Memory:"
free -h | grep Mem | awk '{
    used = substr($3, 1, length($3)-1);
    total = substr($2, 1, length($2)-1);
    percent = (used/total) * 100;
    if (percent >= 90)
        printf "\033[0;31m✗\033[0m Memory: %.0f%% used (%s / %s)\n", percent, $3, $2;
    else if (percent >= 75)
        printf "\033[1;33m⚠\033[0m Memory: %.0f%% used (%s / %s)\n", percent, $3, $2;
    else
        printf "\033[0;32m✓\033[0m Memory: %.0f%% used (%s / %s)\n", percent, $3, $2;
}'

# Check CPU load
echo -e "\n⚡ CPU Load:"
uptime | awk -F'load average:' '{
    split($2, loads, ",");
    load = loads[1] + 0;
    if (load >= 3.5)
        printf "\033[0;31m✗\033[0m Load: %s (high for 4 cores)\n", $2;
    else if (load >= 2.5)
        printf "\033[1;33m⚠\033[0m Load: %s\n", $2;
    else
        printf "\033[0;32m✓\033[0m Load: %s\n", $2;
}'

# Check recent errors in logs
echo -e "\n📝 Recent Errors (last 10 min):"
error_count=$(sudo journalctl -u "careeros-*" --since "10 min ago" -p err --no-pager | wc -l)
if [ "$error_count" -eq 0 ]; then
    echo -e "${GREEN}✓${NC} No errors in systemd logs"
else
    echo -e "${YELLOW}⚠${NC} Found $error_count error(s) in logs"
    echo "  Check with: sudo journalctl -u careeros-flask -p err -n 20"
fi

echo -e "\n========================"
echo "Health check complete"
