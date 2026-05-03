import { compactObject } from '../../shared/utils/compact-object.js';
import type { CachePolicy } from '../policies/cache-policy.js';
import type { HttpRequest, HttpResponse } from '../ports/http.js';
import type { CacheKeyBuilder } from '../ports/output/cache-key-builder.js';
import type { Cache } from '../ports/output/cache.js';
import type { HttpClient } from '../ports/output/http-client.js';

export class HandleHttpRequest {
  constructor(
    private readonly cache: Cache,
    private readonly httpClient: HttpClient,
    private readonly cacheKeyBuilder: CacheKeyBuilder,
    private readonly cachePolicy: CachePolicy<HttpResponse>,
  ) {}

  async execute(request: HttpRequest): Promise<HttpResponse> {
    const key = this.cacheKeyBuilder.build(request);

    const cached = await this.cache.get<HttpResponse>(key);

    if (cached !== null)
      return {
        ...cached,
        headers: {
          ...(cached.headers ?? {}),
          'X-Cache': 'HIT',
        },
      };

    const response = await this.httpClient.get(request);

    const policy = this.cachePolicy.for(request);
    if (policy.skipIf?.(response))
      return {
        ...response,
        headers: {
          ...(response.headers ?? {}),
          'X-Cache': 'MISS',
        },
      };

    const cacheOptions = compactObject({
      ttlSeconds: policy.ttlSeconds,
      tags: policy.tags,
    });
    const finalOptions =
      Object.keys(cacheOptions).length > 0 ? cacheOptions : undefined;

    await this.cache.set(key, response, finalOptions);

    return {
      ...response,
      headers: {
        ...(response.headers ?? {}),
        'X-Cache': 'MISS',
      },
    };
  }
}
