const db = require('../config/db');

class Payment {
  // Create payment record
  static async create(paymentData) {
    try {
      const { order_id, payment_method, payment_status, amount, transaction_id, payment_data } = paymentData;
      
      const [result] = await db.execute(
        `INSERT INTO payments (order_id, payment_method, payment_status, amount, transaction_id, payment_data) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [order_id, payment_method, payment_status, amount, transaction_id, JSON.stringify(payment_data)]
      );
      
      console.log('Payment record created for order:', order_id);
      return { id: result.insertId, ...paymentData };
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  // Update payment status
  static async updateStatus(orderId, paymentStatus, transactionId = null) {
    try {
      let query = `UPDATE payments SET payment_status = ?`;
      let params = [paymentStatus];
      
      if (transactionId) {
        query += `, transaction_id = ?`;
        params.push(transactionId);
      }
      
      query += ` WHERE order_id = ?`;
      params.push(orderId);
      
      const [result] = await db.execute(query, params);
      console.log(`Payment status updated for order ${orderId}: ${paymentStatus}`);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Payment status update error:', error);
      throw error;
    }
  }

  // Find payment by order ID
  static async findByOrderId(orderId) {
    try {
      const [rows] = await db.execute(
        `SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC LIMIT 1`,
        [orderId]
      );
      
      return rows[0] || null;
    } catch (error) {
      console.error('Payment find by order ID error:', error);
      throw error;
    }
  }
}

module.exports = Payment;