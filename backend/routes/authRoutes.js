// routes/authRoutes.js

const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
router.post('/register', authLimiter, registerUser);

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
router.post('/login', authLimiter, loginUser);

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
router.get('/me', requireAuth, getProfile);

module.exports = router;
