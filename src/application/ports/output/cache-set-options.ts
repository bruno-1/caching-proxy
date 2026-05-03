export type CacheSetOptions<T> = {
  ttlSeconds?: number;
  tags?: string[];
  skipIf?: (value: T) => boolean;
};
