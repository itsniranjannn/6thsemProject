const express = require('express');
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getSalesStats
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/', protect, createOrder);
router.post('/create', protect, createOrder); // Alternative endpoint
router.get('/my-orders', protect, getUserOrders);
router.get('/:id', protect, getOrderById);

// Admin routes
router.get('/', protect, admin, getAllOrders);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.get('/admin/stats', protect, admin, getSalesStats);

// ✅ FIXED: Enhanced Professional Invoice Generation
router.post('/:id/generate-invoice', protect, async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get user details
    const user = await User.findById(order.user_id);
    
    // Generate professional PDF invoice
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=nexusstore-invoice-${orderId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add invoice header with styling
    doc.fillColor('#4F46E5')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('6thSHOP', 50, 50);
    
    doc.fillColor('#666666')
       .fontSize(10)
       .font('Helvetica')
       .text('Your Trusted Shopping Partner', 50, 80);
    
    doc.text('Email: support@nexusstore.com | Phone: +977-1-4000000', 50, 95);
    doc.text('Website: www.nexusstore.com', 50, 110);

    // Invoice details
    doc.fillColor('#000000')
       .fontSize(18)
       .font('Helvetica-Bold')
       .text('INVOICE', 400, 50);
    
    doc.fillColor('#666666')
       .fontSize(10)
       .font('Helvetica');
    
    doc.text(`Invoice #: INV-${order.id}`, 400, 80);
    doc.text(`Order #: ${order.id}`, 400, 95);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 400, 110);
    doc.text(`Status: ${order.status.toUpperCase()}`, 400, 125);

    // Customer information
    doc.fillColor('#000000')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('BILL TO:', 50, 160);
    
    doc.fillColor('#666666')
       .fontSize(10)
       .font('Helvetica');
    
    const customerName = order.shipping_address?.fullName || user?.name || 'Customer';
    const customerEmail = order.shipping_address?.email || user?.email || 'N/A';
    const customerPhone = order.shipping_address?.phone || user?.phone || 'N/A';
    
    doc.text(customerName, 50, 180);
    doc.text(customerEmail, 50, 195);
    doc.text(customerPhone, 50, 210);
    doc.text(order.shipping_address?.address || 'N/A', 50, 225);
    doc.text(`${order.shipping_address?.city || 'N/A'}, ${order.shipping_address?.postalCode || 'N/A'}`, 50, 240);
    doc.text(order.shipping_address?.country || 'Nepal', 50, 255);

    // Items table header
    const tableTop = 300;
    doc.fillColor('#FFFFFF')
       .rect(50, tableTop, 500, 20)
       .fill();
    
    doc.fillColor('#4F46E5')
       .fontSize(10)
       .font('Helvetica-Bold');
    
    doc.text('Description', 50, tableTop + 7);
    doc.text('Qty', 350, tableTop + 7);
    doc.text('Price', 400, tableTop + 7);
    doc.text('Amount', 470, tableTop + 7);

    // Items
    let y = tableTop + 30;
    doc.fillColor('#666666')
       .font('Helvetica');
    
    order.items.forEach((item, index) => {
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
      
      doc.text(item.product_name || 'Product', 50, y);
      doc.text(item.quantity.toString(), 350, y);
      doc.text(`Rs. ${parseFloat(item.price).toFixed(2)}`, 400, y);
      doc.text(`Rs. ${(item.quantity * parseFloat(item.price)).toFixed(2)}`, 470, y);
      y += 15;
    });

    // Total section
    y += 10;
    const totalY = Math.max(y, 650);
    
    doc.strokeColor('#CCCCCC')
       .moveTo(350, totalY)
       .lineTo(520, totalY)
       .stroke();
    
    doc.fillColor('#000000')
       .font('Helvetica-Bold');
    
    doc.text('Subtotal:', 350, totalY + 15);
    doc.text(`Rs. ${parseFloat(order.subtotal || order.total_amount).toFixed(2)}`, 470, totalY + 15);
    
    doc.text('Shipping:', 350, totalY + 30);
    doc.text(`Rs. ${parseFloat(order.shipping_fee || 0).toFixed(2)}`, 470, totalY + 30);
    
    doc.strokeColor('#000000')
       .moveTo(350, totalY + 45)
       .lineTo(520, totalY + 45)
       .stroke();
    
    doc.fontSize(12)
       .text('Total:', 350, totalY + 55);
    doc.text(`Rs. ${parseFloat(order.total_amount).toFixed(2)}`, 470, totalY + 55);

    // Footer
    const footerY = totalY + 100;
    doc.fillColor('#666666')
       .fontSize(8)
       .font('Helvetica');
    
    doc.text('Thank you for your business!', 50, footerY);
    doc.text('For questions about this invoice, contact support@nexusstore.com', 50, footerY + 12);
    doc.text('Nexus Store - Your Trusted Shopping Partner', 50, footerY + 24);

    doc.end();

  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ success: false, message: 'Error generating invoice' });
  }
});

module.exports = router;