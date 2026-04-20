#!/bin/bash

# Quick Start Upload Script for Aadikara Property
# This script sets up and runs the property upload

echo "🚀 Real Estate - Property Upload Script"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "backend/upload-aadikara-property.js" ]; then
    echo "❌ Error: Script not found in backend/ directory"
    echo "Please run this from the project root: d:\Real-Estate"
    exit 1
fi

# Check if images exist
echo "📁 Checking for images..."
if [ ! -f "frontend/src/assets/temp/img1.jpeg" ]; then
    echo "⚠️  Warning: img1.jpeg not found"
fi
if [ ! -f "frontend/src/assets/temp/img2.jpeg" ]; then
    echo "⚠️  Warning: img2.jpeg not found"
fi
if [ ! -f "frontend/src/assets/temp/img3.jpeg" ]; then
    echo "⚠️  Warning: img3.jpeg not found"
fi
echo ""

# Check if .env exists
if [ ! -f "backend/.env" ]; then
    echo "❌ Error: backend/.env file not found"
    echo "Please set up Firebase credentials in backend/.env"
    echo ""
    echo "Required variables:"
    echo "  FIREBASE_PROJECT_ID"
    echo "  FIREBASE_PRIVATE_KEY"
    echo "  FIREBASE_PRIVATE_KEY_ID"
    echo "  FIREBASE_CLIENT_EMAIL"
    echo "  FIREBASE_CLIENT_ID"
    echo "  FIREBASE_STORAGE_BUCKET"
    exit 1
fi

echo "✅ Prerequisites check passed!"
echo ""
echo "📝 Property Details:"
echo "  • Project: Aadikara Avenue"
echo "  • Location: Atladra, Vadodara"
echo "  • Units: 2 BHK (665-860 sq ft) & Shops (197-261 sq ft)"
echo ""

# Change to backend directory and run the script
cd backend
echo "🔄 Starting upload..."
echo ""
node upload-aadikara-property.js

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "✨ Upload completed successfully!"
    echo "Check Firebase Console to verify the property was created."
else
    echo ""
    echo "❌ Upload failed. Please check the error messages above."
    exit 1
fi
