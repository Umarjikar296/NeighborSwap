// src/components/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { productAPI } from '../services/api';

const ProfilePage = ({ user, setCurrentView }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [userProducts, setUserProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProducts();
  }, []);

  const fetchUserProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getUserProducts(user.id);
      setUserProducts(response.data);
    } catch (error) {
      console.error('Error fetching user products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            {user?.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                <i className="fas fa-check text-white text-xs"></i>
              </div>
            )}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{user?.name || 'User'}</h1>
              {user?.isVerified && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                  Verified
                </span>
              )}
            </div>
            
            <p className="text-gray-600 mb-4">{user?.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <i className="fas fa-phone text-purple-500"></i>
                <span>{user?.phone}</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-calendar text-purple-500"></i>
                <span>Joined {new Date(user?.createdAt).toLocaleDateString() || 'Recently'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <i className="fas fa-star text-yellow-400"></i>
                <span>{user?.ratings?.average?.toFixed(1) || '0.0'} ({user?.ratings?.count || 0} reviews)</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => setCurrentView('add-product')}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <i className="fas fa-plus mr-2"></i>
              Add Product
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('products')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'products'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              My Products ({userProducts.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              Settings
            </button>
          </nav>
        </div>

        <div className="p-8">
          {activeTab === 'products' && (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                </div>
              ) : userProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userProducts.map(product => (
                    <div key={product._id} className="bg-gray-50 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <img
                        src={product.images[0] || 'https://via.placeholder.com/300x200?text=No+Image'}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                        }}
                      />
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
                          <span className="text-purple-600 font-bold">${product.price}</span>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full">
                            {product.category}
                          </span>
                          <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
                            {product.condition}
                          </span>
                        </div>
                        <div className="mt-3 text-xs text-gray-500">
                          Added {new Date(product.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No products yet</h3>
                  <p className="text-gray-600 mb-6">Start by adding your first product!</p>
                  <button
                    onClick={() => setCurrentView('add-product')}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
                    <i className="fas fa-plus mr-2"></i>
                    Add Your First Product
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={user?.name || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={user?.phone || ''}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      readOnly
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-4">
                    <i className="fas fa-info-circle mr-1"></i>
                    Contact support to update your account information
                  </p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    <span className="ml-3 text-gray-700">Email notifications for new messages</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    <span className="ml-3 text-gray-700">SMS notifications for urgent updates</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="ml-3 text-gray-700">Weekly summary emails</span>
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    <span className="ml-3 text-gray-700">Show my profile to other users</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" defaultChecked />
                    <span className="ml-3 text-gray-700">Allow others to see my ratings</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
                    <span className="ml-3 text-gray-700">Make my products searchable</span>
                  </label>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
                <div className="space-y-3">
                  <button className="w-full text-left px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <i className="fas fa-download mr-3 text-gray-600"></i>
                    Download my data
                  </button>
                  <button className="w-full text-left px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
                    <i className="fas fa-trash mr-3"></i>
                    Delete my account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;