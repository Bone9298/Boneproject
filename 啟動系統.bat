@echo off
chcp 65001 >nul
REM UTF-8 encoding for Chinese characters

ECHO ========================================
ECHO FB Product Management System Starting...
ECHO ========================================

REM Check MariaDB Service
ECHO.
ECHO [1/3] Checking MariaDB service...
sc query MariaDB | find "RUNNING" >nul
IF %ERRORLEVEL% EQU 0 (
    ECHO [OK] MariaDB is running
) ELSE (
    ECHO [INFO] Starting MariaDB service...
    net start MariaDB
)

REM Start Flask API Server
ECHO.
ECHO [2/3] Starting Flask API server...
START "Flask API Server" cmd /c "python backend\app.py"
ECHO Waiting for API to start...
TIMEOUT /T 5 /NOBREAK >nul

REM Start Frontend HTTP Server
ECHO.
ECHO [3/3] Starting frontend server...
START "Frontend Server" cmd /c "python -m http.server 8000"
TIMEOUT /T 2 /NOBREAK >nul

REM Display info
ECHO.
ECHO ========================================
ECHO System Started Successfully!
ECHO ========================================
ECHO Flask API: http://localhost:5000/api/products
ECHO Frontend:  http://localhost:8000
ECHO ========================================
ECHO.
ECHO Opening browser...
start http://localhost:8000

PAUSE

