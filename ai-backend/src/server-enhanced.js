const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { categorizeBatch, CATEGORIES } = require('./categorizer');
const HybridCategorizer = require('./hybrid-categorizer');
const { parseReceipt } = require('./receipts/ocr');
const { authMiddleware, optionalAuth } = require('./auth/middleware');
const authRoutes = require('./auth/routes');
const dashboardRoutes = require('./api/dashboard');
const invoiceRoutes = require('./api/invoices');
const prisma = require('./db/prisma');
const { calculateForskuddsskatt } = require('./tax/forskuddsskatt');

const app = express();
const PORT = process.env.PORT || 3003;  // Using 3003 - other ports (3000-3002) in use

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }  // 10MB max
});

// Initialize hybrid categorizer
const hybrid = new HybridCategorizer({
  llmThreshold: 0.85,
  amountThreshold: 1000,
  llmOptions: {
    apiKey: process.env.LLM_API_KEY
  }
});

app.use(cors());
app.use(express.json());

// Serve static files (dashboard UI)
app.use('/', express.static(path.join(__dirname, '..')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/invoices', invoiceRoutes);

// Public endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '0.3.0',
    categories_loaded: Object.keys(CATEGORIES).length,
    database: 'connected',
    timestamp: new Date().toISOString()
  });
});

// Authentication routes
app.use('/api/auth', authRoutes);

// Categorize transactions (with optional auth)
app.post('/api/categorize', optionalAuth, async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ 
        error: 'Missing or invalid transactions array' 
      });
    }
    
    console.log(`📥 Received ${transactions.length} transactions for categorization`);
    
    const results = await hybrid.categorizeBatch(transactions);
    
    // If authenticated, save to database
    if (req.userId) {
      await prisma.transaction.createMany({
        data: results.map(r => ({
          userId: req.userId,
          amount: parseFloat(r.amount || 0),
          description: r.description || '',
          date: new Date(r.date || Date.now()),
          category: r.category,
          account: r.account,
          vatCode: r.vat_code,
          confidence: r.confidence,
          method: r.method,
          explanation: r.explanation || r.reasoning
        }))
      });
      console.log(`   ✓ Saved ${results.length} transactions to database`);
    }
    
    // Calculate stats
    const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
    const highConfidence = results.filter(r => r.confidence >= 0.85).length;
    const needsReview = results.filter(r => r.confidence < 0.70).length;
    
    console.log(`📊 Results: ${(avgConfidence * 100).toFixed(1)}% avg | ${highConfidence}/${results.length} auto | ${needsReview} need review`);
    
    res.json({
      success: true,
      results,
      stats: {
        total: results.length,
        auto_categorized: highConfidence,
        needs_review: needsReview,
        avg_confidence: parseFloat(avgConfidence.toFixed(3))
      }
    });
  } catch (error) {
    console.error('❌ Categorization error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload and parse receipt
app.post('/api/receipt', authMiddleware, upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt file uploaded' });
    }
    
    console.log(`📷 Receipt uploaded: ${req.file.originalname} (${req.file.size} bytes)`);
    
    const result = await parseReceipt(req.file.path);
    
    // Clean up uploaded file
    fs.unlink(req.file.path, err => {
      if (err) console.error('Failed to delete temp file:', err);
    });
    
    if (result.success) {
      // Save receipt to database
      const receipt = await prisma.receipt.create({
        data: {
          userId: req.userId,
          imageUrl: `uploads/${req.file.filename}`,
          originalName: req.file.originalname,
          merchant: result.merchant,
          date: result.date ? new Date(result.date) : null,
          amount: result.amount ? parseFloat(result.amount) : null,
          vatAmount: result.vat ? parseFloat(result.vat) : null,
          ocrText: result.text,
          confidence: result.confidence
        }
      });
      
      res.json({
        success: true,
        receipt: {
          ...result,
          id: receipt.id
        }
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Receipt processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's transactions
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 20, reviewNeeded = false } = req.query;
    
    const where = {
      userId: req.userId,
      ...(reviewNeeded === 'true' ? { confidence: { lt: 0.70 } } : {})
    };
    
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit)
    });
    
    const total = await prisma.transaction.count({ where });
    
    res.json({
      success: true,
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get review queue
app.get('/api/review-queue', authMiddleware, async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        confidence: { lt: 0.70 },
        isReviewed: false
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
    
    res.json({
      success: true,
      queue: transactions,
      stats: {
        pending: transactions.length,
        reviewed: await prisma.transaction.count({
          where: {
            userId: req.userId,
            isReviewed: true
          }
        })
      }
    });
  } catch (error) {
    console.error('Get review queue error:', error);
    res.status(500).json({ error: 'Failed to get review queue' });
  }
});

// Submit correction
app.post('/api/correction', authMiddleware, async (req, res) => {
  try {
    const { transactionId, correctCategory, correctAccount, userFeedback } = req.body;
    
    // Get original transaction
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Update transaction
    await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        category: correctCategory,
        account: correctAccount,
        isReviewed: true,
        isCorrected: true
      }
    });
    
    // Save correction for model training
    await prisma.correction.create({
      data: {
        userId: req.userId,
        transactionId,
        originalCategory: transaction.category,
        originalAccount: transaction.account,
        originalConfidence: transaction.confidence,
        correctedCategory: correctCategory,
        correctedAccount: correctAccount,
        userFeedback: userFeedback || null
      }
    });
    
    console.log(`✏️  User correction saved: ${transactionId}`);
    
    res.json({
      success: true,
      message: 'Correction saved - thank you for improving SkattPro AI!'
    });
  } catch (error) {
    console.error('Submit correction error:', error);
    res.status(500).json({ error: 'Failed to submit correction' });
  }
});

// Forskuddsskatt calculator
app.post('/api/forskuddsskatt', authMiddleware, (req, res) => {
  try {
    const { income, expenses, personalIncome = 0, isOslo = true } = req.body;
    
    if (!income || !expenses) {
      return res.status(400).json({
        error: 'Missing required fields: income and expenses'
      });
    }
    
    const result = calculateForskuddsskatt({
      income: parseFloat(income),
      expenses: parseFloat(expenses),
      personalIncome: parseFloat(personalIncome),
      isOslo
    });
    
    res.json({
      success: true,
      calculation: result
    });
  } catch (error) {
    console.error('Forskuddsskatt calculation error:', error);
    res.status(500).json({ error: 'Calculation failed' });
  }
});

// Get available categories
app.get('/api/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           🚀 SkattPro AI Server v0.5.0                   ║
║                                                          ║
║   Local:     http://localhost:${PORT}                    ║
║   Dashboard: http://localhost:${PORT}/dashboard.html      ║
║   Invoice:   http://localhost:${PORT}/create-invoice.html║
║   Health:    http://localhost:${PORT}/api/health         ║
║                                                          ║
║   Status:    ✅ Ready for Alpha Launch                   ║
╚══════════════════════════════════════════════════════════╝
`.trim());
});

module.exports = app;