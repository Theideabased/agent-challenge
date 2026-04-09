# Aeterna Backend Setup - Quick Reference

## ✅ What We've Done

### 1. Fixed the Startup Issues
- **Problem**: The old `start_api.sh` script had hardcoded paths and used `python` instead of `python3`
- **Solution**: Updated the script to use relative paths and `uvicorn` directly

### 2. Simplified the Backend Startup

You can now start the backend in **three ways**:

#### Option A: Using the startup script (Updated)
```bash
cd /home/user/Documents/aeterna/api
./start_api.sh
```

#### Option B: Using uvicorn directly (✨ RECOMMENDED for deployment)
```bash
cd /home/user/Documents/aeterna/api

# Development mode with auto-reload
/home/user/Documents/aeterna/api/.venv/bin/uvicorn app.asgi:app --host 127.0.0.1 --port 8080 --reload

# Production mode
/home/user/Documents/aeterna/api/.venv/bin/uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4
```

#### Option C: Using Python directly (Legacy)
```bash
cd /home/user/Documents/aeterna/api
python3 main.py
```

### 3. Created Documentation
- **SETUP.md**: Complete setup guide with troubleshooting
- **DEPLOYMENT.md**: Production deployment options (systemd, PM2, Docker, Gunicorn)
- **Updated README.md**: Added the new startup options

### 4. Fixed Virtual Environment
- Recreated `.venv` with Python 3.12
- Installed all dependencies from `requirements.txt`
- Verified uvicorn is working (version 0.32.1)

## 🚀 Current Status

✅ **API Server is RUNNING** on http://127.0.0.1:8080
- API Documentation: http://127.0.0.1:8080/docs
- Alternative Docs: http://127.0.0.1:8080/redoc

## 📝 For Deployment

The simplest deployment command is:
```bash
cd /home/user/Documents/aeterna/api
/home/user/Documents/aeterna/api/.venv/bin/uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4
```

For production, consider using:
- **systemd** service (Linux servers) - See DEPLOYMENT.md
- **PM2** process manager (Node.js ecosystem) - See DEPLOYMENT.md  
- **Docker** with docker-compose - See existing docker-compose.yml
- **Nginx** reverse proxy for SSL/HTTPS - See DEPLOYMENT.md

## 🔧 Files Modified

1. `/home/user/Documents/aeterna/api/start_api.sh` - Fixed paths and commands
2. `/home/user/Documents/aeterna/api/README.md` - Added new startup options
3. `/home/user/Documents/aeterna/frontend/app/dashboard/_components/Header.jsx` - Updated logo

## 📚 New Documentation Files

1. `/home/user/Documents/aeterna/api/SETUP.md` - Setup guide
2. `/home/user/Documents/aeterna/api/DEPLOYMENT.md` - Deployment guide
3. `/home/user/Documents/aeterna/api/CHANGES.md` - This file

## 🎯 Next Steps

1. **For Frontend**: Update the API endpoint in frontend configuration to point to `http://127.0.0.1:8080`
2. **For Production**: Choose a deployment method from DEPLOYMENT.md
3. **For Development**: Use `--reload` flag for auto-restart on code changes

## 📖 Quick Commands

```bash
# Start API (development)
cd api && /home/user/Documents/aeterna/api/.venv/bin/uvicorn app.asgi:app --host 127.0.0.1 --port 8080 --reload

# Start API (production)
cd api && /home/user/Documents/aeterna/api/.venv/bin/uvicorn app.asgi:app --host 0.0.0.0 --port 8080 --workers 4

# Check if server is running
curl http://127.0.0.1:8080/docs

# View logs (if using systemd)
sudo journalctl -u aeterna-api -f
```

---

**Date**: January 12, 2026
**Status**: ✅ Complete and Working
