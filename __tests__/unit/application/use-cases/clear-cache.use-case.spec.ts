import { describe, expect, it } from 'vitest';
import { createCacheMock } from '../../factories/cache-mock.js';
import { ClearCacheUseCase } from '../../../src/application/use-cases/clear-cache.use-case.js';

describe('ClearCacheUseCase', () => {
  it('should call cache.clear', async () => {
    const cache = createCacheMock();
    const useCase = new ClearCacheUseCase(cache);

    await useCase.execute();

    expect(cache.clear).toHaveBeenCalledOnce();
  });
});
