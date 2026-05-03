import type { CacheConfig } from '../config/cache-config.js';
import type { HttpRequest, HttpResponse } from '../ports/http.js';
import type { CacheSetOptions } from '../ports/output/cache-set-options.js';
import type { CachePolicy } from './cache-policy.js';

export class DefaultCachePolicy implements CachePolicy<HttpResponse> {
  constructor(private readonly config: CacheConfig) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for(_request: HttpRequest): CacheSetOptions<HttpResponse> {
    const ttlSeconds = this.config.defaultTTLSeconds;

    return {
      ttlSeconds,
      skipIf: (response: HttpResponse) => this.isServerError(response),
    };
  }

  private isServerError(response: HttpResponse): boolean {
    return response.statusCode >= 500;
  }
}
