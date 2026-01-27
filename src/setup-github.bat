@echo off
REM GitHub Setup Script for FIGHTCPS2023
REM The CPS Punisher - Production Ready Deployment

echo.
echo ========================================
echo   GITHUB SETUP - THE CPS PUNISHER
echo ========================================
echo.
echo Username: FIGHTCPS2023
echo Repository: cps-punisher
echo.

REM Configure Git
echo Configuring Git...
set /p EMAIL="Enter your email address: "
git config --global user.name "FIGHT CPS 2023"
git config --global user.email "%EMAIL%"

echo.
echo Git configured successfully!
git config --global user.name
git config --global user.email
echo.

REM Initialize Git
echo Initializing Git repository...
git init

REM Add all files
echo Adding all files...
git add .

REM Commit
echo Creating initial commit...
git commit -m "CPS Punisher - Production Ready v1.0"

REM Add remote
echo Connecting to GitHub...
git remote add origin https://github.com/FIGHTCPS2023/cps-punisher.git

REM Push
echo.
echo ========================================
echo   AUTHENTICATION REQUIRED
echo ========================================
echo.
echo You will need to enter:
echo   Username: FIGHTCPS2023
echo   Password: Your Personal Access Token
echo.
echo Get token at: https://github.com/settings/tokens
echo.
echo Pushing to GitHub...
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS!
    echo ========================================
    echo.
    echo Your code is on GitHub!
    echo.
    echo View at: https://github.com/FIGHTCPS2023/cps-punisher
    echo.
    echo Next Steps:
    echo   1. Deploy to Vercel - https://vercel.com
    echo   2. Add environment variables
    echo   3. GO LIVE!
    echo.
) else (
    echo.
    echo Trying alternative method...
    git branch -M main
    git push -u origin main
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo SUCCESS! Your code is on GitHub!
        echo View at: https://github.com/FIGHTCPS2023/cps-punisher
    ) else (
        echo.
        echo ========================================
        echo   MANUAL STEPS NEEDED
        echo ========================================
        echo.
        echo 1. Create repository at: https://github.com/new
        echo 2. Repository name: cps-punisher
        echo 3. Get Personal Access Token: https://github.com/settings/tokens
        echo 4. Run: git push -u origin main
        echo.
    )
)

pause
