import { beforeEach, describe, expect, it, vi } from 'vitest';

const connect = vi.fn();
const on = vi.fn();

vi.mock('redis', () => {
  return {
    createClient: vi.fn(() => ({
      connect,
      on,
    })),
  };
});

vi.mock('../../../src/config/env.js', () => {
  return {
    env: {
      REDIS_URL: 'redis://localhost:6379',
      CACHE_DEFAULT_TTL: 60,
    },
  };
});

describe('makeRedisClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates redis client with correct url', async () => {
    const { createClient } = await import('redis');

    const { makeRedisClient } =
      await import('../../../src/infra/cache/redis-client.js');

    await makeRedisClient();

    expect(createClient).toHaveBeenCalledWith({
      url: 'redis://localhost:6379',
      socket: {
        reconnectStrategy: expect.any(Function),
      },
    });
  });

  it('uses reconnect strategy with max delay of 500ms', async () => {
    const { createClient } = await import('redis');

    const { makeRedisClient } =
      await import('../../../src/infra/cache/redis-client.js');

    await makeRedisClient();

    const createClientArgs = vi.mocked(createClient).mock.calls[0][0];

    const reconnectStrategy = createClientArgs?.socket?.reconnectStrategy;

    if (typeof reconnectStrategy !== 'function') {
      throw new Error('reconnectStrategy should be a function');
    }

    expect(reconnectStrategy(1, new Error())).toBe(50);

    expect(reconnectStrategy(5, new Error())).toBe(250);

    expect(reconnectStrategy(20, new Error())).toBe(500);
  });

  it('registers redis error listener', async () => {
    const { makeRedisClient } =
      await import('../../../src/infra/cache/redis-client.js');

    await makeRedisClient();

    expect(on).toHaveBeenCalledWith('error', expect.any(Function));
  });

  it('connects redis client', async () => {
    const { makeRedisClient } =
      await import('../../../src/infra/cache/redis-client.js');

    await makeRedisClient();

    expect(connect).toHaveBeenCalled();
  });

  it('logs redis errors', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { makeRedisClient } =
      await import('../../../src/infra/cache/redis-client.js');

    await makeRedisClient();

    const errorHandler = on.mock.calls.find(
      ([event]) => event === 'error',
    )?.[1];

    const error = new Error('Redis failed');

    errorHandler(error);

    expect(consoleSpy).toHaveBeenCalledWith('Redis error:', error);

    consoleSpy.mockRestore();
  });

  it('connects redis client', async () => {
    const { makeRedisClient } =
      await import('../../../src/infra/cache/redis-client.js');

    await makeRedisClient();

    expect(connect).toHaveBeenCalled();
  });
});
