@echo off
cd /d "%~dp0"
echo Starting Apartment Visitor Management System...
if not exist node_modules (
  echo Installing required packages...
  call npm install
)
call npm start
pause
