@echo off
echo ========================================================
echo   CivicSync Backend Server (Django REST Framework)
echo ========================================================
cd /d "%~dp0backend"

if not exist ".venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please run python -m venv backend/.venv
    pause
    exit /b 1
)

echo Activating virtual environment and starting server on http://127.0.0.1:8000...
.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
pause
