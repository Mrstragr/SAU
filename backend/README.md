# Rectangle Backend (v2)

This is the production-ready backend scaffold (TypeScript + Express + Prisma + Postgres).

## Local setup

1) Start Postgres + Redis (repo root):

```bash
docker compose up -d
```

2) Install deps (this folder):

```bash
npm install
```

3) Create env:

```bash
cp .env.example .env
```

4) Create DB schema:

```bash
npm run prisma:migrate -- --name init
```

5) Start API:

```bash
npm run dev
```

Health check: `http://localhost:5002/health`

