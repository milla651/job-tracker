# CareerOS - Contabo Server Deployment Guide

## 🎯 One-Command Deployment

Your Contabo server is pre-configured for automated deployment.

```bash
# On Contabo server:
git clone https://github.com/milla651/job-tracker.git
cd job-tracker
chmod +x deploy.sh
./deploy.sh
```

**That's it!** The script handles everything (~30 minutes).

---

## 📋 Server Specifications

**Your Contabo Server:**
- IP: `173.212.209.92`
- RAM: 8GB
- CPUs: 4 cores
- OS: Ubuntu/Debian

**Remote Database:**
- Host: `173.212.209.92:443`
- Database: `jobtracker`
- Schema: `job_tracker`
- SSL: Required

---

## 🚀 Deployment Steps

### Step 1: SSH into Server

```bash
ssh root@173.212.209.92
# or
ssh your-user@173.212.209.92
```

### Step 2: Clone Repository

```bash
git clone https://github.com/milla651/job-tracker.git
cd job-tracker
```

### Step 3: Run Deployment Script

```bash
chmod +x deploy.sh
./deploy.sh
```

**The script will:**
1. ✅ Install Node.js 20, Python 3.10, Redis, Nginx
2. ✅ Configure environment with your database credentials (URL-encoded)
3. ✅ Setup Python backend + virtual environment
4. ✅ Install Ollama + download AI models (~9GB, 15 min)
5. ✅ Build Next.js for production
6. ✅ Configure 4 systemd services (auto-start on boot)
7. ✅ Setup Nginx reverse proxy
8. ✅ Configure firewall (UFW)
9. ✅ Create database schema + tables automatically
10. ✅ Start all services
11. ✅ Run health checks

**Total deployment time:** ~30 minutes (mostly downloading AI models)

### Step 4: Access Your Application

```bash
# Open in browser:
http://173.212.209.92

# Check API health:
curl http://173.212.209.92/api/python/health
```

---

## 🔐 Environment Configuration

All credentials are pre-configured in `.env.production` files:

**Database URL (already URL-encoded):**
```
postgresql://jobtracker:jt_S3cur3P%40ss2026%21@173.212.209.92:443/jobtracker?sslmode=require&options=-c%20search_path=job_tracker
```

**Auto-generated secrets:**
- `NEXTAUTH_SECRET` - Generated during deployment
- `BACKEND_SECRET` - Shared between Next.js & Flask
- `CRON_SECRET` - For background jobs

**What you need to add manually:**
- `RESEND_API_KEY` - Your email API key (optional)

Edit `.env` after deployment:
```bash
nano .env
# Add: RESEND_API_KEY=re_your_key_here
sudo systemctl restart careeros-nextjs
```

---

## 📦 What Gets Installed

### System Packages
- Node.js 20.x
- Python 3.10 + pip
- PostgreSQL client (for testing)
- Redis server
- Nginx
- Certbot (SSL certificates)
- UFW (firewall)
- Fail2ban (security)

### Python Backend
- Flask + Gunicorn (production server)
- Celery (background tasks)
- Ollama (local AI)
- psycopg2, redis, requests, etc.

### AI Models (downloaded automatically)
- `llama3.1:8b-instruct-q8_0` (~4.7GB) - CV generation
- `llama3.1:8b-instruct-q4_K_M` (~4.4GB) - Job evaluation

### Next.js
- Production build
- Optimized static assets
- Server-side rendering ready

---

## ⚙️ Systemd Services

All services auto-start on boot and auto-restart on failure.

### View Status
```bash
sudo systemctl status careeros-ollama
sudo systemctl status careeros-flask
sudo systemctl status careeros-celery
sudo systemctl status careeros-nextjs
```

### Restart Services
```bash
sudo systemctl restart careeros-flask
sudo systemctl restart careeros-celery
sudo systemctl restart careeros-nextjs
```

### View Logs
```bash
# Flask backend
sudo journalctl -u careeros-flask -f

# Celery worker
sudo journalctl -u careeros-celery -f

# Next.js
sudo journalctl -u careeros-nextjs -f

# All services
sudo journalctl -u "careeros-*" -f
```

---

## 🌐 Domain Migration (Tomorrow)

When your domain is ready:

```bash
cd job-tracker
./deploy/domain-migrate.sh yourdomain.com
```

