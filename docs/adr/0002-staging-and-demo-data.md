# ADR-0002: Staging and demo data

- Status: Accepted
- Date: 2026-08-30

## Decision

Staging uses the production-shaped Docker images with a compose override that selects the `Staging` ASP.NET environment and same-origin frontend API. Demo data is generated through the public API by `scripts/seed.mjs`, so validation, authorization and business rules are exercised exactly as they are for normal users. The seed targets a fresh demo database and uses clearly synthetic accounts and customer data.
