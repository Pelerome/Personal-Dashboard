# Quick Setup Guide

## Get Your Dashboard Syncing in 5 Minutes

### 1. Create GitHub Repository
- Go to [GitHub](https://github.com) and click "New repository"
- Name it: `personal-dashboard` (or any name you like)
- Make it **Public** or **Private** (your choice)
- **Don't** initialize with README, .gitignore, or license
- Click "Create repository"

### 2. Get Your GitHub Token
- Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
- Click "Generate new token (classic)"
- Name: `Dashboard Sync`
- Expiration: `No expiration` (or choose a date)
- Select scopes: ✅ `repo` (Full control of private repositories)
- Click "Generate token"
- **Copy the token** (starts with `ghp_`)

### 3. Configure Dashboard
- Open `index.html` in your browser
- Click the **GitHub** button in the header
- Fill in:
  - **Username**: Your GitHub username
  - **Repository**: The repository name you created
  - **Token**: The token you just copied
- Click "Save Configuration"

### 4. Test It!
- Add a category or item
- Check your GitHub repository - you should see a `dashboard-data.json` file
- Open the dashboard on another computer with the same settings
- Your data should sync automatically!

## Troubleshooting

**"GitHub connection failed"**
- Double-check your token has `repo` permissions
- Verify repository name is exactly correct (case-sensitive)
- Make sure the repository exists and you have access

**"Data not syncing"**
- Check browser console (F12) for error messages
- Try refreshing the page
- Verify the `dashboard-data.json` file exists in your GitHub repo

**Need to change settings?**
- Click the GitHub button again to reconfigure
- Your old settings will be pre-filled

## That's It!

Your dashboard will now automatically sync between all your computers. Every change you make will be saved to GitHub and available on any device with the same configuration. 