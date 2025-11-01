const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { 
  sendEmailVerification, 
  sendPasswordReset, 
  sendPasswordChanged, 
  sendWelcome 
} = require('./emailController');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Enhanced register user with 6-digit code
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('📝 Registration attempt for:', email);

    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    const user = await User.create({ name, email, password });
    
    if (user) {
      console.log('✅ User created with ID:', user.insertId);
      
      // Send email verification with 6-digit code
      try {
        const emailResult = await sendEmailVerification({ 
          email: email, 
          name: name 
        }, user.emailVerificationToken);
        
        console.log(`📧 Verification email result:`, emailResult);
        
        if (!emailResult.success && process.env.NODE_ENV === 'production') {
          console.error('❌ Failed to send verification email in production');
        }
      } catch (emailError) {
        console.error('❌ Email sending error:', emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email for the 6-digit verification code.',
        user: {
          id: user.insertId,
          name,
          email,
          emailVerified: false
        },
        token: generateToken(user.insertId),
        requiresVerification: true
      });
    }
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Login user with email verification check
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (user && (await User.comparePassword(password, user.password))) {
      // Check if email is verified
      if (!user.email_verified) {
        return res.status(401).json({
          success: false,
          message: 'Email not verified. Please check your email for the verification code.',
          requiresVerification: true,
          email: user.email
        });
      }

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: user.email_verified || false,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        country: user.country || '',
        created_at: user.created_at,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }
  } catch (error) {
    res.status(400).json({ 
      success: false,
      message: error.message 
    });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile' 
    });
  }
};

// Verify email with 6-digit code
const verifyEmail = async (req, res) => {
  try {
    const { code, email } = req.body;

    if (!code || !email) {
      return res.status(400).json({
        success: false,
        message: 'Verification code and email are required'
      });
    }

    // Verify the code
    const result = await User.verifyEmail(code);

    if (result.success) {
      // Check if the email matches
      if (result.user.email !== email) {
        return res.status(400).json({
          success: false,
          message: 'Email does not match verification code'
        });
      }

      // Send welcome email
      try {
        await sendWelcome({ 
          email: result.user.email, 
          name: result.user.name 
        });
        console.log(`✅ Welcome email sent to ${result.user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
      }

      res.json({
        success: true,
        message: 'Email verified successfully! Welcome to 6thShop!',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          emailVerified: true
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// Resend verification code
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await User.resendVerificationEmail(email);

    if (result.success) {
      // Send new verification email with 6-digit code
      try {
        await sendEmailVerification({ 
          email: email, 
          name: result.user?.name || 'User' 
        }, result.token);
        
        console.log(`✅ New verification code sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification code'
        });
      }

      res.json({
        success: true,
        message: 'Verification code sent successfully'
      });
    } else {
      // If email is already verified, return success
      if (result.message === 'Email is already verified') {
        return res.json({
          success: true,
          message: 'Email is already verified'
        });
      }
      
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification code'
    });
  }
};

// Request password reset with 6-digit code
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await User.generatePasswordResetToken(email);

    if (result.success) {
      // Get user data for email
      const user = await User.findByEmail(email);
      
      // Send password reset email with 6-digit code
      try {
        await sendPasswordReset({ 
          email: email, 
          name: user.name 
        }, result.token);
        
        console.log(`✅ Password reset code sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset code'
        });
      }

      // Don't reveal if user exists or not for security
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent'
      });
    } else {
      // Still return success for security (don't reveal if user exists)
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset code has been sent'
      });
    }
  } catch (error) {
    console.error('❌ Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset request'
    });
  }
};

// Reset password with 6-digit code
const resetPassword = async (req, res) => {
  try {
    const { code, newPassword, email } = req.body;

    if (!code || !newPassword || !email) {
      return res.status(400).json({
        success: false,
        message: 'Reset code, new password, and email are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Verify the reset code
    const result = await User.resetPassword(code, newPassword);

    if (result.success) {
      // Check if email matches
      if (result.user.email !== email) {
        return res.status(400).json({
          success: false,
          message: 'Email does not match reset code'
        });
      }

      // Send password changed confirmation email
      try {
        await sendPasswordChanged({ 
          email: result.user.email, 
          name: result.user.name 
        });
        
        console.log(`✅ Password changed confirmation sent to ${result.user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send password changed email:', emailError);
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Password reset failed'
    });
  }
};

// Change password (for logged-in users)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const result = await User.updatePassword(userId, currentPassword, newPassword);

    if (result.success) {
      // Send password changed confirmation email
      try {
        const user = await User.findById(userId);
        await sendPasswordChanged({ 
          email: user.email, 
          name: user.name 
        });
        
        console.log(`✅ Password changed confirmation sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send password changed email:', emailError);
      }

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Password change failed'
    });
  }
};

// Check email verification status
const checkEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const isVerified = await User.isEmailVerified(email);

    res.json({
      success: true,
      emailVerified: isVerified
    });
  } catch (error) {
    console.error('❌ Check email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check email verification status'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, country } = req.body;
    const userId = req.user.id;

    console.log('🔄 Updating profile for user:', userId, 'with data:', { name, phone, address, city, country });

    const result = await User.updateProfile(userId, {
      name, phone, address, city, country
    });

    console.log('✅ Profile update result:', result);

    if (result.affectedRows > 0) {
      // Get the updated user data
      const updatedUser = await User.findById(userId);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found after update'
        });
      }

      console.log('✅ Updated user data:', updatedUser);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });
    } else {
      console.log('❌ No rows affected in profile update');
      res.status(400).json({
        success: false,
        message: 'Failed to update profile - no changes made'
      });
    }
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile: ' + error.message
    });
  }
};

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  checkEmailVerification,
  updateProfile
};