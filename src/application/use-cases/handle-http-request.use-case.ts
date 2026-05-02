import type { HttpRequest, HttpResponse } from '../ports/http.js';
import type { CacheKeyBuilder } from '../ports/output/cache-key-builder.js';
import type { Cache } from '../ports/output/cache.js';
import type { HttpClient } from '../ports/output/http-client.js';

export class HandleHttpRequest {
  constructor(
    private readonly cache: Cache,
    private readonly httpClient: HttpClient,
    private readonly cacheKeyBuilder: CacheKeyBuilder,
  ) {}

  async execute(request: HttpRequest): Promise<HttpResponse> {
    const key = this.cacheKeyBuilder.build(request);

    const cached = await this.cache.get<HttpResponse>(key);

    if (cached !== null)
      return {
        ...cached,
        headers: {
          ...cached.headers,
          'X-Cache': 'HIT',
        },
      };

    const response = await this.httpClient.get(request);

    const isSuccess = response.statusCode >= 200 && response.statusCode < 300;

    if (isSuccess) await this.cache.set(key, response);

    return {
      ...response,
      headers: {
        ...response.headers,
        'X-Cache': 'MISS',
      },
    };
  }
}
