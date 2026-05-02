import type { HttpRequest } from '../http.js';

export interface CacheKeyBuilder {
  build(request: HttpRequest): string;
}
