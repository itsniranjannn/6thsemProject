import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Info,
  X,
  Loader2
} from 'lucide-react';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning",
  isLoading = false,
  confirmButtonProps = {},
  cancelButtonProps = {},
  size = "md",
  showCloseButton = true,
  overlayClose = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getModalConfig = () => {
    const configs = {
      danger: {
        icon: XCircle,
        iconColor: 'text-red-500',
        gradient: 'from-red-500 to-rose-500',
        button: 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700',
        accent: 'bg-red-500',
        glow: 'shadow-[0_0_40px_rgba(239,68,68,0.3)]'
      },
      success: {
        icon: CheckCircle,
        iconColor: 'text-emerald-500',
        gradient: 'from-emerald-500 to-green-500',
        button: 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
        accent: 'bg-emerald-500',
        glow: 'shadow-[0_0_40px_rgba(16,185,129,0.3)]'
      },
      warning: {
        icon: AlertTriangle,
        iconColor: 'text-amber-500',
        gradient: 'from-amber-500 to-orange-500',
        button: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
        accent: 'bg-amber-500',
        glow: 'shadow-[0_0_40px_rgba(245,158,11,0.3)]'
      },
      info: {
        icon: Info,
        iconColor: 'text-blue-500',
        gradient: 'from-blue-500 to-cyan-500',
        button: 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700',
        accent: 'bg-blue-500',
        glow: 'shadow-[0_0_40px_rgba(59,130,246,0.3)]'
      }
    };
    return configs[type] || configs.warning;
  };

  const modalConfig = getModalConfig();
  const IconComponent = modalConfig.icon;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && overlayClose && !isLoading) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!isLoading) {
      onConfirm();
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ 
              opacity: 0, 
              scale: 0.8,
              y: 20
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              y: 0
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.8,
              y: 20
            }}
            transition={{ 
              duration: 0.4, 
              ease: [0.25, 0.46, 0.45, 0.94],
              scale: { duration: 0.3 }
            }}
            className={`${sizeClasses[size]} w-full bg-white rounded-3xl shadow-2xl overflow-hidden ${modalConfig.glow}`}
          >
            {/* Header with Gradient */}
            <div className={`relative bg-gradient-to-r ${modalConfig.gradient} p-6 text-white`}>
              <div className="flex items-center space-x-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, duration: 0.5, type: "spring" }}
                  className="flex-shrink-0"
                >
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
                    <IconComponent size={24} className="text-white" />
                  </div>
                </motion.div>
                
                <div className="flex-1">
                  <motion.h3
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl font-bold"
                  >
                    {title}
                  </motion.h3>
                </div>

                {showCloseButton && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-shrink-0 w-10 h-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 hover:rotate-90"
                  >
                    <X size={20} className="text-white" />
                  </motion.button>
                )}
              </div>

              {/* Animated Progress Bar */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 4, ease: "linear" }}
                className="absolute bottom-0 left-0 right-0 h-1 bg-white/30 origin-left"
              />
            </div>

            {/* Body */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6"
            >
              <div className="space-y-4">
                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                  {message}
                </p>
                
                {/* Additional Content Slot */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${modalConfig.accent} animate-pulse`} />
                    <p className="text-sm text-gray-600 font-medium">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 p-6 bg-gray-50 border-t border-gray-200"
            >
              <button
                onClick={handleClose}
                disabled={isLoading}
                {...cancelButtonProps}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 hover:scale-105 active:scale-95 shadow-sm"
              >
                <span>{cancelText}</span>
              </button>
              
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                {...confirmButtonProps}
                className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 ${modalConfig.button} text-white rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 shadow-lg relative overflow-hidden group`}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">{confirmText}</span>
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.5 }}
                    />
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


export default ConfirmationModal;