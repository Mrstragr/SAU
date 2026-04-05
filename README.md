# SAU Travel - Render Deploy Guide

## Backend (Web Service)
1. Connect Render PostgreSQL DB → copy DATABASE_URL
2. Env vars:
```
DATABASE_URL=postgres://...
JWT_ACCESS_SECRET=<securely-generated-secret-min-20-chars> # Generate with: openssl rand -base64 32
JWT_REFRESH_SECRET=<securely-generated-secret-min-20-chars> # Generate with: openssl rand -base64 32
CORS_ORIGIN=https://sau-travel-frontend.onrender.com,https://localhost:3000
PORT=10000
```
3. Build: tsc
4. Start: node dist/index.js

## Frontend (Static Site)
1. Env: VITE_API_URL=https://your-backend.onrender.com/api
2. Build: npm run build
3. Static files: dist/

## Local Dev
```
npm run dev  # full stack
```

**Test Render:** Login → Student dashboard gate filter, driver duty toggle works.

Updated TODO.md Phase 1 ✅
