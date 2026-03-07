# ✂️ Snip — Distributed URL Shortener

A production-ready, FAANG-level URL shortener built with Node.js, React, PostgreSQL, and Redis. Features Base62 encoding, Redis caching, JWT auth, rate limiting, and a full analytics dashboard.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT                                  │
│                     React (Vite + Tailwind)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       NGINX (Reverse Proxy)                     │
│  • TLS termination  • Static asset serving  • SPA fallback     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
          ┌────────┴────────┐
          │                 │
          ▼                 ▼
   /api/* routes     /:shortCode routes
          │                 │
          ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXPRESS API SERVER (Node.js)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Rate Limiter│  │  JWT Auth    │  │  Request Logger      │  │
│  │  (per IP/    │  │  Middleware  │  │  (Morgan + Winston)  │  │
│  │   user ID)   │  │              │  │                      │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│                                                                 │
│  Routes → Controllers → Services → Models                      │
└────────────────┬──────────────────────────────────────────────-─┘
                 │
        ┌────────┴──────────┐
        │                   │
        ▼                   ▼
┌──────────────┐    ┌──────────────────────────────────────┐
│    REDIS     │    │           POSTGRESQL                 │
│              │    │                                      │
│ • URL cache  │    │  ┌──────────┐  ┌────────────────┐   │
│   (TTL-based)│    │  │  users   │  │     urls       │   │
│ • Click count│    │  ├──────────┤  ├────────────────┤   │
│   buffers    │    │  │ id (UUID)│  │ id (BIGINT PK) │   │
│ • Rate limit │    │  │ email    │  │ short_code     │   │
│   windows    │    │  │ username │  │ original_url   │   │
└──────────────┘    │  │ password │  │ user_id (FK)   │   │
  Cache-First       │  │ role     │  │ click_count    │   │
  Strategy:         │  └──────────┘  │ expires_at     │   │
  Redis → PG        │                │ is_active      │   │
                    │  ┌─────────────┴──────────────┐ │   │
                    │  │         analytics          │ │   │
                    │  ├────────────────────────────┤ │   │
                    │  │ url_id, ip_hash, device    │ │   │
                    │  │ browser, os, referer       │ │   │
                    │  │ clicked_at (TIME-SERIES)   │ │   │
                    │  └────────────────────────────┘ │   │
                    └──────────────────────────────────┘
```

## ⚡ Redirect Flow (Hot Path)

```
User visits snip.io/abc1234
         │
         ▼
   Nginx receives GET /abc1234
         │
         ▼
   Express Rate Limiter (1000 req/min)
         │
         ▼
   Redis GET "url:abc1234"
         │
    ┌────┴────┐
    │ HIT     │ MISS
    ▼         ▼
  Cached    PostgreSQL SELECT
  JSON      WHERE short_code = 'abc1234'
    │         │
    └────┬────┘
         │
         ▼
   Check expiry (isExpired())
         │
         ▼
   HTTP 302 → original_url
   (< 5ms with cache hit)
         │
         ▼ (async, non-blocking)
   Analytics.create({ ... })
   Url.increment('click_count')
```

---

## 📁 Project Structure

```
url-shortener/
├── backend/
│   ├── config/
│   │   ├── database.js       # Sequelize + PostgreSQL connection pool
│   │   └── redis.js          # ioredis client with retry strategy
│   ├── controllers/
│   │   ├── urlController.js  # HTTP handlers for URL operations
│   │   ├── analyticsController.js
│   │   └── authController.js
│   ├── middleware/
│   │   ├── auth.js           # JWT verification (require/optional/admin)
│   │   ├── rateLimiter.js    # Per-route rate limiters
│   │   ├── errorHandler.js   # Global error handler + 404
│   │   └── requestLogger.js  # Morgan → Winston
│   ├── models/
│   │   ├── User.js           # UUID PK, bcrypt hooks
│   │   ├── Url.js            # BIGINT PK, 8 DB indexes
│   │   ├── Analytics.js      # Click events, time-series indexed
│   │   └── index.js          # Associations
│   ├── routes/
│   │   ├── urlRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── authRoutes.js
│   ├── services/
│   │   ├── urlService.js     # Shortening, cache-first resolution
│   │   ├── analyticsService.js # Click recording + aggregation
│   │   └── authService.js    # JWT, bcrypt, register/login
│   ├── utils/
│   │   ├── base62.js         # Encode/decode/generateRandom
│   │   ├── urlValidator.js   # SSRF-safe URL + code validation
│   │   └── logger.js         # Winston structured logger
│   ├── tests/
│   │   ├── utils.test.js     # Unit tests for utils
│   │   └── setup.js
│   ├── db/init.sql
│   ├── server.js             # Express app entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── Navbar.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # JWT state management
│   │   ├── pages/
│   │   │   ├── Home.jsx         # URL shortener form
│   │   │   ├── Dashboard.jsx    # Paginated URL management
│   │   │   ├── Analytics.jsx    # Charts + breakdown
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── utils/
│   │   │   └── api.js           # Axios + auth interceptor
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Redis 7+ (or use Docker)

### Option A: Docker (Recommended)

```bash
# 1. Clone and enter project
git clone https://github.com/yourname/url-shortener
cd url-shortener

# 2. Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your values

# 3. Launch everything
docker-compose up --build

# App is now running at http://localhost
# API at http://localhost:5000
# PG at localhost:5432, Redis at localhost:6379
```

### Option B: Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env        # Edit with your DB/Redis credentials
npm install
npm run dev                 # Starts on :5000 with nodemon

# Terminal 2 — Frontend
cd frontend
npm install
npm start                   # Starts on :3000 with HMR
```

---

## 🔌 API Reference

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Create account | ❌ |
| POST | `/api/auth/login` | Login, get JWT | ❌ |
| GET | `/api/auth/me` | Get current user | ✅ |

### URLs

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/shorten` | Create short URL | Optional |
| GET | `/:shortCode` | Redirect to original | ❌ |
| GET | `/api/urls` | List my URLs (paginated) | ✅ |
| GET | `/api/url/:shortCode` | Get URL details | ❌ |
| DELETE | `/api/url/:id` | Delete URL | ✅ |

### Analytics

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/analytics/:shortCode` | Get analytics | Optional |

### Example Requests

```bash
# Shorten a URL
curl -X POST http://localhost:5000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com/very/long/url"}'

# Shorten with custom code (requires auth)
curl -X POST http://localhost:5000/api/shorten \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://github.com/...", "customCode": "my-repo", "expiresAt": "2025-12-31"}'

# Get analytics
curl http://localhost:5000/api/analytics/abc1234?days=7 \
  -H "Authorization: Bearer <token>"
```

---

## 🌐 Deploying to Render

### Step 1 — Push to GitHub
```bash
git init && git add . && git commit -m "initial commit"
git remote add origin https://github.com/yourname/url-shortener
git push -u origin main
```

### Step 2 — Create PostgreSQL Database on Render
1. Render Dashboard → **New** → **PostgreSQL**
2. Name: `urlshortener-db`, Region: closest to you
3. Copy the **Internal Database URL**

### Step 3 — Create Redis on Render
1. **New** → **Redis**
2. Name: `urlshortener-redis`
3. Copy the **Internal Redis URL**

### Step 4 — Deploy Backend as Web Service
1. **New** → **Web Service** → Connect your GitHub repo
2. **Root Directory**: `backend`
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. Add Environment Variables:
   ```
   NODE_ENV=production
   DATABASE_URL=<from Step 2>
   REDIS_URL=<from Step 3>
   JWT_SECRET=<generate with: openssl rand -hex 32>
   BASE_URL=https://your-backend.onrender.com
   FRONTEND_URL=https://your-frontend.onrender.com
   ```

### Step 5 — Deploy Frontend as Static Site
1. **New** → **Static Site** → Connect repo
2. **Root Directory**: `frontend`
3. **Build Command**: `npm install && npm run build`
4. **Publish Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   VITE_BASE_URL=https://your-backend.onrender.com
   ```
6. Add **Rewrite Rule**: `/*` → `/index.html` (for SPA routing)

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | — |
| `REDIS_URL` | Redis connection string | — |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | — |
| `JWT_EXPIRES_IN` | Token expiry | `7d` |
| `BASE_URL` | Public backend URL | `http://localhost:5000` |
| `FRONTEND_URL` | CORS allowed origin | `http://localhost:3000` |
| `SHORT_CODE_LENGTH` | Length of generated codes | `7` |
| `REDIS_CACHE_TTL` | Cache TTL in seconds | `3600` |
| `RATE_LIMIT_MAX_REQUESTS` | General API limit | `100` |
| `SHORTEN_RATE_LIMIT_MAX` | Shortening limit | `20` |

---

## 🧪 Running Tests

```bash
cd backend
npm test              # Run all tests
npm run test:watch    # Watch mode
```

Coverage report is generated in `backend/coverage/`.

---

## 🔒 Security Features

- **Helmet.js** — HTTP security headers (XSS, clickjacking protection)
- **CORS** — Allowlist-based origin control
- **JWT** — Stateless auth with configurable expiry
- **bcrypt** — Password hashing with cost factor 12
- **Rate Limiting** — Per-route, per-user limits
- **SSRF Prevention** — Blocks shortening of localhost/private IPs
- **Input Validation** — URL length, protocol, character limits
- **SQL Injection** — Fully parameterized queries via Sequelize ORM
- **Non-root Docker** — Containers run as unprivileged users

---

## 📈 Performance Design

| Optimization | Implementation |
|-------------|----------------|
| Redis cache-first | Redirects served from memory, ~1ms latency |
| DB connection pooling | 5-20 connections via Sequelize pool |
| 8 database indexes | Covering all query patterns |
| Async analytics | Click recording never blocks redirect |
| Gzip compression | All API responses compressed |
| Immutable asset caching | 1-year cache headers for static files |
| Base62 encoding | 7 chars = 3.5 trillion unique codes |

---

## 📄 License

MIT
