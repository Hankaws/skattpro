const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { categorizeBatch, CATEGORIES } = require('./categorizer');
const HybridCategorizer = require('./hybrid-categorizer');
const { parseReceipt } = require('./receipts/ocr');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    version: '0.1.0',
    categories_loaded: Object.keys(CATEGORIES).length,
    timestamp: new Date().toISOString()
  });
});

// Categorize transactions
app.post('/api/categorize', async (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ 
        error: 'Missing or invalid transactions array' 
      });
    }
    
    console.log(`📥 Received ${transactions.length} transactions for categorization`);
    
    const results = await hybrid.categorizeBatch(transactions);
    
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
app.post('/api/receipt', upload.single('receipt'), async (req, res) => {
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
      res.json({
        success: true,
        receipt: result
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

// Get review queue (transactions needing manual review)
app.get('/api/review-queue', (req, res) => {
  // In production, this would query a database
  // For now, return mock data structure
  res.json({
    success: true,
    queue: [],
    stats: {
      pending: 0,
      reviewed: 0
    }
  });
});

// Submit manual correction (to improve the model)
app.post('/api/correction', (req, res) => {
  const { transactionId, correctCategory, correctAccount, userFeedback } = req.body;
  
  console.log(`✏️  User correction received:`, {
    transactionId,
    correctCategory,
    correctAccount,
    feedback: userFeedback
  });
  
  // In production, save to database for model training
  
  res.json({
    success: true,
    message: 'Correction saved - thank you for improving SkattPro AI!'
  });
});

// Get available categories
app.get('/api/categories', (req, res) => {
  res.json({ categories: CATEGORIES });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║           🚀 SkattPro AI Server Ready                   ║
║                                                          ║
║   Local:     http://localhost:${PORT}                    ║
║   Health:    http://localhost:${PORT}/api/health         ║
║   Categorize: POST http://localhost:${PORT}/api/categorize ║
║                                                          ║
║   Phase: Rule-based prototype (Week 1-2)                ║
║   Next:  LLM integration (Week 3-4)                     ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = app;