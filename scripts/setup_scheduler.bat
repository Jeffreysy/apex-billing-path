@echo off
REM Creates a Windows Scheduled Task to run the LexCollect sync every 5 minutes
REM Run this script as Administrator

set SCRIPT_PATH=%~dp0sync_sharepoint.py
set PYTHON_PATH=python3

echo Creating scheduled task: LexCollect 5-Minute Sync
echo Script: %SCRIPT_PATH%
echo.

schtasks /create ^
  /tn "LexCollect\FiveMinuteSync" ^
  /tr "python3 \"%SCRIPT_PATH%\"" ^
  /sc MINUTE ^
  /mo 5 ^
  /st 00:00 ^
  /ru "%USERNAME%" ^
  /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Task created successfully!
    echo It will run every 5 minutes starting now.
    echo.
    echo To run it manually: schtasks /run /tn "LexCollect\FiveMinuteSync"
    echo To delete it: schtasks /delete /tn "LexCollect\FiveMinuteSync" /f
    echo To view it: schtasks /query /tn "LexCollect\FiveMinuteSync"
) else (
    echo.
    echo Failed to create task. Try running this script as Administrator.
)

pause
