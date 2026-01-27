@echo off
REM ============================================================================
REM 🚀 CPS PUNISHER - AUTOMATED DEPLOYMENT SCRIPT (WINDOWS)
REM 
REM This script automates the deployment process:
REM 1. Commits all changes to Git
REM 2. Pushes to GitHub
REM 3. Deploys to Vercel production
REM
REM Usage: deploy.bat "your commit message"
REM Example: deploy.bat "added tier selection"
REM ============================================================================

setlocal enabledelayedexpansion

REM Default commit message
set "COMMIT_MSG=%~1"
if "%COMMIT_MSG%"=="" set "COMMIT_MSG=chore: update deployment"

echo.
echo ================================================================
echo      🚀 CPS PUNISHER - AUTOMATED DEPLOYMENT
echo ================================================================
echo.

REM Step 1: Check for changes
echo 📋 Step 1: Checking for changes...
git status --short
echo ✓ Status checked
echo.

REM Step 2: Git add
echo 📦 Step 2: Staging all changes...
git add .
echo ✓ All files staged
echo.

REM Step 3: Git commit
echo 💾 Step 3: Committing changes...
echo    Commit message: %COMMIT_MSG%
git commit -m "%COMMIT_MSG%"
if errorlevel 1 (
    echo ⚠ Nothing to commit or commit failed
) else (
    echo ✓ Changes committed
)
echo.

REM Step 4: Git push
echo ☁️  Step 4: Pushing to GitHub...
git push
if errorlevel 1 (
    echo ✗ Git push failed. Do you have a remote set up?
    echo    Run: git remote add origin https://github.com/YOUR_USERNAME/cps-punisher.git
    pause
    exit /b 1
)
echo ✓ Pushed to GitHub
echo.

REM Step 5: Check Vercel CLI
echo 🔧 Step 5: Checking Vercel CLI...
where vercel >nul 2>nul
if errorlevel 1 (
    echo ⚠ Vercel CLI not found. Installing...
    call npm install -g vercel
)
echo ✓ Vercel CLI ready
echo.

REM Step 6: Deploy to Vercel
echo 🚀 Step 6: Deploying to Vercel production...
echo    This may take 2-3 minutes...
echo.
call vercel --prod
if errorlevel 1 (
    echo ✗ Deployment failed
    pause
    exit /b 1
)
echo.

REM Success message
echo.
echo ================================================================
echo                 ✅ DEPLOYMENT SUCCESSFUL!
echo ================================================================
echo.
echo Your app is now live! 🎉
echo.
echo Next steps:
echo   1. Open your production URL
echo   2. Test the tier selection flow
echo   3. Verify all features work
echo   4. Share with users!
echo.
echo Need to check deployment status?
echo   → Run: vercel ls
echo   → Run: vercel logs
echo.
echo Happy deploying! 🚀
echo.

pause
