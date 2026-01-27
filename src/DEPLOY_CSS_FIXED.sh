#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "   THE CPS PUNISHER - DEPLOYMENT SCRIPT (CSS FIXED)"
echo "   Copyright © 2024 DARREN GUAY"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Color codes for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Step 1: Cleaning previous builds...${NC}"
rm -rf node_modules
rm -rf dist
rm -f package-lock.json
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

echo -e "${BLUE}📦 Step 2: Installing dependencies with fixed versions...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Installation failed. Please check your internet connection.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

echo -e "${BLUE}🏗️  Step 3: Building application with CSS processing...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed. Check the error messages above.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Build completed successfully${NC}"
echo ""

echo -e "${BLUE}🔍 Step 4: Verifying CSS files were generated...${NC}"
if [ -d "dist/assets" ]; then
    CSS_COUNT=$(find dist/assets -name "*.css" | wc -l)
    if [ $CSS_COUNT -gt 0 ]; then
        echo -e "${GREEN}✓ Found $CSS_COUNT CSS file(s) in build${NC}"
        echo -e "${GREEN}✓ CSS is properly compiled!${NC}"
    else
        echo -e "${RED}✗ No CSS files found in build. Something went wrong.${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ Build directory not found${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}🖥️  Step 5: Testing build locally...${NC}"
echo -e "${YELLOW}Starting preview server...${NC}"
echo -e "${YELLOW}Press Ctrl+C when you're done testing${NC}"
echo -e "${YELLOW}Check that CSS loads correctly in your browser${NC}"
echo ""
npm run preview &
PREVIEW_PID=$!
sleep 3
echo ""
echo -e "${GREEN}✓ Preview server started at http://localhost:4173${NC}"
echo -e "${GREEN}✓ Open this URL in your browser to verify CSS loads${NC}"
echo ""

# Wait for user to press Ctrl+C
wait $PREVIEW_PID 2>/dev/null

echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Build verification complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps to deploy to Vercel:${NC}"
echo ""
echo "Option 1 - Vercel CLI:"
echo "  npm install -g vercel"
echo "  vercel login"
echo "  vercel --prod"
echo ""
echo "Option 2 - Vercel Dashboard:"
echo "  1. Go to https://vercel.com"
echo "  2. Click 'Add New' → 'Project'"
echo "  3. Import your repository"
echo "  4. Click 'Deploy'"
echo ""
echo "Option 3 - GitHub (if connected to Vercel):"
echo "  git add ."
echo "  git commit -m 'Fixed CSS - ready to deploy'"
echo "  git push origin main"
echo ""
echo -e "${BLUE}Custom Domain Setup:${NC}"
echo "  After deployment, go to:"
echo "  Settings → Domains → Add 'cpspunisher.com'"
echo ""
echo "═══════════════════════════════════════════════════════════"
echo -e "${GREEN}The CPS Punisher is ready to deploy! 🛡️⚖️${NC}"
echo "═══════════════════════════════════════════════════════════"
