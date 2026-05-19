import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';
import { createClient, RedisClientType } from 'redis';
import {
  createOriginServer,
  type OriginServer,
} from './helpers/create-origin-server.js';
import { RedisCacheService } from '../../src/infra/cache/redis-cache-service.js';
import { FetchHttpClient } from '../../src/infra/http/fetch-http-client.js';
import { DefaultCacheKeyBuilder } from '../../src/application/services/default-cache-key-builder.js';
import { DefaultCachePolicy } from '../../src/application/policies/default-cache-policy.js';
import { HandleHttpRequestUseCase } from '../../src/application/use-cases/handle-http-request.use-case.js';
import { FastifyCachingProxyServer } from '../../src/infra/http/fastify-caching-proxy-server.js';
import { GenericContainer, StartedTestContainer } from 'testcontainers';

describe('Caching Proxy Server (E2E)', () => {
  let redisContainer: StartedTestContainer;
  let redisClient: RedisClientType;
  let proxyApp: FastifyInstance;
  let proxyPort: number;
  let originServer: OriginServer;
  let proxyBaseUrl: string;

  beforeAll(async () => {
    redisContainer = await new GenericContainer('redis:8.6.3-alpine')
      .withExposedPorts(6379)
      .start();
    originServer = await createOriginServer();

    redisClient = createClient({
      url: `redis://${redisContainer.getHost()}:${redisContainer.getMappedPort(6379)}`,
    });

    await redisClient.connect();

    const cache = new RedisCacheService(redisClient);
    const httpClient = new FetchHttpClient(
      `http://localhost:${originServer.port}`,
    );
    const cacheKeyBuilder = new DefaultCacheKeyBuilder();
    const cachePolicy = new DefaultCachePolicy({ defaultTTLSeconds: 60 });
    const handleHttpRequestUseCase = new HandleHttpRequestUseCase(
      cache,
      httpClient,
      cacheKeyBuilder,
      cachePolicy,
    );

    proxyApp = Fastify();

    const server = new FastifyCachingProxyServer(
      proxyApp,
      handleHttpRequestUseCase,
    );

    await server.start(0);

    const address = proxyApp.server.address();
    if (!address || typeof address === 'string')
      throw new Error('Failed to resolve origin server address');

    proxyPort = address.port;

    proxyBaseUrl = `http://localhost:${proxyPort}`;
  });

  beforeEach(async () => {
    await redisClient.flushDb();
  });

  afterAll(async () => {
    await proxyApp.close();
    await originServer.app.close();
    await redisClient.quit();
    await redisContainer.stop();
  });

  describe('cache behavior', () => {
    it('should return MISS on first request', async () => {
      const response = await fetch(`${proxyBaseUrl}/products`);

      expect(response.status).toBe(200);
      expect(response.headers.get('x-cache')).toBe('MISS');
      expect(response.headers.get('content-type')).toContain(
        'application/json',
      );

      const body = await response.json();
      expect(body).toEqual({ products: [{ id: 1 }] });
    });

    it('should return HIT on second request', async () => {
      await fetch(`${proxyBaseUrl}/products`);
      const response = await fetch(`${proxyBaseUrl}/products`);

      expect(response.status).toBe(200);
      expect(response.headers.get('x-cache')).toBe('HIT');
      expect(response.headers.get('content-type')).toContain(
        'application/json',
      );

      const body = await response.json();
      expect(body).toEqual({ products: [{ id: 1 }] });
    });

    it('should cache requests with query params independently', async () => {
      const firstResponse = await fetch(`${proxyBaseUrl}/products?limit=1`);
      expect(firstResponse.headers.get('x-cache')).toBe('MISS');

      const secondResponse = await fetch(`${proxyBaseUrl}/products?limit=1`);
      expect(secondResponse.headers.get('x-cache')).toBe('HIT');
    });

    it('should not share cache between different query params', async () => {
      await fetch(`${proxyBaseUrl}/products?limit=1`);

      const response = await fetch(`${proxyBaseUrl}/products?limit=2`);
      expect(response.headers.get('x-cache')).toBe('MISS');
    });

    it('should normalize query params before caching', async () => {
      await fetch(`${proxyBaseUrl}/products?b=2&a=1`);

      const response = await fetch(`${proxyBaseUrl}/products?a=1&b=2`);
      expect(response.headers.get('x-cache')).toBe('HIT');
    });

    it('should not cache 5xx responses', async () => {
      const firstResponse = await fetch(`${proxyBaseUrl}/error`);

      expect(firstResponse.status).toBe(500);
      expect(firstResponse.headers.get('x-cache')).toBe('MISS');

      const secondResponse = await fetch(`${proxyBaseUrl}/error`);

      expect(secondResponse.status).toBe(500);
      expect(secondResponse.headers.get('x-cache')).toBe('MISS');
    });

    it('should preserve text responses', async () => {
      const response = await fetch(`${proxyBaseUrl}/plain-text`);

      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toContain('text/plain');
      expect(response.headers.get('x-cache')).toBe('MISS');

      const body = await response.text();
      expect(body).toBe('plain response');
    });

    it('should cache text responses', async () => {
      await fetch(`http://localhost:${proxyPort}/plain-text`);

      const response = await fetch(`http://localhost:${proxyPort}/plain-text`);
      expect(response.headers.get('x-cache')).toBe('HIT');

      const body = await response.text();
      expect(body).toBe('plain response');
    });
  });
});
