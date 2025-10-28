import React from 'react';

export const Toast = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-rose-500',
          border: 'border-l-4 border-rose-600',
          icon: '❌',
          title: 'Error',
          shadow: 'shadow-lg shadow-red-200/50',
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]',
          accent: 'from-rose-400 to-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-amber-500 to-orange-500',
          border: 'border-l-4 border-orange-600',
          icon: '⚠️',
          title: 'Warning',
          shadow: 'shadow-lg shadow-amber-200/50',
          glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]',
          accent: 'from-amber-400 to-orange-500'
        };
      case 'success':
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-500 to-green-500',
          border: 'border-l-4 border-green-600',
          icon: '✅',
          title: 'Success',
          shadow: 'shadow-lg shadow-emerald-200/50',
          glow: 'shadow-[0_0_20px_rgba(16,185,129,0.3)]',
          accent: 'from-emerald-400 to-green-500'
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className={`fixed top-6 right-6 ${styles.bg} ${styles.border} ${styles.shadow} ${styles.glow} text-white rounded-2xl z-50 animate-toast-slide-in max-w-sm transform transition-all duration-500 hover:scale-[1.02] hover:shadow-xl`}>
      {/* Header with gradient accent */}
      <div className={`h-1 bg-gradient-to-r ${styles.accent} rounded-t-2xl`}></div>
      
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {/* Icon Container */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-inner">
                <span className="text-xl filter drop-shadow-sm">{styles.icon}</span>
              </div>
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-bold text-white text-sm tracking-wide uppercase">
                  {styles.title}
                </span>
                <div className="w-1 h-1 bg-white/50 rounded-full"></div>
                <span className="text-xs text-white/80 font-medium">Just now</span>
              </div>
              <span className="text-white text-sm leading-relaxed font-medium block">
                {message}
              </span>
            </div>
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-200 transform hover:scale-110 hover:rotate-90 group ml-2"
            title="Close"
          >
            <svg className="w-4 h-4 text-white group-hover:text-white/90 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Progress Bar Container */}
      <div className="px-5 pb-4">
        <div className="w-full bg-white/20 backdrop-blur-sm rounded-full h-1.5 overflow-hidden">
          <div className="bg-white h-1.5 rounded-full animate-toast-progress transform origin-left"></div>
        </div>
      </div>
    </div>
  );
};

// Add this to your global CSS or style tag
const ToastStyles = () => (
  <style jsx>{`
    @keyframes toast-slide-in {
      from {
        opacity: 0;
        transform: translateX(100%) translateY(-20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateX(0) translateY(0) scale(1);
      }
    }
    
    @keyframes toast-progress {
      from {
        transform: scaleX(1);
      }
      to {
        transform: scaleX(0);
      }
    }
    
    .animate-toast-slide-in {
      animation: toast-slide-in 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
    }
    
    .animate-toast-progress {
      animation: toast-progress 3s linear forwards;
    }
    
    /* Custom scrollbar for toast container if needed */
    .toast-container::-webkit-scrollbar {
      width: 4px;
    }
    
    .toast-container::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
    }
    
    .toast-container::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 2px;
    }
  `}</style>
);

export default Toast;