// Dashboard Data Structure
let dashboardData = {
    categories: [],
    lastUpdated: new Date().toISOString()
};

// GitHub Configuration
const GITHUB_CONFIG = {
    // You'll need to update these with your actual GitHub details
    username: 'YOUR_GITHUB_USERNAME', // Replace with your GitHub username
    repository: 'YOUR_REPO_NAME', // Replace with your repository name
    branch: 'main', // or 'master' depending on your default branch
    dataFile: 'dashboard-data.json',
    token: null // Will be set by user
};

// Initialize dashboard
async function init() {
    checkGitHubAuth();
    await loadData();
    await initializeDefaultCategories();
    renderDashboard();
    setupEventListeners();
    setupKeyboardShortcuts();
    initDarkMode();
}

// Dark mode functionality
function initDarkMode() {
    const savedTheme = localStorage.getItem('dashboard-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.body.classList.add('dark');
        updateDarkModeButton(true);
    }
}

function toggleDarkMode() {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('dashboard-theme', isDark ? 'dark' : 'light');
    updateDarkModeButton(isDark);
}

function updateDarkModeButton(isDark) {
    const button = document.getElementById('darkModeToggle');
    const icon = button.querySelector('i');
    const text = button.querySelector('span') || document.createElement('span');
    
    if (isDark) {
        icon.className = 'fas fa-sun';
        text.textContent = 'Light Mode';
    } else {
        icon.className = 'fas fa-moon';
        text.textContent = 'Dark Mode';
    }
    
    if (!button.querySelector('span')) {
        button.appendChild(text);
    }
}

// Check if GitHub authentication is set up
function checkGitHubAuth() {
    const savedUsername = localStorage.getItem('github-username');
    const savedRepo = localStorage.getItem('github-repo');
    const savedToken = localStorage.getItem('github-token');
    
    if (savedUsername && savedRepo && savedToken) {
        GITHUB_CONFIG.username = savedUsername;
        GITHUB_CONFIG.repository = savedRepo;
        GITHUB_CONFIG.token = savedToken;
    } else {
        showGitHubSetupModal();
    }
}

// Show GitHub setup modal
function showGitHubSetupModal() {
    // Load existing configuration
    const savedUsername = localStorage.getItem('github-username') || GITHUB_CONFIG.username;
    const savedRepo = localStorage.getItem('github-repo') || GITHUB_CONFIG.repository;
    const savedToken = localStorage.getItem('github-token') || '';
    
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>GitHub Settings</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Configure GitHub integration to sync your dashboard data across computers.</p>
                <div class="form-group">
                    <label for="githubUsername">GitHub Username</label>
                    <input type="text" id="githubUsername" placeholder="your-username" value="${savedUsername}">
                </div>
                <div class="form-group">
                    <label for="githubRepo">Repository Name</label>
                    <input type="text" id="githubRepo" placeholder="your-repo-name" value="${savedRepo}">
                </div>
                <div class="form-group">
                    <label for="githubToken">GitHub Personal Access Token</label>
                    <input type="password" id="githubToken" placeholder="ghp_xxxxxxxxxxxxxxxxxxxx" value="${savedToken}">
                    <small>
                        <a href="https://github.com/settings/tokens" target="_blank">Create a token here</a> 
                        (needs repo permissions)
                    </small>
                </div>
                <div class="form-actions">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" onclick="saveGitHubConfig()">Save Configuration</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Save GitHub configuration
function saveGitHubConfig() {
    const username = document.getElementById('githubUsername').value;
    const repo = document.getElementById('githubRepo').value;
    const token = document.getElementById('githubToken').value;
    
    if (!username || !repo || !token) {
        alert('Please fill in all fields');
        return;
    }
    
    GITHUB_CONFIG.username = username;
    GITHUB_CONFIG.repository = repo;
    GITHUB_CONFIG.token = token;
    
    localStorage.setItem('github-username', username);
    localStorage.setItem('github-repo', repo);
    localStorage.setItem('github-token', token);
    
    // Remove modal
    document.querySelector('.modal').remove();
    
    // Test connection and create initial data file
    testGitHubConnection();
}

// Test GitHub connection
async function testGitHubConnection() {
    try {
        showNotification('Testing GitHub connection...', 'info');
        
        // Try to read the data file
        const data = await loadDataFromGitHub();
        
        if (data) {
            showNotification('GitHub connection successful!', 'success');
            dashboardData = data;
            renderDashboard();
        } else {
            // Create initial data file
            await saveDataToGitHub(dashboardData);
            showNotification('Initial data file created on GitHub!', 'success');
        }
    } catch (error) {
        console.error('GitHub connection failed:', error);
        showNotification('GitHub connection failed. Check your configuration.', 'error');
    }
}

// Load data from GitHub
async function loadDataFromGitHub() {
    if (!GITHUB_CONFIG.token) {
        return null;
    }
    
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.dataFile}`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const fileData = await response.json();
            const content = atob(fileData.content);
            return JSON.parse(content);
        } else if (response.status === 404) {
            // File doesn't exist yet
            return null;
        } else {
            throw new Error(`GitHub API error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error loading from GitHub:', error);
        return null;
    }
}

