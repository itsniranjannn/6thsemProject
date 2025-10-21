// controllers/paymentController.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const axios = require('axios');
const crypto = require('crypto');
const Order = require('../models/orderModel');
const Payment = require('../models/paymentModel');
const Product = require('../models/productModel');
const Cart = require('../models/cartModel');

// eSewa Test Credentials
const ESEWA_TEST_FORM_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';
const ESEWA_MERCHANT_CODE = 'EPAYTEST';
const ESEWA_SECRET_KEY = '8gBm/:&EnhH.1/q';

/**
 * Generate eSewa signature for request data
 */
const generateEsewaSignature = (data) => {
  const { total_amount, transaction_uuid, product_code } = data;
  
  if (!total_amount || !transaction_uuid || !product_code) {
    throw new Error('Missing required fields for eSewa signature');
  }
  
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const signature = crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
  
  console.log('🔐 eSewa Signature generated:', { message, signature });
  return signature;
};

/**
 * Verify eSewa response signature
 */
const verifyEsewaResponse = (data) => {
  const { total_amount, transaction_uuid, product_code, signature } = data;
  
  if (!total_amount || !transaction_uuid || !product_code || !signature) {
    console.error('❌ Missing fields for eSewa signature verification');
    return false;
  }
  
  const message = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
  const computed_signature = crypto
    .createHmac('sha256', ESEWA_SECRET_KEY)
    .update(message)
    .digest('base64');
  
  // Timing-safe comparison
  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature.trim()),
    Buffer.from(computed_signature.trim())
  );
  
  console.log('🔐 eSewa Signature verification:', { isValid, received: signature, computed: computed_signature });
  return isValid;
};

// Helper function to generate tracking number
const generateTrackingNumber = () => {
  return `TRK${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
};

// Helper function to calculate estimated delivery
const calculateEstimatedDelivery = () => {
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 7);
  return deliveryDate;
};

// Helper function to clear user cart and update stock
const completeOrderProcessing = async (orderId, userId) => {
  try {
    console.log(`🔄 Completing order processing for order ${orderId}`);
    
    // Clear user's cart
    await Cart.clearCart(userId);
    console.log(`✅ Cart cleared for user ${userId}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error in order completion processing:', error);
    return false;
  }
};

