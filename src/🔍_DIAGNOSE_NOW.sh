#!/bin/bash

# ============================================================================
# CPS PUNISHER - DEPLOYMENT DIAGNOSTIC
# Run this to check if everything is set up correctly
# ============================================================================

echo "=========================================="
echo "  CPS PUNISHER DEPLOYMENT DIAGNOSTIC"
echo "=========================================="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null
then
    NODE_VERSION=$(node --version)
    echo "  ✅ Node.js installed: $NODE_VERSION"
else
    echo "  ❌ Node.js NOT installed!"
    echo "  → Install from: https://nodejs.org"
    exit 1
fi
echo ""

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null
then
    NPM_VERSION=$(npm --version)
    echo "  ✅ npm installed: $NPM_VERSION"
else
    echo "  ❌ npm NOT installed!"
    exit 1
fi
echo ""

# Check Vercel CLI
echo "✓ Checking Vercel CLI..."
if command -v vercel &> /dev/null
then
    VERCEL_VERSION=$(vercel --version)
    echo "  ✅ Vercel CLI installed: $VERCEL_VERSION"
else
    echo "  ❌ Vercel CLI NOT installed!"
    echo "  → Run: npm install -g vercel"
    exit 1
fi
echo ""

# Check if in project directory
echo "✓ Checking project files..."
if [ -f "package.json" ]; then
    echo "  ✅ package.json found"
else
    echo "  ❌ package.json NOT found!"
    echo "  → You're in the wrong directory"
    echo "  → Run: cd /path/to/cps-punisher"
    exit 1
fi

if [ -f "vercel.json" ]; then
    echo "  ✅ vercel.json found"
else
    echo "  ⚠️  vercel.json NOT found (optional)"
fi

if [ -f "vite.config.ts" ]; then
    echo "  ✅ vite.config.ts found"
else
    echo "  ❌ vite.config.ts NOT found!"
fi
echo ""

# Check node_modules
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  ✅ node_modules exists (dependencies installed)"
else
    echo "  ❌ node_modules NOT found!"
    echo "  → Run: npm install"
    exit 1
fi
echo ""

# Check environment variables
echo "✓ Checking Vercel environment variables..."
echo "  (This requires Vercel CLI to be logged in)"
echo ""
vercel env ls 2>/dev/null || echo "  ⚠️  Not logged in to Vercel or project not linked"
echo ""

# Summary
echo "=========================================="
echo "  DIAGNOSTIC COMPLETE"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. If all checks passed: Run 'vercel --prod'"
echo "2. If any checks failed: Fix them first"
echo ""
echo "Need help? Tell me which checks failed."
echo ""
