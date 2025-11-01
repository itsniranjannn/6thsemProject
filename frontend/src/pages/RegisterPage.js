import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Mail, 
  User, 
  Phone, 
  MapPin,
  Shield,
  Zap,
  ArrowLeft,
  Send
} from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    country: 'Nepal' // Default to Nepal
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Register, 2: Email Verification
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const { register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  // Floating animation for background elements
  useEffect(() => {
    const elements = document.querySelectorAll('.floating');
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.5}s`;
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation - only numbers and max 10 digits
    if (name === 'phone') {
      const phoneValue = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: phoneValue
      }));
      
      // Validate phone in real-time
      if (phoneValue && phoneValue.length !== 10) {
        setFieldErrors(prev => ({
          ...prev,
          phone: 'Phone number must be 10 digits'
        }));
      } else {
        setFieldErrors(prev => ({
          ...prev,
          phone: ''
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    // Clear field-specific errors when user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear general error
    if (error) setError('');
  };

  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'name':
        if (!value.trim()) errors.name = 'Full name is required';
        else if (value.trim().length < 2) errors.name = 'Name must be at least 2 characters';
        break;
        
      case 'email':
        if (!value.trim()) errors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = 'Please enter a valid email address';
        break;
        
      case 'password':
        if (!value) errors.password = 'Password is required';
        else if (value.length < 6) errors.password = 'Password must be at least 6 characters';
        break;
        
      case 'confirmPassword':
        if (!value) errors.confirmPassword = 'Please confirm your password';
        else if (value !== formData.password) errors.confirmPassword = 'Passwords do not match';
        break;
        
      case 'phone':
        if (value && value.length !== 10) errors.phone = 'Phone number must be 10 digits';
        break;
        
      default:
        break;
    }
    
    return errors;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all fields
    Object.keys(formData).forEach(key => {
      if (key === 'password' || key === 'confirmPassword' || key === 'name' || key === 'email') {
        const fieldErrors = validateField(key, formData[key]);
        Object.assign(errors, fieldErrors);
      }
    });
    
    // Validate phone if provided
    if (formData.phone && formData.phone.length !== 10) {
      errors.phone = 'Phone number must be 10 digits';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      if (result.requiresVerification) {
        setStep(2); // Move to verification step
        setVerificationMessage('Please check your email for verification instructions.');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }
    setLoading(false);
  };

  const handleVerification = async (e) => {
    e.preventDefault();
    if (!verificationCode) {
      setVerificationMessage('Please enter the verification code');
      return;
    }

    if (verificationCode.length !== 6) {
      setVerificationMessage('Please enter a valid 6-digit code');
      return;
    }

    setVerificationLoading(true);
    setVerificationMessage('');

    const result = await verifyEmail(verificationCode);
    
    if (result.success) {
      setVerificationMessage('Email verified successfully! Welcome to Nexus Store!');
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } else {
      setVerificationMessage(result.error || 'Invalid verification code');
    }
    
    setVerificationLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setVerificationMessage('');

    const result = await resendVerification(formData.email);
    
    if (result.success) {
      setVerificationMessage('New verification email sent! Check your inbox.');
    } else {
      setVerificationMessage(result.error || 'Failed to resend verification email');
    }
    
    setResendLoading(false);
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
  };

  const passwordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: '', checks: {} };
    
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };
    
    const strength = Object.values(checks).filter(Boolean).length;
    
    const strengthMap = {
      0: { text: 'Very Weak', color: 'text-red-500', bg: 'bg-red-500' },
      1: { text: 'Weak', color: 'text-red-400', bg: 'bg-red-400' },
      2: { text: 'Fair', color: 'text-orange-500', bg: 'bg-orange-500' },
      3: { text: 'Good', color: 'text-yellow-500', bg: 'bg-yellow-500' },
      4: { text: 'Strong', color: 'text-green-500', bg: 'bg-green-500' }
    };
    
    return { 
      ...strengthMap[strength], 
      strength,
      checks 
    };
  };

  const passwordInfo = passwordStrength(formData.password);

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.3, 0.2]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.2, 0.3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            x: [-100, 100, -100],
            y: [-50, 50, -50]
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className={`absolute w-2 h-2 bg-cyan-300 rounded-full opacity-30 floating-${i}`}
            style={{
              top: `${20 + i * 10}%`,
              left: `${10 + i * 12}%`
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2
            }}
          />
        ))}
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
            className="backdrop-blur-xl bg-white/10 backdrop-saturate-150 rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8"
          >
            {/* Header */}
            <motion.div 
              className="text-center space-y-4"
              variants={itemVariants}
            >
              <motion.div 
                className="mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg"
                whileHover={{ 
                  scale: 1.05,
                  rotate: 5
                }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
              <motion.h2 
                className="text-3xl font-bold text-white"
                variants={itemVariants}
              >
                {step === 1 ? 'Join Nexus Store' : 'Verify Your Email'}
              </motion.h2>
              <motion.p 
                className="text-gray-300"
                variants={itemVariants}
              >
                {step === 1 
                  ? 'Create your account and start shopping' 
                  : 'Enter the verification code sent to your email'
                }
              </motion.p>
            </motion.div>

            <AnimatePresence mode="wait">
              {step === 1 ? (
                /* Registration Form */
                <motion.form
                  key="register-form"
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
                    {/* Name Field */}
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="Enter your full name"
                        />
                      </div>
                      {fieldErrors.name && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          {fieldErrors.name}
                        </motion.p>
                      )}
                    </motion.div>
                    
                    {/* Email Field */}
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                        Email Address *
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
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="Enter your email"
                        />
                      </div>
                      {fieldErrors.email && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          {fieldErrors.email}
                        </motion.p>
                      )}
                    </motion.div>
                    
                    {/* Password Field */}
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
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
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 space-y-2"
                        >
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">Password strength:</span>
                            <span className={passwordInfo.color}>{passwordInfo.text}</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <motion.div 
                              className={`h-2 rounded-full transition-all duration-500 ${passwordInfo.bg}`}
                              initial={{ width: 0 }}
                              animate={{ 
                                width: passwordInfo.strength === 0 ? '5%' :
                                passwordInfo.strength === 1 ? '25%' :
                                passwordInfo.strength === 2 ? '50%' :
                                passwordInfo.strength === 3 ? '75%' : '100%'
                              }}
                            />
                          </div>
                          
                          {/* Password Requirements */}
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {[
                              { key: 'length', text: 'At least 8 characters' },
                              { key: 'uppercase', text: 'One uppercase letter' },
                              { key: 'number', text: 'One number' },
                              { key: 'special', text: 'One special character' }
                            ].map(req => (
                              <div key={req.key} className="flex items-center gap-1">
                                {passwordInfo.checks[req.key] ? (
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-gray-500" />
                                )}
                                <span className={passwordInfo.checks[req.key] ? 'text-green-400' : 'text-gray-400'}>
                                  {req.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                      {fieldErrors.password && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          {fieldErrors.password}
                        </motion.p>
                      )}
                    </motion.div>
                    
                    {/* Confirm Password Field */}
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-200 mb-2">
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className={`w-full pl-10 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm ${
                            formData.confirmPassword && formData.password !== formData.confirmPassword
                              ? 'border-red-500/50'
                              : formData.confirmPassword && formData.password === formData.confirmPassword
                              ? 'border-green-500/50'
                              : 'border-white/20'
                          }`}
                          placeholder="Confirm your password"
                        />
                        <motion.button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </motion.button>
                      </div>
                      {formData.confirmPassword && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={`text-xs mt-1 flex items-center gap-1 ${
                            formData.password !== formData.confirmPassword ? 'text-red-400' : 'text-green-400'
                          }`}
                        >
                          {formData.password !== formData.confirmPassword ? (
                            <>
                              <XCircle className="w-3 h-3" />
                              Passwords do not match
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Passwords match
                            </>
                          )}
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Phone Field */}
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-200 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="98XXXXXXXX"
                          maxLength="10"
                        />
                      </div>
                      {fieldErrors.phone && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-red-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          {fieldErrors.phone}
                        </motion.p>
                      )}
                      {formData.phone && formData.phone.length === 10 && (
                        <motion.p 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-green-400 text-xs mt-1 flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Valid phone number
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Address Field */}
                    <motion.div
                      variants={itemVariants}
                      className="group"
                    >
                      <label htmlFor="address" className="block text-sm font-medium text-gray-200 mb-2">
                        Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                        <textarea
                          id="address"
                          name="address"
                          rows="2"
                          value={formData.address}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm resize-none"
                          placeholder="Enter your address"
                        />
                      </div>
                    </motion.div>

                    <motion.div 
                      className="grid grid-cols-2 gap-4"
                      variants={itemVariants}
                    >
                      <div className="group">
                        <label htmlFor="city" className="block text-sm font-medium text-gray-200 mb-2">
                          City
                        </label>
                        <input
                          id="city"
                          name="city"
                          type="text"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="City"
                        />
                      </div>

                      <div className="group">
                        <label htmlFor="country" className="block text-sm font-medium text-gray-200 mb-2">
                          Country
                        </label>
                        <input
                          id="country"
                          name="country"
                          type="text"
                          value={formData.country}
                          onChange={handleChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
                          placeholder="Country"
                        />
                      </div>
                    </motion.div>
                  </div>

                  <div className="text-xs text-gray-400">
                    <p>Fields marked with * are required</p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    />
                    <span className="relative flex items-center justify-center">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Creating Account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </span>
                  </motion.button>
                </motion.form>
              ) : (
                /* Email Verification Form */
                <motion.form
                  key="verification-form"
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-6"
                  onSubmit={handleVerification}
                >
                  <motion.div 
                    className="text-center space-y-4"
                    variants={itemVariants}
                  >
                    <motion.div 
                      className="mx-auto w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center"
                      whileHover={{ scale: 1.1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <Mail className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-white">Check Your Email</h3>
                    <p className="text-gray-300 text-sm">
                      We've sent a 6-digit verification code to <strong className="text-white">{formData.email}</strong>
                    </p>
                  </motion.div>

                  {verificationMessage && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`px-4 py-3 rounded-xl backdrop-blur-sm flex items-center gap-2 ${
                        verificationMessage.includes('successfully') 
                          ? 'bg-green-500/20 border border-green-500/30 text-green-200'
                          : 'bg-red-500/20 border border-red-500/30 text-red-200'
                      }`}
                    >
                      {verificationMessage.includes('successfully') ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <XCircle className="w-5 h-5" />
                      )}
                      {verificationMessage}
                    </motion.div>
                  )}

                  <motion.div variants={itemVariants}>
                    <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-200 mb-2">
                      Verification Code
                    </label>
                    <input
                      id="verificationCode"
                      type="text"
                      required
                      value={verificationCode}
                      onChange={handleCodeChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm text-center text-2xl tracking-widest font-mono"
                      placeholder="000000"
                      maxLength="6"
                      pattern="[0-9]*"
                      inputMode="numeric"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Enter the 6-digit code</span>
                      <span>{verificationCode.length}/6</span>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex space-x-3"
                    variants={itemVariants}
                  >
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 border border-white/20 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={verificationLoading || verificationCode.length !== 6}
                      className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      whileHover={verificationCode.length === 6 ? { scale: 1.02 } : {}}
                      whileTap={verificationCode.length === 6 ? { scale: 0.98 } : {}}
                    >
                      {verificationLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                          />
                          Verifying...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Verify Email
                        </>
                      )}
                    </motion.button>
                  </motion.div>

                  <motion.div 
                    className="text-center"
                    variants={itemVariants}
                  >
                    <motion.button
                      type="button"
                      onClick={handleResendVerification}
                      disabled={resendLoading}
                      className="text-sm text-cyan-300 hover:text-cyan-200 transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
                      whileHover={{ scale: 1.05 }}
                    >
                      {resendLoading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-3 h-3 border-2 border-cyan-300 border-t-transparent rounded-full"
                          />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          Didn't receive the code? Resend
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
                {step === 1 ? (
                  <>
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
                    >
                      Sign in here
                    </Link>
                  </>
                ) : (
                  <>
                    Need help?{' '}
                    <a 
                      href="mailto:support@nexusstore.com" 
                      className="font-semibold text-cyan-300 hover:text-cyan-200 transition-colors duration-200"
                    >
                      Contact Support
                    </a>
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
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;