import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Key, 
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle
} from 'lucide-react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetStep, setResetStep] = useState(1); // 1: Enter email, 2: Enter code, 3: New password
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  
  const { login, forgotPassword: authForgotPassword, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Floating animation for background elements
  useEffect(() => {
    const elements = document.querySelectorAll('.floating');
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.5}s`;
    });
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate('/');
    } else {
      if (result.requiresVerification) {
        setError('Please verify your email before logging in. Check your email for the verification code.');
      } else {
        setError(result.error);
      }
    }
    setLoading(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail) {
      setResetMessage('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(resetEmail)) {
      setResetMessage('Please enter a valid email address');
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    const result = await authForgotPassword(resetEmail);
    
    if (result.success) {
      setResetMessage('Password reset code sent! Check your email for the 6-digit code.');
      setResetStep(2);
    } else {
      setResetMessage(result.error || 'Failed to send reset code');
    }
    
    setResetLoading(false);
  };

  const handleResetCodeSubmit = async (e) => {
    e.preventDefault();
    if (!resetCode) {
      setResetMessage('Please enter the verification code');
      return;
    }

    if (resetCode.length !== 6) {
      setResetMessage('Please enter a valid 6-digit code');
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    // Verify the code (this would typically be an API call)
    // For now, we'll assume the code is valid and move to next step
    setResetStep(3);
    setResetLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmNewPassword) {
      setResetMessage('Please enter and confirm your new password');
      return;
    }

    if (newPassword.length < 6) {
      setResetMessage('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setResetMessage('Passwords do not match');
      return;
    }

    setResetLoading(true);
    setResetMessage('');

    const result = await resetPassword(resetCode, newPassword, resetEmail);
    
    if (result.success) {
      setResetMessage('Password reset successfully! You can now login with your new password.');
      setTimeout(() => {
        setForgotPassword(false);
        setResetStep(1);
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmNewPassword('');
      }, 3000);
    } else {
      setResetMessage(result.error || 'Failed to reset password');
    }
    
    setResetLoading(false);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setResetCode(value);
  };

  const resetForgotPassword = () => {
    setForgotPassword(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetMessage('');
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const stepVariants = {
    enter: { opacity: 0, x: 50 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="floating absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="floating absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="floating absolute top-40 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        
        {/* Floating geometric shapes */}
        <div className="floating absolute top-20 left-20 w-4 h-4 bg-white rounded-full opacity-30 animate-bounce"></div>
        <div className="floating absolute top-40 right-32 w-6 h-6 bg-purple-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="floating absolute bottom-32 left-32 w-3 h-3 bg-blue-300 rounded-full opacity-50 animate-bounce"></div>
        <div className="floating absolute bottom-20 right-20 w-5 h-5 bg-pink-300 rounded-full opacity-30 animate-bounce"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Main Card */}
          <motion.div
            variants={itemVariants}
            className="backdrop-blur-lg bg-white/10 backdrop-saturate-150 rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8"
          >
            {/* Header */}
            <motion.div 
              className="text-center space-y-4"
              variants={itemVariants}
            >
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300"
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <span className="text-white font-bold text-2xl">N</span>
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold text-white"
                variants={itemVariants}
              >
                {forgotPassword 
                  ? resetStep === 1 ? 'Reset Password' 
                    : resetStep === 2 ? 'Enter Verification Code'
                    : 'Create New Password'
                  : 'Welcome Back'
                }
              </motion.h2>
              <motion.p 
                className="text-gray-300"
                variants={itemVariants}
              >
                {forgotPassword 
                  ? resetStep === 1 ? 'Enter your email to receive a verification code'
                    : resetStep === 2 ? 'Enter the 6-digit code sent to your email'
                    : 'Create a new password for your account'
                  : 'Sign in to your Nexus Store account'
                }
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!forgotPassword ? (
                /* Login Form */
                <motion.form
                  key="login-form"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                  onSubmit={handleSubmit}
                >
                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-500/20 border border-red-500/30 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      {error}
                    </motion.div>
                  )}
                  
                  <div className="space-y-4">
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="Enter your password"
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>

                  <div className="flex items-center justify-between">
                    <motion.button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-sm text-purple-300 hover:text-purple-200 transition-colors duration-200"
                      whileHover={{ scale: 1.05 }}
                    >
                      Forgot password?
                    </motion.button>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative flex items-center justify-center">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              ) : (
                /* Forgot Password Flow */
                <motion.form
                  key="forgot-password-form"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                  onSubmit={
                    resetStep === 1 ? handleForgotPassword :
                    resetStep === 2 ? handleResetCodeSubmit :
                    handlePasswordReset
                  }
                >
                  {resetMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-2 ${
                        resetMessage.includes('successfully') || resetMessage.includes('sent')
                          ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                          : 'bg-red-500/20 border border-red-500/30 text-red-200'
                      }`}
                    >
                      {resetMessage.includes('successfully') || resetMessage.includes('sent') ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      {resetMessage}
                    </motion.div>
                  )}

                  {/* Step 1: Enter Email */}
                  {resetStep === 1 && (
                    <motion.div
                      variants={itemVariants}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="resetEmail" className="block text-sm font-medium text-gray-200 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id="resetEmail"
                            type="email"
                            required
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                            placeholder="Enter your email"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Enter Verification Code */}
                  {resetStep === 2 && (
                    <motion.div
                      variants={itemVariants}
                      className="space-y-4"
                    >
                      <div className="text-center">
                        <p className="text-gray-300 text-sm mb-4">
                          We sent a 6-digit verification code to <strong className="text-white">{resetEmail}</strong>
                        </p>
                      </div>
                      <div>
                        <label htmlFor="resetCode" className="block text-sm font-medium text-gray-200 mb-2">
                          Verification Code
                        </label>
                        <input
                          id="resetCode"
                          type="text"
                          required
                          value={resetCode}
                          onChange={handleCodeChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-center text-2xl tracking-widest font-mono"
                          placeholder="000000"
                          maxLength="6"
                          pattern="[0-9]*"
                          inputMode="numeric"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-2">
                          <span>Enter the 6-digit code</span>
                          <span>{resetCode.length}/6</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: New Password */}
                  {resetStep === 3 && (
                    <motion.div
                      variants={itemVariants}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-200 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id="newPassword"
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                            placeholder="Enter new password"
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </motion.button>
                        </div>
                        {newPassword && newPassword.length < 6 && (
                          <p className="text-red-400 text-xs mt-1">
                            Password must be at least 6 characters
                          </p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-200 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            id="confirmNewPassword"
                            type={showConfirmNewPassword ? 'text' : 'password'}
                            required
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                              confirmNewPassword && newPassword !== confirmNewPassword
                                ? 'border-red-500/50'
                                : confirmNewPassword && newPassword === confirmNewPassword
                                ? 'border-green-500/50'
                                : 'border-white/20'
                            }`}
                            placeholder="Confirm new password"
                          />
                          <motion.button
                            type="button"
                            onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </motion.button>
                        </div>
                        {confirmNewPassword && newPassword !== confirmNewPassword && (
                          <p className="text-red-400 text-xs mt-1">
                            Passwords do not match
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <motion.div 
                    className="flex space-x-3"
                    variants={itemVariants}
                  >
                    <motion.button
                      type="button"
                      onClick={
                        resetStep === 1 ? resetForgotPassword :
                        resetStep === 2 ? () => setResetStep(1) :
                        () => setResetStep(2)
                      }
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={resetLoading || 
                        (resetStep === 2 && resetCode.length !== 6) ||
                        (resetStep === 3 && (!newPassword || !confirmNewPassword || newPassword !== confirmNewPassword || newPassword.length < 6))
                      }
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {resetLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          {resetStep === 1 ? 'Sending...' : 
                           resetStep === 2 ? 'Verifying...' : 
                           'Resetting...'}
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          {resetStep === 1 ? 'Send Code' : 
                           resetStep === 2 ? 'Verify Code' : 
                           'Reset Password'}
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Footer */}
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              <p className="text-gray-300 text-sm">
                {!forgotPassword ? (
                  <>
                    Don't have an account?{' '}
                    <Link 
                      to="/register" 
                      className="font-semibold text-purple-300 hover:text-purple-200 transition-colors duration-200"
                    >
                      Create one here
                    </Link>
                  </>
                ) : (
                  <>
                    Remember your password?{' '}
                    <button
                      onClick={resetForgotPassword}
                      className="font-semibold text-purple-300 hover:text-purple-200 transition-colors duration-200"
                    >
                      Back to login
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          </motion.div>

          {/* Additional Info */}
          <motion.div 
            className="mt-8 text-center"
            variants={itemVariants}
          >
            <p className="text-gray-400 text-xs">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;