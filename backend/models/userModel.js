const db = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

class User {
  static async create(userData) {
    const { name, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, email_verified, email_verification_token, email_verification_expires) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, false, emailVerificationToken, emailVerificationExpires]
    );
    
    return {
      insertId: result.insertId,
      emailVerificationToken,
      emailVerificationExpires
    };
  }

  static async findByEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static async getAllUsers() {
    const [rows] = await db.execute(
      'SELECT id, name, email, role, created_at FROM users'
    );
    return rows;
  }

  static async updateRole(userId, role) {
    const [result] = await db.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    return result;
  }

  // Email verification methods
  static async verifyEmail(token) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email_verification_token = ? AND email_verification_expires > NOW()',
      [token]
    );
    
    if (rows.length === 0) {
      return { success: false, message: 'Invalid or expired verification token' };
    }

    const [result] = await db.execute(
      'UPDATE users SET email_verified = true, email_verification_token = NULL, email_verification_expires = NULL WHERE email_verification_token = ?',
      [token]
    );

    return { success: true, user: rows[0] };
  }

  static async resendVerificationEmail(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND email_verified = false',
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: 'User not found or already verified' };
    }

    // Generate new verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.execute(
      'UPDATE users SET email_verification_token = ?, email_verification_expires = ? WHERE email = ?',
      [emailVerificationToken, emailVerificationExpires, email]
    );

    return { success: true, token: emailVerificationToken, expires: emailVerificationExpires };
  }

  // Password reset methods
  static async generatePasswordResetToken(email) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      return { success: false, message: 'User not found' };
    }

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.execute(
      'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE email = ?',
      [resetToken, resetExpires, email]
    );

    return { success: true, token: resetToken, expires: resetExpires };
  }

  static async resetPassword(token, newPassword) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return { success: false, message: 'Invalid or expired reset token' };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await db.execute(
      'UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE password_reset_token = ?',
      [hashedPassword, token]
    );

    return { success: true, user: rows[0] };
  }

  static async updatePassword(userId, currentPassword, newPassword) {
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
  }

  // Check if user is verified
  static async isEmailVerified(email) {
    const [rows] = await db.execute(
      'SELECT email_verified FROM users WHERE email = ?',
      [email]
    );
    
    return rows.length > 0 ? rows[0].email_verified : false;
  }
}

module.exports = User;