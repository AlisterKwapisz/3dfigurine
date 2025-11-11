# GitHub Repository Setup Instructions

Since the GitHub CLI (`gh`) is not installed, please follow these steps to create a new GitHub repository and push your code:

## Option 1: Using GitHub Website (Recommended)

1. Go to [GitHub](https://github.com) and sign in
2. Click the "+" icon in the top right corner and select "New repository"
3. Enter repository details:
   - **Repository name**: `3d-silver-figurine` (or your preferred name)
   - **Description**: "Interactive 3D website featuring a realistic silver figurine with cursor tracking"
   - **Visibility**: Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
4. Click "Create repository"
5. Copy the remote repository URL (it will look like `https://github.com/YOUR_USERNAME/3d-silver-figurine.git`)
6. Run these commands in your terminal (replace the URL with your actual repository URL):

```bash
git remote add origin https://github.com/YOUR_USERNAME/3d-silver-figurine.git
git branch -M main
git push -u origin main
```

## Option 2: Using PowerShell Script

Alternatively, you can run the PowerShell script I've created (`push_to_github.ps1`) after creating the repository on GitHub:

```powershell
.\push_to_github.ps1
```

When prompted, enter your GitHub repository URL.

## Your Current Repository Status

✅ Git repository initialized
✅ Files committed with message: "Initial commit: 3D silver figurine with cursor tracking and realistic PBR shaders"
⏳ Waiting for remote repository to be created

## What's Included

- `index.html` - Main HTML file with Three.js setup
- `main.js` - 3D scene implementation with PBR shaders and cursor tracking
- `README.md` - Project documentation
- `.gitignore` - Git ignore configuration

