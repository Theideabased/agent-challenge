# Aeterna API Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
cd api
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Copy the example config and environment files:

```bash
cp config.example.toml config.toml
cp .env.example .env
```

Edit `config.toml` and `.env` with your settings.

### 3. Start the Server

#### Option A: Using the startup script (recommended for development)

```bash
./start_api.sh
```

#### Option B: Using uvicorn directly (recommended for deployment)

```bash
# From the api directory
uvicorn app.asgi:app --host 0.0.0.0 --port 8080

# With auto-reload for development
uvicorn app.asgi:app --host 127.0.0.1 --port 8080 --reload

# For production
uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4
```

#### Option C: Using the Python main.py (legacy)

```bash
python3 main.py
```

## API Documentation

Once the server is running, visit:
- **Swagger UI**: http://127.0.0.1:8080/docs
- **ReDoc**: http://127.0.0.1:8080/redoc

## Deployment

For production deployment, use uvicorn with multiple workers:

```bash
uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4
```

Or use gunicorn with uvicorn workers:

```bash
gunicorn app.asgi:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8080
```

## Docker Deployment

```bash
docker-compose up -d
```

## Troubleshooting

### Python command not found
Make sure Python 3 is installed. Use `python3` instead of `python`:
```bash
python3 --version
```

### Virtual environment not found
Create it first:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Config file not found
Copy the example config:
```bash
cp config.example.toml config.toml
```
