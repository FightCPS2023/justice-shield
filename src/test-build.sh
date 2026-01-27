#!/bin/bash

# Quick test script to verify CSS compiles correctly
# Run this before deploying to Vercel

echo "Testing CSS compilation..."
echo ""

# Build the project
npm run build

# Check if CSS files were created
if find dist/assets -name "*.css" | grep -q .; then
    echo ""
    echo "✅ SUCCESS! CSS files were generated:"
    find dist/assets -name "*.css" -exec basename {} \;
    echo ""
    echo "Your build is ready to deploy!"
    echo ""
    echo "Next: Deploy to Vercel"
    echo "  vercel --prod"
else
    echo ""
    echo "❌ ERROR: No CSS files found!"
    echo "Something went wrong with the build."
    exit 1
fi
