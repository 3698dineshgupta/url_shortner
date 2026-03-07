// utils/urlValidator.js
// URL validation and sanitization utilities

const BLOCKED_DOMAINS = [
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '10.0.0.0/8',
  '172.16.0.0/12',
  '192.168.0.0/16',
];

const RESERVED_CODES = [
  'api', 'admin', 'login', 'register', 'dashboard',
  'health', 'docs', 'static', 'assets', 'public',
  'www', 'mail', 'ftp', 'smtp', 'imap',
  'features', 'resources', 'company', 'support', 'legal'
];

/**
 * Validate if a string is a proper URL
 * @param {string} url - URL to validate
 * @returns {{ valid: boolean, error?: string }}
 */
const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'URL is required' };
  }

  if (url.length > 2048) {
    return { valid: false, error: 'URL exceeds maximum length of 2048 characters' };
  }

  try {
    const parsed = new URL(url);

    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'Only HTTP and HTTPS URLs are allowed' };
    }

    // Block internal/private IPs (SSRF prevention)
    const hostname = parsed.hostname.toLowerCase();
    if (BLOCKED_DOMAINS.some(blocked => hostname.includes(blocked))) {
      return { valid: false, error: 'URL points to a restricted address' };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
};

/**
 * Validate a custom short code
 * @param {string} code - Custom code to validate
 * @returns {{ valid: boolean, error?: string }}
 */
const validateCustomCode = (code) => {
  if (!code) return { valid: false, error: 'Custom code is required' };

  if (code.length < 3 || code.length > 20) {
    return { valid: false, error: 'Custom code must be between 3 and 20 characters' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    return { valid: false, error: 'Custom code can only contain letters, numbers, hyphens, and underscores' };
  }

  if (RESERVED_CODES.includes(code.toLowerCase())) {
    return { valid: false, error: `"${code}" is a reserved keyword and cannot be used` };
  }

  return { valid: true };
};

/**
 * Normalize URL (add https:// if missing scheme)
 * @param {string} url
 * @returns {string} Normalized URL
 */
const normalizeUrl = (url) => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url.trim();
};

module.exports = { validateUrl, validateCustomCode, normalizeUrl, RESERVED_CODES };
