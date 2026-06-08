// Vercel Serverless Function - Profit Dashboard
import Prisma from '@prisma/client';

const prisma = new Prisma.PrismaClient();

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // For demo: return mock data (real auth comes later)
    const { year = '2026', month } = req.query;
    
    // Mock data for alpha demo
    const mockData = {
      summary: {
        income: 450000,
        expenses: 120000,
        profit: 330000,
        margin: 73.3,
        transactionCount: 47
      },
      byCategory: {
        'Salgsinntekt': { income: 450000, expenses: 0 },
        'Datautstyr': { income: 0, expenses: 25000 },
        'Reise og diett': { income: 0, expenses: 15000 },
        'Kontorutstyr': { income: 0, expenses: 35000 },
        'Markedsføring': { income: 0, expenses: 20000 },
        'Forsikring': { income: 0, expenses: 12000 },
        'Abonnement': { income: 0, expenses: 13000 }
      },
      monthlyTrend: [
        { month: 1, monthName: 'Jan', income: 35000, expenses: 8000, profit: 27000 },
        { month: 2, monthName: 'Feb', income: 42000, expenses: 12000, profit: 30000 },
        { month: 3, monthName: 'Mar', income: 38000, expenses: 9000, profit: 29000 },
        { month: 4, monthName: 'Apr', income: 45000, expenses: 11000, profit: 34000 },
        { month: 5, monthName: 'Mai', income: 52000, expenses: 15000, profit: 37000 },
        { month: 6, monthName: 'Jun', income: 48000, expenses: 10000, profit: 38000 },
        { month: 7, monthName: 'Jul', income: 30000, expenses: 8000, profit: 22000 },
        { month: 8, monthName: 'Aug', income: 35000, expenses: 9000, profit: 26000 },
        { month: 9, monthName: 'Sep', income: 40000, expenses: 12000, profit: 28000 },
        { month: 10, monthName: 'Okt', income: 38000, expenses: 11000, profit: 27000 },
        { month: 11, monthName: 'Nov', income: 42000, expenses: 10000, profit: 32000 },
        { month: 12, monthName: 'Des', income: 5000, expenses: 5000, profit: 0 }
      ],
      tax: {
        estimatedAnnual: 154000,
        quarterlyPayment: 38500,
        effectiveRate: 34.2,
        nextPayment: {
          date: '2026-09-15',
          amount: 38500
        }
      }
    };
    
    res.status(200).json({
      success: true,
      data: mockData
    });
    
  } catch (error) {
    console.error('Dashboard API error:', error);
    res.status(500).json({ 
      error: 'Failed to load dashboard',
      message: error.message 
    });
  }
}