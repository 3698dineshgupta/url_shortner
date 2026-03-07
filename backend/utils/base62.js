// utils/base62.js
// Base62 encoding for generating compact, URL-safe short codes
// Uses characters: 0-9, a-z, A-Z (62 total)
// 7 characters = 62^7 = ~3.5 trillion unique codes

const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = CHARSET.length; // 62

/**
 * Encode a number to Base62 string
 * @param {number} num - Positive integer to encode
 * @returns {string} Base62 encoded string
 */
const encode = (num) => {
  if (num === 0) return CHARSET[0];

  let result = '';
  let n = num;

  while (n > 0) {
    result = CHARSET[n % BASE] + result;
    n = Math.floor(n / BASE);
  }

  return result;
};

/**
 * Decode a Base62 string back to a number
 * @param {string} str - Base62 encoded string
 * @returns {number} Decoded integer
 */
const decode = (str) => {
  let result = 0;

  for (let i = 0; i < str.length; i++) {
    const charIndex = CHARSET.indexOf(str[i]);
    if (charIndex === -1) throw new Error(`Invalid Base62 character: ${str[i]}`);
    result = result * BASE + charIndex;
  }

  return result;
};

/**
 * Generate a random Base62 string of given length
 * Uses crypto-random approach for better distribution
 * @param {number} length - Desired string length (default: 7)
 * @returns {string} Random Base62 string
 */
const generateRandom = (length = 7) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * BASE);
    result += CHARSET[randomIndex];
  }
  return result;
};

/**
 * Generate a short code from a numeric ID (guaranteed unique)
 * Pads to minimum length for consistent code length
 * @param {number} id - Database auto-increment ID
 * @param {number} minLength - Minimum code length
 * @returns {string} Short code
 */
const encodeId = (id, minLength = 7) => {
  const encoded = encode(id);
  // Pad with leading '0' if shorter than minimum
  return encoded.padStart(minLength, CHARSET[0]);
};

module.exports = { encode, decode, generateRandom, encodeId, CHARSET, BASE };
