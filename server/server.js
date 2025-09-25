// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware - CORS MUST come before other middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:3000'], // your frontend URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));  // MUST be before routes
app.options('*', cors(corsOptions)); // handle preflight requests

// Body parser middleware AFTER CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Set default JWT_SECRET if not provided
if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = 'your-super-secret-jwt-key-change-in-production';
    console.log('⚠️ Using default JWT_SECRET. Please set JWT_SECRET in .env file for production!');
}

// MongoDB connection with better error handling
const connectDB = async () => {
    try {
        // If no MONGODB_URI provided, use local MongoDB
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/neighborswap';
        console.log('🔄 Attempting to connect to MongoDB...');

        await mongoose.connect(mongoURI);
        console.log('✅ MongoDB connected successfully');
        console.log(`📍 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('💡 Make sure MongoDB is running or check your MONGODB_URI');
        // Don't exit, continue with local fallback
        try {
            await mongoose.connect('mongodb://localhost:27017/neighborswap');
            console.log('✅ Connected to local MongoDB fallback');
        } catch (localError) {
            console.error('❌ Local MongoDB also failed:', localError.message);
            process.exit(1);
        }
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    location: {
        address: String,
        lat: Number,
        lng: Number
    },
    isVerified: { type: Boolean, default: false },
    ratings: {
        average: { type: Number, default: 0 },
        count: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: {
        type: String,
        required: true,
        enum: ['Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Home & Garden', 'Toys', 'Other']
    },
    condition: {
        type: String,
        required: true,
        enum: ['New', 'Like New', 'Good', 'Fair', 'Poor']
    },
    images: [String],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    location: {
        address: String,
        lat: Number,
        lng: Number
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ROUTES
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Register with better validation and error handling
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Registration attempt:', {
            email: req.body.email,
            name: req.body.name,
            hasPassword: !!req.body.password
        });

        const { name, email, phone, password } = req.body;

        // Validate required fields
        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                error: 'All fields are required',
                missing: {
                    name: !name,
                    email: !email,
                    phone: !phone,
                    password: !password
                }
            });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            console.log('❌ User already exists:', email);
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            phone: phone.trim(),
            password: hashedPassword
        });

        await user.save();
        console.log('✅ User created successfully:', user.email);

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('❌ Registration error:', error);

        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error: validationErrors.join(', ') });
        }

        res.status(500).json({ error: 'Server error during registration' });
    }
});

// Login with better error handling
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Login attempt:', { email: req.body.email });

        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('❌ Invalid password for:', email);
            return res.status(400).json({ error: 'Invalid email or password' });
        }

        console.log('✅ Login successful for:', user.email);

        // Generate token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                location: user.location,
                isVerified: user.isVerified,
                ratings: user.ratings
            }
        });
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ error: 'Server error during login' });
    }
});

// Current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Products
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, condition } = req.query;
        let query = { isActive: true };

        if (category && category !== 'All') query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }
        if (condition) query.condition = condition;

        const products = await Product.find(query)
            .populate('owner', 'name email ratings isVerified')
            .sort({ createdAt: -1 })
            .limit(50);

        res.json(products);
    } catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product
app.post('/api/products', authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, condition, location } = req.body;
        const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

        const product = new Product({
            name,
            description,
            price: parseFloat(price),
            category,
            condition,
            images,
            owner: req.user.userId,
            location: location ? JSON.parse(location) : {}
        });

        await product.save();
        await product.populate('owner', 'name email ratings isVerified');
        res.status(201).json({ message: 'Product created successfully', product });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User's products
app.get('/api/users/:id/products', async (req, res) => {
    try {
        const products = await Product.find({ owner: req.params.id, isActive: true })
            .populate('owner', 'name ratings isVerified');
        res.json(products);
    } catch (error) {
        console.error('Get user products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Seed products
app.post('/api/seed', async (req, res) => {
    try {
        const existingProducts = await Product.countDocuments();
        if (existingProducts > 0) {
            return res.json({ message: 'Database already seeded', count: existingProducts });
        }

        let seedUser = await User.findOne({ email: 'seed@example.com' });
        if (!seedUser) {
            const hashedPassword = await bcrypt.hash('password123', 12);
            seedUser = new User({
                name: 'Seed User',
                email: 'seed@example.com',
                phone: '1234567890',
                password: hashedPassword,
                isVerified: true
            });
            await seedUser.save();
            console.log('✅ Seed user created');
        }

        const fakeProducts = [
            {
                name: 'MacBook Air M2',
                description: 'Brand new MacBook Air with M2 chip. Perfect for students and professionals.',
                price: 999,
                category: 'Electronics',
                condition: 'New',
                images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Vintage Leather Sofa',
                description: 'Beautiful brown leather sofa in excellent condition. Very comfortable.',
                price: 450,
                category: 'Furniture',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'],
                owner: seedUser._id
            },
            {
                name: 'iPhone 14 Pro',
                description: 'Like new iPhone 14 Pro, barely used. Includes original box and charger.',
                price: 800,
                category: 'Electronics',
                condition: 'Like New',
                images: ['https://images.unsplash.com/photo-1592286499084-d4c19a24c3bc?w=500'],
                owner: seedUser._id
            }
        ];

        await Product.insertMany(fakeProducts);
        console.log('✅ Sample products created');

        res.json({
            message: 'Database seeded successfully',
            products: fakeProducts.length,
            seedUser: seedUser.email
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Seeding failed', details: error.message });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
});

// Create default users on startup
async function createDefaultUsers() {
    try {
        // Create test user
        let testUser = await User.findOne({ email: 'test@example.com' });
        if (!testUser) {
            const hashedPassword = await bcrypt.hash('password123', 12);
            testUser = await new User({
                name: 'Test User',
                email: 'test@example.com',
                phone: '0000000000',
                password: hashedPassword,
                isVerified: true
            }).save();
            console.log('✅ Default test user created: test@example.com / password123');
        }

        // Create admin user
        let adminUser = await User.findOne({ email: 'admin@neighborswap.com' });
        if (!adminUser) {
            const hashedPassword = await bcrypt.hash('admin123', 12);
            adminUser = await new User({
                name: 'Admin User',
                email: 'admin@neighborswap.com',
                phone: '1111111111',
                password: hashedPassword,
                isVerified: true
            }).save();
            console.log('✅ Default admin user created: admin@neighborswap.com / admin123');
        }

        console.log('\n🔑 DEFAULT LOGIN CREDENTIALS:');
        console.log('👤 Test User: test@example.com / password123');
        console.log('👤 Admin User: admin@neighborswap.com / admin123');
        console.log('');

    } catch (err) {
        console.error('❌ Error creating default users:', err.message);
    }
}

// Start server
const startServer = async () => {
    try {
        await connectDB();
        await createDefaultUsers();

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 API Health Check: http://localhost:${PORT}/api/health`);
            console.log(`🌐 CORS enabled for: http://localhost:5173, http://localhost:3000`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

module.exports = app;