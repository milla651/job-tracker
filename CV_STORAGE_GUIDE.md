# CV Storage Strategy

## 📁 How CVs Are Stored

### Filesystem Storage (Recommended)

CVs are stored as **PDF files on the server filesystem**, not in the database.

**Structure:**
```
/var/careeros/cvs/
├── user-uuid-1/
│   ├── CV_Google_20240424_143022.pdf
│   ├── CV_Meta_20240423_091544.pdf
│   └── CV_Stripe_20240422_165301.pdf
├── user-uuid-2/
│   ├── CV_Amazon_20240425_120033.pdf
│   └── CV_Microsoft_20240424_183422.pdf
```

**Database stores:**
- File path: `/var/careeros/cvs/{userId}/CV_Company_timestamp.pdf`
- Metadata: name, size, creation date
- Link to job application

### Why This Approach?

✅ **Benefits:**
1. **Database stays small** - 100 users × 50 CVs = 5,000 PDFs = ~250MB on disk vs GB in database
2. **Easy file management** - Can backup, migrate, or delete files independently
3. **Fast serving** - Direct file serve (no DB query for content)
4. **Deduplication** - Can check if similar CV exists before generating new one
5. **User browsing** - Can list all CVs user has generated

❌ **Trade-offs:**
1. **File cleanup** - Need cron job to clean old/orphaned files
2. **Backups** - Must backup both database AND filesystem
3. **Multi-server** - Need shared storage (NFS/S3) if multiple app servers

## 🔍 CV Reuse Feature

### Problem Solved

**Before:**
- User applies to 5 "Software Engineer" jobs
- Generates 5 nearly identical CVs
- Wastes time (40-60s × 5 = 5 minutes)

**After (with reuse):**
- User generates CV for first "Software Engineer" job
- System detects similar positions
- Suggests: "You have an existing CV for 'Software Engineer at Google' - Reuse or Generate New?"
- User clicks "Reuse" - instant!

### How It Works

When user clicks "Generate CV":

1. **Check for similar positions**
   ```python
   # Backend finds similar CVs
   find_similar_cvs(user_id, "Senior Software Engineer", current_job_id)
   
   # Returns:
   [
     {
       "name": "CV_Google.pdf",
       "for_position": "Software Engineer",
       "match_score": 0.75,  # 75% keyword overlap
       "created_at": "2 days ago"
     }
   ]
   ```

2. **Show reuse option (Frontend)**
   ```
   ┌─────────────────────────────────────────┐
   │ Similar CVs Found!                      │
   │                                         │
   │ ✓ CV for "Software Engineer" at Google │
   │   Created 2 days ago                    │
   │                                         │
   │ [Reuse This]  [Generate New]           │
   └─────────────────────────────────────────┘
   ```

3. **User chooses:**
   - **Reuse**: Copy file to new job (instant)
   - **Generate New**: Run AI tailoring (40-60s)

## 🗂️ File Management

### Directory Structure

```bash
# Production path
/var/careeros/cvs/{userId}/{filename}

# Development path (default)
/tmp/careeros/cvs/{userId}/{filename}
```

### Configuration

```bash
# In services/ai-backend/.env
CV_STORAGE_PATH=/var/careeros/cvs

# Create directory with proper permissions
sudo mkdir -p /var/careeros/cvs
sudo chown $USER:$USER /var/careeros/cvs
sudo chmod 755 /var/careeros/cvs
```

### Permissions

```bash
# Flask/Celery user needs write access
chown -R flask-user:flask-user /var/careeros/cvs
chmod 755 /var/careeros/cvs
chmod 644 /var/careeros/cvs/*/*.pdf  # Files readable
```

## 🔄 File Lifecycle

### 1. Generation
```
User clicks "Generate CV"
  → Celery task starts
  → AI generates content
  → PDF rendered
  → File saved: /var/careeros/cvs/{userId}/CV_Company_timestamp.pdf
  → Path stored in Document table
  → User notified
```

### 2. Retrieval
```
User wants to download CV
  → Frontend calls: GET /api/files/cv/{documentId}
  → Backend validates user owns document
  → Backend reads file from disk
  → File served to user
```

### 3. Reuse
```
User applies to similar job
  → Backend finds similar CVs
  → User selects existing CV to reuse
  → File copied to new job: CV_NewCompany_timestamp.pdf
  → New Document record created
  → Original file untouched
```

### 4. Cleanup (Future)
```
Cron job (weekly):
  → Find orphaned files (no Document record)
  → Find old CVs (>180 days, job = REJECTED)
  → Archive or delete
```

## 🔍 Findability Features

### 1. List All User CVs

