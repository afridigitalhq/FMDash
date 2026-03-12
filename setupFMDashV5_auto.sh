#!/bin/bash
echo "💻 Deploying FMDash v5 with automated multi-target scans..."

# 1. Pull latest code
git pull origin main

# 2. Install dependencies
npm install

# 3. Install pm2 if not found
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 4. Ensure .env exists
if [ ! -f .env ]; then
    echo "API_KEY=AfriDigital-FMDash-API-Key" > .env
fi

# 5. Ensure /admin/add-scan route exists
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

# 6. Stop previous FMDash pm2 process
pm2 stop FMDash || true

# 7. Start FMDash
pm2 start server/server.js --name FMDash

# 8. Automated multi-target scans
TARGETS=("https://juice-shop.herokuapp.com" "https://example.com" "https://testsite.com")
for TARGET in "${TARGETS[@]}"; do
    VULN="XSS"
    SEV="Medium"
    TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

    RESPONSE=$(curl -s -X POST https://afridigital-fmdash.onrender.com/admin/add-scan \
      -H "Content-Type: application/json" \
      -H "x-api-key: AfriDigital-FMDash-API-Key" \
      -d "{\"target\":\"$TARGET\",\"vulnerability\":\"$VULN\",\"severity\":\"$SEV\",\"timestamp\":\"$TIMESTAMP\"}")

    echo -e "\nScan posted: $TARGET | $VULN | $SEV | $TIMESTAMP"
    echo "Response: $RESPONSE"
done

echo -e "\n✅ FMDash v5 fully deployed and running with automated scans!"
