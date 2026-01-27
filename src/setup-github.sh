#!/bin/bash

# GitHub Setup Script for FIGHTCPS2023
# The CPS Punisher - Production Ready Deployment

echo "🚀 Setting up GitHub for The CPS Punisher..."
echo ""
echo "Username: FIGHTCPS2023"
echo "Repository: cps-punisher"
echo ""

# Configure Git
echo "📝 Configuring Git..."
read -p "Enter your email address: " EMAIL
git config --global user.name "FIGHT CPS 2023"
git config --global user.email "$EMAIL"

echo ""
echo "✅ Git configured!"
echo "   Name: $(git config --global user.name)"
echo "   Email: $(git config --global user.email)"
echo ""

# Initialize Git
echo "📦 Initializing Git repository..."
git init

# Add all files
echo "📂 Adding all files..."
git add .

# Commit
echo "💾 Creating initial commit..."
git commit -m "CPS Punisher - Production Ready v1.0"

# Add remote
echo "🔗 Connecting to GitHub..."
git remote add origin https://github.com/FIGHTCPS2023/cps-punisher.git

# Push
echo "🚀 Pushing to GitHub..."
echo ""
echo "⚠️  You will need to enter your GitHub credentials:"
echo "   Username: FIGHTCPS2023"
echo "   Password: Your Personal Access Token (NOT your GitHub password!)"
echo ""
echo "   Get token at: https://github.com/settings/tokens"
echo ""

git push -u origin main

# Check if push failed
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SUCCESS! Your code is on GitHub!"
    echo ""
    echo "👉 View at: https://github.com/FIGHTCPS2023/cps-punisher"
    echo ""
    echo "🎯 Next Steps:"
    echo "   1. ✅ Code on GitHub - Complete!"
    echo "   2. ⏳ Deploy to Vercel - https://vercel.com"
    echo "   3. ⏳ Add environment variables"
    echo "   4. ⏳ GO LIVE!"
else
    echo ""
    echo "❌ Push failed. Trying alternative method..."
    git branch -M main
    git push -u origin main
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ SUCCESS! Your code is on GitHub!"
        echo ""
        echo "👉 View at: https://github.com/FIGHTCPS2023/cps-punisher"
    else
        echo ""
        echo "⚠️  Manual steps needed:"
        echo "   1. Create repository at: https://github.com/new"
        echo "   2. Repository name: cps-punisher"
        echo "   3. Get Personal Access Token: https://github.com/settings/tokens"
        echo "   4. Try again: git push -u origin main"
    fi
fi