**This will:**
1. Update environment variables
2. Setup SSL certificate (Let's Encrypt)
3. Configure Nginx for HTTPS
4. Restart services
5. Setup auto-renewal

**Access after migration:**
```
https://yourdomain.com
```

---

## 🏥 Health Monitoring

### Run Health Check
```bash
./scripts/health-check.sh
```

**Checks:**
- All systemd services
- HTTP endpoints
- Database connection
- Redis
- Disk space
- Memory usage
- CPU load
- Recent errors

### Automated Monitoring
```bash
# Check every 5 minutes
(crontab -l 2>/dev/null; echo "*/5 * * * * /path/to/job-tracker/scripts/health-check.sh >> /var/log/careeros/health.log 2>&1") | crontab -
```

---

## 🔧 Maintenance

### Update Application
```bash
cd job-tracker
git pull
npm run build
sudo systemctl restart careeros-nextjs
sudo systemctl restart careeros-flask
```

### View Storage Usage
```bash
du -sh /var/careeros/cvs
ls -lh /var/careeros/cvs/*/
```

### Backup Database
```bash
# Manual backup
pg_dump "postgresql://jobtracker:jt_S3cur3P%40ss2026%21@173.212.209.92:443/jobtracker?sslmode=require" > backup.sql

# Automated daily backup
(crontab -l 2>/dev/null; echo "0 2 * * * pg_dump 'postgresql://jobtracker:...@173.212.209.92:443/jobtracker?sslmode=require' > /var/backups/jobtracker-\$(date +\%Y\%m\%d).sql") | crontab -
```

### Clean Old CVs
```bash
# Remove CVs older than 90 days
find /var/careeros/cvs -type f -mtime +90 -delete
```

---

## 🐛 Troubleshooting

### Service Won't Start
```bash
# Check logs
sudo journalctl -u careeros-flask -n 100

# Check config
sudo systemctl cat careeros-flask

# Test manually
cd ~/job-tracker/services/ai-backend
source venv/bin/activate
python app/main.py
```

### Database Connection Fails
```bash
# Test connection
psql "postgresql://jobtracker:jt_S3cur3P%40ss2026%21@173.212.209.92:443/jobtracker?sslmode=require" -c "SELECT 1"

# Check if schema exists
psql "..." -c "\dn job_tracker"
```

### Ollama Out of Memory
```bash
# Check memory usage
free -h

# Restart Ollama with memory limit
sudo systemctl restart careeros-ollama

# View Ollama logs
sudo journalctl -u careeros-ollama -n 50
```

### Nginx Errors
```bash
# Test config
sudo nginx -t

# View error log
sudo tail -f /var/log/nginx/error.log

# Reload config
sudo systemctl reload nginx
```

### High CPU Usage
```bash
# Check which service
htop

# Check Ollama (may spike during CV generation)
top -p $(pgrep ollama)

# Reduce Celery workers if needed
sudo systemctl edit careeros-celery
# Change --concurrency=2 to --concurrency=1
```

---

## 📊 Performance Optimization

### For 8GB RAM Server

**Current allocation:**
- Ollama: 6GB (MemoryMax=6G in systemd)
- Flask: 500MB (2 workers)
- Celery: 400MB (2 workers)
- Next.js: 300MB
- Redis: 200MB
- System: 550MB

**If memory issues occur:**
```bash
# Reduce Ollama memory
sudo systemctl edit careeros-ollama
# Add: MemoryMax=4G

# Reduce workers
sudo systemctl edit careeros-flask
# Change: --workers 2 to --workers 1
```

### Disk Space Management
```bash
# Clean npm cache
npm cache clean --force

# Clean pip cache
pip cache purge

# Remove old logs
sudo journalctl --vacuum-time=7d

# Setup log rotation
sudo nano /etc/logrotate.d/careeros
```

---

## 🔒 Security

**Automatically configured:**
- UFW firewall (only ports 22, 80, 443 open)
- Nginx rate limiting (100 req/min API, 200 req/min frontend)
- SSL/TLS encryption (when domain added)
- Environment files secured (600 permissions)
- Fail2ban (SSH protection)

**Manual security hardening:**
```bash
# Change SSH port
sudo nano /etc/ssh/sshd_config

# Disable password auth (use SSH keys only)
PasswordAuthentication no

# Setup automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## ✅ Post-Deployment Checklist

- [ ] Application accessible at http://173.212.209.92
- [ ] Can register new user account
- [ ] Can add work experience in CV Builder
- [ ] Can generate tailored CV (test with a job posting)
- [ ] All services running: `./scripts/health-check.sh`
- [ ] Logs clean: `sudo journalctl -u careeros-* -p err`
- [ ] Add RESEND_API_KEY to `.env` for emails
- [ ] Setup domain DNS (A record → 173.212.209.92)
- [ ] Run domain migration when ready
- [ ] Setup backups
- [ ] Configure monitoring/alerts

---

## 📞 Quick Reference

**Start/Stop All Services:**
```bash
sudo systemctl start careeros-{ollama,flask,celery,nextjs}
sudo systemctl stop careeros-{ollama,flask,celery,nextjs}
sudo systemctl restart careeros-{ollama,flask,celery,nextjs}
```

**View All Logs:**
```bash
sudo journalctl -u "careeros-*" -f --no-pager
```

**Check Resource Usage:**
```bash
htop
df -h
free -h
```

**Test Endpoints:**
```bash
curl http://localhost:5000/health          # Flask
curl http://localhost:3000                 # Next.js
curl http://localhost:11434/api/tags       # Ollama
curl http://localhost/health               # Nginx
```

---

## 🎉 Success!

Your CareerOS application is now deployed and running on Contabo!

**Access:** http://173.212.209.92

**Next steps:**
1. Test the application thoroughly
2. Add your domain tomorrow
3. Setup backups
4. Monitor logs for any issues

Need help? Check logs with `./scripts/health-check.sh`
