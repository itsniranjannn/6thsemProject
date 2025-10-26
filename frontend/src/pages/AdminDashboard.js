import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import AdminLayout from '../components/admin/AdminLayout.js';
import Dashboard from '../components/admin/Dashboard.js';
import ProductsManagement from '../components/admin/ProductsManagement.js';
import OrdersManagement from '../components/admin/OrdersManagement.js';
import UsersManagement from '../components/admin/UsersManagement.js';
import PromoCodesManagement from '../components/admin/PromoCodesManagement.js';
import NotificationsManagement from '../components/admin/NotificationsManagement.js';
import OffersManagement from '../components/admin/OffersManagement.js'; 

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsManagement />;
      case 'orders':
        return <OrdersManagement />;
      case 'users':
        return <UsersManagement />;
      case 'promocodes':
        return <PromoCodesManagement />;
      case 'notifications':
        return <NotificationsManagement />;
      case 'offers':
        return <OffersManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  );
};

export default AdminDashboard;