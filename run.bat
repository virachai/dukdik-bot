@echo off
title Dukdik Bot - Full Cycle Run
echo 🚀 Starting Dukdik Bot Full Cycle Setup...

:: 1. Check for .env file
if not exist .env (
    echo 📄 .env file not found. Creating from .env.example...
    copy .env.example .env
    echo ⚠️  Please update your .env with actual LINE and Google Form secrets!
)

:: 2. Install dependencies
echo 📦 Installing dependencies...
call npm install

:: 3. Build check
echo 🏗️ Checking build...
call npm run build

:: 4. Run everything
echo 🔥 Starting NestJS server and Cloudflare Tunnel concurrently...
echo --------------------------------------------------------
echo 💡 TIP: Look for the ".trycloudflare.com" URL in the logs below.
echo 💡 Then add /webhook/line to that URL in your LINE Console.
echo --------------------------------------------------------

npm run dev:all
