#!/bin/bash

# Step 0: Make sure Node.js is installed
pkg install -y nodejs npm

# Step 1: Go to FMDash folder (create if missing)
mkdir -p ~/FMDash
cd ~/FMDash

# Step 2: Install dependencies
npm init -y
npm install express socket.io dotenv

# Step 3: Create .env if missing
if [ ! -f ".env" ]; then
cat > .env << 'EOF'
API_KEY=AfriDigital-FMDash-API-Key
ADMIN_USERNAME=AfriDigitalAdmin
ADMIN_PASSWORD=StrongAdmin@2026
PORT=5000
MONGO_URI=<your MongoDB URI>
EOF
fi

# Step 4: server.js
mkdir -p server/routes server/middleware
cat > server/server.js << 'EOF'
require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);
const adminRoutes = require('./routes/admin');
const walletRoutes = require('./routes/wallet');
app.use(express.json());
app.use('/admin', adminRoutes);
app.use('/admin/wallet', walletRoutes);
app.use(express.static('../client'));

// WebSocket
io.on('connection', socket => console.log('Client connected to WebSocket'));

// Emit scans in add-scan route
const { addScanHandler } = require('./routes/admin');
app.post('/admin/add-scan', (req, res, next) => addScanHandler(req, res, next, scan => io.emit('new-scan', scan)));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log('FMDash running on port', PORT));
EOF

# Step 5: Admin routes
cat > server/routes/admin.js << 'EOF'
const express = require('express');
const router = express.Router();
const apiKeyMiddleware = require('../middleware/apiKeyMiddleware');
let scans = [];
router.get('/test', apiKeyMiddleware, (req, res) => res.json({ message: 'Admin route accessed successfully' }));
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if(username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD)
    return res.json({ message: 'Login successful' });
  return res.status(401).json({ message: 'Unauthorized: Invalid credentials' });
});
function addScanHandler(req, res, next, emitCallback) {
  const { target, vulnerability, severity, timestamp } = req.body;
  const scan = { target, vulnerability, severity, timestamp };
  scans.push(scan);
  if(emitCallback) emitCallback(scan);
  res.json({ message: 'Scan added', scan });
}
router.post('/add-scan', apiKeyMiddleware, (req, res, next) => addScanHandler(req, res, next));
router.get('/scans', apiKeyMiddleware, (req, res) => res.json(scans));
module.exports = router;
module.exports.addScanHandler = addScanHandler;
EOF

# Step 6: API key middleware
cat > server/middleware/apiKeyMiddleware.js << 'EOF'
require('dotenv').config();
module.exports = (req, res, next) => {
  const key = req.headers['x-api-key'];
  if(key && key === process.env.API_KEY) next();
  else res.status(401).json({ message: 'Unauthorized: Invalid API key' });
};
EOF

# Step 7: Client folder
mkdir -p client
cat > client/dashboard.js << 'EOF'
const apiKey = 'AfriDigital-FMDash-API-Key';
const socket = io();
async function updateWallet() {
  const res = await fetch('/admin/wallet', { headers: { 'x-api-key': apiKey } });
  const data = await res.json();
  document.getElementById('native-balance').innerText = data.nativeBalance;
  document.getElementById('coin-balance').innerText = data.coinBalance;
}
document.getElementById('convert-to-coin').addEventListener('click', async () => {
  const amount = parseInt(prompt('Enter native amount to convert:'));
  await fetch('/admin/wallet/convert', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ direction:'toCoin', amount })
  });
  updateWallet();
});
document.getElementById('convert-to-native').addEventListener('click', async () => {
  const amount = parseInt(prompt('Enter coin amount to convert:'));
  await fetch('/admin/wallet/convert', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ direction:'toNative', amount })
  });
  updateWallet();
});
updateWallet();
socket.on('new-scan', scan => {
  const scanList = document.getElementById('scan-list');
  if(scanList){
    const row = document.createElement('tr');
    row.innerHTML = `<td>${scan.target}</td><td>${scan.vulnerability}</td><td>${scan.severity}</td><td>${scan.timestamp}</td>`;
    scanList.appendChild(row);
  }
});
EOF

# Step 8: Client index.html
cat > client/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>FMDash v5</title>
<script src="/socket.io/socket.io.js"></script>
</head>
<body>
<div id="top-bar">
Wallet: <span id="native-balance">0</span> USD | Coin: <span id="coin-balance">0</span>
<button id="convert-to-coin">To Coin</button>
<button id="convert-to-native">To Native</button>
</div>
<h2>Scan Results</h2>
<table id="scan-list">
<thead>
<tr><th>Target</th><th>Vulnerability</th><th>Severity</th><th>Timestamp</th></tr>
</thead>
<tbody></tbody>
</table>
<script src="dashboard.js"></script>
</body>
</html>
EOF

# Step 9: Run server
node server/server.js
