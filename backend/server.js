// server.js
// Entry point — configures Express app and starts the HTTP server

require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const fs = require('fs');
const path = require('path');

const { connectDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const requestLogger = require('./middleware/requestLogger');
const { apiLimiter, redirectLimiter } = require('./middleware/rateLimiter');
const { redirectUrl } = require('./controllers/urlController');
const logger = require('./utils/logger');

// Ensure logs directory exists
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// ============================
// Initialize App
// ============================
const app = express();
app.set('trust proxy', 1); // Trust reverse proxy for correctly resolving req.protocol and req.ip on Render
const PORT = parseInt(process.env.PORT) || 5000;

// ============================
// Security Middleware
// ============================
app.use(helmet({
  contentSecurityPolicy: false, // Allows redirect pages to load normally
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://url-shortner-r2k9.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ============================
// Performance Middleware
// ============================
app.use(compression()); // Gzip responses
app.use(express.json({ limit: '10kb' })); // Limit request body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================
// Logging
// ============================
app.use(requestLogger);

// Try to find the frontend dist directory robustly
// In Docker/Render, it might be in the parent dir, or the current working dir depending on run context
const possiblePaths = [
  path.join(__dirname, '../frontend/dist'),
  path.join(process.cwd(), '../frontend/dist'),
  path.join(__dirname, 'frontend/dist'),
  path.join(process.cwd(), 'frontend/dist')
];

let frontendPath = possiblePaths[0]; // fallback
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    frontendPath = p;
    console.log(`✅ Found frontend dist at: ${frontendPath}`);
    break;
  }
}

if (!fs.existsSync(frontendPath)) {
  console.warn(`⚠️ Could not locate frontend dist directory! App will return ENOENT for UI routes.`);
}

app.use(express.static(frontendPath));

// Health Check (no rate limit)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
  });
});

// ============================
// API Routes
// ============================
app.use('/api', apiLimiter);
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api', require('./routes/urlRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// ============================
// Short URL Redirect (root level)
// Must come AFTER /api routes
// ============================
app.get('/:shortCode([a-zA-Z0-9_-]{3,20})', redirectLimiter, redirectUrl);

// ============================
// SPA Fallback (React Router)
// ============================
app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendPath, 'index.html'));
});

// ============================
// Error Handling
// ============================
app.use(notFound);
app.use(errorHandler);

// ============================
// Bootstrap
// ============================
const start = async () => {
  try {
    await connectDB();
    await connectRedis();

    const server = app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // Graceful shutdown handlers
    const shutdown = async (signal) => {
      logger.info(`📥 ${signal} received. Shutting down gracefully...`);
      server.close(() => {
        logger.info('✅ HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

    // Unhandled promise rejection safety net
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled Rejection:', reason);
    });

  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
};

start();

module.exports = app; // Export for testing
