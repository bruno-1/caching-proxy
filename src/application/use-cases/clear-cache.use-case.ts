import type { Cache } from '../ports/output/cache.js';

export class ClearCacheUseCase {
  constructor(private readonly cache: Cache) {}

  async execute(): Promise<void> {
    await this.cache.clear();
  }
}
