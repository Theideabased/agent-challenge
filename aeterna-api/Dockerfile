# Use an official Python runtime as a parent image
FROM python:3.11-slim-bullseye

# Set the working directory in the container
WORKDIR /Aeterna

# Set permissions
RUN chmod 777 /Aeterna

ENV PYTHONPATH="/Aeterna"

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    imagemagick \
    ffmpeg && \
    rm -rf /var/lib/apt/lists/*

# Fix security policy for ImageMagick
RUN sed -i '/<policy domain="path" rights="none" pattern="@\*"/d' /etc/ImageMagick-6/policy.xml

# Copy requirements and install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir --retries 3 --timeout 120 -r requirements.txt

# Copy the rest of the application
COPY . .

# Use PORT environment variable from Cloud Run (defaults to 8080)
ENV PORT=8080
ENV HOST=0.0.0.0

# Expose the port
EXPOSE 8080

# Run the FastAPI application
CMD uvicorn app.asgi:app --host 0.0.0.0 --port 8080
