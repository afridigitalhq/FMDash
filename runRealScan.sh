#!/bin/bash
# Usage: ./runRealScan.sh https://target.com

TARGET="$1"
if [ -z "$TARGET" ]; then
  echo "Usage: $0 <target-url>"
  exit 1
fi

# Run sqlmap to test for SQL injection (example)
SCAN_RESULT=$(sqlmap -u "$TARGET" --batch --level=1 --risk=1 --crawl=0 --threads=1 | grep -E "is vulnerable|parameter")

# Determine vulnerability and severity
if echo "$SCAN_RESULT" | grep -q "vulnerable"; then
  VULN="SQL Injection"
  SEV="High"
else
  VULN="No SQL Injection"
  SEV="Low"
fi

TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Post to FMDash
curl -s -X POST https://afridigital-fmdash.onrender.com/admin/add-scan \
-H "x-api-key: AfriDigital-FMDash-API-Key" \
-H "Content-Type: application/json" \
-d "{\"target\":\"$TARGET\",\"vulnerability\":\"$VULN\",\"severity\":\"$SEV\",\"timestamp\":\"$TIMESTAMP\"}"

echo -e "\nScan posted: $TARGET | $VULN | $SEV | $TIMESTAMP"
