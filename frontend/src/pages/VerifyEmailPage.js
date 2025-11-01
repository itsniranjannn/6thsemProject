import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Mail, 
  AlertCircle,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    verifyEmailToken();
  }, [token]);

  const verifyEmailToken = async () => {
    if (!token) {
      setVerificationStatus('error');
      setMessage('Invalid verification link. Token is missing.');
      return;
    }

    try {
      console.log('🔐 Verifying email token:', token);
      
      const response = await fetch('http://localhost:5000/api/users/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      const data = await response.json();
      console.log('📧 Verification response:', data);

      if (data.success) {
        setVerificationStatus('success');
        setMessage(data.message || 'Email verified successfully!');
        
        // Update localStorage if user is logged in
        const currentUser = JSON.parse(localStorage.getItem('user'));
        if (currentUser) {
          const updatedUser = { ...currentUser, emailVerified: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      } else {
        setVerificationStatus('error');
        setMessage(data.message || 'Email verification failed.');
      }
    } catch (error) {
      console.error('❌ Verification error:', error);
      setVerificationStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  const handleResendVerification = async () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (!currentUser) {
      setMessage('Please log in to resend verification email.');
      return;
    }

    setIsResending(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: currentUser.email })
      });

      const data = await response.json();
      if (data.success) {
        setMessage('Verification email sent! Please check your inbox.');
      } else {
        setMessage(data.message || 'Failed to send verification email.');
      }
    } catch (error) {
      console.error('❌ Resend error:', error);
      setMessage('Error sending verification email. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white rounded-2xl p-8 shadow-2xl border border-gray-200 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
            verificationStatus === 'verifying' ? 'bg-blue-100' :
            verificationStatus === 'success' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            {verificationStatus === 'verifying' && (
              <RefreshCw className="w-10 h-10 text-blue-600 animate-spin" />
            )}
            {verificationStatus === 'success' && (
              <CheckCircle className="w-10 h-10 text-green-600" />
            )}
            {verificationStatus === 'error' && (
              <XCircle className="w-10 h-10 text-red-600" />
            )}
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {verificationStatus === 'verifying' && 'Verifying Email...'}
            {verificationStatus === 'success' && 'Email Verified!'}
            {verificationStatus === 'error' && 'Verification Failed'}
          </h1>
          
          <p className="text-gray-600">
            {verificationStatus === 'verifying' && 'Please wait while we verify your email address.'}
            {verificationStatus === 'success' && 'Your email has been successfully verified.'}
            {verificationStatus === 'error' && 'We encountered an issue verifying your email.'}
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-xl mb-6 ${
            verificationStatus === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : verificationStatus === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-blue-50 text-blue-700 border border-blue-200'
          }`}>
            <div className="flex items-start space-x-3">
              {verificationStatus === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
              {verificationStatus === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />}
              {verificationStatus === 'verifying' && <RefreshCw className="w-5 h-5 mt-0.5 flex-shrink-0 animate-spin" />}
              <p className="text-sm leading-relaxed">{message}</p>
            </div>
          </div>
        )}

        {/* Token Info (for debugging) */}
        {token && verificationStatus === 'error' && (
          <div className="bg-gray-50 p-3 rounded-xl mb-6">
            <p className="text-xs text-gray-600 break-all">
              <strong>Token:</strong> {token.substring(0, 50)}...
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          {verificationStatus === 'success' && (
            <>
              <button
                onClick={handleGoToDashboard}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold"
              >
                <CheckCircle size={20} />
                <span>Go to Dashboard</span>
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
              >
                <ArrowLeft size={20} />
                <span>Back to Home</span>
              </button>
            </>
          )}

          {verificationStatus === 'error' && (
            <>
              <button
                onClick={handleResendVerification}
                disabled={isResending}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-200 font-semibold disabled:opacity-50"
              >
                {isResending ? (
                  <RefreshCw size={20} className="animate-spin" />
                ) : (
                  <Mail size={20} />
                )}
                <span>
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </span>
              </button>
              
              <button
                onClick={handleGoToLogin}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors font-semibold"
              >
                <ArrowLeft size={20} />
                <span>Back to Login</span>
              </button>
            </>
          )}

          {verificationStatus === 'verifying' && (
            <div className="text-center py-4">
              <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Please wait...</p>
            </div>
          )}
        </div>

        {/* Additional Help */}
        {verificationStatus === 'error' && (
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="font-semibold text-amber-900 mb-2 flex items-center space-x-2">
              <AlertCircle size={16} />
              <span>Need Help?</span>
            </h4>
            <p className="text-sm text-amber-700">
              If you continue to experience issues, please contact our support team.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;