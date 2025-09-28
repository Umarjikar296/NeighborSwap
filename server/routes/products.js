// server/routes/products.js
const express = require('express');
const router = express.Router();

// Dummy products data
const dummyProducts = [
  {
    _id: '1',
    name: 'Vintage Acoustic Guitar',
    description: 'Beautiful vintage acoustic guitar in excellent condition. Perfect for beginners and professionals alike.',
    price: 250,
    category: 'Music',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=400&h=300&fit=crop'],
    owner: { name: 'John Smith', id: 'user1' },
    createdAt: new Date('2024-01-15'),
    status: 'active'
  },
  {
    _id: '2',
    name: 'Mountain Bike',
    description: 'Trek mountain bike, 21-speed, barely used. Great for trails and city riding.',
    price: 180,
    category: 'Sports',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
    owner: { name: 'Sarah Johnson', id: 'user2' },
    createdAt: new Date('2024-01-14'),
    status: 'active'
  },
  {
    _id: '3',
    name: 'MacBook Pro 2019',
    description: '15-inch MacBook Pro with TouchBar. 16GB RAM, 512GB SSD. Perfect for work or school.',
    price: 800,
    category: 'Electronics',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop'],
    owner: { name: 'Mike Chen', id: 'user3' },
    createdAt: new Date('2024-01-13'),
    status: 'active'
  },
  {
    _id: '4',
    name: 'Vintage Leather Sofa',
    description: 'Beautiful brown leather sofa, vintage style. Very comfortable and stylish.',
    price: 320,
    category: 'Furniture',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'],
    owner: { name: 'Emily Davis', id: 'user4' },
    createdAt: new Date('2024-01-12'),
    status: 'active'
  },
  {
    _id: '5',
    name: 'Canon EOS Camera',
    description: 'Professional DSLR camera with 18-55mm lens. Perfect for photography enthusiasts.',
    price: 450,
    category: 'Electronics',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop'],
    owner: { name: 'David Wilson', id: 'user5' },
    createdAt: new Date('2024-01-11'),
    status: 'active'
  },
  {
    _id: '6',
    name: 'Dining Table Set',
    description: 'Wooden dining table with 4 chairs. Perfect for small families.',
    price: 200,
    category: 'Furniture',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop'],
    owner: { name: 'Lisa Brown', id: 'user6' },
    createdAt: new Date('2024-01-10'),
    status: 'active'
  },
  {
    _id: '7',
    name: 'Gaming Console PS5',
    description: 'PlayStation 5 in perfect condition with 2 controllers and 3 games included.',
    price: 400,
    category: 'Electronics',
    condition: 'Excellent',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=300&fit=crop'],
    owner: { name: 'Alex Martinez', id: 'user7' },
    createdAt: new Date('2024-01-09'),
    status: 'active'
  },
  {
    _id: '8',
    name: 'Designer Jacket',
    description: 'High-quality leather jacket, size M. Stylish and warm.',
    price: 90,
    category: 'Clothing',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&h=300&fit=crop'],
    owner: { name: 'Jessica Taylor', id: 'user8' },
    createdAt: new Date('2024-01-08'),
    status: 'active'
  },
  {
    _id: '9',
    name: 'Garden Tools Set',
    description: 'Complete set of garden tools including spade, rake, and pruning shears.',
    price: 35,
    category: 'Home & Garden',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'],
    owner: { name: 'Robert Lee', id: 'user9' },
    createdAt: new Date('2024-01-07'),
    status: 'active'
  },
  {
    _id: '10',
    name: 'Kids Bicycle',
    description: 'Red kids bicycle with training wheels. Perfect for children aged 5-8.',
    price: 60,
    category: 'Toys',
    condition: 'Good',
    images: ['https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop'],
    owner: { name: 'Amanda White', id: 'user10' },
    createdAt: new Date('2024-01-06'),
    status: 'active'
  }
];

// GET all products
router.get('/', async (req, res) => {
  try {
    res.json({
      success: true,
      products: dummyProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET user's products
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userProducts = dummyProducts.filter(product => product.owner.id === userId);
    
    res.json({
      success: true,
      products: userProducts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching user products',
      error: error.message
    });
  }
});

// POST create new product
router.post('/', async (req, res) => {
  try {
    const { name, description, price, category, condition, images } = req.body;
    
    // In a real app, you'd save to database and get user from auth token
    const newProduct = {
      _id: Date.now().toString(), // Simple ID generation
      name,
      description,
      price: parseFloat(price),
      category,
      condition,
      images: images || ['https://via.placeholder.com/400x300?text=New+Product'],
      owner: { name: 'Current User', id: 'current-user' }, // In real app, get from auth
      createdAt: new Date(),
      status: 'active'
    };

    // Add to our dummy products array (in real app, save to database)
    dummyProducts.unshift(newProduct);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

module.exports = router;