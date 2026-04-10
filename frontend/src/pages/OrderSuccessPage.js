import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);
  const [showTrackingDetails, setShowTrackingDetails] = useState(false);
  const invoiceRef = useRef();

  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('payment') || 'unknown';
  const success = searchParams.get('success') === 'true';

  // Payment method configuration
  const paymentMethods = {
    stripe: {
      name: 'Credit/Debit Card',
      image: '/images/Stripe.png',
      color: 'from-purple-500 to-indigo-600',
      status: 'completed'
    },
    khalti: {
      name: 'Khalti',
      image: '/images/khalti.png',
      color: 'from-purple-600 to-pink-600',
      status: 'completed'
    },
    esewa: {
      name: 'eSewa',
      image: '/images/Esewa.png',
      color: 'from-green-500 to-blue-500',
      status: 'completed'
    },
    cod: {
      name: 'Cash on Delivery',
      image: '/images/cod.png',
      color: 'from-orange-500 to-red-500',
      status: 'pending'
    }
  };

  // ✅ FIXED: Direct API call to clear cart (no hook dependency issues)
  const clearCartFromAPI = async (token) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/cart/clear`, 
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const result = await response.json();
      console.log('🧹 Cart clear API response:', result);
      return result.success;
    } catch (error) {
      console.error('❌ Cart clear API error:', error);
      return false;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        // ✅ FIXED: Clear cart when order is successful
        if (success && orderId) {
          try {
            console.log('🛒 Clearing cart for successful order:', orderId);
            await clearCartFromAPI(token);
            console.log('✅ Cart cleared successfully');
          } catch (cartError) {
            console.error('❌ Error clearing cart:', cartError);
            // Don't block the order success page if cart clearing fails
          }
        }

        // Fetch user details
        const userResponse = await axios.get(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/users/profile`,
          { 
            headers: { Authorization: `Bearer ${token}` },
            timeout: 10000
          }
        );
        
        if (userResponse.data.success) {
          setUserDetails(userResponse.data.user);
        }

        // Fetch order details
        if (orderId) {
          const orderResponse = await axios.get(
            `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${orderId}`,
            { 
              headers: { Authorization: `Bearer ${token}` },
              timeout: 10000
            }
          );

          if (orderResponse.data.success) {
            const orderData = orderResponse.data.order;
            console.log('📦 Order data received:', orderData);
            
            // Ensure proper data structure
            if (orderData.shipping_address && typeof orderData.shipping_address === 'string') {
              try {
                orderData.shipping_address = JSON.parse(orderData.shipping_address);
              } catch (e) {
                console.warn('⚠️ Could not parse shipping address as JSON, using as string');
                orderData.shipping_address = { 
                  address: orderData.shipping_address,
                  fullName: orderData.shipping_address,
                  email: userResponse.data.user?.email || '',
                  phone: userResponse.data.user?.phone || ''
                };
              }
            }
            
            // Ensure items array exists and has proper structure
            if (!orderData.items || orderData.items.length === 0) {
              console.warn('⚠️ No items found in order, using fallback items');
              orderData.items = getFallbackOrderData().items;
            }
            
            setOrderDetails(orderData);
          } else {
            console.error('❌ Order API response not successful:', orderResponse.data);
            setOrderDetails(getFallbackOrderData());
          }
        } else {
          console.error('❌ No orderId found in URL');
          setOrderDetails(getFallbackOrderData());
        }
      } catch (error) {
        console.error('❌ Error fetching data:', error);
        // Set fallback data with proper structure
        setOrderDetails(getFallbackOrderData());
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return undefined;
  }, [orderId, navigate, success]);

  const getFallbackOrderData = () => {
    const fallbackData = {
      id: orderId || 'N/A',
      total_amount: '0.00',
      subtotal: '0.00',
      shipping_fee: '50.00',
      status: paymentMethod === 'cod' ? 'confirmed' : 'processing',
      payment_method: paymentMethod,
      payment_status: paymentMethod === 'cod' ? 'pending' : 'completed',
      items: [
        { 
          id: 1,
          product_id: 1,
          product_name: 'Sample Product', 
          quantity: 1, 
          price: '0.00', 
          total: '0.00',
          product_image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'
        }
      ],
      shipping_address: {
        fullName: userDetails?.name || 'Your Name',
        email: userDetails?.email || 'your@email.com',
        address: '123 Main Street',
        city: 'Kathmandu',
        postalCode: '44600',
        country: 'Nepal',
        phone: userDetails?.phone || '+977 9800000000'
      },
      tracking_number: `TRK${orderId || '123456'}`,
      estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      created_at: new Date().toISOString()
    };
    
    console.log('🔄 Using fallback order data:', fallbackData);
    return fallbackData;
  };

  const getCurrentPaymentMethod = () => {
    return paymentMethods[paymentMethod] || paymentMethods.stripe;
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { color: 'bg-orange-100 text-orange-800', text: 'Pending', icon: '⏳' },
      processing: { color: 'bg-blue-100 text-blue-800', text: 'Processing', icon: '🔄' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed', icon: '✅' },
      shipped: { color: 'bg-purple-100 text-purple-800', text: 'Shipped', icon: '🚚' },
      delivered: { color: 'bg-green-100 text-green-800', text: 'Delivered', icon: '🎉' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled', icon: '❌' }
    };
    return statusMap[status] || statusMap.pending;
  };

  const handleContactSupport = () => {
    const email = 'support@nexusstore.com';
    const subject = `Order Support - Order #${orderId}`;
    const body = `Hello Nexus Store Support Team,\n\nI need assistance with my order #${orderId}.\n\nOrder Details:\n- Order ID: ${orderId}\n- Customer: ${userDetails?.name || orderDetails?.shipping_address?.fullName || 'N/A'}\n- Email: ${userDetails?.email || orderDetails?.shipping_address?.email || 'N/A'}\n- Phone: ${orderDetails?.shipping_address?.phone || userDetails?.phone || 'N/A'}\n\nPlease provide assistance with the following:\n\nThank you.\n\nBest regards,\n${userDetails?.name || orderDetails?.shipping_address?.fullName || 'Customer'}`;
    
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleTrackOrder = () => {
    const trackingNumber = orderDetails?.tracking_number;
    const hasTrackingNumber = trackingNumber && trackingNumber !== 'Will be assigned' && trackingNumber !== 'Pending';
    setShowTrackingDetails(true);
    setActionFeedback({
      type: hasTrackingNumber ? 'success' : 'info',
      message: hasTrackingNumber
        ? `Tracking is active for ${trackingNumber}.              
        You will recieve the mail for your order`
        : 'Tracking number will appear once your order is shipped.'
    });
  };

  const generateProfessionalInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      generateEnhancedTextInvoice();
      setActionFeedback({
        type: 'success',
        message: 'Detailed invoice downloaded successfully.'
      });
    } catch (error) {
      console.error('Error generating invoice:', error);
      setActionFeedback({
        type: 'info',
        message: 'Could not generate invoice. Please try again.'
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const generateEnhancedTextInvoice = () => {
    const order = orderDetails || getFallbackOrderData();
    const user = userDetails;
    const payment = getCurrentPaymentMethod();
    
    const shippingAddress = order.shipping_address || {};
    const customerName = shippingAddress.fullName || user?.name || shippingAddress.name || 'Customer';
    const customerEmail = shippingAddress.email || user?.email || 'N/A';
    const customerPhone = shippingAddress.phone || user?.phone || 'N/A';
    
    const escapeHtml = (value) => String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

    const toAbsoluteUrl = (imagePath) => {
      if (!imagePath) {
        return `${window.location.origin}/images/s.jpg`;
      }
      if (/^https?:\/\//i.test(imagePath)) {
        return imagePath;
      }
      if (imagePath.startsWith('//')) {
        return `https:${imagePath}`;
      }
      if (imagePath.startsWith('/')) {
        return `${window.location.origin}${imagePath}`;
      }
      return `${window.location.origin}/${imagePath.replace(/^\.?\//, '')}`;
    };

    const rows = (order?.items || []).map((item, index) => {
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.price || 0);
      const total = quantity * unitPrice;
      const productImage = toAbsoluteUrl(item.product_image || item.image || item.productImage);
      return `
        <tr>
          <td>${index + 1}</td>
          <td class="product-cell"><img class="product-image" src="${escapeHtml(productImage)}" alt="${escapeHtml(item.product_name || item.name || 'Product')}" /></td>
          <td>${escapeHtml(item.product_name || item.name || 'Product')}</td>
          <td>${quantity}</td>
          <td>Rs. ${unitPrice.toFixed(2)}</td>
          <td>Rs. ${total.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
    const invoiceDate = new Date();
    const formattedOrderDate = orderDate.toLocaleDateString();
    const formattedInvoiceDate = invoiceDate.toLocaleDateString();
    const orderStatus = String(order?.status || 'processing').toUpperCase();
    const paymentSummary = `${payment.name.toUpperCase()} - ${String(order?.payment_status || 'pending').toUpperCase()}`;
    const trackingNumber = order?.tracking_number || 'Will be assigned upon shipment';
    const estimatedDelivery = order?.estimated_delivery
      ? new Date(order.estimated_delivery).toLocaleDateString()
      : 'Within 7 working days';
    const storeLogoUrl = `${window.location.origin}/logo192.png`;
    const paymentLogoUrl = toAbsoluteUrl(payment.image);

    const invoiceContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nexus Store - Invoice #${escapeHtml(order?.id || 'N/A')}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 28px;
      font-family: "Segoe UI", Arial, sans-serif;
      color: #1f2937;
      background: linear-gradient(160deg, #f0f9ff 0%, #eef2ff 55%, #f8fafc 100%);
    }
    .invoice {
      max-width: 980px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #dbeafe;
      border-radius: 18px;
      box-shadow: 0 18px 40px rgba(30, 64, 175, 0.12);
      overflow: hidden;
    }
    .header {
      background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 40%, #7c3aed 100%);
      color: #ffffff;
      padding: 30px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 8px;
    }
    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      object-fit: cover;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.4);
      padding: 4px;
    }
    .brand-title {
      margin: 0 0 6px;
      font-size: 32px;
      letter-spacing: 0.4px;
    }
    .brand-subtitle, .header-meta {
      margin: 2px 0;
      font-size: 14px;
      opacity: 0.95;
    }
    .content {
      padding: 26px;
    }
    .section {
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      margin-bottom: 18px;
      overflow: hidden;
      background: #ffffff;
    }
    .section h3 {
      margin: 0;
      padding: 12px 16px;
      font-size: 14px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #1e3a8a;
      background: linear-gradient(90deg, #eff6ff 0%, #f5f3ff 100%);
      border-bottom: 1px solid #dbeafe;
    }
    .section-body {
      padding: 14px 16px;
    }
    .summary-grid, .customer-grid, .delivery-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 20px;
      font-size: 14px;
    }
    .label {
      color: #6b7280;
      min-width: 120px;
      display: inline-block;
    }
    .value {
      color: #111827;
      font-weight: 600;
    }
    .status-pill {
      display: inline-block;
      border-radius: 999px;
      padding: 4px 10px;
      font-size: 12px;
      font-weight: 700;
      background: #dcfce7;
      color: #166534;
    }
    .payment-method {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .payment-logo {
      width: 30px;
      height: 30px;
      border-radius: 4px;
      object-fit: contain;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      padding: 3px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      font-size: 14px;
    }
    th, td {
      border: 1px solid #e5e7eb;
      padding: 11px 10px;
      text-align: left;
    }
    th {
      background: #f8fafc;
      color: #334155;
      font-weight: 700;
    }
    tbody tr:nth-child(even) {
      background: #fcfcff;
    }
    .product-cell {
      width: 74px;
    }
    .product-image {
      width: 52px;
      height: 52px;
      border-radius: 8px;
      object-fit: cover;
      border: 1px solid #e2e8f0;
      background: #f8fafc;
      display: block;
    }
    .amount-table {
      width: 360px;
      margin-left: auto;
      margin-top: 8px;
    }
    .amount-table td {
      border: none;
      padding: 6px 0;
    }
    .amount-total td {
      padding-top: 10px;
      border-top: 1px dashed #cbd5e1;
      font-size: 16px;
      font-weight: 800;
      color: #0f172a;
    }
    .thank-you {
      margin-top: 18px;
      padding: 16px;
      border: 1px dashed #93c5fd;
      border-radius: 12px;
      background: #eff6ff;
      color: #1e3a8a;
      font-size: 14px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div>
        <div class="brand-wrap">
          <h1 class="brand-title">Nexus Store - Official Invoice</h1>
        </div>
        <p class="brand-subtitle">Nexus Store - Your Trusted Shopping Partner</p>
        <p class="brand-subtitle">Email: support@nexusstore.com | Website: www.nexusstore.com</p>
        <p class="brand-subtitle">Support: +977-1-4000000 | Mon-Sun: 9:00 AM - 6:00 PM</p>
      </div>
      <div>
        <p class="header-meta"><strong>Invoice No:</strong> #INV-${escapeHtml(order?.id || 'N/A')}</p>
        <p class="header-meta"><strong>Order No:</strong> #${escapeHtml(order?.id || 'N/A')}</p>
      </div>
    </div>

    <div class="content">
      <div class="section">
        <h3>Invoice Summary</h3>
        <div class="section-body summary-grid">
          <div><span class="label">Invoice Date:</span> <span class="value">${escapeHtml(formattedInvoiceDate)}</span></div>
          <div><span class="label">Order Date:</span> <span class="value">${escapeHtml(formattedOrderDate)}</span></div>
          <div><span class="label">Status:</span> <span class="status-pill">${escapeHtml(orderStatus)}</span></div>
          <div><span class="label">Payment:</span> <span class="value payment-method"><img class="payment-logo" src="${escapeHtml(paymentLogoUrl)}" alt="${escapeHtml(payment.name)}" /> ${escapeHtml(paymentSummary)}</span></div>
        </div>
      </div>

      <div class="section">
        <h3>Customer Information</h3>
        <div class="section-body customer-grid">
          <div><span class="label">Customer:</span> <span class="value">${escapeHtml(customerName)}</span></div>
          <div><span class="label">Email:</span> <span class="value">${escapeHtml(customerEmail)}</span></div>
          <div><span class="label">Phone:</span> <span class="value">${escapeHtml(customerPhone)}</span></div>
          <div><span class="label">Address:</span> <span class="value">${escapeHtml(shippingAddress.address || 'N/A')}</span></div>
          <div><span class="label">City:</span> <span class="value">${escapeHtml(shippingAddress.city || 'N/A')}</span></div>
          <div><span class="label">Postal Code:</span> <span class="value">${escapeHtml(shippingAddress.postalCode || 'N/A')}</span></div>
          <div><span class="label">Country:</span> <span class="value">${escapeHtml(shippingAddress.country || 'Nepal')}</span></div>
        </div>
      </div>

      <div class="section">
        <h3>Order Items</h3>
        <div class="section-body">
          <table>
            <thead>
              <tr>
                <th>No.</th>
                <th>Image</th>
                <th>Item Name</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total Amount</th>
              </tr>
            </thead>
            <tbody>
              ${rows || '<tr><td colspan="6">No items found in this order.</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>

      <div class="section">
        <h3>Payment Summary</h3>
        <div class="section-body">
          <table class="amount-table">
            <tr><td>Subtotal:</td><td>Rs. ${Number(order?.subtotal || order?.total_amount || 0).toFixed(2)}</td></tr>
            <tr><td>Shipping Fee:</td><td>Rs. ${Number(order?.shipping_fee || 50).toFixed(2)}</td></tr>
            <tr class="amount-total"><td>GRAND TOTAL:</td><td>Rs. ${Number(order?.total_amount || 0).toFixed(2)}</td></tr>
          </table>
        </div>
      </div>

      <div class="section">
        <h3>Delivery Information</h3>
        <div class="section-body delivery-grid">
          <div><span class="label">Tracking Number:</span> <span class="value">${escapeHtml(trackingNumber)}</span></div>
          <div><span class="label">Estimated Delivery:</span> <span class="value">${escapeHtml(estimatedDelivery)}</span></div>
          <div><span class="label">Shipping Method:</span> <span class="value">Express Delivery - Rs. 50 charge all over Nepal</span></div>
        </div>
      </div>

      <div class="thank-you">
        <strong>Thank you for shopping with us!</strong><br/>
        We appreciate your business and hope you enjoy your products.<br/>
        For support: support@nexusstore.com | +977-1-4000000 | www.nexusstore.com
      </div>
    </div>
  </div>
</body>
</html>`.trim();

    const blob = new Blob([invoiceContent], { type: 'text/html;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `6thshop-invoice-${orderId || order?.id || 'order'}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const shareOrder = async () => {
    const shareText = `I just placed an order on Nexus Store! 🛍️\n\nOrder Details:\n📦 Order ID: #${orderId}\n💰 Total: Rs. ${orderDetails?.total_amount || '0.00'}\n🚚 Status: ${orderDetails?.status || 'Processing'}\n\nCheck out Nexus Store for amazing products! 🌟`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Nexus Store Order',
          text: shareText,
          url: window.location.origin,
        });
      } catch (error) {
        console.log('Error sharing:', error);
        fallbackShare(shareText);
      }
    } else {
      fallbackShare(shareText);
    }
  };

  const fallbackShare = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setActionFeedback({
        type: 'success',
        message: 'Order details copied to clipboard.'
      });
    }).catch(() => {
      setActionFeedback({
        type: 'info',
        message: 'Could not copy automatically. You can share this order from your dashboard.'
      });
    });
  };

  const getOrderProgress = () => {
    const statusOrder = ['pending', 'processing', 'confirmed', 'shipped', 'delivered'];
    const currentIndex = statusOrder.indexOf(orderDetails?.status || 'pending');
    return {
      percentage: ((currentIndex + 1) / statusOrder.length) * 100,
      steps: statusOrder.map((status, index) => ({
        status,
        ...getStatusInfo(status),
        completed: index <= currentIndex,
        current: index === currentIndex
      }))
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-semibold">Loading your order details...</p>
          <p className="text-gray-500 text-sm mt-2">Order #{orderId}</p>
        </div>
      </div>
    );
  }

  if (!success && paymentMethod !== 'cod') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h1>
          <p className="text-gray-600 mb-6">There was an issue processing your payment. Please try again.</p>
          <div className="space-y-3">
            <Link
              to="/cart"
              className="block bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Back to Cart
            </Link>
            <button
              onClick={() => window.history.back()}
              className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const payment = getCurrentPaymentMethod();
  const statusInfo = getStatusInfo(orderDetails?.status);
  const progress = getOrderProgress();

  const shippingAddress = orderDetails?.shipping_address || {};
  const displayName = shippingAddress.fullName || userDetails?.name || shippingAddress.name || 'Customer';
  const displayEmail = shippingAddress.email || userDetails?.email || 'N/A';
  const displayPhone = shippingAddress.phone || userDetails?.phone || 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Order Confirmed!
          </h1>
          
          <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Thank you for your purchase, {displayName}! We're preparing your order with care.
          </p>

          {/* Status Badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold shadow-sm">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {paymentMethod === 'cod' ? 'Order Placed' : 'Payment Successful'}
            </div>
            
            <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold shadow-sm">
              <img
                src={payment.image}
                alt={payment.name}
                className="w-8 h-8 mr-2 rounded object-contain bg-white border border-blue-200 p-1"
              />
              {payment.name}
            </div>
            
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold shadow-sm ${statusInfo.color}`}>
              <span className="mr-2">{statusInfo.icon}</span>
              {statusInfo.text}
            </div>
          </div>

          {/* Order Progress Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">Order Progress</span>
              <span className="text-sm font-semibold text-green-600">{Math.round(progress.percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Order Summary - 3/4 width */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Order Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Summary</h2>
                <div className="text-right">
                  <span className="font-mono text-lg font-semibold text-gray-700">#{orderDetails?.id}</span>
                  <p className="text-sm text-gray-500">Order Date: {orderDetails?.created_at ? new Date(orderDetails.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Customer & Shipping Info */}
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-xl border border-blue-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Customer Information
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p><strong>Name:</strong> {displayName}</p>
                      <p><strong>Email:</strong> {displayEmail}</p>
                      <p><strong>Phone:</strong> {displayPhone}</p>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-5 rounded-xl border border-green-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Shipping Address
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">{displayName}</p>
                      <p>{shippingAddress.address || 'N/A'}</p>
                      <p>{shippingAddress.city || 'N/A'}, {shippingAddress.postalCode || 'N/A'}</p>
                      <p>{shippingAddress.country || 'Nepal'}</p>
                      {displayPhone && displayPhone !== 'N/A' && (
                        <p className="mt-2"><strong>Phone:</strong> {displayPhone}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Order & Payment Info */}
                <div className="space-y-6">
                  {/* Order Timeline */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-5 rounded-xl border border-purple-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Order Timeline
                    </h3>
                    <div className="space-y-3">
                      {progress.steps.map((step, index) => (
                        <div key={step.status} className="flex items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                            step.completed ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-500'
                          }`}>
                            {step.completed ? (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <span className="text-xs">{index + 1}</span>
                            )}
                          </div>
                          <span className={`ml-3 text-sm ${step.completed ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                            {step.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 p-5 rounded-xl border border-orange-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      Payment Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-semibold">Rs. {parseFloat(orderDetails?.subtotal || orderDetails?.total_amount || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping Fee:</span>
                        <span className="font-semibold">Rs. {parseFloat(orderDetails?.shipping_fee || 50).toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-gray-500 -mt-1">
                        <em>Rs. 50 delivery charge all over Nepal</em>
                      </div>
                      <div className="flex justify-between border-t pt-2 mt-2">
                        <span className="font-bold">Total Amount:</span>
                        <span className="font-bold text-green-600 text-lg">
                          Rs. {parseFloat(orderDetails?.total_amount || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Payment Method:</span>
                        <span>{payment.name}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Payment Status:</span>
                        <span className={orderDetails?.payment_status === 'completed' ? 'text-green-600' : 'text-orange-600'}>
                          {orderDetails?.payment_status === 'completed' ? 'Completed' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items with Images */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Order Items ({orderDetails?.items?.length || 0})
                </h3>
                <div className="space-y-4">
                  {orderDetails?.items?.map((item, index) => (
                    <div key={item.id || index} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center overflow-hidden">
                          <img
                            src={item.product_image || 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500'}
                            alt={item.product_name || 'Product'}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500';
                            }}
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{item.product_name || item.name || 'Product'}</p>
                          <div className="flex space-x-4 text-sm text-gray-500">
                            <span>Quantity: {item.quantity}</span>
                            <span>Price: Rs. {parseFloat(item.price || 0).toFixed(2)}</span>
                          </div>
                          {item.product_category && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1">
                              {item.product_category}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900 text-lg">Rs. {(item.quantity * parseFloat(item.price || 0)).toFixed(2)}</p>
                        <p className="text-sm text-gray-500">Unit: Rs. {parseFloat(item.price || 0).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - 1/4 width */}
          <div className="space-y-6">

            {actionFeedback && (
              <div className={`rounded-xl border p-4 text-sm ${
                actionFeedback.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-700'
                  : 'bg-blue-50 border-blue-200 text-blue-700'
              }`}>
                {actionFeedback.message}
              </div>
            )}
             
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={handleTrackOrder}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Track Order
                </button>
                
                <button
                  onClick={generateProfessionalInvoice}
                  disabled={isGeneratingInvoice}
                  className="w-full border border-green-500 text-green-600 hover:bg-green-500 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingInvoice ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Download Invoice
                    </>
                  )}
                </button>
                
                <button
                  onClick={shareOrder}
                  className="w-full border border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share Order
                </button>
              </div>
            </div>

            {showTrackingDetails && (
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking Details</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Order ID:</strong> #{orderDetails?.id || orderId || 'N/A'}</p>
                  <p><strong>Tracking Number:</strong> {orderDetails?.tracking_number || 'Pending assignment'}</p>
                  <p><strong>Status:</strong> {orderDetails?.status || 'Processing'}</p>
                  <p><strong>Estimated Delivery:</strong> {orderDetails?.estimated_delivery ? new Date(orderDetails.estimated_delivery).toLocaleDateString() : 'Within 7 working days'}</p>
                  <p className="text-gray-500">You will keep receiving updates by email as shipping progresses.</p>
                </div>
              </div>
            )}

            {/* Support Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help?</h3>
              <p className="text-blue-700 text-sm mb-4">
                Our dedicated support team is here to help you 24/7.
              </p>
              <div className="space-y-2 text-sm">
                <button
                  onClick={handleContactSupport}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Contact Support
                </button>
                <div className="text-blue-600 space-y-1 text-xs">
                  <p>📧 support@nexusstore.com</p>
                  <p>📞 +977-1-4000000</p>
                  <p>🕒 24/7 Support</p>
                </div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tracking Number</span>
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {orderDetails?.tracking_number || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Est. Delivery</span>
                  <span className="font-semibold">
                    {orderDetails?.estimated_delivery 
                      ? new Date(orderDetails.estimated_delivery).toLocaleDateString()
                      : 'Within 7 days'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-green-600 font-semibold">Express</span>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <em>Rs. 50 delivery charge all over Nepal</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Continue Shopping
            </Link>
            
            <Link
              to="/dashboard?tab=orders"
              className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white py-4 px-8 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View My Orders
            </Link>
          </div>

          <p className="text-gray-500 text-sm">
            Use the buttons above to continue shopping or view your orders.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
