const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  static async create(userData) {
    const { name, email, password, phone, address, city, country } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    try {
      const [result] = await db.execute(
        'INSERT INTO users (name, email, password, phone, address, city, country, email_verified, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, phone || null, address || null, city || null, country || 'Nepal', false, verificationCode, verificationExpires]
      );
      
      console.log('✅ User created in database with ID:', result.insertId);
      
      return {
        insertId: result.insertId,
        emailVerificationToken: verificationCode,
        emailVerificationExpires: verificationExpires
      };
    } catch (error) {
      console.error('❌ Database create user error:', error);
      throw new Error('Failed to create user in database');
    }
  }

  static async findByEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, password, role, email_verified, phone, address, city, country, created_at FROM users WHERE email = ?', 
        [email]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Database find by email error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.execute(
        'SELECT id, name, email, role, email_verified, phone, address, city, country, created_at FROM users WHERE id = ?', 
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      console.error('❌ Database find by ID error:', error);
      throw error;
    }
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Email verification with 6-digit code - FIXED
  static async verifyEmail(code, email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email_verification_token = ? AND email = ? AND email_verification_expires > NOW()',
        [code, email]
      );
      
      if (rows.length === 0) {
        return { success: false, message: 'Invalid or expired verification code' };
      }

      const user = rows[0];

      // Update user to mark as verified
      const [updateResult] = await db.execute(
        'UPDATE users SET email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
        [user.id]
      );

      if (updateResult.affectedRows > 0) {
        // Get updated user data
        const [updatedUser] = await db.execute(
          'SELECT id, name, email, role, email_verified, phone, address, city, country, created_at FROM users WHERE id = ?',
          [user.id]
        );
        
        return { 
          success: true, 
          user: updatedUser[0],
          message: 'Email verified successfully!'
        };
      } else {
        return { success: false, message: 'Failed to verify email' };
      }
    } catch (error) {
      console.error('❌ Email verification error:', error);
      return { success: false, message: 'Database error during verification' };
    }
  }

  static async resendVerificationEmail(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const user = rows[0];

      // Check if already verified
      if (user.email_verified) {
        return { 
          success: true, 
          message: 'Email is already verified',
          user: user,
          token: null
        };
      }

      // Generate new 6-digit verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const verificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.execute(
        'UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE email = ?',
        [verificationCode, verificationExpires, email]
      );

      return { 
        success: true, 
        token: verificationCode, 
        expires: verificationExpires,
        user: user
      };
    } catch (error) {
      console.error('❌ Resend verification error:', error);
      return { success: false, message: 'Database error' };
    }
  }

  // Password reset with 6-digit code - FIXED
  static async generatePasswordResetToken(email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if (rows.length === 0) {
        // For security, don't reveal if user exists
        return { success: true, token: 'dummy', expires: new Date() };
      }

      // Generate 6-digit reset code
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const resetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await db.execute(
        'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?',
        [resetCode, resetExpires, email]
      );

      return { success: true, token: resetCode, expires: resetExpires };
    } catch (error) {
      console.error('❌ Generate reset token error:', error);
      return { success: false, message: 'Database error' };
    }
  }

  static async resetPassword(code, newPassword, email) {
    try {
      const [rows] = await db.execute(
        'SELECT * FROM users WHERE password_reset_token = ? AND email = ? AND password_reset_expires > NOW()',
        [code, email]
      );

      if (rows.length === 0) {
        return { success: false, message: 'Invalid or expired reset code' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db.execute(
        'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE password_reset_token = ? AND email = ?',
        [hashedPassword, code, email]
      );

      return { success: true, user: rows[0] };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      return { success: false, message: 'Database error' };
    }
  }

  static async updatePassword(userId, currentPassword, newPassword) {
    try {
      const [rows] = await db.execute(
        'SELECT password FROM users WHERE id = ?',
        [userId]
      );

      if (rows.length === 0) {
        return { success: false, message: 'User not found' };
      }

      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, rows[0].password);
      if (!isCurrentPasswordValid) {
        return { success: false, message: 'Current password is incorrect' };
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12);

      await db.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );

      return { success: true };
    } catch (error) {
      console.error('❌ Update password error:', error);
      return { success: false, message: 'Database error' };
    }
  }

  // Update user profile - FIXED (removed updated_at)
  static async updateProfile(userId, profileData) {
    try {
      console.log('🔄 Updating profile for user', userId, 'with data:', profileData);
      
      const { name, phone, address, city, country } = profileData;
      
      const query = `
        UPDATE users 
        SET name = ?, phone = ?, address = ?, city = ?, country = ?
        WHERE id = ?
      `;
      
      const [result] = await db.execute(query, [name, phone, address, city, country, userId]);
      
      console.log('✅ Profile update result:', result);
      
      return result;
    } catch (error) {
      console.error('❌ Database update profile error:', error);
      throw error;
    }
  }

  // Get user by verification code
  static async findByVerificationCode(code) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > NOW()',
      [code]
    );
    return rows[0];
  }

  // Get user by reset code
  static async findByResetCode(code) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [code]
    );
    return rows[0];
  }

  // Check if email is verified
  static async isEmailVerified(email) {
    const [rows] = await db.execute(
      'SELECT email_verified FROM users WHERE email = ?',
      [email]
    );
    
    return rows.length > 0 ? rows[0].email_verified : false;
  }

  // Mark email as verified
  static async markEmailAsVerified(userId) {
    const [result] = await db.execute(
      'UPDATE users SET email_verified = TRUE, email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
      [userId]
    );
    return result;
  }

  // Update password directly (for reset)
  static async updatePasswordDirect(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const [result] = await db.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, userId]
    );
    
    return {
      success: result.affectedRows > 0,
      message: result.affectedRows > 0 ? 'Password updated successfully' : 'Failed to update password'
    };
  }

  // Clear verification tokens
  static async clearVerificationToken(userId) {
    const [result] = await db.execute(
      'UPDATE users SET email_verification_token = NULL, email_verification_expires = NULL WHERE id = ?',
      [userId]
    );
    return result;
  }

  // Clear password reset token
  static async clearPasswordResetToken(userId) {
    const [result] = await db.execute(
      'UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
      [userId]
    );
    return result;
  }
}

module.exports = User;