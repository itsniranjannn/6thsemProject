const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { 
  sendEmailVerificationEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedEmail, 
  sendWelcomeEmail 
} = require('./emailController');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register user with email verification
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findByEmail(email);
    if (userExists) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists' 
      });
    }

    const user = await User.create({ name, email, password });
    
    if (user) {
      // Send email verification
      try {
        await sendEmailVerificationEmail({ name, email }, user.emailVerificationToken);
        console.log(`✅ Verification email sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      res.status(201).json({
        success: true,
        message: 'User registered successfully. Please check your email to verify your account.',
        user: {
        id: user.insertId,
        name,
        email,
          emailVerified: false
        },
        token: generateToken(user.insertId)
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

// Login user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findByEmail(email);
    if (user && (await User.comparePassword(password, user.password))) {
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required'
      });
    }

    const result = await User.verifyEmail(token);

    if (result.success) {
      // Send welcome email
      try {
        await sendWelcomeEmail(result.user);
        console.log(`✅ Welcome email sent to ${result.user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send welcome email:', emailError);
        // Don't fail verification if welcome email fails
      }

      res.json({
        success: true,
        message: 'Email verified successfully! Welcome to Nexus Store!',
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

// Resend verification email
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
      // Send new verification email
      try {
        await sendEmailVerificationEmail({ email }, result.token);
        console.log(`✅ New verification email sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send verification email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send verification email'
        });
      }

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
  } catch (error) {
    console.error('❌ Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
};

// Request password reset
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
      // Send password reset email
      try {
        await sendPasswordResetEmail({ email }, result.token);
        console.log(`✅ Password reset email sent to ${email}`);
      } catch (emailError) {
        console.error('❌ Failed to send password reset email:', emailError);
        return res.status(500).json({
          success: false,
          message: 'Failed to send password reset email'
        });
      }

      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.message
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

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const result = await User.resetPassword(token, newPassword);

    if (result.success) {
      // Send password changed confirmation email
      try {
        await sendPasswordChangedEmail(result.user);
        console.log(`✅ Password changed confirmation sent to ${result.user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send password changed email:', emailError);
        // Don't fail password reset if confirmation email fails
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
        await sendPasswordChangedEmail(user);
        console.log(`✅ Password changed confirmation sent to ${user.email}`);
      } catch (emailError) {
        console.error('❌ Failed to send password changed email:', emailError);
        // Don't fail password change if confirmation email fails
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

module.exports = { 
  registerUser, 
  loginUser, 
  getUserProfile,
  verifyEmail,
  resendVerificationEmail,
  requestPasswordReset,
  resetPassword,
  changePassword,
  checkEmailVerification
};