# caching-proxy

A CLI tool that starts an HTTP caching proxy server using Redis.

This project is based on the roadmap.sh challenge:

https://roadmap.sh/projects/caching-server

---

## 🚀 Overview

`caching-proxy` is an HTTP proxy server that forwards requests to an origin server and caches responses using Redis.

When the same request is made multiple times, the proxy returns the cached response instead of forwarding the request again to the origin server.

The proxy also adds an `X-Cache` header indicating whether the response came from:

- the cache (`HIT`)
- the origin server (`MISS`)

---

## ✨ Features

- HTTP caching proxy server
- Redis-based cache storage
- Cache HIT/MISS headers
- TTL-based cache expiration
- Query string normalization
- Cache key normalization
- Array query parameter support
- Graceful Redis failure fallback
- Tag-based cache invalidation
- Clean Architecture
- Fully typed with TypeScript
- Fastify HTTP server
- Redis reconnect strategy
- CLI interface with Commander
- Extensive unit test coverage

---

## 🧰 Tech Stack

- Node.js 20+
- TypeScript
- Fastify
- Redis
- Commander
- Vitest
- Zod
- ESLint
- Prettier
- Husky
- lint-staged

---

## 📂 Project Structure

```text
src/
├── application/
│   ├── config/
│   ├── dtos/
│   ├── policies/
│   ├── ports/
│   ├── services/
│   └── use-cases/
│
├── domain/
│   ├── errors/
│   └── value-objects/
│
├── infra/
│   ├── cache/
│   └── http/
│
├── main/
│   ├── cli/
│   └── factories/
│
├── shared/
│   └── utils/
│
└── config/
```

---

## 🏛️ Architecture

This project follows Clean Architecture principles.

### Domain

Business rules and validations:

- `Port`
- `OriginUrl`
- domain errors

### Application

Application use cases and abstractions:

- `HandleHttpRequestUseCase`
- `StartServerUseCase`
- `ClearCacheUseCase`
- cache policies
- cache key generation

### Infrastructure

External integrations and adapters:

- Redis cache service
- Redis client factory
- Fastify server adapter
- Fetch HTTP client

### Main

Application bootstrap and dependency composition.

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
REDIS_URL=redis://localhost:6379
CACHE_DEFAULT_TTL=60
```

Or copy the example file:

```bash
cp .env.example .env
```

### Variables

| Variable            | Description                  | Default |
| ------------------- | ---------------------------- | ------- |
| `REDIS_URL`         | Redis connection URL         | —       |
| `CACHE_DEFAULT_TTL` | Default cache TTL in seconds | `60`    |

---

## 📦 Installation

### Clone repository

```bash
git clone <repository-url>
cd caching-proxy
```

### Install dependencies

```bash
npm install
```

---

## 🐳 Running Redis

Run Redis locally with Docker:

```bash
docker run -p 6379:6379 redis
```

---

## ▶️ Running the Project

### Development mode

```bash
npm run start:dev
```

### Production mode

Build the project:

```bash
npm run build
```

Start the application:

```bash
npm start -- start \
  --port 3000 \
  --origin http://dummyjson.com
```

---

## 🖥️ CLI Usage

---

### Start Proxy Server

```bash
caching-proxy start --port <number> --origin <url>
```

### Parameters

| Parameter  | Description                          |
| ---------- | ------------------------------------ |
| `--port`   | Port where the proxy server will run |
| `--origin` | Origin server URL                    |

### Example

```bash
caching-proxy start \
  --port 3000 \
  --origin http://dummyjson.com
```

---

### Clear Cache

```bash
caching-proxy clear-cache
```

This command clears all Redis cache entries.

---

## 🌐 How the Proxy Works

If the proxy server runs on:

```text
http://localhost:3000
```

And the origin server is:

```text
http://dummyjson.com
```

A request like:

```http
GET /products
```

Will be forwarded to:

```http
http://dummyjson.com/products
```

The response is then:

1. returned to the client
2. cached in Redis
3. marked with the `X-Cache` header

---

## 🧠 Cache Headers

### Cache MISS

Returned when the request is forwarded to the origin server.

```http
X-Cache: MISS
```

### Cache HIT

Returned when the response comes directly from Redis.

```http
X-Cache: HIT
```

---

## 🔑 Cache Key Strategy

Cache keys are normalized using:

- request path
- sorted query parameters
- repeated query parameter support
- trailing slash normalization
- undefined query param removal

### Example

Both requests below generate the same cache key:

```text
/products?b=2&a=1
/products?a=1&b=2
```

Generated cache key:

```text
/products?a=1&b=2
```

---

## ⏱️ Cache Policy

The default cache policy:

- applies configurable TTL
- prevents caching of server errors

### Responses NOT cached

```text
statusCode >= 500
```

### Responses cached

- 200
- 201
- 204
- 400
- 404

---

## 🏷️ Cache Tags

The Redis cache service supports tag-based invalidation.

### Example

```ts
await cache.set('product:1', product, {
  tags: ['products'],
});
```

### Invalidate tag

```ts
await cache.invalidateTag('products');
```

This removes:

- all keys associated with the tag
- the Redis tag reference set

---

## 🔴 Redis Features

Implemented Redis features:

- JSON serialization
- TTL expiration
- Redis pipelines (`MULTI`)
- tag invalidation
- graceful cache failure handling
- reconnect strategy with capped delay

### Reconnect Strategy

The reconnect delay grows progressively until reaching a maximum of `500ms`.

---

## 🌍 HTTP Layer

The HTTP layer is implemented using Fastify.

### Current behavior

- handles `GET` requests
- normalizes query parameters
- supports repeated query params
- forwards requests to origin server
- returns origin response headers
- adds cache headers

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

---

## ✅ Tested Components

### Application Layer

- cache policy
- cache key builder
- request handling
- cache HIT/MISS flow
- cache skip rules
- start server use case
- clear cache use case

### Infrastructure Layer

- Redis cache service
- Redis client factory
- Fastify server adapter
- Fetch HTTP client

### CLI

- command parsing
- URL validation
- port validation
- error handling

---

## 🛠️ Development Tooling

### Lint

```bash
npm run lint
```

### Format

```bash
npm run format
```

### Git Hooks

Husky + lint-staged run automatically before commits.

Configured tasks:

- ESLint
- Prettier

---

## 📋 Current Status

### Implemented

- CLI command parsing
- application bootstrap
- dependency composition
- Fastify proxy server
- Redis cache layer
- cache policy system
- cache key normalization
- HTTP request forwarding
- cache HIT/MISS handling
- tag invalidation
- Redis reconnect strategy
- unit tests

### Possible Future Improvements

- support for additional HTTP methods
- cache invalidation by route/pattern
- observability and metrics
- structured logging
- integration tests
- Docker Compose setup
- configurable cache strategies

---

## 📄 License

ISC
