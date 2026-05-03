import type { HttpRequest } from '../ports/http.js';
import type { CacheSetOptions } from '../ports/output/cache-set-options.js';

export interface CachePolicy<T> {
  for(request: HttpRequest): CacheSetOptions<T>;
}
