import type { HttpRequest } from '../ports/http.js';
import type { CacheKeyBuilder } from '../ports/output/cache-key-builder.js';

export class DefaultCacheKeyBuilder implements CacheKeyBuilder {
  build(request: HttpRequest): string {
    const path = this.normalizePath(request.path);

    if (!request?.query || !(Object.keys(request?.query).length > 0)) return path;

    const normalized = this.normalizeQuery(request?.query);
    const query = new URLSearchParams(normalized).toString();

    return `${path}?${query}`;
  }

  private normalizePath(path: string): string {
    return path.replace(/\/$/, '') || '/';
  }

  private normalizeQuery(
    query: Record<string, string | string[] | undefined>,
  ): [string, string][] {
    return Object.entries(query)
      .reduce<[string, string][]>((acc, [key, value]) => {
        if (value === undefined) return acc;

        if (Array.isArray(value)) {
          value.forEach((v) => acc.push([key, v]));
        } else {
          acc.push([key, value]);
        }

        return acc;
      }, [])
      .sort(([a], [b]) => (a < b ? -1 : 1));
  }
}