// Helper function to reserve stock
const reserveStock = async (items) => {
  try {
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product || product.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${item.name}`);
      }
    }
    return true;
  } catch (error) {
    console.error('❌ Stock reservation error:', error);
    throw error;
  }
};

// Helper function to update stock
const updateStockOnPayment = async (items, action = 'deduct') => {
  try {
    for (const item of items) {
      const quantityChange = action === 'deduct' ? -item.quantity : item.quantity;
      await Product.updateStock(item.id, quantityChange);
      console.log(`📦 Stock updated for product ${item.id}: ${quantityChange} units`);
    }
    return true;
  } catch (error) {
    console.error('❌ Stock update error:', error);
    throw error;
  }
};

const getPaymentHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        stripe: process.env.STRIPE_SECRET_KEY ? 'configured' : 'not_configured',
        khalti: process.env.KHALTI_SECRET_KEY ? 'configured' : 'not_configured',
        esewa: 'configured'
      },
      database: 'connected',
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      health: health
    });
  } catch (error) {
    console.error('❌ Payment health check error:', error);
    res.status(500).json({
      success: false,
      health: {
        status: 'unhealthy',
        error: error.message
      }
    });
  }
};

const createStripePayment = async (req, res) => {
  let orderCreated = false;
  let orderId = null;

  try {
    const { amount, items, shippingAddress, subtotal = 0, shipping = 0 } = req.body;
    const user_id = req.user.id;

    console.log('💳 Creating Stripe payment for amount:', amount);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    await reserveStock(items);

    const orderData = {
      user_id: user_id,
      total_amount: parseFloat(amount),
      subtotal: parseFloat(subtotal),
      shipping_fee: parseFloat(shipping),
      payment_method: 'stripe',
      payment_status: 'pending',
      shipping_address: shippingAddress,
      status: 'pending',
      tracking_number: generateTrackingNumber(),
      estimated_delivery: calculateEstimatedDelivery()
    };

    const order = await Order.create(orderData);
    orderId = order.id;
    orderCreated = true;

    console.log('✅ Created order for Stripe:', orderId);

    for (const item of items) {
      await Order.addOrderItem({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      });
    }

    await updateStockOnPayment(items, 'deduct');

    const lineItems = items.map(item => ({
      price_data: {
        currency: 'npr',
        product_data: {
          name: item.name,
          description: item.description || `Quantity: ${item.quantity}`,
          images: item.image_url ? [item.image_url] : ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'],
        },
        unit_amount: Math.round(parseFloat(item.price) * 100),
      },
      quantity: item.quantity,
    }));

    if (parseFloat(shipping) > 0) {
      lineItems.push({
        price_data: {
          currency: 'npr',
          product_data: {
            name: 'Shipping Fee',
            description: 'Delivery charge all over Nepal'
          },
          unit_amount: Math.round(parseFloat(shipping) * 100),
        },
        quantity: 1,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?orderId=${orderId}&payment=stripe&success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?orderId=${orderId}&reason=cancelled`,
      customer_email: req.user.email,
      metadata: {
        order_id: orderId.toString(),
        user_id: user_id.toString(),
        currency: 'NPR'
      }
    });

    await Payment.create({
      order_id: orderId,
      payment_method: 'stripe',
      payment_status: 'pending',
      amount: parseFloat(amount),
      transaction_id: session.id,
      payment_data: { 
        session_id: session.id, 
        session_url: session.url,
        currency: 'NPR'
      }
    });

    res.json({
      success: true,
      sessionId: session.id,
      sessionUrl: session.url,
      orderId: orderId,
      message: 'Stripe checkout session created successfully'
    });

  } catch (error) {
    console.error('❌ Stripe payment error:', error);
    
    if (orderCreated && orderId) {
      try {
        await Order.update(orderId, { status: 'cancelled', payment_status: 'failed' });
        await updateStockOnPayment(req.body.items, 'restore');
      } catch (cleanupError) {
        console.error('❌ Stripe order cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Stripe payment processing failed',
      error: error.message
    });
  }
};

