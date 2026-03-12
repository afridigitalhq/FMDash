#!/bin/bash

# --- Configuration ---
SERVER_PATH=~/FMDash
SERVER_URL="https://afridigital-fmdash.onrender.com"
LOG_FILE="$SERVER_PATH/route_check.log"
API_KEY=$(grep 'AfriDigital-FMDash-API-Key' "$SERVER_PATH/.env" | cut -d '=' -f2)
MAX_RETRIES=30
COUNT=0

# --- Overwrite server.js ---
cat > "$SERVER_PATH/server.js" << 'EOF'
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(express.json());

// Serve static client files
app.use(express.static(path.join(__dirname, 'client')));

// API route
const adminRoutes = require('./routes/toolsRoutes');
app.use('/admin', adminRoutes);

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
EOF

# --- Overwrite index.html ---
mkdir -p "$SERVER_PATH/client"
cat > "$SERVER_PATH/client/index.html" << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>AfriDigital FMDash</title>
<link rel="stylesheet" href="/style.css">
</head>
<body>
<header>
  Wallet: 0 USD | Coin: 0 To Coin To Native
</header>
<div class="container">
  <h2>Scan Results</h2>
  <table>
    <thead>
      <tr><th>Target</th><th>Vulnerability</th><th>Severity</th><th>Timestamp</th></tr>
    </thead>
    <tbody id="scan-results">
      <!-- Results will be populated here -->
    </tbody>
  </table>
</div>
</body>
</html>
EOF

# --- Overwrite style.css ---
cat > "$SERVER_PATH/client/style.css" << 'EOF'
body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  margin: 0;
  padding: 0;
}
header {
  background-color: #1a73e8;
  color: white;
  padding: 15px;
  text-align: center;
  font-size: 1.2rem;
}
.container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 15px;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
table, th, td {
  border: 1px solid #ccc;
}
th, td {
  padding: 10px;
  text-align: left;
}
th {
  background-color: #e0e0e0;
}
button {
  background-color: #1a73e8;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
}
button:hover {
  background-color: #155ab6;
}
EOF

# --- Kill running Node server and start in background ---
pkill -f "node server.js" 2>/dev/null
nohup node "$SERVER_PATH/server.js" > "$LOG_FILE" 2>&1 &
echo "$(date) ✅ server.js, index.html, style.css overwritten & Node restarted in background."

# --- Wait for /admin/add-scan route to be live ---
while true; do
  STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$SERVER_URL/admin/add-scan")
  if [[ "$STATUS_CODE" == "200" || "$STATUS_CODE" == "204" ]]; then
    echo "$(date) ✅ /admin/add-scan live! Posting test scan..." >> "$LOG_FILE"
    curl -s -X POST "$SERVER_URL/admin/add-scan" \
      -H "Content-Type: application/json" \
      -H "x-api-key: $API_KEY" \
      -d '{"target":"https://juice-shop.herokuapp.com","vulnerability":"XSS","severity":"Medium"}' \
      >> "$LOG_FILE" 2>&1
    echo "$(date) ✅ Test scan posted!" >> "$LOG_FILE"
    break
  else
    echo "$(date) ⏳ /admin/add-scan not live (HTTP $STATUS_CODE). Retrying in 10s..." >> "$LOG_FILE"
    sleep 10
  fi
  ((COUNT++))
  if [[ $COUNT -ge $MAX_RETRIES ]]; then
    echo "$(date) ❌ Route never came live after $MAX_RETRIES tries." >> "$LOG_FILE"
    break
  fi
done

echo "$(date) 🟢 Done! Your UI is now live from $SERVER_URL. Check $LOG_FILE for details."
