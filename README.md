# Personal Development Dashboard

A beautiful, modern dashboard for tracking your personal development progress across different learning categories. Features GitHub-based data synchronization for accessing your data from multiple computers.

## Features

- 📊 **Progress Tracking**: Monitor your learning progress across multiple categories
- 🔗 **Quick URL Addition**: Paste URLs to automatically categorize and add learning resources
- 🎨 **Beautiful UI**: Modern, responsive design with dark mode support
- 🔄 **Cross-Computer Sync**: Access your data from any computer using GitHub integration
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- ⚡ **Fast & Lightweight**: No complex backend required

## GitHub Integration Setup

To sync your dashboard data across multiple computers, you'll need to set up GitHub integration:

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `personal-development-dashboard` or `my-learning-tracker`
3. Make it public or private (your choice)
4. Don't initialize with README, .gitignore, or license

### Step 2: Create a GitHub Personal Access Token

1. Go to [GitHub Settings > Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "Dashboard Sync"
4. Select the following scopes:
   - `repo` (Full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)

### Step 3: Configure the Dashboard

1. Open your dashboard in a web browser
2. Click the "GitHub" button in the header
3. Enter your:
   - **GitHub Username**: Your GitHub username
   - **Repository Name**: The name of the repository you created
   - **Personal Access Token**: The token you just created
4. Click "Save Configuration"

### Step 4: Test the Setup

The dashboard will automatically:
- Test the connection to GitHub
- Create an initial data file in your repository
- Start syncing your data

## Usage

### Adding Learning Resources

1. **Quick Add**: Paste any URL in the quick-add field at the bottom of any category
2. **Detailed Add**: Click the "+" button in a category to add with more details

### Managing Categories

- **Add Category**: Click "Add Category" in the header
- **Edit Category**: Click the edit button (pencil icon) on any category
- **Delete Category**: Click the delete button (trash icon) on any category

### Tracking Progress

- **Mark Complete**: Click the checkbox next to any item to mark it as completed
- **View Progress**: See overall progress statistics at the top of the dashboard

## Data Synchronization

Your dashboard data is automatically:
- **Saved to GitHub**: Every change is immediately synced to your GitHub repository
- **Backed up locally**: Data is also saved to your browser's localStorage as a backup
- **Synced across devices**: Open the dashboard on any computer with the same GitHub configuration to see your data

## File Structure

```
Project/
├── index.html          # Main dashboard page
├── script.js           # Dashboard functionality and GitHub integration
├── styles.css          # Styling and responsive design
├── README.md           # This file
└── dashboard-data.json # Your data file (created automatically on GitHub)
```

## Troubleshooting

### GitHub Connection Issues

1. **Check your token**: Make sure your Personal Access Token is correct and has `repo` permissions
2. **Verify repository name**: Ensure the repository name matches exactly (case-sensitive)
3. **Check username**: Make sure your GitHub username is correct
4. **Repository access**: Ensure the repository exists and you have access to it

### Data Not Syncing

1. **Check browser console**: Open Developer Tools (F12) and look for error messages
2. **Verify GitHub file**: Check your GitHub repository for the `dashboard-data.json` file
3. **Refresh the page**: Sometimes a page refresh helps establish the connection

### Local Data Recovery

If GitHub sync fails, your data is still saved locally. You can:
1. Export your data using the "Export" button
2. Reconfigure GitHub settings
3. Import the data back if needed

## Browser Compatibility

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ❌ Internet Explorer (not supported)

## Privacy & Security

- Your GitHub Personal Access Token is stored locally in your browser
- Your dashboard data is stored in your GitHub repository
- No data is sent to any third-party services
- You have full control over your data

## Contributing

Feel free to fork this project and customize it for your needs. The code is well-commented and modular for easy modification.

## License

This project is open source and available under the MIT License. 