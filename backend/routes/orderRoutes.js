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

// Add this route for professional invoice generation
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
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=6thshop-invoice-${orderId}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add invoice header
    doc.fontSize(20).font('Helvetica-Bold').text('6thSHOP', 50, 50);
    doc.fontSize(10).font('Helvetica').text('Your Trusted Shopping Partner', 50, 75);
    doc.text('Email: support@6thshop.com | Phone: +977-1-4000000', 50, 90);
    doc.text('Website: www.6thshop.com', 50, 105);

    // Invoice details
    doc.fontSize(16).font('Helvetica-Bold').text('INVOICE', 400, 50);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Invoice #: INV-${order.id}`, 400, 75);
    doc.text(`Order #: ${order.id}`, 400, 90);
    doc.text(`Date: ${new Date(order.created_at).toLocaleDateString()}`, 400, 105);
    doc.text(`Status: ${order.status.toUpperCase()}`, 400, 120);

    // Customer information
    doc.fontSize(12).font('Helvetica-Bold').text('BILL TO:', 50, 150);
    doc.fontSize(10).font('Helvetica');
    doc.text(user?.name || 'Customer', 50, 170);
    doc.text(user?.email || 'N/A', 50, 185);
    doc.text(order.shipping_address?.phone || 'N/A', 50, 200);
    doc.text(order.shipping_address?.address || 'N/A', 50, 215);
    doc.text(`${order.shipping_address?.city || 'N/A'}, ${order.shipping_address?.postalCode || 'N/A'}`, 50, 230);
    doc.text(order.shipping_address?.country || 'Nepal', 50, 245);

    // Items table header
    const tableTop = 280;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Description', 50, tableTop);
    doc.text('Qty', 300, tableTop);
    doc.text('Price', 350, tableTop);
    doc.text('Amount', 420, tableTop);

    // Items
    let y = tableTop + 20;
    doc.font('Helvetica');
    order.items.forEach(item => {
      doc.text(item.product_name || 'Product', 50, y);
      doc.text(item.quantity.toString(), 300, y);
      doc.text(`Rs. ${parseFloat(item.price).toFixed(2)}`, 350, y);
      doc.text(`Rs. ${(item.quantity * parseFloat(item.price)).toFixed(2)}`, 420, y);
      y += 15;
    });

    // Total
    y += 10;
    doc.font('Helvetica-Bold');
    doc.text('Subtotal:', 350, y);
    doc.text(`Rs. ${parseFloat(order.subtotal || order.total_amount).toFixed(2)}`, 420, y);
    y += 15;
    doc.text('Shipping:', 350, y);
    doc.text(`Rs. ${parseFloat(order.shipping_fee || 0).toFixed(2)}`, 420, y);
    y += 15;
    doc.text('Total:', 350, y);
    doc.text(`Rs. ${parseFloat(order.total_amount).toFixed(2)}`, 420, y);

    // Footer
    doc.fontSize(8).font('Helvetica');
    doc.text('Thank you for your business!', 50, 500);
    doc.text('For questions about this invoice, contact support@6thshop.com', 50, 515);

    doc.end();

  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ success: false, message: 'Error generating invoice' });
  }
});


module.exports = router;