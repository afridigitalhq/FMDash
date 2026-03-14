#!/bin/bash
# ============================
# Auto Scanner + WebSocket Poster
# ============================

RENDER_WS="wss://afridigital-fmdash.onrender.com/ws"
TARGETS_FILE="$HOME/FMDash/targets.txt"

# Check if targets file exists
if [ ! -f "$TARGETS_FILE" ]; then
  echo "[ERROR] Targets file not found: $TARGETS_FILE"
  exit 1
fi

# Simple WebSocket poster using Node.js
node -e "
const WebSocket = require('ws');
const fs = require('fs');
const ws = new WebSocket('$RENDER_WS');

ws.on('open', () => {
  console.log('[WS] Connected to FMDash server.');

  const targets = fs.readFileSync('$TARGETS_FILE','utf-8').split('\\n').filter(Boolean);

  targets.forEach((target, index) => {
    // Simulate a scan result (replace with real scanner output)
    const scanResult = {
      target: target,
      vulnerability: ['XSS','SQL Injection','Open Port'][Math.floor(Math.random()*3)],
      severity: ['High','Medium','Low'][Math.floor(Math.random()*3)],
      timestamp: new Date()
    };

    // Send each scan result with 1s delay
    setTimeout(()=>{ ws.send(JSON.stringify({scan:scanResult})); console.log('[SCAN] Sent', scanResult.target); }, index*1000);
  });
});

ws.on('close', () => console.log('[WS] Disconnected'));
ws.on('error', err => console.error('[WS] Error:', err));
"
