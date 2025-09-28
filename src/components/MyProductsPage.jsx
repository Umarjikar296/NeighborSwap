// src/components/MyProductsPage.jsx
import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';

const MyProductsPage = ({ user, setCurrentView }) => {
  const [myProducts, setMyProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchMyProducts();
    }
  }, [user]);

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getUserProducts(user.id);
      setMyProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching my products:', error);
      setError('Failed to load your products');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        // Add delete functionality later
        console.log('Delete product:', productId);
        // await productAPI.delete(productId);
        // fetchMyProducts(); // Refresh list
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Products</h1>
          <p className="text-gray-600 mt-2">Manage your listed items</p>
        </div>
        <button
          onClick={() => setCurrentView('add-product')}
          className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2"
        >
          <i className="fas fa-plus"></i>
          <span>Add New Product</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <i className="fas fa-exclamation-circle text-red-400 mr-2"></i>
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Products Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <i className="fas fa-box text-purple-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">{myProducts.length}</p>
              <p className="text-gray-600">Total Products</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <i className="fas fa-eye text-green-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">
                {myProducts.filter(p => p.status === 'active').length}
              </p>
              <p className="text-gray-600">Active Listings</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <i className="fas fa-handshake text-blue-600 text-xl"></i>
            </div>
            <div className="ml-4">
              <p className="text-2xl font-bold text-gray-900">0</p>
              <p className="text-gray-600">Completed Trades</p>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {myProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProducts.map(product => (
            <div key={product._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.name}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-purple-600 font-bold">${product.price}</span>
                </div>
                <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs text-white ${
                  product.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                }`}>
                  {product.status || 'active'}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{product.name}</h3>
                  <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-xs whitespace-nowrap ml-2">
                    {product.category}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{product.description}</p>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    Listed {new Date(product.createdAt).toLocaleDateString()}
                  </span>
                  <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
                    {product.condition}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => console.log('Edit product:', product._id)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <i className="fas fa-edit"></i>
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-1"
                  >
                    <i className="fas fa-trash"></i>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Products Yet</h3>
          <p className="text-gray-600 mb-6">
            You haven't listed any products yet. Start by adding your first item!
          </p>
          <button
            onClick={() => setCurrentView('add-product')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 inline-flex items-center space-x-2"
          >
            <i className="fas fa-plus"></i>
            <span>Add Your First Product</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProductsPage;