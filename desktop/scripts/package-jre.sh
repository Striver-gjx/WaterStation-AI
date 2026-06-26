#!/bin/bash
set -e

# Package minimal JRE for each platform using jlink
# Requires: Java 21 JDK installed (JAVA_HOME set)

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$DESKTOP_DIR/extraResources/jre"

MODULES="java.base,java.sql,java.naming,java.management,java.instrument,java.logging,java.xml,java.security.jgss,java.net.http,java.compiler,java.desktop,jdk.unsupported,jdk.crypto.ec"

echo "=== Packaging Minimal JRE ==="
echo "Output: $OUTPUT_DIR"
echo ""

# Detect current platform JDK
JAVA_HOME="${JAVA_HOME:-$(/usr/libexec/java_home 2>/dev/null || echo '')}"
if [ -z "$JAVA_HOME" ]; then
  echo "Error: JAVA_HOME not set and cannot be detected"
  exit 1
fi

JLINK="$JAVA_HOME/bin/jlink"
if [ ! -f "$JLINK" ]; then
  echo "Error: jlink not found at $JLINK"
  echo "Make sure you have a full JDK (not JRE) installed"
  exit 1
fi

echo "Using JAVA_HOME: $JAVA_HOME"
echo "Using jlink: $JLINK"
echo ""

# Clean previous output
rm -rf "$OUTPUT_DIR"

# Build JRE for current platform (jlink requires output dir to not exist)
echo "Building minimal JRE for current platform..."
"$JLINK" \
  --add-modules "$MODULES" \
  --output "$OUTPUT_DIR" \
  --no-header-files \
  --no-man-pages \
  --strip-debug \
  --compress=zip-6

echo ""
echo "=== JRE packaged successfully ==="
echo "Size: $(du -sh "$OUTPUT_DIR" | cut -f1)"
echo ""
echo "Testing JRE..."
"$OUTPUT_DIR/bin/java" --version
echo ""
echo "Done!"
