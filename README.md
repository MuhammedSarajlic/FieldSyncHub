# FieldSyncHub

FieldSyncHub is a field-service management application for small service businesses. It brings customers, properties, jobs, dispatch scheduling, quotes, invoices, payments, employees, leads and reporting into one workspace.

## Stack

- `backend/`: ASP.NET Core 9 Web API, EF Core and Pomelo MySQL.
- `frontend/`: React, TypeScript and Vite. Production builds are served by nginx, with `/api` proxied to the backend.
- `docker-compose.yml`: local stack with MySQL, the API and the production-shaped frontend image.
- `scripts/seed.mjs`: API-driven demo data generator for two realistic workspaces.

## Quick start

Prerequisites: Docker Desktop with the Linux engine enabled, Node.js 20+, and optionally the .NET 9 SDK for local backend work.

```powershell
Copy-Item .env.example .env
# Set JWT_TOKEN in .env to a random value of at least 64 bytes.
docker compose up --build
```

Open `http://localhost:5173`. The API is available at `http://localhost:5244`; liveness is `http://localhost:5244/health` and database readiness is `http://localhost:5244/ready`.

For a staging-shaped local stack, copy `.env.staging.example` to `.env.staging`, fill in the secrets, then run:

```powershell
docker compose --env-file .env.staging -f docker-compose.yml -f docker-compose.staging.yml up --build
```

## Local development

```powershell
dotnet restore FieldSyncHub.sln
dotnet build backend/backend.csproj --warnaserror
dotnet test backend.Tests/backend.Tests.csproj
cd frontend
npm ci
npm run dev
```

When running the Vite server directly, set `frontend/.env` to point `VITE_BASE_URL` at `http://localhost:5244/api`. The compose frontend uses the same-origin `/api` proxy.

Database schema changes are a deployment concern. Apply them explicitly with `backend/scripts/migrate.ps1` on Windows or `backend/scripts/migrate.sh` on Unix-like systems after setting `ConnectionStrings__WebApiDatabase`.

## Demo data

With the backend running, one command creates two demo workspaces containing customers, properties, scheduled and completed jobs, quotes, invoices and leads:

```powershell
npm run seed:demo
```

The accounts are `marcus.reed@demo.fieldsync.local` and `elena.vasquez@demo.fieldsync.local`, both using `DemoPassword123!`. The seed uses the real API and is intended for a fresh staging/demo database. To reset a local Docker database first, review `scripts/reset-db.sql` and run it explicitly:

```powershell
docker compose exec -T mysql mysql -uroot -p fieldsync < scripts/reset-db.sql
```

Use `SEED_BASE_URL` when the API is hosted elsewhere, for example `SEED_BASE_URL=https://staging.example.com/api npm run seed:demo`.

## Configuration

Copy `.env.example` for local development. Important variables are `DB_PASSWORD`, `JWT_TOKEN`, `VITE_BASE_URL`, `VITE_BASE_URL_ORIGIN`, `COOKIE_SECURE`, `RESEND_API_TOKEN`, `RESEND_SENDER_EMAIL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_STORAGE_BUCKET` and `GOOGLE_CLIENT_ID`. Never commit `.env`, credentials or staging secrets.

## Tests and CI

```powershell
dotnet test backend.Tests/backend.Tests.csproj
cd frontend
npm test
npm run test:e2e
npm run lint
npm run build
```

The Playwright critical-flow suite runs against a live stack when `E2E_LIVE=true`; see `frontend/e2e/README.md`. Pull requests run backend build/tests, frontend typecheck/lint/build and both Docker image builds through `.github/workflows/ci.yml`.

## Architecture decisions

The short decision record trail is in [`docs/adr`](docs/adr). It records the monorepo boundaries, explicit migrations, same-origin production serving, background work and demo-data approach.
