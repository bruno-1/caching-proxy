import type { Cache } from '../../application/ports/output/cache.js';
import { DefaultCacheKeyBuilder } from '../../application/services/default-cache-key-builder.js';
import { HandleHttpRequestUseCase } from '../../application/use-cases/handle-http-request.use-case.js';
import { FetchHttpClient } from '../../infra/http/fetch-http-client.js';
import { makeCachePolicy } from './make-cache-policy.js';

export function makeHandleHttpRequestUseCase(cache: Cache, origin: string) {
  const httpClient = new FetchHttpClient(origin);
  const cacheKeyBuilder = new DefaultCacheKeyBuilder();
  const cachePolicy = makeCachePolicy();

  return new HandleHttpRequestUseCase(
    cache,
    httpClient,
    cacheKeyBuilder,
    cachePolicy,
  );
}
