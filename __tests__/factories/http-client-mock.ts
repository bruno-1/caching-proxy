import { vi } from 'vitest';

export function createHttpClientMock() {
  return {
    get: vi.fn(),
  };
}
