#!/bin/bash

# --- Config ---
BASE_URL="https://afridigital-fmdash.onrender.com"
CLIENT_DIR=~/FMDash/client
RELEASE_DIR="$CLIENT_DIR/release"

# --- Clean JS scripts ---
for f in combined-scripts-final.js dashboard.js inbox.js full-summary.awk full-summary.txt script-block-summary.txt script-summary.txt; do
  if [ -f "$CLIENT_DIR/$f" ]; then
    sed -E "s/function ([a-zA-Z0-9_]+)_+[0-9]+/\1/g;s/([a-zA-Z0-9]+)_+[0-9]+=/\1=/" "$CLIENT_DIR/$f" > "$RELEASE_DIR/$f"
  fi
done
echo "✅ Scripts cleaned"
curl -s -X POST $BASE_URL/api/deploy_status -d "status=Scripts cleaned" >/dev/null

# --- API health check ---
if curl -s "$BASE_URL/api/status" >/dev/null; then
  echo "✅ API health OK"
  curl -s -X POST $BASE_URL/api/deploy_status -d "status=API health OK" >/dev/null
else
  echo "❌ API health check failed"
  curl -s -X POST $BASE_URL/api/deploy_status -d "status=API health failed" >/dev/null
fi

# --- XSS test ---
xss_test=$(curl -s "$BASE_URL/api/scan?site=<script>alert(1)</script>")
if echo "$xss_test" | grep -qi "error"; then
  echo "❌ XSS vulnerability detected"
  curl -s -X POST $BASE_URL/api/deploy_status -d "status=XSS failed" >/dev/null
else
  echo "✅ XSS test passed"
fi

# --- SQLi test ---
sqli_test=$(curl -s "$BASE_URL/api/scan?site=' OR '1'='1")
if echo "$sqli_test" | grep -qi "sql"; then
  echo "❌ SQL injection detected"
  curl -s -X POST $BASE_URL/api/deploy_status -d "status=SQLi failed" >/dev/null
else
  echo "✅ SQL injection test passed"
fi

# --- UI check ---
for view in "desktop" "mobile"; do
  for el in "header" "sidebar" "chat widget" "coins panel"; do
    if curl -s "$BASE_URL/api/ui_check?view=$view&element=$(echo $el | tr ' ' '+')" | grep -qi "ok"; then
      echo "✅ $view $el OK"
    else
      echo "❌ $view $el missing"
    fi
  done
done

# --- Create snapshot ---
SNAPSHOT="release-$(date +%Y-%m-%d-%H-%M).zip"
zip -r "$CLIENT_DIR/releases/$SNAPSHOT" "$RELEASE_DIR" >/dev/null
echo "📁 Snapshot created: $SNAPSHOT"
curl -s -X POST $BASE_URL/api/deploy_status -d "status=Snapshot created: $SNAPSHOT" >/dev/null

# --- Git commit & push ---
cd ~/FMDash
git add .
git commit -m "FMDash deploy $(date +%Y-%m-%d-%H-%M)"
git push
echo "✅ Deployment Complete"
curl -s -X POST $BASE_URL/api/deploy_status -d "status=Deployment complete" >/dev/null
echo "💡 Deployment finished. Check live on Render!"

