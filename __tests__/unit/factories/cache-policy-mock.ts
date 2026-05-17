import { vi } from 'vitest';
import { HttpRequest, HttpResponse } from '../../../src/application/ports/http';
import { CacheSetOptions } from '../../../src/application/ports/output/cache-set-options';

export function createCachePolicyMock() {
  return {
    resolve: vi.fn<(request: HttpRequest) => CacheSetOptions<HttpResponse>>(),
  };
}
