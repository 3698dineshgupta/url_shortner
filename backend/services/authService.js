// services/authService.js
// JWT-based authentication — register, login, token refresh

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate JWT access token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * Register a new user
 */
const register = async ({ username, email, password }) => {
  // Check for existing email/username
  const existingUser = await User.unscoped().findOne({
    where: { email },
    attributes: ['id', 'email'],
  });

  if (existingUser) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = await User.create({ username, email, password });

  const token = generateToken(user);

  logger.info('User registered', { userId: user.id, email: user.email });

  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    token,
  };
};

/**
 * Login with email + password
 */
const login = async ({ email, password }) => {
  // Fetch user with password (excluded by default scope)
  const user = await User.scope('withPassword').findOne({ where: { email } });

  if (!user || !user.is_active) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Update last login timestamp
  await user.update({ last_login: new Date() });

  const token = generateToken(user);

  logger.info('User logged in', { userId: user.id });

  return {
    user: { id: user.id, username: user.username, email: user.email, role: user.role },
    token,
  };
};

/**
 * Verify and decode a JWT token
 */
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    const error = new Error(
      err.name === 'TokenExpiredError' ? 'Token has expired' : 'Invalid token'
    );
    error.statusCode = 401;
    throw error;
  }
};

module.exports = { register, login, verifyToken, generateToken };
