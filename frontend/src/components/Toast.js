import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info, 
  X,
  Bell,
  ShoppingBag,
  CreditCard,
  Gift,
  Star
} from 'lucide-react';

// Main Toast Component (named export)
export const Toast = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 5000,
  title,
  action,
  position = 'top-right',
  showProgress = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setProgress(100);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, duration);

      const progressInterval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (duration / 100))));
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [message, duration, onClose]);

  const getToastConfig = () => {
    const configs = {
      success: {
        icon: CheckCircle,
        gradient: 'from-emerald-500 to-green-500',
        accent: 'from-emerald-400 to-green-400',
        bg: 'bg-gradient-to-r from-emerald-50 to-green-50',
        border: 'border-l-4 border-emerald-500',
        text: 'text-emerald-900',
        iconColor: 'text-emerald-600',
        glow: 'shadow-[0_0_30px_rgba(16,185,129,0.2)]',
        progress: 'bg-emerald-500'
      },
      error: {
        icon: XCircle,
        gradient: 'from-red-500 to-rose-500',
        accent: 'from-rose-400 to-red-400',
        bg: 'bg-gradient-to-r from-red-50 to-rose-50',
        border: 'border-l-4 border-red-500',
        text: 'text-red-900',
        iconColor: 'text-red-600',
        glow: 'shadow-[0_0_30px_rgba(239,68,68,0.2)]',
        progress: 'bg-red-500'
      },
      warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500 to-orange-500',
        accent: 'from-amber-400 to-orange-400',
        bg: 'bg-gradient-to-r from-amber-50 to-orange-50',
        border: 'border-l-4 border-amber-500',
        text: 'text-amber-900',
        iconColor: 'text-amber-600',
        glow: 'shadow-[0_0_30px_rgba(245,158,11,0.2)]',
        progress: 'bg-amber-500'
      },
      info: {
        icon: Info,
        gradient: 'from-blue-500 to-cyan-500',
        accent: 'from-cyan-400 to-blue-400',
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-l-4 border-blue-500',
        text: 'text-blue-900',
        iconColor: 'text-blue-600',
        glow: 'shadow-[0_0_30px_rgba(59,130,246,0.2)]',
        progress: 'bg-blue-500'
      },
      promotion: {
        icon: Gift,
        gradient: 'from-purple-500 to-pink-500',
        accent: 'from-pink-400 to-purple-400',
        bg: 'bg-gradient-to-r from-purple-50 to-pink-50',
        border: 'border-l-4 border-purple-500',
        text: 'text-purple-900',
        iconColor: 'text-purple-600',
        glow: 'shadow-[0_0_30px_rgba(168,85,247,0.2)]',
        progress: 'bg-purple-500'
      },
      order: {
        icon: ShoppingBag,
        gradient: 'from-indigo-500 to-blue-500',
        accent: 'from-blue-400 to-indigo-400',
        bg: 'bg-gradient-to-r from-indigo-50 to-blue-50',
        border: 'border-l-4 border-indigo-500',
        text: 'text-indigo-900',
        iconColor: 'text-indigo-600',
        glow: 'shadow-[0_0_30px_rgba(99,102,241,0.2)]',
        progress: 'bg-indigo-500'
      },
      payment: {
        icon: CreditCard,
        gradient: 'from-teal-500 to-emerald-500',
        accent: 'from-emerald-400 to-teal-400',
        bg: 'bg-gradient-to-r from-teal-50 to-emerald-50',
        border: 'border-l-4 border-teal-500',
        text: 'text-teal-900',
        iconColor: 'text-teal-600',
        glow: 'shadow-[0_0_30px_rgba(20,184,166,0.2)]',
        progress: 'bg-teal-500'
      }
    };
    return configs[type] || configs.success;
  };

  const getDefaultTitle = () => {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Information',
      promotion: 'Special Offer',
      order: 'Order Update',
      payment: 'Payment Status'
    };
    return titles[type] || 'Notification';
  };

  const toastConfig = getToastConfig();
  const IconComponent = toastConfig.icon;

  const positionClasses = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick();
    }
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  if (!message) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
            y: position.includes('top') ? -50 : position.includes('bottom') ? 50 : 0,
            scale: 0.8
          }}
          animate={{ 
            opacity: 1, 
            x: 0, 
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            x: position.includes('right') ? 100 : position.includes('left') ? -100 : 0,
            y: position.includes('top') ? -50 : position.includes('bottom') ? 50 : 0,
            scale: 0.8
          }}
          transition={{ 
            type: "spring", 
            damping: 25, 
            stiffness: 300 
          }}
          className={`fixed ${positionClasses[position]} z-50 max-w-sm w-full`}
        >
          <div className={`${toastConfig.bg} ${toastConfig.border} ${toastConfig.glow} rounded-2xl overflow-hidden shadow-xl transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}>
            {/* Header with Gradient */}
            <div className={`bg-gradient-to-r ${toastConfig.gradient} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring" }}
                    className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg"
                  >
                    <IconComponent size={20} className="text-white" />
                  </motion.div>
                  <div>
                    <motion.h3
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="font-bold text-lg"
                    >
                      {title || getDefaultTitle()}
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/90 text-sm"
                    >
                      Just now
                    </motion.p>
                  </div>
                </div>
                
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                  }}
                  className="w-8 h-8 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 hover:rotate-90"
                >
                  <X size={16} className="text-white" />
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={`${toastConfig.text} font-medium leading-relaxed`}
              >
                {message}
              </motion.p>

              {/* Action Button */}
              {action && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-3"
                >
                  <button
                    onClick={handleAction}
                    className={`px-4 py-2 bg-gradient-to-r ${toastConfig.accent} text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg`}
                  >
                    {action.label}
                  </button>
                </motion.div>
              )}
            </div>

            {/* Progress Bar */}
            {showProgress && (
              <div className="px-4 pb-3">
                <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    initial={{ scaleX: 1 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 0.1 }}
                    className={`h-full ${toastConfig.progress} rounded-full origin-left`}
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Container for multiple toasts (named export)
export const ToastContainer = ({ toasts, position = 'top-right' }) => {
  const positionClasses = {
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6',
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-center': 'top-6 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-6 left-1/2 transform -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50 space-y-3`}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={toast.onClose}
          duration={toast.duration}
          title={toast.title}
          action={toast.action}
          position={position}
          showProgress={toast.showProgress}
        />
      ))}
    </div>
  );
};

const ToastComponent = Toast;
export default ToastComponent;
