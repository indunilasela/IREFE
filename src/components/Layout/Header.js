import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, User, LogOut, Settings, Key } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'Admin': 'Administrator',
      'DIA': 'Divisional Irrigation Assistant',
      'DA': 'Divisional Agrarian Officer',
      'EA': 'Engineering Assistant',
      'FA': 'Field Assistant',
      'Irrigator': 'Irrigator',
      'Farmer': 'Farmer'
    };
    return roleNames[role] || role;
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="h-7 w-7 sm:h-8 sm:w-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Droplets className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm sm:text-xl font-bold text-gray-900 truncate">
              Water Management System
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Irrigation & Resource Management
            </p>
          </div>
        </div>

        {/* User Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 sm:space-x-3 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500">{getRoleDisplayName(user?.role)}</p>
            </div>
            <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
              <div className="px-3 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                <p className="text-xs text-gray-400 mt-1">{getRoleDisplayName(user?.role)}</p>
              </div>
              
              <button
                onClick={() => {
                  navigate('/change-password');
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
              >
                <Key className="h-4 w-4 flex-shrink-0" />
                <span>Change Password</span>
              </button>
              
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
};

export default Header;