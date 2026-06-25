#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DESKTOP_DIR="$(dirname "$SCRIPT_DIR")"
PROJECT_ROOT="$(dirname "$DESKTOP_DIR")"

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home}"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Building backend jar..."
cd "$PROJECT_ROOT/backend"
./mvnw clean package -DskipTests -q

mkdir -p "$DESKTOP_DIR/extraResources/backend"
cp target/waterstation-ai-1.0.0-SNAPSHOT.jar "$DESKTOP_DIR/extraResources/backend/waterstation.jar"

echo "Done: $(du -sh "$DESKTOP_DIR/extraResources/backend/waterstation.jar" | cut -f1)"
