#!/bin/bash
# PM Office Intelligence Dashboard - Data Build Script
# Runs Python data processing pipeline before building the frontend

echo "🔄 Processing article data..."
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Run Python processor
python3 "$SCRIPT_DIR/process_articles.py"

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Data processing complete"
else
    echo ""
    echo "❌ Data processing failed"
    exit 1
fi
