# caching-proxy

A CLI HTTP caching proxy server built with TypeScript, Fastify, and Redis.

This project is based on the roadmap.sh challenge:

https://roadmap.sh/projects/caching-server

---

# 🚀 Overview

`caching-proxy` is a command-line application capable of:

- starting an HTTP proxy server
- forwarding requests to an origin server
- caching responses in Redis
- returning cached responses for repeated requests
- exposing cache HIT/MISS metadata through HTTP headers
- clearing all cached entries through CLI commands

The application was designed following Clean Architecture principles with a strong separation between:

- domain rules
- application use cases
- infrastructure adapters
- composition/bootstrap layer

---

# ✨ Implemented Features

## Proxy Features

- HTTP proxy server using Fastify
- Request forwarding to origin servers
- Support for GET requests
- Response header preservation
- Query parameter normalization
- Array query parameter support
- Cache HIT/MISS response headers

---

## Cache Features

- Redis-based cache storage
- Configurable TTL expiration
- Deterministic cache key generation
- Graceful Redis fallback behavior
- Redis reconnect strategy
- Tag-based cache invalidation support
- Automatic skip for `5xx` responses
- Cache clear command

---

## CLI Features

- `start` command
- `clear-cache` command
- Port validation
- URL validation
- Safe CLI error handling

---

## Architecture & Quality

- Clean Architecture
- SOLID principles
- Dependency inversion
- Value Objects
- Type-safe codebase
- Unit tests
- ESLint
- Prettier
- Husky pre-commit hooks

---

# 🧰 Tech Stack

| Technology  | Purpose                |
| ----------- | ---------------------- |
| TypeScript  | Main language          |
| Node.js 20+ | Runtime                |
| Fastify     | HTTP server            |
| Redis       | Cache storage          |
| Commander   | CLI parsing            |
| Vitest      | Testing                |
| Zod         | Environment validation |
| ESLint      | Linting                |
| Prettier    | Formatting             |
| Husky       | Git hooks              |

---

# 🏛️ Architecture

```text
src
├── application
│   ├── config
│   ├── dtos
│   ├── policies
│   ├── ports
│   ├── services
│   └── use-cases
│
├── domain
│   ├── errors
│   └── value-objects
│
├── infra
│   ├── cache
│   └── http
│
├── main
│   ├── cli
│   └── factories
│
├── shared
│   └── utils
│
└── config
```

---

# 📂 Layer Responsibilities

## Domain Layer

Contains core business validations and rules.

### Value Objects

- `Port`
- `OriginUrl`

### Errors

- `InvalidPortError`
- `InvalidOriginUrlError`

---

## Application Layer

Contains use cases, abstractions, services, and cache policies.

### Use Cases

- `HandleHttpRequestUseCase`
- `StartServerUseCase`
- `ClearCacheUseCase`

### Services & Policies

- `DefaultCacheKeyBuilder`
- `DefaultCachePolicy`

### Ports

- cache abstraction
- HTTP client abstraction
- proxy server abstraction

---

## Infrastructure Layer

Contains external implementations.

### HTTP

- `FastifyCachingProxyServer`
- `FetchHttpClient`

### Cache

- `RedisCacheService`
- Redis client factory

---

## Main Layer

Responsible for:

- dependency composition
- CLI bootstrap
- application startup

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
REDIS_URL=redis://localhost:6379
CACHE_DEFAULT_TTL=60
```

Or copy the example:

```bash
cp .env.example .env
```

---

## Available Variables

| Variable            | Description          | Default |
| ------------------- | -------------------- | ------- |
| `REDIS_URL`         | Redis connection URL | —       |
| `CACHE_DEFAULT_TTL` | Cache TTL in seconds | `60`    |

---

# 📦 Installation

## Clone repository

```bash
git clone <repository-url>
cd caching-proxy
```

---

## Install dependencies

```bash
npm install
```

---

# ▶️ Running the Project

## Development

```bash
npm run start:dev
```

---

## Production

Build the project:

```bash
npm run build
```

Run the proxy:

```bash
npm start -- start \
  --port 3000 \
  --origin http://dummyjson.com
