import { beforeEach, describe, expect, it } from 'vitest';
import { HandleHttpRequest } from '../../../src/application/use-cases/handle-http-request.use-case.js';
import { createCacheMock } from '../../factories/cache-mock.js';
import { createHttpClientMock } from '../../factories/http-client-mock.js';
import { createCacheKeyBuilderMock } from '../../factories/cache-key-builder-mock.js';

describe('HandleHttpRequest', () => {
  let cache: ReturnType<typeof createCacheMock>;
  let httpClient: ReturnType<typeof createHttpClientMock>;
  let cacheKeyBuilder: ReturnType<typeof createCacheKeyBuilderMock>;
  let useCase: HandleHttpRequest;

  beforeEach(() => {
    cache = createCacheMock();
    httpClient = createHttpClientMock();
    cacheKeyBuilder = createCacheKeyBuilderMock();

    useCase = new HandleHttpRequest(cache, httpClient, cacheKeyBuilder);
  });

  it('should return cached response when HIT', async () => {
    cache.get.mockResolvedValue({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: { cached: true },
    });

    const result = await useCase.execute({
      path: '/products',
    });

    expect(cache.get).toHaveBeenCalledWith('cache-key');
    expect(httpClient.get).not.toHaveBeenCalled();

    expect(result.headers['X-Cache']).toBe('HIT');
    expect(result.body).toEqual({ cached: true });
  });

  it('should fetch from origin and cache on MISS', async () => {
    cache.get.mockResolvedValue(null);

    httpClient.get.mockResolvedValue({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: 'fresh' },
    });

    const result = await useCase.execute({
      path: '/products',
    });

    expect(httpClient.get).toHaveBeenCalled();
    expect(cache.set).toHaveBeenCalledWith('cache-key', expect.any(Object));

    expect(result.headers['X-Cache']).toBe('MISS');
  });

  it('should NOT cache failed responses', async () => {
    cache.get.mockResolvedValue(null);

    httpClient.get.mockResolvedValue({
      statusCode: 500,
      headers: {},
      body: { error: true },
    });

    await useCase.execute({
      path: '/products',
    });

    expect(cache.set).not.toHaveBeenCalled();
  });

  it('should use cacheKeyBuilder to generate key', async () => {
    cache.get.mockResolvedValue(null);

    httpClient.get.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: {},
    });

    await useCase.execute({
      path: '/products',
    });

    expect(cacheKeyBuilder.build).toHaveBeenCalledWith({
      path: '/products',
    });
  });
});
