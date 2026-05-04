# CareerOS AI Backend

Python Flask backend for CV generation, job evaluation, and AI-powered features using local Ollama LLMs.

## Architecture

```
Flask (Port 5000) → Celery Workers → Ollama (Port 11434) → PostgreSQL
                  ↓
                Redis (Task Queue)
```

## Setup

### 1. Install Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Pull models (~4.7GB each)
ollama pull llama3.1:8b-instruct-q8_0   # High quality for CV generation
ollama pull llama3.1:8b-instruct-q4_K_M # Fast for job evaluation
```

### 2. Install Redis

```bash
sudo apt install redis-server
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

### 3. Setup Python Environment

```bash
cd services/ai-backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URL and secrets
```

### 5. Run Services

#### Development

```bash
# Terminal 1: Flask
python app/main.py

# Terminal 2: Celery Worker
celery -A tasks.celery_config.celery_app worker --loglevel=info --concurrency=2

# Terminal 3: Ollama (runs automatically as system service)
# Check status: sudo systemctl status ollama
```

#### Production (Systemd)

See `../systemd/` directory for service files.

```bash
# Copy service files
sudo cp ../systemd/careeros-*.service /etc/systemd/system/

# Enable and start
sudo systemctl enable careeros-ollama careeros-flask careeros-celery
sudo systemctl start careeros-ollama careeros-flask careeros-celery

# Check status
sudo systemctl status careeros-flask
sudo systemctl status careeros-celery
```

## API Endpoints

### Health Check
```
GET /health
```

### CV Generation
```
POST /api/cv/generate
Body: {
  "userId": "uuid",
  "jobApplicationId": "uuid"
}
Response: {
  "taskId": "celery-task-id",
  "status": "pending"
}
```

### Check Task Status
```
GET /api/cv/task/<taskId>
Response: {
  "taskId": "...",
  "status": "pending|processing|completed|failed",
  "progress": 0-100,
  "result": {...}
}
```

### Job Evaluation
```
POST /api/ai/evaluate-job
Body: {
  "userId": "uuid",
  "jobApplicationId": "uuid"
}
```

### Cover Letter Generation
```
POST /api/ai/generate-cover-letter
Body: {
  "userId": "uuid",
  "jobApplicationId": "uuid"
}
```

## Performance

| Task | Model | Time | RAM |
|------|-------|------|-----|
| CV Generation | Llama 3.1 8B Q8 | 40-60s | ~8GB |
| Job Evaluation | Llama 3.1 8B Q4 | 15-25s | ~5GB |
| Cover Letter | Llama 3.1 8B Q8 | 30-45s | ~8GB |

## Logs

```bash
# Flask logs
sudo journalctl -u careeros-flask -f

# Celery logs
sudo journalctl -u careeros-celery -f

# Ollama logs
sudo journalctl -u careeros-ollama -f
```

## Troubleshooting

### Ollama not responding
```bash
sudo systemctl restart careeros-ollama
ollama list  # Check if models are loaded
```

### Redis connection error
```bash
redis-cli ping  # Should return PONG
sudo systemctl restart redis-server
```

### Database connection error
```bash
# Test connection
psql "$DATABASE_URL"
```

## Development

### Run tests
```bash
pytest
```

### Format code
```bash
black .
```

### Check models
```bash
curl http://localhost:11434/api/tags
```
