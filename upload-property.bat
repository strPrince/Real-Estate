@echo off
REM Quick Start Upload Script for Aadikara Property (Windows)
REM This script sets up and runs the property upload

echo.
echo 🚀 Real Estate - Property Upload Script
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "backend\upload-aadikara-property.js" (
    echo ❌ Error: Script not found in backend\ directory
    echo Please run this from the project root: d:\Real-Estate
    pause
    exit /b 1
)

REM Check if images exist
echo 📁 Checking for images...
if not exist "frontend\src\assets\temp\img1.jpeg" (
    echo ⚠️  Warning: img1.jpeg not found
)
if not exist "frontend\src\assets\temp\img2.jpeg" (
    echo ⚠️  Warning: img2.jpeg not found
)
if not exist "frontend\src\assets\temp\img3.jpeg" (
    echo ⚠️  Warning: img3.jpeg not found
)
echo.

REM Check if .env exists
if not exist "backend\.env" (
    echo ❌ Error: backend\.env file not found
    echo Please set up Firebase credentials in backend\.env
    echo.
    echo Required variables:
    echo   FIREBASE_PROJECT_ID
    echo   FIREBASE_PRIVATE_KEY
    echo   FIREBASE_PRIVATE_KEY_ID
    echo   FIREBASE_CLIENT_EMAIL
    echo   FIREBASE_CLIENT_ID
    echo   FIREBASE_STORAGE_BUCKET
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed!
echo.
echo 📝 Property Details:
echo   • Project: Aadikara Avenue
echo   • Location: Atladra, Vadodara
echo   • Units: 2 BHK (665-860 sq ft) & Shops (197-261 sq ft)
echo.

REM Change to backend directory and run the script
cd backend
echo 🔄 Starting upload...
echo.

node upload-aadikara-property.js

REM Check exit code
if %errorlevel% equ 0 (
    echo.
    echo ✨ Upload completed successfully!
    echo Check Firebase Console to verify the property was created.
) else (
    echo.
    echo ❌ Upload failed. Please check the error messages above.
    pause
    exit /b 1
)
