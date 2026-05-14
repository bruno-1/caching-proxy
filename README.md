# caching-proxy

A CLI tool that starts an HTTP caching proxy server using Redis.

This project is based on the roadmap.sh challenge:
[Caching Server Project](https://roadmap.sh/projects/caching-server)

---

## 📌 Overview

`caching-proxy` is an HTTP proxy server that forwards requests to an origin server and caches responses using Redis.

When a request is repeated, the cached response is returned instead of forwarding the request again to the origin server.

The proxy also adds a response header indicating whether the response came from the cache or directly from the origin server.

---

## 🚀 Features

- HTTP caching proxy server
- Redis-based cache storage
- Cache HIT/MISS response headers
- Cache key normalization
- Query string normalization and sorting
- TTL-based cache expiration
- Tag-based cache invalidation
- CLI interface using Commander
- Clean Architecture / Hexagonal Architecture
- Fully typed with TypeScript
- Unit tests with Vitest
- Fastify HTTP server
- Redis reconnect strategy
- Graceful cache fallback behavior

---

## 🧰 Tech Stack

- Node.js >= 20
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
│   └── cli/
│
├── shared/
│   └── utils/
│
└── config/
```

---

## 🏛️ Architecture

The project follows Clean Architecture principles.

### Layers

#### Domain

Contains business rules and validations:

- `Port`
- `OriginUrl`
- Domain errors

#### Application

Contains use cases and abstractions:

- `HandleHttpRequestUseCase`
- `StartServerUseCase`
- `ClearCacheUseCase`
- Cache policies
- Cache key generation

#### Infrastructure

Contains external integrations:

- Redis cache service
- Redis client factory
- Fastify server adapter
- Fetch HTTP client

#### Main

CLI entrypoint and command parsing.

---

## ⚙️ Environment Variables

Create a `.env` file:

```env
REDIS_URL=redis://localhost:6379
```

Or copy the example file:

```bash
cp .env.example .env
```

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

Start Redis locally using Docker:

```bash
docker run -p 6379:6379 redis
```

---

## ▶️ Running the Project

### Development mode

```bash
npm run start:dev
```

### Production build

```bash
npm run build
npm start
```

---

## 🖥️ CLI Usage

The application exposes two CLI commands:

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

If the proxy server is running on:

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

The response will then be:

1. Returned to the client
2. Cached in Redis
3. Marked with an `X-Cache` header

---

## 🧠 Cache Headers

### Cache MISS

Returned when the request is forwarded to the origin server.

```http
X-Cache: MISS
```

---

### Cache HIT

Returned when the response comes directly from Redis.

```http
X-Cache: HIT
```

---

## 🔑 Cache Key Strategy

Cache keys are normalized using:

- Request path
- Sorted query parameters
- Array query parameter support
- Removal of trailing slashes
- Ignoring undefined query params

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

- Applies configurable TTL
- Prevents caching of server errors

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
- etc.

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

- All keys associated with the tag
- The Redis tag reference set

---

## 🔴 Redis Features

Implemented Redis features:

- JSON serialization
- TTL expiration
- Redis pipelines (`MULTI`)
- Tag invalidation
- Graceful cache failure handling
- Reconnect strategy with capped delay

### Reconnect Strategy

The Redis reconnect delay grows progressively until reaching a maximum of `500ms`.

---

## 🌍 HTTP Layer

The HTTP server is implemented using Fastify.

### Current behavior

- Handles `GET` requests
- Normalizes query parameters
- Supports repeated query params
- Forwards requests to origin server
- Returns origin response headers
- Adds cache headers

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

- Cache policy
- Cache key builder
- Request handling
- Cache HIT/MISS flow
- Cache skip rules
- Start server use case
- Clear cache use case

### Infrastructure Layer

- Redis cache service
- Redis client factory
- Fastify server adapter
- Fetch HTTP client

### CLI

- Command parsing
- URL validation
- Port validation
- Error handling

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

Husky + lint-staged are configured to run:

- ESLint
- Prettier

Before commits.

---

## 📋 Current Status

### Implemented

- CLI command parsing
- Fastify proxy server
- Redis cache layer
- Cache policy system
- Cache key normalization
- HTTP request forwarding
- Cache HIT/MISS handling
- Tag invalidation
- Redis reconnect strategy
- Unit tests

### TODO

- Dependency injection / composition root wiring
- Full application bootstrap
- Additional HTTP methods support
- Cache invalidation by route/pattern
- Observability and metrics
- Structured logging
- Integration tests
- Docker setup

---

## 📄 License

ISC
