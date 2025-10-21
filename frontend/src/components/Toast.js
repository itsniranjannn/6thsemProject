import React from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-500',
          border: 'border-l-4 border-red-600',
          icon: '❌',
          title: 'Error!',
          shadow: 'shadow-lg shadow-red-200'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-yellow-500',
          border: 'border-l-4 border-orange-600',
          icon: '⚠️',
          title: 'Warning!',
          shadow: 'shadow-lg shadow-orange-200'
        };
      case 'success':
      default:
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          border: 'border-l-4 border-green-600',
          icon: '✅', // Changed from cart icon for better clarity
          title: 'Success!',
          shadow: 'shadow-lg shadow-green-200'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`fixed top-4 right-4 ${styles.bg} ${styles.border} ${styles.shadow} text-white px-6 py-4 rounded-lg z-50 animate-fade-in-up max-w-sm transform transition-all duration-300 hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xl">{styles.icon}</span>
          <div>
            <span className="font-semibold text-white text-sm block leading-tight">
              {styles.title}
            </span>
            <span className="text-white text-xs opacity-90">{message}</span>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors transform hover:scale-110 p-1 rounded-full hover:bg-white hover:bg-opacity-20"
          title="Close"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-white bg-opacity-30 rounded-full h-1 mt-3">
        <div className="bg-white h-1 rounded-full animate-toast-progress"></div>
      </div>
    </div>
  );
};

// Add this to your global CSS or style tag
const ToastStyles = () => (
  <style jsx>{`
    @keyframes fade-in-up {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    @keyframes toast-progress {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
    .animate-fade-in-up {
      animation: fade-in-up 0.5s ease-out;
    }
    .animate-toast-progress {
      animation: toast-progress 3s linear forwards;
    }
  `}</style>
);

export default Toast;