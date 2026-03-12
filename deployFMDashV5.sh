#!/bin/bash
# =========================================
# FMDash v5 Deploy Script for Render
# =========================================

echo "💻 Deploying FMDash v5..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Ensure .env is correct (API_KEY must be set)
if [ ! -f .env ]; then
  echo "API_KEY=AfriDigital-FMDash-API-Key" > .env
fi

# Start FMDash server
pm2 stop FMDash || true
pm2 start server/server.js --name FMDash

echo "✅ FMDash v5 deployed and running!"
