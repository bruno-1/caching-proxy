import { beforeEach, describe, expect, it } from 'vitest';
import { HandleHttpRequest } from '../../../src/application/use-cases/handle-http-request.use-case.js';
import { createCacheMock } from '../../factories/cache-mock.js';
import { createHttpClientMock } from '../../factories/http-client-mock.js';
import { createCacheKeyBuilderMock } from '../../factories/cache-key-builder-mock.js';
import { createCachePolicyMock } from '../../factories/cache-policy-mock.js';

describe('HandleHttpRequest', () => {
  let cache: ReturnType<typeof createCacheMock>;
  let httpClient: ReturnType<typeof createHttpClientMock>;
  let cacheKeyBuilder: ReturnType<typeof createCacheKeyBuilderMock>;
  let cachePolicy: ReturnType<typeof createCachePolicyMock>;
  let useCase: HandleHttpRequest;

  beforeEach(() => {
    cache = createCacheMock();
    httpClient = createHttpClientMock();
    cacheKeyBuilder = createCacheKeyBuilderMock();
    cachePolicy = createCachePolicyMock();

    useCase = new HandleHttpRequest(
      cache,
      httpClient,
      cacheKeyBuilder,
      cachePolicy,
    );
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

    cachePolicy.for.mockReturnValue({
      ttlSeconds: 60,
    });

    httpClient.get.mockResolvedValue({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: { data: 'fresh' },
    });

    const result = await useCase.execute({
      path: '/products',
    });

    expect(httpClient.get).toHaveBeenCalled();

    expect(cache.set).toHaveBeenCalledWith(
      'cache-key',
      expect.any(Object),
      expect.objectContaining({ ttlSeconds: 60 }),
    );

    expect(result.headers['X-Cache']).toBe('MISS');
  });

  it('should NOT cache when skipIf returns true', async () => {
    cache.get.mockResolvedValue(null);

    cachePolicy.for.mockReturnValue({
      ttlSeconds: 60,
      skipIf: () => true,
    });

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

    cachePolicy.for.mockReturnValue({
      ttlSeconds: 60,
    });

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

  it('should not pass cache options when empty', async () => {
    cache.get.mockResolvedValue(null);

    cachePolicy.for.mockReturnValue({});

    httpClient.get.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: {},
    });

    await useCase.execute({ path: '/products' });

    expect(cache.set).toHaveBeenCalledWith(
      'cache-key',
      expect.any(Object),
      undefined,
    );
  });

  it('should cache when skipIf is not defined', async () => {
    cache.get.mockResolvedValue(null);

    cachePolicy.for.mockReturnValue({
      ttlSeconds: 60,
    });

    httpClient.get.mockResolvedValue({
      statusCode: 200,
      headers: {},
      body: {},
    });

    await useCase.execute({ path: '/products' });

    expect(cache.set).toHaveBeenCalled();
  });
});
