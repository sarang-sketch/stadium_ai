# Deployment Guide

## Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Google Cloud / Firebase Account
- Google Gemini API Key

## Environment Setup
1. Copy the example env file: `cp .env.example .env.local`
2. Populate the required keys:
```env
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
GEMINI_API_KEY="your_gemini_api_key"
USE_MOCK_ADAPTERS="false"
```

## Firebase Project Setup
1. Create a project in the Firebase Console.
2. Enable Firestore and Authentication (Email/Password).
3. Retrieve your configuration object and place the values in `.env.local`.

## Local Development
```bash
npm install
npm run dev
```
Access at `http://localhost:3000`

## Docker Deployment
Build and run the container locally:
```bash
docker-compose up --build -d
```

## Cloud Run Deployment
1. Authenticate with GCP: `gcloud auth login`
2. Build and push the image to Artifact Registry.
3. Deploy to Cloud Run:
```bash
gcloud run deploy stadiumai \
  --image gcr.io/YOUR_PROJECT/stadiumai \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="USE_MOCK_ADAPTERS=false,GEMINI_API_KEY=your_key"
```

## Switching to Production Services
To disable mock data, ensure `USE_MOCK_ADAPTERS="false"` is set in your environment. The system will automatically inject the Live adapters for Firebase and Gemini.
