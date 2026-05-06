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
🚧 HTTP server implementation (pending)  
🚧 Redis integration (pending)

---

## 🎯 Project Goal

Build a CLI tool that starts a caching proxy server which:

- Forwards HTTP requests to an origin server
- Caches responses using Redis
- Returns cached responses when available
- Indicates cache status via HTTP headers
- Allows clearing the cache via CLI

---

## 🧰 Tech Stack

- Node.js (>= 20)
- TypeScript
- Redis (cache layer)
- Commander (CLI parsing)
- Vitest (testing)
- ESLint + Prettier

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

- Clears all cached entries from Redis (planned)

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

### Cache Policy (current implementation)

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
  shared/
  main/
    cli/
```

### Key Concepts

- **Use Cases**
  - `HandleHttpRequest` → core caching logic
  - `StartServerUseCase` → validates and starts server

- **Policies**
  - `DefaultCachePolicy` → defines TTL and skip rules

- **Services**
  - `DefaultCacheKeyBuilder` → builds deterministic cache keys

- **CLI Layer**
  - Argument parsing using Commander
  - Input validation (port, URL)
  - Command handling (`start`, `clear-cache`)
  - Error abstraction via `CliParseError`

- **Ports (Interfaces)**
  - Cache
  - HTTP Client
  - Server

---

## 🔴 Redis (Planned Integration)

Redis will be used as the cache provider.

### Responsibilities

- Store HTTP responses
- Handle TTL expiration
- Support cache invalidation

### Expected behavior

- `SET key value EX ttl`
- JSON serialization of responses
- Optional tagging support (future)

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
- Server startup validation
- CLI parsing (commands, validation, error handling)
- CLI parsers (port and URL validation)
- CLI error handling (anti-corruption layer)

---

## ▶️ Getting Started

### Install dependencies

```bash
npm install
```

### Run in development mode

```bash
npm run start:dev
```

---

## 🧠 Next Steps

- [ ] Implement HTTP server adapter (Express / Fastify / native)
- [ ] Implement Redis cache adapter
- [ ] Wire dependencies in composition root
- [ ] Implement cache clearing command (integration with Redis)
- [ ] Add logging and observability
- [ ] Add request method support beyond GET
- [ ] Add cache invalidation strategies

---

## 📄 License

ISC
