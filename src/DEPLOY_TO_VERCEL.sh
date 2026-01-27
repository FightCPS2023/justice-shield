#!/bin/bash

# ==============================================================================
# CPS Punisher - Vercel Deployment Script
# Copyright © 2024 DARREN GUAY. All Rights Reserved.
# ==============================================================================

echo "======================================"
echo "CPS Punisher - Vercel Deployment"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null
then
    echo -e "${YELLOW}Vercel CLI not found. Installing...${NC}"
    npm install -g vercel
    echo -e "${GREEN}✓ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✓ Vercel CLI already installed${NC}"
fi

echo ""
echo "======================================"
echo "Step 1: Login to Vercel"
echo "======================================"
vercel login

echo ""
echo "======================================"
echo "Step 2: Deploy to Vercel"
echo "======================================"
echo ""
echo "Choose deployment type:"
echo "1) Preview Deployment (test first)"
echo "2) Production Deployment"
echo ""
read -p "Enter choice [1 or 2]: " deployment_choice

if [ "$deployment_choice" = "1" ]; then
    echo ""
    echo -e "${YELLOW}Deploying to preview...${NC}"
    vercel
elif [ "$deployment_choice" = "2" ]; then
    echo ""
    echo -e "${YELLOW}Deploying to production...${NC}"
    vercel --prod
else
    echo -e "${RED}Invalid choice. Running preview deployment...${NC}"
    vercel
fi

echo ""
echo "======================================"
echo "Step 3: Environment Variables"
echo "======================================"
echo ""
echo "Do you need to add environment variables?"
echo "Required variables:"
echo "  - VITE_SUPABASE_URL"
echo "  - VITE_SUPABASE_ANON_KEY"
echo "  - VITE_GEMINI_API_KEY"
echo "  - VITE_STRIPE_PUBLISHABLE_KEY"
echo ""
read -p "Add environment variables now? [y/N]: " add_env

if [ "$add_env" = "y" ] || [ "$add_env" = "Y" ]; then
    echo ""
    echo "Adding VITE_SUPABASE_URL..."
    vercel env add VITE_SUPABASE_URL
    
    echo ""
    echo "Adding VITE_SUPABASE_ANON_KEY..."
    vercel env add VITE_SUPABASE_ANON_KEY
    
    echo ""
    echo "Adding VITE_GEMINI_API_KEY..."
    vercel env add VITE_GEMINI_API_KEY
    
    echo ""
    echo "Adding VITE_STRIPE_PUBLISHABLE_KEY..."
    vercel env add VITE_STRIPE_PUBLISHABLE_KEY
    
    echo ""
    echo -e "${GREEN}✓ Environment variables added${NC}"
    echo ""
    echo -e "${YELLOW}Redeploying with new environment variables...${NC}"
    vercel --prod
else
    echo -e "${YELLOW}Skipping environment variables. Add them later via:${NC}"
    echo "  vercel env add VARIABLE_NAME"
    echo "or through Vercel Dashboard"
fi

echo ""
echo "======================================"
echo "Step 4: Custom Domain"
echo "======================================"
echo ""
read -p "Add custom domain cpspunisher.com now? [y/N]: " add_domain

if [ "$add_domain" = "y" ] || [ "$add_domain" = "Y" ]; then
    echo ""
    echo "Adding cpspunisher.com..."
    vercel domains add cpspunisher.com
    
    echo ""
    echo "Adding www.cpspunisher.com..."
    vercel domains add www.cpspunisher.com
    
    echo ""
    echo -e "${GREEN}✓ Domains added${NC}"
    echo ""
    echo -e "${YELLOW}IMPORTANT: Configure DNS records at your domain registrar:${NC}"
    echo ""
    echo "For cpspunisher.com:"
    echo "  Type: A"
    echo "  Name: @"
    echo "  Value: 76.76.21.21"
    echo ""
    echo "For www.cpspunisher.com:"
    echo "  Type: CNAME"
    echo "  Name: www"
    echo "  Value: cname.vercel-dns.com"
    echo ""
else
    echo -e "${YELLOW}Skipping domain setup. Add later via:${NC}"
    echo "  vercel domains add cpspunisher.com"
    echo "or through Vercel Dashboard"
fi

echo ""
echo "======================================"
echo "Deployment Complete!"
echo "======================================"
echo ""
echo -e "${GREEN}✓ Your app is deployed!${NC}"
echo ""
echo "Next steps:"
echo "1. Configure DNS records (if you added domain)"
echo "2. Update Supabase Site URL and Redirect URLs"
echo "3. Test your deployment"
echo "4. Monitor at: https://vercel.com/dashboard"
echo ""
echo "For detailed instructions, see: VERCEL_DEPLOYMENT_GUIDE.md"
echo ""
echo "======================================"
echo "CPS Punisher - Ready to Fight!"
echo "======================================"
