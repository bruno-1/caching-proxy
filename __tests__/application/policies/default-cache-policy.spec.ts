import { describe, it, expect } from 'vitest';
import { DefaultCachePolicy } from '../../../src/application/policies/default-cache-policy.js';

const makeSut = (ttl = 60) => {
  const policy = new DefaultCachePolicy({ defaultTTLSeconds: ttl });
  const rule = policy.for({ path: '/products' });

  return { policy, rule };
};

const makeResponse = (statusCode: number) => ({
  statusCode,
  headers: {},
  body: {},
});

describe('DefaultCachePolicy', () => {
  describe('ttlSeconds', () => {
    it('should return TTL defined in configuration', () => {
      const { rule } = makeSut(120);

      expect(rule.ttlSeconds).toBe(120);
    });
  });

  describe('skipIf', () => {
    it('should be defined', () => {
      const { rule } = makeSut();

      expect(rule.skipIf).toBeTypeOf('function');
    });

    describe('when response status is >= 500', () => {
      it('should skip cache', () => {
        const { rule } = makeSut();

        const shouldSkip = rule.skipIf!(makeResponse(500));

        expect(shouldSkip).toBe(true);
      });
    });

    describe('when response status is < 500', () => {
      it.each([200, 201, 204, 400, 404])(
        'should NOT skip cache for status %i',
        (status) => {
          const { rule } = makeSut();

          const shouldSkip = rule.skipIf!(makeResponse(status));

          expect(shouldSkip).toBe(false);
        },
      );
    });
  });
});