```

---

# 🖥️ CLI Usage

## Start Proxy Server

```bash
caching-proxy start --port <number> --origin <url>
```

### Parameters

| Parameter  | Description                          |
| ---------- | ------------------------------------ |
| `--port`   | Port where the proxy server will run |
| `--origin` | Origin server URL                    |

---

## Example

```bash
caching-proxy start \
  --port 3000 \
  --origin http://dummyjson.com
```

---

## Clear Cache

```bash
caching-proxy clear-cache
```

This command clears the Redis database used by the application.

---

# 🌐 Proxy Flow

If the proxy server is running on:

```text
http://localhost:3000
```

And the configured origin server is:

```text
http://dummyjson.com
```

A request such as:

```http
GET /products?page=1
```

Will be forwarded to:

```http
GET http://dummyjson.com/products?page=1
```

The response will:

1. be returned to the client
2. be cached in Redis
3. receive cache metadata headers

---

# 🧠 Cache Headers

## Cache MISS

Returned when the request reaches the origin server.

```http
X-Cache: MISS
```

---

## Cache HIT

Returned when the response comes from Redis.

```http
X-Cache: HIT
```

---

# 🔑 Cache Key Strategy

The application uses normalized cache keys to guarantee deterministic caching.

Normalization rules:

- trailing slash normalization
- alphabetical query sorting
- repeated query parameter support
- undefined query removal
- empty string preservation

---

## Example

Both requests below generate the same cache key:

```text
/products?b=2&a=1
/products?a=1&b=2
```

Generated key:

```text
/products?a=1&b=2
```

---

## Array Query Parameters

Supported format:

```text
/products?category=books&category=games
```

---

# ⏱️ Cache Policy

Default behavior:

- applies configurable TTL
- skips caching responses with status `>= 500`

---

## Cached Responses

Examples:

- `200`
- `201`
- `204`
- `400`
- `404`

---

## Ignored Responses

```text
statusCode >= 500
```

---

# 🏷️ Tag-Based Cache Invalidation

The Redis cache implementation supports tag associations.

## Example

```ts
await cache.set('product:1', product, {
  tags: ['products'],
});
```

Invalidate a tag:

```ts
await cache.invalidateTag('products');
```

This removes:

- all cache keys associated with the tag
- the Redis tag reference set

---

# 🔴 Redis Features

Implemented Redis capabilities:

- JSON serialization
- TTL expiration
- Redis pipelines (`MULTI`)
- reconnect strategy
- graceful fallback behavior
- tag invalidation support

---

## Reconnect Strategy

Reconnect delay grows progressively until reaching `500ms`.

Example:

```text
retry 1  -> 50ms
retry 5  -> 250ms
retry 20 -> 500ms
```

---

# 🌍 HTTP Layer

The HTTP layer is implemented using Fastify.

Current behavior:

- handles GET requests
- forwards requests to the origin server
- normalizes query parameters
- supports repeated query params
- preserves response headers
- injects cache metadata headers
- enables structured logging

---

# 🧪 Testing

## Run Unit Tests

```bash
npm run test:unit
```

---

## Generate Coverage

```bash
npm run test:coverage
```

---

# ✅ Tested Components

## Application Layer

- cache policy
- cache key builder
- cache HIT/MISS flow
- cache skip rules
- request handling
- start server use case
- clear cache use case

---

## Infrastructure Layer

- Redis cache service
- Redis client factory
- Fastify server adapter
- Fetch HTTP client

---

## CLI

- command parsing
- URL validation
- port validation
- error handling

---

# 🛠️ Development Tooling

## Lint

```bash
npm run lint
```

---

## Format

```bash
npm run format
```

---

## Git Hooks

Husky runs `lint-staged` before commits.

---

# 📋 Final Project Status

This project is complete and no further features are planned.

Implemented scope:

- CLI command parsing
- application bootstrap
- Fastify proxy server
- Redis cache layer
- cache key normalization
- cache policy system
- HTTP request forwarding
- cache HIT/MISS handling
- cache invalidation support
- environment validation
- unit testing structure
- Redis infrastructure integration
- structured logging

---

# 📄 License

ISC
