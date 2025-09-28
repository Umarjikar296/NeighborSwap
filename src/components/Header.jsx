// src/components/Header.jsx
import React from 'react';

const Header = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => setCurrentView('home')}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                <i className="fas fa-home text-white"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">NeighborSwap</h1>
            </button>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => setCurrentView('home')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === 'home'
                  ? 'text-purple-600 bg-purple-50'
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              <i className="fas fa-home mr-2"></i>
              Home
            </button>

            {user && (
              <>
                <button
                  onClick={() => setCurrentView('add-product')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'add-product'
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  <i className="fas fa-plus-circle mr-2"></i>
                  List Product
                </button>

                <button
                  onClick={() => setCurrentView('my-products')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'my-products'
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  <i className="fas fa-box mr-2"></i>
                  My Products
                </button>

                <button
                  onClick={() => setCurrentView('profile')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentView === 'profile'
                      ? 'text-purple-600 bg-purple-50'
                      : 'text-gray-700 hover:text-purple-600'
                  }`}
                >
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </button>
              </>
            )}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">Welcome back!</p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setCurrentView('login')}
                  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setCurrentView('register')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-purple-600">
              <i className="fas fa-bars text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;