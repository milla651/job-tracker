# CareerOS - Quick Start Guide

## 🚀 Your Database Configuration

**Your credentials have been configured:**
- User: `postgres`
- Password: `Milla@2005` (auto URL-encoded to `Milla%402005`)
- Host: `localhost:5432`
- Database: `postgres`
- Schema: `job_tracker` ✅

---

## ⚡ Quick Launch (3 Steps)

### Step 1: Configure Environment Files

**Create root .env:**
```bash
cp .env.example .env
```

The file already has your DATABASE_URL! Just add these:
```bash
NEXTAUTH_SECRET=$(openssl rand -base64 32)
BACKEND_SECRET=$(openssl rand -base64 32)
```

**Create backend .env:**
```bash
cd services/ai-backend
cp .env.example .env
```

Update `BACKEND_SECRET` to match the root .env file!

### Step 2: Setup Python Backend

```bash
cd services/ai-backend
chmod +x setup.sh
./setup.sh
```

This will:
- Install Ollama
- Pull Llama 3.1 models (~9GB, takes 10-15 min)
- Install Redis
- Setup Python virtualenv
- Install dependencies

### Step 3: Start Services

**Terminal 1 - Flask Backend:**
```bash
cd services/ai-backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app/main.py
```

**Expected output:**
```
Running database initialization...
Initializing CV tables...
✅ CV tables initialized successfully
✅ Database ready
 * Running on http://0.0.0.0:5000
```

**Tables auto-create in `job_tracker` schema!** ✨

**Terminal 2 - Celery Worker:**
```bash
cd services/ai-backend
source venv/bin/activate
celery -A tasks.celery_config.celery_app worker --loglevel=info --concurrency=2
```

**Terminal 3 - Next.js:**
```bash
npm run dev
```

---

## 🧪 Verify Everything Works

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

Should return:
```json
{
  "status": "healthy",
  "services": {
    "ollama": "healthy",
    "redis": "healthy",
    "postgresql": "healthy"
  }
}
```

### 2. Check Database Schema
```bash
psql "postgresql://postgres:Milla%402005@localhost:5432/postgres?options=-c%20search_path=job_tracker" -c "\dt"
```

Should show tables:
```
 Schema      | Name            | Type  | Owner
-------------+-----------------+-------+----------
 job_tracker | User            | table | postgres
 job_tracker | WorkExperience  | table | postgres
 job_tracker | Education       | table | postgres
 job_tracker | Skill           | table | postgres
 job_tracker | Project         | table | postgres
 job_tracker | AsyncTask       | table | postgres
```

### 3. Test CV Generation

1. Open http://localhost:3000
2. Login/Register
3. Go to **Profile → CV Builder**
4. Add at least one work experience
5. Go to a job application
6. Click **AI Tools → Generate Tailored CV**
7. Wait 40-60 seconds
8. CV downloads! 🎉

---

## 🐛 Troubleshooting

### "relation does not exist"
- Schema mismatch - verify DATABASE_URL has `?options=-c%20search_path=job_tracker`

### "password authentication failed"
- Check password encoding: `Milla@2005` → `Milla%402005`

### "Ollama not responding"
```bash
ollama serve  # Start Ollama manually
ollama list   # Check models loaded
```

### "Redis connection refused"
```bash
sudo systemctl start redis-server
redis-cli ping  # Should return PONG
```

---

## 📊 What Gets Created

**In PostgreSQL (`job_tracker` schema):**
- Tables for User, WorkExperience, Education, Skill, Project
- All with proper indexes

**On Filesystem:**
- `/tmp/careeros/cvs/{userId}/` - CV files
- Or `/var/careeros/cvs/{userId}/` in production

---

## ✅ Success Checklist

- [ ] Database connection works (psql test passes)
- [ ] Schema `job_tracker` created
- [ ] Tables auto-created on Flask startup
- [ ] Ollama models downloaded
- [ ] Redis running
- [ ] Flask backend starts (port 5000)
- [ ] Celery worker starts
- [ ] Next.js runs (port 3000)
- [ ] Can add CV data in CV Builder
- [ ] CV generation completes

---

## 🎯 You're Ready When...

✅ All 3 terminals running without errors  
✅ Health endpoint returns "healthy"  
✅ Can access http://localhost:3000  
✅ CV Builder page loads  

**Then you're live!** 🚀

Need help? Check SETUP_GUIDE.md for detailed troubleshooting.
