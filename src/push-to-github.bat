@echo off
setlocal enabledelayedexpansion

:: The CPS Punisher - GitHub Push Script (Windows)
:: Simple automated script to push your app to GitHub

echo ================================================================
echo          THE CPS PUNISHER - GITHUB PUSH SCRIPT
echo ================================================================
echo.
echo Repository: https://github.com/FIGHTCPS2023/cps-punisher
echo Username: FIGHTCPS2023
echo.
echo ================================================================
echo.

:: Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git from: https://git-scm.com/download
    echo.
    pause
    exit /b 1
)

echo ✓ Git is installed
git --version
echo.

:: Configure Git
echo ================================================================
echo Step 1: Configure Git
echo ================================================================
echo.
set /p user_email="Enter your email address: "

git config --global user.name "FIGHT CPS 2023"
git config --global user.email "%user_email%"

echo.
echo ✓ Git configured!
for /f "delims=" %%i in ('git config --global user.name') do set username=%%i
for /f "delims=" %%i in ('git config --global user.email') do set useremail=%%i
echo   Name: %username%
echo   Email: %useremail%
echo.

:: Initialize Git repository
echo ================================================================
echo Step 2: Initialize Git Repository
echo ================================================================
echo.

if exist .git (
    echo ! Git repository already exists. Skipping initialization.
) else (
    git init
    echo ✓ Git repository initialized!
)

echo.

:: Add all files
echo ================================================================
echo Step 3: Add Files to Git
echo ================================================================
echo.

git add .
echo ✓ All files staged for commit!
echo.

:: Create commit
echo ================================================================
echo Step 4: Create Initial Commit
echo ================================================================
echo.

git commit -m "Initial commit - CPS Punisher Production Ready v1.0"
echo.
echo ✓ Initial commit created!
echo.

:: Add remote
echo ================================================================
echo Step 5: Connect to GitHub
echo ================================================================
echo.

:: Check if remote already exists
git remote | findstr /C:"origin" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo ! Remote 'origin' already exists. Removing and re-adding...
    git remote remove origin
)

git remote add origin https://github.com/FIGHTCPS2023/cps-punisher.git
echo ✓ Connected to GitHub repository!
echo.

:: Set main branch
echo ================================================================
echo Step 6: Set Main Branch
echo ================================================================
echo.

git branch -M main
echo ✓ Branch set to 'main'!
echo.

:: Push to GitHub
echo ================================================================
echo Step 7: Push to GitHub
echo ================================================================
echo.
echo ! AUTHENTICATION REQUIRED
echo.
echo When prompted, enter:
echo    Username: FIGHTCPS2023
echo    Password: [YOUR PERSONAL ACCESS TOKEN]
echo.
echo ! Use your Personal Access Token (NOT your GitHub password!)
echo    Get token at: https://github.com/settings/tokens
echo.
echo ================================================================
echo.

git push -u origin main

:: Check if push was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ================================================================
    echo                      ✓ SUCCESS!
    echo ================================================================
    echo.
    echo Your CPS Punisher app is now on GitHub!
    echo.
    echo View your repository at:
    echo    https://github.com/FIGHTCPS2023/cps-punisher
    echo.
    echo ================================================================
    echo NEXT STEPS:
    echo ================================================================
    echo.
    echo 1. ✓ Code on GitHub - COMPLETE!
    echo 2. ⏳ Deploy to Vercel: https://vercel.com
    echo 3. ⏳ Add environment variables in Vercel
    echo 4. ⏳ Connect domain: cpspunisher.com
    echo 5. ⏳ GO LIVE!
    echo.
    echo See /DEPLOYMENT_GUIDE.md for deployment instructions.
    echo.
    echo ================================================================
    echo.
    echo LET'S CHANGE LIVES!
    echo.
) else (
    echo.
    echo ================================================================
    echo                      ! PUSH FAILED
    echo ================================================================
    echo.
    echo Common issues:
    echo.
    echo 1. Repository doesn't exist
    echo    -^> Create it at: https://github.com/new
    echo    -^> Name: cps-punisher
    echo.
    echo 2. Authentication failed
    echo    -^> Use Personal Access Token (not password^)
    echo    -^> Get token: https://github.com/settings/tokens
    echo.
    echo 3. Remote already exists
    echo    -^> Run: git remote remove origin
    echo    -^> Then try again
    echo.
    echo See /GITHUB_PUSH_INSTRUCTIONS.md for detailed help.
    echo.
)

pause
