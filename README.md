# caching-proxy

HTTP caching proxy server built with Node.js and TypeScript.

This project follows the specification from:
https://roadmap.sh/projects/caching-server

## 🚧 Status

Initial setup – project structure and base configuration.

## 📌 Goal

Build a caching proxy server that:

- Forwards HTTP requests to external APIs
- Caches responses
- Returns cached data when available
- Supports cache invalidation and expiration (TTL)

## 🏗 Architecture (planned)

- `main` → composition root (application entry point)
- `modules` → domain/features

## 📁 Project Structure

```text
src/
  main/        # application entry point
  modules/     # feature modules (e.g., cache)
```

## ▶️ Running the project

```bash
npm install
npm run start:dev
```

## 📡 Future Endpoint Example

```http
GET /proxy?url=https://api.example.com/data
```

## 🧠 Next Steps

- Add HTTP server
- Implement proxy endpoint
- Integrate in-memory cache
- Add cache expiration (TTL)
- Improve error handling

## 📄 License

ISC
