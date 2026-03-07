// tests/base62.test.js
// Unit tests for Base62 encoding utility

const { encode, decode, generateRandom, encodeId, CHARSET, BASE } = require('../utils/base62');

describe('Base62 Encoding', () => {
  describe('encode()', () => {
    it('should encode 0 to "0"', () => {
      expect(encode(0)).toBe('0');
    });

    it('should encode positive integers correctly', () => {
      expect(encode(1)).toBe('1');
      expect(encode(61)).toBe('Z');
      expect(encode(62)).toBe('10');
      expect(encode(3844)).toBe('100'); // 62^2
    });

    it('should produce only Base62 characters', () => {
      const encoded = encode(999999);
      const validChars = new RegExp(`^[${CHARSET}]+$`);
      expect(encoded).toMatch(validChars);
    });
  });

  describe('decode()', () => {
    it('should decode "0" to 0', () => {
      expect(decode('0')).toBe(0);
    });

    it('should be inverse of encode', () => {
      const values = [1, 62, 1000, 99999, 123456789];
      values.forEach((n) => {
        expect(decode(encode(n))).toBe(n);
      });
    });

    it('should throw on invalid characters', () => {
      expect(() => decode('!@#')).toThrow();
    });
  });

  describe('generateRandom()', () => {
    it('should generate a string of specified length', () => {
      expect(generateRandom(7)).toHaveLength(7);
      expect(generateRandom(10)).toHaveLength(10);
    });

    it('should generate unique strings', () => {
      const codes = new Set(Array.from({ length: 1000 }, () => generateRandom(7)));
      // With 62^7 possibilities, 1000 should all be unique
      expect(codes.size).toBe(1000);
    });

    it('should only contain valid Base62 characters', () => {
      const code = generateRandom(7);
      const validChars = new RegExp(`^[${CHARSET}]+$`);
      expect(code).toMatch(validChars);
    });
  });

  describe('encodeId()', () => {
    it('should pad short codes to minimum length', () => {
      expect(encodeId(1, 7)).toHaveLength(7);
    });

    it('should not truncate longer codes', () => {
      const largeId = 999999999999;
      const encoded = encodeId(largeId, 7);
      expect(encoded.length).toBeGreaterThanOrEqual(7);
    });
  });
});

// tests/urlValidator.test.js
const { validateUrl, validateCustomCode, normalizeUrl } = require('../utils/urlValidator');

describe('URL Validator', () => {
  describe('validateUrl()', () => {
    it('should accept valid HTTP URLs', () => {
      expect(validateUrl('https://google.com').valid).toBe(true);
      expect(validateUrl('http://example.com/path?q=1').valid).toBe(true);
    });

    it('should reject non-HTTP protocols', () => {
      expect(validateUrl('ftp://example.com').valid).toBe(false);
      expect(validateUrl('javascript:alert(1)').valid).toBe(false);
    });

    it('should reject internal IPs (SSRF protection)', () => {
      expect(validateUrl('http://localhost/admin').valid).toBe(false);
      expect(validateUrl('http://127.0.0.1').valid).toBe(false);
    });

    it('should reject URLs exceeding 2048 characters', () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2050);
      expect(validateUrl(longUrl).valid).toBe(false);
    });

    it('should reject empty/null values', () => {
      expect(validateUrl('').valid).toBe(false);
      expect(validateUrl(null).valid).toBe(false);
    });
  });

  describe('validateCustomCode()', () => {
    it('should accept valid codes', () => {
      expect(validateCustomCode('my-link').valid).toBe(true);
      expect(validateCustomCode('code_123').valid).toBe(true);
    });

    it('should reject codes shorter than 3 characters', () => {
      expect(validateCustomCode('ab').valid).toBe(false);
    });

    it('should reject reserved words', () => {
      expect(validateCustomCode('api').valid).toBe(false);
      expect(validateCustomCode('admin').valid).toBe(false);
    });

    it('should reject special characters', () => {
      expect(validateCustomCode('my link!').valid).toBe(false);
    });
  });

  describe('normalizeUrl()', () => {
    it('should add https:// to URLs without scheme', () => {
      expect(normalizeUrl('google.com')).toBe('https://google.com');
    });

    it('should not modify URLs with existing scheme', () => {
      expect(normalizeUrl('http://example.com')).toBe('http://example.com');
    });
  });
});
