@echo off
echo ====================================
echo   GitHub Repository Creation Helper
echo ====================================
echo.
echo This script will help you push your code to a new GitHub repository.
echo.
echo STEP 1: Create a new repository on GitHub
echo -----------------------------------------
echo 1. Open your browser and go to: https://github.com/new
echo 2. Repository name: 3d-silver-figurine (or your choice)
echo 3. Description: Interactive 3D website featuring a realistic silver figurine
echo 4. Choose Public or Private
echo 5. DO NOT check "Initialize this repository with a README"
echo 6. Click "Create repository"
echo.
echo STEP 2: Copy your repository URL
echo ---------------------------------
echo After creating the repository, GitHub will show you a URL like:
echo https://github.com/YOUR_USERNAME/3d-silver-figurine.git
echo.
pause
echo.
set /p REPO_URL="Enter your GitHub repository URL: "
echo.
echo Adding remote repository...
git remote add origin %REPO_URL%
echo.
echo Renaming branch to main...
git branch -M main
echo.
echo Pushing to GitHub...
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo ====================================
    echo   SUCCESS!
    echo ====================================
    echo Your code has been pushed to GitHub!
    echo Repository: %REPO_URL%
) else (
    echo ====================================
    echo   ERROR
    echo ====================================
    echo Failed to push to GitHub.
    echo.
    echo Common issues:
    echo - Authentication: You may need a Personal Access Token
    echo - Repository doesn't exist on GitHub
    echo - Wrong repository URL
    echo.
    echo For authentication help, visit:
    echo https://docs.github.com/en/authentication
)
echo.
pause

