// middleware/auth.js
// JWT authentication middleware — protects private routes

const { verifyToken } = require('../services/authService');
const { User } = require('../models');
const logger = require('../utils/logger');

/**
 * Require authentication — returns 401 if no valid token
 */
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Provide a Bearer token.',
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // Attach user info to request
    req.user = decoded;

    next();
  } catch (err) {
    return res.status(err.statusCode || 401).json({
      success: false,
      error: err.message,
    });
  }
};

/**
 * Optional authentication — attaches user if token is provided, continues without if not
 * Used for endpoints that work for both guests and authenticated users
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch {
    // Invalid token — continue as guest
    req.user = null;
  }

  next();
};

/**
 * Require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  next();
};

module.exports = { requireAuth, optionalAuth, requireAdmin };
