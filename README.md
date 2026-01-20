# ReachInbox — Email Scheduler

### What this repository contains

A full-stack proof-of-concept for reliable, persistent email scheduling:

- Backend: Express + TypeScript + BullMQ (Redis) + PostgreSQL
- Frontend: React + TypeScript (Vite) with Google OAuth
- Scheduling delivered using BullMQ delayed jobs and a worker that sends via Ethereal (test SMTP)

---

## Quick overview

This project demonstrates a persistent scheduler that meets these goals:

- Schedule emails to be delivered at a future time
- Durable jobs using Redis (BullMQ) so scheduled tasks survive restarts
- Rate limiting and concurrency controls enforced via Redis-backed mechanisms
- A dashboard to compose, schedule, and review scheduled / sent emails

---

## Table of contents

- Quick start
- Configuration
- Architecture & flow
- API reference (examples)
- Frontend usage
- Implemented features
- Assumptions, limitations & next steps
- Project layout

---

## Quick start

Prerequisites

- Node.js 16 or newer
- npm
- Docker (recommended for Postgres and Redis)

If you already created Docker containers for Postgres and Redis (see suggested docker-compose), you can start them quickly:

```bash
docker start reachinbox-postgres
docker start reachinbox-redis
```

Start backend (development)

```bash
cd backend
npm install
# ensure Postgres and Redis are running
npm run dev
```

Start frontend (development)

```bash
cd frontend
npm install
# set VITE_GOOGLE_CLIENT_ID in frontend/.env
npm run dev
```

> Tip: the frontend Vite dev server proxies API requests to the backend in development (see vite.config.ts).

---

## Configuration

Backend example (.env)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=reachuser
DB_PASSWORD=reachpass
DB_NAME=reachinbox
MAX_EMAILS_PER_HOUR=200
```

Frontend example (frontend/.env)

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_API_BASE_URL=http://localhost:3000
```

Notes

- Redis connection values are currently read from the queue configuration file (backend/src/config/queue.ts). For production, provide Redis host, port and auth via environment variables.
- Ethereal credentials are created at runtime (mailer.ts). For production, replace with a real SMTP provider.

---

## Architecture & flow

1. Client creates a schedule request -> backend API
2. Backend inserts an email record into Postgres (source of truth)
3. Backend enqueues a BullMQ delayed job with delay = scheduled_at - now
4. Worker processes job when ready, sends via nodemailer and updates DB record status

Persistence guarantees

- Jobs live in Redis and are durable. The DB record prevents duplication and provides a single source of truth.
- On restart the worker reconnects to Redis and resumes jobs without recreating state.

Rate limiting & concurrency

- Concurrency is configurable in the worker configuration (backend/src/config/queue.ts).
- Hourly limits are enforced using a Redis-backed limiter (BullMQ limiter options). The value is configurable via MAX_EMAILS_PER_HOUR.
- When a limit is reached, jobs are delayed/rescheduled rather than dropped. See the code comments in queue.ts for trade-offs and behavior.

---

## API reference (examples)

Schedule an email (single recipient)

```bash
curl -X POST http://localhost:3000/emails/schedule \
  -H "Content-Type: application/json" \
  -d '{"sender_email":"from@example.com","recipient_email":"to@example.com","subject":"Hello","body":"Hi","scheduled_at":"2026-01-21T12:00:00.000Z"}'
```

List scheduled emails

```bash
curl http://localhost:3000/emails/scheduled
```

List sent emails

```bash
curl http://localhost:3000/emails/sent
```

Refer to backend/src/routes/emails.ts for full request/response shapes.

---

## Frontend usage

- Login using Google (real OAuth). After login you are redirected to the dashboard.
- Compose modal/page supports:
  - Manual recipient input
  - File upload (CSV/TXT) for batched recipients
  - Subject, body, start time, per-recipient delay and hourly-limit fields
- Uploads are sent as individual schedule requests per recipient to retain idempotency and observability.

---

## Implemented features (high level)

Backend

- Express + TypeScript API
- Postgres persistence and DB table creation on startup
- BullMQ delayed jobs and a worker that sends emails via Ethereal
- Configurable concurrency and Redis-backed rate limiting

Frontend

- React + TypeScript (Vite)
- Google OAuth sign-in
- Compose UI with file upload parsing
- Dashboard: Scheduled & Sent lists with loading / empty states

---

## Assumptions, limitations & next steps

Key assumptions

- Single-tenant demo: no server-side tenant auth or session enforcement between frontend and backend.
- Jobs are per-recipient (one DB record + job per recipient).

Limitations

- Redis host/auth is not read from env in the current queue config; it defaults to localhost:6379.
- Rate limiting is global by default. Per-sender limits are not implemented but can be added with per-sender Redis counters.
- Job retry / dead-letter behavior is minimal; add robust retry/backoff for production.

Next steps

- Move Redis config to environment variables and support authentication/TLS
- Implement per-sender hourly limits and rescheduling logic to preserve ordering
- Add server-side authentication and tenant isolation
- Add a docker-compose.yml to simplify local setup

---

## Project layout (high level)

| Path | Purpose |
|------|---------|
| backend/ | Express API, BullMQ worker, DB migrations |
| frontend/ | React app, auth, pages |


Key files

- backend/src/routes/emails.ts
- backend/src/config/queue.ts
- backend/src/config/mailer.ts
- backend/src/db/migrations.ts
- frontend/src/pages/*

---

## License

This repository is provided for evaluation and educational purposes. No license is specified.

---

For changes or questions, open an issue or contact the repository owner.
