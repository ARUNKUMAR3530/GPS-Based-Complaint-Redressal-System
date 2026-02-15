@echo off
setlocal

echo ==========================================
echo   Complaint Redressal System - Launcher
echo ==========================================

:: Force Java 17 Path if exists
if exist "C:\Program Files\Java\jdk-17.0.12" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-17.0.12"
    set "PATH=%JAVA_HOME%\bin;%PATH%"
    echo [INFO] Set JAVA_HOME to %JAVA_HOME%
)

:: Check Java
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Java is not installed or not in PATH.
    echo Please install JDK 17 or newer.
    exit /b 1
) else (
    echo [OK] Java found.
)

:: Check Maven
set "MVN_CMD=mvn"
call mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Global Maven not found. Checking for Maven Wrapper...
    if exist "backend\mvnw.cmd" (
        echo [OK] Maven Wrapper found. Using mvnw.
        set "MVN_CMD=mvnw"
    ) else (
        echo [ERROR] Maven is not installed and Wrapper is missing.
        echo Please install Apache Maven.
        exit /b 1
    )
) else (
    echo [OK] Maven found.
)

:: Check Node.js
call node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js LTS.
    exit /b 1
) else (
    echo [OK] Node.js found.
)

echo.
echo All tools found! Starting services...
echo.

:: Start Backend in new window
echo Starting Backend...
start "Backend (Spring Boot)" cmd /k "cd backend && %MVN_CMD% spring-boot:run"

:: Wait for backend to initialize (approx 15 seconds)
echo Waiting for backend to start...
timeout /t 10 >nul

:: Start Frontend in new window
echo Starting Frontend...
start "Frontend (React)" cmd /k "cd frontend && npm run dev"

echo.
echo ==========================================
echo   Project Started!
echo   Backend running on: http://localhost:8080
echo   Frontend running on: http://localhost:5173 (or similar)
echo ==========================================

