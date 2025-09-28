// src/components/AddProductPage.jsx
import React, { useState } from 'react';
import { productAPI } from '../services/api';

const AddProductPage = ({ onProductAdded, setCurrentView, user }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Electronics',
    condition: 'Good',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 
    'Home & Garden', 'Toys', 'Music', 'Other'
  ];

  const conditions = ['Excellent', 'Good', 'Fair', 'Poor'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name.trim()) {
      setError('Product name is required');
      setLoading(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Product description is required');
      setLoading(false);
      return;
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Please enter a valid price');
      setLoading(false);
      return;
    }

    try {
      console.log('Submitting product:', formData);
      
      const response = await productAPI.create({
        ...formData,
        price: parseFloat(formData.price)
      });
      
      console.log('Product created:', response.data);
      
      setSuccess('Product added successfully!');
      
      // Call the callback to add product to the list
      if (onProductAdded && response.data.product) {
        onProductAdded(response.data.product);
      }
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        condition: 'Good',
        images: []
      });
      
      // Redirect after 2 seconds
      setTimeout(() => {
        setCurrentView('home');
      }, 2000);
      
    } catch (error) {
      console.error('Error creating product:', error);
      setError(error.response?.data?.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => setCurrentView('home')}
          className="flex items-center text-purple-600 hover:text-purple-700 mb-4"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Home
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
        <p className="text-gray-600 mt-2">List your item for the community to discover</p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-8 py-6">
          <h2 className="text-2xl font-bold text-white">Product Details</h2>
          <p className="text-purple-100 mt-2">Fill in the information about your product</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-exclamation-circle text-red-400 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <i className="fas fa-check-circle text-green-400 mr-2"></i>
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Enter product name"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="Describe your product in detail..."
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price ($) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                placeholder="0.00"
                required
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              >
                {conditions.map(condition => (
                  <option key={condition} value={condition}>{condition}</option>
                ))}
              </select>
            </div>

            {/* Image Upload Placeholder */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Images
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                <p className="text-gray-600 mb-2">Image upload coming soon!</p>
                <p className="text-sm text-gray-500">For now, a placeholder image will be used</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => setCurrentView('home')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding Product...
                </div>
              ) : (
                <>
                  <i className="fas fa-plus mr-2"></i>
                  Add Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          <i className="fas fa-lightbulb mr-2"></i>
          Tips for Better Listings
        </h3>
        <ul className="text-blue-700 space-y-2">
          <li><i className="fas fa-check text-blue-500 mr-2"></i>Use clear, descriptive titles</li>
          <li><i className="fas fa-check text-blue-500 mr-2"></i>Provide detailed descriptions</li>
          <li><i className="fas fa-check text-blue-500 mr-2"></i>Set fair, competitive prices</li>
          <li><i className="fas fa-check text-blue-500 mr-2"></i>Be honest about the condition</li>
          <li><i className="fas fa-check text-blue-500 mr-2"></i>Respond quickly to interested buyers</li>
        </ul>
      </div>
    </div>
  );
};

export default AddProductPage;