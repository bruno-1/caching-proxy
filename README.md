# caching-proxy

A CLI tool that starts an HTTP caching proxy server.

This project is based on the specification from:
https://roadmap.sh/projects/caching-server

---

## 🚧 Status

Initial setup – project structure and base tooling configured.

---

## 🎯 Project Goal

Build a CLI tool that starts a caching proxy server which:

- Forwards HTTP requests to an origin server
- Caches responses
- Returns cached responses when available
- Indicates cache status via HTTP headers
- Allows clearing the cache via CLI

---

## 🧰 Tech Stack

- Node.js (>= 20)
- TypeScript
- ESLint
- Prettier

---

## ⚙️ Usage (planned)

Start the caching proxy server:

```bash
caching-proxy --port <number> --origin <url>
```

### Parameters

- `--port` → Port where the proxy server will run
- `--origin` → Base URL of the target server

### Example

```bash
caching-proxy --port 3000 --origin http://dummyjson.com
```

---

## 🌐 How It Works

With the server running:

### Request

```http
GET http://localhost:3000/products
```

### Behavior

- The request is forwarded to:

  ```
  http://dummyjson.com/products
  ```

- The response is returned to the client

- The response is cached

---

## 🧠 Cache Behavior

The server adds a header to indicate cache status:

```http
X-Cache: MISS
```

- Returned when the response comes from the origin server

```http
X-Cache: HIT
```

- Returned when the response is served from cache

---

## 🧹 Clear Cache (planned)

```bash
caching-proxy --clear-cache
```

- Clears all cached responses

---

## 📁 Project Structure

```text
src/
  main/        # application entry point (CLI / composition root)
  modules/     # feature modules (e.g., cache, proxy)
```

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

- [ ] Implement CLI argument parsing
- [ ] Start HTTP server from CLI
- [ ] Implement request forwarding to origin
- [ ] Add in-memory cache
- [ ] Add `X-Cache` headers (HIT / MISS)
- [ ] Implement cache clearing command
- [ ] Add cache expiration (TTL)

---

## 📄 License

ISC
