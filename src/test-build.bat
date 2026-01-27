@echo off
echo Testing CSS compilation...
echo.

REM Build the project
call npm run build

REM Check if CSS files were created
dir /b dist\assets\*.css >nul 2>&1
if errorlevel 1 (
    echo.
    echo ❌ ERROR: No CSS files found!
    echo Something went wrong with the build.
    pause
    exit /b 1
) else (
    echo.
    echo ✅ SUCCESS! CSS files were generated:
    dir /b dist\assets\*.css
    echo.
    echo Your build is ready to deploy!
    echo.
    echo Next: Deploy to Vercel
    echo   vercel --prod
    echo.
    pause
)
