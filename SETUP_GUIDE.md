# CareerOS - Complete Setup Guide

This guide will help you set up the complete CareerOS system with local AI capabilities.

## 🎯 What You'll Get

After setup, users can:
1. **Build their master CV** once (work experience, education, skills)
2. **Generate tailored CVs** for each job application (AI rewrites content to match JD)
3. **Get AI job evaluations** (A-F scoring with match analysis)
4. **Generate cover letters** and negotiation scripts
5. All **100% local** using Ollama (Llama 3.1 models)

## 📋 Prerequisites

- Ubuntu/Debian Linux (or WSL2 on Windows)
- 12GB+ RAM
- PostgreSQL 14+
- Node.js 18+
- Python 3.10+

## 🚀 Step-by-Step Setup

### 1. Database Migration

```bash
# Apply the new schema
psql "$DATABASE_URL" -f db/migrations/0005_cv_data_models.sql

# Verify tables created
psql "$DATABASE_URL" -c "\dt"
# Should see: WorkExperience, Education, Skill, Project, AsyncTask
```

### 2. Install Ollama + Models

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models (~9GB total, takes 10-15 minutes)
ollama pull llama3.1:8b-instruct-q8_0    # High quality (~4.7GB)
ollama pull llama3.1:8b-instruct-q4_K_M  # Fast (~4.4GB)

# Test Ollama
ollama run llama3.1:8b-instruct-q8_0 "Write a professional summary for a software engineer"

# Check models loaded
ollama list
```

### 3. Install Redis

```bash
# Install Redis
sudo apt update
sudo apt install -y redis-server

# Enable and start
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test
redis-cli ping  # Should return: PONG
```

### 4. Setup Python Backend

```bash
cd services/ai-backend

# Run automated setup
chmod +x setup.sh
./setup.sh

# Manual setup if script fails:
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 5. Configure Environment

#### Python Backend (.env)
```bash
cd services/ai-backend
cp .env.example .env

# Edit with your values:
nano .env
```

Required variables:
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/careeros
REDIS_URL=redis://localhost:6379/0
OLLAMA_URL=http://localhost:11434
BACKEND_SECRET=your-shared-secret-here
```

#### Next.js Frontend (.env)
```bash
cd ../../  # Back to project root

# Add to your existing .env:
PYTHON_BACKEND_URL=http://localhost:5000
BACKEND_SECRET=your-shared-secret-here  # Must match Python backend
```

### 6. Run Services (Development)

You need 4 terminals:

**Terminal 1: Ollama** (auto-runs as system service, check status)
```bash
sudo systemctl status ollama
# If not running: ollama serve
```

**Terminal 2: Redis** (auto-runs as system service)
```bash
sudo systemctl status redis-server
```

**Terminal 3: Flask Backend**
```bash
cd services/ai-backend
source venv/bin/activate
python app/main.py
```

**Terminal 4: Celery Worker**
```bash
cd services/ai-backend
source venv/bin/activate
celery -A tasks.celery_config.celery_app worker --loglevel=info --concurrency=2
```

**Terminal 5: Next.js Frontend**
```bash
npm run dev
```

### 7. Production Setup (Systemd)

```bash
# Edit service files with your paths
cd systemd
sudo nano careeros-ollama.service   # Change YOUR_USERNAME
sudo nano careeros-flask.service    # Change YOUR_USERNAME and paths
sudo nano careeros-celery.service   # Change YOUR_USERNAME and paths

# Copy to systemd
sudo cp careeros-*.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable services (start on boot)
sudo systemctl enable careeros-ollama
sudo systemctl enable careeros-flask
sudo systemctl enable careeros-celery

# Start services
sudo systemctl start careeros-ollama
sudo systemctl start careeros-flask
sudo systemctl start careeros-celery

# Check status
sudo systemctl status careeros-ollama
sudo systemctl status careeros-flask
sudo systemctl status careeros-celery

# View logs
sudo journalctl -u careeros-flask -f
sudo journalctl -u careeros-celery -f
```

## 🧪 Testing the System

### 1. Health Check

```bash
# Check Python backend
curl http://localhost:5000/health

# Should return:
# {
#   "status": "healthy",
#   "services": {
#     "ollama": "healthy",
#     "redis": "healthy",
#     "postgresql": "healthy"
#   }
# }
```

### 2. Test CV Generation Flow

1. Open browser: http://localhost:3000
2. Login to your account
3. Go to **Profile → CV Builder**
4. Add at least one:
   - Work Experience
   - Education
   - Skills
5. Go to **Dashboard → Jobs**
6. Open any job with a description
7. Click **AI Tools** panel
8. Click **Generate Tailored CV**
9. Watch progress: "Fetching data... 30%" → "Generating... 70%" → "Complete!"
10. Document appears in Documents tab

Expected time: **40-60 seconds**

### 3. Verify Files

```bash
# Check database
psql "$DATABASE_URL" -c "SELECT name, size FROM \"Document\" WHERE \"mediaType\" = 'application/pdf' ORDER BY \"createdAt\" DESC LIMIT 5;"