// Save data to GitHub
async function saveDataToGitHub(data) {
    if (!GITHUB_CONFIG.token) {
        return false;
    }
    
    try {
        // First, try to get the current file to get its SHA
        const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.dataFile}`;
        
        let sha = null;
        try {
            const getResponse = await fetch(getUrl, {
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                sha = fileData.sha;
            }
        } catch (error) {
            // File doesn't exist, that's okay
        }
        
        // Prepare the update request
        const updateUrl = `https://api.github.com/repos/${GITHUB_CONFIG.username}/${GITHUB_CONFIG.repository}/contents/${GITHUB_CONFIG.dataFile}`;
        
        const content = btoa(JSON.stringify(data, null, 2));
        
        const updateData = {
            message: `Update dashboard data - ${new Date().toISOString()}`,
            content: content,
            branch: GITHUB_CONFIG.branch
        };
        
        if (sha) {
            updateData.sha = sha;
        }
        
        const response = await fetch(updateUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (response.ok) {
            console.log('Data saved to GitHub successfully');
            return true;
        } else {
            const errorData = await response.json();
            throw new Error(`GitHub API error: ${response.status} - ${errorData.message}`);
        }
    } catch (error) {
        console.error('Error saving to GitHub:', error);
        return false;
    }
}

// Load data (now tries GitHub first, falls back to localStorage)
async function loadData() {
    // Try to load from GitHub first
    const githubData = await loadDataFromGitHub();
    
    if (githubData) {
        dashboardData = githubData;
        console.log('Data loaded from GitHub');
    } else {
        // Fall back to localStorage
        const saved = localStorage.getItem('personalDevelopmentDashboard');
        if (saved) {
            try {
                dashboardData = JSON.parse(saved);
                console.log('Data loaded from localStorage');
            } catch (e) {
                console.error('Error loading data:', e);
                dashboardData = { categories: [], lastUpdated: new Date().toISOString() };
            }
        }
    }
}

// Save data (now saves to both GitHub and localStorage)
async function saveData() {
    dashboardData.lastUpdated = new Date().toISOString();
    
    // Save to localStorage as backup
    localStorage.setItem('personalDevelopmentDashboard', JSON.stringify(dashboardData));
    
    // Try to save to GitHub
    if (GITHUB_CONFIG.token) {
        const success = await saveDataToGitHub(dashboardData);
        if (!success) {
            console.warn('Failed to save to GitHub, data saved locally only');
        }
    }
}

// Synchronous version for backward compatibility
function saveDataSync() {
    dashboardData.lastUpdated = new Date().toISOString();
    localStorage.setItem('personalDevelopmentDashboard', JSON.stringify(dashboardData));
}

