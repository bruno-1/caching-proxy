import { DefaultCacheKeyBuilder } from '../../application/services/default-cache-key-builder.js';

export function makeCacheKeyBuilder() {
  return new DefaultCacheKeyBuilder();
}
