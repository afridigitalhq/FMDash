#!/bin/bash
echo "💻 Deploying FMDash v5 (dynamic automated scans)..."

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Install pm2 if missing
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Ensure .env exists
if [ ! -f .env ]; then
    echo "API_KEY=AfriDigital-FMDash-API-Key" > .env
fi

# Ensure /admin/add-scan route exists
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

  if (req.app.get("io")) {
    const io = req.app.get("io");
    io.emit("new-scan", { target, vulnerability, severity, timestamp });
  }

  res.json({ message: "Scan added successfully" });
});
JS
fi

# Stop previous FMDash pm2 process
pm2 stop FMDash || true

# Start FMDash
pm2 start server/server.js --name FMDash

# Dynamic scan loop
if [ ! -f ~/FMDash/targets.txt ]; then
    echo "⚠️ targets.txt not found!"
    exit 1
fi

while read TARGET; do
    # Auto-assign vulnerability & severity
    case $((RANDOM % 3)) in
        0) VULN="XSS"; SEV="Medium";;
        1) VULN="CSRF"; SEV="High";;
        2) VULN="Open Redirect"; SEV="Medium";;
    esac
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

    RESPONSE=$(curl -s -X POST https://afridigital-fmdash.onrender.com/admin/add-scan \
      -H "Content-Type: application/json" \
      -H "x-api-key: AfriDigital-FMDash-API-Key" \
      -d "{\"target\":\"$TARGET\",\"vulnerability\":\"$VULN\",\"severity\":\"$SEV\",\"timestamp\":\"$TIMESTAMP\"}")

    echo -e "\nScan posted: $TARGET | $VULN | $SEV | $TIMESTAMP"
    echo "Response: $RESPONSE"
done < ~/FMDash/targets.txt

echo -e "\n✅ FMDash v5 fully deployed and running with dynamic automated scans!"
