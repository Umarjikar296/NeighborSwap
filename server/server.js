// server/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// User Schema
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
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
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
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
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// ROUTES

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// User Registration
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });

        await user.save();

        // Generate JWT
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
                isVerified: user.isVerified
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Generate JWT
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
        console.error('Login error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const { category, search, minPrice, maxPrice, condition } = req.query;

        let query = { isActive: true };

        if (category && category !== 'All') {
            query.category = category;
        }

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

        if (condition) {
            query.condition = condition;
        }

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

// Create new product
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

        res.status(201).json({
            message: 'Product created successfully',
            product
        });
    } catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get user's products
app.get('/api/users/:id/products', async (req, res) => {
    try {
        const products = await Product.find({
            owner: req.params.id,
            isActive: true
        }).populate('owner', 'name ratings isVerified');

        res.json(products);
    } catch (error) {
        console.error('Get user products error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Seed database with fake products
app.post('/api/seed', async (req, res) => {
    try {
        // Check if products already exist
        const existingProducts = await Product.countDocuments();
        if (existingProducts > 0) {
            return res.json({ message: 'Database already seeded' });
        }

        // Create a default user for seeding
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
        }

        // Fake products data
        const fakeProducts = [
            {
                name: 'MacBook Air M2',
                description: 'Brand new MacBook Air with M2 chip. 8GB RAM, 256GB SSD. Perfect for students and professionals.',
                price: 999,
                category: 'Electronics',
                condition: 'New',
                images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Vintage Leather Sofa',
                description: 'Beautiful brown leather sofa in excellent condition. 3-seater, very comfortable.',
                price: 450,
                category: 'Furniture',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500'],
                owner: seedUser._id
            },
            {
                name: 'iPhone 14 Pro',
                description: 'Like new iPhone 14 Pro, 128GB, Space Black. Includes original box and accessories.',
                price: 800,
                category: 'Electronics',
                condition: 'Like New',
                images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Mountain Bike',
                description: 'Trek mountain bike, 21-speed, excellent for trails and city riding. Recently serviced.',
                price: 320,
                category: 'Sports',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1544191696-15693072e1c4?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Coffee Table',
                description: 'Modern glass coffee table with wooden legs. Perfect centerpiece for living room.',
                price: 150,
                category: 'Furniture',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1549497538-303791108f95?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Gaming Chair',
                description: 'Ergonomic gaming chair with RGB lighting. Excellent lumbar support, barely used.',
                price: 200,
                category: 'Furniture',
                condition: 'Like New',
                images: ['https://images.unsplash.com/photo-1541558869434-2840d308329a?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Wireless Headphones',
                description: 'Sony WH-1000XM4 noise cancelling headphones. Excellent sound quality.',
                price: 250,
                category: 'Electronics',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Designer Dress',
                description: 'Beautiful evening dress, size M. Worn only once, perfect for special occasions.',
                price: 80,
                category: 'Clothing',
                condition: 'Like New',
                images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Kitchen Blender',
                description: 'High-power Vitamix blender. Perfect for smoothies and food preparation.',
                price: 45,
                category: 'Home & Garden',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=500'],
                owner: seedUser._id
            },
            {
                name: 'Programming Books Set',
                description: 'Collection of 5 programming books including Clean Code, Design Patterns, etc.',
                price: 60,
                category: 'Books',
                condition: 'Good',
                images: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'],
                owner: seedUser._id
            }
        ];

        await Product.insertMany(fakeProducts);

        res.json({
            message: '10 fake products seeded successfully',
            count: fakeProducts.length
        });
    } catch (error) {
        console.error('Seed error:', error);
        res.status(500).json({ error: 'Seeding failed' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
};

startServer();

module.exports = app;