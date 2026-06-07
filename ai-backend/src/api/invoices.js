const express = require('express');
const { authMiddleware } = require('../auth/middleware');
const InvoiceGenerator = require('../services/invoice-generator');
const prisma = require('../db/prisma');
const fs = require('fs');

const router = express.Router();
const invoiceGenerator = new InvoiceGenerator();

/**
 * POST /api/invoices/generate
 * Create invoice from transaction
 */
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { transactionId, seller } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({ error: 'transactionId required' });
    }
    
    // Get user if seller not provided
    const userSeller = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    const invoicePath = await invoiceGenerator.createFromTransaction(
      transactionId,
      seller || userSeller
    );
    
    // Send file
    res.download(invoicePath, `invoice-${transactionId}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err);
        // Clean up file
        fs.unlink(invoicePath, () => {});
      }
    });
  } catch (error) {
    console.error('Invoice generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate invoice',
      message: error.message 
    });
  }
});

/**
 * POST /api/invoices/create
 * Create custom invoice
 */
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { seller, buyer, items, dueDate, paymentTerms } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'At least one item required' });
    }
    
    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    const invoicePath = await invoiceGenerator.generateInvoice({
      invoiceNumber,
      seller: { ...user, ...seller },
      buyer,
      items,
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      paymentTerms
    });
    
    res.json({
      success: true,
      invoiceNumber,
      filePath: invoicePath,
      downloadUrl: `/api/invoices/download/${invoiceNumber}`
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({ 
      error: 'Failed to create invoice',
      message: error.message 
    });
  }
});

/**
 * GET /api/invoices/download/:invoiceNumber
 * Download invoice PDF
 */
router.get('/download/:invoiceNumber', authMiddleware, async (req, res) => {
  try {
    const filePath = `/tmp/invoice-${req.params.invoiceNumber}.pdf`;
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.download(filePath, `${req.params.invoiceNumber}.pdf`);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ error: 'Failed to download invoice' });
  }
});

module.exports = router;