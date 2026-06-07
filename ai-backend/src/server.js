const express = require('express');
const cors = require('cors');
const { categorizeBatch, CATEGORIES } = require('./categorizer');

const app = express();
const PORT = process.env.PORT || 3001;

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
app.post('/api/categorize', (req, res) => {
  try {
    const { transactions } = req.body;
    
    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ 
        error: 'Missing or invalid transactions array' 
      });
    }
    
    console.log(`📥 Received ${transactions.length} transactions for categorization`);
    
    const results = categorizeBatch(transactions);
    
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