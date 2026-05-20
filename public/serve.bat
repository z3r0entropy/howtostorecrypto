@echo off
:: Start a tiny local web server for the How to Store Crypto offline bundle.
setlocal
cd /d "%~dp0"
if "%PORT%"=="" set PORT=8000

echo Starting How to Store Crypto offline bundle on http://localhost:%PORT%/
echo Press Ctrl-C to stop.
echo.

start "" "http://localhost:%PORT%/"

where python3 >nul 2>&1
if %errorlevel% equ 0 (
  python3 -m http.server %PORT%
  goto :eof
)

where python >nul 2>&1
if %errorlevel% equ 0 (
  python -m http.server %PORT%
  goto :eof
)

where npx >nul 2>&1
if %errorlevel% equ 0 (
  npx --yes serve -l %PORT% .
  goto :eof
)

where php >nul 2>&1
if %errorlevel% equ 0 (
  php -S localhost:%PORT%
  goto :eof
)

echo No HTTP server runtime found.
echo Install one of: Python 3, Node.js (npx), or PHP, then re-run this script.
pause
