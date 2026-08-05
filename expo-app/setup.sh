#!/bin/bash
# Quick setup script for CheXpert Mobile App

echo "🚀 Setting up CheXpert Mobile App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm found: $(npm --version)"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo ""
    echo "⚠️  Expo CLI is not installed globally."
    echo "Installing Expo CLI locally (you can use: npx expo start)"
    npm install --save-dev expo-cli
else
    echo "✅ Expo CLI found: $(expo --version)"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📱 To start the development server:"
echo "   npm start"
echo ""
echo "🤖 To run on Android:"
echo "   npm run android"
echo ""
echo "🍎 To run on iOS:"
echo "   npm run ios"
echo ""
echo "🌐 To run on web:"
echo "   npm run web"
echo ""
echo "⚠️  Don't forget to:"
echo "   1. Start the Python backend: python backend/cheXpert.py"
echo "   2. Update API_URL in screens/HomeScreen.js with your machine's IP"
echo ""
