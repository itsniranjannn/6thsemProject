import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const PaymentFailurePage = () => {
  const location = useLocation();
  const { orderId, gateway } = location.state || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8 text-center">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          
          <div className="space-y-3 mb-8">
            <p className="text-gray-600">We're sorry, but your payment could not be processed.</p>
            {gateway && (
              <p className="text-sm text-gray-500">
                Payment Gateway: {gateway.toUpperCase()}
              </p>
            )}
            {orderId && (
              <p className="text-sm text-gray-500">
                Order ID: <span className="font-mono">#{orderId}</span>
              </p>
            )}
          </div>

          <div className="space-y-4">
            <button
              onClick={() => window.history.back()}
              className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Try Again
            </button>
            
            <Link
              to="/checkout"
              className="block w-full btn-secondary"
            >
              Back to Checkout
            </Link>
            
            <Link
              to="/"
              className="block w-full text-gray-600 hover:text-gray-800 py-2"
            >
              Return to Home
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Need help? Contact our support team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailurePage;