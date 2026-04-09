# Aeterna API - Production Deployment Guide

## Simple Deployment with uvicorn

### Prerequisites

1. Python 3.11+ installed
2. Virtual environment set up
3. Dependencies installed
4. Config files ready (`config.toml` and `.env`)

### Quick Start

```bash
# Navigate to the api directory
cd /home/user/Documents/aeterna/api

# Activate virtual environment
source .venv/bin/activate

# Start the server
uvicorn app.asgi:app --host 0.0.0.0 --port 8080
```

## Production Deployment Options

### Option 1: Uvicorn with Multiple Workers

```bash
uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4
```

### Option 2: Using systemd (Recommended for Linux servers)

Create a systemd service file at `/etc/systemd/system/aeterna-api.service`:

```ini
[Unit]
Description=Aeterna API Server
After=network.target

[Service]
Type=notify
User=user
WorkingDirectory=/home/user/Documents/aeterna/api
Environment="PATH=/home/user/Documents/aeterna/api/.venv/bin"
ExecStart=/home/user/Documents/aeterna/api/.venv/bin/uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then enable and start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable aeterna-api
sudo systemctl start aeterna-api
sudo systemctl status aeterna-api
```

### Option 3: Using PM2 (Process Manager)

Install PM2:
```bash
npm install -g pm2
```

Create a PM2 ecosystem file `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'aeterna-api',
    script: '/home/user/Documents/aeterna/api/.venv/bin/uvicorn',
    args: 'app.asgi:app --host 0.0.0.0 --port 8080 --workers 4',
    cwd: '/home/user/Documents/aeterna/api',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Option 4: Using Gunicorn with Uvicorn Workers

Install gunicorn:
```bash
pip install gunicorn
```

Run:
```bash
gunicorn app.asgi:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8080
```

### Option 5: Docker Deployment

Use the existing docker-compose setup:

```bash
cd /home/user/Documents/aeterna/api
docker-compose up -d
```

## Nginx Reverse Proxy (Optional)

Add this to your Nginx configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Environment Variables

Make sure these are set in your `.env` file:

```env
# CORS settings
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com

# API settings
API_HOST=0.0.0.0
API_PORT=8080

# Add other required environment variables here
```

## Monitoring and Logs

### View logs with systemd:
```bash
sudo journalctl -u aeterna-api -f
```

### View logs with PM2:
```bash
pm2 logs aeterna-api
```

### Check server status:
```bash
# For systemd
sudo systemctl status aeterna-api

# For PM2
pm2 status
```

## Security Recommendations

1. **Use a reverse proxy** (Nginx, Apache) for SSL/TLS termination
2. **Set up a firewall** (ufw, firewalld) to restrict access
3. **Use environment variables** for sensitive data
4. **Keep dependencies updated** regularly
5. **Enable rate limiting** in your reverse proxy
6. **Use HTTPS** in production

## Performance Tuning

- Adjust the number of workers based on CPU cores: `--workers $(nproc)`
- Set appropriate timeouts: `--timeout 120`
- Configure worker class based on your needs
- Monitor memory usage and adjust `max_memory_restart` if using PM2

## Troubleshooting

### Server won't start
- Check if port 8080 is available: `netstat -tuln | grep 8080`
- Verify virtual environment is activated
- Check config files exist and are valid

### Performance issues
- Increase number of workers
- Check system resources (CPU, RAM, disk I/O)
- Review application logs for errors

### Connection refused
- Check firewall settings
- Verify the server is listening on the correct interface
- Check if reverse proxy is configured correctly
