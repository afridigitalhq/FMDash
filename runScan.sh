#!/bin/bash
TEMPLATE_DIR=~/FMDash/nuclei/templates
TARGET_FILE=~/FMDash/targets.txt
SERVER_URL="http://localhost:5000/api/scan-results"
export PATH=$PATH:$HOME/go/bin
while true; do
    echo "[INFO $(date '+%Y-%m-%d %H:%M:%S')] Updating Nuclei templates..."
    cd $TEMPLATE_DIR && git pull --depth=1
    echo "[INFO $(date '+%Y-%m-%d %H:%M:%S')] Reading targets from $TARGET_FILE..."
    while read -r target; do
        if [ -n "$target" ]; then
            echo "[INFO $(date '+%Y-%m-%d %H:%M:%S')] Scanning target: $target"
            nuclei -u "$target" -t $TEMPLATE_DIR -silent | while read -r line; do
                echo "[MATCH $(date '+%Y-%m-%d %H:%M:%S')] Target: $target | $line"
                curl -s -X POST -H "Content-Type: application/json" \
                    -d "{\"target\":\"$target\",\"vulnerability\":\"$line\",\"severity\":\"Medium\",\"timestamp\":\"$(date +%Y-%m-%dT%H:%M:%S)\"}" \
                    $SERVER_URL
            done
        fi
    done < $TARGET_FILE
    echo "[INFO $(date '+%Y-%m-%d %H:%M:%S')] Scan cycle completed. Waiting 30 seconds before next round..."
    sleep 30
done
