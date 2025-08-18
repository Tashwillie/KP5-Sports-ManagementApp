#!/bin/bash

# =============================================================================
# KP5 Academy Environment Setup Script
# =============================================================================
# This script helps you set up environment files for all parts of the application

echo "🚀 Setting up KP5 Academy environment files..."

# Create backend .env file
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env from env.example..."
    cp backend/env.example backend/.env
    echo "✅ Backend .env file created"
    echo "⚠️  Remember to update backend/.env with your actual values!"
else
    echo "ℹ️  backend/.env already exists, skipping..."
fi

# Create web app .env.local file
if [ ! -f "web/.env.local" ]; then
    echo "📝 Creating web/.env.local from env.example..."
    cp web/env.example web/.env.local
    echo "✅ Web app .env.local file created"
    echo "⚠️  Remember to update web/.env.local with your actual values!"
else
    echo "ℹ️  web/.env.local already exists, skipping..."
fi

# Create mobile app .env file
if [ ! -f "mobile/.env" ]; then
    echo "📝 Creating mobile/.env from env.example..."
    cp mobile/env.example mobile/.env
    echo "✅ Mobile app .env file created"
    echo "⚠️  Remember to update mobile/.env with your actual values!"
else
    echo "ℹ️  mobile/.env already exists, skipping..."
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update backend/.env with your database and JWT secrets"
echo "2. Update web/.env.local with your API keys and configuration"
echo "3. Update mobile/.env with your Expo and API configuration"
echo "4. Never commit .env files to version control!"
echo ""
echo "🔐 Your JWT secrets are already set in backend/.env"
echo "🌐 Use the master env.example file as a reference for all variables"
