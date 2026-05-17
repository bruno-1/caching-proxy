# caching-proxy

A high-performance HTTP caching proxy server built with TypeScript, Fastify, and Redis.

This project is based on the roadmap.sh challenge:

https://roadmap.sh/projects/caching-server

---

# 🚀 Overview

`caching-proxy` is a CLI application that starts an HTTP proxy server capable of forwarding requests to an origin server while caching responses in Redis.

When the same request is made multiple times, the proxy returns the cached response instead of forwarding the request again to the origin server.

The proxy also adds the `X-Cache` header to indicate whether the response came from the cache or the origin server.

Example:

```http
X-Cache: HIT
```

```http
X-Cache: MISS
```

The project was designed using Clean Architecture principles with strong separation between business rules, application use cases, infrastructure, and composition layers.

---

# ✨ Features

## Core Features

- HTTP caching proxy server
- Redis-based cache storage
- Configurable TTL cache expiration
- Cache HIT/MISS response headers
- CLI interface
- Request forwarding to origin servers
- Cache clearing command

---

## Cache Features

- Deterministic cache key generation
- Query parameter normalization
- Array query parameter support
- Tag-based cache invalidation
- Graceful Redis failure fallback
- Automatic Redis reconnect strategy
- Prevents caching `5xx` responses

---

## Architecture & Quality

- Clean Architecture
- SOLID principles
- Fully typed with TypeScript
- Unit tests
- Integration tests
- Dependency inversion
- Value Objects for validation
- Structured logging
- ESLint + Prettier
- Husky Git hooks

---

# 🧰 Tech Stack

| Technology     | Purpose                |
| -------------- | ---------------------- |
| TypeScript     | Main language          |
| Node.js 20+    | Runtime                |
| Fastify        | HTTP server            |
| Redis          | Cache storage          |
| Commander      | CLI parsing            |
| Vitest         | Testing                |
| Testcontainers | Integration testing    |
| Zod            | Environment validation |
| ESLint         | Linting                |
| Prettier       | Code formatting        |
| Husky          | Git hooks              |
| Docker Compose | Local infrastructure   |

---

# 🏛️ Architecture

This project follows Clean Architecture principles.

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

Contains enterprise business rules and validations.

### Value Objects

- `Port`
- `OriginUrl`

### Domain Errors

- `InvalidPortError`
- `InvalidOriginUrlError`

---

## Application Layer

Contains use cases, policies, abstractions, and application business rules.

### Main Use Cases

- `HandleHttpRequestUseCase`
- `StartServerUseCase`
- `ClearCacheUseCase`

### Services & Policies

- cache key builder
- cache policy
- cache configuration

### Ports

- cache abstraction
- HTTP client abstraction
- proxy server abstraction

---

## Infrastructure Layer

Contains framework implementations and external integrations.

### HTTP

- Fastify proxy server
- Fetch HTTP client

### Cache

- Redis cache service
- Redis client factory

---

## Main Layer

Responsible for dependency injection and application bootstrap.

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
REDIS_URL=redis://localhost:6379
CACHE_DEFAULT_TTL=60
```

Or copy the example file:

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

# 🐳 Running Infrastructure

## Using Docker Compose

Start all infrastructure services:

```bash
docker compose up -d
```

Stop containers:

```bash
docker compose down
```

---

## Services

The Docker Compose setup includes:

- Redis
- Wiremock
- Application infrastructure

---

# ▶️ Running the Project

## Development mode

```bash
npm run start:dev
```

---

## Production mode

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

# 🖥️ CLI Usage

## Start Proxy Server

```bash
caching-proxy start --port <number> --origin <url>
```

---

## Parameters

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

This command clears the Redis cache database.

---

# 🌐 How the Proxy Works

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
GET /products?page=1
```

Will be forwarded to:

```http
GET http://dummyjson.com/products?page=1
```

The response is:

1. Returned to the client
2. Cached in Redis
3. Tagged with cache metadata headers

---

# 🧠 Cache Headers

## Cache MISS

Returned when the request is forwarded to the origin server.

```http
X-Cache: MISS
```

---

## Cache HIT

Returned when the response comes directly from Redis.

```http
X-Cache: HIT
```

---

# 🔑 Cache Key Strategy

Cache keys are normalized to guarantee deterministic caching.

The following rules are applied:

- trailing slash normalization
- alphabetical query sorting
- repeated query parameter support
- undefined query parameter removal
- empty string preservation

---

## Example

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

## Array Query Parameters

The proxy supports repeated query parameters:

```text
/products?category=books&category=games
```

---

# ⏱️ Cache Policy

The default cache policy:

- applies configurable TTL
- skips caching server errors (`5xx`)

---

## Cached Responses

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

---

## Example

```ts
await cache.set('product:1', product, {
  tags: ['products'],
});
```

---

## Invalidate Tag

```ts
await cache.invalidateTag('products');
```

This removes:

- all keys associated with the tag
- the Redis tag reference set

---

# 🔴 Redis Features

Implemented Redis capabilities:

- JSON serialization
- TTL expiration
- Redis pipelines (`MULTI`)
- tag invalidation
- reconnect strategy
- graceful cache fallback

---

## Redis Reconnect Strategy

Reconnect delay grows progressively until reaching a maximum delay of `500ms`.

Example:

```text
retry 1  -> 50ms
retry 5  -> 250ms
retry 20 -> 500ms
```

---

# 🌍 HTTP Layer

The HTTP layer is implemented using Fastify.

---

## Current Behavior

- handles `GET` requests
- forwards requests to the origin server
- normalizes query parameters
- supports repeated query params
- preserves response headers
- adds cache headers
- structured logging enabled

---

# 🧪 Testing

The project includes both unit and integration tests.

---

## Unit Tests

Run unit tests:

```bash
npm run test:unit
```

---

## Integration Tests

Run integration tests:

```bash
npm run test:integration
```

Integration tests use:

- Testcontainers
- Redis containers
- Real Redis communication
- End-to-end cache behavior validation

---

## Coverage

Generate test coverage:

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

Husky + lint-staged run automatically before commits.

Configured tasks include:

- ESLint
- Prettier

---

# 📋 Current Status

## Implemented

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
- environment validation
- unit tests
- integration tests
- Docker Compose setup
- structured logging

---

## Possible Future Improvements

- support additional HTTP methods
- cache invalidation by route/pattern
- metrics collection
- distributed tracing
- health checks
- multiple cache strategy implementations
- distributed cache support
- request deduplication
- stale-while-revalidate strategy

---

# 📄 License

ISC
