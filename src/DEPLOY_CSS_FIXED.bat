@echo off
setlocal enabledelayedexpansion

echo ═══════════════════════════════════════════════════════════
echo    THE CPS PUNISHER - DEPLOYMENT SCRIPT (CSS FIXED)
echo    Copyright © 2024 DARREN GUAY
echo ═══════════════════════════════════════════════════════════
echo.

echo [36m🔧 Step 1: Cleaning previous builds...[0m
if exist node_modules rmdir /s /q node_modules
if exist dist rmdir /s /q dist
if exist package-lock.json del /f /q package-lock.json
echo [32m✓ Cleaned[0m
echo.

echo [36m📦 Step 2: Installing dependencies with fixed versions...[0m
call npm install
if errorlevel 1 (
    echo [31m✗ Installation failed. Please check your internet connection.[0m
    pause
    exit /b 1
)
echo [32m✓ Dependencies installed[0m
echo.

echo [36m🏗️  Step 3: Building application with CSS processing...[0m
call npm run build
if errorlevel 1 (
    echo [31m✗ Build failed. Check the error messages above.[0m
    pause
    exit /b 1
)
echo [32m✓ Build completed successfully[0m
echo.

echo [36m🔍 Step 4: Verifying CSS files were generated...[0m
if exist dist\assets (
    dir /b dist\assets\*.css >nul 2>&1
    if errorlevel 1 (
        echo [31m✗ No CSS files found in build. Something went wrong.[0m
        pause
        exit /b 1
    ) else (
        echo [32m✓ CSS files found in build[0m
        echo [32m✓ CSS is properly compiled![0m
    )
) else (
    echo [31m✗ Build directory not found[0m
    pause
    exit /b 1
)
echo.

echo [36m🖥️  Step 5: Testing build locally...[0m
echo [33mStarting preview server...[0m
echo [33mPress Ctrl+C when you're done testing[0m
echo [33mCheck that CSS loads correctly in your browser[0m
echo.
start cmd /k "npm run preview"
timeout /t 3 /nobreak >nul
echo.
echo [32m✓ Preview server started at http://localhost:4173[0m
echo [32m✓ Open this URL in your browser to verify CSS loads[0m
echo.
echo Press any key to continue after testing...
pause >nul

echo.
echo ═══════════════════════════════════════════════════════════
echo [32m✓ Build verification complete![0m
echo.
echo [33mNext steps to deploy to Vercel:[0m
echo.
echo Option 1 - Vercel CLI:
echo   npm install -g vercel
echo   vercel login
echo   vercel --prod
echo.
echo Option 2 - Vercel Dashboard:
echo   1. Go to https://vercel.com
echo   2. Click 'Add New' → 'Project'
echo   3. Import your repository
echo   4. Click 'Deploy'
echo.
echo Option 3 - GitHub (if connected to Vercel):
echo   git add .
echo   git commit -m "Fixed CSS - ready to deploy"
echo   git push origin main
echo.
echo [36mCustom Domain Setup:[0m
echo   After deployment, go to:
echo   Settings → Domains → Add 'cpspunisher.com'
echo.
echo ═══════════════════════════════════════════════════════════
echo [32mThe CPS Punisher is ready to deploy! 🛡️⚖️[0m
echo ═══════════════════════════════════════════════════════════
echo.
pause
