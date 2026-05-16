import { vi } from 'vitest';

export function createCacheKeyBuilderMock() {
  return {
    build: vi.fn().mockReturnValue('cache-key'),
  };
}
