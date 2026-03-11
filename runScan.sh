#!/bin/bash

# Simple FMDash Termux scan script
# Usage: ./runScan.sh https://example.com

TARGET="$1"
if [ -z "$TARGET" ]; then
  echo "Usage: $0 <target-url>"
  exit 1
fi

# Mock scan results
VULNERABILITIES=("SQL Injection" "XSS" "Missing HTTPS")
SEVERITIES=("High" "Medium" "Low")
RANDOM_INDEX=$((RANDOM % 3))
VULN=${VULNERABILITIES[$RANDOM_INDEX]}
SEV=${SEVERITIES[$RANDOM_INDEX]}
TIMESTAMP=$(date +"%Y-%m-%d %H:%M")

# Post to FMDash
curl -s -X POST https://afridigital-fmdash.onrender.com/admin/add-scan \
-H "x-api-key: AfriDigital-FMDash-API-Key" \
-H "Content-Type: application/json" \
-d "{\"target\":\"$TARGET\",\"vulnerability\":\"$VULN\",\"severity\":\"$SEV\",\"timestamp\":\"$TIMESTAMP\"}"

echo -e "\nScan posted: $TARGET | $VULN | $SEV | $TIMESTAMP"
