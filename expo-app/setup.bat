@echo off
REM Quick setup script for CheXpert Mobile App (Windows)

echo 🚀 Setting up CheXpert Mobile App...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js found: %NODE_VERSION%

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✅ npm found: %NPM_VERSION%

echo.
echo 📦 Installing dependencies...
call npm install

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ✅ Setup complete!
echo.
echo 📱 To start the development server:
echo    npm start
echo.
echo 🤖 To run on Android:
echo    npm run android
echo.
echo 🌐 To run on web:
echo    npm run web
echo.
echo ⚠️  Don't forget to:
echo    1. Start the Python backend: python backend/cheXpert.py
echo    2. Update API_URL in screens/HomeScreen.js with your machine's IP
echo.
pause
