import { vi } from 'vitest';

export function createRedisClientMock() {
  const pipeline = {
    set: vi.fn().mockReturnThis(),
    sAdd: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    del: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  };

  return {
    get: vi.fn(),
    del: vi.fn(),
    flushDb: vi.fn(),
    sMembers: vi.fn(),
    multi: vi.fn(() => pipeline),
    pipeline,
  };
}
