import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { createClient, RedisClientType } from 'redis';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';
import request from 'supertest';
import { startRedisContainer } from './helpers/start-redis-container.js';
import { createOriginServer } from './helpers/create-origin-server.js';
import { RedisCacheService } from '../../src/infra/cache/redis-cache-service.js';
import { FetchHttpClient } from '../../src/infra/http/fetch-http-client.js';
import { DefaultCacheKeyBuilder } from '../../src/application/services/default-cache-key-builder.js';
import { DefaultCachePolicy } from '../../src/application/policies/default-cache-policy.js';
import { HandleHttpRequestUseCase } from '../../src/application/use-cases/handle-http-request.use-case.js';

describe('Caching Proxy Integration', () => {
  let redisContainer: Awaited<
    ReturnType<typeof startRedisContainer>
  >['container'];
  let redisClient: RedisClientType;
  let proxyApp: ReturnType<typeof Fastify>;
  let originServer: Awaited<ReturnType<typeof createOriginServer>>;

  beforeAll(async () => {
    const redis = await startRedisContainer();
    redisContainer = redis.container;

    redisClient = createClient({ url: redis.redisUrl });

    await redisClient.connect();

    originServer = await createOriginServer();

    const cache = new RedisCacheService(redisClient);
    const httpClient = new FetchHttpClient(originServer.originUrl);
    const cacheKeyBuilder = new DefaultCacheKeyBuilder();
    const cachePolicy = new DefaultCachePolicy({ defaultTTLSeconds: 60 });
    const useCase = new HandleHttpRequestUseCase(
      cache,
      httpClient,
      cacheKeyBuilder,
      cachePolicy,
    );

    proxyApp = Fastify();

    proxyApp.get('/*', async (req: FastifyRequest, reply: FastifyReply) => {
      const response = await useCase.execute({
        path: req.url.split('?')[0] ?? '/',
        query: req.query as Record<string, string | string[]>,
      });
      reply.status(response.statusCode);

      Object.entries(response.headers).forEach(([key, value]) => {
        reply.header(key, value);
      });

      return response.body;
    });

    await proxyApp.ready();
  });

  beforeEach(async () => {
    await redisClient.flushDb();
    originServer.resetRequestsCount();
  });

  afterAll(async () => {
    await proxyApp.close();
    await originServer.app.close();
    await redisClient.quit();
    await redisContainer.stop();
  });

  it('should return MISS on first request', async () => {
    const response = await request(proxyApp.server)
      .get('/products')
      .expect(200);

    expect(response.headers['x-cache']).toBe('MISS');
    expect(response.body).toEqual({
      products: [
        {
          id: 1,
          title: 'iPhone 15',
        },
      ],
    });

    expect(originServer.getRequestsCount()).toBe(1);
  });

  it('should return HIT on second request', async () => {
    await request(proxyApp.server).get('/products');

    const response = await request(proxyApp.server)
      .get('/products')
      .expect(200);

    expect(response.headers['x-cache']).toBe('HIT');
    expect(originServer.getRequestsCount()).toBe(1);
  });

  it('should persist response in redis', async () => {
    await request(proxyApp.server).get('/products');

    const cached = await redisClient.get('/products');

    expect(cached).not.toBeNull();
    expect(JSON.parse(cached!)).toMatchObject({ statusCode: 200 });
  });

  it('should normalize query params into same cache key', async () => {
    await request(proxyApp.server).get('/products?b=2&a=1');

    const response = await request(proxyApp.server)
      .get('/products?a=1&b=2')
      .expect(200);

    expect(response.headers['x-cache']).toBe('HIT');
  });

  it('should not cache responses with status >= 500', async () => {
    const firstResponse = await request(proxyApp.server)
      .get('/error')
      .expect(500);
    const secondResponse = await request(proxyApp.server)
      .get('/error')
      .expect(500);

    expect(firstResponse.headers['x-cache']).toBe('MISS');
    expect(secondResponse.headers['x-cache']).toBe('MISS');
    expect(originServer.getRequestsCount()).toBe(2);

    const cached = await redisClient.get('/error');
    expect(cached).toBeNull();
  });
});
