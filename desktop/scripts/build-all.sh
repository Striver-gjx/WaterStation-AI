#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DESKTOP_DIR")"

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"

echo "============================================"
echo "  WaterStation Desktop - Full Build"
echo "============================================"
echo ""

# Step 1: Build backend jar
echo "[1/5] Building backend jar..."
cd "$PROJECT_ROOT/backend"
./mvnw clean package -DskipTests -q
mkdir -p "$DESKTOP_DIR/extraResources/backend"
cp target/waterstation-ai-1.0.0-SNAPSHOT.jar "$DESKTOP_DIR/extraResources/backend/waterstation.jar"
echo "  -> Backend jar: $(du -sh "$DESKTOP_DIR/extraResources/backend/waterstation.jar" | cut -f1)"
echo ""

# Step 2: Build frontend
echo "[2/5] Building frontend..."
cd "$PROJECT_ROOT/admin-web"
VITE_API_BASE="http://localhost:18080" npm run build -- --mode production 2>/dev/null
mkdir -p "$DESKTOP_DIR/frontend"
rm -rf "$DESKTOP_DIR/frontend"
cp -r dist "$DESKTOP_DIR/frontend"
echo "  -> Frontend dist: $(du -sh "$DESKTOP_DIR/frontend" | cut -f1)"
echo ""

# Step 3: Build minimal JRE
echo "[3/5] Building minimal JRE..."
if [ -d "$DESKTOP_DIR/extraResources/jre" ]; then
  echo "  -> JRE already exists, skipping (delete extraResources/jre to rebuild)"
else
  bash "$SCRIPT_DIR/package-jre.sh"
fi
echo "  -> JRE size: $(du -sh "$DESKTOP_DIR/extraResources/jre" | cut -f1)"
echo ""

# Step 4: Install desktop dependencies
echo "[4/5] Installing desktop dependencies..."
cd "$DESKTOP_DIR"
npm install --quiet 2>/dev/null
echo ""

# Step 5: Build Electron app
echo "[5/5] Packaging Electron app..."
PLATFORM="${1:-mac}"
if [ "$PLATFORM" = "all" ]; then
  npm run build:all
elif [ "$PLATFORM" = "win" ]; then
  npm run build:win
else
  npm run build:mac
fi

echo ""
echo "============================================"
echo "  Build complete!"
echo "  Output: $DESKTOP_DIR/release/"
echo "============================================"
ls -lh "$DESKTOP_DIR/release/" 2>/dev/null || echo "  (check release/ directory)"
