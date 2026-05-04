#!/bin/bash

# Build Next.js for Production

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$PROJECT_DIR"

# Install dependencies
echo "Installing Node.js dependencies..."
npm ci --production=false

# Build Next.js
echo "Building Next.js for production..."
npm run build

echo "✓ Next.js build complete"
