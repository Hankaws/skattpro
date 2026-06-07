const express = require('express');
const { authMiddleware } = require('../auth/middleware');
const prisma = require('../db/prisma');
const { calculateForskuddsskatt } = require('../tax/forskuddsskatt');

const router = express.Router();

/**
 * GET /api/dashboard/profit
 * Get real-time profit & loss dashboard
 */
router.get('/profit', authMiddleware, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;
    
    // Date range
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    
    if (month) {
      startDate.setMonth(parseInt(month) - 1);
      endDate.setMonth(parseInt(month));
      endDate.setDate(0); // Last day of month
    }
    
    // Get all transactions for period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });
    
    // Calculate metrics
    const income = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const expenses = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0));
    
    const profit = income - expenses;
    
    // Category breakdown
    const byCategory = {};
    transactions.forEach(t => {
      const cat = t.category || 'Ukategorisert';
      if (!byCategory[cat]) {
        byCategory[cat] = { income: 0, expenses: 0 };
      }
      if (t.amount > 0) {
        byCategory[cat].income += parseFloat(t.amount);
      } else {
        byCategory[cat].expenses += Math.abs(parseFloat(t.amount));
      }
    });
    
    // Monthly trend (last 12 months)
    const monthlyTrend = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date(year, i, 1);
      const monthEnd = new Date(year, i + 1, 0);
      
      const monthTxns = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      );
      
      const monthIncome = monthTxns
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const monthExpenses = Math.abs(monthTxns
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + parseFloat(t.amount), 0));
      
      monthlyTrend.push({
        month: i + 1,
        monthName: new Date(2026, i).toLocaleDateString('no-NO', { month: 'long' }),
        income: monthIncome,
        expenses: monthExpenses,
        profit: monthIncome - monthExpenses
      });
    }
    
    // Tax estimation
    const taxEstimate = calculateForskuddsskatt({
      income,
      expenses,
      isOslo: true  // Could be user preference
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          income,
          expenses,
          profit,
          margin: income > 0 ? (profit / income * 100) : 0,
          transactionCount: transactions.length
        },
        byCategory,
        monthlyTrend,
        tax: {
          estimatedAnnual: taxEstimate.totalAnnualTax,
          quarterlyPayment: taxEstimate.quarterlyPayment,
          effectiveRate: taxEstimate.tax.effectiveRate,
          nextPayment: taxEstimate.schedule.find(p => 
            new Date(p.date) > new Date()
          )
        }
      }
    });
  } catch (error) {
    console.error('Dashboard profit error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
});

/**
 * GET /api/dashboard/cashflow
 * Get cash flow position and forecast
 */
router.get('/cashflow', authMiddleware, async (req, res) => {
  try {
    const { months = 3 } = req.query;
    
    // Get recent transactions
    const now = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.userId,
        date: { gte: startDate }
      },
      orderBy: { date: 'asc' }
    });
    
    // Simple moving average forecast
    const monthlyData = {};
    transactions.forEach(t => {
      const key = `${t.date.getFullYear()}-${t.date.getMonth()}`;
      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expenses: 0 };
      }
      if (t.amount > 0) {
        monthlyData[key].income += parseFloat(t.amount);
      } else {
        monthlyData[key].expenses += Math.abs(parseFloat(t.amount));
      }
    });
    
    const avgMonthlyIncome = Object.values(monthlyData)
      .reduce((sum, m) => sum + m.income, 0) / Object.keys(monthlyData).length || 0;
    
    const avgMonthlyExpenses = Object.values(monthlyData)
      .reduce((sum, m) => sum + m.expenses, 0) / Object.keys(monthlyData).length || 0;
    
    res.json({
      success: true,
      data: {
        historical: monthlyData,
        forecast: {
          nextMonth: {
            income: avgMonthlyIncome,
            expenses: avgMonthlyExpenses,
            profit: avgMonthlyIncome - avgMonthlyExpenses
          },
          confidence: 'low',  // Could be improved with more data
          basedOnMonths: Object.keys(monthlyData).length
        }
      }
    });
  } catch (error) {
    console.error('Cashflow error:', error);
    res.status(500).json({ error: 'Failed to load cashflow' });
  }
});

module.exports = router;