# ReachInbox — Email Scheduler (Frontend + Backend)

This repository contains a full-stack email scheduling proof-of-concept: an Express + TypeScript backend that persists scheduled emails in PostgreSQL and schedules sending with BullMQ (Redis), and a React + TypeScript frontend for scheduling and viewing emails. The implementation follows the requirements laid out in assignment.txt.

Contents

- frontend/ — Vite + React TypeScript app (Google OAuth login, compose UI, scheduled/sent lists)
- backend/ — Express TypeScript API, BullMQ queue and worker, Postgres integration


Tech stack

- Backend: Node, TypeScript, Express, pg (Postgres), BullMQ (Redis), nodemailer (Ethereal)
- Frontend: React, TypeScript, Vite, @react-oauth/google
- Dev services: Redis and PostgreSQL (recommended via Docker)

Quick start (development)

Prerequisites

- Node.js (16+)
- npm
- Docker (recommended to run Postgres and Redis)

Recommended Docker (Postgres + Redis)

Create a docker-compose.yml with Postgres and Redis or run these containers manually. Example docker-compose is suggested but not included; run:

1) Start Postgres and Redis

- Postgres: image postgres:15 (user/password/db must match backend env)
- Redis: image redis:7 (default port 6379)

2) Configure environment variables (see below)

Backend: run

cd backend
npm install
# Ensure Postgres and Redis are reachable per env config
npm run dev

Notes:
- The backend creates database tables on startup (db/migrations.createTables).
- The queue worker is started automatically because server.ts imports config/queue.

Frontend: run

cd frontend
npm install
# Provide VITE_GOOGLE_CLIENT_ID in frontend/.env or environment
npm run dev

The frontend dev server proxies API calls prefixed with /emails to http://localhost:3000 (see frontend/vite.config.ts) so you can use the default backend port.

Environment variables

Backend (backend/src/config/env.ts)

- PORT (default 3000)
- DB_HOST (default localhost)
- DB_PORT (default 5432)
- DB_USER (default reachuser)
- DB_PASSWORD (default reachpass)
- DB_NAME (default reachinbox)

Optional / runtime configuration

- MAX_EMAILS_PER_HOUR — used by the BullMQ worker limiter (default 10 if not set)

The queue connection in backend/src/config/queue.ts currently uses hardcoded Redis host/port (localhost:6379). For production you should read Redis connection details from env.

Frontend

- VITE_GOOGLE_CLIENT_ID — OAuth client ID (stored in frontend/.env in this repo for development)
- VITE_API_BASE_URL — optional base URL for API requests. By default the app uses same-origin which allows Vite to proxy /emails to backend in dev.

API (overview)

- POST /emails/schedule — schedule one email. Payload: sender_email, recipient_email, subject, body, scheduled_at (ISO timestamp)
- GET /emails/scheduled — list scheduled emails (status = "scheduled")
- GET /emails/sent — list sent emails (status = "sent")

How scheduling works (architecture)

1. Request handling
- When a schedule request is received, the server inserts the record into the Postgres emails table.
- Immediately after insert, the server enqueues a BullMQ delayed job (emailQueue.add) with a delay equal to scheduled_at - now.

2. Worker
- A BullMQ Worker (created in backend/src/config/queue.ts) processes the jobs. For each job the worker:
  - Fetches the email record by id from Postgres
  - Uses nodemailer with Ethereal (createTransporter) to send the email
  - Updates the DB record: sets status = 'sent' and sent_at = NOW()

Persistence on restart

- Jobs are persisted in Redis by BullMQ. Because we insert a delayed job after storing the email, restarting the server/worker will not lose scheduled jobs: the worker reconnects to Redis and will pick up pending jobs, and the DB still contains the email record for state reconciliation.
- Database acts as the source-of-truth for email records.

Rate limiting and concurrency

- Concurrency: the worker is configured with concurrency: 1 in the current code (see backend/src/config/queue.ts). Change this value to increase parallelism.
- Hourly rate limiting: implemented using BullMQ's limiter options on the worker (limiter.max = Number(process.env.MAX_EMAILS_PER_HOUR) || 10, duration = 3600000). This enforces a global rate limit for jobs processed by the worker.

Notes on safety and trade-offs

- The current limiter is applied at the worker level and is backed by Redis (BullMQ). This provides safety across multiple worker instances as long as they share the same Redis. The current implementation uses a single limiter key (global). For per-sender limits, additional Redis counters or namespaced queues per-sender would be required.
- The project uses Ethereal (test SMTP) to avoid sending real email in development. Configure a real SMTP provider for production use.
- Redis host/port are currently hardcoded in queue.ts. For production, move these to env and support authentication.
- The backend assumes one recipient per schedule request. The frontend loops and POSTs one request per recipient when uploading a list. This keeps job granularity simple and idempotent.

Features implemented (mapping to assignment)

Backend

- Schedule API that stores emails in Postgres and enqueues BullMQ delayed jobs
- BullMQ worker that sends email via Ethereal and updates DB
- Table creation/migrations on startup
- Rate limiting via BullMQ limiter
- Concurrency option (worker concurrency configuration)

Frontend

- Google OAuth sign-in (real OAuth using @react-oauth/google)
- Dashboard showing Scheduled and Sent emails (with loading and empty states)
- Compose UI: manual recipients, upload list parsing (CSV/TXT), subject/body, send-later datetime
- Frontend posts schedule requests; for uploaded lists it POSTs one request per recipient
- Basic client API wrapper with error handling

Known limitations and assumptions

- Redis connection details are hardcoded in backend/src/config/queue.ts; recommend reading from env and supporting TLS/auth as needed.
- Rate limiting is global across workers. Per-sender rate limiting is not implemented in this version.
- The worker concurrency is low by default (1) to make testing predictable; increase for higher throughput.
- No authentication between frontend and backend in this demo. For production, add user/session auth and tenant isolation.
- No retry/backoff logic for failed sends beyond BullMQ defaults. Consider adding additional job retry strategies and dead-letter handling.

Next steps / Improvements

- Move Redis connection config to env and support Redis auth/TLS
- Implement per-sender hourly limits using Redis counters and job-delay logic to reschedule when window is full
- Add job retry and dead-letter queue handling
- Add server-side validation and authentication for API endpoints
- Add docker-compose.yml in repo to make launching Postgres + Redis reproducible

Where to look in the code

- backend/src/routes/emails.ts — API endpoints
- backend/src/config/queue.ts — BullMQ queue and worker (limiter and concurrency)
- backend/src/config/mailer.ts — Ethereal transporter
- backend/src/db/migrations.ts — table creation
- frontend/src/pages — Login, Dashboard, Compose UI
- frontend/src/api — client and email API wrappers

Contact / Demo

License

This repository is provided for evaluation and educational purposes. No license is specified.
