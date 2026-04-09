# Dashboard Migration to API

## Overview
The Streamlit dashboard (`webui/Main.py`) has been updated to use the FastAPI backend through HTTP API calls instead of direct Python imports.

## Key Changes

### 1. Added Dependencies
- **requests**: For HTTP API communication
- **json**: For payload serialization
- **time**: For polling task status

### 2. API Configuration
- Added `API_BASE_URL` configuration (default: `http://127.0.0.1:8080`)
- Can be configured via environment variable: `API_BASE_URL`
- Can be changed in the dashboard UI under "Basic Settings" → "API Settings"

### 3. Replaced Direct Service Calls
**Before:**
```python
from app.services import task as tm
result = tm.start(task_id=task_id, params=params)
```

**After:**
```python
# Call API endpoint
response = requests.post(
    f"{API_BASE_URL}/api/v1/videos",
    json=params_dict,
    timeout=300
)

# Poll for completion
while task_status != "complete":
    status_response = requests.get(
        f"{API_BASE_URL}/api/v1/tasks/{task_id}",
        timeout=30
    )
    # Check status and wait
```

### 4. Added Features
- **API Health Check**: Dashboard shows connection status at the top
  - ✅ Green "API Connected" when backend is online
  - ❌ Red "API Offline" when backend is unreachable
- **API URL Configuration**: Users can change the API endpoint in settings
- **Task Polling**: Automatically polls for task completion (10-minute timeout)
- **Better Error Handling**: Shows API errors and connection issues clearly

## How to Use

### 1. Start the API Server
```bash
cd api
./start_api.sh
```
The API will run on `http://127.0.0.1:8080`

### 2. Start the Dashboard
```bash
cd api
./start_webui.sh
```
The dashboard will open at `http://localhost:8501`

### 3. Check Connection
- Look at the top of the dashboard
- You should see "✅ API Connected"
- If you see "❌ API Offline", check that the API server is running

### 4. Generate Videos
Use the dashboard as before - it will now communicate with the API backend!

## API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/ping` | GET | Health check |
| `/api/v1/videos` | POST | Create video generation task |
| `/api/v1/tasks/{task_id}` | GET | Check task status |

## Configuration Options

### Environment Variables
```bash
export API_BASE_URL="http://127.0.0.1:8080"
```

### Dashboard UI
1. Open "Basic Settings" expander
2. Find "API Settings" section in left panel
3. Update "API Base URL" field
4. Changes are saved automatically

## Benefits of This Approach

1. **Separation of Concerns**: Dashboard is purely UI, backend handles processing
2. **Scalability**: API can be deployed separately from dashboard
3. **Multiple Clients**: Same API can serve web frontend, mobile apps, etc.
4. **Better Error Handling**: Clear separation makes debugging easier
5. **Docker Friendly**: Can run API and dashboard in separate containers

## Troubleshooting

### "API Offline" Error
1. Check if API server is running: `curl http://127.0.0.1:8080/ping`
2. Verify API_BASE_URL is correct
3. Check firewall settings if using different machines

### Task Timeout
- Default timeout is 10 minutes
- For longer videos, check task status manually at:
  `http://127.0.0.1:8080/api/v1/tasks/{task_id}`

### Connection Refused
- Ensure API is listening on the correct port
- If using Docker, check network configuration
- Update API_BASE_URL if API is on different machine

## Next Steps

Consider migrating to the new Next.js frontend at `/frontend` for:
- Modern React UI
- Better performance
- Mobile-responsive design
- StoryBrand messaging
- Professional branding
