#!/bin/bash
set -e

# Download and extract Windows x64 JRE 21 from Adoptium, then jlink a minimal subset
# This script is for cross-platform building on macOS for Windows targets.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$DESKTOP_DIR/extraResources/jre-win-x64"
TEMP_DIR="/tmp/jre-win-download"

JDK_VERSION="21.0.6+7"
JDK_URL="https://mirrors.tuna.tsinghua.edu.cn/Adoptium/21/jdk/x64/windows/OpenJDK21U-jdk_x64_windows_hotspot_21.0.6_7.zip"

echo "=== Downloading Windows x64 JDK 21 ==="
echo "URL: $JDK_URL"
echo ""

rm -rf "$TEMP_DIR" "$OUTPUT_DIR"
mkdir -p "$TEMP_DIR"

echo "Downloading..."
curl -L -o "$TEMP_DIR/jdk-win.zip" "$JDK_URL"

echo "Extracting..."
cd "$TEMP_DIR"
unzip -q jdk-win.zip

JDK_DIR=$(ls -d "$TEMP_DIR"/jdk-* 2>/dev/null | head -1)
if [ -z "$JDK_DIR" ]; then
  echo "Error: Could not find extracted JDK directory"
  exit 1
fi

echo "Using extracted JDK: $JDK_DIR"

# Use the local macOS jlink with --module-path pointing to the Windows JDK modules
JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
JLINK="$JAVA_HOME/bin/jlink"

MODULES="java.base,java.sql,java.naming,java.management,java.instrument,java.logging,java.xml,java.security.jgss,java.net.http,java.compiler,java.desktop,jdk.unsupported,jdk.crypto.ec"

echo ""
echo "Building minimal Windows JRE with jlink..."
"$JLINK" \
  --module-path "$JDK_DIR/jmods" \
  --add-modules "$MODULES" \
  --output "$OUTPUT_DIR" \
  --no-header-files \
  --no-man-pages \
  --strip-debug \
  --compress=zip-6

echo ""
echo "=== Windows JRE packaged ==="
echo "Size: $(du -sh "$OUTPUT_DIR" | cut -f1)"
echo "Output: $OUTPUT_DIR"
echo ""

# Verify java.exe exists
if [ -f "$OUTPUT_DIR/bin/java.exe" ]; then
  echo "java.exe found - OK"
else
  echo "WARNING: java.exe not found in output!"
fi

rm -rf "$TEMP_DIR"
echo "Done!"
