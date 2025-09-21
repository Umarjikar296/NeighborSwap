// src/components/AddProductPage.jsx
import React, { useState } from 'react';
import { productAPI } from '../services/api';

const AddProductPage = ({ onProductAdded, setCurrentView }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Electronics',
        condition: 'Good'
    });
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const categories = [
        'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports',
        'Home & Garden', 'Toys', 'Other'
    ];

    const conditions = ['New', 'Like New', 'Good', 'Fair', 'Poor'];

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }
        setImages(files);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // Validate form
        if (!formData.name || !formData.description || !formData.price) {
            setError('Please fill in all required fields');
            setLoading(false);
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            setError('Price must be greater than 0');
            setLoading(false);
            return;
        }

        try {
            // Create FormData for file upload
            const productFormData = new FormData();
            productFormData.append('name', formData.name);
            productFormData.append('description', formData.description);
            productFormData.append('price', parseFloat(formData.price));
            productFormData.append('category', formData.category);
            productFormData.append('condition', formData.condition);

            // Add images
            images.forEach((image) => {
                productFormData.append('images', image);
            });

            const response = await productAPI.create(productFormData);

            setSuccess('Product added successfully!');

            // Reset form
            setFormData({
                name: '',
                description: '',
                price: '',
                category: 'Electronics',
                condition: 'Good'
            });
            setImages([]);

            // Notify parent component
            if (onProductAdded) {
                onProductAdded();
            }

            // Redirect to home after 2 seconds
            setTimeout(() => {
                setCurrentView('home');
            }, 2000);

        } catch (error) {
            console.error('Error creating product:', error);
            setError(error.response?.data?.error || 'Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-2xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">List Your Item</h2>
                    <p className="text-gray-600">Share something great with your neighbors</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex">
                            <i className="fas fa-exclamation-circle text-red-400 mr-2 mt-0.5"></i>
                            <span className="text-red-700">{error}</span>
                        </div>
                    </div>
                )}

                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex">
                            <i className="fas fa-check-circle text-green-400 mr-2 mt-0.5"></i>
                            <span className="text-green-700">{success}</span>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Images */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Photos (up to 5) *
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                            <i className="fas fa-cloud-upload-alt text-4xl text-gray-400 mb-4"></i>
                            <p className="text-gray-600 mb-4">Choose images for your product</p>
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                                id="image-upload"
                                max="5"
                            />
                            <label
                                htmlFor="image-upload"
                                className="bg-purple-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-purple-700 transition-colors inline-block">
                                Choose Images
                            </label>
                            {images.length > 0 && (
                                <p className="text-sm text-green-600 mt-2">
                                    {images.length} file(s) selected
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="e.g., iPhone 14 Pro Max"
                            maxLength={100}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.name.length}/100 characters</p>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Describe your item's condition, features, and any other relevant details..."
                            maxLength={500}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500 characters</p>
                    </div>

                    {/* Price, Category, Condition Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Price ($) *
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="0.00"
                                min="0.01"
                                step="0.01"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category *
                            </label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required>
                                {categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Condition *
                            </label>
                            <select
                                value={formData.condition}
                                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required>
                                {conditions.map(condition => (
                                    <option key={condition} value={condition}>{condition}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex justify-end space-x-4 pt-6">
                        <button
                            type="button"
                            onClick={() => setCurrentView('home')}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
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
        </div>
    );
};

export default AddProductPage;