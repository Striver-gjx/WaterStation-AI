#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DESKTOP_DIR")"

echo "Building frontend for desktop mode..."
cd "$PROJECT_ROOT/admin-web"
VITE_API_BASE="http://localhost:18080" npx vite build --base=./ --mode production

rm -rf "$DESKTOP_DIR/frontend"
cp -r dist "$DESKTOP_DIR/frontend"

echo "Done: $(du -sh "$DESKTOP_DIR/frontend" | cut -f1)"
