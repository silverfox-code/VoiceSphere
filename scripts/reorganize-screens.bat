@echo off
echo ============================================================================
echo Screen Folder Reorganization
echo ============================================================================
echo.
echo This script will reorganize your screens into a professional structure.
echo.
echo Press any key to continue or Ctrl+C to cancel...
pause >nul
echo.

PowerShell -ExecutionPolicy Bypass -File "%~dp0reorganize-screens.ps1"

echo.
echo Press any key to exit...
pause >nul
