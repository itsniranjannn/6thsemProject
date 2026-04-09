import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // NEW: Fetch fresh user profile from API
  const refreshUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        return { success: false, error: 'No token found' };
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const freshUser = data.user;
        localStorage.setItem('user', JSON.stringify(freshUser));
        setUser(freshUser);
        return { success: true, user: freshUser };
      } else {
        return { success: false, error: data.message || 'Failed to fetch profile' };
      }
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return { success: true, data };
      } else {
        // Check if email verification is required
        if (data.requiresVerification) {
          return { 
            success: false, 
            error: data.message || 'Email verification required',
            requiresVerification: true 
          };
        }
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (name, email, password, phone = '', address = '', city = '', country = 'Nepal') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          phone,
          address, 
          city,
          country
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Store token but don't set user as active until email verification
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        return { 
          success: true, 
          data,
          requiresVerification: data.requiresVerification || !data.user?.emailVerified 
        };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const verifyEmail = async (code, email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // MODIFIED: Refresh user profile from API instead of manually updating
        await refreshUserProfile();
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Verification failed' };
      }
    } catch (error) {
      console.error('Email verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const resendVerification = async (email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // ADDED: If already verified, refresh profile to update state
        if (data.alreadyVerified) {
          await refreshUserProfile();
        }
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to resend verification' };
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to send reset code' };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const resetPassword = async (code, newPassword, email) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, newPassword, email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Password reset failed' };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const updateProfile = async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Profile update failed' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const value = {
    user,
    login,
    register,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
    logout,
    updateUser,
    updateProfile,
    refreshUserProfile, // NEW: Export refresh function
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isEmailVerified: user?.email_verified || false
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};