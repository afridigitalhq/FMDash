#!/bin/bash
# --- Smart Deployment Prep for FMDash ---

# Create folders if they don’t exist
mkdir -p backup
mkdir -p release

log_file="deployment_log.txt"
echo "Deployment started at $(date)" > "$log_file"

# Map final scripts to backups
declare -A file_map=(
    ["combined-scripts-final.js"]="combined-scripts.js"
    ["dashboard.js"]="dashboard.js"
    ["inbox.js"]="inbox.js"
    ["full-summary.awk"]="full-summary.awk"
    ["full-summary.txt"]="full-summary.txt"
    ["script-block-summary.txt"]="script-block-summary.txt"
    ["script-summary.txt"]="script-summary.txt"
)

# Function to clean _2, _3, etc. suffixes from functions/variables
clean_script() {
    local input="$1"
    local output="$2"
    # Remove _<number> suffixes from function names
    sed -E 's/function ([a-zA-Z0-9_]+)_+[0-9]+/\1/g' "$input" | \
    # Remove _<number> from variable names like const var_2=
    sed -E 's/([a-zA-Z0-9]+)_+[0-9]+=/\1=/g' > "$output"
}

# Process each script
for final in "${!file_map[@]}"; do
    backup_file="backup/${file_map[$final]}"
    
    # Determine release filename (auto-rename final to original API name)
    if [ "$final" == "combined-scripts-final.js" ]; then
        release_file="release/combined-scripts.js"
    else
        release_file="release/$final"
    fi

    if [ -f "$final" ]; then
        echo -e "\n=== Processing $final ===" | tee -a "$log_file"

        # Clean the script and copy to release folder
        clean_script "$final" "$release_file"
        echo "Cleaned script copied to $release_file" | tee -a "$log_file"

        # Compare with backup if it exists
        if [ -f "$backup_file" ]; then
            echo "Differences with backup:" | tee -a "$log_file"
            diff_output=$(diff -u "$release_file" "$backup_file" 2>/dev/null | grep -E '^\+|^\-' | grep -vE '^\+\+\+|^\-\-\-')
            if [ -z "$diff_output" ]; then
                echo "No differences found" | tee -a "$log_file"
            else
                echo "$diff_output" | tee -a "$log_file"
            fi
        else
            echo "No backup found for $final" | tee -a "$log_file"
        fi
    else
        echo "⚠️  $final not found!" | tee -a "$log_file"
    fi
done

echo -e "\n✅ Deployment prep complete. Clean scripts are in 'release/'." | tee -a "$log_file"
echo "Backup folder remains unchanged."