// Initialize default categories
async function initializeDefaultCategories() {
    if (dashboardData.categories.length === 0) {
        const defaultCategories = [
            {
                id: generateId(),
                name: 'Personal Finance & Investments',
                icon: 'fas fa-chart-line',
                color: 'green',
                items: []
            },
            {
                id: generateId(),
                name: 'Real Estate',
                icon: 'fas fa-home',
                color: 'blue',
                items: []
            },
            {
                id: generateId(),
                name: 'Fitness & Health',
                icon: 'fas fa-dumbbell',
                color: 'orange',
                items: []
            },
            {
                id: generateId(),
                name: 'Product Management',
                icon: 'fas fa-tasks',
                color: 'purple',
                items: []
            },
            {
                id: generateId(),
                name: 'Coding & Development',
                icon: 'fas fa-code',
                color: 'indigo',
                items: []
            },
            {
                id: generateId(),
                name: 'AI & Machine Learning',
                icon: 'fas fa-brain',
                color: 'teal',
                items: []
            },
            {
                id: generateId(),
                name: 'UX/UI Design',
                icon: 'fas fa-palette',
                color: 'pink',
                items: []
            },
            {
                id: generateId(),
                name: 'AI Tools & Cursor',
                icon: 'fas fa-robot',
                color: 'red',
                items: []
            }
        ];
        
        dashboardData.categories = defaultCategories;
        await saveData();
    }
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Render the entire dashboard
function renderDashboard() {
    renderCategories();
    updateProgressStats();
}

// Render all categories
function renderCategories() {
    const grid = document.getElementById('categoriesGrid');
    grid.innerHTML = '';
    
    dashboardData.categories.forEach(category => {
        const categoryElement = createCategoryElement(category);
        grid.appendChild(categoryElement);
    });
}

// Create a category element
function createCategoryElement(category) {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'category-card';
    categoryDiv.setAttribute('data-color', category.color);
    categoryDiv.setAttribute('data-category-id', category.id);
    
    const completedCount = category.items.filter(item => item.completed).length;
    const totalCount = category.items.length;
    const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
    
    categoryDiv.innerHTML = `
        <div class="category-header">
            <div class="category-title">
                <div class="category-icon">
                    <i class="${category.icon}"></i>
                </div>
                <span>${category.name}</span>
            </div>
            <div class="category-actions">
                <button class="btn btn-secondary btn-small" onclick="editCategory('${category.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-secondary btn-small" onclick="deleteCategory('${category.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        
        <div class="progress-container">
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
            <div class="progress-text">${completedCount} of ${totalCount} completed (${progressPercentage}%)</div>
        </div>
        
        <div class="items-list">
            ${category.items.length === 0 ? '<p style="text-align: center; color: #a0aec0; font-style: italic;">No items yet. Add your first learning resource!</p>' : ''}
            ${category.items.map(item => createItemHTML(item, category.id)).join('')}
        </div>
        
        <div class="quick-add">
            <form class="quick-add-form" onsubmit="quickAddItem(event, '${category.id}')">
                <input type="url" class="quick-add-input" placeholder="Paste URL here..." required>
                <button type="submit" class="btn btn-primary btn-small">
                    <i class="fas fa-plus"></i>
                </button>
            </form>
        </div>
    `;
    
    return categoryDiv;
}

// Create item HTML
function createItemHTML(item, categoryId) {
    const checkboxClass = item.completed ? 'item-checkbox checked' : 'item-checkbox';
    const checkboxIcon = item.completed ? 'fas fa-check' : '';
    
    return `
        <div class="item" data-item-id="${item.id}">
            <div class="${checkboxClass}" onclick="toggleItem('${categoryId}', '${item.id}')">
                ${checkboxIcon ? `<i class="${checkboxIcon}"></i>` : ''}
            </div>
            <div class="item-content">
                <div class="item-title">${item.title}</div>
                <a href="${item.url}" target="_blank" class="item-url">${item.url}</a>
            </div>
            <span class="item-type ${item.type}">${item.type}</span>
            <button class="btn btn-secondary btn-small" onclick="deleteItem('${categoryId}', '${item.id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
}

// Update progress statistics
function updateProgressStats() {
    const totalCategories = dashboardData.categories.length;
    const totalItems = dashboardData.categories.reduce((sum, cat) => sum + cat.items.length, 0);
    const completedItems = dashboardData.categories.reduce((sum, cat) => 
        sum + cat.items.filter(item => item.completed).length, 0);
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    
    document.getElementById('totalCategories').textContent = totalCategories;
    document.getElementById('totalItems').textContent = totalItems;
    document.getElementById('completedItems').textContent = completedItems;
    document.getElementById('progressPercentage').textContent = progressPercentage + '%';
}

// Setup event listeners
function setupEventListeners() {
    // Add category form
    document.getElementById('addCategoryForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addNewCategoryFromForm();
    });
    
    // Add item form
    document.getElementById('addItemForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addNewItemFromForm();
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('show');
        }
    });
}

// Modal functions
function showModal(modalId) {
    document.getElementById(modalId).classList.add('show');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Add new category
function addNewCategory() {
    showModal('addCategoryModal');
}

async function addNewCategoryFromForm() {
    const name = document.getElementById('categoryName').value;
    const icon = document.getElementById('categoryIcon').value;
    const color = document.getElementById('categoryColor').value;
    
    const newCategory = {
        id: generateId(),
        name: name,
        icon: icon,
        color: color,
        items: []
    };
    
    dashboardData.categories.push(newCategory);
    await saveData();
    renderDashboard();
    closeModal('addCategoryModal');
    
    // Reset form
    document.getElementById('addCategoryForm').reset();
}

// Add item to specific category
function addItemToCategory(categoryId) {
    currentCategoryId = categoryId;
    showModal('addItemModal');
}

async function addNewItemFromForm() {
    const title = document.getElementById('itemTitle').value;
    const url = document.getElementById('itemUrl').value;
    const type = document.getElementById('itemType').value;
    const notes = document.getElementById('itemNotes').value;
    
    const newItem = {
        id: generateId(),
        title: title,
        url: url,
        type: type,
        notes: notes,
        completed: false,
        addedAt: new Date().toISOString()
    };
    
    const category = dashboardData.categories.find(cat => cat.id === currentCategoryId);
    if (category) {
        category.items.push(newItem);
        await saveData();
        renderDashboard();
        closeModal('addItemModal');
        
        // Reset form
        document.getElementById('addItemForm').reset();
    }
}

// Quick add item (just URL)
let currentCategoryId = null;

// Fast title extraction from URL (no network requests)
function extractTitleFromUrl(url) {
    try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        
        // YouTube video title extraction
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
            if (url.includes('v=')) {
                const videoId = url.split('v=')[1].split('&')[0];
                return `YouTube Video (${videoId})`;
            } else if (url.includes('youtu.be/')) {
                const videoId = url.split('youtu.be/')[1].split('?')[0];
                return `YouTube Video (${videoId})`;
            }
            return 'YouTube Video';
        }
        
        // Common learning platforms
        if (hostname.includes('udemy.com')) return 'Udemy Course';
        if (hostname.includes('coursera.org')) return 'Coursera Course';
        if (hostname.includes('edx.org')) return 'edX Course';
        if (hostname.includes('khanacademy.org')) return 'Khan Academy';
        if (hostname.includes('freecodecamp.org')) return 'freeCodeCamp';
        if (hostname.includes('w3schools.com')) return 'W3Schools Tutorial';
        if (hostname.includes('mdn.web')) return 'MDN Web Docs';
        if (hostname.includes('stackoverflow.com')) return 'Stack Overflow';
        if (hostname.includes('github.com')) return 'GitHub Repository';
        if (hostname.includes('medium.com')) return 'Medium Article';
        if (hostname.includes('dev.to')) return 'Dev.to Article';
        if (hostname.includes('css-tricks.com')) return 'CSS-Tricks';
        if (hostname.includes('smashingmagazine.com')) return 'Smashing Magazine';
        if (hostname.includes('alistapart.com')) return 'A List Apart';
        if (hostname.includes('sitepoint.com')) return 'SitePoint';
        if (hostname.includes('tutsplus.com')) return 'Tuts+ Tutorial';
        if (hostname.includes('pluralsight.com')) return 'Pluralsight Course';
        if (hostname.includes('skillshare.com')) return 'Skillshare Class';
        if (hostname.includes('linkedin.com/learning')) return 'LinkedIn Learning';
        if (hostname.includes('amazon.com')) return 'Amazon Book';
        if (hostname.includes('goodreads.com')) return 'Goodreads Book';
        if (hostname.includes('investopedia.com')) return 'Investopedia Article';
        if (hostname.includes('nerdwallet.com')) return 'NerdWallet Article';
        if (hostname.includes('mint.com')) return 'Mint Article';
        if (hostname.includes('zillow.com')) return 'Zillow Property';
        if (hostname.includes('realtor.com')) return 'Realtor.com';
        if (hostname.includes('redfin.com')) return 'Redfin Property';
        if (hostname.includes('myfitnesspal.com')) return 'MyFitnessPal';
        if (hostname.includes('fitbit.com')) return 'Fitbit';
        if (hostname.includes('strava.com')) return 'Strava';
        if (hostname.includes('bodybuilding.com')) return 'Bodybuilding.com';
        if (hostname.includes('acefitness.org')) return 'ACE Fitness';
        if (hostname.includes('nasm.org')) return 'NASM';
        if (hostname.includes('producthunt.com')) return 'Product Hunt';
        if (hostname.includes('mindtheproduct.com')) return 'Mind the Product';
        if (hostname.includes('svpg.com')) return 'SVPG';
        if (hostname.includes('martycagan.com')) return 'Marty Cagan';
        if (hostname.includes('openai.com')) return 'OpenAI';
        if (hostname.includes('anthropic.com')) return 'Anthropic';
        if (hostname.includes('cursor.sh')) return 'Cursor AI';
        if (hostname.includes('copilot.microsoft.com')) return 'Microsoft Copilot';
        if (hostname.includes('bard.google.com')) return 'Google Bard';
        if (hostname.includes('claude.ai')) return 'Claude AI';
        if (hostname.includes('figma.com')) return 'Figma';
        if (hostname.includes('sketch.com')) return 'Sketch';
        if (hostname.includes('invisionapp.com')) return 'InVision';
        if (hostname.includes('adobe.com/xd')) return 'Adobe XD';
        if (hostname.includes('behance.net')) return 'Behance';
        if (hostname.includes('dribbble.com')) return 'Dribbble';
        
        // Generic fallback based on domain
        const domain = hostname.replace('www.', '');
        return `${domain.charAt(0).toUpperCase() + domain.slice(1)} Resource`;
        
    } catch (e) {
        return 'New Resource';
    }
}

// Fetch real title from URL with timeout (completely silent)
async function fetchRealTitle(url, itemId) {
    try {
        // Create a promise that rejects after 3 seconds (shorter timeout)
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 3000);
        });

        // Try to fetch the title
        const fetchPromise = fetchTitleWithProxy(url);
        
        // Race between fetch and timeout
        const title = await Promise.race([fetchPromise, timeoutPromise]);
        
        // Update the item with the real title (silently)
        const category = dashboardData.categories.find(cat => cat.items.some(item => item.id === itemId));
        if (category) {
            const item = category.items.find(item => item.id === itemId);
            if (item && title) {
                item.title = title;
                saveData();
                renderDashboard();
                // No notification - completely silent update
            }
        }
        
    } catch (error) {
        // Silently fail - no console errors, no UI updates
        console.log('Title fetch failed silently for:', url);
    }
}

// Fetch title using a reliable proxy (optimized)
async function fetchTitleWithProxy(url) {
    try {
        // Only try the most reliable proxy to reduce load time
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const html = data.contents || data;
            
            // Extract title from HTML
            const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
            if (titleMatch) {
                let title = titleMatch[1].trim();
                
                // Clean up common suffixes
                title = title.replace(/\s*-\s*YouTube$/, '');
                title = title.replace(/\s*-\s*Medium$/, '');
                title = title.replace(/\s*-\s*Dev\.to$/, '');
                title = title.replace(/\s*-\s*Stack Overflow$/, '');
                title = title.replace(/\s*-\s*GitHub$/, '');
                
                return title;
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}

// Enhanced quick add with silent background title fetching
async function quickAddItem(event, categoryId) {
    event.preventDefault();
    const url = event.target.querySelector('input').value;
    
    if (!url) return;
    
    // Show loading state only for the form submission
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalContent = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    try {
        // Fast title extraction (instant)
        const title = extractTitleFromUrl(url);
        
        // Determine type based on URL
        let type = 'other';
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            type = 'youtube';
        } else if (url.includes('udemy.com') || url.includes('coursera.org') || url.includes('edx.org') || 
                   url.includes('pluralsight.com') || url.includes('skillshare.com') || url.includes('linkedin.com/learning')) {
            type = 'course';
        } else if (url.includes('amazon.com') || url.includes('goodreads.com')) {
            type = 'book';
        } else {
            type = 'website';
        }
        
        const newItem = {
            id: generateId(),
            title: title,
            url: url,
            type: type,
            notes: '',
            completed: false,
            addedAt: new Date().toISOString()
        };
        
        const category = dashboardData.categories.find(cat => cat.id === categoryId);
        if (category) {
            category.items.push(newItem);
            await saveData();
            renderDashboard();
            
            // Clear input
            event.target.reset();
            
            // Show success message
            showNotification(`Added: ${title}`, 'success');
            
            // Silently fetch real title in background (no UI blocking)
            if (type === 'youtube' || type === 'website') {
                // Use setTimeout to ensure it doesn't block the UI
                setTimeout(() => {
                    fetchRealTitle(url, newItem.id);
                }, 2000); // Wait 2 seconds before attempting
            }
        }
    } catch (error) {
        console.error('Error adding item:', error);
        showNotification('Error adding item. Please try again.', 'error');
    } finally {
        // Restore button state immediately
        submitBtn.innerHTML = originalContent;
        submitBtn.disabled = false;
    }
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

// Toggle item completion
async function toggleItem(categoryId, itemId) {
    const category = dashboardData.categories.find(cat => cat.id === categoryId);
    if (category) {
        const item = category.items.find(item => item.id === itemId);
        if (item) {
            item.completed = !item.completed;
            if (item.completed) {
                item.completedAt = new Date().toISOString();
            } else {
                delete item.completedAt;
            }
            await saveData();
            renderDashboard();
        }
    }
}

// Delete item
async function deleteItem(categoryId, itemId) {
    if (confirm('Are you sure you want to delete this item?')) {
        const category = dashboardData.categories.find(cat => cat.id === categoryId);
        if (category) {
            category.items = category.items.filter(item => item.id !== itemId);
            await saveData();
            renderDashboard();
        }
    }
}

// Edit category
async function editCategory(categoryId) {
    const category = dashboardData.categories.find(cat => cat.id === categoryId);
    if (category) {
        // For now, just show a simple prompt. You could enhance this with a modal
        const newName = prompt('Enter new category name:', category.name);
        if (newName && newName.trim()) {
            category.name = newName.trim();
            await saveData();
            renderDashboard();
        }
    }
}

// Delete category
async function deleteCategory(categoryId) {
    if (confirm('Are you sure you want to delete this category and all its items?')) {
        dashboardData.categories = dashboardData.categories.filter(cat => cat.id !== categoryId);
        await saveData();
        renderDashboard();
    }
}

// Export data
function exportData() {
    const dataStr = JSON.stringify(dashboardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `personal-development-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import data (you can add this functionality later)
async function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async function(e) {
                try {
                    const importedData = JSON.parse(e.target.result);
                    dashboardData = importedData;
                    await saveData();
                    renderDashboard();
                    alert('Data imported successfully!');
                } catch (error) {
                    alert('Error importing data. Please check the file format.');
                }
            };
            reader.readAsText(file);
        }
    };
    input.click();
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + N to add new category
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            addNewCategory();
        }
        
        // Escape to close modals
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => modal.classList.remove('show'));
        }
    });
}

// Auto-save every 30 seconds
setInterval(async () => {
    await saveData();
}, 30000);

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', init);

// Add some sample data for demonstration
async function addSampleData() {
    const sampleItems = [
        {
            title: 'Personal Finance Basics',
            url: 'https://www.youtube.com/watch?v=example1',
            type: 'youtube'
        },
        {
            title: 'Real Estate Investment Guide',
            url: 'https://www.investopedia.com/real-estate-investment',
            type: 'website'
        },
        {
            title: 'Complete Web Development Bootcamp',
            url: 'https://www.udemy.com/course/web-development-bootcamp',
            type: 'course'
        }
    ];
    
    if (dashboardData.categories.length > 0) {
        sampleItems.forEach((item, index) => {
            const categoryIndex = index % dashboardData.categories.length;
            const newItem = {
                id: generateId(),
                title: item.title,
                url: item.url,
                type: item.type,
                notes: 'Sample item for demonstration',
                completed: false,
                addedAt: new Date().toISOString()
            };
            dashboardData.categories[categoryIndex].items.push(newItem);
        });
        await saveData();
        renderDashboard();
    }
}

// Uncomment the line below to add sample data for testing
// addSampleData(); 