#!/bin/bash
# =================================================
# FMDash v5 Full Setup Script
# Includes v1–v5 features:
# - Admin routes & API key middleware
# - /admin/add-scan POST route
# - WebSocket real-time scan updates
# - Wallet + coin conversion (100 native → 1 coin)
# - UI fixes (remove gap, update layout)
# =================================================

echo "💻 Setting up FMDash v5 Full Upgrade..."

# Step 1: Ensure dependencies are installed
npm install express dotenv mongoose cors socket.io

# Step 2: Create /admin/add-scan route if not exists
cat > ~/FMDash/server/routes/addScanRoute.js << 'ROUTE'
const express = require('express');
const router = express.Router();

// In-memory scan storage (v5)
let scans = [];

// Middleware to check API Key
router.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }
    next();
});

// POST /admin/add-scan
router.post('/add-scan', (req, res) => {
    const { target, vulnerability, severity, timestamp } = req.body;
    if (!target || !vulnerability || !severity || !timestamp) {
        return res.status(400).json({ message: 'Missing fields' });
    }
    scans.push({ target, vulnerability, severity, timestamp });
    
    // Emit WebSocket event
    if (global.io) global.io.emit('new-scan', { target, vulnerability, severity, timestamp });

    res.json({ message: 'Scan added successfully' });
});

// GET /admin/scans
router.get('/scans', (req, res) => {
    res.json(scans);
});

module.exports = router;
ROUTE

# Step 3: Update server.js to use new route and WebSocket
cat > ~/FMDash/server/server.js << 'SERVER'
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);

global.io = io;

app.use(cors());
app.use(express.json());

// API Key middleware
app.use((req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (!apiKey || apiKey !== process.env.API_KEY) {
        return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
    }
    next();
});

// Routes
app.use('/admin', require('./routes/addScanRoute'));

// Test route
app.get('/admin/test', (req, res) => {
    res.json({ message: 'Admin route accessed successfully' });
});

// WebSocket connection
io.on('connection', (socket) => {
    console.log('Client connected');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('FMDash running on port', PORT));
SERVER

# Step 4: Add Wallet & Coin conversion logic for frontend
cat > ~/FMDash/client/js/wallet.js << 'WALLET'
// Example Wallet object
let wallet = { native: 1000, coins: 10 };
const RATE = 100; // 100 native -> 1 coin

function convertToCoins() {
    const coins = Math.floor(wallet.native / RATE);
    wallet.coins += coins;
    wallet.native -= coins * RATE;
    updateWalletUI();
}

function convertToNative() {
    const native = wallet.coins * RATE;
    wallet.native += native;
    wallet.coins = 0;
    updateWalletUI();
}

function updateWalletUI() {
    document.getElementById('nativeBalance').innerText = wallet.native;
    document.getElementById('coinBalance').innerText = wallet.coins;
}
WALLET

# Step 5: Fix UI gaps in index.html
sed -i 's/<body>/<body>\n<style>body { margin:0; padding:0; }</style>/' ~/FMDash/client/index.html

# Step 6: Make script executable
chmod +x ~/FMDash/server/server.js

echo "✅ FMDash v5 setup complete!"
echo "Run 'node ~/FMDash/server/server.js' to start FMDash"
