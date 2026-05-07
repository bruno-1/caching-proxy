import type { RedisClientType } from 'redis';
import type { Cache } from '../../application/ports/output/cache.js';
import type { CacheSetOptions } from '../../application/ports/output/cache-set-options.js';

export class RedisCacheService implements Cache {
  constructor(private readonly redisClient: RedisClientType) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.redisClient.get(key);

      if (!value) return null;

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheSetOptions<T>,
  ): Promise<void> {
    if (options?.skipIf?.(value)) return;

    const serializedValue = JSON.stringify(value);

    const pipeline = this.redisClient.multi();

    if (options?.ttlSeconds) {
      pipeline.set(key, serializedValue, {
        expiration: {
          type: 'EX',
          value: options.ttlSeconds,
        },
      });
    } else {
      pipeline.set(key, serializedValue);
    }

    const tags = options?.tags ?? [];

    for (const tag of tags) {
      const tagKey = `tag:${tag}`;

      pipeline.sAdd(tagKey, key);

      if (options?.ttlSeconds) pipeline.expire(tagKey, options.ttlSeconds);
    }

    await pipeline.exec();
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async clear(): Promise<void> {
    await this.redisClient.flushDb();
  }

  async invalidateTag(tag: string): Promise<void> {
    const tagKey = `tag:${tag}`;
    const keys = await this.redisClient.sMembers(tagKey);

    if (keys.length === 0) return;

    const pipeline = this.redisClient.multi();

    pipeline.del(keys);
    pipeline.del(tagKey);

    await pipeline.exec();
  }
}
