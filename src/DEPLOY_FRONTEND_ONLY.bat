@echo off
REM ==============================================================================
REM CPS Punisher - Vercel Frontend Deployment ONLY (No Edge Functions)
REM Copyright (C) 2024 DARREN GUAY. All Rights Reserved.
REM ==============================================================================

echo ======================================
echo CPS Punisher - Frontend Deployment
echo (Skipping Edge Functions)
echo ======================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo [INFO] Vercel CLI not found. Installing...
    call npm install -g vercel
    echo [SUCCESS] Vercel CLI installed
) else (
    echo [SUCCESS] Vercel CLI already installed
)

echo.
echo ======================================
echo Step 1: Login to Vercel
echo ======================================
call vercel login

echo.
echo ======================================
echo Step 2: Deploy Frontend to Production
echo ======================================
echo.
echo [INFO] Deploying to Vercel...
call vercel --prod

echo.
echo ======================================
echo Step 3: Add Environment Variables
echo ======================================
echo.
echo [INFO] Adding required environment variables...
echo.

echo Adding VITE_SUPABASE_URL...
echo When prompted, paste: https://rewgkrgmcmikivxjnfdq.supabase.co
call vercel env add VITE_SUPABASE_URL

echo.
echo Adding VITE_SUPABASE_ANON_KEY...
echo When prompted, paste the full anon key from ENVIRONMENT_VARIABLES_STATUS.md
call vercel env add VITE_SUPABASE_ANON_KEY

echo.
echo Adding VITE_GEMINI_API_KEY...
echo When prompted, paste: AIzaSyCq4oz9bOt7CadY4dgDpQqcwnXFoIRtB54
call vercel env add VITE_GEMINI_API_KEY

echo.
echo Adding VITE_STRIPE_PUBLISHABLE_KEY...
echo When prompted, paste your Stripe publishable key from dashboard.stripe.com/apikeys
call vercel env add VITE_STRIPE_PUBLISHABLE_KEY

echo.
echo [SUCCESS] Environment variables added!
echo.
echo [INFO] Redeploying with new environment variables...
call vercel --prod

echo.
echo ======================================
echo Step 4: Add Custom Domain
echo ======================================
echo.
set /p add_domain="Add custom domain cpspunisher.com now? [y/N]: "

if /i "%add_domain%"=="y" (
    echo.
    echo Adding cpspunisher.com...
    call vercel domains add cpspunisher.com
    
    echo.
    echo Adding www.cpspunisher.com...
    call vercel domains add www.cpspunisher.com
    
    echo.
    echo [SUCCESS] Domains added!
    echo.
    echo ======================================
    echo IMPORTANT: Configure DNS Records
    echo ======================================
    echo.
    echo Login to your domain registrar and add these DNS records:
    echo.
    echo A RECORD (for cpspunisher.com):
    echo   Type:  A
    echo   Name:  @ (or leave blank)
    echo   Value: 76.76.21.21
    echo   TTL:   3600
    echo.
    echo CNAME RECORD (for www.cpspunisher.com):
    echo   Type:  CNAME
    echo   Name:  www
    echo   Value: cname.vercel-dns.com
    echo   TTL:   3600
    echo.
    echo See DNS_SETUP_GUIDE.md for detailed instructions
    echo.
) else (
    echo [INFO] Skipping domain setup. You can add it later via:
    echo   vercel domains add cpspunisher.com
)

echo.
echo ======================================
echo Deployment Complete!
echo ======================================
echo.
echo [SUCCESS] Your frontend is deployed to Vercel!
echo.
echo Next Steps:
echo 1. Configure DNS records (if you added domain)
echo 2. Go to https://supabase.com/dashboard
echo    - Settings - API - Site URL: https://cpspunisher.com
echo    - Add redirect URLs (see FIX_403_DEPLOYMENT_ERROR.md)
echo 3. Test your deployment
echo 4. Monitor at: https://vercel.com/dashboard
echo.
echo [NOTE] Edge Functions (403 error) can be deployed later
echo        See: FIX_403_DEPLOYMENT_ERROR.md for instructions
echo.
echo ======================================
echo CPS Punisher - Ready to Fight!
echo ======================================
echo.
pause
