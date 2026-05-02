import { describe, expect, it } from 'vitest';
import { DefaultCacheKeyBuilder } from '../../../src/application/services/default-cache-key-builder.js';

describe('DefaultCacheKeyBuilder', () => {
  const builder = new DefaultCacheKeyBuilder();

  it('should return path when no query is provided', () => {
    const result = builder.build({
      path: '/products',
    });

    expect(result).toBe('/products');
  });

  it('should normalize trailing slash in path', () => {
    const result = builder.build({
      path: '/products/',
    });

    expect(result).toBe('/products');
  });

  it('should build sorted query string', () => {
    const result = builder.build({
      path: '/products',
      query: {
        b: '2',
        a: '1',
      },
    });

    expect(result).toBe('/products?a=1&b=2');
  });

  it('should handle array query values', () => {
    const result = builder.build({
      path: '/search',
      query: {
        tag: ['ts', 'node'],
      },
    });

    expect(result).toBe('/search?tag=ts&tag=node');
  });

  it('should ignore undefined values', () => {
    const result = builder.build({
      path: '/search',
      query: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        a: undefined as any,
        b: '1',
      },
    });

    expect(result).toBe('/search?b=1');
  });
});
