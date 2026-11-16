@echo off
echo ========================================================
echo   CivicSync Frontend Server (Vite + React)
echo ========================================================
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo [ERROR] node_modules not found. Please run npm install in frontend directory.
    pause
    exit /b 1
)

echo Starting Vite development server on http://localhost:5173...
npm run dev
pause