const createKhaltiPayment = async (req, res) => {
  let orderId = null;

  try {
    const { amount, items, shippingAddress, subtotal = 0, shipping = 0, customer_info } = req.body;
    const user_id = req.user.id;

    console.log('💰 Creating Khalti payment for amount:', amount);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    await reserveStock(items);

    const order = await Order.create({
      user_id: user_id,
      total_amount: parseFloat(amount),
      subtotal: parseFloat(subtotal),
      shipping_fee: parseFloat(shipping),
      payment_method: 'khalti',
      payment_status: 'pending',
      shipping_address: shippingAddress,
      status: 'pending',
      tracking_number: generateTrackingNumber(),
      estimated_delivery: calculateEstimatedDelivery()
    });
    orderId = order.id;

    console.log('✅ Created Khalti order:', orderId);

    for (const item of items) {
      await Order.addOrderItem({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      });
    }

    // Test mode for Khalti
    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Khalti running in TEST mode - simulating payment');
      
      await Order.update(orderId, {
        payment_status: 'completed',
        status: 'processing'
      });

      await Payment.create({
        order_id: orderId,
        payment_method: 'khalti',
        payment_status: 'completed',
        amount: parseFloat(amount),
        transaction_id: `khalti_test_${Date.now()}`,
        payment_data: { 
          test_mode: true,
          message: 'Payment processed in test mode'
        }
      });

      await updateStockOnPayment(items, 'deduct');
      await completeOrderProcessing(orderId, user_id);

      return res.json({
        success: true,
        orderId: orderId,
        redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?orderId=${orderId}&payment=khalti&success=true`,
        message: 'Payment processed successfully (Test Mode)',
        test_mode: true
      });
    }

    const payload = {
      return_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/khalti/callback?orderId=${orderId}`,
      website_url: process.env.FRONTEND_URL || 'http://localhost:3000',
      amount: Math.round(parseFloat(amount) * 100),
      purchase_order_id: orderId.toString(),
      purchase_order_name: `Order ${orderId} - 6thShop`,
      customer_info: {
        name: customer_info?.name || req.user.name,
        email: customer_info?.email || req.user.email,
        phone: customer_info?.phone || ''
      }
    };

    console.log('📤 Khalti payload:', payload);

    const KHALTI_URL = 'https://a.khalti.com/api/v2/epayment/initiate/';
    const response = await axios.post(KHALTI_URL, payload, {
      headers: {
        'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000
    });

    await Payment.create({
      order_id: orderId,
      payment_method: 'khalti',
      payment_status: 'pending',
      amount: parseFloat(amount),
      transaction_id: response.data.pidx,
      payment_data: response.data
    });

    res.json({
      success: true,
      payment_url: response.data.payment_url,
      pidx: response.data.pidx,
      orderId: orderId,
      message: 'Khalti payment initiated successfully'
    });

  } catch (error) {
    console.error('❌ Khalti creation error:', error);
    
    if (orderId) {
      try {
        await Order.update(orderId, { status: 'cancelled', payment_status: 'failed' });
        await updateStockOnPayment(req.body.items, 'restore');
      } catch (cleanupError) {
        console.error('❌ Khalti order cleanup error:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Khalti payment creation failed',
      error: error.message
    });
  }
};

const createEsewaPayment = async (req, res) => {
  let orderId = null;

  try {
    const { amount, items, shippingAddress, subtotal = 0, shipping = 0 } = req.body;
    const user_id = req.user.id;

    console.log('🎯 Creating eSewa payment for amount:', amount);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    await reserveStock(items);

    const order = await Order.create({
      user_id: user_id,
      total_amount: parseFloat(amount),
      subtotal: parseFloat(subtotal),
      shipping_fee: parseFloat(shipping),
      payment_method: 'esewa',
      payment_status: 'pending',
      shipping_address: shippingAddress,
      status: 'pending',
      tracking_number: generateTrackingNumber(),
      estimated_delivery: calculateEstimatedDelivery()
    });
    orderId = order.id;

    console.log('✅ Created eSewa order:', orderId);

    for (const item of items) {
      await Order.addOrderItem({
        order_id: orderId,
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      });
    }

    // Generate unique transaction UUID
    const transaction_uuid = `esewa_${orderId}_${Date.now()}`;
    
    // Prepare eSewa form data with signature
    const esewaData = {
      amount: parseFloat(amount).toString(),
      tax_amount: '0',
      total_amount: parseFloat(amount).toString(),
      transaction_uuid: transaction_uuid,
      product_code: ESEWA_MERCHANT_CODE,
      product_service_charge: '0',
      product_delivery_charge: '0',
      success_url: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/esewa/success?orderId=${orderId}`,
      failure_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?orderId=${orderId}&reason=payment_failed`,
      signed_field_names: 'total_amount,transaction_uuid,product_code',
      signature: '' // Will be generated below
    };

    // Generate signature
    try {
      esewaData.signature = generateEsewaSignature({
        total_amount: esewaData.total_amount,
        transaction_uuid: esewaData.transaction_uuid,
        product_code: esewaData.product_code
      });
    } catch (signatureError) {
      console.error('❌ eSewa signature generation error:', signatureError);
      throw new Error('Failed to generate eSewa security signature');
    }

    console.log('📤 eSewa form data prepared:', {
      ...esewaData,
      signature: `${esewaData.signature.substring(0, 20)}...` // Log partial signature for security
    });

    await Payment.create({
      order_id: orderId,
      payment_method: 'esewa',
      payment_status: 'pending',
      amount: parseFloat(amount),
      transaction_id: transaction_uuid,
      payment_data: esewaData
    });

    // Return form data for frontend to submit
    res.json({
      success: true,
      formData: esewaData,
      orderId: orderId,
      submit_url: ESEWA_TEST_FORM_URL,
      message: 'eSewa payment form data generated successfully'
    });

  } catch (error) {
    console.error('❌ eSewa error:', error);
    
    if (orderId) {
      try {
        await Order.update(orderId, { status: 'cancelled', payment_status: 'failed' });
        await updateStockOnPayment(req.body.items, 'restore');
      } catch (cleanupError) {
        console.error('❌ eSewa order cleanup error:', cleanupError);
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'eSewa payment failed',
      error: error.message
    });
  }
};

const createCodPayment = async (req, res) => {
  try {
    const { items, totalAmount, subtotal = 0, shipping = 0, shippingAddress } = req.body;
    const user_id = req.user.id;

    console.log('📦 Creating COD order for amount:', totalAmount);

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart is empty'
      });
    }

    await reserveStock(items);

    const order = await Order.create({
      user_id: user_id,
      total_amount: parseFloat(totalAmount),
      subtotal: parseFloat(subtotal),
      shipping_fee: parseFloat(shipping),
      payment_method: 'cod',
      payment_status: 'pending',
      shipping_address: shippingAddress,
      status: 'confirmed',
      tracking_number: generateTrackingNumber(),
      estimated_delivery: calculateEstimatedDelivery()
    });

    console.log('✅ Created COD order:', order.id);

    for (const item of items) {
      await Order.addOrderItem({
        order_id: order.id,
        product_id: item.id,
        quantity: item.quantity,
        price: parseFloat(item.price)
      });
    }

    await updateStockOnPayment(items, 'deduct');

    await Payment.create({
      order_id: order.id,
      payment_method: 'cod',
      payment_status: 'pending',
      amount: parseFloat(totalAmount),
      transaction_id: `cod_${order.id}_${Date.now()}`,
      payment_data: { 
        method: 'cash_on_delivery',
        status: 'pending_payment',
        instructions: 'Payment to be collected upon delivery'
      }
    });

    await completeOrderProcessing(order.id, user_id);

    res.json({
      success: true,
      message: 'Order placed successfully with Cash on Delivery',
      orderId: order.id,
      payment_method: 'cod',
      redirect_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?orderId=${order.id}&payment=cod&success=true`
    });

  } catch (error) {
    console.error('❌ COD error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create COD order',
      error: error.message
    });
  }
};

// KHALTI PAYMENT VERIFICATION
const verifyKhaltiPayment = async (req, res) => {
  try {
    const { pidx, orderId } = req.body;
    const user_id = req.user.id;

    console.log('🔍 Verifying Khalti payment for pidx:', pidx);

    if (process.env.NODE_ENV !== 'production') {
      console.log('🔄 Khalti verification in TEST mode - auto-verifying');
      
      await Order.update(orderId, {
        payment_status: 'completed',
        status: 'processing'
      });

      await Payment.updateStatus(orderId, 'completed', `khalti_verified_${Date.now()}`);
      
      await completeOrderProcessing(orderId, user_id);

      res.json({
        success: true,
        message: 'Payment verified successfully (Test Mode)',
        orderId: orderId,
        status: 'completed',
        test_mode: true
      });
      return;
    }

    try {
      const response = await axios.post(
        'https://khalti.com/api/v2/epayment/lookup/',
        { pidx },
        {
          headers: {
            'Authorization': `Key ${process.env.KHALTI_SECRET_KEY}`,
            'Content-Type': 'application/json',
          }
        }
      );

      const paymentStatus = response.data.status;

      if (paymentStatus === 'Completed') {
        await Order.update(orderId, {
          payment_status: 'completed',
          status: 'processing'
        });

        await Payment.updateStatus(orderId, 'completed', pidx);
        
        await completeOrderProcessing(orderId, user_id);

        console.log(`✅ Khalti payment verified for order ${orderId}`);
        
        res.json({
          success: true,
          message: 'Payment verified successfully',
          orderId: orderId,
          status: 'completed'
        });
      } else {
        await Order.update(orderId, {
          payment_status: 'failed',
          status: 'cancelled'
        });

        await Payment.updateStatus(orderId, 'failed', pidx);

        res.json({
          success: false,
          message: 'Payment verification failed',
          status: paymentStatus
        });
      }
    } catch (apiError) {
      console.error('❌ Khalti verification API error:', apiError);
      throw new Error('Khalti verification service unavailable');
    }

  } catch (error) {
    console.error('❌ Khalti verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// ESEWA SUCCESS CALLBACK
const handleEsewaSuccess = async (req, res) => {
  try {
    const { orderId, data } = req.query;
    console.log('✅ eSewa success callback received for order:', orderId);
    console.log('📊 eSewa callback data:', data);

    if (!orderId) {
      console.error('❌ No orderId in eSewa callback');
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?reason=no_order_id`);
    }

    // Parse the data parameter (it's base64 encoded JSON)
    let decodedData = {};
    try {
      if (data) {
        const decodedString = Buffer.from(data, 'base64').toString('utf-8');
        decodedData = JSON.parse(decodedString);
        console.log('📊 Decoded eSewa response:', decodedData);
      }
    } catch (parseError) {
      console.error('❌ Error parsing eSewa callback data:', parseError);
    }

    // Verify signature for security
    const signatureValid = verifyEsewaResponse({
      total_amount: decodedData.total_amount,
      transaction_uuid: decodedData.transaction_uuid,
      product_code: decodedData.product_code,
      signature: decodedData.signature
    });

    if (!signatureValid) {
      console.error('❌ eSewa signature verification failed');
      await Order.update(orderId, { 
        payment_status: 'failed', 
        status: 'cancelled' 
      });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?orderId=${orderId}&reason=signature_invalid`);
    }

    // Check if payment was successful
    if (decodedData.status === 'COMPLETE' || decodedData.transaction_code) {
      console.log('✅ eSewa payment completed successfully');
      
      await Order.update(orderId, { 
        payment_status: 'completed', 
        status: 'processing'
      });
      
      await Payment.updateStatus(orderId, 'completed', decodedData.transaction_code || `esewa_${Date.now()}`);
      
      const order = await Order.findById(orderId);
      if (order) {
        await updateStockOnPayment(order.items || [], 'deduct');
        await completeOrderProcessing(orderId, order.user_id);
      }

      console.log(`✅ Order ${orderId} confirmed via eSewa`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?orderId=${orderId}&payment=esewa&success=true`);
    } else {
      console.error('❌ eSewa payment failed or incomplete');
      await Order.update(orderId, { 
        payment_status: 'failed', 
        status: 'cancelled' 
      });
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?orderId=${orderId}&reason=payment_failed`);
    }

  } catch (error) {
    console.error('❌ eSewa success callback error:', error);
    
    // Try to get orderId from query for redirect
    const orderId = req.query.orderId;
    if (orderId) {
      try {
        await Order.update(orderId, { 
          payment_status: 'failed', 
          status: 'cancelled' 
        });
      } catch (updateError) {
        console.error('❌ Error updating order status:', updateError);
      }
    }
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?orderId=${req.query.orderId}&reason=callback_error`);
  }
};

