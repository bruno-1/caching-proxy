import { describe, it, expect } from 'vitest';
import { DefaultCachePolicy } from '../../../src/application/policies/default-cache-policy.js';

describe('DefaultCachePolicy', () => {
  it('should return TTL from config', () => {
    const policy = new DefaultCachePolicy({ defaultTTLSeconds: 120 });

    const result = policy.for({ path: '/test' });

    expect(result.ttlSeconds).toBe(120);
  });

  it('should skip cache for server error responses (>= 500)', () => {
    const policy = new DefaultCachePolicy({ defaultTTLSeconds: 60 });

    const result = policy.for({ path: '/test' });

    const shouldSkip = result.skipIf?.({
      statusCode: 500,
      headers: {},
      body: {},
    });

    expect(shouldSkip).toBe(true);
  });

  it('should NOT skip cache for successful responses (< 500)', () => {
    const policy = new DefaultCachePolicy({ defaultTTLSeconds: 60 });

    const result = policy.for({ path: '/test' });

    const shouldSkip = result.skipIf?.({
      statusCode: 200,
      headers: {},
      body: {},
    });

    expect(shouldSkip).toBe(false);
  });

  it('should NOT skip cache for client error responses (< 500)', () => {
    const policy = new DefaultCachePolicy({ defaultTTLSeconds: 60 });

    const result = policy.for({ path: '/test' });

    const shouldSkip = result.skipIf?.({
      statusCode: 404,
      headers: {},
      body: {},
    });

    expect(shouldSkip).toBe(false);
  });
});
