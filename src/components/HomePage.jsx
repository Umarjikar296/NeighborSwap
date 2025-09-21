// src/components/HomePage.js
import React, { useState } from 'react';

const HomePage = ({ listings, searchTerm, setSearchTerm }) => {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('recent');

    const categories = ['All', 'Furniture', 'Electronics', 'Clothing', 'Sports', 'Books', 'Other'];

    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            listing.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Hero Section */}
            <div className="gradient-bg rounded-3xl p-8 md:p-12 mb-12 text-white relative overflow-hidden">
                <div className="relative z-10">
                    <div className="max-w-4xl">
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-float">
                            Trade Locally,<br />
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
                <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute right-32 bottom-0 w-64 h-64 bg-yellow-300/20 rounded-full translate-y-32"></div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center space-x-2">
                    <span className="text-gray-700 font-medium">Category:</span>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center space-x-2">
                    <span className="text-gray-700 font-medium">Sort by:</span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="recent">Most Recent</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="distance">Nearest First</option>
                    </select>
                </div>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredListings.map(listing => (
                    <div key={listing.id} className="bg-white rounded-2xl shadow-lg overflow-hidden card-hover">
                        <div className="relative">
                            <img
                                src={listing.images[0]}
                                alt={listing.title}
                                className="w-full h-56 object-cover"
                            />
                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                                <span className="text-purple-600 font-bold">${listing.price}</span>
                            </div>
                            <div className="absolute top-4 left-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                                {listing.condition}
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-bold text-xl text-gray-900 line-clamp-1">{listing.title}</h3>
                                <span className="text-purple-600 bg-purple-100 px-2 py-1 rounded-full text-xs">
                                    {listing.category}
                                </span>
                            </div>

                            <p className="text-gray-600 mb-4 line-clamp-2">{listing.description}</p>

                            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                <div className="flex items-center space-x-1">
                                    <i className="fas fa-map-marker-alt text-purple-500"></i>
                                    <span>{listing.distance}</span>
                                </div>
                                <span>{listing.timeAgo}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                            {listing.owner.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 text-sm">{listing.owner}</p>
                                        <div className="flex items-center space-x-1">
                                            <div className="flex items-center">
                                                {[...Array(5)].map((_, i) => (
                                                    <i key={i} className={`fas fa-star text-xs ${i < Math.floor(listing.rating) ? 'text-yellow-400' : 'text-gray-300'}`}></i>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500">{listing.rating}</span>
                                        </div>
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

            {filteredListings.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;