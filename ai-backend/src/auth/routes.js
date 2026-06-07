const express = require('express');
const bcrypt = require('bcrypt');
const { z } = require('zod');
const prisma = require('../db/prisma');
const { generateToken } = require('./middleware');

const router = express.Router();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  enkNumber: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

/**
 * POST /api/auth/register
 * Create new user account
 */
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { email, password, name, enkNumber } = registerSchema.parse(req.body);
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email already exists'
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        enkNumber
      }
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        enkNumber: user.enkNumber
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Register error:', error);
    res.status(500).json({
      error: 'Registration failed'
    });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user
 */
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { email, password } = loginSchema.parse(req.body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }
    
    // Generate token
    const token = generateToken(user);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        enkNumber: user.enkNumber
      },
      token
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      });
    }
    
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed'
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        enkNumber: true,
        createdAt: true,
        _count: {
          select: {
            transactions: true,
            receipts: true
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      error: 'Failed to get profile'
    });
  }
});

module.exports = router;