```bash
GET /api/files/cv/list/{userId}

Returns:
{
  "cvs": [
    {
      "id": "doc-uuid",
      "name": "CV_Google.pdf",
      "jobCompany": "Google",
      "jobPosition": "Software Engineer",
      "createdAt": "2024-04-20",
      "size": 234567
    }
  ]
}
```

### 2. Find Similar CVs

```bash
GET /api/cv/similar/{jobApplicationId}

Returns:
{
  "similar": [
    {
      "id": "doc-uuid",
      "name": "CV_Meta.pdf",
      "forPosition": "Senior Software Engineer",
      "match_score": 0.8,
      "created_at": "2024-04-15"
    }
  ]
}
```

### 3. CV Library Page (Future)

Users can browse all their generated CVs:
```
/dashboard/cv-library

Grouped by position:
- Software Engineer (3 CVs)
  └─ CV for Google - April 20
  └─ CV for Meta - April 15
  └─ CV for Stripe - April 10
  
- Senior Backend Engineer (2 CVs)
  └─ CV for Amazon - April 22
  └─ CV for Netflix - April 18
```

## 💾 Backup Strategy

### What to Backup

1. **PostgreSQL database**
   ```bash
   pg_dump "$DATABASE_URL" > backup.sql
   ```

2. **CV files directory**
   ```bash
   tar -czf cvs_backup.tar.gz /var/careeros/cvs/
   ```

### Automated Backups

```bash
# Cron job (daily at 2 AM)
0 2 * * * /path/to/backup-careeros.sh
```

```bash
#!/bin/bash
# backup-careeros.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backup/careeros"

# Backup database
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Backup CV files
tar -czf "$BACKUP_DIR/cvs_$DATE.tar.gz" /var/careeros/cvs/

# Keep only last 30 days
find "$BACKUP_DIR" -name "*.gz" -mtime +30 -delete
```

## 🚀 Migration from DB to Filesystem

If you already have CVs in database (content column), migrate them:

```python
# scripts/migrate_cvs_to_filesystem.py
import psycopg2
import os

conn = psycopg2.connect(os.getenv("DATABASE_URL"))
cursor = conn.cursor()

# Get all PDF documents
cursor.execute("""
    SELECT d.id, d.name, d.content, ja."userId", ja.company
    FROM "Document" d
    JOIN "JobApplication" ja ON d."jobApplicationId" = ja.id
    WHERE d."mediaType" = 'application/pdf'
""")

for doc_id, name, pdf_bytes, user_id, company in cursor.fetchall():
    # Create user directory
    user_dir = f"/var/careeros/cvs/{user_id}"
    os.makedirs(user_dir, exist_ok=True)
    
    # Write file
    file_path = os.path.join(user_dir, name)
    with open(file_path, 'wb') as f:
        f.write(pdf_bytes)
    
    # Update Document record
    cursor.execute("""
        UPDATE "Document" 
        SET content = %s 
        WHERE id = %s
    """, (file_path.encode('utf-8'), doc_id))

conn.commit()
conn.close()

print("Migration complete!")
```

## 📊 Storage Estimates

**Typical CV size:** 50-100 KB

| Users | CVs per User | Total Size |
|-------|-------------|------------|
| 10 | 10 | ~10 MB |
| 100 | 20 | ~200 MB |
| 1,000 | 30 | ~3 GB |
| 10,000 | 40 | ~40 GB |

**12GB RAM server can easily handle filesystem storage!**

## 🔐 Security

### File Access Control

```python
# In files.py endpoint
@bp.route('/cv/<document_id>')
def serve_cv(document_id):
    # 1. Get document metadata
    doc = get_document(document_id)
    
    # 2. Verify user owns the document
    if doc.user_id != current_user_id:
        return 403  # Forbidden
    
    # 3. Serve file
    return send_file(doc.file_path)
```

### File Permissions

```bash
# Owner: flask user
# Group: flask user
# Permissions: 644 (owner: rw, others: r)

chown -R flask-user:flask-user /var/careeros/cvs
chmod 755 /var/careeros/cvs          # Directories: rwxr-xr-x
chmod 644 /var/careeros/cvs/*/*.pdf  # Files: rw-r--r--
```

## ✅ Implementation Checklist

- [x] Store CVs as files on filesystem
- [x] Store file paths in database (not content)
- [x] Create user-specific directories
- [x] Add file serving endpoint
- [x] Add CV similarity finder
- [x] Add CV listing by position
- [ ] Add CV reuse UI (Future)
- [ ] Add CV library page (Future)
- [ ] Add file cleanup cron job (Future)

## 🎯 User Benefits

1. **Find CVs easily** - "Show me all CVs for Software Engineer roles"
2. **Reuse CVs** - No need to regenerate for similar positions
3. **Version history** - See all CVs generated over time
4. **Quick access** - Download any past CV instantly
5. **Space efficient** - Filesystem is cheaper than database storage
