// middleware/requestLogger.js
// HTTP request/response logging with Morgan + Winston integration

const morgan = require('morgan');
const logger = require('../utils/logger');

// Create a write stream that pipes Morgan output to Winston
const stream = {
  write: (message) => logger.http(message.trim()),
};

// Skip logging in test environment
const skip = () => process.env.NODE_ENV === 'test';

// Custom Morgan token: log authenticated user ID
morgan.token('user-id', (req) => req.user?.id || 'guest');

// Custom Morgan token: log response body size in KB
morgan.token('body-size', (req, res) => {
  const size = res.getHeader('content-length');
  return size ? `${(size / 1024).toFixed(2)}kb` : '-';
});

const requestLogger = morgan(
  ':method :url :status :res[content-length] - :response-time ms | user::user-id | :remote-addr',
  { stream, skip }
);

module.exports = requestLogger;
