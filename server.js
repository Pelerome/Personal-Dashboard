const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-dashboard';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 30
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        default: Date.now
    }
});

// Dashboard Schema
const dashboardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{
        id: String,
        name: String,
        icon: String,
        color: String,
        items: [{
            id: String,
            title: String,
            url: String,
            type: String,
            notes: String,
            completed: Boolean,
            addedAt: Date
        }]
    }],
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);
const Dashboard = mongoose.model('Dashboard', dashboardSchema);

// Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// User registration
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                error: 'User with this email or username already exists' 
            });
        }

        // Hash password
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            username,
            email,
            password: hashedPassword
        });

        await user.save();

        // Create default dashboard
        const dashboard = new Dashboard({
            userId: user._id,
            categories: [
                {
                    id: 'finance',
                    name: 'Personal Finance',
                    icon: 'fas fa-chart-line',
                    color: 'blue',
                    items: []
                },
                {
                    id: 'real-estate',
                    name: 'Real Estate',
                    icon: 'fas fa-home',
                    color: 'green',
                    items: []
                },
                {
                    id: 'fitness',
                    name: 'Fitness',
                    icon: 'fas fa-dumbbell',
                    color: 'purple',
                    items: []
                },
                {
                    id: 'product-management',
                    name: 'Product Management',
                    icon: 'fas fa-tasks',
                    color: 'orange',
                    items: []
                },
                {
                    id: 'coding',
                    name: 'Coding',
                    icon: 'fas fa-code',
                    color: 'red',
                    items: []
                },
                {
                    id: 'ai-ml',
                    name: 'AI/ML',
                    icon: 'fas fa-brain',
                    color: 'teal',
                    items: []
                },
                {
                    id: 'ux-ui',
                    name: 'UX/UI Design',
                    icon: 'fas fa-palette',
                    color: 'pink',
                    items: []
                },
                {
                    id: 'learning',
                    name: 'Learning',
                    icon: 'fas fa-graduation-cap',
                    color: 'indigo',
                    items: []
                }
            ]
        });

        await dashboard.save();

        res.status(201).json({ 
            message: 'User created successfully',
            userId: user._id
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User login
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const bcrypt = require('bcryptjs');
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate JWT token
        const jwt = require('jsonwebtoken');
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const jwt = require('jsonwebtoken');
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// Get dashboard data
app.get('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const dashboard = await Dashboard.findOne({ userId: req.user.userId });
        
        if (!dashboard) {
            return res.status(404).json({ error: 'Dashboard not found' });
        }

        res.json(dashboard);
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update dashboard data
app.put('/api/dashboard', authenticateToken, async (req, res) => {
    try {
        const { categories, settings } = req.body;

        const dashboard = await Dashboard.findOneAndUpdate(
            { userId: req.user.userId },
            { 
                categories,
                settings: {
                    ...settings,
                    lastUpdated: new Date()
                }
            },
            { new: true, upsert: true }
        );

        res.json(dashboard);
    } catch (error) {
        console.error('Update dashboard error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user settings
app.put('/api/settings', authenticateToken, async (req, res) => {
    try {
        const { theme } = req.body;

        const dashboard = await Dashboard.findOneAndUpdate(
            { userId: req.user.userId },
            { 
                'settings.theme': theme,
                'settings.lastUpdated': new Date()
            },
            { new: true }
        );

        res.json({ message: 'Settings updated successfully', theme });
    } catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Dashboard API: http://localhost:${PORT}/api`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
}); 