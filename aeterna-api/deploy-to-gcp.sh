#!/bin/bash

# GCP Deployment Script for Aeterna API
# Project: copiwrite-auth

set -e  # Exit on error

# Configuration
PROJECT_ID="copiwrite-auth"
REGION="us-central1"  # Change to your preferred region
SERVICE_NAME="aeterna-api"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}"

echo "================================================"
echo "Deploying Aeterna API to Google Cloud Run"
echo "Project: ${PROJECT_ID}"
echo "Region: ${REGION}"
echo "================================================"

# Step 1: Ensure project is set
echo "Setting GCP project..."
gcloud config set project ${PROJECT_ID}

# Step 2: Enable required APIs
echo "Enabling required GCP APIs..."
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com

# Step 3: Build and push Docker image
echo "Building Docker image for FastAPI..."
gcloud builds submit --tag ${IMAGE_NAME} --timeout=20m

# Step 4: Deploy to Cloud Run
echo "Deploying to Cloud Run..."
gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port 8080 \
  --memory 4Gi \
  --cpu 2 \
  --timeout 600 \
  --max-instances 10 \
  --min-instances 0

echo "================================================"
echo "Deployment complete!"
echo "================================================"
echo "Your service URL:"
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format 'value(status.url)'
