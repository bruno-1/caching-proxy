import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createClient, RedisClientType } from 'redis';
import { startRedisContainer } from './helpers/start-redis-container.js';
import { RedisCacheService } from '../../src/infra/cache/redis-cache-service.js';
import { ClearCacheUseCase } from '../../src/application/use-cases/clear-cache.use-case.js';

describe('ClearCache Integration', () => {
  let redisContainer: Awaited<
    ReturnType<typeof startRedisContainer>
  >['container'];
  let redisClient: RedisClientType;

  beforeAll(async () => {
    const redis = await startRedisContainer();

    redisContainer = redis.container;
    redisClient = createClient({ url: redis.redisUrl });

    await redisClient.connect();
  });

  afterAll(async () => {
    await redisClient.quit();
    await redisContainer.stop();
  });

  it('should clear all redis cache', async () => {
    await redisClient.set('products', JSON.stringify({ ok: true }));

    const cache = new RedisCacheService(redisClient);
    const useCase = new ClearCacheUseCase(cache);

    await useCase.execute();

    const value = await redisClient.get('products');

    expect(value).toBe(null);
  });
});
