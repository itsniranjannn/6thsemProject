// frontend/src/components/SupportWidget.js
import React, { useState } from 'react';
import { Toast } from './Toast.js';

const SupportWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'success' }), 4000);
  };

  const handleEmailSupport = () => {
    const email = 'support@nexusstore.com';
    const subject = 'Support Request - Nexus Store';
    const body = 'Hello Nexus Store Support Team,\n\nI need assistance with:\n\n[Please describe your issue here]\n\nThank you.';
    
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handleLiveChat = () => {
    showToast('Live chat feature coming soon! Our team is working on it.', 'info');
  };

  const handleCallSupport = () => {
    showToast('Call support: +977-1-4000000 (9 AM - 6 PM)', 'info');
  };

  const handleFAQ = () => {
    window.open('/faq', '_blank');
  };

  return (
    <>
      <Toast 
        message={toast.message} 
        type={toast.type} 
        onClose={() => setToast({ message: '', type: 'success' })} 
      />
      
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Help Icon Button */}
        <div 
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl cursor-pointer group-hover:scale-110 transition-all duration-300 hover:shadow-3xl"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <svg
            className="w-7 h-7"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Expanded Info Panel */}
        <div className={`absolute bottom-20 right-0 bg-white rounded-2xl p-5 border border-blue-100 shadow-2xl w-80 transition-all duration-300 origin-bottom-right pointer-events-none ${
          isExpanded 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95'
        }`}>
          {/* Header */}
          <div className="flex items-center mb-3 gap-2">
            <div className="bg-blue-100 p-2 rounded-full">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">Need Help?</h3>
              <p className="text-green-600 text-xs font-medium">🟢 Online Now</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm mb-4">
            Our friendly support team is ready to assist you with payments, delivery, or product information.
          </p>

          {/* Contact Methods */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-blue-500">📧</span>
              <span>support@nexusstore.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-green-500">📞</span>
              <span>+977-1-4000000</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-purple-500">🕒</span>
              <span>Mon-Sun: 9:00 AM - 6:00 PM</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleEmailSupport}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 py-2 px-3 rounded-lg text-sm font-medium shadow-md transition-all duration-300 flex items-center justify-center gap-1"
            >
              <span>📧</span>
              <span>Email</span>
            </button>
            <button
              onClick={handleLiveChat}
              className="bg-white border border-green-500 text-green-600 hover:bg-green-50 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>💬</span>
              <span>Chat</span>
            </button>
            <button
              onClick={handleCallSupport}
              className="bg-white border border-blue-500 text-blue-600 hover:bg-blue-50 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>📞</span>
              <span>Call</span>
            </button>
            <button
              onClick={handleFAQ}
              className="bg-white border border-purple-500 text-purple-600 hover:bg-purple-50 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <span>❓</span>
              <span>FAQ</span>
            </button>
          </div>

          {/* Quick Links */}
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex justify-between text-xs text-gray-500">
              <button 
                onClick={() => window.open('/track-order', '_blank')}
                className="hover:text-blue-600 transition-colors"
              >
                Track Order
              </button>
              <button 
                onClick={() => window.open('/returns', '_blank')}
                className="hover:text-blue-600 transition-colors"
              >
                Returns
              </button>
              <button 
                onClick={() => window.open('/shipping', '_blank')}
                className="hover:text-blue-600 transition-colors"
              >
                Shipping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Close when clicking outside */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsExpanded(false)}
        />
      )}
    </>
  );
};

export default SupportWidget;