# caching-proxy

A CLI tool that starts an HTTP caching proxy server using **Redis**.

This project is based on the specification from:
https://roadmap.sh/projects/caching-server

---

## 🚧 Status

In progress

✅ Core application layer implemented  
✅ Cache policy and key builder  
✅ Request handling with HIT/MISS logic  
✅ CLI parsing implemented (Commander)  
✅ Redis cache service implemented  
✅ Redis tag invalidation support  
🚧 HTTP server implementation (pending)

---

## 🎯 Project Goal

Build a CLI tool that starts a caching proxy server which:

- Forwards HTTP requests to an origin server
- Caches responses using Redis
- Returns cached responses when available
- Indicates cache status via HTTP headers
- Allows clearing the cache via CLI
- Supports cache invalidation using tags

---

## 🧰 Tech Stack

- Node.js (>= 20)
- TypeScript
- Redis
- Commander
- Zod
- Vitest
- ESLint + Prettier

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
REDIS_URL=redis://localhost:6379
```

You can also copy the provided example:

```bash
cp .env.example .env
```

---

## ⚙️ CLI Commands

### Start server

```bash
caching-proxy start --port <number> --origin <url>
```

#### Parameters

- `--port` → Port where the proxy server will run (1–65535)
- `--origin` → Base URL of the target server (must be a valid HTTP/HTTPS URL)

#### Example

```bash
caching-proxy start --port 3000 --origin http://dummyjson.com
```

---

### Clear cache

```bash
caching-proxy clear-cache
```

- Clears all cached entries from Redis

---

## 🌐 How It Works

With the server running:

### Request

```http
GET http://localhost:3000/products
```

### Behavior

1. The request is normalized and transformed into a cache key

2. The cache (Redis) is checked:
   - If found → return cached response (**HIT**)
   - If not → forward request to origin (**MISS**)

3. The response is optionally cached based on policy

4. A header is added to indicate cache status

---

## 🧠 Cache Behavior

### Headers

```http
X-Cache: HIT
```

- Returned when response comes from Redis

```http
X-Cache: MISS
```

- Returned when response comes from origin server

---

### Cache Policy

- Default TTL is configurable
- Responses are **NOT cached** when:

```
statusCode >= 500
```

- All other responses are cached

---

### Cache Key Strategy

The cache key is generated using:

- Normalized path (no trailing slash)
- Sorted query parameters
- Support for array query params
- Ignores undefined values

#### Example

```bash
/products?a=1&b=2
```

---

## 🏷️ Cache Tags

The Redis cache service supports cache tagging.

This allows grouping cache keys and invalidating them together.

### Example

```ts
await cache.set('product:1', product, {
  tags: ['products'],
});
```

### Invalidate a tag

```ts
await cache.invalidateTag('products');
```

This will remove:

- All cache keys associated with the tag
- The Redis set that stores the tag references

---

## 🧱 Architecture

The project follows a **Clean Architecture / Hexagonal Architecture** style:

```
src/
  application/
    use-cases/
    policies/
    services/
    ports/

  domain/
    value-objects/
    errors/

  infra/
    cache/

  main/
    cli/

  config/
```

### Key Concepts

- **Use Cases**
  - `HandleHttpRequest`
  - `StartServerUseCase`

- **Policies**
  - `DefaultCachePolicy`

- **Services**
  - `DefaultCacheKeyBuilder`
  - `RedisCacheService`

- **CLI Layer**
  - Argument parsing using Commander
  - Input validation
  - Command handling
  - Error abstraction using `CliParseError`

- **Infrastructure**
  - Redis client factory
  - Redis cache implementation
  - Redis reconnect strategy
  - Cache tag invalidation

- **Ports (Interfaces)**
  - Cache
  - HTTP Client
  - Server

---

## 🔴 Redis Integration

Redis is used as the cache provider.

### Responsibilities

- Store HTTP responses
- Handle TTL expiration
- Support cache invalidation by tags
- Provide fast cache lookup

### Current Features

- JSON serialization
- TTL support
- Tag-based invalidation
- Redis pipelines (`MULTI`)
- Reconnect strategy
- Graceful cache failures

### Example Redis Commands

```text
SET key value EX ttl
SADD tag:products product:1
SMEMBERS tag:products
DEL product:1
```

---

## 🧪 Testing

Run tests:

```bash
npm test
```

Watch mode:

```bash
npm run test:watch
```

Coverage:

```bash
npm run test:coverage
```

### Covered Areas

- Cache policy
- Cache key builder
- Request handling (HIT / MISS / skip logic)
- CLI parsing
- CLI validation
- CLI error handling
- Redis cache service
- Redis client factory
- Redis tag invalidation

---

## ▶️ Getting Started

### Install dependencies

```bash
npm install
```

### Start Redis locally

```bash
docker run -p 6379:6379 redis
```

### Run in development mode

```bash
npm run start:dev
```

---

## 🧠 Next Steps

- [ ] Implement HTTP server adapter (Express / Fastify / native)
- [ ] Wire dependencies in composition root
- [ ] Implement full cache clearing command
- [ ] Add logging and observability
- [ ] Add request method support beyond GET
- [ ] Add cache invalidation strategies by route/pattern
- [ ] Add metrics and monitoring

---

## 📄 License

ISC
