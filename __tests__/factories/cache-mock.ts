import { vi } from 'vitest';

export function createCacheMock() {
  return {
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
  };
}
