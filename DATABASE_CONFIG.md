# Database Configuration Guide

## 🗄️ Schema: `job_tracker`

All tables are created in the **`job_tracker` schema**, not `public`.

This keeps your data organized and separated from other applications using the same PostgreSQL database.

---

## 🔐 Your Database Credentials

```
DB_USER: postgres
DB_PASSWORD: Milla@2005
DB_HOST: localhost
DB_PORT: 5432
DB_NAME: postgres
SCHEMA: job_tracker
```

### ⚠️ Special Character Handling

Your password contains `@` which **must be URL-encoded**:
```
Milla@2005  →  Milla%402005
           ↑ Encoded as %40
```

---

## ✅ Correct DATABASE_URL

### Format
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?options=-c%20search_path=SCHEMA
```

### Your Exact URL
```bash
DATABASE_URL=postgresql://postgres:Milla%402005@localhost:5432/postgres?options=-c%20search_path=job_tracker
```

**Breakdown:**
- `postgresql://` - Protocol
- `postgres` - Username
- `Milla%402005` - Password (URL-encoded)
- `@localhost` - Host separator + hostname
- `:5432` - Port
- `/postgres` - Database name
- `?options=-c%20search_path=job_tracker` - Use job_tracker schema

---

## 📝 Where to Add This

### 1. Root .env
```bash
# c:/Users/User/Desktop/workspace/job-tracker/.env

DATABASE_URL=postgresql://postgres:Milla%402005@localhost:5432/postgres?options=-c%20search_path=job_tracker

# Python Backend
PYTHON_BACKEND_URL=http://localhost:5000
BACKEND_SECRET=careeros-secret-2024

# Other variables (keep your existing ones)
NEXTAUTH_SECRET=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Python Backend .env
```bash
# services/ai-backend/.env

DATABASE_URL=postgresql://postgres:Milla%402005@localhost:5432/postgres?options=-c%20search_path=job_tracker

REDIS_URL=redis://localhost:6379/0
OLLAMA_URL=http://localhost:11434
BACKEND_SECRET=careeros-secret-2024
FLASK_ENV=development
CV_STORAGE_PATH=/tmp/careeros/cvs

# Models
CV_GENERATION_MODEL=llama3.1:8b-instruct-q8_0
JOB_EVALUATION_MODEL=llama3.1:8b-instruct-q4_K_M
```

---

## 🧪 Test Connection

### From Command Line
```bash
psql "postgresql://postgres:Milla%402005@localhost:5432/postgres?options=-c%20search_path=job_tracker"
```

Once connected, verify schema:
```sql
-- Check current schema
SHOW search_path;
-- Should show: job_tracker

-- List tables
\dt
-- Should show tables in job_tracker schema

-- Or explicit:
\dt job_tracker.*
```

### From Python
```python
import psycopg2

conn = psycopg2.connect(
    "postgresql://postgres:Milla%402005@localhost:5432/postgres?options=-c%20search_path=job_tracker"
)
cursor = conn.cursor()
cursor.execute("SHOW search_path;")
print(cursor.fetchone())  # Should show: ('job_tracker',)
conn.close()
```

---

## 🏗️ Schema Auto-Creation

When you start Flask backend (`python app/main.py`), it will:

1. **Create `job_tracker` schema** (if not exists)
2. **Set search_path** to `job_tracker`
3. **Create all tables** in that schema
4. **Create indexes**

**Output:**
```
Running database initialization...
Initializing CV tables...
✅ CV tables initialized successfully
✅ Database ready
```

**Tables created:**
- `job_tracker.WorkExperience`
- `job_tracker.Education`
- `job_tracker.Skill`
- `job_tracker.Project`
- `job_tracker.AsyncTask`

---

## 📊 Table Locations

After auto-migration runs:

```sql
-- Check where tables are:
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'job_tracker';

-- Output:
 schemaname  |    tablename     
-------------+------------------
 job_tracker | User
 job_tracker | WorkExperience
 job_tracker | Education
 job_tracker | Skill
 job_tracker | Project
 job_tracker | AsyncTask
 ...
```

---

## ⚙️ Alternative: Python urllib.parse

If you prefer to build the URL dynamically in code:

```python
# services/ai-backend/app/config.py
from urllib.parse import quote_plus
import os

# URL-encode password
password = "Milla@2005"
encoded_password = quote_plus(password)  # Returns: Milla%402005

# Build URL with schema
DATABASE_URL = (
    f"postgresql://postgres:{encoded_password}@localhost:5432/postgres"
    f"?options=-c%20search_path=job_tracker"
)
```

But **simpler** to just put the full URL in `.env` file!

---

## 🚀 Ready to Update

**Toggle to Act mode** (if not already) and I'll:
1. ✅ Update auto-migration to create `job_tracker` schema
2. ✅ Update .env.example files with correct URL format
3. ✅ Update migration SQL with schema creation
4. ✅ Add DATABASE_CONFIG.md guide

**All changes preserve your setup:** URL-encoded password + job_tracker schema!


