# =============================================================================
# Aeterna - Unified Dockerfile
# Single container: Next.js frontend (port 3000) + FastAPI backend (port 8080)
#
# Build:
#   docker build -t theideabased/aeterna:latest .
#
# Run locally:
#   docker run -p 3000:3000 -p 8080:8080 \
#     -e GEMINI_API_KEY=your_gemini_key \
#     -e PIXABAY_API_KEY=your_pixabay_key \
#     theideabased/aeterna:latest
#
# Nosana deployment: see nos_job_def/nosana_eliza_job_definition.json
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Next.js frontend
# -----------------------------------------------------------------------------
FROM node:20-slim AS frontend-builder

WORKDIR /frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./

ENV NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
ENV NODE_ENV=production

RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Final runtime image
# Python backend (port 8080) + Next.js frontend (port 3000)
# -----------------------------------------------------------------------------
FROM python:3.12-slim

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    curl \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20 LTS
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Fix ImageMagick policy for MoviePy video operations
RUN if [ -f /etc/ImageMagick-6/policy.xml ]; then \
      sed -i 's/rights="none" pattern="PDF"/rights="read|write" pattern="PDF"/' /etc/ImageMagick-6/policy.xml; \
    fi

WORKDIR /app

# Install Python dependencies
COPY api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY api/ ./

# Copy built Next.js standalone output
COPY --from=frontend-builder /frontend/.next/standalone/ ./frontend/
COPY --from=frontend-builder /frontend/.next/static/     ./frontend/.next/static/
COPY --from=frontend-builder /frontend/public/           ./frontend/public/

# Create required runtime directories
RUN mkdir -p storage/tasks storage/cache_videos resource/fonts resource/songs resource/public

# Use example config as base (env vars override keys at runtime)
RUN if [ ! -f config.toml ] && [ -f config.example.toml ]; then \
      cp config.example.toml config.toml; \
    fi

# Expose ports
EXPOSE 3000 8080

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV NODE_ENV=production

# Startup script: launches both services
RUN printf '#!/bin/bash\nset -e\n\necho ""\necho "╔══════════════════════════════════════════════╗"\necho "║   Aeterna - AI Video Generation Platform   ║"\necho "║   ElizaOS + Nosana GPU Integration         ║"\necho "╚══════════════════════════════════════════════╝"\necho ""\n\n# Inject runtime API keys into config.toml\nif [ -n "$GEMINI_API_KEY" ]; then\n  sed -i "s|gemini_api_key = \\".*\\"|gemini_api_key = \\"$GEMINI_API_KEY\\"|" /app/config.toml\n  echo "✅ Gemini API key set"\nfi\nif [ -n "$PIXABAY_API_KEY" ]; then\n  sed -i "s|pixabay_api_keys = \\".*\\"|pixabay_api_keys = \\"$PIXABAY_API_KEY\\"|" /app/config.toml\n  echo "✅ Pixabay API key set"\nfi\n\n# Start Next.js frontend on port 3000 (background)\necho "🌐 Starting Next.js frontend on port 3000..."\ncd /app/frontend\nHOSTNAME=0.0.0.0 PORT=3000 node server.js &\nFRONTEND_PID=$!\necho "   PID: $FRONTEND_PID"\n\n# Start FastAPI backend on port 8080 (foreground)\necho "🚀 Starting FastAPI backend on port 8080..."\ncd /app\npython main.py\n\n# Cleanup if backend exits\nkill $FRONTEND_PID 2>/dev/null || true\n' > /app/start.sh && chmod +x /app/start.sh

CMD ["/app/start.sh"]
