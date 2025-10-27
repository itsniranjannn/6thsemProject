import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';

const AdminLayout = ({ children, activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: '📊', color: 'blue' },
    { id: 'products', name: 'Products', icon: '🛍️', color: 'green' },
    { id: 'offers', name: 'Offers', icon: '🎁', color: 'orange' },
    { id: 'orders', name: 'Orders', icon: '📦', color: 'purple' },
    { id: 'users', name: 'Users', icon: '👥', color: 'indigo' },
    { id: 'promocodes', name: 'Promo Codes', icon: '🎫', color: 'pink' },
    { id: 'notifications', name: 'Notifications', icon: '🔔', color: 'red' }
  ];

  const getTabColor = (tabId) => {
    const colors = {
      'dashboard': 'from-blue-500 to-blue-600',
      'products': 'from-green-500 to-green-600',
      'offers': 'from-orange-500 to-orange-600',
      'orders': 'from-purple-500 to-purple-600',
      'users': 'from-indigo-500 to-indigo-600',
      'promocodes': 'from-pink-500 to-pink-600',
      'notifications': 'from-red-500 to-red-600'
    };
    return colors[tabId] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header - Fixed at top */}
      <div className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button - Hamburger */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
              >
                {sidebarOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
              
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold text-gray-900">Admin</h1>
                <p className="text-xs text-gray-600">{user?.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
              </div>
              <button
                onClick={logout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Mobile Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-xl border-r border-gray-200 z-50
        transform transition-transform duration-300 ease-in-out lg:hidden
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSidebarOpen(false);
              }}
              className={`
                w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-sm font-semibold 
                transition-all duration-200
                ${activeTab === tab.id
                  ? `bg-gradient-to-r ${getTabColor(tab.id)} text-white shadow-lg`
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-left flex-1">{tab.name}</span>
              {activeTab === tab.id && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </button>
          ))}
          
          {/* Mobile logout button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors border border-gray-200 mt-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar - Hidden on mobile */}
          <div className="hidden lg:block lg:w-64 bg-white rounded-2xl shadow-xl border border-gray-200 p-6 h-fit">
            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-sm font-semibold 
                    transition-all duration-200 transform hover:scale-105
                    ${activeTab === tab.id
                      ? `bg-gradient-to-r ${getTabColor(tab.id)} text-white shadow-lg scale-105`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-md'
                    }
                  `}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="text-left flex-1">{tab.name}</span>
                  {activeTab === tab.id && (
                    <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content - Full width on mobile, with sidebar space on desktop */}
          <div className="flex-1 min-w-0 w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Optional for quick access */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-4 z-40">
        <div className="flex justify-around items-center">
          {tabs.slice(0, 4).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex flex-col items-center p-2 rounded-lg transition-colors
                ${activeTab === tab.id
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
                }
              `}
            >
              <span className="text-lg">{tab.icon}</span>
              <span className="text-xs mt-1">{tab.name}</span>
            </button>
          ))}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center p-2 rounded-lg text-gray-600 hover:text-gray-900 transition-colors"
          >
            <span className="text-lg">📋</span>
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;