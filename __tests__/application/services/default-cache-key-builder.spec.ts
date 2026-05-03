import { describe, expect, it } from 'vitest';
import { DefaultCacheKeyBuilder } from '../../../src/application/services/default-cache-key-builder.js';

const makeSut = () => new DefaultCacheKeyBuilder();

describe('DefaultCacheKeyBuilder', () => {
  describe('path normalization', () => {
    it.each([
      ['/products', '/products'],
      ['/products/', '/products'],
      ['/', '/'],
    ])('normalizes path %s -> %s', (input, expected) => {
      const sut = makeSut();

      const result = sut.build({ path: input });

      expect(result).toBe(expected);
    });
  });

  describe('query handling', () => {
    it('returns only path when query is not provided', () => {
      const sut = makeSut();

      const result = sut.build({ path: '/products' });

      expect(result).toBe('/products');
    });

    it('returns only path when query is empty', () => {
      const sut = makeSut();

      const result = sut.build({
        path: '/products',
        query: {},
      });

      expect(result).toBe('/products');
    });

    it('sorts query params alphabetically', () => {
      const sut = makeSut();

      const result = sut.build({
        path: '/products',
        query: { b: '2', a: '1' },
      });

      expect(result).toBe('/products?a=1&b=2');
    });

    it('supports array values', () => {
      const sut = makeSut();

      const result = sut.build({
        path: '/search',
        query: { tag: ['ts', 'node'] },
      });

      expect(result).toBe('/search?tag=ts&tag=node');
    });

    it('ignores undefined values', () => {
      const sut = makeSut();

      const result = sut.build({
        path: '/search',
        query: {
          a: undefined,
          b: '1',
        },
      });

      expect(result).toBe('/search?b=1');
    });

    it('keeps empty string values', () => {
      const sut = makeSut();

      const result = sut.build({
        path: '/search',
        query: { q: '' },
      });

      expect(result).toBe('/search?q=');
    });
  });
});
