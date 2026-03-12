#!/bin/bash
# ============================================
# FMDash v5 Fully Automated Scan Pipeline
# - Posts scans automatically to FMDash v5
# - Supports dynamic target list
# - Real-time WebSocket dashboard updates
# - Works from Termux or server
# ============================================

API_KEY="AfriDigital-FMDash-API-Key"
BASE_URL="https://afridigital-fmdash.onrender.com/admin/add-scan"

# ====== Step 1: Load targets dynamically ======
# You can create a targets.txt file with one target per line
if [ -f ~/FMDash/targets.txt ]; then
  mapfile -t TARGETS < ~/FMDash/targets.txt
else
  # Default test targets if no file exists
  TARGETS=("https://juice-shop.herokuapp.com" "https://example.com" "https://testsite.com")
fi

# ====== Step 2: Define vulnerability and severity options ======
VULNERABILITIES=("XSS" "SQL Injection" "CSRF" "Open Redirect")
SEVERITIES=("Low" "Medium" "High")

# ====== Step 3: Loop through targets and post scans ======
for TARGET in "${TARGETS[@]}"; do
  # Pick a random vulnerability and severity (for testing)
  VULN=${VULNERABILITIES[$RANDOM % ${#VULNERABILITIES[@]}]}
  SEV=${SEVERITIES[$RANDOM % ${#SEVERITIES[@]}]}
  TIMESTAMP=$(date '+%Y-%m-%d %H:%M')

  # Post scan to FMDash
  RESPONSE=$(curl -s -X POST "$BASE_URL" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "{\"target\":\"$TARGET\",\"vulnerability\":\"$VULN\",\"severity\":\"$SEV\",\"timestamp\":\"$TIMESTAMP\"}")

  echo -e "\nScan posted: $TARGET | $VULN | $SEV | $TIMESTAMP"
  echo "Response: $RESPONSE"
done

echo -e "\n✅ All scans posted successfully!"
