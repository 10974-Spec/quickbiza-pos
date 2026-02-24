#!/usr/bin/env bash
# build-win.sh — Build Windows .exe installer with correct sqlite3 binary
# Run this script from the project root: bash build-win.sh

set -e

SQLITE_NODE_PATH="backend/node_modules/better-sqlite3/build/Release/better_sqlite3.node"
WIN_PREBUILD="backend/prebuilds/win32-x64/better_sqlite3.node"
LINUX_PREBUILD="backend/prebuilds/linux-x64/better_sqlite3.node"

echo "🔧 Saving Linux binary backup..."
cp "$SQLITE_NODE_PATH" "$LINUX_PREBUILD"

echo "🪟  Injecting Windows sqlite3 binary..."
cp "$WIN_PREBUILD" "$SQLITE_NODE_PATH"

echo "📦 Building Windows NSIS installer..."
rm -rf dist-electron
npx electron-builder --win

echo "🐧 Restoring Linux binary..."
cp "$LINUX_PREBUILD" "$SQLITE_NODE_PATH"

echo "✅ Windows installer built. Files in dist-electron/"
ls -lh dist-electron/*.exe 2>/dev/null
