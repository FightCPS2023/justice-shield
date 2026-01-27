#!/bin/bash

# ================================================================
# VERCEL DEPLOYMENT SCRIPT - THE CPS PUNISHER
# ================================================================
# Deploys to Vercel with production optimizations
# Author: DARREN GUAY
# Date: January 7, 2026
# ================================================================

set -e  # Exit on any error

echo "🚀 Starting deployment to Vercel..."
echo ""

# ================================================================
# STEP 1: Pre-deployment checks
# ================================================================
echo "✅ Step 1/6: Running pre-deployment checks..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
fi

# Check if vercel.json exists and is configured correctly
if [ ! -f "vercel.json" ]; then
    echo "❌ ERROR: vercel.json not found!"
    exit 1
fi

# Verify outputDirectory is set
if ! grep -q '"outputDirectory": "dist"' vercel.json; then
    echo "❌ ERROR: vercel.json missing outputDirectory configuration!"
    exit 1
fi

echo "✅ Pre-deployment checks passed!"
echo ""

# ================================================================
# STEP 2: Clean previous builds
# ================================================================
echo "✅ Step 2/6: Cleaning previous builds..."

# Remove old build artifacts
rm -rf dist
rm -rf .vercel
rm -rf node_modules/.vite

echo "✅ Cleaned successfully!"
echo ""

# ================================================================
# STEP 3: Install dependencies (fresh)
# ================================================================
echo "✅ Step 3/6: Installing fresh dependencies..."

npm install --legacy-peer-deps

echo "✅ Dependencies installed!"
echo ""

# ================================================================
# STEP 4: Build locally to verify
# ================================================================
echo "✅ Step 4/6: Building application locally..."

# Run build
npm run build

# Check if dist folder was created
if [ ! -d "dist" ]; then
    echo "❌ ERROR: Build failed - dist folder not created!"
    exit 1
fi

# Check if index.html exists in dist
if [ ! -f "dist/index.html" ]; then
    echo "❌ ERROR: Build failed - dist/index.html not found!"
    exit 1
fi

echo "✅ Local build successful!"
echo "✅ Build artifacts created in ./dist/"
echo ""

# ================================================================
# STEP 5: Check Vercel CLI
# ================================================================
echo "✅ Step 5/6: Checking Vercel CLI..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI ready!"
echo ""

# ================================================================
# STEP 6: Deploy to Vercel
# ================================================================
echo "✅ Step 6/6: Deploying to Vercel..."
echo ""
echo "📦 Build info:"
echo "  - Framework: Vite + React"
echo "  - Output directory: dist"
echo "  - Build command: npm run build"
echo ""

# Ask user for deployment type
read -p "Deploy to production? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🚀 Deploying to PRODUCTION..."
    vercel --prod
else
    echo "🧪 Deploying to PREVIEW (development)..."
    vercel
fi

echo ""
echo "================================================================"
echo "🎉 DEPLOYMENT COMPLETE!"
echo "================================================================"
echo ""
echo "✅ Next steps:"
echo "  1. Visit your deployment URL"
echo "  2. Test all core features"
echo "  3. Verify demo access code works (CPSPUNISHER2024)"
echo "  4. Test on mobile device"
echo "  5. Monitor for any errors"
echo ""
echo "📊 Deployment files:"
echo "  - Build output: ./dist/"
echo "  - Vercel config: ./vercel.json"
echo "  - Vite config: ./vite.config.ts"
echo ""
echo "🔑 Don't forget to add environment variables in Vercel dashboard:"
echo "  - VITE_SUPABASE_URL"
echo "  - VITE_SUPABASE_ANON_KEY"
echo "  - VITE_GEMINI_API_KEY (optional)"
echo "  - VITE_STRIPE_PUBLISHABLE_KEY (optional)"
echo ""
echo "================================================================"
