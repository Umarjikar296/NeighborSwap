import React from 'react';

const Header = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
              <i className="fas fa-home text-white text-xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">NeighborSwap</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setCurrentView('home')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'home' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-600'
              }`}>
              Browse
            </button>
            <button 
              onClick={() => setCurrentView('add-product')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                currentView === 'add-product' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-600'
              }`}>
              List Item
            </button>
            {user && (
              <button 
                onClick={() => setCurrentView('profile')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentView === 'profile' ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:text-purple-600'
                }`}>
                Profile
              </button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">{user.name?.charAt(0)}</span>
                </div>
                <span className="hidden sm:block text-gray-700 font-medium">{user.name}</span>
                <button 
                  onClick={onLogout}
                  className="text-gray-500 hover:text-red-500 transition-colors">
                  <i className="fas fa-sign-out-alt"></i>
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button 
                  onClick={() => setCurrentView('login')}
                  className="text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                  Sign In
                </button>
                <button 
                  onClick={() => setCurrentView('register')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;