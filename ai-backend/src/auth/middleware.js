const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required in production');
}

/**
 * Authentication middleware
 * Verifies JWT token from Authorization header
 */
function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'Please provide a valid JWT token in Authorization header'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Attach user to request
    req.userId = decoded.userId;
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Please login again'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Please provide a valid JWT token'
      });
    }
    
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      error: 'Authentication failed'
    });
  }
}

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '30d' }  // Token valid for 30 days
  );
}

/**
 * Optional auth - attach user if token present, but don't require it
 */
function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.userId;
      req.user = {
        id: decoded.userId,
        email: decoded.email
      };
    }
  } catch (error) {
    // Ignore errors, just don't attach user
  }
  
  next();
}

module.exports = {
  authMiddleware,
  optionalAuth,
  generateToken,
  JWT_SECRET
};