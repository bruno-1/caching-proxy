import type { Cache } from '../../application/ports/output/cache.js';
import { HandleHttpRequestUseCase } from '../../application/use-cases/handle-http-request.use-case.js';
import { makeCacheKeyBuilder } from './make-cache-key-builder.js';
import { makeCachePolicy } from './make-cache-policy.js';
import { makeHttpClient } from './make-http-client.js';

export function makeHandleHttpRequestUseCase(cache: Cache, origin: string) {
  const httpClient = makeHttpClient(origin);
  const cacheKeyBuilder = makeCacheKeyBuilder();
  const cachePolicy = makeCachePolicy();

  return new HandleHttpRequestUseCase(
    cache,
    httpClient,
    cacheKeyBuilder,
    cachePolicy,
  );
}
