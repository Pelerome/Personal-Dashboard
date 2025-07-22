# Personal Development Dashboard

A modern, responsive web application for tracking personal development projects, learning resources, and progress across various subjects.

## Features

- 📊 **Progress Tracking**: Visual progress bars and statistics
- 🎨 **Colorful Categories**: Vibrant, gradient-based category themes
- 🌙 **Dark/Light Mode**: Toggle between themes with system preference detection
- ⚡ **Quick Add**: Paste URLs to instantly add resources with automatic title fetching
- 📱 **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- 💾 **Local Storage**: Data persists in your browser
- 🔄 **Auto-Save**: Automatic data saving every 30 seconds
- 📤 **Export/Import**: Backup and restore your data
- ⌨️ **Keyboard Shortcuts**: Quick navigation and actions

## Online Deployment Options

### Option 1: GitHub Pages (Recommended - Free)

1. **Create a GitHub Repository**:
   - Go to [GitHub](https://github.com) and create a new repository
   - Name it something like `personal-dashboard`

2. **Upload Your Files**:
   - Upload `index.html`, `styles.css`, and `script.js` to your repository
   - Or use GitHub Desktop to clone and add files

3. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Scroll down to "Pages" section
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Click "Save"

4. **Access Your Dashboard**:
   - Your dashboard will be available at: `https://yourusername.github.io/repository-name`

### Option 2: Netlify (Free)

1. **Create Netlify Account**:
   - Go to [Netlify](https://netlify.com) and sign up

2. **Deploy**:
   - Drag and drop your project folder to Netlify
   - Or connect your GitHub repository for automatic deployments

3. **Custom Domain** (Optional):
   - Netlify provides a free subdomain like `your-dashboard.netlify.app`
   - You can add a custom domain if you have one

### Option 3: Vercel (Free)

1. **Create Vercel Account**:
   - Go to [Vercel](https://vercel.com) and sign up

2. **Deploy**:
   - Import your GitHub repository
   - Or drag and drop your project folder

3. **Access**:
   - Vercel provides a free subdomain like `your-dashboard.vercel.app`

### Option 4: Firebase Hosting (Free)

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Project**:
   ```bash
   firebase login
   firebase init hosting
   ```

3. **Deploy**:
   ```bash
   firebase deploy
   ```

## Getting Started

### Local Development

1. **Download Files**:
   - Download `index.html`, `styles.css`, and `script.js`
   - Place them in the same folder

2. **Open Dashboard**:
   - Double-click `index.html` to open in your browser
   - Or use a local server for better development experience

### Using a Local Server

```bash
# Using Python 3
python -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have it installed)
npx serve .

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## Usage

### Adding Categories

1. Click "Add Category" button
2. Enter category name, select icon and color
3. Click "Add Category"

### Adding Items

1. **Quick Add**: Paste a URL in the quick-add field and press Enter
2. **Manual Add**: Click the "+" button in a category to add with details

### Managing Items

- **Check/Uncheck**: Click the checkbox to mark items as complete
- **Delete**: Click the trash icon to remove items
- **Edit**: Use the modal forms to edit details

### Data Management

- **Export**: Click "Export" to download your data as JSON
- **Import**: Use browser's developer tools to import data
- **Auto-Save**: Data is automatically saved every 30 seconds

## Keyboard Shortcuts

- `Ctrl/Cmd + N`: Add new category
- `Ctrl/Cmd + S`: Save data manually
- `Escape`: Close modals

## Customization

### Adding New Categories

The dashboard comes with default categories, but you can add your own:

- Personal Finance
- Real Estate
- Fitness
- Product Management
- Coding
- AI/ML
- UX/UI Design
- Learning

### Color Themes

Each category can have different color themes:
- Blue, Green, Purple, Orange, Red, Teal, Pink, Indigo

### Icons

Categories use Font Awesome icons. You can change them in the category creation modal.

## Technical Details

### Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS custom properties
- **JavaScript (ES6+)**: Dynamic functionality
- **Local Storage**: Client-side data persistence
- **Font Awesome**: Icons
- **Google Fonts**: Typography (DM Sans)

### Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Data Storage

All data is stored locally in your browser's localStorage. This means:
- ✅ No server required
- ✅ Works offline
- ✅ Private and secure
- ❌ Data doesn't sync between devices (unless you export/import)

## Troubleshooting

### Common Issues

1. **Data Not Saving**: Check if localStorage is enabled in your browser
2. **Icons Not Showing**: Ensure internet connection for Font Awesome CDN
3. **Fonts Not Loading**: Check internet connection for Google Fonts
4. **Title Fetching Slow**: This is normal - titles are fetched in the background

### Browser Compatibility

If you experience issues:
- Update your browser to the latest version
- Try a different browser
- Check if JavaScript is enabled

## Future Enhancements

Potential features for future versions:
- Cloud sync across devices
- Collaborative sharing
- Advanced analytics
- Mobile app
- Integration with learning platforms
- Reminder notifications

## Contributing

Feel free to fork this project and submit pull requests for improvements!

## License

This project is open source and available under the MIT License. 