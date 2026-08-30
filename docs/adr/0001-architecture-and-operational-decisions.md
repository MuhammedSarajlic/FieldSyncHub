# ADR-0001: Architecture and operational decisions

- Status: Accepted
- Date: 2026-08-30

## Context

FieldSyncHub needs a small-business field-service workflow with a browser client, a tenant-aware API, relational reporting and deployable local/staging environments.

## Decisions

1. Keep the frontend and backend in one repository so API contracts, tests and deployment configuration can evolve together.
2. Use React/Vite for the client and ASP.NET Core with EF Core/Pomelo MySQL for the API and relational data model.
3. Build the frontend into static assets and serve it with nginx. Proxy `/api` through the same origin in production to keep browser configuration simple.
4. Apply EF migrations explicitly during deployment rather than granting the runtime process schema-change permissions.
5. Use a hosted background worker for lightweight scheduled operations until operational volume justifies a durable job dashboard.
6. Include correlation IDs and structured server logs, with backend integration tests protecting authentication, tenant isolation and billing totals.
