import { beforeEach, describe, expect, it } from 'vitest';
import { createRedisClientMock } from '../../factories/create-redis-client-mock.js';
import { RedisCacheService } from '../../../../src/infra/cache/redis-cache-service.js';

describe('RedisCacheService', () => {
  let redisClientMock: ReturnType<typeof createRedisClientMock>;

  let sut: RedisCacheService;

  beforeEach(() => {
    redisClientMock = createRedisClientMock();

    sut = new RedisCacheService(redisClientMock as never);
  });

  describe('get', () => {
    it('returns parsed value when cache exists', async () => {
      redisClientMock.get.mockResolvedValue(JSON.stringify({ id: 1 }));

      const result = await sut.get('user:1');

      expect(redisClientMock.get).toHaveBeenCalledWith('user:1');

      expect(result).toEqual({ id: 1 });
    });

    it('returns null when cache does not exist', async () => {
      redisClientMock.get.mockResolvedValue(null);

      const result = await sut.get('missing');

      expect(result).toBeNull();
    });

    it('returns null when redis throws error', async () => {
      redisClientMock.get.mockRejectedValue(new Error('Redis failure'));

      const result = await sut.get('key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('stores cache without ttl', async () => {
      await sut.set('products', {
        items: [],
      });

      expect(redisClientMock.pipeline.set).toHaveBeenCalledWith(
        'products',
        JSON.stringify({ items: [] }),
      );

      expect(redisClientMock.pipeline.exec).toHaveBeenCalled();
    });

    it('stores cache with ttl', async () => {
      await sut.set(
        'products',
        {
          items: [],
        },
        {
          ttlSeconds: 60,
        },
      );

      expect(redisClientMock.pipeline.set).toHaveBeenCalledWith(
        'products',
        JSON.stringify({ items: [] }),
        {
          expiration: {
            type: 'EX',
            value: 60,
          },
        },
      );
    });

    it('associates cache key with tags', async () => {
      await sut.set(
        'product:1',
        {
          id: 1,
        },
        {
          tags: ['products'],
        },
      );

      expect(redisClientMock.pipeline.sAdd).toHaveBeenCalledWith(
        'tag:products',
        'product:1',
      );
    });

    it('adds expiration to tag when ttl exists', async () => {
      await sut.set(
        'product:1',
        {
          id: 1,
        },
        {
          ttlSeconds: 120,
          tags: ['products'],
        },
      );

      expect(redisClientMock.pipeline.expire).toHaveBeenCalledWith(
        'tag:products',
        120,
      );
    });

    it('does not cache when skipIf returns true', async () => {
      await sut.set(
        'key',
        {
          error: true,
        },
        {
          skipIf: () => true,
        },
      );

      expect(redisClientMock.multi).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('deletes cache key', async () => {
      await sut.delete('user:1');

      expect(redisClientMock.del).toHaveBeenCalledWith('user:1');
    });
  });

  describe('clear', () => {
    it('clears redis database', async () => {
      await sut.clear();

      expect(redisClientMock.flushDb).toHaveBeenCalled();
    });
  });

  describe('invalidateTag', () => {
    it('does nothing when tag has no keys', async () => {
      redisClientMock.sMembers.mockResolvedValue([]);

      await sut.invalidateTag('products');

      expect(redisClientMock.pipeline.del).not.toHaveBeenCalled();
    });

    it('invalidates all keys associated with tag', async () => {
      redisClientMock.sMembers.mockResolvedValue(['product:1', 'product:2']);

      await sut.invalidateTag('products');

      expect(redisClientMock.pipeline.del).toHaveBeenCalledWith([
        'product:1',
        'product:2',
      ]);

      expect(redisClientMock.pipeline.del).toHaveBeenCalledWith('tag:products');

      expect(redisClientMock.pipeline.exec).toHaveBeenCalled();
    });
  });
});
