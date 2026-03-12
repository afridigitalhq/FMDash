#!/bin/bash
echo "💻 Deploying FMDash v5 (all-in-one)..."

# Step 1: Pull latest code
git pull origin main

# Step 2: Ensure Node dependencies
npm install

# Step 3: Ensure pm2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "⚡ pm2 not found. Installing..."
    npm install -g pm2
fi

# Step 4: Ensure .env exists
if [ ! -f .env ]; then
    echo "API_KEY=AfriDigital-FMDash-API-Key" > .env
fi

# Step 5: Ensure /admin/add-scan route exists
ADMIN_ROUTE_FILE="server/routes/adminRoutes.js"
if ! grep -q "add-scan" "$ADMIN_ROUTE_FILE"; then
cat >> "$ADMIN_ROUTE_FILE" << 'JS'

// POST /admin/add-scan
router.post("/add-scan", verifyApiKey, (req, res) => {
  const { target, vulnerability, severity, timestamp } = req.body;
  if (!target || !vulnerability || !severity || !timestamp) {
    return res.status(400).json({ message: "Missing scan data" });
  }
  scans.push({ target, vulnerability, severity, timestamp });

  // WebSocket live update
  if (req.app.get("io")) {
    const io = req.app.get("io");
    io.emit("new-scan", { target, vulnerability, severity, timestamp });
  }

  res.json({ message: "Scan added successfully" });
});
JS
fi

# Step 6: Stop previous FMDash process
pm2 stop FMDash || true

# Step 7: Start FMDash
pm2 start server/server.js --name FMDash

# Step 8: Run auto-scan script
if [ -f ~/FMDash/runAutoScans_v5.sh ]; then
    chmod +x ~/FMDash/runAutoScans_v5.sh
    ~/FMDash/runAutoScans_v5.sh
fi

echo "✅ FMDash v5 fully deployed and running!"
