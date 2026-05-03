import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HandleHttpRequest } from '../../../src/application/use-cases/handle-http-request.use-case.js';
import { createCacheMock } from '../../factories/cache-mock.js';
import { createHttpClientMock } from '../../factories/http-client-mock.js';
import { createCacheKeyBuilderMock } from '../../factories/cache-key-builder-mock.js';
import { createCachePolicyMock } from '../../factories/cache-policy-mock.js';
import { CacheSetOptions } from '../../../src/application/ports/output/cache-set-options.js';

const PATH = '/products';
const CACHE_KEY = 'cache-key';

function makeSut() {
  const cache = createCacheMock();
  const httpClient = createHttpClientMock();
  const cacheKeyBuilder = createCacheKeyBuilderMock();
  const cachePolicy = createCachePolicyMock();

  const sut = new HandleHttpRequest(
    cache,
    httpClient,
    cacheKeyBuilder,
    cachePolicy,
  );

  return {
    sut,
    cache,
    httpClient,
    cacheKeyBuilder,
    cachePolicy,
  };
}

describe('HandleHttpRequest', () => {
  let ctx: ReturnType<typeof makeSut>;

  beforeEach(() => {
    ctx = makeSut();
  });

  const arrangeCacheMiss = () => {
    vi.mocked(ctx.cache.get).mockResolvedValue(null);
  };

  const arrangeCacheHit = () => {
    vi.mocked(ctx.cache.get).mockResolvedValue({
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: { cached: true },
    });
  };

  const arrangePolicy = (
    policy: Partial<{
      ttlSeconds: number;
      skipIf: () => boolean;
    }>,
  ) => {
    vi.mocked(ctx.cachePolicy.for).mockReturnValue(policy as never);
  };

  const arrangeHttpResponse = (response: {
    statusCode: number;
    headers: Record<string, string>;
    body: unknown;
  }) => {
    vi.mocked(ctx.httpClient.get).mockResolvedValue(response as never);
  };

  const act = () => ctx.sut.execute({ path: PATH });

  it('returns cached response when cache HIT', async () => {
    arrangeCacheHit();

    const result = await act();

    expect(ctx.cache.get).toHaveBeenCalledWith(CACHE_KEY);
    expect(ctx.httpClient.get).not.toHaveBeenCalled();

    expect(result.headers['X-Cache']).toBe('HIT');
    expect(result.body).toEqual({ cached: true });
  });

  it('fetches origin and stores in cache on MISS', async () => {
    arrangeCacheMiss();
    arrangePolicy({ ttlSeconds: 60 });

    arrangeHttpResponse({
      statusCode: 200,
      headers: {},
      body: { data: 'fresh' },
    });

    const result = await act();

    expect(ctx.httpClient.get).toHaveBeenCalledTimes(1);

    expect(ctx.cache.set).toHaveBeenCalledWith(
      CACHE_KEY,
      expect.any(Object),
      expect.objectContaining({ ttlSeconds: 60 } as CacheSetOptions<unknown>),
    );

    expect(result.headers['X-Cache']).toBe('MISS');
  });

  it('does not cache when skipIf returns true', async () => {
    arrangeCacheMiss();

    arrangePolicy({
      ttlSeconds: 60,
      skipIf: () => true,
    });

    arrangeHttpResponse({
      statusCode: 500,
      headers: {},
      body: { error: true },
    });

    await act();

    expect(ctx.cache.set).not.toHaveBeenCalled();
  });

  it('uses cacheKeyBuilder to generate cache key', async () => {
    arrangeCacheMiss();
    arrangePolicy({ ttlSeconds: 60 });

    arrangeHttpResponse({
      statusCode: 200,
      headers: {},
      body: {},
    });

    await act();

    expect(ctx.cacheKeyBuilder.build).toHaveBeenCalledWith({
      path: PATH,
    });
  });

  it('passes undefined options when policy is empty', async () => {
    arrangeCacheMiss();
    arrangePolicy({});

    arrangeHttpResponse({
      statusCode: 200,
      headers: {},
      body: {},
    });

    await act();

    expect(ctx.cache.set).toHaveBeenCalledWith(
      CACHE_KEY,
      expect.any(Object),
      undefined,
    );
  });

  it('caches response when skipIf is not defined', async () => {
    arrangeCacheMiss();
    arrangePolicy({ ttlSeconds: 60 });

    arrangeHttpResponse({
      statusCode: 200,
      headers: {},
      body: {},
    });

    await act();

    expect(ctx.cache.set).toHaveBeenCalled();
  });
});
