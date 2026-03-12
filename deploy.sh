#!/bin/bash

# --- Configuration ---
SERVER_PATH=~/FMDash
SERVER_URL="https://afridigital-fmdash.onrender.com"  # change to localhost:5000 to test locally
LOG_FILE="$SERVER_PATH/route_check.log"

# Read API key from .env
API_KEY=$(grep 'AfriDigital-FMDash-API-Key' "$SERVER_PATH/.env" | cut -d '=' -f2)

# --- 1️⃣ Ensure dependencies ---
cd "$SERVER_PATH"
npm install express dotenv

# --- 2️⃣ Overwrite server.js ---
cat > "$SERVER_PATH/server.js" << 'EOF'
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static client files
app.use(express.static(path.join(__dirname, 'client')));

// API route
const adminRoutes = require('./routes/toolsRoutes'); // your /admin/add-scan route
app.use('/admin', adminRoutes);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF

echo "$(date) ✅ server.js overwritten."

# --- 3️⃣ Kill any running server and restart ---
pkill -f "node server.js" 2>/dev/null
nohup node "$SERVER_PATH/server.js" > "$LOG_FILE" 2>&1 &
echo "$(date) ✅ Node restarted in background."

# --- 4️⃣ Wait for /admin/add-scan route and post scan ---
MAX_RETRIES=30
COUNT=0

while true; do
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$SERVER_URL/admin/add-scan")
  if [[ "$STATUS_CODE" == "200" || "$STATUS_CODE" == "204" ]]; then
    echo "$(date) ✅ /admin/add-scan route live! Posting scan..." >> "$LOG_FILE"
    curl -s -X POST "$SERVER_URL/admin/add-scan" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d '{"target":"https://juice-shop.herokuapp.com","vulnerability":"XSS","severity":"Medium"}' \
      >> "$LOG_FILE" 2>&1
    echo "$(date) ✅ Scan posted successfully!" >> "$LOG_FILE"
    break
  else
    echo "$(date) ⏳ Route not live yet (HTTP $STATUS_CODE). Retrying in 10s..." >> "$LOG_FILE"
    sleep 10
  fi
  ((COUNT++))
  if [[ $COUNT -ge $MAX_RETRIES ]]; then
    echo "$(date) ❌ Route never came live after $MAX_RETRIES tries. Check server and routes." >> "$LOG_FILE"
    break
  fi
done

echo "$(date) 🟢 Done! Check $LOG_FILE for details."
