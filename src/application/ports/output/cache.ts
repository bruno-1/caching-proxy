import type { CacheSetOptions } from './cache-set-options.js';

export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheSetOptions<T>): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}
