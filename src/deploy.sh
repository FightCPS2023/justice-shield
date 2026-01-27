#!/bin/bash

################################################################################
# 🚀 CPS PUNISHER - AUTOMATED DEPLOYMENT SCRIPT
# 
# This script automates the deployment process:
# 1. Commits all changes to Git
# 2. Pushes to GitHub
# 3. Deploys to Vercel production
#
# Usage: bash deploy.sh "your commit message"
# Example: bash deploy.sh "added tier selection"
################################################################################

set -e  # Exit on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Default commit message
COMMIT_MSG=${1:-"chore: update deployment"}

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}     🚀 CPS PUNISHER - AUTOMATED DEPLOYMENT                    ${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"
echo ""

# Step 1: Check for uncommitted changes
echo -e "${YELLOW}📋 Step 1: Checking for changes...${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✓ Changes detected${NC}"
else
    echo -e "${YELLOW}⚠ No changes detected. Continuing anyway...${NC}"
fi
echo ""

# Step 2: Git add
echo -e "${YELLOW}📦 Step 2: Staging all changes...${NC}"
git add .
echo -e "${GREEN}✓ All files staged${NC}"
echo ""

# Step 3: Git commit
echo -e "${YELLOW}💾 Step 3: Committing changes...${NC}"
echo -e "${BLUE}   Commit message: ${COMMIT_MSG}${NC}"
git commit -m "$COMMIT_MSG" || echo -e "${YELLOW}⚠ Nothing to commit or commit failed${NC}"
echo ""

# Step 4: Git push
echo -e "${YELLOW}☁️  Step 4: Pushing to GitHub...${NC}"
git push || {
    echo -e "${RED}✗ Git push failed. Do you have a remote set up?${NC}"
    echo -e "${YELLOW}   Run: git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git${NC}"
    exit 1
}
echo -e "${GREEN}✓ Pushed to GitHub${NC}"
echo ""

# Step 5: Check if Vercel CLI is installed
echo -e "${YELLOW}🔧 Step 5: Checking Vercel CLI...${NC}"
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}⚠ Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
fi
echo -e "${GREEN}✓ Vercel CLI ready${NC}"
echo ""

# Step 6: Deploy to Vercel
echo -e "${YELLOW}🚀 Step 6: Deploying to Vercel production...${NC}"
echo -e "${BLUE}   This may take 2-3 minutes...${NC}"
echo ""
vercel --prod || {
    echo -e "${RED}✗ Deployment failed${NC}"
    exit 1
}
echo ""

# Success message
echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}                    ✅ DEPLOYMENT SUCCESSFUL!                    ${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Your app is now live! 🎉${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Open your production URL"
echo "  2. Test the tier selection flow"
echo "  3. Verify all features work"
echo "  4. Share with users!"
echo ""
echo -e "${BLUE}Need to check deployment status?${NC}"
echo "  → Run: vercel ls"
echo "  → Run: vercel logs"
echo ""
echo -e "${GREEN}Happy deploying! 🚀${NC}"
echo ""
