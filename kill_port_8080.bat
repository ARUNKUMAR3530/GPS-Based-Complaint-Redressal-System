@echo off
setlocal
echo Checking for process on port 8080...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    set PID=%%a
)

if "%PID%"=="" (
    echo No process found on port 8080.
) else (
    echo Killing process with PID: %PID%
    taskkill /F /PID %PID%
    echo Process killed.
)

pause