// KHALTI CALLBACK
const handleKhaltiCallback = async (req, res) => {
  try {
    const { orderId, transaction_id } = req.query;
    console.log('✅ Khalti callback received for order:', orderId);

    if (orderId) {
      await Order.update(orderId, {
        payment_status: 'completed',
        status: 'processing'
      });

      await Payment.updateStatus(orderId, 'completed', transaction_id || `khalti_callback_${Date.now()}`);
      
      const order = await Order.findById(orderId);
      if (order) {
        await completeOrderProcessing(orderId, order.user_id);
      }

      console.log(`✅ Order ${orderId} confirmed via Khalti callback`);
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?orderId=${orderId}&payment=khalti&success=true`);
    }

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?reason=no_order_id`);
  } catch (error) {
    console.error('❌ Khalti callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment-failed?reason=callback_error`);
  }
};

// STRIPE WEBHOOK
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('❌ Stripe webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata.order_id;

    try {
      await Order.update(orderId, {
        payment_status: 'completed',
        status: 'processing'
      });
      
      await Payment.updateStatus(orderId, 'completed', session.payment_intent);
      
      const order = await Order.findById(orderId);
      if (order) {
        await completeOrderProcessing(orderId, order.user_id);
      }
      
      console.log(`✅ Order ${orderId} confirmed via Stripe webhook`);
    } catch (error) {
      console.error('❌ Error updating order from webhook:', error);
    }
  }

  res.json({ received: true });
};

module.exports = {
  createStripePayment,
  createKhaltiPayment,
  createEsewaPayment,
  createCodPayment,
  verifyKhaltiPayment,
  handleEsewaSuccess,
  handleKhaltiCallback,
  handleStripeWebhook,
  getPaymentHealth
};