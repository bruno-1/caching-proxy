import { describe, expect, it } from 'vitest';
import { InvalidArgumentError } from 'commander';
import { parsePort, parseUrl } from '../../../../src/main/cli/parsers.js';

describe('CLI parsers', () => {
  describe('parsePort', () => {
    it('should parse a valid port', () => {
      expect(parsePort('3000')).toBe(3000);
    });

    it('should parse minimun valid port', () => {
      expect(parsePort('1')).toBe(1);
    });

    it('should parse maximum valid port', () => {
      expect(parsePort('65535')).toBe(65535);
    });

    it('should throw for non-numeric value', () => {
      expect(() => parsePort('abc')).toThrow(InvalidArgumentError);
    });

    it('should throw for decimal number', () => {
      expect(() => parsePort('3000.5')).toThrow(InvalidArgumentError);
    });

    it('should throw for negative number', () => {
      expect(() => parsePort('-1')).toThrow(InvalidArgumentError);
    });

    it('should throw for zero', () => {
      expect(() => parsePort('0')).toThrow(InvalidArgumentError);
    });

    it('should throw for port above range', () => {
      expect(() => parsePort('65536')).toThrow(InvalidArgumentError);
    });

    it('should throw for empty string', () => {
      expect(() => parsePort('')).toThrow(InvalidArgumentError);
    });
  });

  describe('parseUrl', () => {
    it('should accept valid HTTP URL', () => {
      expect(parseUrl('http://example.com')).toBe('http://example.com');
    });

    it('should accept valid HTTPS URL', () => {
      expect(parseUrl('https://example.com')).toBe('https://example.com');
    });

    it('should accept URL with path', () => {
      expect(parseUrl('https://example.com/products')).toBe(
        'https://example.com/products',
      );
    });

    it('should throw for invalid URL', () => {
      expect(() => parseUrl('invalid-url')).toThrow(InvalidArgumentError);
    });

    it('should throw for empty string', () => {
      expect(() => parseUrl('')).toThrow(InvalidArgumentError);
    });
  });
});
