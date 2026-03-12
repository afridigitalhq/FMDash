#!/bin/bash
# ================================
# FMDash v5 Complete Deploy Script
# ================================

echo "💻 Starting FMDash v5 deployment..."

# Pull latest code
git pull origin main

# Install Node dependencies
npm install

# Install pm2 if missing
if ! command -v pm2 &> /dev/null
then
    echo "⚡ pm2 not found. Installing..."
    npm install -g pm2
fi

# Ensure .env exists with API_KEY
if [ ! -f .env ]; then
    echo "API_KEY=AfriDigital-FMDash-API-Key" > .env
fi

# Stop previous FMDash process if exists
pm2 stop FMDash || true

# Start FMDash with pm2
pm2 start server/server.js --name FMDash

echo "✅ FMDash v5 deployed and running!"
