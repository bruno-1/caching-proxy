import { createClient } from 'redis';
import { env } from '../../config/env.js';

export async function makeRedisClient() {
  const { REDIS_URL: url } = env;

  const redisClient = createClient({
    url,
    socket: {
      reconnectStrategy(retries) {
        return Math.min(retries * 50, 500);
      },
    },
  });

  redisClient.on('error', (error) => {
    console.error('Redis error:', error);
  });

  await redisClient.connect();

  return redisClient;
}
