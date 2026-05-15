import { DefaultCachePolicy } from '../../application/policies/default-cache-policy.js';
import { env } from '../../config/env.js';

export function makeCachePolicy() {
  return new DefaultCachePolicy({
    defaultTTLSeconds: env.CACHE_DEFAULT_TTL,
  });
}
