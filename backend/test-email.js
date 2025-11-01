// test-payment-emails.js
require('dotenv').config();
const { sendPaymentSuccessEmail, sendPaymentFailedEmail } = require('./controllers/emailController');

const testPaymentEmails = async () => {
  try {
    console.log('🧪 Testing payment emails...');
    
    const testOrder = {
      id: 12345,
      total_amount: 2999.99,
      status: 'confirmed',
      payment_method: 'stripe',
      payment_status: 'completed',
      created_at: new Date()
    };
    
    const testUser = {
      name: 'John Doe',
      email: 'test@example.com'
    };
    
    // Test payment success email
    console.log('\n📤 Sending payment success email...');
    const successResult = await sendPaymentSuccessEmail(testOrder, testUser, {
      transaction_id: 'txn_123456789',
      payment_method: 'stripe'
    });
    console.log('✅ Payment success email result:', successResult);
    
    // Test payment failed email
    console.log('\n📤 Sending payment failed email...');
    const failedResult = await sendPaymentFailedEmail(testOrder, testUser, 'Insufficient funds');
    console.log('✅ Payment failed email result:', failedResult);
    
    console.log('\n🎉 Payment email test completed!');
    
  } catch (error) {
    console.error('❌ Payment email test failed:', error);
  }
};

testPaymentEmails();