# Should see your generated CVs
```

## 🐛 Troubleshooting

### Ollama Not Responding

```bash
# Check if running
ps aux | grep ollama

# Restart
sudo systemctl restart careeros-ollama

# Check logs
sudo journalctl -u careeros-ollama -n 50
```

### Flask 500 Error

```bash
# Check logs
sudo journalctl -u careeros-flask -n 100

# Common issues:
# - Database connection: check DATABASE_URL
# - Ollama offline: restart ollama service
# - Missing models: ollama pull llama3.1:8b-instruct-q8_0
```

### Celery Worker Not Processing

```bash
# Check worker status
celery -A tasks.celery_config.celery_app inspect active

# Check Redis
redis-cli ping

# Restart worker
sudo systemctl restart careeros-celery
```

### CV Generation Stuck at 30%

This means Ollama is processing. Check:
```bash
# Monitor Ollama CPU/RAM
top -p $(pgrep ollama)

# If high CPU (80%+), it's working - just slow
# Wait 60 seconds max

# If frozen:
sudo systemctl restart careeros-ollama
```

## ⚡ Performance Tuning

### Speed Up CV Generation

**Option 1: Use faster model (lower quality)**
```bash
# In services/ai-backend/.env
CV_GENERATION_MODEL=llama3.1:8b-instruct-q4_K_M  # 25-30 sec (vs 40-60)
```

**Option 2: Upgrade to larger RAM** (if you get 32GB+)
```bash
ollama pull llama3.1:70b-instruct  # Much better quality, ~60GB RAM
CV_GENERATION_MODEL=llama3.1:70b-instruct
```

### Reduce Celery Concurrency (save RAM)
```python
# services/ai-backend/tasks/celery_config.py
worker_concurrency=1  # Change from 2 to 1
```

## 📊 Resource Usage

**Typical:**
- Ollama (idle): 500MB RAM
- Ollama (generating): 8-10GB RAM
- Flask: 100-200MB RAM
- Celery worker: 200-300MB RAM
- Redis: 10-50MB RAM
- PostgreSQL: 200-500MB RAM

**Total: ~10-12GB during CV generation**

## 🔒 Security Notes

1. **Never expose Flask backend publicly**
   - Keep on localhost:5000
   - Only Next.js should call it
   - `BACKEND_SECRET` validates all requests

2. **Systemd security**
   - Run as non-root user
   - Restrict file permissions
   - Use environment files for secrets

3. **Database**
   - User data includes CV content (potentially sensitive)
   - Ensure PostgreSQL auth is configured
   - Regular backups recommended

## 🎓 User Guide: How to Use

### For Your Users

**Step 1: Build Your Master CV**
1. Click **CV Builder** in sidebar
2. Add your work experience (all achievements)
3. Add education, skills, projects
4. This is your "master CV" - you only do this ONCE

**Step 2: Generate Tailored CV Per Job**
1. Go to a job application
2. Open **AI Tools** panel
3. Click **Generate Tailored CV**
4. Wait 40-60 seconds
5. Download from Documents tab

**What the AI Does:**
- Rewrites your achievements to emphasize relevant skills
- Adds keywords from the job description
- Reorders content by relevance
- Creates ATS-friendly PDF

**Example:**
- Master CV: "Led engineering team on web projects"
- For Backend Role: "Led backend engineering team developing scalable APIs"
- For Frontend Role: "Led frontend engineering team building React applications"

Same experience, different framing!

## 📈 Next Steps

Once basic system works:
1. Add more CV templates (modern, creative)
2. Implement portal scanning (auto-discover jobs)
3. Add email digests
4. Improve PDF styling
5. Add A/B testing for prompts

## 💡 Tips

- Start with smaller model (q4) for testing, upgrade to q8 for production
- Monitor Ollama logs during first few generations
- Keep Celery logs open to debug tasks
- Test with realistic job descriptions (300+ words)

## 🆘 Getting Help

If you encounter issues:
1. Check logs: `sudo journalctl -u careeros-flask -n 100`
2. Test health endpoint: `curl localhost:5000/health`
3. Verify models: `ollama list`
4. Check database: tables exist and have data
