@echo off
REM ================================================================
REM VERCEL DEPLOYMENT SCRIPT - THE CPS PUNISHER (Windows)
REM ================================================================
REM Deploys to Vercel with production optimizations
REM Author: DARREN GUAY
REM Date: January 7, 2026
REM ================================================================

echo.
echo ================================================================
echo   VERCEL DEPLOYMENT SCRIPT - THE CPS PUNISHER
echo ================================================================
echo.

REM ================================================================
REM STEP 1: Pre-deployment checks
REM ================================================================
echo [1/6] Running pre-deployment checks...
echo.

if not exist "node_modules\" (
    echo WARNING: node_modules not found. Installing dependencies...
    call npm install
)

if not exist "vercel.json" (
    echo ERROR: vercel.json not found!
    pause
    exit /b 1
)

echo Pre-deployment checks passed!
echo.

REM ================================================================
REM STEP 2: Clean previous builds
REM ================================================================
echo [2/6] Cleaning previous builds...
echo.

if exist "dist\" rmdir /s /q "dist"
if exist ".vercel\" rmdir /s /q ".vercel"
if exist "node_modules\.vite\" rmdir /s /q "node_modules\.vite"

echo Cleaned successfully!
echo.

REM ================================================================
REM STEP 3: Install dependencies (fresh)
REM ================================================================
echo [3/6] Installing fresh dependencies...
echo.

call npm install --legacy-peer-deps

if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo Dependencies installed!
echo.

REM ================================================================
REM STEP 4: Build locally to verify
REM ================================================================
echo [4/6] Building application locally...
echo.

call npm run build

if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

if not exist "dist\index.html" (
    echo ERROR: Build failed - dist/index.html not found!
    pause
    exit /b 1
)

echo Local build successful!
echo Build artifacts created in ./dist/
echo.

REM ================================================================
REM STEP 5: Check Vercel CLI
REM ================================================================
echo [5/6] Checking Vercel CLI...
echo.

where vercel >nul 2>nul
if errorlevel 1 (
    echo WARNING: Vercel CLI not found. Installing...
    call npm install -g vercel
)

echo Vercel CLI ready!
echo.

REM ================================================================
REM STEP 6: Deploy to Vercel
REM ================================================================
echo [6/6] Deploying to Vercel...
echo.
echo Build info:
echo   - Framework: Vite + React
echo   - Output directory: dist
echo   - Build command: npm run build
echo.

set /p DEPLOY_PROD="Deploy to production? (y/n): "

if /i "%DEPLOY_PROD%"=="y" (
    echo.
    echo Deploying to PRODUCTION...
    call vercel --prod
) else (
    echo.
    echo Deploying to PREVIEW development...
    call vercel
)

echo.
echo ================================================================
echo   DEPLOYMENT COMPLETE!
echo ================================================================
echo.
echo Next steps:
echo   1. Visit your deployment URL
echo   2. Test all core features
echo   3. Verify demo access code works CPSPUNISHER2024
echo   4. Test on mobile device
echo   5. Monitor for any errors
echo.
echo Deployment files:
echo   - Build output: ./dist/
echo   - Vercel config: ./vercel.json
echo   - Vite config: ./vite.config.ts
echo.
echo Don't forget to add environment variables in Vercel dashboard:
echo   - VITE_SUPABASE_URL
echo   - VITE_SUPABASE_ANON_KEY
echo   - VITE_GEMINI_API_KEY optional
echo   - VITE_STRIPE_PUBLISHABLE_KEY optional
echo.
echo ================================================================
echo.
pause
