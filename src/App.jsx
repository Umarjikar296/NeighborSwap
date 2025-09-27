// src/App.jsx
import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import HomePage from './components/HomePage';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import AddProductPage from './components/AddProductPage';
import ProfilePage from './components/ProfilePage';
import { authAPI, productAPI } from './services/api';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authAPI.getMe().then(response => {
        setUser(response.data);
      }).catch(() => {
        localStorage.removeItem('token');
      });
    }
  }, []);

  // Fetch products on app load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
  try {
    setLoading(true);
    const response = await productAPI.getAll();
    // Extract the products array from the response
    setProducts(response.data.products || []);
  } catch (error) {
    console.error('Error fetching products:', error);
    setProducts([]); // Set empty array on error
  } finally {
    setLoading(false);
  }
};

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
    setCurrentView('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setCurrentView('home');
  };

  const handleProductAdded = () => {
    fetchProducts(); // Refresh products list
    setCurrentView('home');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'login':
        return <LoginPage onLogin={handleLogin} setCurrentView={setCurrentView} />;
      case 'register':
        return <RegisterPage onRegister={handleLogin} setCurrentView={setCurrentView} />;
      case 'add-product':
        return user ? (
          <AddProductPage onProductAdded={handleProductAdded} setCurrentView={setCurrentView} />
        ) : (
          <LoginPage onLogin={handleLogin} setCurrentView={setCurrentView} />
        );
      case 'profile':
        return user ? (
          <ProfilePage user={user} setCurrentView={setCurrentView} />
        ) : (
          <LoginPage onLogin={handleLogin} setCurrentView={setCurrentView} />
        );
      case 'home':
      default:
        return (
          <HomePage
            products={products}
            loading={loading}
            onRefresh={fetchProducts}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        onLogout={handleLogout}
      />

      <main>
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-2 rounded-lg">
                  <i className="fas fa-home text-white"></i>
                </div>
                <h3 className="text-xl font-bold">NeighborSwap</h3>
              </div>
              <p className="text-gray-400">Building stronger communities through trusted local trading.</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => setCurrentView('home')} className="hover:text-white transition-colors">Browse Items</button></li>
                <li><button onClick={() => setCurrentView('add-product')} className="hover:text-white transition-colors">List Item</button></li>
                <li><button onClick={() => setCurrentView('profile')} className="hover:text-white transition-colors">My Profile</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Safety Tips</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <i className="fab fa-instagram"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NeighborSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;