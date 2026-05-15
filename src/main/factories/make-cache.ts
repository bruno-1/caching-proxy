import { RedisCacheService } from '../../infra/cache/redis-cache-service.js';
import { makeRedisClient } from '../../infra/cache/redis-client.js';

export async function makeCache() {
  const redisClient = await makeRedisClient();

  return {
    redisClient,
    cache: new RedisCacheService(redisClient),
  };
}
