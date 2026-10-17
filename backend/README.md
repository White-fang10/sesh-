# Sesh@ Backend API (Render Deployment)

A lightweight Node.js TypeScript API service designed for **Render Free Web Service**.

## Features
- Listens on `0.0.0.0` and dynamic `$PORT` supplied by Render
- Mandatory `/api/health` endpoint for zero-downtime health monitoring
- Google OpenID Connect ID token signature verification
- CORS configured for Vercel Hobby frontend domain
- Cold-start friendly (stateless design, immediate initialization)

## Render Free Web Service Deployment Instructions
1. Create a new **Web Service** on Render and connect your GitHub repository.
2. Root Directory: `backend`
3. Environment: `Node`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Health Check Path: `/api/health`
7. Add Environment Variables (from `.env.example`).
