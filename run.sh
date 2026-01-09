#!/bin/bash

# Dukdik Bot - Full Cycle Run Script
# This script automates installation, config check, and running the service.

echo "🚀 Starting Dukdik Bot Full Cycle Setup..."

# 1. Check for required tools
command -v node >/dev/null 2>&1 || { echo >&2 "❌ Node.js is required but not installed. Aborting."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "❌ npm is required but not installed. Aborting."; exit 1; }
command -v cloudflared >/dev/null 2>&1 || { echo >&2 "⚠️ cloudflared not found. Tunneling will fail but server will start."; }

# 2. Check for .env file
if [ ! -f .env ]; then
    echo "📄 .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "⚠️  Please update your .env with actual LINE and Google Form secrets!"
fi

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Build check (optional but recommended)
echo "🏗️ Checking build..."
npm run build

# 5. Run everything
echo "🔥 Starting NestJS server and Cloudflare Tunnel concurrently..."
echo "--------------------------------------------------------"
echo "💡 TIP: Look for the '.trycloudflare.com' URL in the logs below."
echo "💡 Then add /webhook/line to that URL in your LINE Console."
echo "--------------------------------------------------------"

npm run dev:all
