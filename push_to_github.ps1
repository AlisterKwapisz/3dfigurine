# PowerShell script to push to GitHub
# Run this script after creating your GitHub repository

Write-Host "=== GitHub Push Script ===" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path .git)) {
    Write-Host "Error: Not a git repository!" -ForegroundColor Red
    exit 1
}

# Check current git status
Write-Host "Current git status:" -ForegroundColor Yellow
git status
Write-Host ""

# Prompt for GitHub repository URL
Write-Host "Please enter your GitHub repository URL" -ForegroundColor Green
Write-Host "Example: https://github.com/username/repo-name.git" -ForegroundColor Gray
$repoUrl = Read-Host "Repository URL"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "Error: Repository URL cannot be empty!" -ForegroundColor Red
    exit 1
}

# Check if origin already exists
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote 'origin' already exists: $remoteExists" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/n)"
    if ($overwrite -eq "y") {
        git remote remove origin
        Write-Host "Removed existing remote 'origin'" -ForegroundColor Green
    } else {
        Write-Host "Cancelled. Using existing remote." -ForegroundColor Yellow
        $repoUrl = $remoteExists
    }
}

# Add remote origin if it doesn't exist
if (-not (git remote get-url origin 2>$null)) {
    Write-Host "Adding remote origin: $repoUrl" -ForegroundColor Green
    git remote add origin $repoUrl
}

# Rename branch to main (if needed)
$currentBranch = git rev-parse --abbrev-ref HEAD
if ($currentBranch -ne "main") {
    Write-Host "Renaming branch from '$currentBranch' to 'main'..." -ForegroundColor Yellow
    git branch -M main
}

# Push to GitHub
Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "=== Success! ===" -ForegroundColor Green
    Write-Host "Your code has been pushed to GitHub!" -ForegroundColor Green
    Write-Host "Repository: $repoUrl" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "=== Push Failed ===" -ForegroundColor Red
    Write-Host "Please check the error message above and try again." -ForegroundColor Yellow
    Write-Host "Common issues:" -ForegroundColor Yellow
    Write-Host "  - Authentication: You may need to set up a Personal Access Token" -ForegroundColor Gray
    Write-Host "  - Repository doesn't exist on GitHub" -ForegroundColor Gray
    Write-Host "  - Wrong repository URL" -ForegroundColor Gray
}

