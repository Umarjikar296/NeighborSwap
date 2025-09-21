import React, { useState } from 'react';

const HomePage = ({ products = [], loading = false, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Electronics', 'Furniture', 'Clothing', 'Books', 'Sports', 'Home & Garden', 'Toys', 'Other'];

  // Fix: Add safety check for products
  const filteredProducts = (products || []).filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-8 md:p-12 mb-12 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Trade Locally,<br/>
              <span className="text-yellow-300">Connect Globally</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Discover amazing items in your neighborhood and build trust with verified local traders.
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for items in your area..."
                className="w-full px-6 py-4 pr-16 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 focus:ring-purple-300/50 shadow-xl"
              />
              <button className="absolute right-2 top-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-xl transition-colors">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-8">
        <div className="flex items-center space-x-2">
          <span className="text-gray-700 font-medium">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
            <i className="fas fa-sync-alt"></i>
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map(product => (
            <div key={product._id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative">
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                  alt={product.name}
                  className="w-full h-56 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-purple-600 font-bold">${product.price}</span>
                </div>
                <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  {product.condition}
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
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {product.owner?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.owner?.name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors">
                    <i className="fas fa-envelope mr-1"></i>
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            {products.length === 0 ? 'No products available' : 'No items found'}
          </h3>
          <p className="text-gray-600 mb-4">
            {products.length === 0 
              ? 'Be the first to add a product!' 
              : 'Try adjusting your search or filter criteria.'}
          </p>
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh Products
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default HomePage;