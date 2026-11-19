@echo off
title Cybersecurity Incident System Starter
cd /d "%~dp0"

start "Vector Server (Port 5001)" cmd /k "python scripts/vector_server.py"
start "Next.js App (Port 3000)" cmd /k "npm run dev"

timeout /t 3 /nobreak >nul
start http://localhost:3000
