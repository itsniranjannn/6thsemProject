// components/ConfirmationModal.js
import React from 'react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning" 
}) => {
  if (!isOpen) return null;

  const getStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-500',
          button: 'bg-red-600 hover:bg-red-700',
          icon: '⚠️'
        };
      case 'success':
        return {
          bg: 'bg-green-500',
          button: 'bg-green-600 hover:bg-green-700',
          icon: '✅'
        };
      case 'warning':
      default:
        return {
          bg: 'bg-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700',
          icon: '⚠️'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 transform animate-scale-in">
        {/* Header */}
        <div className={`${styles.bg} rounded-t-2xl p-6 text-white`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{styles.icon}</span>
            <h3 className="text-xl font-bold">{title}</h3>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6">
          <p className="text-gray-700 text-lg leading-relaxed">{message}</p>
        </div>
        
        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 ${styles.button} text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200 transform hover:scale-105`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Add styles to your global CSS or style tag
const ModalStyles = () => (
  <style jsx>{`
    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scale-in {
      from { 
        opacity: 0;
        transform: scale(0.9) translateY(-10px);
      }
      to { 
        opacity: 1;
        transform: scale(1) translateY(0);
      }
    }
    .animate-fade-in {
      animation: fade-in 0.3s ease-out;
    }
    .animate-scale-in {
      animation: scale-in 0.3s ease-out;
    }
  `}</style>
);

export default ConfirmationModal;